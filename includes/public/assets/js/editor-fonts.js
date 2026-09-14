/**
 * Editor canvas Google-font loader.
 *
 * Ensures every font family used by any ShapeBlock block's typography is
 * loaded INSIDE the editor canvas iframe (and the outer document) — on page
 * load and whenever blocks change, without requiring the block to be selected
 * or its Typography control to be opened.
 */
( function ( wp ) {
	if ( ! wp || ! wp.data ) {
		return;
	}

	function fontHref( fam ) {
		return 'https://fonts.googleapis.com/css2?family=' +
			encodeURIComponent( fam ).replace( /%20/g, '+' ) +
			':wght@100;200;300;400;500;600;700;800;900&display=swap';
	}

	function inject( doc, fam ) {
		try {
			if ( ! doc || ! doc.head ) {
				return;
			}
			var id = 'shapeblock-font-' + fam.toLowerCase().replace( /[^a-z0-9]+/g, '-' );
			if ( doc.getElementById( id ) ) {
				return;
			}
			var link = doc.createElement( 'link' );
			link.id = id;
			link.rel = 'stylesheet';
			link.href = fontHref( fam );
			doc.head.appendChild( link );
		} catch ( e ) { /* ignore */ }
	}

	// Collect fontFamily values from a block tree (typography objects live as
	// top-level attributes shaped like { fontFamily, fontSize, ... }).
	function collect( blocks, out ) {
		( blocks || [] ).forEach( function ( b ) {
			var attrs = b.attributes || {};
			Object.keys( attrs ).forEach( function ( k ) {
				var v = attrs[ k ];
				if ( v && typeof v === 'object' && typeof v.fontFamily === 'string' &&
					v.fontFamily && v.fontFamily.indexOf( ',' ) === -1 ) {
					out[ v.fontFamily ] = 1;
				}
			} );
			if ( b.innerBlocks && b.innerBlocks.length ) {
				collect( b.innerBlocks, out );
			}
		} );
	}

	function run() {
		var editor = wp.data.select( 'core/block-editor' );
		if ( ! editor || ! editor.getBlocks ) {
			return;
		}
		var out = {};
		collect( editor.getBlocks(), out );
		var fams = Object.keys( out );
		if ( ! fams.length ) {
			return;
		}
		var docs = [ document ];
		var iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		if ( iframe && iframe.contentDocument ) {
			docs.push( iframe.contentDocument );
		}
		fams.forEach( function ( fam ) {
			docs.forEach( function ( d ) { inject( d, fam ); } );
		} );
	}

	var timer;
	wp.data.subscribe( function () {
		clearTimeout( timer );
		timer = setTimeout( run, 400 );
	} );

	// Initial passes — the canvas iframe may not be ready immediately on load.
	[ 800, 1600, 3000 ].forEach( function ( ms ) { setTimeout( run, ms ); } );
} )( window.wp );
