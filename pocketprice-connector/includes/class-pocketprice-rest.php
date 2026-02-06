<?php
/**
 * WP REST API endpoints for Gutenberg editor.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_REST {

	private const NAMESPACE = 'pocketprice/v1';

	private PocketPrice_Cache $cache;

	public function __construct( PocketPrice_Cache $cache ) {
		$this->cache = $cache;

		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/services', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_services' ],
			'permission_callback' => [ $this, 'editor_permission' ],
		] );

		register_rest_route( self::NAMESPACE, '/services/(?P<id>[a-zA-Z0-9_-]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_service' ],
			'permission_callback' => [ $this, 'editor_permission' ],
			'args'                => [
				'id' => [
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/categories', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_categories' ],
			'permission_callback' => [ $this, 'editor_permission' ],
		] );

		register_rest_route( self::NAMESPACE, '/sync', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'sync' ],
			'permission_callback' => [ $this, 'admin_permission' ],
		] );
	}

	public function editor_permission(): bool {
		return current_user_can( 'edit_posts' );
	}

	public function admin_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_services(): WP_REST_Response {
		$services = $this->cache->get_services();
		return new WP_REST_Response( $services, 200 );
	}

	public function get_service( WP_REST_Request $request ): WP_REST_Response {
		$id      = $request->get_param( 'id' );
		$service = $this->cache->get_service( $id );

		if ( ! $service ) {
			return new WP_REST_Response(
				[ 'message' => __( 'Service not found.', 'pocketprice-connector' ) ],
				404
			);
		}

		return new WP_REST_Response( $service, 200 );
	}

	public function get_categories(): WP_REST_Response {
		$categories = $this->cache->get_categories();
		return new WP_REST_Response( $categories, 200 );
	}

	public function sync(): WP_REST_Response {
		$this->cache->refresh();

		return new WP_REST_Response( [
			'success'          => true,
			'services_count'   => count( $this->cache->get_services() ),
			'categories_count' => count( $this->cache->get_categories() ),
		], 200 );
	}
}
