/**
 * ServiceTable component — displays services as a table.
 */
import { formatPrice } from '../utils';

export default function ServiceTable( { services, title, showDescription } ) {
	if ( ! services || services.length === 0 ) {
		return (
			<p className="pocketprice-notice">
				Нет услуг для отображения.
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
						<th>Услуга</th>
						{ showDescription && (
							<th>Описание</th>
						) }
						<th>Стоимость</th>
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
