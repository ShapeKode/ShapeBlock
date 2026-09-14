/**
 * Adds a "Responsive" panel with Hide on Desktop / Tablet / Mobile to every
 * ShapeBlock block.
 *
 * The state is kept in the block's own `className` attribute rather than in
 * custom attributes. className is a core attribute that every block already
 * has, so it is always serialised into the post and always printed on the
 * wrapper by get_block_wrapper_attributes() — no dependence on when our filters
 * happen to run relative to block registration, which is what silently dropped
 * the value before.
 *
 * Row and Column keep their own panel (they store real attributes and paint the
 * classes in their render.php), so they are skipped here.
 */
( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.hooks || ! wp.compose || ! wp.blockEditor ) {
		return;
	}

	var el                         = wp.element.createElement;
	var Fragment                   = wp.element.Fragment;
	var __                         = wp.i18n.__;
	var addFilter                  = wp.hooks.addFilter;
	var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
	var InspectorControls          = wp.blockEditor.InspectorControls;
	var PanelBody                  = wp.components.PanelBody;
	var ToggleControl              = wp.components.ToggleControl;

	var TD     = 'shapeblock';
	var PREFIX = 'shapeblock-hide-';

	var CONTROLS = [
		{ device: 'desktop', label: __( 'Hide on Desktop', TD ) },
		{ device: 'tablet', label: __( 'Hide on Tablet', TD ) },
		{ device: 'mobile', label: __( 'Hide on Mobile', TD ) }
	];

	// Row and Column render the same three toggles themselves.
	var SKIP = [ 'shapeblock/layout-row', 'shapeblock/column' ];

	function isShapeBlock( name ) {
		return 'string' === typeof name && 0 === name.indexOf( 'shapeblock/' );
	}

	function classList( className ) {
		return ( className || '' ).split( /\s+/ ).filter( Boolean );
	}

	function hasClass( className, cls ) {
		return classList( className ).indexOf( cls ) !== -1;
	}

	function withClass( className, cls, on ) {
		var list = classList( className ).filter( function ( c ) { return c !== cls; } );
		if ( on ) {
			list.push( cls );
		}
		return list.join( ' ' );
	}

	addFilter( 'editor.BlockEdit', 'shapeblock/responsive-visibility', createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			if ( ! isShapeBlock( props.name ) || SKIP.indexOf( props.name ) !== -1 || ! props.isSelected ) {
				return el( BlockEdit, props );
			}
			return el( Fragment, {},
				el( BlockEdit, props ),
				el( InspectorControls, {},
					el( PanelBody, { title: __( 'Responsive', TD ), initialOpen: false },
						CONTROLS.map( function ( c ) {
							var cls = PREFIX + c.device;
							return el( ToggleControl, {
								key: c.device,
								label: c.label,
								checked: hasClass( props.attributes.className, cls ),
								onChange: function ( value ) {
									props.setAttributes( { className: withClass( props.attributes.className, cls, value ) } );
								},
								__nextHasNoMarginBottom: true
							} );
						} )
					)
				)
			);
		};
	}, 'shapeblockResponsiveVisibility' ) );
} )( window.wp );
