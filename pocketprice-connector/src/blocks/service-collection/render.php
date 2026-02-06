<?php
/**
 * Server-side render for Service Collection block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo pocketprice()->blocks->render_service_collection( $attributes );
