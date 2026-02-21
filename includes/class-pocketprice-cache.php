<?php
/**
 * Caching layer using WP Transients.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_Cache {

	private const TRANSIENT_SERVICES      = 'pocketprice_services';
	private const TRANSIENT_CATEGORIES    = 'pocketprice_categories';
	private const TRANSIENT_SUBCATEGORIES = 'pocketprice_subcategories';

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

		// Try API if configured.
		if ( $this->api->is_configured() ) {
			$items = $this->api->get_services();

			if ( ! is_wp_error( $items ) && is_array( $items ) ) {
				$services = array_map( [ $this, 'normalize_service' ], $items );
				set_transient( self::TRANSIENT_SERVICES, $services, $this->get_ttl() );
				update_option( 'pocketprice_services_fallback', $services, false );
				return $services;
			}
		}

		// Return fallback data.
		return get_option( 'pocketprice_services_fallback', [] );
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

		if ( $this->api->is_configured() ) {
			$items = $this->api->get_categories();

			if ( ! is_wp_error( $items ) && is_array( $items ) ) {
				$categories = array_map( [ $this, 'normalize_category' ], $items );
				set_transient( self::TRANSIENT_CATEGORIES, $categories, $this->get_ttl() );
				update_option( 'pocketprice_categories_fallback', $categories, false );
				return $categories;
			}
		}

		return get_option( 'pocketprice_categories_fallback', [] );
	}

	/**
	 * Get subcategories (cached).
	 */
	public function get_subcategories( bool $force_refresh = false ): array {
		if ( ! $force_refresh ) {
			$cached = get_transient( self::TRANSIENT_SUBCATEGORIES );
			if ( false !== $cached ) {
				return $cached;
			}
		}

		if ( $this->api->is_configured() ) {
			$items = $this->api->get_subcategories();

			if ( ! is_wp_error( $items ) && is_array( $items ) ) {
				$subcategories = array_map( [ $this, 'normalize_subcategory' ], $items );
				set_transient( self::TRANSIENT_SUBCATEGORIES, $subcategories, $this->get_ttl() );
				update_option( 'pocketprice_subcategories_fallback', $subcategories, false );
				return $subcategories;
			}
		}

		return get_option( 'pocketprice_subcategories_fallback', [] );
	}

	/**
	 * Get meta information.
	 */
	public function get_meta(): array {
		return get_option( 'pocketprice_meta', [] );
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
	 * Get services filtered by subcategory ID.
	 */
	public function get_services_by_subcategory( string $subcategory_id ): array {
		$services = $this->get_services();

		return array_values(
			array_filter( $services, function ( $service ) use ( $subcategory_id ) {
				return isset( $service['subcategory'] ) && $service['subcategory'] === $subcategory_id;
			} )
		);
	}

	/**
	 * Normalize a PocketBase service record to the plugin's expected format.
	 */
	private function normalize_service( array $record ): array {
		return array_merge( $record, [
			'name'         => $record['title'] ?? '',
			'description'  => $record['short_description'] ?? '',
			'category_id'  => $record['category'] ?? '',
			'duration'     => $record['duration_min'] ?? null,
			'is_active'    => ( $record['status'] ?? '' ) === 'published',
		] );
	}

	/**
	 * Normalize a PocketBase category record.
	 */
	private function normalize_category( array $record ): array {
		return array_merge( $record, [
			'name' => $record['name_ru'] ?? $record['name_en'] ?? '',
		] );
	}

	/**
	 * Normalize a PocketBase subcategory record.
	 */
	private function normalize_subcategory( array $record ): array {
		return array_merge( $record, [
			'name'        => $record['name_ru'] ?? $record['name_en'] ?? '',
			'category_id' => $record['category'] ?? '',
		] );
	}

	/**
	 * Flush all caches.
	 */
	public function flush(): void {
		delete_transient( self::TRANSIENT_SERVICES );
		delete_transient( self::TRANSIENT_CATEGORIES );
		delete_transient( self::TRANSIENT_SUBCATEGORIES );
	}

	/**
	 * Refresh all caches from API.
	 */
	public function refresh(): void {
		$this->flush();
		$this->get_services( true );
		$this->get_categories( true );
		$this->get_subcategories( true );
	}
}
