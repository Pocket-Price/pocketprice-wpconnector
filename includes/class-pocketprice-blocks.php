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
			return '<p class="pocketprice-notice">' . esc_html__( 'Выберите услугу для отображения.', 'pocketprice-connector' ) . '</p>';
		}

		$service = $this->cache->get_service( $service_id );

		if ( ! $service ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Услуга не найдена.', 'pocketprice-connector' ) . '</p>';
		}

		return $this->render_service_card( $service, $attributes );
	}

	/**
	 * Render: services by subcategory as table.
	 */
	public function render_service_category( array $attributes ): string {
		$subcategory_id = $attributes['subcategoryId'] ?? '';

		if ( empty( $subcategory_id ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Выберите подкатегорию для отображения.', 'pocketprice-connector' ) . '</p>';
		}

		$services      = $this->cache->get_services_by_subcategory( $subcategory_id );
		$subcategories = $this->cache->get_subcategories();

		$subcat_name = '';
		foreach ( $subcategories as $sc ) {
			if ( ( $sc['id'] ?? '' ) === $subcategory_id ) {
				$subcat_name = $sc['name_ru'] ?? '';
				break;
			}
		}

		if ( empty( $services ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Нет услуг в этой подкатегории.', 'pocketprice-connector' ) . '</p>';
		}

		return $this->render_services_table( $services, $subcat_name, $attributes );
	}

	/**
	 * Render: all services as table (collection).
	 */
	public function render_service_collection( array $attributes ): string {
		$services = $this->cache->get_services();

		if ( empty( $services ) ) {
			return '<p class="pocketprice-notice">' . esc_html__( 'Нет доступных услуг.', 'pocketprice-connector' ) . '</p>';
		}

		$group_by = $attributes['groupByCategory'] ?? true;
		$show_notes = $attributes['showNotes'] ?? false;

		$html = '';

		if ( $show_notes ) {
			$html .= $this->render_meta_notes();
		}

		if ( $group_by ) {
			$html .= $this->render_grouped_collection( $services, $attributes );
		} else {
			$html .= $this->render_services_table( $services, '', $attributes );
		}

		return $html;
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
					esc_html__( '%d мин', 'pocketprice-connector' ),
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

		$html = '<div ' . $wrapper . '>';

		if ( ! empty( $title ) ) {
			$html .= '<h3 class="pocketprice-services-table__title">' . esc_html( $title ) . '</h3>';
		}

		$html .= '<table class="pocketprice-table">';
		$html .= '<thead><tr>';
		$html .= '<th>' . esc_html__( 'Услуга', 'pocketprice-connector' ) . '</th>';
		if ( $show_desc ) {
			$html .= '<th>' . esc_html__( 'Описание', 'pocketprice-connector' ) . '</th>';
		}
		$html .= '<th>' . esc_html__( 'Стоимость', 'pocketprice-connector' ) . '</th>';
		$html .= '</tr></thead>';

		$html .= '<tbody>';
		foreach ( $services as $service ) {
			$html .= '<tr>';
			$html .= '<td class="pocketprice-table__name">' . esc_html( $service['name'] ?? '' ) . '</td>';
			if ( $show_desc ) {
				$html .= '<td class="pocketprice-table__desc">' . esc_html( $service['description'] ?? '' ) . '</td>';
			}
			$html .= '<td class="pocketprice-table__price">' . $this->format_price( $service ) . '</td>';
			$html .= '</tr>';
		}
		$html .= '</tbody></table></div>';

		return $html;
	}

	/**
	 * HTML: grouped by subcategory collection.
	 */
	private function render_grouped_collection( array $services, array $attributes ): string {
		$subcategories = $this->cache->get_subcategories();
		$wrapper       = get_block_wrapper_attributes( [ 'class' => 'pocketprice-collection' ] );

		// Group services by subcategory.
		$grouped    = [];
		$subcat_map = [];

		foreach ( $subcategories as $sc ) {
			$subcat_map[ $sc['id'] ] = $sc['name_ru'] ?? '';
			$grouped[ $sc['id'] ]    = [];
		}

		$uncategorized = [];
		foreach ( $services as $service ) {
			$scid = $service['subcategory'] ?? '';
			if ( ! empty( $scid ) && isset( $grouped[ $scid ] ) ) {
				$grouped[ $scid ][] = $service;
			} else {
				$uncategorized[] = $service;
			}
		}

		$html = '<div ' . $wrapper . '>';

		foreach ( $grouped as $scid => $sc_services ) {
			if ( empty( $sc_services ) ) {
				continue;
			}
			$html .= $this->render_services_table(
				$sc_services,
				$subcat_map[ $scid ] ?? '',
				$attributes
			);
		}

		if ( ! empty( $uncategorized ) ) {
			$html .= $this->render_services_table(
				$uncategorized,
				__( 'Прочие', 'pocketprice-connector' ),
				$attributes
			);
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * HTML: meta notes block.
	 */
	private function render_meta_notes(): string {
		$meta = $this->cache->get_meta();

		if ( empty( $meta['notes'] ) || ! is_array( $meta['notes'] ) ) {
			return '';
		}

		$html = '<div class="pocketprice-meta-notes">';

		foreach ( $meta['notes'] as $note ) {
			$html .= '<p class="pocketprice-meta-notes__item">' . esc_html( $note ) . '</p>';
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Format price display.
	 */
	private function format_price( array $service ): string {
		$price      = $service['price'] ?? 0;
		$price_max  = $service['price_max'] ?? null;
		$price_unit = $service['price_unit'] ?? null;
		$price_note = $service['price_note'] ?? null;
		$is_active  = $service['is_active'] ?? true;
		$currency   = $service['currency'] ?? 'RUB';

		// "По запросу" for inactive services or zero-priced.
		if ( ! $is_active || ( 0 === (int) $price && empty( $price_max ) ) ) {
			return '<span class="pocketprice-price--request">' . esc_html__( 'По запросу', 'pocketprice-connector' ) . '</span>';
		}

		// If price_note exists, use it directly.
		if ( ! empty( $price_note ) ) {
			return esc_html( $price_note );
		}

		$symbol = 'RUB' === $currency ? '&#8381;' : esc_html( $currency );

		// If custom price_unit (e.g. "руб./км").
		if ( ! empty( $price_unit ) ) {
			return number_format( $price, 0, ',', ' ' ) . ' ' . esc_html( $price_unit );
		}

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
