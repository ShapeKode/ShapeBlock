/**
 * Per-device padding and margin in the core Dimensions panel.
 *
 * WordPress keeps one padding / margin per block. This makes the same panel
 * device-aware: with the editor's preview on Tablet or Mobile, the Dimensions
 * panel shows and edits that device's values, stored in `shapeblockSpacing`
 * ( { tablet: { padding, margin }, mobile: { padding, margin } } ). On Desktop
 * the panel is untouched and edits `style.spacing` exactly as before. An empty
 * side inherits from the next larger screen.
 *
 * The front end prints them as media queries ( see responsive-spacing.php );
 * the canvas gets the values for the device it is showing.
 *
 * ShapeBlock's own blocks are skipped -- they have their own per-device controls.
 */
( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.hooks || ! wp.compose || ! wp.blockEditor || ! wp.data || ! wp.element || ! wp.blocks ) {
		return;
	}

	var el                         = wp.element.createElement;
	var Fragment                   = wp.element.Fragment;
	var useEffect                  = wp.element.useEffect;
	var __                         = wp.i18n.__;
	var sprintf                    = wp.i18n.sprintf;
	var addFilter                  = wp.hooks.addFilter;
	var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
	var useSelect                  = wp.data.useSelect;
	var InspectorControls          = wp.blockEditor.InspectorControls;

	var ATTR  = 'shapeblockSpacing';
	var SIDES = [ 'top', 'right', 'bottom', 'left' ];

	function supports( name, key ) {
		return !! wp.blocks.hasBlockSupport( name, 'spacing.' + key, false );
	}

	function isTarget( name ) {
		return 'string' === typeof name && 0 !== name.indexOf( 'shapeblock/' ) &&
			( supports( name, 'padding' ) || supports( name, 'margin' ) );
	}

	/** Drop empty sides / objects so nothing empty is saved. */
	function clean( obj ) {
		if ( ! obj || 'object' !== typeof obj ) {
			return obj === '' || obj === null ? undefined : obj;
		}
		var out = {};
		Object.keys( obj ).forEach( function ( k ) {
			var v = clean( obj[ k ] );
			if ( v !== undefined && ! ( 'object' === typeof v && ! Object.keys( v ).length ) ) {
				out[ k ] = v;
			}
		} );
		return Object.keys( out ).length ? out : undefined;
	}

	/** "var:preset|spacing|50" -> "var(--wp--preset--spacing--50)". */
	function toCss( value ) {
		if ( 'string' !== typeof value ) {
			return '';
		}
		if ( 0 === value.indexOf( 'var:' ) ) {
			return 'var(--wp--' + value.slice( 4 ).split( '|' ).join( '--' ) + ')';
		}
		return value;
	}

	function useDevice() {
		return useSelect( function ( select ) {
			var ed = select( 'core/editor' );
			if ( ed && ed.getDeviceType ) {
				return String( ed.getDeviceType() || 'Desktop' ).toLowerCase();
			}
			var ep = select( 'core/edit-post' );
			if ( ep && ep.__experimentalGetPreviewDeviceType ) {
				return String( ep.__experimentalGetPreviewDeviceType() || 'Desktop' ).toLowerCase();
			}
			return 'desktop';
		}, [] );
	}

	/** Values the canvas should show for a device ( inheriting from larger screens ). */
	function effective( attributes, device ) {
		var desk = ( attributes.style && attributes.style.spacing ) || {};
		var all  = attributes[ ATTR ] || {};
		var out  = { padding: {}, margin: {} };
		[ 'padding', 'margin' ].forEach( function ( prop ) {
			var layers = [ desk[ prop ] ];
			if ( 'tablet' === device || 'mobile' === device ) {
				layers.push( all.tablet && all.tablet[ prop ] );
			}
			if ( 'mobile' === device ) {
				layers.push( all.mobile && all.mobile[ prop ] );
			}
			layers.forEach( function ( layer ) {
				if ( ! layer ) {
					return;
				}
				if ( 'string' === typeof layer ) {
					SIDES.forEach( function ( s ) { out[ prop ][ s ] = layer; } );
					return;
				}
				SIDES.forEach( function ( s ) {
					if ( layer[ s ] !== undefined && layer[ s ] !== '' ) {
						out[ prop ][ s ] = layer[ s ];
					}
				} );
			} );
		} );
		return out;
	}

	/** The editor canvas document ( iframe on block themes, else the page ). */
	function canvasDoc() {
		var frame = document.querySelector( 'iframe[name="editor-canvas"]' );
		return ( frame && frame.contentDocument ) || document;
	}

	// 1. The attribute.
	addFilter( 'blocks.registerBlockType', 'shapeblock/responsive-spacing/attr', function ( settings, name ) {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		settings.attributes = Object.assign( {}, settings.attributes );
		if ( ! settings.attributes[ ATTR ] ) {
			settings.attributes[ ATTR ] = { type: 'object' };
		}
		return settings;
	} );

	// 2. The panel follows the preview device; 3. the canvas shows that device.
	addFilter( 'editor.BlockEdit', 'shapeblock/responsive-spacing', createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			var target = isTarget( props.name );
			var device = useDevice();
			var attrs  = props.attributes || {};
			var dev    = ( 'tablet' === device || 'mobile' === device ) ? device : 'desktop';

			// Canvas: only Tablet / Mobile differ from what core already prints.
			var key = target && 'desktop' !== dev ? JSON.stringify( [ dev, attrs[ ATTR ], attrs.style && attrs.style.spacing ] ) : '';
			useEffect( function () {
				if ( ! key ) {
					return;
				}
				var id    = 'shapeblock-sp-' + props.clientId;
				var timer = null;
				var tries = 0;
				var apply = function () {
					var doc = canvasDoc();
					if ( ! doc.getElementById( 'block-' + props.clientId ) && tries++ < 20 ) {
						timer = setTimeout( apply, 150 );
						return;
					}
					var vals  = effective( attrs, dev );
					var decls = [];
					[ 'padding', 'margin' ].forEach( function ( prop ) {
						SIDES.forEach( function ( s ) {
							if ( vals[ prop ][ s ] !== undefined ) {
								decls.push( prop + '-' + s + ':' + toCss( vals[ prop ][ s ] ) + ' !important' );
							}
						} );
					} );
					var tag = doc.getElementById( id );
					if ( ! tag ) {
						tag    = doc.createElement( 'style' );
						tag.id = id;
						( doc.head || doc.documentElement ).appendChild( tag );
					}
					tag.textContent = decls.length ? '#block-' + props.clientId + '{' + decls.join( ';' ) + '}' : '';
				};
				apply();
				return function () {
					if ( timer ) {
						clearTimeout( timer );
					}
					var old = canvasDoc().getElementById( id );
					if ( old && old.parentNode ) {
						old.parentNode.removeChild( old );
					}
				};
			}, [ key ] );

			if ( ! target || 'desktop' === dev ) {
				return el( BlockEdit, props );
			}

			// Hand the Dimensions panel this device's values ...
			var all     = attrs[ ATTR ] || {};
			var mine    = all[ dev ] || {};
			var desk    = ( attrs.style && attrs.style.spacing ) || {};
			var spacing = Object.assign( {}, desk );
			delete spacing.padding;
			delete spacing.margin;
			if ( mine.padding ) {
				spacing.padding = mine.padding;
			}
			if ( mine.margin ) {
				spacing.margin = mine.margin;
			}
			var style = Object.assign( {}, attrs.style, { spacing: spacing } );

			// ... and send what it writes back to this device.
			var setAttributes = function ( patch ) {
				if ( ! patch || ! Object.prototype.hasOwnProperty.call( patch, 'style' ) ) {
					return props.setAttributes( patch );
				}
				var ps   = patch.style || {};
				var sp   = ps.spacing || {};
				var next = Object.assign( {}, all );
				next[ dev ] = clean( { padding: sp.padding, margin: sp.margin } );

				var restSpacing = Object.assign( {}, sp );
				delete restSpacing.padding;
				delete restSpacing.margin;
				if ( desk.padding ) {
					restSpacing.padding = desk.padding;
				}
				if ( desk.margin ) {
					restSpacing.margin = desk.margin;
				}
				var out = Object.assign( {}, patch );
				out.style = clean( Object.assign( {}, ps, { spacing: restSpacing } ) );
				out[ ATTR ] = clean( next );
				return props.setAttributes( out );
			};

			var label = 'tablet' === dev ? __( 'Tablet', 'shapeblock' ) : __( 'Mobile', 'shapeblock' );
			return el( Fragment, {},
				el( BlockEdit, Object.assign( {}, props, {
					attributes: Object.assign( {}, attrs, { style: style } ),
					setAttributes: setAttributes
				} ) ),
				el( InspectorControls, { group: 'dimensions' },
					el( 'p', {
						className: 'shapeblock-sp-device-note',
						style: { gridColumn: '1 / -1', margin: '0 0 8px', fontSize: '12px', color: '#757575' }
					},
						/* translators: %s: Tablet or Mobile. */
						sprintf( __( 'Editing %s padding / margin. Empty sides use the larger screen.', 'shapeblock' ), label )
					)
				)
			);
		};
	}, 'withShapeBlockResponsiveSpacing' ) );
} )( window.wp );
