<?php
/**
 * Admin settings page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_Admin {

	private PocketPrice_API   $api;
	private PocketPrice_Cache $cache;

	public function __construct( PocketPrice_API $api, PocketPrice_Cache $cache ) {
		$this->api   = $api;
		$this->cache = $cache;

		add_action( 'admin_menu', [ $this, 'add_menu' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'wp_ajax_pocketprice_sync', [ $this, 'ajax_sync' ] );
		add_action( 'wp_ajax_pocketprice_health', [ $this, 'ajax_health' ] );
	}

	public function add_menu(): void {
		add_options_page(
			__( 'Pocket Price', 'pocketprice-connector' ),
			__( 'Pocket Price', 'pocketprice-connector' ),
			'manage_options',
			'pocketprice-settings',
			[ $this, 'render_page' ]
		);
	}

	public function register_settings(): void {
		register_setting( 'pocketprice_settings_group', 'pocketprice_settings', [
			'type'              => 'array',
			'sanitize_callback' => [ $this, 'sanitize_settings' ],
		] );

		add_settings_section(
			'pocketprice_api_section',
			__( 'API Settings', 'pocketprice-connector' ),
			null,
			'pocketprice-settings'
		);

		add_settings_field(
			'api_url',
			__( 'API URL', 'pocketprice-connector' ),
			[ $this, 'field_api_url' ],
			'pocketprice-settings',
			'pocketprice_api_section'
		);

		add_settings_field(
			'api_key',
			__( 'API Key', 'pocketprice-connector' ),
			[ $this, 'field_api_key' ],
			'pocketprice-settings',
			'pocketprice_api_section'
		);

		add_settings_section(
			'pocketprice_cache_section',
			__( 'Cache Settings', 'pocketprice-connector' ),
			null,
			'pocketprice-settings'
		);

		add_settings_field(
			'cache_ttl',
			__( 'Cache TTL (seconds)', 'pocketprice-connector' ),
			[ $this, 'field_cache_ttl' ],
			'pocketprice-settings',
			'pocketprice_cache_section'
		);

		add_settings_field(
			'cron_interval',
			__( 'Sync Interval', 'pocketprice-connector' ),
			[ $this, 'field_cron_interval' ],
			'pocketprice-settings',
			'pocketprice_cache_section'
		);
	}

	public function sanitize_settings( $input ): array {
		$sanitized = [];

		$sanitized['api_url']       = esc_url_raw( $input['api_url'] ?? '' );
		$sanitized['api_key']       = sanitize_text_field( $input['api_key'] ?? '' );
		$sanitized['cache_ttl']     = absint( $input['cache_ttl'] ?? 3600 );
		$sanitized['cron_interval'] = sanitize_text_field( $input['cron_interval'] ?? 'hourly' );

		// Reschedule cron if interval changed.
		$old = get_option( 'pocketprice_settings', [] );
		if ( ( $old['cron_interval'] ?? '' ) !== $sanitized['cron_interval'] ) {
			$cron = pocketprice()->cron;
			$cron->reschedule( $sanitized['cron_interval'] );
		}

		return $sanitized;
	}

	public function field_api_url(): void {
		$settings = get_option( 'pocketprice_settings', [] );
		$value    = $settings['api_url'] ?? 'https://api.pocketprice.ru';
		printf(
			'<input type="url" name="pocketprice_settings[api_url]" value="%s" class="regular-text" placeholder="https://api.pocketprice.ru" />',
			esc_attr( $value )
		);
	}

	public function field_api_key(): void {
		$settings = get_option( 'pocketprice_settings', [] );
		$value    = $settings['api_key'] ?? '';
		printf(
			'<input type="password" name="pocketprice_settings[api_key]" value="%s" class="regular-text" autocomplete="off" />',
			esc_attr( $value )
		);
	}

	public function field_cache_ttl(): void {
		$settings = get_option( 'pocketprice_settings', [] );
		$value    = $settings['cache_ttl'] ?? 3600;
		printf(
			'<input type="number" name="pocketprice_settings[cache_ttl]" value="%d" min="60" step="60" class="small-text" />',
			absint( $value )
		);
		echo ' <span class="description">' . esc_html__( 'Default: 3600 (1 hour)', 'pocketprice-connector' ) . '</span>';
	}

	public function field_cron_interval(): void {
		$settings = get_option( 'pocketprice_settings', [] );
		$current  = $settings['cron_interval'] ?? 'hourly';

		$intervals = [
			'hourly'     => __( 'Every hour', 'pocketprice-connector' ),
			'twicedaily' => __( 'Twice daily', 'pocketprice-connector' ),
			'daily'      => __( 'Daily', 'pocketprice-connector' ),
		];

		echo '<select name="pocketprice_settings[cron_interval]">';
		foreach ( $intervals as $value => $label ) {
			printf(
				'<option value="%s" %s>%s</option>',
				esc_attr( $value ),
				selected( $current, $value, false ),
				esc_html( $label )
			);
		}
		echo '</select>';
	}

	public function enqueue_assets( string $hook ): void {
		if ( 'settings_page_pocketprice-settings' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'pocketprice-admin',
			POCKETPRICE_PLUGIN_URL . 'assets/admin.css',
			[],
			POCKETPRICE_VERSION
		);

		wp_enqueue_script(
			'pocketprice-admin',
			POCKETPRICE_PLUGIN_URL . 'assets/admin.js',
			[ 'jquery' ],
			POCKETPRICE_VERSION,
			true
		);

		wp_localize_script( 'pocketprice-admin', 'pocketpriceAdmin', [
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'pocketprice_admin' ),
			'i18n'    => [
				'syncing'  => __( 'Syncing...', 'pocketprice-connector' ),
				'synced'   => __( 'Data synced successfully!', 'pocketprice-connector' ),
				'error'    => __( 'Sync failed. Check API settings.', 'pocketprice-connector' ),
				'checking' => __( 'Checking...', 'pocketprice-connector' ),
				'healthy'  => __( 'API is healthy!', 'pocketprice-connector' ),
				'unhealthy' => __( 'API health check failed.', 'pocketprice-connector' ),
			],
		] );
	}

	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Pocket Price Settings', 'pocketprice-connector' ); ?></h1>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'pocketprice_settings_group' );
				do_settings_sections( 'pocketprice-settings' );
				submit_button();
				?>
			</form>

			<hr />

			<h2><?php esc_html_e( 'Actions', 'pocketprice-connector' ); ?></h2>
			<p>
				<button type="button" class="button" id="pocketprice-sync">
					<?php esc_html_e( 'Sync Data Now', 'pocketprice-connector' ); ?>
				</button>
				<button type="button" class="button" id="pocketprice-health">
					<?php esc_html_e( 'Check API Health', 'pocketprice-connector' ); ?>
				</button>
				<span id="pocketprice-status"></span>
			</p>

			<?php $this->render_data_preview(); ?>
		</div>
		<?php
	}

	private function render_data_preview(): void {
		$services   = $this->cache->get_services();
		$categories = $this->cache->get_categories();

		if ( empty( $services ) && empty( $categories ) ) {
			return;
		}
		?>
		<hr />
		<h2><?php esc_html_e( 'Cached Data Preview', 'pocketprice-connector' ); ?></h2>

		<?php if ( ! empty( $categories ) ) : ?>
			<h3><?php printf( esc_html__( 'Categories (%d)', 'pocketprice-connector' ), count( $categories ) ); ?></h3>
			<table class="widefat striped">
				<thead>
					<tr>
						<th>ID</th>
						<th><?php esc_html_e( 'Name', 'pocketprice-connector' ); ?></th>
						<th><?php esc_html_e( 'Slug', 'pocketprice-connector' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $categories as $cat ) : ?>
						<tr>
							<td><?php echo esc_html( $cat['id'] ?? '' ); ?></td>
							<td><?php echo esc_html( $cat['name'] ?? '' ); ?></td>
							<td><?php echo esc_html( $cat['slug'] ?? '' ); ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<?php if ( ! empty( $services ) ) : ?>
			<h3><?php printf( esc_html__( 'Services (%d)', 'pocketprice-connector' ), count( $services ) ); ?></h3>
			<table class="widefat striped">
				<thead>
					<tr>
						<th>ID</th>
						<th><?php esc_html_e( 'Name', 'pocketprice-connector' ); ?></th>
						<th><?php esc_html_e( 'Price', 'pocketprice-connector' ); ?></th>
						<th><?php esc_html_e( 'Category', 'pocketprice-connector' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( array_slice( $services, 0, 20 ) as $svc ) : ?>
						<tr>
							<td><?php echo esc_html( $svc['id'] ?? '' ); ?></td>
							<td><?php echo esc_html( $svc['name'] ?? '' ); ?></td>
							<td><?php echo esc_html( $svc['price'] ?? '' ); ?></td>
							<td><?php echo esc_html( $svc['category_id'] ?? '' ); ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif;
	}

	public function ajax_sync(): void {
		check_ajax_referer( 'pocketprice_admin', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Unauthorized' );
		}

		$this->cache->refresh();
		$services   = $this->cache->get_services();
		$categories = $this->cache->get_categories();

		wp_send_json_success( [
			'services_count'   => count( $services ),
			'categories_count' => count( $categories ),
		] );
	}

	public function ajax_health(): void {
		check_ajax_referer( 'pocketprice_admin', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Unauthorized' );
		}

		$result = $this->api->health_check();

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( $result );
	}
}
