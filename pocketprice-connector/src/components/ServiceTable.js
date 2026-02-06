/**
 * ServiceTable component — displays services as a table.
 */
import { __ } from '@wordpress/i18n';
import { formatPrice } from '../utils';

export default function ServiceTable( { services, title, showDescription, showDuration } ) {
	if ( ! services || services.length === 0 ) {
		return (
			<p className="pocketprice-notice">
				{ __( 'No services to display.', 'pocketprice-connector' ) }
			</p>
		);
	}

	return (
		<div className="pocketprice-services-table">
			{ title && (
				<h3 className="pocketprice-services-table__title">{ title }</h3>
			) }
			<table className="pocketprice-table">
				<thead>
					<tr>
						<th>{ __( 'Service', 'pocketprice-connector' ) }</th>
						{ showDescription && (
							<th>{ __( 'Description', 'pocketprice-connector' ) }</th>
						) }
						{ showDuration && (
							<th>{ __( 'Duration', 'pocketprice-connector' ) }</th>
						) }
						<th>{ __( 'Price', 'pocketprice-connector' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ services.map( ( service ) => (
						<tr key={ service.id }>
							<td className="pocketprice-table__name">
								{ service.name }
							</td>
							{ showDescription && (
								<td className="pocketprice-table__desc">
									{ service.description || '\u2014' }
								</td>
							) }
							{ showDuration && (
								<td className="pocketprice-table__duration">
									{ service.duration
										? `${ service.duration } min`
										: '\u2014' }
								</td>
							) }
							<td className="pocketprice-table__price">
								{ formatPrice( service ) }
							</td>
						</tr>
					) ) }
				</tbody>
			</table>
		</div>
	);
}
