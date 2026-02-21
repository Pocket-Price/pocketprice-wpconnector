/**
 * Editor component for Service Category (subcategory) block.
 */
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
	const { subcategoryId, showDescription } = attributes;
	const blockProps = useBlockProps( { className: 'pocketprice-services-table' } );

	const [ services, setServices ] = useState( [] );
	const [ subcategories, setSubcategories ] = useState( [] );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		Promise.all( [
			apiFetch( { path: '/pocketprice/v1/services' } ),
			apiFetch( { path: '/pocketprice/v1/subcategories' } ),
		] )
			.then( ( [ svcData, subcatData ] ) => {
				setServices( svcData || [] );
				setSubcategories( subcatData || [] );
				setLoading( false );
			} )
			.catch( () => {
				setLoading( false );
			} );
	}, [] );

	const filteredServices = subcategoryId
		? services.filter( ( s ) => s.subcategory === subcategoryId )
		: [];

	const selectedSubcategory = subcategories.find( ( sc ) => sc.id === subcategoryId );

	const subcategoryOptions = [
		{ label: '— Выберите подкатегорию —', value: '' },
		...subcategories.map( ( sc ) => ( {
			label: sc.name_ru,
			value: sc.id,
		} ) ),
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title="Настройки подкатегории">
					<SelectControl
						label="Выберите подкатегорию"
						value={ subcategoryId }
						options={ subcategoryOptions }
						onChange={ ( val ) => setAttributes( { subcategoryId: val } ) }
					/>
					<ToggleControl
						label="Показать описание"
						checked={ showDescription }
						onChange={ ( val ) =>
							setAttributes( { showDescription: val } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && <Spinner /> }

				{ ! loading && ! subcategoryId && (
					<Placeholder
						icon="category"
						label="Pocket Price: Подкатегория"
						instructions="Выберите подкатегорию на боковой панели для отображения услуг."
					>
						<SelectControl
							value={ subcategoryId }
							options={ subcategoryOptions }
							onChange={ ( val ) => setAttributes( { subcategoryId: val } ) }
						/>
					</Placeholder>
				) }

				{ ! loading && subcategoryId && (
					<ServiceTable
						services={ filteredServices }
						title={ selectedSubcategory?.name_ru || '' }
						showDescription={ showDescription }
					/>
				) }
			</div>
		</>
	);
}
