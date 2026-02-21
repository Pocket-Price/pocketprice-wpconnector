/**
 * Editor component for Service Collection block (all services).
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ServiceTable from '../../components/ServiceTable';

export default function Edit( { attributes, setAttributes } ) {
	const { groupByCategory, showDescription, showNotes } = attributes;
	const blockProps = useBlockProps( { className: 'pocketprice-collection' } );

	const [ services, setServices ] = useState( [] );
	const [ subcategories, setSubcategories ] = useState( [] );
	const [ meta, setMeta ] = useState( {} );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		Promise.all( [
			apiFetch( { path: '/pocketprice/v1/services' } ),
			apiFetch( { path: '/pocketprice/v1/subcategories' } ),
			apiFetch( { path: '/pocketprice/v1/meta' } ),
		] )
			.then( ( [ svcData, subcatData, metaData ] ) => {
				setServices( svcData || [] );
				setSubcategories( subcatData || [] );
				setMeta( metaData || {} );
				setLoading( false );
			} )
			.catch( () => {
				setLoading( false );
			} );
	}, [] );

	const renderGrouped = () => {
		const subcatMap = {};
		subcategories.forEach( ( sc ) => {
			subcatMap[ sc.id ] = { name: sc.name_ru, services: [] };
		} );

		const uncategorized = [];

		services.forEach( ( s ) => {
			if ( s.subcategory && subcatMap[ s.subcategory ] ) {
				subcatMap[ s.subcategory ].services.push( s );
			} else {
				uncategorized.push( s );
			}
		} );

		return (
			<>
				{ Object.values( subcatMap ).map(
					( group ) =>
						group.services.length > 0 && (
							<ServiceTable
								key={ group.name }
								services={ group.services }
								title={ group.name }
								showDescription={ showDescription }
							/>
						)
				) }
				{ uncategorized.length > 0 && (
					<ServiceTable
						services={ uncategorized }
						title="Прочие"
						showDescription={ showDescription }
					/>
				) }
			</>
		);
	};

	const renderNotes = () => {
		if ( ! meta.notes || ! Array.isArray( meta.notes ) ) {
			return null;
		}
		return (
			<div className="pocketprice-meta-notes">
				{ meta.notes.map( ( note, i ) => (
					<p key={ i } className="pocketprice-meta-notes__item">
						{ note }
					</p>
				) ) }
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Настройки отображения">
					<ToggleControl
						label="Группировать по подкатегориям"
						checked={ groupByCategory }
						onChange={ ( val ) =>
							setAttributes( { groupByCategory: val } )
						}
					/>
					<ToggleControl
						label="Показать описание"
						checked={ showDescription }
						onChange={ ( val ) =>
							setAttributes( { showDescription: val } )
						}
					/>
					<ToggleControl
						label="Показать примечания"
						checked={ showNotes }
						onChange={ ( val ) =>
							setAttributes( { showNotes: val } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && <Spinner /> }

				{ ! loading && services.length === 0 && (
					<p className="pocketprice-notice">
						Нет доступных услуг. Проверьте настройки Pocket Price и синхронизируйте данные.
					</p>
				) }

				{ ! loading && services.length > 0 && (
					<>
						{ showNotes && renderNotes() }
						{ groupByCategory
							? renderGrouped()
							: (
								<ServiceTable
									services={ services }
									title=""
									showDescription={ showDescription }
								/>
							)
						}
					</>
				) }
			</div>
		</>
	);
}
