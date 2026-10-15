/**
 * When the block inserter opens, the cursor goes to its search box, so a
 * block's name can be typed right away.
 */
( function ( wp ) {
	if ( ! wp || ! wp.data ) {
		return;
	}
	let wasOpen = false;

	// The panel can take a moment to load the first time: look for the search
	// box for up to two seconds, then focus it once the panel has set its own
	// focus on its tabs.
	const focusSearch = function ( tries ) {
		const input = document.querySelector( '.block-editor-inserter__search input' );
		if ( ! input ) {
			if ( tries > 0 ) {
				window.setTimeout( function () {
					focusSearch( tries - 1 );
				}, 50 );
			}
			return;
		}
		window.setTimeout( function () {
			if ( document.activeElement !== input ) {
				input.focus();
			}
		}, 100 );
	};

	wp.data.subscribe( function () {
		const editor = wp.data.select( 'core/editor' );
		const open = !! ( editor && editor.isInserterOpened && editor.isInserterOpened() );
		if ( open && ! wasOpen ) {
			focusSearch( 40 );
		}
		wasOpen = open;
	} );
} )( window.wp );
