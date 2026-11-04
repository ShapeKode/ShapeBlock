/**
 * A small "Upgrade to Pro" link under the settings of every ShapeBlock block.
 * Only a link: it locks nothing, and this file is not loaded when Pro is active.
 */
( function ( wp, data ) {
	'use strict';

	if ( ! wp || ! wp.hooks || ! wp.compose || ! wp.blockEditor || ! data ) {
		return;
	}

	var el                = wp.element.createElement;
	var Fragment          = wp.element.Fragment;
	var __                = wp.i18n.__;
	var InspectorControls = wp.blockEditor.InspectorControls;

	// WordPress draws the Advanced panel after everything a block adds, so assets/css/editor.css moves the link below it.
	wp.hooks.addFilter( 'editor.BlockEdit', 'shapeblock/upgrade-link', wp.compose.createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			if ( ! props.isSelected || 'string' !== typeof props.name || 0 !== props.name.indexOf( 'shapeblock/' ) ) {
				return el( BlockEdit, props );
			}
			return el( Fragment, {},
				el( BlockEdit, props ),
				el( InspectorControls, {},
					el( 'p', { className: 'shapeblock-upgrade-link' },
						__( 'Need all Pro blocks & Modules?', 'shapeblock' ),
						el( 'br' ),
						el( 'a', { href: data.url, target: '_blank', rel: 'noopener noreferrer' }, __( 'Upgrade to Pro', 'shapeblock' ) )
					)
				)
			);
		};
	}, 'shapeblockUpgradeLink' ) );
} )( window.wp, window.shapeblockUpgrade );
