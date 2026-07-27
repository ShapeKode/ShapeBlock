/**
 * Front-end script for the Easy Elements "Menu" block.
 *
 * Handles the responsive (mobile) menu: the hamburger toggle slides the menu in as an
 * off-canvas drawer (with an overlay backdrop + close button), and below the breakpoint
 * parent items expand their dropdown as an accordion.
 */
( function () {
	'use strict';

	function isMobile( nav ) {
		// "Always" overlay behaves like mobile on every screen size.
		if ( nav.classList.contains( 'eelfg-menu-overlay-always' ) ) {
			return true;
		}
		var bp = parseInt( nav.getAttribute( 'data-breakpoint' ), 10 ) || 782;
		return window.matchMedia && window.matchMedia( '(max-width:' + bp + 'px)' ).matches;
	}

	function initMenu( nav ) {
		if ( ! nav || nav.eelfgMenuInit ) {
			return;
		}
		nav.eelfgMenuInit = true;

		var toggle    = nav.querySelector( '.eelfg-menu-toggle' );
		var overlay   = nav.querySelector( '.eelfg-menu-overlay' );
		var closeEl   = nav.querySelector( '.eelfg-menu-close' );
		var clickMode = nav.classList.contains( 'eelfg-menu-click' );

		function setOpen( open ) {
			nav.classList.toggle( 'is-open', open );
			if ( toggle ) {
				toggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			}
			// Lock body scroll while the off-canvas drawer is open on mobile.
			if ( open && isMobile( nav ) ) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}

		function closeMenu() {
			setOpen( false );
		}

		if ( toggle ) {
			toggle.addEventListener( 'click', function () {
				setOpen( ! nav.classList.contains( 'is-open' ) );
			} );
		}
		if ( overlay ) {
			overlay.addEventListener( 'click', closeMenu );
		}
		if ( closeEl ) {
			closeEl.addEventListener( 'click', closeMenu );
		}
		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key && nav.classList.contains( 'is-open' ) ) {
				closeMenu();
			}
		} );

		// Parent items: on mobile, tapping the item (or its arrow) expands the sub-menu instead
		// of following the link. On desktop the link works normally (CSS shows the dropdown on hover).
		var parents = nav.querySelectorAll( '.menu-item-has-children' );
		Array.prototype.forEach.call( parents, function ( li ) {
			var link  = li.querySelector( ':scope > a' );
			var arrow = li.querySelector( ':scope > .eelfg-menu-sub-toggle' );
			var href  = link ? ( link.getAttribute( 'href' ) || '' ) : '';
			var hasRealLink = href && '#' !== href && '' !== href.replace( /\s/g, '' );

			function toggleSub( e ) {
				e.preventDefault();
				e.stopPropagation();
				// Close sibling open sub-menus for a clean accordion.
				var siblings = li.parentNode ? li.parentNode.children : [];
				Array.prototype.forEach.call( siblings, function ( s ) {
					if ( s !== li && s.classList && s.classList.contains( 'is-sub-open' ) ) {
						s.classList.remove( 'is-sub-open' );
					}
				} );
				li.classList.toggle( 'is-sub-open' );
			}

			// The arrow always toggles the sub-menu ( in the drawer or in click mode ).
			if ( arrow ) {
				arrow.addEventListener( 'click', function ( e ) {
					if ( ! isMobile( nav ) && ! clickMode ) { return; }
					toggleSub( e );
				} );
			}

			// The link: a real URL follows the link; a "#" / empty link opens the sub-menu instead.
			if ( link ) {
				link.addEventListener( 'click', function ( e ) {
					if ( ! isMobile( nav ) && ! clickMode ) { return; }
					if ( ! hasRealLink ) { toggleSub( e ); }
				} );
			}
		} );

		// Click mode ( desktop ): close open sub-menus when clicking outside the menu.
		if ( clickMode ) {
			document.addEventListener( 'click', function ( e ) {
				if ( isMobile( nav ) || nav.contains( e.target ) ) {
					return;
				}
				Array.prototype.forEach.call( nav.querySelectorAll( '.is-sub-open' ), function ( s ) {
					s.classList.remove( 'is-sub-open' );
				} );
			} );
		}

		// Reset mobile state when resizing back to desktop. During the resize we suppress the
		// drawer transition so it doesn't visibly slide across the screen at the breakpoint.
		var resizeTimer = null;
		window.addEventListener( 'resize', function () {
			nav.classList.add( 'eelfg-menu-no-anim' );
			if ( resizeTimer ) {
				window.clearTimeout( resizeTimer );
			}
			resizeTimer = window.setTimeout( function () {
				nav.classList.remove( 'eelfg-menu-no-anim' );
			}, 200 );

			if ( ! isMobile( nav ) ) {
				setOpen( false );
				Array.prototype.forEach.call( nav.querySelectorAll( '.is-sub-open' ), function ( s ) {
					s.classList.remove( 'is-sub-open' );
				} );
			}
		} );
	}

	function initAll() {
		Array.prototype.forEach.call( document.querySelectorAll( '.eelfg-menu' ), initMenu );
	}

	if ( 'loading' !== document.readyState ) {
		initAll();
	} else {
		document.addEventListener( 'DOMContentLoaded', initAll );
	}
} )();
