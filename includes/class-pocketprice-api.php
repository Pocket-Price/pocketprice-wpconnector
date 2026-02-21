<?php
/**
 * Pocket Price API client.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_API {

	private function get_settings(): array {
		return wp_parse_args(
			get_option( 'pocketprice_settings', [] ),
			[
				'api_url'   => 'https://api.pocketprice.work',
				'api_key'   => '',
				'cache_ttl' => 3600,
			]
		);
	}

	private function get_base_url(): string {
		return untrailingslashit( $this->get_settings()['api_url'] );
	}

	private function get_api_key(): string {
		$settings = $this->get_settings();
		$key      = $settings['api_key'];

		if ( empty( $key ) ) {
			return '';
		}

		if ( function_exists( 'wp_unslash' ) ) {
			$key = wp_unslash( $key );
		}

		return $key;
	}

	/**
	 * Make an authenticated request to Pocket Price API.
	 *
	 * @param string $endpoint API endpoint path (e.g. '/api/services').
	 * @param array  $args     Optional query parameters.
	 * @return array|WP_Error  Decoded JSON response or WP_Error.
	 */
	public function request( string $endpoint, array $args = [] ) {
		$url = $this->get_base_url() . $endpoint;

		if ( ! empty( $args ) ) {
			$url = add_query_arg( $args, $url );
		}

		$api_key = $this->get_api_key();
		if ( empty( $api_key ) ) {
			return new WP_Error(
				'pocketprice_no_api_key',
				__( 'API key is not configured.', 'pocketprice-connector' )
			);
		}

		$response = wp_remote_get( $url, [
			'timeout' => 15,
			'headers' => [
				'X-API-Key'    => $api_key,
				'Accept'       => 'application/json',
				'Content-Type' => 'application/json',
			],
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error(
				'pocketprice_api_error',
				sprintf(
					/* translators: %d: HTTP status code */
					__( 'API returned status %d', 'pocketprice-connector' ),
					$code
				),
				[ 'status' => $code, 'body' => $body ]
			);
		}

		$data = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error(
				'pocketprice_json_error',
				__( 'Failed to parse API response.', 'pocketprice-connector' )
			);
		}

		return $data;
	}

	/**
	 * Get all records from a PocketBase collection, handling pagination.
	 *
	 * @param string $collection Collection name.
	 * @param array  $args       Optional query parameters (filter, sort, etc).
	 * @return array|WP_Error    All items or WP_Error.
	 */
	public function get_all_records( string $collection, array $args = [] ) {
		$args = array_merge( [ 'perPage' => 500 ], $args );
		$page = 1;
		$all_items = [];

		do {
			$args['page'] = $page;
			$data = $this->request( '/api/collections/' . $collection . '/records', $args );

			if ( is_wp_error( $data ) ) {
				return $data;
			}

			$items = $data['items'] ?? [];
			$all_items = array_merge( $all_items, $items );
			$total_pages = $data['totalPages'] ?? 1;
			$page++;
		} while ( $page <= $total_pages );

		return $all_items;
	}

	/**
	 * Get all services.
	 */
	public function get_services( array $args = [] ) {
		return $this->get_all_records( 'services', $args );
	}

	/**
	 * Get a single service by ID.
	 */
	public function get_service( string $id ) {
		return $this->request( '/api/collections/services/records/' . sanitize_text_field( $id ) );
	}

	/**
	 * Get all categories.
	 */
	public function get_categories( array $args = [] ) {
		return $this->get_all_records( 'categories', $args );
	}

	/**
	 * Get all subcategories.
	 */
	public function get_subcategories( array $args = [] ) {
		return $this->get_all_records( 'subcategories', $args );
	}

	/**
	 * Health check.
	 */
	public function health_check() {
		return $this->request( '/api/health' );
	}

	/**
	 * Check if API is configured.
	 */
	public function is_configured(): bool {
		$settings = $this->get_settings();
		return ! empty( $settings['api_url'] ) && ! empty( $settings['api_key'] );
	}
}
