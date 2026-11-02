/**
 * The Advanced tab's padding, margin, background and Position, in the editor canvas.
 *
 * On the page they come from a render_block_data filter in blocks/blocks.php.
 * A block the editor draws itself (most blocks, as opposed to those rendered
 * by the server) never passes through it, so what an author typed into
 * Advanced showed only on the page. This writes the same rules into the
 * canvas for every ShapeBlock block, add-on blocks included: the block's
 * own class three times over (as the PHP does, so the value wins over the
 * block's own spacing), with the tablet and phone values in media queries.
 */
( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.hooks || ! wp.compose || ! wp.element ) {
		return;
	}

	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;

	var DEVICES = [
		{ suffix: '', query: '' },
		{ suffix: 'Tablet', query: '@media (max-width: 1024px)' },
		{ suffix: 'Mobile', query: '@media (max-width: 767px)' },
	];
	var SIDES = [ 'top', 'right', 'bottom', 'left' ];

	// A number becomes pixels; anything already carrying a unit stays as it is.
	function withUnit( value ) {
		var v = String( value === undefined || value === null ? '' : value ).trim();
		return /^-?\d*\.?\d+$/.test( v ) ? v + 'px' : v;
	}

	// A Position side or width: px, %, vw or vh (bare number = px), else nothing.
	function length( value ) {
		var m = String( value === undefined || value === null ? '' : value ).trim().match( /^(-?\d*\.?\d+)(px|%|vw|vh)?$/ );
		return m ? m[ 1 ] + ( m[ 2 ] || 'px' ) : '';
	}

	// Only what a CSS value can hold, so nothing typed can end the rule.
	function safe( value ) {
		return /[{};<>]/.test( value ) ? '' : value;
	}

	function declarations( attrs, suffix ) {
		var out = '';
		[ [ 'advPadding', 'padding' ], [ 'advMargin', 'margin' ] ].forEach( function ( pair ) {
			var box = attrs[ pair[ 0 ] + suffix ];
			if ( ! box || 'object' !== typeof box ) {
				return;
			}
			SIDES.forEach( function ( side ) {
				var value = safe( withUnit( box[ side ] ) );
				if ( '' !== value ) {
					out += pair[ 1 ] + '-' + side + ':' + value + ';';
				}
			} );
		} );
		// Position, as shapeblock_advanced_block_css() writes it: on desktop every
		// side starts at auto and the aligned edge(s) at 0 (Center / Middle with
		// auto margins), then each side and the width take their own value.
		if ( 'absolute' === attrs.advPosition || 'fixed' === attrs.advPosition ) {
			if ( '' === suffix ) {
				var h = attrs.advHAlign, v = attrs.advVAlign;
				var base = { position: attrs.advPosition, top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };
				if ( 'left' === h || 'center' === h ) { base.left = '0px'; }
				if ( 'right' === h || 'center' === h ) { base.right = '0px'; }
				if ( 'center' === h ) { base[ 'margin-left' ] = 'auto'; base[ 'margin-right' ] = 'auto'; base.width = 'fit-content'; }
				if ( 'top' === v || 'middle' === v ) { base.top = '0px'; }
				if ( 'bottom' === v || 'middle' === v ) { base.bottom = '0px'; }
				if ( 'middle' === v ) { base[ 'margin-top' ] = 'auto'; base[ 'margin-bottom' ] = 'auto'; base.height = 'fit-content'; }
				Object.keys( base ).forEach( function ( prop ) {
					out += prop + ':' + base[ prop ] + ';';
				} );
			}
			[ [ 'advTop', 'top' ], [ 'advRight', 'right' ], [ 'advBottom', 'bottom' ], [ 'advLeft', 'left' ], [ 'advWidth', 'width' ] ].forEach( function ( pair ) {
				var value = length( attrs[ pair[ 0 ] + suffix ] );
				if ( '' !== value ) {
					out += pair[ 1 ] + ':' + value + ';';
				}
			} );
		}
		// The background and z-index have no per-device value, matching their controls.
		if ( '' === suffix ) {
			if ( /^-?\d+$/.test( String( attrs.advZIndex || '' ).trim() ) ) {
				out += 'z-index:' + parseInt( attrs.advZIndex, 10 ) + ';';
			}
			if ( attrs.advBgColor && safe( String( attrs.advBgColor ) ) ) {
				out += 'background-color:' + attrs.advBgColor + ';';
			}
			if ( 'string' === typeof attrs.advBgGradient && /^(repeating-)?(linear|radial|conic)-gradient\(/.test( attrs.advBgGradient ) && safe( attrs.advBgGradient ) ) {
				out += 'background-image:' + attrs.advBgGradient + ';';
			}
		}
		return out;
	}

	function build( attrs ) {
		var id = attrs && attrs.blockId ? String( attrs.blockId ).replace( /[^A-Za-z0-9_-]/g, '' ) : '';
		if ( ! id ) {
			return '';
		}
		var sel = '.' + id + '.' + id + '.' + id;
		return DEVICES.reduce( function ( css, device ) {
			var decls = declarations( attrs, device.suffix );
			if ( ! decls ) {
				return css;
			}
			var rule = sel + '{' + decls + '}';
			return css + ( device.query ? device.query + '{' + rule + '}' : rule );
		}, '' );
	}

	var withAdvancedCss = wp.compose.createHigherOrderComponent( function ( BlockListBlock ) {
		return function ( props ) {
			var css = 'string' === typeof props.name && 0 === props.name.indexOf( 'shapeblock/' ) ? build( props.attributes ) : '';
			useEffect(
				function () {
					if ( ! css ) {
						return undefined;
					}
					// The canvas is an iframe in the block editor of today.
					var frame = document.querySelector( 'iframe[name="editor-canvas"]' );
					var doc = ( frame && frame.contentDocument ) || document;
					var tag = doc.createElement( 'style' );
					tag.setAttribute( 'data-shapeblock-advanced', props.clientId );
					tag.textContent = css;
					doc.head.appendChild( tag );
					return function () {
						tag.remove();
					};
				},
				[ css ]
			);
			return el( BlockListBlock, props );
		};
	}, 'withShapeBlockAdvancedCss' );

	wp.hooks.addFilter( 'editor.BlockListBlock', 'shapeblock/advanced-css', withAdvancedCss );
} )( window.wp );
