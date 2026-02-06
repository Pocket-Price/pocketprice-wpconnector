/**
 * Editor component for Service Category block.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ServiceTable from '../../components/ServiceTable';

export default function Edit( { attributes, setAttributes } ) {
	const { categoryId, showDescription, showDuration } = attributes;
	const blockProps = useBlockProps( { className: 'pocketprice-services-table' } );

	const [ services, setServices ] = useState( [] );
	const [ categories, setCategories ] = useState( [] );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		Promise.all( [
			apiFetch( { path: '/pocketprice/v1/services' } ),
			apiFetch( { path: '/pocketprice/v1/categories' } ),
		] )
			.then( ( [ svcData, catData ] ) => {
				setServices( svcData || [] );
				setCategories( catData || [] );
				setLoading( false );
			} )
			.catch( () => {
				setLoading( false );
			} );
	}, [] );

	const filteredServices = categoryId
		? services.filter( ( s ) => s.category_id === categoryId )
		: [];

	const selectedCategory = categories.find( ( c ) => c.id === categoryId );

	const categoryOptions = [
		{ label: __( '— Select a category —', 'pocketprice-connector' ), value: '' },
		...categories.map( ( c ) => ( { label: c.name, value: c.id } ) ),
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Category Settings', 'pocketprice-connector' ) }>
					<SelectControl
						label={ __( 'Select Category', 'pocketprice-connector' ) }
						value={ categoryId }
						options={ categoryOptions }
						onChange={ ( val ) => setAttributes( { categoryId: val } ) }
					/>
					<ToggleControl
						label={ __( 'Show description', 'pocketprice-connector' ) }
						checked={ showDescription }
						onChange={ ( val ) =>
							setAttributes( { showDescription: val } )
						}
					/>
					<ToggleControl
						label={ __( 'Show duration', 'pocketprice-connector' ) }
						checked={ showDuration }
						onChange={ ( val ) =>
							setAttributes( { showDuration: val } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && <Spinner /> }

				{ ! loading && ! categoryId && (
					<Placeholder
						icon="category"
						label={ __( 'Pocket Price: Category', 'pocketprice-connector' ) }
						instructions={ __(
							'Select a category from the sidebar to display its services.',
							'pocketprice-connector'
						) }
					>
						<SelectControl
							value={ categoryId }
							options={ categoryOptions }
							onChange={ ( val ) => setAttributes( { categoryId: val } ) }
						/>
					</Placeholder>
				) }

				{ ! loading && categoryId && (
					<ServiceTable
						services={ filteredServices }
						title={ selectedCategory?.name || '' }
						showDescription={ showDescription }
						showDuration={ showDuration }
					/>
				) }
			</div>
		</>
	);
}
