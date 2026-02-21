/**
 * Pocket Price admin page scripts.
 */
( function ( $ ) {
	'use strict';

	const { ajaxUrl, nonce, i18n } = window.pocketpriceAdmin || {};

	$( '#pocketprice-sync' ).on( 'click', function () {
		const $btn = $( this );
		const $status = $( '#pocketprice-status' );

		$btn.prop( 'disabled', true );
		$status.removeClass( 'success error' ).text( i18n.syncing );

		$.post( ajaxUrl, {
			action: 'pocketprice_sync',
			nonce: nonce,
		} )
			.done( function ( response ) {
				if ( response.success ) {
					$status.addClass( 'success' ).text(
						i18n.synced +
							' (' +
							response.data.services_count +
							' services, ' +
							response.data.categories_count +
							' categories)'
					);
				} else {
					$status.addClass( 'error' ).text( i18n.error );
				}
			} )
			.fail( function () {
				$status.addClass( 'error' ).text( i18n.error );
			} )
			.always( function () {
				$btn.prop( 'disabled', false );
			} );
	} );

	$( '#pocketprice-health' ).on( 'click', function () {
		const $btn = $( this );
		const $status = $( '#pocketprice-status' );

		$btn.prop( 'disabled', true );
		$status.removeClass( 'success error' ).text( i18n.checking );

		$.post( ajaxUrl, {
			action: 'pocketprice_health',
			nonce: nonce,
		} )
			.done( function ( response ) {
				if ( response.success ) {
					$status.addClass( 'success' ).text( i18n.healthy );
				} else {
					$status
						.addClass( 'error' )
						.text( i18n.unhealthy + ' ' + ( response.data || '' ) );
				}
			} )
			.fail( function () {
				$status.addClass( 'error' ).text( i18n.unhealthy );
			} )
			.always( function () {
				$btn.prop( 'disabled', false );
			} );
	} );
} )( jQuery );
