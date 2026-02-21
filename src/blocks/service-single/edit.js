/**
 * Editor component for Single Service block.
 */
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
		{ label: '— Выберите услугу —', value: '' },
		...services.map( ( s ) => ( {
			label: `${ s.name }`,
			value: s.id,
		} ) ),
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title="Настройки услуги">
					<SelectControl
						label="Выберите услугу"
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
						label="Pocket Price: Услуга"
						instructions="Выберите услугу на боковой панели для отображения."
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
						Услуга не найдена. Возможно, она была удалена.
					</p>
				) }
			</div>
		</>
	);
}
