/**
 * ShapeBlock → Templates (full-screen starter templates page).
 *
 * Every template group (a complete demo website) is a card. Hovering a card
 * offers "Start Import" and "Live Preview"; the heart keeps it in this
 * browser's favourites. Start Import opens a dialog to choose which of the
 * demo's pages, header and footer to bring in. Each becomes a real page (or a
 * Theme Builder header/footer); then a final "site setup" step points the
 * demo's links at the new pages, creates its menus and applies its settings.
 * UI pieces come from template-library-ui.js (window.shapeblockTL).
 */
( function ( wp, TL ) {
	'use strict';

	if ( ! wp || ! TL ) {
		return;
	}

	const { createElement: el, Fragment, useEffect, useState, createRoot, render } = wp.element;
	const { Button, Modal, Notice, CheckboxControl, Spinner, Dropdown, MenuGroup, MenuItem } = wp.components;
	const { __, _n, sprintf } = wp.i18n;
	const { config, BASE, TD, TYPE_LABELS, apiFetch, errorMessage } = TL;

	const INLINE_CATEGORIES = 8;
	const MEDIA_PREF = 'shapeblockTemplateLibraryMedia';
	const FAVOURITES = 'shapeblockStarterFavourites';
	const SETUP_KEY = '__setup';
	const XML_KEY = '__xml';

	function Icon( { name } ) {
		return el( 'span', { className: 'dashicons dashicons-' + name, 'aria-hidden': 'true' } );
	}

	/* ------------------------------------------------------------------ */
	/* Import dialog                                                       */
	/* ------------------------------------------------------------------ */

	function StatusCell( { state } ) {
		if ( ! state ) {
			return null;
		}
		if ( state.status === 'running' ) {
			return el( Spinner );
		}
		if ( state.status === 'error' ) {
			return el( 'span', { className: 'sbtl-import__err' }, el( Icon, { name: 'warning' } ), state.error );
		}
		const r = state.result || {};
		return el(
			'span',
			{ className: 'sbtl-import__ok' },
			el( Icon, { name: 'yes-alt' } ),
			state.note && el( 'span', null, state.note ),
			r.edit_url && el( 'a', { href: r.edit_url, target: '_blank', rel: 'noopener noreferrer' }, __( 'Edit', TD ) ),
			r.view_url && el( 'a', { href: r.view_url, target: '_blank', rel: 'noopener noreferrer' }, __( 'View', TD ) )
		);
	}

	function setupNote( r ) {
		const parts = [];
		if ( r.links ) {
			/* translators: %d: number of pages whose links were updated. */
			parts.push( sprintf( _n( 'links updated in %d page', 'links updated in %d pages', r.links, TD ), r.links ) );
		}
		( r.menus || [] ).forEach( ( m ) => {
			parts.push(
				m.location
					? /* translators: 1: menu name, 2: theme menu location. */ sprintf( __( 'menu “%1$s” (%2$s)', TD ), m.name, m.location )
					: /* translators: %s: menu name. */ sprintf( __( 'menu “%s”', TD ), m.name )
			);
		} );
		const settings = r.settings || [];
		if ( settings.includes( 'shapeblock' ) ) {
			parts.push( __( 'colors & layout', TD ) );
		}
		if ( settings.includes( 'css' ) ) {
			parts.push( __( 'custom CSS', TD ) );
		}
		if ( settings.includes( 'title' ) || settings.includes( 'tagline' ) ) {
			parts.push( __( 'site title', TD ) );
		}
		return parts.length ? parts.join( ' · ' ) : __( 'nothing to change', TD );
	}

	function xmlNote( r ) {
		const parts = [];
		if ( r.posts ) {
			/* translators: %d: number of blog posts imported. */
			parts.push( sprintf( _n( '%d post', '%d posts', r.posts, TD ), r.posts ) );
		}
		if ( r.pages ) {
			/* translators: %d: number of pages imported. */
			parts.push( sprintf( _n( '%d page', '%d pages', r.pages, TD ), r.pages ) );
		}
		if ( r.attachments ) {
			/* translators: %d: number of media files imported. */
			parts.push( sprintf( _n( '%d media file', '%d media files', r.attachments, TD ), r.attachments ) );
		}
		if ( r.menu_items ) {
			/* translators: %d: number of menu items imported. */
			parts.push( sprintf( _n( '%d menu item', '%d menu items', r.menu_items, TD ), r.menu_items ) );
		}
		if ( r.errors && r.errors.length ) {
			/* translators: %d: number of problems. */
			parts.push( sprintf( _n( '%d problem', '%d problems', r.errors.length, TD ), r.errors.length ) );
		}
		return parts.length ? parts.join( ' · ' ) : __( 'nothing new to add', TD );
	}

	function ImportDialog( { group, onClose } ) {
		const detail = TL.useFetch( '/groups/' + encodeURIComponent( group.slug ), 0, null );
		const [ selected, setSelected ] = useState( null ); // key => bool, filled once loaded.
		const [ media, setMedia ] = useState( config.canUpload ? TL.readPref( MEDIA_PREF, true ) : false );
		const [ front, setFront ] = useState( true );
		const [ activate, setActivate ] = useState( true );
		const [ menus, setMenus ] = useState( true );
		const [ design, setDesign ] = useState( true );
		const [ site, setSite ] = useState( false );
		const [ withXml, setWithXml ] = useState( true );
		const [ phase, setPhase ] = useState( 'choose' ); // choose | running | done
		const [ progress, setProgress ] = useState( {} ); // key => { status, result?, error?, note? }

		const g = detail.data && detail.data.group;
		const setup = ( g && g.setup ) || { menus: [], links: {}, settings: {} };
		const settings = setup.settings || {};
		const items = g ? ( g.landing || [] ).concat( ( g.items || [] ).filter( ( i ) => i.type !== 'pattern' ) ) : [];
		const keyOf = ( item ) => item.type + ':' + item.id;
		const isPart = ( item ) => item.type === 'header' || item.type === 'footer';
		const landing = items.find( ( i ) => i.is_landing && ! isPart( i ) );
		const hasDesign = !! ( settings.shapeblock || settings.custom_css );
		const hasSite = !! ( settings.site && ( settings.site.title || settings.site.tagline ) );

		useEffect( () => {
			if ( g && ! selected ) {
				const next = {};
				items.forEach( ( item ) => {
					next[ keyOf( item ) ] = true;
				} );
				setSelected( next );
			}
		}, [ g ] );

		const chosen = items.filter( ( item ) => selected && selected[ keyOf( item ) ] );
		// The setup step always runs after an import: links are always updated.
		const wantsSetup = chosen.length > 0;

		async function run() {
			setPhase( 'running' );
			const posts = {};
			for ( const item of chosen ) {
				const key = keyOf( item );
				setProgress( ( p ) => ( { ...p, [ key ]: { status: 'running' } } ) );
				try {
					const result = await apiFetch( {
						path: BASE + '/import',
						method: 'POST',
						data: {
							type: item.type,
							id: item.id,
							media,
							front: !! ( front && landing && item === landing ),
							activate: !! ( activate && isPart( item ) ),
						},
					} );
					posts[ key ] = result.post_id;
					setProgress( ( p ) => ( { ...p, [ key ]: { status: 'done', result } } ) );
				} catch ( err ) {
					setProgress( ( p ) => ( { ...p, [ key ]: { status: 'error', error: errorMessage( err ) } } ) );
				}
			}

			let xmlMenus = [];
			if ( setup.xml && withXml ) {
				setProgress( ( p ) => ( { ...p, [ XML_KEY ]: { status: 'running' } } ) );
				try {
					const result = await apiFetch( { path: BASE + '/import-xml', method: 'POST', data: { group: group.slug, media } } );
					xmlMenus = result.menus || [];
					setProgress( ( p ) => ( { ...p, [ XML_KEY ]: { status: 'done', note: xmlNote( result ) } } ) );
				} catch ( err ) {
					setProgress( ( p ) => ( { ...p, [ XML_KEY ]: { status: 'error', error: errorMessage( err ) } } ) );
				}
			}

			if ( wantsSetup && Object.keys( posts ).length ) {
				setProgress( ( p ) => ( { ...p, [ SETUP_KEY ]: { status: 'running' } } ) );
				try {
					const result = await apiFetch( {
						path: BASE + '/setup',
						method: 'POST',
						data: { group: group.slug, posts, menus: menus && setup.menus.length > 0, settings: design && hasDesign, site: site && hasSite, xml_menus: xmlMenus },
					} );
					setProgress( ( p ) => ( { ...p, [ SETUP_KEY ]: { status: 'done', note: setupNote( result ) } } ) );
				} catch ( err ) {
					setProgress( ( p ) => ( { ...p, [ SETUP_KEY ]: { status: 'error', error: errorMessage( err ) } } ) );
				}
			}
			setPhase( 'done' );
		}

		function row( item ) {
			const key = keyOf( item );
			return el(
				'li',
				{ key, className: 'sbtl-import__row' },
				el( CheckboxControl, {
					label: item.title,
					checked: !! ( selected && selected[ key ] ),
					disabled: phase !== 'choose',
					onChange: ( value ) => setSelected( { ...selected, [ key ]: value } ),
					__nextHasNoMarginBottom: true,
				} ),
				el(
					'span',
					{ className: 'sbtl-import__tags' },
					item === landing && el( 'span', { className: 'sbtl-badge' }, __( 'Landing', TD ) ),
					el( 'span', { className: 'sbtl-import__type' }, TYPE_LABELS[ item.type ] )
				),
				el( 'span', { className: 'sbtl-import__status' }, el( StatusCell, { state: progress[ key ] } ) )
			);
		}

		const failed = Object.keys( progress ).filter( ( k ) => progress[ k ].status === 'error' ).length;
		const frontDone = landing && front && progress[ keyOf( landing ) ] && progress[ keyOf( landing ) ].status === 'done';
		const option = ( label, checked, onChange, help ) =>
			el( CheckboxControl, { label, checked, onChange, help, disabled: phase !== 'choose', __nextHasNoMarginBottom: true } );

		return el(
			Modal,
			{
				/* translators: %s: demo name. */
				title: sprintf( __( 'Import “%s”', TD ), group.name ),
				onRequestClose: phase === 'running' ? () => {} : onClose,
				className: 'sbtl-import',
				shouldCloseOnClickOutside: false,
				isDismissible: phase !== 'running',
			},
			detail.status !== 'ready'
				? el( TL.StateMessage, { status: detail.status, error: detail.error } )
				: el(
					Fragment,
					null,
					el(
						'p',
						{ className: 'sbtl-import__intro' },
						__( 'Each page is created as a new published page on your site, headers and footers go to the ShapeBlock Theme Builder. Links between the demo’s pages are pointed at your new pages.', TD )
					),
					el( 'p', { className: 'sbtl-import__heading' }, __( 'Content', TD ) ),
					el(
						'ul',
						{ className: 'sbtl-import__list' },
						items.map( row ),
						setup.xml &&
							( withXml || progress[ XML_KEY ] ) &&
							el(
								'li',
								{ className: 'sbtl-import__row is-setup' },
								el( 'span', { className: 'sbtl-import__setup' }, el( Icon, { name: 'database-import' } ), __( 'Demo content: blog posts, media and menus', TD ) ),
								el( 'span', { className: 'sbtl-import__tags' } ),
								el( 'span', { className: 'sbtl-import__status' }, el( StatusCell, { state: progress[ XML_KEY ] } ) )
							),
						( progress[ SETUP_KEY ] || phase === 'choose' ) &&
							el(
								'li',
								{ className: 'sbtl-import__row is-setup' },
								el( 'span', { className: 'sbtl-import__setup' }, el( Icon, { name: 'admin-generic' } ), __( 'Site setup: links, menus and settings', TD ) ),
								el( 'span', { className: 'sbtl-import__tags' } ),
								el( 'span', { className: 'sbtl-import__status' }, el( StatusCell, { state: progress[ SETUP_KEY ] } ) )
							)
					),
					el( 'p', { className: 'sbtl-import__heading' }, __( 'Options', TD ) ),
					el(
						'div',
						{ className: 'sbtl-import__options' },
						setup.xml &&
							option(
								__( 'Import the demo’s other content (blog posts, media, menus)', TD ),
								withXml,
								setWithXml,
								__( 'Added from the demo’s content file; anything with the same name that already exists is kept as it is.', TD )
							),
						config.canUpload &&
							option( __( 'Copy images to the Media Library', TD ), media, ( v ) => {
								setMedia( v );
								TL.writePref( MEDIA_PREF, v );
							} ),
						landing &&
							option(
								/* translators: %s: landing page name. */
								sprintf( __( 'Set “%s” as the homepage', TD ), landing.title ),
								front,
								setFront
							),
						items.some( isPart ) &&
							option( __( 'Use the header and footer on the entire site', TD ), activate, setActivate, __( 'Unticked, they are added to the Theme Builder but not shown anywhere yet.', TD ) ),
						setup.menus.length > 0 &&
							option(
								setup.menus.length > 1
									? /* translators: %d: number of menus. */ sprintf( __( 'Create the demo’s %d menus', TD ), setup.menus.length )
									: /* translators: %s: menu name. */ sprintf( __( 'Create the menu “%s” and use it as the main menu', TD ), setup.menus[ 0 ].name ),
								menus,
								setMenus
							),
						hasDesign &&
							option( __( 'Apply the demo’s design settings (ShapeBlock colors & layout, custom CSS)', TD ), design, setDesign ),
						hasSite &&
							option(
								/* translators: %s: the demo's site title. */
								sprintf( __( 'Use the demo’s site title and tagline (“%s”)', TD ), settings.site.title || settings.site.tagline ),
								site,
								setSite
							)
					),
					phase === 'done' &&
						el(
							Notice,
							{ status: failed ? 'warning' : 'success', isDismissible: false },
							failed
								? /* translators: %d: number of steps that failed. */ sprintf( _n( 'Import finished, but %d step failed.', 'Import finished, but %d steps failed.', failed, TD ), failed )
								: __( 'Import complete. Your new website is ready.', TD )
						),
					el(
						'div',
						{ className: 'sbtl-import__actions' },
						phase === 'choose' &&
							el(
								Fragment,
								null,
								el( Button, { variant: 'tertiary', onClick: onClose }, __( 'Cancel', TD ) ),
								el(
									Button,
									{ variant: 'primary', disabled: ! chosen.length, onClick: run },
									/* translators: %d: number of pages and parts to import. */
									sprintf( _n( 'Import %d item', 'Import %d items', chosen.length, TD ), chosen.length )
								)
							),
						phase === 'running' && el( Button, { variant: 'primary', isBusy: true, disabled: true }, __( 'Importing…', TD ) ),
						phase === 'done' &&
							el(
								Fragment,
								null,
								el( Button, { variant: 'tertiary', href: config.pagesUrl }, __( 'Go to Pages', TD ) ),
								items.some( isPart ) && el( Button, { variant: 'tertiary', href: config.themeBuilder }, __( 'Theme Builder', TD ) ),
								el(
									Button,
									{ variant: 'secondary', href: frontDone ? config.homeUrl : config.pagesUrl, target: frontDone ? '_blank' : undefined },
									frontDone ? __( 'View site', TD ) : __( 'View pages', TD )
								),
								el( Button, { variant: 'primary', onClick: onClose }, __( 'Done', TD ) )
							)
					)
				)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Favourites (this browser only)                                      */
	/* ------------------------------------------------------------------ */

	function readFavourites() {
		try {
			const list = JSON.parse( window.localStorage.getItem( FAVOURITES ) || '[]' );
			return Array.isArray( list ) ? list : [];
		} catch ( e ) {
			return [];
		}
	}

	function useFavourites() {
		const [ list, setList ] = useState( readFavourites );
		function toggle( slug ) {
			const next = list.includes( slug ) ? list.filter( ( s ) => s !== slug ) : list.concat( slug );
			setList( next );
			try {
				window.localStorage.setItem( FAVOURITES, JSON.stringify( next ) );
			} catch ( e ) {}
		}
		return { list, toggle };
	}

	/* ------------------------------------------------------------------ */
	/* Pieces                                                              */
	/* ------------------------------------------------------------------ */

	function StarterCard( { group, favourite, onFavourite, actions } ) {
		const count = group.item_count || 0;
		const cats = TL.groupCategories( group ).map( ( c ) => c.name ).join( ', ' );

		// How far a tall screenshot scrolls on hover: its overflow below the frame.
		function measure( event ) {
			const shot = event.currentTarget.querySelector( '.sbtl-scard__shot' );
			const img = shot && shot.querySelector( 'img' );
			if ( shot && img ) {
				shot.style.setProperty( '--sbtl-scroll', Math.min( 0, shot.clientHeight - img.offsetHeight ) + 'px' );
			}
		}

		return el(
			'li',
			{ className: 'sbtl-scard', onMouseEnter: measure },
			el(
				'div',
				{ className: 'sbtl-scard__frame' },
				el( 'div', { className: 'sbtl-scard__shot' }, el( TL.Thumb, { src: TL.groupImage( group ), alt: '' } ) ),
				( () => {
					const badges = TL.extensionBadges( { group } );
					return badges.length > 0 && el( 'div', { className: 'sbtl-card__badges' }, badges );
				} )(),
				el(
					'div',
					{ className: 'sbtl-scard__overlay' },
					actions.map( ( action, index ) =>
						el(
							Button,
							{
								key: action.key || index,
								className: 'sbtl-card__action is-' + action.variant,
								icon: action.icon,
								href: action.href,
								target: action.href ? '_blank' : undefined,
								rel: action.href ? 'noopener noreferrer' : undefined,
								disabled: action.disabled,
								onClick: action.onClick,
							},
							action.label
						)
					)
				),
				el(
					'button',
					{
						type: 'button',
						className: 'sbtl-heart' + ( favourite ? ' is-on' : '' ),
						'aria-pressed': favourite,
						/* translators: %s: template name. */
						'aria-label': sprintf( favourite ? __( 'Remove %s from favourites', TD ) : __( 'Add %s to favourites', TD ), group.name ),
						onClick: onFavourite,
					},
					el( Icon, { name: 'heart' } )
				)
			),
			el(
				'div',
				{ className: 'sbtl-scard__body' },
				el( 'h3', null, group.name ),
				el(
					'p',
					null,
					/* translators: %d: number of pages and parts in a demo. */
					sprintf( _n( '%d item', '%d items', count, TD ), count ) + ( cats ? ' · ' + cats : '' )
				)
			)
		);
	}

	function CategoryBar( { facets, value, onChange } ) {
		const inline = facets.slice( 0, INLINE_CATEGORIES );
		const rest = facets.slice( INLINE_CATEGORIES );
		const restActive = rest.find( ( c ) => c.slug === value );

		function chip( c ) {
			return el(
				'button',
				{
					key: c.slug || '_all',
					type: 'button',
					className: 'sbtl-cat' + ( value === c.slug ? ' is-active' : '' ),
					'aria-pressed': value === c.slug,
					onClick: () => onChange( c.slug ),
				},
				c.name,
				typeof c.count === 'number' && el( 'span', { className: 'sbtl-cat__count' }, c.count )
			);
		}

		return el(
			'nav',
			{ className: 'sbtl-catbar', 'aria-label': __( 'Categories', TD ) },
			chip( { slug: '', name: __( 'All templates', TD ) } ),
			inline.map( chip ),
			rest.length > 0 &&
				el( Dropdown, {
					className: 'sbtl-cat-more',
					popoverProps: { placement: 'bottom-start' },
					renderToggle: ( { isOpen, onToggle } ) =>
						el(
							'button',
							{ type: 'button', className: 'sbtl-cat' + ( restActive ? ' is-active' : '' ), 'aria-expanded': isOpen, onClick: onToggle },
							restActive ? restActive.name : __( 'More', TD ),
							el( Icon, { name: 'arrow-down-alt2' } )
						),
					renderContent: ( { onClose } ) =>
						el(
							MenuGroup,
							null,
							rest.map( ( c ) =>
								el(
									MenuItem,
									{
										key: c.slug,
										isSelected: value === c.slug,
										suffix: String( c.count ),
										onClick: () => {
											onChange( c.slug );
											onClose();
										},
									},
									c.name
								)
							)
						),
				} )
		);
	}

	/* ------------------------------------------------------------------ */
	/* Page                                                                */
	/* ------------------------------------------------------------------ */

	function StarterPage() {
		const [ category, setCategory ] = useState( '' );
		const [ onlyFavourites, setOnlyFavourites ] = useState( false );
		const [ searchInput, setSearchInput ] = useState( '' );
		const [ reload, setReload ] = useState( 0 );
		const [ preview, setPreview ] = useState( null ); // group
		const [ importing, setImporting ] = useState( null ); // group
		const search = TL.useDebounced( searchInput.trim().toLowerCase(), 200 );
		const favourites = useFavourites();
		const ext = TL.useExtensionState();
		const groups = TL.useFetch( TL.addQueryArgs( '/groups', TL.extensionQuery( ext.state, 'admin' ) ), reload, null );

		// Esc closes the full-screen preview.
		useEffect( () => {
			if ( ! preview ) {
				return undefined;
			}
			const onKey = ( e ) => e.key === 'Escape' && ! importing && setPreview( null );
			document.addEventListener( 'keydown', onKey );
			return () => document.removeEventListener( 'keydown', onKey );
		}, [ preview, importing ] );

		const all = ( groups.data && groups.data.groups ) || [];
		const matchesSearch = ( g ) =>
			! search ||
			g.name.toLowerCase().indexOf( search ) !== -1 ||
			( g.description || '' ).toLowerCase().indexOf( search ) !== -1 ||
			TL.groupCategories( g ).some( ( c ) => c.name.toLowerCase().indexOf( search ) !== -1 );
		const pool = all.filter( ( g ) => ! onlyFavourites || favourites.list.includes( g.slug ) );
		const facets = TL.groupFacets( pool );
		const shown = pool.filter( ( g ) => ( ! category || TL.groupCategories( g ).some( ( c ) => c.slug === category ) ) && matchesSearch( g ) );
		const filtered = category || search || onlyFavourites;

		function resetFilters() {
			setCategory( '' );
			setOnlyFavourites( false );
			setSearchInput( '' );
		}

		function actionsFor( g ) {
			return TL.extensionActions(
				[ { key: 'import', label: __( 'Start Import', TD ), variant: 'light', onClick: () => setImporting( g ) } ].concat(
					TL.groupPreviewUrl( g ) ? [ { key: 'live', label: __( 'Live Preview', TD ), variant: 'dark', onClick: () => setPreview( g ) } ] : []
				),
				{ group: g, screen: 'admin', place: 'card' }
			);
		}

		let body;
		if ( groups.status !== 'ready' || ! shown.length ) {
			body = el(
				'div',
				{ className: 'sbtl-empty' },
				el( TL.StateMessage, {
					status: groups.status,
					error: groups.error,
					empty: onlyFavourites && ! favourites.list.length ? __( 'No favourites yet. Tap the heart on a template to keep it here.', TD ) : __( 'No templates match your filters.', TD ),
					onRetry: () => setReload( reload + 1 ),
				} ),
				groups.status === 'ready' && filtered && el( Button, { variant: 'secondary', onClick: resetFilters }, __( 'Clear filters', TD ) )
			);
		} else {
			body = el(
				'ul',
				{ className: 'sbtl-sgrid' },
				shown.map( ( g ) =>
					el( StarterCard, {
						key: g.slug,
						group: g,
						favourite: favourites.list.includes( g.slug ),
						onFavourite: () => favourites.toggle( g.slug ),
						actions: actionsFor( g ),
					} )
				)
			);
		}

		return el(
			'div',
			{ className: 'sbtl-starter' },
			el(
				'header',
				{ className: 'sbtl-topbar' },
				el(
					'div',
					{ className: 'sbtl-topbar__brand' },
					el( 'span', { className: 'sbtl-topbar__logo' }, config.logo && el( 'img', { src: config.logo, alt: '' } ) ),
					el( 'span', { className: 'sbtl-topbar__name' }, el( 'strong', null, 'ShapeBlock' ), el( 'small', null, __( 'Starter Templates', TD ) ) )
				),
				el(
					'div',
					{ className: 'sbtl-topbar__tools' },
					el( TL.UpgradeLink ),
					el( 'a', { className: 'sbtl-pill is-ghost', href: config.dashboardUrl }, el( Icon, { name: 'arrow-left-alt2' } ), __( 'Back to Dashboard', TD ) ),
					el(
						'button',
						{
							type: 'button',
							className: 'sbtl-iconbtn' + ( onlyFavourites ? ' is-on' : '' ),
							'aria-pressed': onlyFavourites,
							title: __( 'Show favourites', TD ),
							'aria-label': __( 'Show favourites', TD ),
							onClick: () => setOnlyFavourites( ! onlyFavourites ),
						},
						el( Icon, { name: 'heart' } ),
						favourites.list.length > 0 && el( 'span', { className: 'sbtl-iconbtn__dot' }, favourites.list.length )
					),
					el(
						'button',
						{ type: 'button', className: 'sbtl-iconbtn', title: __( 'Refresh templates', TD ), 'aria-label': __( 'Refresh templates', TD ), onClick: () => setReload( reload + 1 ) },
						el( Icon, { name: 'update' } )
					),
					el(
						'span',
						{ className: 'sbtl-count' },
						/* translators: %d: number of templates. */
						sprintf( _n( '%d template', '%d templates', all.length, TD ), all.length )
					),
					el( TL.ExtensionTools, { state: ext.state, setState: ext.setState, screen: 'admin' } )
				)
			),
			el(
				'section',
				{ className: 'sbtl-hero' },
				el( 'span', { className: 'sbtl-hero__eyebrow' }, __( 'Template library', TD ) ),
				el( 'h1', null, __( 'ShapeBlock Starter Templates', TD ) ),
				el( 'p', null, __( 'Complete block websites, free to use. Preview a template, import its pages, header, footer, menu and settings in one click, then make it yours.', TD ) ),
				el(
					'label',
					{ className: 'sbtl-hero__search' },
					el( Icon, { name: 'search' } ),
					el( 'span', { className: 'screen-reader-text' }, __( 'Search templates', TD ) ),
					el( 'input', {
						type: 'search',
						value: searchInput,
						placeholder: __( 'What kind of website are you building?', TD ),
						onChange: ( e ) => setSearchInput( e.target.value ),
					} )
				)
			),
			el(
				'div',
				{ className: 'sbtl-container' },
				facets.length > 0 && el( CategoryBar, { facets, value: category, onChange: setCategory } ),
				groups.status === 'ready' &&
					shown.length > 0 &&
					el(
						'p',
						{ className: 'sbtl-summary' },
						/* translators: %d: number of templates shown. */
						sprintf( _n( '%d template', '%d templates', shown.length, TD ), shown.length ),
						filtered && el( Button, { variant: 'link', onClick: resetFilters }, __( 'Clear filters', TD ) )
					),
				body,
				el( TL.UpgradeBar )
			),
			preview &&
				el(
					'div',
					{ className: 'sbtl-admin__preview', role: 'dialog', 'aria-modal': 'true', 'aria-label': preview.name },
					el( TL.Preview, {
						title: preview.name,
						subtitle: TL.groupCategories( preview ).map( ( c ) => c.name ).join( ', ' ),
						badges: TL.extensionBadges( { group: preview } ),
						url: TL.groupPreviewUrl( preview ),
						image: TL.groupImage( preview ),
						onBack: () => setPreview( null ),
						backLabel: __( 'Back to templates', TD ),
						actions: TL.actionButtons(
							TL.extensionActions(
								[ { key: 'import', label: __( 'Start Import', TD ), icon: 'download', variant: 'light', onClick: () => setImporting( preview ) } ],
								{ group: preview, screen: 'admin', place: 'preview' }
							)
						),
					} )
				),
			importing && el( ImportDialog, { group: importing, onClose: () => setImporting( null ) } )
		);
	}

	function boot() {
		const node = document.getElementById( 'sbtl-starter' );
		if ( ! node ) {
			return;
		}
		if ( createRoot ) {
			createRoot( node ).render( el( StarterPage ) );
		} else {
			render( el( StarterPage ), node );
		}
	}

	if ( wp.domReady ) {
		wp.domReady( boot );
	} else {
		boot();
	}
} )( window.wp, window.shapeblockTL );
