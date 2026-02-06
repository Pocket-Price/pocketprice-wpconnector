/**
 * ServiceCard component — displays a single service as a card.
 */
import { formatPrice } from '../utils';

export default function ServiceCard( { service } ) {
	if ( ! service ) {
		return null;
	}

	return (
		<div className="pocketprice-service-card__inner">
			<h3 className="pocketprice-service-card__name">{ service.name }</h3>

			{ service.description && (
				<p className="pocketprice-service-card__description">
					{ service.description }
				</p>
			) }

			<div className="pocketprice-service-card__meta">
				<span className="pocketprice-service-card__price">
					{ formatPrice( service ) }
				</span>
				{ service.duration > 0 && (
					<span className="pocketprice-service-card__duration">
						{ service.duration } min
					</span>
				) }
			</div>
		</div>
	);
}
