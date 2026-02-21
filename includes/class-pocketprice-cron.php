<?php
/**
 * WP Cron for periodic data sync.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_Cron {

	private const HOOK = 'pocketprice_sync';

	private PocketPrice_Cache $cache;

	public function __construct( PocketPrice_Cache $cache ) {
		$this->cache = $cache;

		add_action( self::HOOK, [ $this, 'sync' ] );
	}

	/**
	 * Schedule the cron event.
	 */
	public function schedule(): void {
		if ( ! wp_next_scheduled( self::HOOK ) ) {
			$settings = get_option( 'pocketprice_settings', [] );
			$interval = $settings['cron_interval'] ?? 'hourly';
			wp_schedule_event( time(), $interval, self::HOOK );
		}
	}

	/**
	 * Remove the cron event.
	 */
	public function unschedule(): void {
		$timestamp = wp_next_scheduled( self::HOOK );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::HOOK );
		}
	}

	/**
	 * Reschedule with new interval.
	 */
	public function reschedule( string $interval ): void {
		$this->unschedule();
		wp_schedule_event( time(), $interval, self::HOOK );
	}

	/**
	 * The sync callback.
	 */
	public function sync(): void {
		$this->cache->refresh();
	}
}
