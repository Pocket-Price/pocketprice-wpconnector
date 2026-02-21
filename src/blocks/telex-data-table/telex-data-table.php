<?php
/**
 * Plugin Name:       Interactive Data Table Block
 * Description:       A powerful interactive data table block with search, filtering, sorting, and pagination capabilities for displaying data from REST APIs or JSON sources.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            WordPress Telex
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       telex-data-table
 *
 * @package TelexDataTable
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function telex_data_table_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'telex_data_table_block_init' );
