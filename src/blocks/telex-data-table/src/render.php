<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$data_source_url = $attributes['dataSourceUrl'] ?? '';
$rows_per_page = $attributes['rowsPerPage'] ?? 10;
$show_search = $attributes['showSearch'] ?? true;
$show_column_filters = $attributes['showColumnFilters'] ?? true;
$show_pagination = $attributes['showPagination'] ?? true;
$enable_sorting = $attributes['enableSorting'] ?? true;
$show_borders = $attributes['showBorders'] ?? true;
$alternating_rows = $attributes['alternatingRows'] ?? true;
$responsive_mode = $attributes['responsiveMode'] ?? 'scroll';
$selected_columns = $attributes['selectedColumns'] ?? array();

$config = array(
	'dataSourceUrl' => esc_url( $data_source_url ),
	'rowsPerPage' => intval( $rows_per_page ),
	'showSearch' => (bool) $show_search,
	'showColumnFilters' => (bool) $show_column_filters,
	'showPagination' => (bool) $show_pagination,
	'enableSorting' => (bool) $enable_sorting,
	'showBorders' => (bool) $show_borders,
	'alternatingRows' => (bool) $alternating_rows,
	'responsiveMode' => esc_attr( $responsive_mode ),
	'selectedColumns' => $selected_columns,
);

$block_classes = array(
	'telex-data-table-wrapper',
	'responsive-mode-' . $responsive_mode,
);

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => implode( ' ', $block_classes ),
) );
?>

<div <?php echo $wrapper_attributes; ?>>
	<?php if ( empty( $data_source_url ) ) : ?>
		<div class="telex-data-table-container">
			<div class="empty-state">
				<p><?php esc_html_e( 'Please configure a data source URL in the block settings.', 'telex-data-table' ); ?></p>
			</div>
		</div>
	<?php else : ?>
		<div class="telex-data-table-container" data-config='<?php echo esc_attr( wp_json_encode( $config ) ); ?>'>
			<div class="loading-state">
				<div class="spinner"></div>
				<p><?php esc_html_e( 'Loading data...', 'telex-data-table' ); ?></p>
			</div>
		</div>
	<?php endif; ?>
</div>
