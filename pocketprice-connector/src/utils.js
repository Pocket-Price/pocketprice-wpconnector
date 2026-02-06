/**
 * Shared utilities for Pocket Price blocks.
 */

/**
 * Format a service price for display.
 *
 * @param {Object} service Service object with price, price_max, currency.
 * @return {string} Formatted price string.
 */
export function formatPrice( service ) {
	const price = service.price || 0;
	const priceMax = service.price_max || null;
	const currency = service.currency || 'RUB';

	const symbol = currency === 'RUB' ? '\u20BD' : currency;
	const fmt = ( n ) =>
		new Intl.NumberFormat( 'ru-RU', { maximumFractionDigits: 0 } ).format( n );

	if ( priceMax && priceMax > price ) {
		return `${ fmt( price ) } \u2013 ${ fmt( priceMax ) } ${ symbol }`;
	}

	return `${ fmt( price ) } ${ symbol }`;
}
