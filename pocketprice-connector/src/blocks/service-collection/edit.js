/**
 * Editor component for Service Collection block (all services).
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ServiceTable from '../../components/ServiceTable';

export default function Edit( { attributes, setAttributes } ) {
	const { groupByCategory, showDescription, showDuration } = attributes;
	const blockProps = useBlockProps( { className: 'pocketprice-collection' } );

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

	const renderGrouped = () => {
		const catMap = {};
		categories.forEach( ( c ) => {
			catMap[ c.id ] = { name: c.name, services: [] };
		} );

		const uncategorized = [];

		services.forEach( ( s ) => {
			if ( s.category_id && catMap[ s.category_id ] ) {
				catMap[ s.category_id ].services.push( s );
			} else {
				uncategorized.push( s );
			}
		} );

		return (
			<>
				{ Object.values( catMap ).map(
					( group ) =>
						group.services.length > 0 && (
							<ServiceTable
								key={ group.name }
								services={ group.services }
								title={ group.name }
								showDescription={ showDescription }
								showDuration={ showDuration }
							/>
						)
				) }
				{ uncategorized.length > 0 && (
					<ServiceTable
						services={ uncategorized }
						title={ __( 'Other', 'pocketprice-connector' ) }
						showDescription={ showDescription }
						showDuration={ showDuration }
					/>
				) }
			</>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Display Settings', 'pocketprice-connector' ) }>
					<ToggleControl
						label={ __( 'Group by category', 'pocketprice-connector' ) }
						checked={ groupByCategory }
						onChange={ ( val ) =>
							setAttributes( { groupByCategory: val } )
						}
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

				{ ! loading && services.length === 0 && (
					<p className="pocketprice-notice">
						{ __(
							'No services available. Check Pocket Price settings and sync data.',
							'pocketprice-connector'
						) }
					</p>
				) }

				{ ! loading && services.length > 0 && groupByCategory && renderGrouped() }

				{ ! loading && services.length > 0 && ! groupByCategory && (
					<ServiceTable
						services={ services }
						title=""
						showDescription={ showDescription }
						showDuration={ showDuration }
					/>
				) }
			</div>
		</>
	);
}
