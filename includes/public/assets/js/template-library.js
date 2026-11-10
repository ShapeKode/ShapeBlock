/**
 * ShapeBlock Template Library — block editor.
 *
 * Adds a "Templates" button to the editor's top toolbar (and a command to the
 * command palette) that opens the "Import Template" library:
 *
 *   Templates → template groups (one demo each); open one to see its landing
 *               page and every inner page, header and footer that belongs to it
 *   Pages / Sections / Headers / Footers → every item of that type, filtered
 *               by the category list on the left and search
 *
 * Items can be previewed live and inserted after the selected block (or at
 * the end), or replace all content; images can be copied to the Media
 * Library. UI pieces come from template-library-ui.js (window.shapeblockTL).
 */
( function ( wp, TL ) {
	'use strict';

	if ( ! wp || ! TL || ! wp.blocks || ! wp.data ) {
		return;
	}

	const { createElement: el, Fragment, useEffect, useRef, useState, createRoot, render } = wp.element;
	const { Button, Modal, Notice, SearchControl, CheckboxControl, Spinner } = wp.components;
	const { parse, isUnmodifiedDefaultBlock } = wp.blocks;
	const { __, _n, sprintf } = wp.i18n;
	const { config, BASE, TD, TYPE_LABELS, apiFetch, addQueryArgs, errorMessage } = TL;
	const blockEditorStore = 'core/block-editor';

	const OPEN_EVENT = 'shapeblock:template-library';
	const MEDIA_PREF = 'shapeblockTemplateLibraryMedia';

	const TABS = [
		{ slug: 'templates', label: __( 'Templates', TD ) },
		{ slug: 'page', label: __( 'Pages', TD ) },
		{ slug: 'pattern', label: __( 'Sections', TD ) },
		{ slug: 'header', label: __( 'Headers', TD ) },
		{ slug: 'footer', label: __( 'Footers', TD ) },
	];

	/* ------------------------------------------------------------------ */
	/* Inserting                                                           */
	/* ------------------------------------------------------------------ */

	function hasContent() {
		const blocks = wp.data.select( blockEditorStore ).getBlocks();
		return blocks.length > 1 || ( blocks.length === 1 && ! isUnmodifiedDefaultBlock( blocks[ 0 ] ) );
	}

	/**
	 * insert  → after the top-level block holding the selection, or at the end;
	 *           an empty editor's placeholder paragraph is replaced.
	 * replace → all content is replaced.
	 */
	function insertBlocks( blocks, mode ) {
		const select = wp.data.select( blockEditorStore );
		const dispatch = wp.data.dispatch( blockEditorStore );
		const all = select.getBlocks();

		if ( mode === 'replace' ) {
			dispatch.resetBlocks( blocks );
			return;
		}
		if ( all.length === 1 && isUnmodifiedDefaultBlock( all[ 0 ] ) ) {
			dispatch.replaceBlocks( all[ 0 ].clientId, blocks );
			return;
		}
		const selected = select.getSelectedBlockClientId();
		if ( selected ) {
			const top = select.getBlockHierarchyRootClientId( selected );
			dispatch.insertBlocks( blocks, select.getBlockIndex( top ) + 1 );
			return;
		}
		dispatch.insertBlocks( blocks );
	}

	function notify( message ) {
		const notices = wp.data.dispatch( 'core/notices' );
		if ( notices && notices.createSuccessNotice ) {
			notices.createSuccessNotice( message, { type: 'snackbar' } );
		}
	}

	/* ------------------------------------------------------------------ */
	/* Library                                                             */
	/* ------------------------------------------------------------------ */

	function Library( { onClose } ) {
		const [ tab, setTab ] = useState( 'templates' );
		const [ group, setGroup ] = useState( null ); // { slug, name } while a group is open.
		const [ preview, setPreview ] = useState( null );
		const [ category, setCategory ] = useState( '' );
		const [ partType, setPartType ] = useState( '' ); // Type filter inside a group.
		const [ searchInput, setSearchInput ] = useState( '' );
		const [ reload, setReload ] = useState( 0 );
		const [ media, setMedia ] = useState( config.canUpload ? TL.readPref( MEDIA_PREF, true ) : false );
		const [ busyKey, setBusyKey ] = useState( '' );
		const [ insertError, setInsertError ] = useState( null );
		const search = TL.useDebounced( searchInput.trim(), 350 );
		const onMeta = null;
		const contentRef = useRef( null );
		const ext = TL.useExtensionState();
		const extra = TL.extensionQuery( ext.state, 'editor' );

		const isList = tab !== 'templates';

		// Data for the current view.
		const groups = TL.useFetch( ! isList && ! group ? addQueryArgs( '/groups', extra ) : '', reload, onMeta );
		const groupData = TL.useFetch( group ? '/groups/' + encodeURIComponent( group.slug ) : '', reload, onMeta );
		const list = TL.usePaged( isList ? tab : '', category, extra, search, reload, onMeta );

		useEffect( () => {
			if ( contentRef.current ) {
				contentRef.current.scrollTop = 0;
			}
		}, [ tab, group, preview, category ] );

		function changeTab( slug ) {
			setTab( slug );
			setGroup( null );
			setPreview( null );
			setCategory( '' );
			setPartType( '' );
			setSearchInput( '' );
		}

		function openGroup( g ) {
			setGroup( { slug: g.slug, name: g.name } );
			setPartType( '' );
		}

		function insert( item, mode ) {
			if ( mode === 'replace' && hasContent() ) {
				// eslint-disable-next-line no-alert
				if ( ! window.confirm( __( 'Replace all existing content with this template? You can undo it afterwards.', TD ) ) ) {
					return;
				}
			}
			const key = item.type + '-' + item.id;
			setBusyKey( key );
			setInsertError( null );

			apiFetch( { path: addQueryArgs( BASE + '/content/' + item.type + '/' + item.id, media ? { media: 1 } : {} ) } )
				.then( ( r ) => {
					const blocks = parse( r.content || '' );
					if ( ! blocks.length ) {
						throw { message: __( 'This template has no content to insert.', TD ) };
					}
					insertBlocks( blocks, mode );
					setBusyKey( '' );
					onClose();

					const copied = r.media ? r.media.imported : 0;
					notify(
						copied
							? sprintf(
								/* translators: 1: template name, 2: number of images copied. */
								_n( '“%1$s” inserted. %2$d image copied to the Media Library.', '“%1$s” inserted. %2$d images copied to the Media Library.', copied, TD ),
								item.title,
								copied
							)
							: /* translators: %s: template name. */ sprintf( __( '“%s” inserted.', TD ), item.title )
					);
				} )
				.catch( ( err ) => {
					setBusyKey( '' );
					setInsertError( { key, message: errorMessage( err ) } );
					setPreview( item );
				} );
		}

		function itemActions( item, withReplace ) {
			const key = item.type + '-' + item.id;
			const actions = [
				{ key: 'insert', label: __( 'Insert', TD ), icon: 'download', variant: 'light', busy: busyKey === key, onClick: () => insert( item, 'insert' ) },
			];
			if ( withReplace && ( item.type === 'template' || item.type === 'page' ) ) {
				actions.push( { key: 'replace', label: __( 'Replace all content', TD ), variant: 'outline', onClick: () => insert( item, 'replace' ) } );
			} else {
				actions.push( {
					key: 'preview',
					label: __( 'Preview', TD ),
					variant: 'dark',
					onClick: () => {
						setInsertError( null );
						setPreview( item );
					},
				} );
			}
			return TL.extensionActions( actions, { item, screen: 'editor', place: withReplace ? 'preview' : 'card' } );
		}

		function itemCard( item, showType ) {
			const key = item.type + '-' + item.id;
			return el( TL.Card, {
				key,
				title: item.title,
				meta: showType ? TYPE_LABELS[ item.type ] : item.label,
				image: item.thumbnail && ( item.thumbnail.large || item.thumbnail.url ),
				badge: showType && item.is_landing ? __( 'Landing', TD ) : '',
				badges: TL.extensionBadges( { item } ),
				busy: busyKey === key,
				actions: itemActions( item, false ),
				onOpen: () => setPreview( item ),
			} );
		}

		/* ---------- sidebar + content for each view ---------- */

		let sidebar = null;
		let content;
		const needle = search.toLowerCase();

		if ( preview ) {
			const key = preview.type + '-' + preview.id;
			const err = insertError && insertError.key === key ? insertError : null;
			content = el( TL.Preview, {
				title: preview.title,
				subtitle: TYPE_LABELS[ preview.type ],
				badges: TL.extensionBadges( { item: preview } ),
				url: preview.preview_url,
				image: preview.thumbnail && ( preview.thumbnail.large || preview.thumbnail.url ),
				onBack: () => {
					setPreview( null );
					setInsertError( null );
				},
				/* translators: %s: template group name. */
				backLabel: group ? sprintf( __( 'Back to %s', TD ), group.name ) : __( 'Back', TD ),
				notice: err && el( Notice, { status: 'error', isDismissible: false, className: 'sbtl-preview__notice' }, err.message ),
				actions: TL.actionButtons( itemActions( preview, true ) ),
			} );
		} else if ( group ) {
			const g = ( groupData.data && groupData.data.group ) || null;
			const all = g ? ( g.landing || [] ).concat( g.items || [] ) : [];
			const types = [ 'template', 'page', 'header', 'footer', 'pattern' ]
				.map( ( type ) => ( { slug: type, name: TYPE_LABELS[ type ], count: all.filter( ( i ) => i.type === type ).length } ) )
				.filter( ( t ) => t.count > 0 );
			const shown = all.filter( ( i ) => ( ! partType || i.type === partType ) && ( ! needle || i.title.toLowerCase().indexOf( needle ) !== -1 ) );

			sidebar = el( TL.SideList, { title: __( 'Show', TD ), items: types, value: partType, onChange: setPartType, allCount: all.length } );
			content = el(
				Fragment,
				null,
				el(
					'div',
					{ className: 'sbtl-crumb' },
					el( Button, { icon: 'arrow-left-alt2', onClick: () => setGroup( null ) }, __( 'All templates', TD ) ),
					el( 'h2', null, group.name )
				),
				g && g.description && el( 'p', { className: 'sbtl-intro' }, g.description ),
				groupData.status !== 'ready' || ! shown.length
					? el( TL.StateMessage, { status: groupData.status, error: groupData.error, empty: __( 'Nothing matches your search.', TD ) } )
					: el( 'ul', { className: 'sbtl-grid' }, shown.map( ( item ) => itemCard( item, true ) ) )
			);
		} else if ( ! isList ) {
			const list2 = ( groups.data && groups.data.groups ) || [];
			const facets = TL.groupFacets( list2 );
			const shown = list2.filter(
				( g ) =>
					( ! category || TL.groupCategories( g ).some( ( c ) => c.slug === category ) ) &&
					( ! needle || g.name.toLowerCase().indexOf( needle ) !== -1 )
			);

			sidebar = el( TL.SideList, { title: __( 'Categories', TD ), items: facets, value: category, onChange: setCategory, allCount: list2.length } );
			content =
				groups.status !== 'ready' || ! shown.length
					? el( TL.StateMessage, { status: groups.status, error: groups.error, empty: __( 'No templates match your filters.', TD ) } )
					: el(
						'ul',
						{ className: 'sbtl-grid' },
						shown.map( ( g ) => {
							const landing = ( g.landing || [] )[ 0 ];
							const count = g.item_count || 0;
							return el( TL.Card, {
								key: g.slug,
								title: g.name,
								/* translators: %d: number of pages and parts in a template. */
								meta: sprintf( _n( '%d item', '%d items', count, TD ), count ),
								image: TL.groupImage( g ),
								badges: TL.extensionBadges( { group: g } ),
								onOpen: () => openGroup( g ),
								actions: TL.extensionActions(
									[ { key: 'view', label: __( 'View pages', TD ), variant: 'light', onClick: () => openGroup( g ) } ].concat(
										landing && TL.groupPreviewUrl( g )
											? [ { key: 'live', label: __( 'Live Preview', TD ), variant: 'dark', onClick: () => setPreview( { ...landing, preview_url: TL.groupPreviewUrl( g ) } ) } ]
											: []
									),
									{ group: g, screen: 'editor', place: 'card' }
								),
							} );
						} )
					);
		} else {
			const counts = list.counts;
			sidebar = el( TL.SideList, {
				title: __( 'Categories', TD ),
				items: list.facets.map( ( f ) => ( { slug: f.slug, name: f.name, count: f.count } ) ),
				value: category,
				onChange: setCategory,
				allCount: counts ? counts.total : undefined,
			} );
			content = ! list.items.length
				? el( TL.StateMessage, { status: list.status, error: list.error, empty: __( 'No templates match your filters.', TD ), onRetry: list.retry } )
				: el(
					Fragment,
					null,
					el( 'ul', { className: 'sbtl-grid' }, list.items.map( ( item ) => itemCard( item, false ) ) ),
					list.status === 'loading' && el( 'div', { className: 'sbtl-more' }, el( Spinner ) ),
					list.status === 'error' &&
						el(
							'div',
							{ className: 'sbtl-more' },
							el( Notice, { status: 'error', isDismissible: false }, list.error ),
							el( Button, { variant: 'secondary', onClick: list.retry }, __( 'Try again', TD ) )
						),
					list.status === 'ready' && list.page < list.totalPages && el( TL.Sentinel, { onReach: list.loadMore } )
				);
		}

		return el(
			Modal,
			{
				className: 'sbtl-modal',
				overlayClassName: 'sbtl-modal-overlay',
				onRequestClose: onClose,
				__experimentalHideHeader: true,
				shouldCloseOnClickOutside: false,
				title: __( 'Import Template', TD ),
			},
			el(
				'div',
				{ className: 'sbtl-head' },
				el( 'h1', null, __( 'Import Template', TD ) ),
				el(
					'div',
					{ className: 'sbtl-head__tools' },
					el( TL.UpgradeLink ),
					el( Button, { icon: 'update', label: __( 'Refresh library', TD ), onClick: () => setReload( reload + 1 ) } ),
					el( Button, { icon: 'no-alt', label: __( 'Close', TD ), onClick: onClose } )
				)
			),
			el(
				'div',
				{ className: 'sbtl-nav' },
				el( TL.Brand ),
				el(
					'div',
					{ className: 'sbtl-tabs', role: 'tablist', 'aria-label': __( 'Template types', TD ) },
					TABS.map( ( t ) =>
						el(
							'button',
							{
								key: t.slug,
								type: 'button',
								role: 'tab',
								'aria-selected': tab === t.slug,
								className: 'sbtl-tab' + ( tab === t.slug ? ' is-active' : '' ),
								onClick: () => changeTab( t.slug ),
							},
							t.label
						)
					)
				),
				! preview && ! group && el( TL.ExtensionTools, { state: ext.state, setState: ext.setState, screen: 'editor' } ),
				! preview &&
					el( SearchControl, {
						className: 'sbtl-search',
						label: __( 'Search templates', TD ),
						/* translators: %s: tab name, e.g. Sections. */
						placeholder: sprintf( __( 'Search %s…', TD ), TABS.find( ( t ) => t.slug === tab ).label.toLowerCase() ),
						value: searchInput,
						onChange: setSearchInput,
						__nextHasNoMarginBottom: true,
					} )
			),
			el(
				'div',
				{ className: 'sbtl-main' + ( preview ? ' is-preview' : '' ) },
				! preview &&
					el(
						'aside',
						{ className: 'sbtl-side' },
						el( 'div', { className: 'sbtl-side__scroll' }, sidebar ),
						config.canUpload &&
							el(
								'div',
								{ className: 'sbtl-side__foot' },
								el( CheckboxControl, {
									label: __( 'Copy images to Media Library', TD ),
									checked: media,
									onChange: ( value ) => {
										setMedia( value );
										TL.writePref( MEDIA_PREF, value );
									},
									__nextHasNoMarginBottom: true,
								} )
							)
					),
				el( 'section', { className: 'sbtl-content', ref: contentRef }, content, ! preview && el( TL.UpgradeBar ) )
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Mounting                                                            */
	/* ------------------------------------------------------------------ */

	function App() {
		const [ open, setOpen ] = useState( false );
		useEffect( () => {
			const show = () => setOpen( true );
			window.addEventListener( OPEN_EVENT, show );
			return () => window.removeEventListener( OPEN_EVENT, show );
		}, [] );
		return open ? el( Library, { onClose: () => setOpen( false ) } ) : null;
	}

	function openLibrary() {
		window.dispatchEvent( new window.CustomEvent( OPEN_EVENT ) );
	}

	// Lets other code (and ShapeBlock Pro) open the library.
	window.shapeblockOpenTemplateLibrary = openLibrary;

	const TOOLBAR_SELECTORS = [ '.editor-header__toolbar', '.edit-post-header-toolbar', '.edit-site-header-edit-mode__start' ];

	function addToolbarButton() {
		if ( document.querySelector( '.sbtl-toggle' ) ) {
			return;
		}
		let toolbar = null;
		for ( let i = 0; i < TOOLBAR_SELECTORS.length && ! toolbar; i++ ) {
			toolbar = document.querySelector( TOOLBAR_SELECTORS[ i ] );
		}
		if ( ! toolbar ) {
			return;
		}
		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'components-button sbtl-toggle';
		button.setAttribute( 'aria-label', __( 'Open ShapeBlock Templates', TD ) );
		if ( config.logo ) {
			const img = document.createElement( 'img' );
			img.src = config.logo;
			img.alt = '';
			button.appendChild( img );
		}
		const text = document.createElement( 'span' );
		text.textContent = __( 'Templates', TD );
		button.appendChild( text );
		button.addEventListener( 'click', openLibrary );
		toolbar.appendChild( button );
	}

	function registerCommand() {
		const commands = wp.data.dispatch( 'core/commands' );
		if ( ! commands || ! commands.registerCommand ) {
			return;
		}
		commands.registerCommand( {
			name: 'shapeblock/template-library',
			label: __( 'Open ShapeBlock Templates', TD ),
			icon: 'layout',
			callback: ( { close } ) => {
				close();
				openLibrary();
			},
		} );
	}

	function boot() {
		const host = document.createElement( 'div' );
		host.id = 'shapeblock-template-library-root';
		document.body.appendChild( host );
		if ( createRoot ) {
			createRoot( host ).render( el( App ) );
		} else {
			render( el( App ), host );
		}

		// The header is drawn (and redrawn, e.g. when leaving distraction-free
		// mode) by React, so the button is put back whenever it goes missing.
		addToolbarButton();
		let scheduled = false;
		wp.data.subscribe( () => {
			if ( scheduled ) {
				return;
			}
			scheduled = true;
			window.requestAnimationFrame( () => {
				scheduled = false;
				addToolbarButton();
			} );
		} );

		registerCommand();
	}

	if ( wp.domReady ) {
		wp.domReady( boot );
	} else {
		boot();
	}
} )( window.wp, window.shapeblockTL );
