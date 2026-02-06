<?php
/**
 * Plugin Name: Pocket Price Connector
 * Plugin URI: https://pocketprice.ru
 * Description: Connector plugin for Pocket Price API — displays services and prices via Gutenberg blocks.
 * Version: 1.0.0
 * Author: Pocket Price
 * Author URI: https://pocketprice.ru
 * Text Domain: pocketprice-connector
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'POCKETPRICE_VERSION', '1.0.0' );
define( 'POCKETPRICE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'POCKETPRICE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'POCKETPRICE_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-api.php';
require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-cache.php';
require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-cron.php';
require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-admin.php';
require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-blocks.php';
require_once POCKETPRICE_PLUGIN_DIR . 'includes/class-pocketprice-rest.php';

/**
 * Main plugin class.
 */
final class PocketPrice_Connector {

	private static ?self $instance = null;

	public PocketPrice_API   $api;
	public PocketPrice_Cache $cache;
	public PocketPrice_Cron  $cron;
	public PocketPrice_Admin $admin;
	public PocketPrice_Blocks $blocks;
	public PocketPrice_REST  $rest;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->api    = new PocketPrice_API();
		$this->cache  = new PocketPrice_Cache( $this->api );
		$this->cron   = new PocketPrice_Cron( $this->cache );
		$this->admin  = new PocketPrice_Admin( $this->api, $this->cache );
		$this->blocks = new PocketPrice_Blocks( $this->cache );
		$this->rest   = new PocketPrice_REST( $this->cache );

		register_activation_hook( __FILE__, [ $this, 'activate' ] );
		register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );
	}

	public function activate(): void {
		$this->cron->schedule();

		if ( ! get_option( 'pocketprice_settings' ) ) {
			update_option( 'pocketprice_settings', [
				'api_url'        => 'https://api.pocketprice.ru',
				'api_key'        => '',
				'cache_ttl'      => 3600,
				'cron_interval'  => 'hourly',
			] );
		}
	}

	public function deactivate(): void {
		$this->cron->unschedule();
	}
}

function pocketprice(): PocketPrice_Connector {
	return PocketPrice_Connector::instance();
}

pocketprice();
