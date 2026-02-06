<?php
/**
 * Caching layer using WP Transients.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_Cache {

	private const TRANSIENT_SERVICES   = 'pocketprice_services';
	private const TRANSIENT_CATEGORIES = 'pocketprice_categories';

	private PocketPrice_API $api;

	public function __construct( PocketPrice_API $api ) {
		$this->api = $api;
	}

	private function get_ttl(): int {
		$settings = get_option( 'pocketprice_settings', [] );
		return isset( $settings['cache_ttl'] ) ? absint( $settings['cache_ttl'] ) : 3600;
	}

	/**
	 * Get services (cached).
	 */
	public function get_services( bool $force_refresh = false ): array {
		if ( ! $force_refresh ) {
			$cached = get_transient( self::TRANSIENT_SERVICES );
			if ( false !== $cached ) {
				return $cached;
			}
		}

		$data = $this->api->get_services();

		if ( is_wp_error( $data ) ) {
			// Return stale cache if available.
			$stale = get_option( 'pocketprice_services_fallback', [] );
			return $stale;
		}

		$services = isset( $data['services'] ) ? $data['services'] : $data;

		if ( ! is_array( $services ) ) {
			$services = [];
		}

		set_transient( self::TRANSIENT_SERVICES, $services, $this->get_ttl() );
		update_option( 'pocketprice_services_fallback', $services, false );

		return $services;
	}

	/**
	 * Get categories (cached).
	 */
	public function get_categories( bool $force_refresh = false ): array {
		if ( ! $force_refresh ) {
			$cached = get_transient( self::TRANSIENT_CATEGORIES );
			if ( false !== $cached ) {
				return $cached;
			}
		}

		$data = $this->api->get_categories();

		if ( is_wp_error( $data ) ) {
			$stale = get_option( 'pocketprice_categories_fallback', [] );
			return $stale;
		}

		$categories = isset( $data['categories'] ) ? $data['categories'] : $data;

		if ( ! is_array( $categories ) ) {
			$categories = [];
		}

		set_transient( self::TRANSIENT_CATEGORIES, $categories, $this->get_ttl() );
		update_option( 'pocketprice_categories_fallback', $categories, false );

		return $categories;
	}

	/**
	 * Get a single service by ID (from cached list).
	 */
	public function get_service( string $id ): ?array {
		$services = $this->get_services();

		foreach ( $services as $service ) {
			if ( isset( $service['id'] ) && $service['id'] === $id ) {
				return $service;
			}
		}

		return null;
	}

	/**
	 * Get services filtered by category ID.
	 */
	public function get_services_by_category( string $category_id ): array {
		$services = $this->get_services();

		return array_values(
			array_filter( $services, function ( $service ) use ( $category_id ) {
				return isset( $service['category_id'] ) && $service['category_id'] === $category_id;
			} )
		);
	}

	/**
	 * Flush all caches.
	 */
	public function flush(): void {
		delete_transient( self::TRANSIENT_SERVICES );
		delete_transient( self::TRANSIENT_CATEGORIES );
	}

	/**
	 * Refresh all caches from API.
	 */
	public function refresh(): void {
		$this->flush();
		$this->get_services( true );
		$this->get_categories( true );
	}
}
