/**
 * ShapeBlock Template Library — shared UI.
 *
 * Data hooks, cards, the category sidebar and the live preview used by both
 * the block editor modal (template-library.js) and the ShapeBlock → Templates
 * dashboard page (template-library-admin.js). Exposed as window.shapeblockTL.
 * Written against the wp.* globals, so no build step.
 */
( function ( wp, config ) {
	'use strict';

	if ( ! wp || ! wp.element || ! wp.components || ! config ) {
		return;
	}

	const { createElement: el, Fragment, useCallback, useEffect, useRef, useState } = wp.element;
	const { Button, Notice, Spinner } = wp.components;
	const { __, _n, sprintf } = wp.i18n;
	const { addQueryArgs } = wp.url;
	const apiFetch = wp.apiFetch;
	const speak = wp.a11y ? wp.a11y.speak : function () {};

	const TD = 'shapeblock';
	const BASE = '/' + config.restPath;
	const PER_PAGE = config.perPage || 24;

	const TYPE_LABELS = {
		template: __( 'Template', TD ),
		page: __( 'Page', TD ),
		pattern: __( 'Section', TD ),
		header: __( 'Header', TD ),
		footer: __( 'Footer', TD ),
	};

	const DEVICES = [
		{ slug: 'desktop', label: __( 'Desktop', TD ), icon: 'desktop', width: '100%' },
		{ slug: 'tablet', label: __( 'Tablet', TD ), icon: 'tablet', width: '768px' },
		{ slug: 'mobile', label: __( 'Mobile', TD ), icon: 'smartphone', width: '390px' },
	];

	function errorMessage( error ) {
		return ( error && error.message ) || __( 'Something went wrong while loading the template library.', TD );
	}

	function readPref( key, fallback ) {
		try {
			const stored = window.localStorage.getItem( key );
			return stored === null ? fallback : stored === '1';
		} catch ( e ) {
			return fallback;
		}
	}

	function writePref( key, value ) {
		try {
			window.localStorage.setItem( key, value ? '1' : '0' );
		} catch ( e ) {}
	}

	/** Categories of a group, taken from its landing item(s). */
	function groupCategories( group ) {
		const seen = {};
		( group.landing || [] ).forEach( ( item ) => {
			( item.categories || [] ).forEach( ( cat ) => {
				seen[ cat.slug ] = cat.name;
			} );
		} );
		return Object.keys( seen ).map( ( slug ) => ( { slug, name: seen[ slug ] } ) );
	}

	/** Sidebar/chip entries with counts for a list of groups. */
	function groupFacets( groups ) {
		const map = {};
		groups.forEach( ( group ) => {
			groupCategories( group ).forEach( ( cat ) => {
				map[ cat.slug ] = map[ cat.slug ] || { slug: cat.slug, name: cat.name, count: 0 };
				map[ cat.slug ].count++;
			} );
		} );
		return Object.keys( map )
			.map( ( slug ) => map[ slug ] )
			.sort( ( a, b ) => a.name.localeCompare( b.name ) );
	}

	function groupImage( group ) {
		const landing = ( group.landing || [] )[ 0 ];
		return group.image || ( landing && landing.thumbnail && ( landing.thumbnail.large || landing.thumbnail.url ) ) || '';
	}

	/**
	 * Where a demo's live preview goes: the group's live demo site, else its
	 * landing item's own preview.
	 */
	function groupPreviewUrl( group ) {
		const landing = ( group.landing || [] )[ 0 ];
		return group.demo_url || ( landing && landing.preview_url ) || '';
	}

	/* ------------------------------------------------------------------ */
	/* Extensions                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * Add-ons register with window.shapeblockTL.extend( {
	 *   tools( { state, setState, screen } ) → element  — shown in the library's toolbar,
	 *   query( state, screen )               → object   — extra query args for the lists,
	 *   badges( { item?, group? } )          → elements — extra badges on cards and previews,
	 *   actions( actions, { item?, group?, screen, place } ) → actions — change the buttons
	 *       of a card (place 'card') or a preview (place 'preview'); each action has a
	 *       `key` ('insert', 'replace', 'preview', 'import', 'view', 'live'),
	 * } ). `state` is a plain object the add-on keeps through setState( patch ).
	 */
	const extensions = [];

	function extend( extension ) {
		if ( extension && typeof extension === 'object' ) {
			extensions.push( extension );
		}
	}

	function useExtensionState() {
		const [ state, setRaw ] = useState( {} );
		const setState = useCallback( ( patch ) => setRaw( ( s ) => ( { ...s, ...patch } ) ), [] );
		return { state, setState };
	}

	function extensionQuery( state, screen ) {
		return extensions.reduce( ( query, ext ) => ( typeof ext.query === 'function' ? { ...query, ...( ext.query( state, screen ) || {} ) } : query ), {} );
	}

	function extensionBadges( subject ) {
		const out = [];
		extensions.forEach( ( ext, i ) => {
			if ( typeof ext.badges === 'function' ) {
				[].concat( ext.badges( subject ) || [] ).forEach( ( badge, j ) => {
					if ( badge ) {
						out.push( el( Fragment, { key: i + '-' + j }, badge ) );
					}
				} );
			}
		} );
		return out;
	}

	function extensionActions( actions, subject ) {
		return extensions.reduce( ( list, ext ) => {
			if ( typeof ext.actions !== 'function' ) {
				return list;
			}
			const next = ext.actions( list.slice(), subject );
			return Array.isArray( next ) ? next : list;
		}, actions );
	}

	/** Preview-bar buttons from a list of actions. */
	function actionButtons( actions ) {
		return actions.map( ( a, i ) =>
			el(
				Button,
				{
					key: a.key || i,
					variant: a.variant === 'light' || a.variant === 'lock' ? 'primary' : 'secondary',
					className: a.variant === 'lock' ? 'sbtl-action-lock' : undefined,
					icon: a.icon,
					href: a.href,
					target: a.href ? '_blank' : undefined,
					rel: a.href ? 'noopener noreferrer' : undefined,
					isBusy: a.busy,
					disabled: a.busy || a.disabled,
					onClick: a.onClick,
				},
				a.label
			)
		);
	}

	function ExtensionTools( { state, setState, screen } ) {
		const tools = extensions
			.map( ( ext, i ) => ( typeof ext.tools === 'function' ? el( Fragment, { key: i }, ext.tools( { state, setState, screen } ) ) : null ) )
			.filter( Boolean );
		return tools.length ? el( 'div', { className: 'sbtl-ext-tools' }, tools ) : null;
	}

	/** A plain "Upgrade to Pro" link, shown while config.upgradeUrl is set (Template_Library::upgrade_notice()). */
	function UpgradeLink() {
		if ( ! config.upgradeUrl ) {
			return null;
		}
		return el( 'a', { className: 'sbtl-upgrade', href: config.upgradeUrl, target: '_blank', rel: 'noopener noreferrer' }, __( 'Upgrade to Pro', TD ) );
	}

	/**
	 * Upgrade bar under the templates, kept in view while they scroll; shown
	 * only while config.upgradeUrl is set (Template_Library::upgrade_notice()).
	 */
	function UpgradeBar() {
		if ( ! config.upgradeUrl ) {
			return null;
		}
		return el(
			'div',
			{ className: 'sbtl-upgrade-wrap' },
			el(
			'div',
			{ className: 'sbtl-upgrade-bar' },
			el( 'span', { className: 'sbtl-upgrade-bar__icon dashicons dashicons-star-filled', 'aria-hidden': 'true' } ),
			el(
				'div',
				{ className: 'sbtl-upgrade-bar__text' },
				el( 'strong', null, __( 'Unlock every Pro template', TD ) ),
				el( 'span', null, __( 'Get all Pro templates, sections, headers and footers, plus the Pro blocks and features.', TD ) )
			),
			el(
				'a',
				{ className: 'sbtl-upgrade-bar__button', href: config.upgradeUrl, target: '_blank', rel: 'noopener noreferrer' },
				__( 'Upgrade to Pro', TD ),
				el( 'span', { className: 'dashicons dashicons-arrow-right-alt', 'aria-hidden': 'true' } )
			)
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Data hooks                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * One paged list (/library) for a type, with load-more. `extra` holds
	 * more query args (from extensions).
	 */
	function usePaged( type, category, extra, search, reload, onMeta ) {
		const extraKey = JSON.stringify( extra || {} );
		const [ state, setState ] = useState( { items: [], facets: [], counts: null, page: 0, totalPages: 1, total: 0, status: 'loading', error: '' } );
		const request = useRef( 0 );
		const metaRef = useRef( onMeta );
		metaRef.current = onMeta;

		const load = useCallback(
			( page ) => {
				if ( ! type ) {
					return;
				}
				const id = ++request.current;
				setState( ( s ) => ( page === 1 ? { ...s, items: [], status: 'loading', error: '' } : { ...s, status: 'loading', error: '' } ) );

				const query = { ...JSON.parse( extraKey ), type, page, per_page: PER_PAGE };
				if ( category ) {
					query.categories = category;
				}
				if ( search ) {
					query.search = search;
				}
				if ( reload && page === 1 ) {
					query.refresh = 1;
				}

				apiFetch( { path: addQueryArgs( BASE + '/library', query ) } )
					.then( ( r ) => {
						if ( id !== request.current ) {
							return;
						}
						metaRef.current && metaRef.current( r );
						const pagination = r.pagination || { page: 1, total_pages: 1, total: ( r.items || [] ).length };
						setState( ( s ) => ( {
							items: page === 1 ? r.items || [] : s.items.concat( r.items || [] ),
							facets: r.categories || [],
							counts: r.counts || null,
							page: pagination.page,
							totalPages: pagination.total_pages,
							total: pagination.total,
							status: 'ready',
							error: '',
						} ) );
						if ( page === 1 ) {
							/* translators: %d: number of templates found. */
							speak( sprintf( _n( '%d item found.', '%d items found.', pagination.total, TD ), pagination.total ) );
						}
					} )
					.catch( ( err ) => {
						if ( id === request.current ) {
							setState( ( s ) => ( { ...s, status: 'error', error: errorMessage( err ) } ) );
						}
					} );
			},
			[ type, category, extraKey, search, reload ]
		);

		useEffect( () => {
			load( 1 );
		}, [ load ] );

		return {
			...state,
			loadMore: () => {
				if ( state.status === 'ready' && state.page < state.totalPages ) {
					load( state.page + 1 );
				}
			},
			retry: () => load( state.items.length ? state.page + 1 : 1 ),
		};
	}

	/** A single GET under the library proxy; path is relative to it. */
	function useFetch( path, reload, onMeta ) {
		const [ state, setState ] = useState( { data: null, status: path ? 'loading' : 'idle', error: '' } );
		const metaRef = useRef( onMeta );
		metaRef.current = onMeta;

		useEffect( () => {
			if ( ! path ) {
				return undefined;
			}
			let active = true;
			setState( { data: null, status: 'loading', error: '' } );
			apiFetch( { path: addQueryArgs( BASE + path, reload ? { refresh: 1 } : {} ) } )
				.then( ( r ) => {
					if ( active ) {
						metaRef.current && metaRef.current( r );
						setState( { data: r, status: 'ready', error: '' } );
					}
				} )
				.catch( ( err ) => {
					if ( active ) {
						setState( { data: null, status: 'error', error: errorMessage( err ) } );
					}
				} );
			return () => {
				active = false;
			};
		}, [ path, reload ] );

		return state;
	}

	function useDebounced( value, delay ) {
		const [ debounced, setDebounced ] = useState( value );
		useEffect( () => {
			const timer = setTimeout( () => setDebounced( value ), delay );
			return () => clearTimeout( timer );
		}, [ value, delay ] );
		return debounced;
	}

	/* ------------------------------------------------------------------ */
	/* Pieces                                                              */
	/* ------------------------------------------------------------------ */

	function Thumb( { src, alt } ) {
		const [ failed, setFailed ] = useState( false );
		const empty = ! src || failed;
		return el( 'img', {
			className: 'sbtl-thumb' + ( empty ? ' is-placeholder' : '' ),
			src: empty ? config.placeholder : src,
			alt: alt || '',
			loading: 'lazy',
			decoding: 'async',
			onError: () => setFailed( true ),
		} );
	}

	function StateMessage( { status, error, empty, onRetry } ) {
		if ( status === 'loading' || status === 'idle' ) {
			return el( 'div', { className: 'sbtl-state' }, el( Spinner ), el( 'p', null, __( 'Loading templates…', TD ) ) );
		}
		if ( status === 'error' ) {
			return el(
				'div',
				{ className: 'sbtl-state' },
				el( Notice, { status: 'error', isDismissible: false }, error ),
				onRetry && el( Button, { variant: 'secondary', onClick: onRetry }, __( 'Try again', TD ) )
			);
		}
		return el( 'div', { className: 'sbtl-state' }, el( 'span', { className: 'dashicons dashicons-search' } ), el( 'p', null, empty ) );
	}

	/** Calls onReach when it scrolls into view (infinite scroll). */
	function Sentinel( { onReach } ) {
		const ref = useRef( null );
		const cb = useRef( onReach );
		cb.current = onReach;

		useEffect( () => {
			if ( ! ref.current || typeof IntersectionObserver === 'undefined' ) {
				return undefined;
			}
			const observer = new IntersectionObserver(
				( entries ) => {
					if ( entries.some( ( entry ) => entry.isIntersecting ) ) {
						cb.current();
					}
				},
				{ rootMargin: '0px 0px 400px 0px' }
			);
			observer.observe( ref.current );
			return () => observer.disconnect();
		}, [] );

		return el( 'div', { ref, className: 'sbtl-sentinel', 'aria-hidden': 'true' } );
	}

	/**
	 * A card: big image that scrolls on hover, actions on a hover overlay,
	 * title (and a small meta line) below.
	 *
	 * actions: [{ label, onClick?, href?, variant: 'light'|'dark', icon?, busy? }]
	 */
	function Card( { title, meta, image, badges, badge, busy, actions, onOpen } ) {
		const extra = badges || [];
		return el(
			'li',
			{ className: 'sbtl-card' + ( busy ? ' is-busy' : '' ) },
			el(
				'div',
				{ className: 'sbtl-card__media' },
				el( Thumb, { src: image, alt: '' } ),
				el(
					'div',
					{ className: 'sbtl-card__overlay', onClick: ( e ) => e.target === e.currentTarget && onOpen && onOpen() },
					actions.map( ( action, index ) =>
						el(
							Button,
							{
								key: index,
								className: 'sbtl-card__action is-' + ( action.variant || 'light' ),
								href: action.href,
								target: action.href ? '_blank' : undefined,
								rel: action.href ? 'noopener noreferrer' : undefined,
								icon: action.icon,
								isBusy: action.busy,
								disabled: action.busy || action.disabled || busy,
								onClick: action.onClick,
							},
							action.label
						)
					)
				),
				( extra.length > 0 || badge ) &&
					el( 'div', { className: 'sbtl-card__badges' }, badge && el( 'span', { className: 'sbtl-badge' }, badge ), extra ),
				busy && el( 'span', { className: 'sbtl-card__busy' }, el( Spinner ) )
			),
			el(
				'div',
				{ className: 'sbtl-card__footer' },
				el( 'h3', { className: 'sbtl-card__title', title }, title ),
				meta && el( 'span', { className: 'sbtl-card__meta' }, meta )
			)
		);
	}

	/** Vertical filter list: All + entries with counts. */
	function SideList( { title, items, value, onChange, allLabel, allCount } ) {
		const rows = [ { slug: '', name: allLabel || __( 'All', TD ), count: allCount } ].concat( items );
		return el(
			'nav',
			{ className: 'sbtl-sidelist', 'aria-label': title },
			title && el( 'p', { className: 'sbtl-sidelist__title' }, title ),
			el(
				'ul',
				null,
				rows.map( ( row ) =>
					el(
						'li',
						{ key: row.slug || '_all' },
						el(
							'button',
							{
								type: 'button',
								className: 'sbtl-sidelist__item' + ( value === row.slug ? ' is-active' : '' ),
								'aria-pressed': value === row.slug,
								disabled: row.count === 0 && value !== row.slug,
								onClick: () => onChange( row.slug ),
							},
							el( 'span', null, row.name ),
							typeof row.count === 'number' && el( 'span', { className: 'sbtl-sidelist__count' }, row.count )
						)
					)
				)
			)
		);
	}

	/** Live preview with device sizes; falls back to the large image. */
	function Preview( { title, subtitle, badges, url, image, actions, onBack, backLabel, notice } ) {
		const [ device, setDevice ] = useState( 'desktop' );
		const [ loaded, setLoaded ] = useState( false );
		const width = DEVICES.find( ( d ) => d.slug === device ).width;

		return el(
			'div',
			{ className: 'sbtl-preview' },
			el(
				'div',
				{ className: 'sbtl-preview__bar' },
				el(
					'div',
					{ className: 'sbtl-preview__start' },
					onBack && el( Button, { icon: 'arrow-left-alt2', onClick: onBack, className: 'sbtl-preview__back' }, backLabel || __( 'Back', TD ) ),
					el( 'strong', { className: 'sbtl-preview__title' }, title ),
					subtitle && el( 'span', { className: 'sbtl-preview__sub' }, subtitle ),
					badges
				),
				url &&
					el(
						'div',
						{ className: 'sbtl-devices', role: 'group', 'aria-label': __( 'Preview size', TD ) },
						DEVICES.map( ( d ) =>
							el( Button, { key: d.slug, icon: d.icon, label: d.label, isPressed: device === d.slug, onClick: () => setDevice( d.slug ) } )
						)
					),
				el(
					'div',
					{ className: 'sbtl-preview__actions' },
					url &&
						el(
							Button,
							{
								variant: 'tertiary',
								icon: 'external',
								iconPosition: 'right',
								href: url,
								target: '_blank',
								rel: 'noopener noreferrer',
								className: 'sbtl-preview__live',
							},
							__( 'Open live site', TD )
						),
					actions
				)
			),
			notice,
			el(
				'div',
				{ className: 'sbtl-preview__frame' },
				url
					? el(
						'div',
						{ className: 'sbtl-preview__device', style: { width } },
						! loaded && el( 'div', { className: 'sbtl-state is-overlay' }, el( Spinner ) ),
						el( 'iframe', {
							src: url,
							/* translators: %s: template name. */
							title: sprintf( __( 'Live preview of %s', TD ), title ),
							onLoad: () => setLoaded( true ),
						} )
					)
					: el( 'div', { className: 'sbtl-preview__image' }, el( Thumb, { src: image, alt: title } ) )
			)
		);
	}

	function Brand( { label } ) {
		return el(
			'div',
			{ className: 'sbtl-brand' },
			config.logo && el( 'img', { src: config.logo, alt: '' } ),
			el( 'span', null, label || __( 'ShapeBlock Library', TD ) )
		);
	}

	window.shapeblockTL = {
		config,
		BASE,
		TD,
		TYPE_LABELS,
		apiFetch,
		addQueryArgs,
		errorMessage,
		readPref,
		writePref,
		groupCategories,
		groupFacets,
		groupImage,
		groupPreviewUrl,
		extend,
		useExtensionState,
		extensionQuery,
		extensionBadges,
		extensionActions,
		actionButtons,
		ExtensionTools,
		UpgradeLink,
		UpgradeBar,
		usePaged,
		useFetch,
		useDebounced,
		Thumb,
		StateMessage,
		Sentinel,
		Card,
		SideList,
		Preview,
		Brand,
		Fragment,
	};
} )( window.wp, window.shapeblockTemplateLibrary );
