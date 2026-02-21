
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { 
	PanelBody, 
	TextControl, 
	ToggleControl, 
	RangeControl,
	SelectControl,
	CheckboxControl,
	Spinner,
	Placeholder,
	Button
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { database } from '@wordpress/icons';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		dataSourceUrl,
		rowsPerPage,
		showSearch,
		showColumnFilters,
		showPagination,
		enableSorting,
		showBorders,
		alternatingRows,
		responsiveMode,
		selectedColumns
	} = attributes;

	const [ previewData, setPreviewData ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ availableColumns, setAvailableColumns ] = useState( [] );

	useEffect( () => {
		if ( dataSourceUrl ) {
			fetchPreviewData();
		}
	}, [ dataSourceUrl ] );

	const fetchPreviewData = async () => {
		setIsLoading( true );
		setError( null );
		
		try {
			const response = await fetch( dataSourceUrl );
			if ( ! response.ok ) {
				throw new Error( __( 'Failed to fetch data', 'telex-data-table' ) );
			}
			
			const data = await response.json();
			
			if ( ! Array.isArray( data ) || data.length === 0 ) {
				throw new Error( __( 'Invalid data format. Expected an array of objects.', 'telex-data-table' ) );
			}
			
			// Extract columns from first data item
			const columns = Object.keys( data[ 0 ] );
			setAvailableColumns( columns );
			
			// Set default selected columns if none selected
			if ( selectedColumns.length === 0 ) {
				setAttributes( { selectedColumns: columns } );
			}
			
			// Show only first 5 rows for preview
			setPreviewData( data.slice( 0, 5 ) );
		} catch ( err ) {
			setError( err.message );
			setPreviewData( null );
		} finally {
			setIsLoading( false );
		}
	};

	const blockProps = useBlockProps( {
		className: 'telex-data-table-editor'
	} );

	const renderPreviewTable = () => {
		if ( ! previewData ) {
			return null;
		}

		const columnsToShow = selectedColumns.length > 0 ? selectedColumns : availableColumns;

		return (
			<div className="telex-data-table-preview">
				<div className="preview-notice">
					{ __( 'Preview (showing first 5 rows)', 'telex-data-table' ) }
				</div>
				{ showSearch && (
					<div className="table-search-preview">
						<input 
							type="text" 
							placeholder={ __( 'Search table...', 'telex-data-table' ) }
							disabled
						/>
					</div>
				) }
				<div className="table-wrapper">
					<table className={ `data-table ${ showBorders ? 'with-borders' : '' } ${ alternatingRows ? 'alternating-rows' : '' }` }>
						<thead>
							<tr>
								{ columnsToShow.map( ( column ) => (
									<th key={ column }>
										{ column }
										{ enableSorting && <span className="sort-indicator">⇅</span> }
									</th>
								) ) }
							</tr>
							{ showColumnFilters && (
								<tr className="filter-row">
									{ columnsToShow.map( ( column ) => (
										<th key={ `filter-${ column }` }>
											<select disabled>
												<option>{ __( 'All', 'telex-data-table' ) }</option>
											</select>
										</th>
									) ) }
								</tr>
							) }
						</thead>
						<tbody>
							{ previewData.map( ( row, index ) => (
								<tr key={ index }>
									{ columnsToShow.map( ( column ) => (
										<td key={ column }>{ row[ column ] || '-' }</td>
									) ) }
								</tr>
							) ) }
						</tbody>
					</table>
				</div>
				{ showPagination && (
					<div className="table-pagination-preview">
						<span>{ __( 'Showing 1 to 5 of X entries', 'telex-data-table' ) }</span>
						<div className="pagination-controls">
							<button disabled>{ __( 'Previous', 'telex-data-table' ) }</button>
							<span>1</span>
							<button disabled>{ __( 'Next', 'telex-data-table' ) }</button>
						</div>
					</div>
				) }
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Data Source', 'telex-data-table' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Data Source URL', 'telex-data-table' ) }
						help={ __( 'Enter REST API or JSON endpoint URL', 'telex-data-table' ) }
						value={ dataSourceUrl }
						onChange={ ( value ) => setAttributes( { dataSourceUrl: value } ) }
						placeholder="https://example.com/api/data"
					/>
					{ dataSourceUrl && (
						<Button
							variant="secondary"
							onClick={ fetchPreviewData }
							disabled={ isLoading }
						>
							{ isLoading ? __( 'Loading...', 'telex-data-table' ) : __( 'Refresh Data', 'telex-data-table' ) }
						</Button>
					) }
				</PanelBody>

				{ availableColumns.length > 0 && (
					<PanelBody title={ __( 'Column Settings', 'telex-data-table' ) } initialOpen={ false }>
						<p className="components-base-control__help">
							{ __( 'Select which columns to display', 'telex-data-table' ) }
						</p>
						{ availableColumns.map( ( column ) => (
							<CheckboxControl
								key={ column }
								label={ column }
								checked={ selectedColumns.includes( column ) }
								onChange={ ( checked ) => {
									if ( checked ) {
										setAttributes( { 
											selectedColumns: [ ...selectedColumns, column ] 
										} );
									} else {
										setAttributes( { 
											selectedColumns: selectedColumns.filter( col => col !== column ) 
										} );
									}
								} }
							/>
						) ) }
					</PanelBody>
				) }

				<PanelBody title={ __( 'Table Features', 'telex-data-table' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Show Search', 'telex-data-table' ) }
						help={ __( 'Enable real-time search functionality', 'telex-data-table' ) }
						checked={ showSearch }
						onChange={ ( value ) => setAttributes( { showSearch: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Column Filters', 'telex-data-table' ) }
						help={ __( 'Add dropdown filters for each column', 'telex-data-table' ) }
						checked={ showColumnFilters }
						onChange={ ( value ) => setAttributes( { showColumnFilters: value } ) }
					/>
					<ToggleControl
						label={ __( 'Enable Sorting', 'telex-data-table' ) }
						help={ __( 'Allow users to sort by clicking column headers', 'telex-data-table' ) }
						checked={ enableSorting }
						onChange={ ( value ) => setAttributes( { enableSorting: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Pagination', 'telex-data-table' ) }
						help={ __( 'Display pagination controls', 'telex-data-table' ) }
						checked={ showPagination }
						onChange={ ( value ) => setAttributes( { showPagination: value } ) }
					/>
					{ showPagination && (
						<RangeControl
							label={ __( 'Rows Per Page', 'telex-data-table' ) }
							value={ rowsPerPage }
							onChange={ ( value ) => setAttributes( { rowsPerPage: value } ) }
							min={ 5 }
							max={ 100 }
							step={ 5 }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Appearance', 'telex-data-table' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Show Borders', 'telex-data-table' ) }
						checked={ showBorders }
						onChange={ ( value ) => setAttributes( { showBorders: value } ) }
					/>
					<ToggleControl
						label={ __( 'Alternating Row Colors', 'telex-data-table' ) }
						checked={ alternatingRows }
						onChange={ ( value ) => setAttributes( { alternatingRows: value } ) }
					/>
					<SelectControl
						label={ __( 'Responsive Mode', 'telex-data-table' ) }
						value={ responsiveMode }
						options={ [
							{ label: __( 'Horizontal Scroll', 'telex-data-table' ), value: 'scroll' },
							{ label: __( 'Stack Columns', 'telex-data-table' ), value: 'stack' }
						] }
						onChange={ ( value ) => setAttributes( { responsiveMode: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ ! dataSourceUrl && (
					<Placeholder
						icon={ database }
						label={ __( 'Interactive Data Table', 'telex-data-table' ) }
						instructions={ __( 'Configure the data source URL in the block settings to get started.', 'telex-data-table' ) }
					>
						<TextControl
							label={ __( 'Data Source URL', 'telex-data-table' ) }
							value={ dataSourceUrl }
							onChange={ ( value ) => setAttributes( { dataSourceUrl: value } ) }
							placeholder="https://example.com/api/data"
						/>
					</Placeholder>
				) }

				{ dataSourceUrl && isLoading && (
					<div className="loading-state">
						<Spinner />
						<p>{ __( 'Loading data...', 'telex-data-table' ) }</p>
					</div>
				) }

				{ dataSourceUrl && error && (
					<div className="error-state">
						<p>{ __( 'Error:', 'telex-data-table' ) } { error }</p>
						<Button
							variant="secondary"
							onClick={ fetchPreviewData }
						>
							{ __( 'Try Again', 'telex-data-table' ) }
						</Button>
					</div>
				) }

				{ dataSourceUrl && ! isLoading && ! error && previewData && renderPreviewTable() }
			</div>
		</>
	);
}
