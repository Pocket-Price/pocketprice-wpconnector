/**
 * Shared utilities for Pocket Price blocks.
 */

const fmt = ( n ) =>
	new Intl.NumberFormat( 'ru-RU', { maximumFractionDigits: 0 } ).format( n );

/**
 * Format a service price for display.
 *
 * @param {Object} service Service object.
 * @return {string} Formatted price string.
 */
export function formatPrice( service ) {
	const price = service.price || 0;
	const priceMax = service.price_max || null;
	const priceUnit = service.price_unit || null;
	const priceNote = service.price_note || null;
	const isActive = service.is_active !== undefined ? service.is_active : true;
	const currency = service.currency || 'RUB';

	// "По запросу" for inactive or zero-priced services.
	if ( ! isActive || ( price === 0 && ! priceMax ) ) {
		return 'По запросу';
	}

	// If price_note exists, use it directly.
	if ( priceNote ) {
		return priceNote;
	}

	const symbol = currency === 'RUB' ? '\u20BD' : currency;

	// If custom price_unit (e.g. "руб./км").
	if ( priceUnit ) {
		return `${ fmt( price ) } ${ priceUnit }`;
	}

	if ( priceMax && priceMax > price ) {
		return `${ fmt( price ) } \u2013 ${ fmt( priceMax ) } ${ symbol }`;
	}

	return `${ fmt( price ) } ${ symbol }`;
}
