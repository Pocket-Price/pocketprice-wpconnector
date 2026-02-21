<?php
/**
 * Pocket Price Connector — uninstall cleanup.
 *
 * Fired when the plugin is deleted via WP admin.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove options.
delete_option( 'pocketprice_settings' );
delete_option( 'pocketprice_services_fallback' );
delete_option( 'pocketprice_categories_fallback' );
delete_option( 'pocketprice_subcategories_fallback' );
delete_option( 'pocketprice_meta' );

// Remove transients.
delete_transient( 'pocketprice_services' );
delete_transient( 'pocketprice_categories' );
delete_transient( 'pocketprice_subcategories' );

// Remove cron.
$timestamp = wp_next_scheduled( 'pocketprice_sync' );
if ( $timestamp ) {
	wp_unschedule_event( $timestamp, 'pocketprice_sync' );
}
