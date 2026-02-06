/**
 * Editor component for Single Service block.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Placeholder, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ServiceCard from '../../components/ServiceCard';

export default function Edit( { attributes, setAttributes } ) {
	const { serviceId } = attributes;
	const blockProps = useBlockProps( { className: 'pocketprice-service-card' } );

	const [ services, setServices ] = useState( [] );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		apiFetch( { path: '/pocketprice/v1/services' } )
			.then( ( data ) => {
				setServices( data || [] );
				setLoading( false );
			} )
			.catch( () => {
				setLoading( false );
			} );
	}, [] );

	const selectedService = services.find( ( s ) => s.id === serviceId ) || null;

	const serviceOptions = [
		{ label: __( '— Select a service —', 'pocketprice-connector' ), value: '' },
		...services.map( ( s ) => ( { label: s.name, value: s.id } ) ),
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Service Settings', 'pocketprice-connector' ) }>
					<SelectControl
						label={ __( 'Select Service', 'pocketprice-connector' ) }
						value={ serviceId }
						options={ serviceOptions }
						onChange={ ( val ) => setAttributes( { serviceId: val } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && <Spinner /> }

				{ ! loading && ! serviceId && (
					<Placeholder
						icon="tag"
						label={ __( 'Pocket Price: Service', 'pocketprice-connector' ) }
						instructions={ __(
							'Select a service from the sidebar to display.',
							'pocketprice-connector'
						) }
					>
						<SelectControl
							value={ serviceId }
							options={ serviceOptions }
							onChange={ ( val ) => setAttributes( { serviceId: val } ) }
						/>
					</Placeholder>
				) }

				{ ! loading && selectedService && (
					<ServiceCard service={ selectedService } />
				) }

				{ ! loading && serviceId && ! selectedService && (
					<p className="pocketprice-notice">
						{ __( 'Service not found. It may have been removed.', 'pocketprice-connector' ) }
					</p>
				) }
			</div>
		</>
	);
}
