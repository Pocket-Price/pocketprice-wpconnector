<?php
/**
 * Gutenberg blocks registration.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PocketPrice_Blocks {

	private PocketPrice_Cache $cache;

	public function __construct( PocketPrice_Cache $cache ) {
		$this->cache = $cache;

		add_action( 'init', [ $this, 'register_blocks' ] );
	}

	public function register_blocks(): void {
		$blocks = [
			'service-single',
			'service-category',
			'service-collection',
		];

		foreach ( $blocks as $block ) {
			$block_dir = POCKETPRICE_PLUGIN_DIR . 'build/blocks/' . $block;

			if ( ! file_exists( $block_dir . '/block.json' ) ) {
				continue;
			}

			register_block_type( $block_dir, [
				'render_callback' => [ $this, 'render_' . str_replace( '-', '_', $block ) ],
			] );
		}
	}

	/**
	 * Render: single service card.
	 */
	public function render_service_single( array $attributes ): string {
		$service_id = $attributes['serviceId'] ?? '';

		if ( empty( $service_id ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Select a service to display.', 'pocketprice-connector' ) . '</p>';
		}

		$service = $this->cache->get_service( $service_id );

		if ( ! $service ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Service not found.', 'pocketprice-connector' ) . '</p>';
		}

		return $this->render_service_card( $service, $attributes );
	}

	/**
	 * Render: services by category as table.
	 */
	public function render_service_category( array $attributes ): string {
		$category_id = $attributes['categoryId'] ?? '';

		if ( empty( $category_id ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Select a category to display.', 'pocketprice-connector' ) . '</p>';
		}

		$services   = $this->cache->get_services_by_category( $category_id );
		$categories = $this->cache->get_categories();

		$category_name = '';
		foreach ( $categories as $cat ) {
			if ( ( $cat['id'] ?? '' ) === $category_id ) {
				$category_name = $cat['name'] ?? '';
				break;
			}
		}

		if ( empty( $services ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'No services found in this category.', 'pocketprice-connector' ) . '</p>';
		}

		return $this->render_services_table( $services, $category_name, $attributes );
	}

	/**
	 * Render: all services as table (collection).
	 */
	public function render_service_collection( array $attributes ): string {
		$services = $this->cache->get_services();

		if ( empty( $services ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'No services available.', 'pocketprice-connector' ) . '</p>';
		}

		$show_categories = $attributes['groupByCategory'] ?? true;

		if ( $show_categories ) {
			return $this->render_grouped_collection( $services, $attributes );
		}

		return $this->render_services_table( $services, '', $attributes );
	}

	/**
	 * HTML: single service card.
	 */
	private function render_service_card( array $service, array $attributes ): string {
		$wrapper = get_block_wrapper_attributes( [ 'class' => 'pocketprice-service-card' ] );

		$price_html = $this->format_price( $service );

		$html  = '<div ' . $wrapper . '>';
		$html .= '<div class="pocketprice-service-card__inner">';
		$html .= '<h3 class="pocketprice-service-card__name">' . esc_html( $service['name'] ?? '' ) . '</h3>';

		if ( ! empty( $service['description'] ) ) {
			$html .= '<p class="pocketprice-service-card__description">' . esc_html( $service['description'] ) . '</p>';
		}

		$html .= '<div class="pocketprice-service-card__meta">';
		$html .= '<span class="pocketprice-service-card__price">' . $price_html . '</span>';

		if ( ! empty( $service['duration'] ) ) {
			$html .= '<span class="pocketprice-service-card__duration">'
				. sprintf(
					/* translators: %d: duration in minutes */
					esc_html__( '%d min', 'pocketprice-connector' ),
					absint( $service['duration'] )
				)
				. '</span>';
		}

		$html .= '</div>'; // meta
		$html .= '</div>'; // inner
		$html .= '</div>'; // wrapper

		return $html;
	}

	/**
	 * HTML: services table.
	 */
	private function render_services_table( array $services, string $title, array $attributes ): string {
		$wrapper   = get_block_wrapper_attributes( [ 'class' => 'pocketprice-services-table' ] );
		$show_desc = $attributes['showDescription'] ?? false;
		$show_dur  = $attributes['showDuration'] ?? true;

		$html = '<div ' . $wrapper . '>';

		if ( ! empty( $title ) ) {
			$html .= '<h3 class="pocketprice-services-table__title">' . esc_html( $title ) . '</h3>';
		}

		$html .= '<table class="pocketprice-table">';
		$html .= '<thead><tr>';
		$html .= '<th>' . esc_html__( 'Service', 'pocketprice-connector' ) . '</th>';
		if ( $show_desc ) {
			$html .= '<th>' . esc_html__( 'Description', 'pocketprice-connector' ) . '</th>';
		}
		if ( $show_dur ) {
			$html .= '<th>' . esc_html__( 'Duration', 'pocketprice-connector' ) . '</th>';
		}
		$html .= '<th>' . esc_html__( 'Price', 'pocketprice-connector' ) . '</th>';
		$html .= '</tr></thead>';

		$html .= '<tbody>';
		foreach ( $services as $service ) {
			$html .= '<tr>';
			$html .= '<td class="pocketprice-table__name">' . esc_html( $service['name'] ?? '' ) . '</td>';
			if ( $show_desc ) {
				$html .= '<td class="pocketprice-table__desc">' . esc_html( $service['description'] ?? '' ) . '</td>';
			}
			if ( $show_dur ) {
				$dur = ! empty( $service['duration'] )
					? sprintf( esc_html__( '%d min', 'pocketprice-connector' ), absint( $service['duration'] ) )
					: '&mdash;';
				$html .= '<td class="pocketprice-table__duration">' . $dur . '</td>';
			}
			$html .= '<td class="pocketprice-table__price">' . $this->format_price( $service ) . '</td>';
			$html .= '</tr>';
		}
		$html .= '</tbody></table></div>';

		return $html;
	}

	/**
	 * HTML: grouped by category collection.
	 */
	private function render_grouped_collection( array $services, array $attributes ): string {
		$categories = $this->cache->get_categories();
		$wrapper    = get_block_wrapper_attributes( [ 'class' => 'pocketprice-collection' ] );

		// Group services by category.
		$grouped = [];
		$cat_map = [];

		foreach ( $categories as $cat ) {
			$cat_map[ $cat['id'] ] = $cat['name'] ?? '';
			$grouped[ $cat['id'] ] = [];
		}

		$uncategorized = [];
		foreach ( $services as $service ) {
			$cid = $service['category_id'] ?? '';
			if ( ! empty( $cid ) && isset( $grouped[ $cid ] ) ) {
				$grouped[ $cid ][] = $service;
			} else {
				$uncategorized[] = $service;
			}
		}

		$html = '<div ' . $wrapper . '>';

		foreach ( $grouped as $cid => $cat_services ) {
			if ( empty( $cat_services ) ) {
				continue;
			}
			$html .= $this->render_services_table(
				$cat_services,
				$cat_map[ $cid ] ?? '',
				$attributes
			);
		}

		if ( ! empty( $uncategorized ) ) {
			$html .= $this->render_services_table(
				$uncategorized,
				__( 'Other', 'pocketprice-connector' ),
				$attributes
			);
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Format price display.
	 */
	private function format_price( array $service ): string {
		$price     = $service['price'] ?? 0;
		$price_max = $service['price_max'] ?? null;
		$currency  = $service['currency'] ?? 'RUB';

		$symbol = 'RUB' === $currency ? '&#8381;' : esc_html( $currency );

		if ( $price_max && $price_max > $price ) {
			return sprintf( '%s &ndash; %s %s',
				number_format( $price, 0, ',', ' ' ),
				number_format( $price_max, 0, ',', ' ' ),
				$symbol
			);
		}

		return number_format( $price, 0, ',', ' ' ) . ' ' . $symbol;
	}
}
