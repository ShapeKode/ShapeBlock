/**
 * Keep every block's `blockId` unique inside the editor.
 *
 * Each block writes its own CSS against `.<blockId>`, and each edit.js only fills
 * the attribute in when it is empty:
 *
 *     if ( ! blockId ) { setAttributes( { blockId: 'shapeblock-…' } ); }
 *
 * Duplicating or copy-pasting a block carries the saved `blockId` across, so the
 * copy keeps the original's id and both blocks answer to the same selector. Their
 * per-block rules then land on each other — a Testimonials block set to Style 2
 * prints `width:calc(100% / 3)` on `.<id> .shapeblock-grid-item`, which also
 * matches the Style 1 copy sharing that id and breaks its full-width rows.
 *
 * This filter watches for a block whose `blockId` is already claimed by an
 * earlier block and hands it a fresh one. The first block in document order keeps
 * the id it had, so an untouched page is left completely alone.
 */
( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.hooks || ! wp.compose || ! wp.element || ! wp.data ) {
		return;
	}

	var addFilter              = wp.hooks.addFilter;
	var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
	var useEffect              = wp.element.useEffect;
	var createElement          = wp.element.createElement;
	var useSelect              = wp.data.useSelect;

	var PREFIX = 'shapeblock/';

	/** Flatten the editor tree into a document-ordered list. */
	function flatten( blocks, out ) {
		for ( var i = 0; i < blocks.length; i++ ) {
			out.push( blocks[ i ] );
			if ( blocks[ i ].innerBlocks && blocks[ i ].innerBlocks.length ) {
				flatten( blocks[ i ].innerBlocks, out );
			}
		}
		return out;
	}

	/**
	 * A replacement id in the same shape the block itself would have produced:
	 * the existing prefix with a fresh random suffix.
	 */
	function freshId( current ) {
		var suffix = Math.random().toString( 36 ).slice( 2, 8 );
		var cut    = String( current ).lastIndexOf( '-' );
		var prefix = cut > 0 ? String( current ).slice( 0, cut + 1 ) : 'shapeblock-';
		return prefix + suffix;
	}

	var withUniqueBlockId = createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			var name       = props.name || '';
			var attributes = props.attributes || {};
			var isOurs     = 0 === name.indexOf( PREFIX );
			var blockId    = attributes.blockId;

			// Is an earlier block already using this id?
			var takenEarlier = useSelect( function ( select ) {
				if ( ! isOurs || ! blockId ) {
					return false;
				}
				var editor = select( 'core/block-editor' );
				if ( ! editor ) {
					return false;
				}
				// getBlocks() stops at "controlled" inner blocks -- the post's own
				// content inside the template's Post Content block, template parts,
				// synced patterns -- so on a block-theme page it never saw the
				// post's blocks at all and duplicates kept their copied id. The
				// clientId list includes them, in document order.
				if ( 'function' === typeof editor.getClientIdsWithDescendants ) {
					var ids = editor.getClientIdsWithDescendants();
					for ( var j = 0; j < ids.length; j++ ) {
						if ( ids[ j ] === props.clientId ) {
							// Reached ourselves first — we are the original, keep the id.
							return false;
						}
						var attrs = editor.getBlockAttributes( ids[ j ] );
						if ( attrs && attrs.blockId === blockId ) {
							return true;
						}
					}
					return false;
				}
				if ( 'function' !== typeof editor.getBlocks ) {
					return false;
				}
				var all = flatten( editor.getBlocks(), [] );
				for ( var i = 0; i < all.length; i++ ) {
					if ( all[ i ].clientId === props.clientId ) {
						return false;
					}
					if ( all[ i ].attributes && all[ i ].attributes.blockId === blockId ) {
						return true;
					}
				}
				return false;
			}, [ isOurs, blockId, props.clientId ] );

			useEffect( function () {
				if ( takenEarlier ) {
					props.setAttributes( { blockId: freshId( blockId ) } );
				}
			}, [ takenEarlier ] );

			return createElement( BlockEdit, props );
		};
	}, 'withUniqueBlockId' );

	addFilter( 'editor.BlockEdit', 'shapeblock/unique-block-id', withUniqueBlockId );
} )( window.wp );
