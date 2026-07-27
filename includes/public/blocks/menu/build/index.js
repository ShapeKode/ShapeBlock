/**
 * Editor script for the Easy Elements "Menu" block.
 *
 * Hand-authored (no build step) — uses the wp.* globals directly. The menu is built
 * INSIDE the block (self-contained), so it works with any theme, including block / FSE
 * themes with no "Appearance → Menus" screen.
 *
 * Features: add items + dropdown sub-items, page/URL search, per-item description,
 * open-in-new-tab, layout / alignment / gap / colors, and a responsive mobile menu.
 */
( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.blocks ) {
		return;
	}

	var el                = wp.element.createElement;
	var Fragment          = wp.element.Fragment;
	var useState          = wp.element.useState;
	var useEffect         = wp.element.useEffect;
	var __                = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps      = wp.blockEditor.useBlockProps;
	var RichText          = wp.blockEditor.RichText;
	var MediaUpload       = wp.blockEditor.MediaUpload;
	var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
	var PanelColorSettings = wp.blockEditor.PanelColorSettings;
	var ColorPalette      = wp.blockEditor.ColorPalette || wp.components.ColorPalette;
	var PanelBody         = wp.components.PanelBody;
	var SelectControl     = wp.components.SelectControl;
	var TextControl       = wp.components.TextControl;
	var ToggleControl     = wp.components.ToggleControl;
	var CheckboxControl   = wp.components.CheckboxControl;
	var TabPanel          = wp.components.TabPanel;
	var ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
	var ToggleGroupOption  = wp.components.__experimentalToggleGroupControlOptionIcon;
	var ToggleGroupOptionText = wp.components.__experimentalToggleGroupControlOption;

	// Segmented toggle-group control ( falls back to a select if the component is unavailable ).
	function eelfgToggleGroup( props ) {
		if ( ToggleGroupControl && ToggleGroupOptionText ) {
			return el( ToggleGroupControl, { label: props.label, value: props.value, isBlock: true, help: props.help, onChange: props.onChange },
				props.options.map( function ( o ) { return el( ToggleGroupOptionText, { key: o.value, value: o.value, label: o.label } ); } ) );
		}
		return el( wp.components.SelectControl, { label: props.label, value: props.value, options: props.options, help: props.help, onChange: props.onChange } );
	}

	// Small stroke icons for the icon-based Orientation / Justification controls.
	function eelfgSvgEl( paths ) {
		return el( 'svg', { width: 24, height: 24, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', stroke: 'currentColor', 'strokeWidth': 1.8, 'strokeLinecap': 'round', 'strokeLinejoin': 'round' },
			paths.map( function ( d, k ) { return el( 'path', { key: k, d: d } ); } ) );
	}
	var EELFG_UI_ICONS = {
		horizontal: eelfgSvgEl( [ 'M4 12h13', 'M13 7l5 5-5 5' ] ),
		vertical:   eelfgSvgEl( [ 'M12 4v13', 'M7 13l5 5 5-5' ] ),
		alignLeft:  eelfgSvgEl( [ 'M4 7h10', 'M4 12h16', 'M4 17h10' ] ),
		alignCenter: eelfgSvgEl( [ 'M7 7h10', 'M4 12h16', 'M7 17h10' ] ),
		alignRight: eelfgSvgEl( [ 'M10 7h10', 'M4 12h16', 'M10 17h10' ] )
	};
	var RangeControl      = wp.components.RangeControl;
	var Button            = wp.components.Button;
	var Dropdown          = wp.components.Dropdown;
	var Spinner           = wp.components.Spinner;
	var apiFetch          = wp.apiFetch;

	// Shared inline SVG icons ( identical markup to render.php's eelfg_menu_icon_svg ).
	var EELFG_SVG_OPEN = '<svg class="eelfg-menu-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"';
	var EELFG_SVG_LINE = ' fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
	var EELFG_SVG = {
		'caret':         EELFG_SVG_OPEN + ' fill="currentColor"><path d="M8 11 3.6 6.2h8.8z"/></svg>',
		'chevron-down':  EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="m4 6 4 4 4-4"/></svg>',
		'arrow-down':    EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M8 3.5v9"/><path d="m4.5 9 3.5 3.5L11.5 9"/></svg>',
		'plus':          EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M8 3.5v9"/><path d="M3.5 8h9"/></svg>',
		'arrow-right':   EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M3.5 8h9"/><path d="M9 4.5 12.5 8 9 11.5"/></svg>',
		'chevron-right': EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="m6 4 4 4-4 4"/></svg>',
		'external':      EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M6.5 3.5H3.5v9h9v-3"/><path d="M9.5 3.5h3v3"/><path d="M12.5 3.5 7.5 8.5"/></svg>',
		'star':          EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M8 2.5 9.7 6l3.8.5-2.8 2.7.7 3.8L8 11.7 4.6 13l.7-3.8L2.5 6.5 6.3 6z"/></svg>',
		'heart':         EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M8 13.3S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.3 8 13.3z"/></svg>',
		'check':         EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="m3.5 8.5 3 3 6-7"/></svg>',
		'home':          EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M3 8l5-4.5L13 8"/><path d="M4.5 7v6h7V7"/></svg>',
		'user':          EELFG_SVG_OPEN + EELFG_SVG_LINE + '><circle cx="8" cy="6" r="2.5"/><path d="M3.5 13c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4"/></svg>',
		'cart':          EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M2.5 3h1.5l1.1 7h6.2l1.2-5H4.6"/><circle cx="6.5" cy="12.5" r="0.9"/><circle cx="11" cy="12.5" r="0.9"/></svg>',
		'search':        EELFG_SVG_OPEN + EELFG_SVG_LINE + '><circle cx="7" cy="7" r="3.5"/><path d="m12.5 12.5-2.8-2.8"/></svg>',
		'phone':         EELFG_SVG_OPEN + EELFG_SVG_LINE + '><path d="M4 3h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5l1-1.5 3 1v2c0 .6-.5 1.1-1.1 1A9.4 9.4 0 0 1 3 4.1C2.9 3.5 3.4 3 4 3z"/></svg>',
		'envelope':      EELFG_SVG_OPEN + EELFG_SVG_LINE + '><rect x="2.5" y="4" width="11" height="8" rx="1"/><path d="m3 4.5 5 4 5-4"/></svg>'
	};
	// Built-in icon choices offered per item ( value = EELFG_SVG key ).
	var EELFG_ICON_CHOICES = [
		{ label: 'Arrow', value: 'arrow-right' },
		{ label: 'Chevron', value: 'chevron-right' },
		{ label: 'Plus', value: 'plus' },
		{ label: 'External link', value: 'external' },
		{ label: 'Star', value: 'star' },
		{ label: 'Heart', value: 'heart' },
		{ label: 'Check', value: 'check' },
		{ label: 'Home', value: 'home' },
		{ label: 'User', value: 'user' },
		{ label: 'Cart', value: 'cart' },
		{ label: 'Search', value: 'search' },
		{ label: 'Phone', value: 'phone' },
		{ label: 'Mail', value: 'envelope' }
	];
	// Effective icon type for an item ( supports old image-only data ).
	function eelfgItemType( item ) {
		if ( item.iconType ) { return item.iconType; }
		if ( item.iconUrl ) { return 'image'; }
		if ( item.iconName ) { return 'icon'; }
		return 'none';
	}

	// Map the dropdown-indicator choice to an SVG key ( '' = no indicator ).
	function eelfgDropdownKey( v ) {
		if ( 'chevron' === v ) { return 'chevron-down'; }
		if ( 'arrow' === v ) { return 'arrow-down'; }
		if ( 'plus' === v ) { return 'plus'; }
		if ( 'none' === v ) { return ''; }
		return 'caret';
	}
	// Map a per-item icon choice to an SVG key ( '' = no icon ).
	function eelfgItemKey( v ) {
		if ( 'arrow' === v ) { return 'arrow-right'; }
		if ( 'chevron' === v ) { return 'chevron-right'; }
		if ( 'plus' === v ) { return 'plus'; }
		if ( 'external' === v ) { return 'external'; }
		return '';
	}

	var TD = 'easy-elements-for-gutenberg';

	// Switch WordPress's own editor preview ( canvas ) to Desktop / Tablet / Mobile width.
	function eelfgSetPreview( d ) {
		var type = ( 'tablet' === d ) ? 'Tablet' : ( ( 'mobile' === d ) ? 'Mobile' : 'Desktop' );
		if ( ! window.wp || ! wp.data ) { return; }
		try {
			var ed = wp.data.dispatch( 'core/editor' );
			if ( ed && ed.setDeviceType ) { ed.setDeviceType( type ); return; }
		} catch ( e ) {}
		try {
			var ep = wp.data.dispatch( 'core/edit-post' );
			if ( ep && ep.__experimentalSetPreviewDeviceType ) { ep.__experimentalSetPreviewDeviceType( type ); return; }
		} catch ( e ) {}
		try {
			var es = wp.data.dispatch( 'core/edit-site' );
			if ( es && es.__experimentalSetPreviewDeviceType ) { es.__experimentalSetPreviewDeviceType( type ); }
		} catch ( e ) {}
	}

	// Font-family stacks ( key → CSS ), mirrored in render.php for safe output.
	var EELFG_FONTS = {
		system:    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
		arial:     'Arial,Helvetica,sans-serif',
		helvetica: '"Helvetica Neue",Helvetica,Arial,sans-serif',
		georgia:   'Georgia,"Times New Roman",serif',
		times:     '"Times New Roman",Times,serif',
		courier:   '"Courier New",Courier,monospace',
		verdana:   'Verdana,Geneva,sans-serif',
		tahoma:    'Tahoma,Geneva,sans-serif'
	};

	var plusIcon = el(
		'svg',
		{ width: 18, height: 18, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true', focusable: 'false' },
		el( 'path', { d: 'M12 5v14M5 12h14', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' } )
	);

	var menuIcon = el(
		'svg',
		{ width: 24, height: 24, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
		el( 'rect', { x: 3, y: 5, width: 18, height: 2.5, rx: 1.25, fill: '#a216ff' } ),
		el( 'rect', { x: 3, y: 10.75, width: 18, height: 2.5, rx: 1.25, fill: '#a216ff', opacity: 0.6 } ),
		el( 'rect', { x: 3, y: 16.5, width: 12, height: 2.5, rx: 1.25, fill: '#a216ff', opacity: 0.6 } )
	);

	/**
	 * Popover content: a search field that lists pages / posts and accepts any URL.
	 * props.onPick( { url, title } ) fires on choose.
	 */
	function eelfgPathFromUrl( u ) {
		try {
			return new URL( u, window.location.origin ).pathname || u;
		} catch ( e ) {
			return u;
		}
	}

	function AddMenuSearch( props ) {
		var viewState     = useState( 'main' );
		var view          = viewState[ 0 ];
		var setView       = viewState[ 1 ];
		var titleState    = useState( '' );
		var newTitle      = titleState[ 0 ];
		var setNewTitle   = titleState[ 1 ];
		var publishState  = useState( true );
		var publish       = publishState[ 0 ];
		var setPublish    = publishState[ 1 ];
		var qState        = useState( '' );
		var q             = qState[ 0 ];
		var setQ          = qState[ 1 ];
		var resultsState  = useState( [] );
		var results       = resultsState[ 0 ];
		var setResults    = resultsState[ 1 ];
		var loadingState  = useState( true );
		var loading       = loadingState[ 0 ];
		var setLoading    = loadingState[ 1 ];
		var creatingState = useState( false );
		var creating      = creatingState[ 0 ];
		var setCreating   = creatingState[ 1 ];

		useEffect( function () {
			var query     = q.trim();
			var cancelled = false;
			setLoading( true );
			var path = query
				? '/wp/v2/search?search=' + encodeURIComponent( query ) + '&per_page=8&_fields=title,url,subtype'
				: '/wp/v2/pages?per_page=8&_fields=id,title,link&orderby=title&order=asc';

			apiFetch( { path: path } )
				.then( function ( res ) {
					if ( cancelled ) { return; }
					setResults( ( res || [] ).map( function ( r ) {
						return {
							title: ( r.title && ( r.title.rendered || r.title ) ) || r.url || r.link || '',
							url: r.url || r.link || '',
							subtype: r.subtype || 'page'
						};
					} ) );
					setLoading( false );
				} )
				.catch( function () { if ( ! cancelled ) { setResults( [] ); setLoading( false ); } } );

			return function () { cancelled = true; };
		}, [ q ] );

		var trimmed   = q.trim();
		var hasScheme = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test( trimmed );
		// Also treat a bare domain like "example.com" or "example.com/path" as a URL.
		var isUrl     = hasScheme || /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test( trimmed );

		// Add a scheme to a bare domain so the link works ( external links default to https ).
		function normalizeUrl( u ) {
			u = ( '' + u ).trim();
			return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test( u ) ? u : ( 'https://' + u );
		}

		function useTypedUrl() {
			if ( trimmed ) {
				var u = normalizeUrl( trimmed );
				props.onPick( { url: u, title: u } );
			}
		}

		// Open the "Create page" sub-panel, pre-filling the title from what was typed.
		function openCreate() {
			setNewTitle( isUrl ? '' : trimmed );
			setView( 'create' );
		}

		// Actually create the page ( published or draft ) and use it as the link.
		function doCreate() {
			var t = newTitle.trim();
			if ( ! t || creating ) { return; }
			setCreating( true );
			apiFetch( { path: '/wp/v2/pages', method: 'POST', data: { title: t, status: publish ? 'publish' : 'draft' } } )
				.then( function ( page ) {
					setCreating( false );
					var url = page.link || '';
					// A draft returns "?page_id=X" — build the clean /slug/ permalink instead.
					if ( page.slug && /[?&](page_id|p)=/.test( url ) ) {
						try { url = new URL( page.link ).origin + '/' + page.slug + '/'; } catch ( e ) {}
					}
					props.onPick( { url: url, title: ( page.title && ( page.title.rendered || page.title ) ) || t } );
				} )
				.catch( function () { setCreating( false ); } );
		}

		// ---- "Create page" sub-panel ( title + publish toggle ), like core Navigation ----
		if ( 'create' === view ) {
			return el( 'div', { className: 'eelfg-menu-add-search eelfg-menu-add-createview' },
				el( Button, { className: 'eelfg-menu-add-back', icon: 'arrow-left-alt2', onClick: function () { setView( 'main' ); } }, __( 'Back', TD ) ),
				el( TextControl, { label: __( 'Title', TD ), value: newTitle, placeholder: __( 'No title', TD ), onChange: setNewTitle, autoComplete: 'off' } ),
				el( CheckboxControl, {
					label: __( 'Publish', TD ),
					help: __( 'Turn off to save as a draft. Drafts won’t appear on your site until published.', TD ),
					checked: publish,
					onChange: setPublish
				} ),
				el( 'div', { className: 'eelfg-menu-add-actions' },
					el( Button, { variant: 'tertiary', onClick: function () { setView( 'main' ); } }, __( 'Cancel', TD ) ),
					el( Button, { variant: 'primary', onClick: doCreate, disabled: creating || ! newTitle.trim() }, creating ? el( Spinner, {} ) : __( 'Create page', TD ) )
				)
			);
		}

		var rows = [];

		// Row: use the typed URL directly.
		if ( isUrl ) {
			rows.push( el( 'li', { key: 'url', className: 'eelfg-menu-add-row' },
				el( Button, { className: 'eelfg-menu-add-result', onClick: useTypedUrl },
					el( 'span', { className: 'dashicons dashicons-admin-links' } ),
					el( 'span', { className: 'eelfg-menu-add-result-text' },
						el( 'span', { className: 'eelfg-menu-add-result-title' }, __( 'Link to URL', TD ) ),
						el( 'span', { className: 'eelfg-menu-add-result-sub' }, normalizeUrl( trimmed ) )
					)
				)
			) );
		}

		// Search results ( each with its path / slug ).
		if ( loading ) {
			rows.push( el( 'li', { key: 'loading', className: 'eelfg-menu-add-row eelfg-menu-add-loading' }, el( Spinner, {} ) ) );
		} else {
			results.forEach( function ( r, idx ) {
				rows.push( el( 'li', { key: 'r' + idx, className: 'eelfg-menu-add-row' },
					el( Button, { className: 'eelfg-menu-add-result', onClick: function () { props.onPick( { url: r.url, title: r.title } ); } },
						el( 'span', { className: 'dashicons dashicons-admin-page' } ),
						el( 'span', { className: 'eelfg-menu-add-result-text' },
							el( 'span', { className: 'eelfg-menu-add-result-title' }, r.title ),
							el( 'span', { className: 'eelfg-menu-add-result-sub' }, eelfgPathFromUrl( r.url ) )
						)
					)
				) );
			} );
			if ( ! results.length && ! isUrl ) {
				rows.push( el( 'li', { key: 'empty', className: 'eelfg-menu-add-row eelfg-menu-add-empty' }, __( 'No pages match. Type a URL to link directly.', TD ) ) );
			}
		}

		// Always-visible "Create page" row — opens the title + publish sub-panel.
		rows.push( el( 'li', { key: 'create', className: 'eelfg-menu-add-row eelfg-menu-add-create' },
			el( Button, { className: 'eelfg-menu-add-result', onClick: openCreate },
				el( 'span', { className: 'dashicons dashicons-plus-alt2' } ),
				el( 'span', {}, __( 'Create page', TD ) )
			)
		) );


		return el( 'div', { className: 'eelfg-menu-add-search' },
			el( 'div', { className: 'eelfg-menu-add-input' },
				el( TextControl, { value: q, placeholder: __( 'Search or type a URL…', TD ), onChange: setQ, autoComplete: 'off', onKeyDown: function ( e ) {
					if ( 'Enter' === e.key ) {
						e.preventDefault();
						if ( isUrl ) { useTypedUrl(); }
						else if ( results.length ) { props.onPick( { url: results[0].url, title: results[0].title } ); }
					}
				} } ),
				isUrl ? el( Button, { className: 'eelfg-menu-add-go', icon: 'arrow-right-alt2', label: __( 'Use URL', TD ), onClick: useTypedUrl } ) : null
			),
			el( 'ul', { className: 'eelfg-menu-add-results' }, rows )
		);
	}

	/**
	 * A link field: shows the current link and opens the search popover to change it.
	 * props: url, onPick( { url, title } ).
	 */
	function LinkPicker( props ) {
		return el( Dropdown, {
			className: 'eelfg-menu-linkpicker',
			popoverProps: { className: 'eelfg-menu-add-pop', placement: 'bottom-start' },
			renderToggle: function ( t ) {
				return el( Button, {
					variant: 'secondary',
					className: 'eelfg-menu-linkpicker-btn',
					onClick: t.onToggle,
					'aria-expanded': t.isOpen
				}, props.url ? props.url : __( 'Set link…', TD ) );
			},
			renderContent: function ( c ) {
				return el( AddMenuSearch, { url: props.url, onPick: function ( v ) { props.onPick( v || {} ); c.onClose(); } } );
			}
		} );
	}

	function colorRow( label, value, onChange ) {
		return el(
			'div',
			{ className: 'eelfg-menu-color-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
			el( 'span', {}, label ),
			el( 'span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
				el( 'input', { type: 'color', value: value || '#000000', onChange: function ( e ) { onChange( e.target.value ); } } ),
				value ? el( Button, { variant: 'link', onClick: function () { onChange( '' ); } }, __( 'Clear', TD ) ) : null
			)
		);
	}

	registerBlockType( 'easy-elements-for-gutenberg/menu', {
		icon: menuIcon,
		edit: function ( props ) {
			var attributes    = props.attributes;
			var setAttributes = props.setAttributes;
			var items         = Array.isArray( attributes.items ) ? attributes.items : [];

			// Editor-only device preview for the responsive spacing controls.
			var deviceState = useState( 'desktop' );
			var device      = deviceState[0];
			var setDevice   = deviceState[1];

			// Editor-only: which colour state ( text / hover / active ) is being edited.
			var colorStateState = useState( 'text' );
			var colorState      = colorStateState[0];
			var setColorState   = colorStateState[1];

			// Editor-only: is the mobile-menu preview open ( hamburger toggled )?
			var openPrevState  = useState( false );
			var isOpenPreview  = openPrevState[0];
			var setOpenPreview = openPrevState[1];

			// Editor-only: which parent submenus are expanded in the mobile drawer preview.
			var openSubsState = useState( {} );
			var openSubs      = openSubsState[0];
			var setOpenSubs   = openSubsState[1];
			function toggleSubOpen( k ) { var o = Object.assign( {}, openSubs ); o[ k ] = ! o[ k ]; setOpenSubs( o ); }

			// Effective overlay mode + whether the selected device shows the drawer ( used by renderLi ).
			var mobileMode = attributes.mobileMode || ( false === attributes.mobileEnable ? 'off' : 'mobile' );
			var edBreak    = attributes.mobileBreakpoint || 782;
			var edDevW     = ( 'mobile' === device ) ? 360 : ( ( 'tablet' === device ) ? 780 : 9999 );
			var showDrawer = ( 'always' === mobileMode ) || ( 'mobile' === mobileMode && edDevW <= edBreak );


			function clone() { return JSON.parse( JSON.stringify( items ) ); }
			function commit( next ) { setAttributes( { items: next } ); }

			function blankItem() { return { label: __( 'New Item', TD ), url: '#', description: '', newTab: false, children: [] }; }
			function blankChild() { return { label: __( 'Sub Item', TD ), url: '#', description: '', newTab: false }; }

			function addItem() { var n = clone(); n.push( blankItem() ); commit( n ); }
			function addLinkItem( v ) {
				v = v || {};
				var n = clone();
				var it = blankItem();
				it.url = v.url || '#';
				it.label = v.title || __( 'New Item', TD );
				n.push( it );
				commit( n );
			}
			function updateItem( i, patch ) { var n = clone(); n[ i ] = Object.assign( {}, n[ i ], patch ); commit( n ); }
			function removeItem( i ) { var n = clone(); n.splice( i, 1 ); commit( n ); }
			function moveItem( i, dir ) { var n = clone(); var j = i + dir; if ( j < 0 || j >= n.length ) { return; } var t = n[ i ]; n[ i ] = n[ j ]; n[ j ] = t; commit( n ); }
			function addChild( i ) { var n = clone(); if ( ! Array.isArray( n[ i ].children ) ) { n[ i ].children = []; } n[ i ].children.push( blankChild() ); commit( n ); }
			function addChildLink( i, v ) {
				v = v || {};
				var n = clone();
				if ( ! Array.isArray( n[ i ].children ) ) { n[ i ].children = []; }
				var c = blankChild();
				if ( v.url ) { c.url = v.url; }
				if ( v.title ) { c.label = v.title; }
				n[ i ].children.push( c );
				commit( n );
			}
			function updateChild( i, ci, patch ) { var n = clone(); n[ i ].children[ ci ] = Object.assign( {}, n[ i ].children[ ci ], patch ); commit( n ); }
			function removeChild( i, ci ) { var n = clone(); n[ i ].children.splice( ci, 1 ); commit( n ); }

			// ---- Inspector: Menu Items ----
			var itemEditors = items.map( function ( item, i ) {
				var childEditors = ( item.children || [] ).map( function ( child, ci ) {
					return el(
						'div',
						{ key: 'c' + ci, className: 'eelfg-menu-item-editor is-child' },
						el( TextControl, { label: __( 'Sub Label', TD ), value: child.label || '', onChange: function ( v ) { updateChild( i, ci, { label: v } ); } } ),
						el( 'div', { className: 'eelfg-menu-field' },
							el( 'div', { className: 'eelfg-menu-linkfield-label' }, __( 'Sub Link', TD ) ),
							el( LinkPicker, { url: child.url, onPick: function ( v ) {
								var patch = { url: v.url || '' };
								if ( ( ! child.label || child.label === __( 'Sub Item', TD ) ) && v.title ) { patch.label = v.title; }
								updateChild( i, ci, patch );
							} } )
						),
						el( TextControl, { label: __( 'Description', TD ), value: child.description || '', onChange: function ( v ) { updateChild( i, ci, { description: v } ); } } ),
						el( ToggleControl, { label: __( 'Open in new tab', TD ), checked: !! child.newTab, onChange: function ( v ) { updateChild( i, ci, { newTab: v } ); } } ),
						el( Button, { isDestructive: true, variant: 'link', onClick: function () { removeChild( i, ci ); } }, __( 'Remove sub-item', TD ) )
					);
				} );

				return el(
					PanelBody,
					{
						key: 'i' + i,
						className: 'eelfg-menu-item-panel',
						title: ( item.label && item.label.trim() ) ? item.label.trim() : __( 'Untitled', TD ),
						initialOpen: false
					},
					el( TextControl, { label: __( 'Label', TD ), value: item.label || '', onChange: function ( v ) { updateItem( i, { label: v } ); } } ),
					el( 'div', { className: 'eelfg-menu-field' },
						el( 'div', { className: 'eelfg-menu-linkfield-label' }, __( 'Link', TD ) ),
						el( LinkPicker, { url: item.url, onPick: function ( v ) {
							var patch = { url: v.url || '' };
							if ( ( ! item.label || item.label === __( 'New Item', TD ) ) && v.title ) { patch.label = v.title; }
							updateItem( i, patch );
						} } )
					),
					el( TextControl, { label: __( 'Description', TD ), value: item.description || '', onChange: function ( v ) { updateItem( i, { description: v } ); } } ),
					el( ToggleControl, { label: __( 'Open in new tab', TD ), checked: !! item.newTab, onChange: function ( v ) { updateItem( i, { newTab: v } ); } } ),
					// --- Icon: toggle on, then pick a built-in icon OR upload an image ---
					el( 'div', { className: 'eelfg-menu-field' },
						el( ToggleControl, {
							label: __( 'Icon', TD ),
							checked: 'none' !== eelfgItemType( item ),
							onChange: function ( v ) { updateItem( i, { iconType: v ? ( ( item.iconType && 'none' !== item.iconType ) ? item.iconType : 'icon' ) : 'none' } ); }
						} ),
						( 'none' !== eelfgItemType( item ) ) ? el( SelectControl, {
							label: __( 'Type', TD ),
							value: 'image' === eelfgItemType( item ) ? 'image' : 'icon',
							options: [ { label: __( 'Icon', TD ), value: 'icon' }, { label: __( 'Image', TD ), value: 'image' } ],
							onChange: function ( v ) { updateItem( i, { iconType: v } ); }
						} ) : null,
						( 'icon' === eelfgItemType( item ) ) ? el( 'div', { className: 'eelfg-menu-icon-picker' },
							( item.iconName && EELFG_SVG[ item.iconName ] ) ? el( 'span', { className: 'eelfg-menu-icon-preview', dangerouslySetInnerHTML: { __html: EELFG_SVG[ item.iconName ] } } ) : null,
							el( SelectControl, {
								value: item.iconName || 'arrow-right',
								options: EELFG_ICON_CHOICES,
								onChange: function ( v ) { updateItem( i, { iconName: v } ); }
							} )
						) : null,
						( 'image' === eelfgItemType( item ) ) ? el( 'div', { className: 'eelfg-menu-icon-picker' },
							item.iconUrl ? el( 'span', { className: 'eelfg-menu-icon-thumb' }, el( 'img', { src: item.iconUrl, alt: '' } ) ) : null,
							el( MediaUploadCheck, {},
								el( MediaUpload, {
									allowedTypes: [ 'image' ],
									value: item.iconId,
									onSelect: function ( m ) { updateItem( i, { iconUrl: m.url, iconId: m.id } ); },
									render: function ( o ) {
										return el( Button, { variant: 'secondary', onClick: o.open }, item.iconUrl ? __( 'Replace', TD ) : __( 'Upload image', TD ) );
									}
								} )
							),
							item.iconUrl ? el( Button, { variant: 'link', isDestructive: true, onClick: function () { updateItem( i, { iconUrl: '', iconId: 0 } ); } }, __( 'Remove', TD ) ) : null
						) : null,
						( 'none' !== eelfgItemType( item ) ) ? el( SelectControl, {
							label: __( 'Icon Side', TD ),
							value: 'left' === item.iconSide ? 'left' : 'right',
							options: [ { label: __( 'Right', TD ), value: 'right' }, { label: __( 'Left', TD ), value: 'left' } ],
							onChange: function ( v ) { updateItem( i, { iconSide: v } ); }
						} ) : null
					),
					// --- Dropdown items ---
					el( 'div', { className: 'eelfg-menu-subsection' },
						el( 'div', { className: 'eelfg-menu-section-label' }, __( 'Dropdown items', TD ) ),
						childEditors,
						el( Button, { variant: 'secondary', className: 'eelfg-menu-add-child', onClick: function () { addChild( i ); } }, __( '+ Add dropdown item', TD ) )
					),
					// --- Actions ---
					el(
						'div',
						{ className: 'eelfg-menu-item-actions' },
						el( Button, { variant: 'tertiary', onClick: function () { moveItem( i, -1 ); }, disabled: 0 === i }, '↑' ),
						el( Button, { variant: 'tertiary', onClick: function () { moveItem( i, 1 ); }, disabled: i === items.length - 1 }, '↓' ),
						el( Button, { isDestructive: true, variant: 'link', onClick: function () { removeItem( i ); } }, __( 'Remove item', TD ) )
					)
				);
			} );

			// Each item is its own collapsible panel ( titled with the item's name ); an "Add Item"
			// button under the list opens the same page / URL / Create-page popover as the canvas "+".
			var addItemEl = el( 'div', { className: 'eelfg-menu-additem-row' },
				el( Dropdown, {
					className: 'eelfg-menu-additem-dropdown',
					popoverProps: { className: 'eelfg-menu-add-pop', placement: 'bottom-start' },
					renderToggle: function ( t ) {
						return el( Button, { variant: 'primary', onClick: t.onToggle, 'aria-expanded': t.isOpen }, __( '+ Add Item', TD ) );
					},
					renderContent: function ( c ) {
						return el( AddMenuSearch, { onPick: function ( v ) { addLinkItem( v ); c.onClose(); } } );
					}
				} )
			);

			// Dropdown settings ( always available in the Settings tab ).
			var dropdownPanel = el(
				PanelBody,
				{ title: __( 'Dropdown', TD ), initialOpen: false },
				eelfgToggleGroup( {
					label: __( 'Submenu Visibility', TD ),
					help: __( 'How the dropdown opens on the live site ( and in this preview ). Edit dropdown items from each item panel under Menu.', TD ),
					value: 'click' === attributes.submenuTrigger ? 'click' : 'hover',
					options: [ { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Click', TD ), value: 'click' } ],
					onChange: function ( v ) { setAttributes( { submenuTrigger: v } ); }
				} ),
				eelfgToggleGroup( {
					label: __( 'Dropdown Icon', TD ),
					help: __( 'Indicator shown next to items that have a dropdown.', TD ),
					value: attributes.dropdownIcon || 'caret',
					options: [
						{ label: __( 'Caret', TD ), value: 'caret' },
						{ label: __( 'Chevron', TD ), value: 'chevron' },
						{ label: __( 'Arrow', TD ), value: 'arrow' },
						{ label: __( 'Plus', TD ), value: 'plus' },
						{ label: __( 'None', TD ), value: 'none' }
					],
					onChange: function ( v ) { setAttributes( { dropdownIcon: v } ); }
				} )
			);

			// ---- Inspector: Layout & Style ----
			// ---- Style tab: separate collapsible panels ----
			var useIconGroups = ToggleGroupControl && ToggleGroupOption;
			var orientationCtrl = useIconGroups ? el( ToggleGroupControl, {
				label: __( 'Orientation', TD ),
				value: 'vertical' === attributes.layout ? 'vertical' : 'horizontal',
				isBlock: true,
				onChange: function ( v ) { setAttributes( { layout: v } ); }
			},
				el( ToggleGroupOption, { value: 'horizontal', icon: EELFG_UI_ICONS.horizontal, label: __( 'Horizontal', TD ) } ),
				el( ToggleGroupOption, { value: 'vertical', icon: EELFG_UI_ICONS.vertical, label: __( 'Vertical', TD ) } )
			) : el( SelectControl, { label: __( 'Orientation', TD ), value: attributes.layout, options: [ { label: __( 'Horizontal', TD ), value: 'horizontal' }, { label: __( 'Vertical', TD ), value: 'vertical' } ], onChange: function ( v ) { setAttributes( { layout: v } ); } } );

			var justifyCtrl = useIconGroups ? el( ToggleGroupControl, {
				label: __( 'Justification', TD ),
				value: attributes.alignment || 'left',
				isBlock: true,
				onChange: function ( v ) { setAttributes( { alignment: v } ); }
			},
				el( ToggleGroupOption, { value: 'left', icon: EELFG_UI_ICONS.alignLeft, label: __( 'Left', TD ) } ),
				el( ToggleGroupOption, { value: 'center', icon: EELFG_UI_ICONS.alignCenter, label: __( 'Center', TD ) } ),
				el( ToggleGroupOption, { value: 'right', icon: EELFG_UI_ICONS.alignRight, label: __( 'Right', TD ) } )
			) : el( SelectControl, { label: __( 'Justification', TD ), value: attributes.alignment, options: [ { label: __( 'Left', TD ), value: 'left' }, { label: __( 'Center', TD ), value: 'center' }, { label: __( 'Right', TD ), value: 'right' } ], onChange: function ( v ) { setAttributes( { alignment: v } ); } } );

			// Item Gap — responsive ( per-device string attributes; itemGap is the desktop value ).
			// Per-device gap stored in separate string attributes ( they persist reliably ).
			var gapAttrKey = ( 'tablet' === device ) ? 'gapTablet' : ( 'mobile' === device ? 'gapMobile' : 'itemGap' );
			var gapDevVal  = attributes[ gapAttrKey ] || '';
			var gapPreset  = ( [ '', '10px', '20px', '32px' ].indexOf( gapDevVal ) !== -1 ) ? gapDevVal : 'custom';
			function setGapDevice( val ) {
				var patch = {};
				patch[ gapAttrKey ] = val || '';
				setAttributes( patch );
			}
			var gapDevices = el( 'div', { className: 'eelfg-menu-devices' },
				[ [ 'desktop', 'dashicons-desktop', __( 'Desktop', TD ) ], [ 'tablet', 'dashicons-tablet', __( 'Tablet', TD ) ], [ 'mobile', 'dashicons-smartphone', __( 'Mobile', TD ) ] ].map( function ( d ) {
					return el( Button, {
						key: d[0],
						label: d[2],
						showTooltip: true,
						isPressed: device === d[0],
						onClick: function () { setDevice( d[0] ); eelfgSetPreview( d[0] ); }
					}, el( 'span', { className: 'dashicons ' + d[1] } ) );
				} )
			);
			var gapToggle = eelfgToggleGroup( {
				label: __( 'Item Gap', TD ),
				value: gapPreset,
				options: [ { label: __( 'Def', TD ), value: '' }, { label: 'S', value: '10px' }, { label: 'M', value: '20px' }, { label: 'L', value: '32px' }, { label: __( 'Custom', TD ), value: 'custom' } ],
				onChange: function ( v ) { setGapDevice( 'custom' === v ? ( 'custom' === gapPreset ? gapDevVal : '24px' ) : v ); }
			} );
			var gapCustom = ( 'custom' === gapPreset ) ? el( RangeControl, {
				label: __( 'Custom Gap (px)', TD ),
				value: parseInt( gapDevVal, 10 ) || 24,
				min: 0,
				max: 80,
				step: 1,
				onChange: function ( v ) { setGapDevice( ( v || 0 ) + 'px' ); }
			} ) : null;

			var layoutPanel = el(
				PanelBody,
				{ title: __( 'Layout', TD ), initialOpen: true },
				orientationCtrl,
				justifyCtrl,
				el( 'div', { className: 'eelfg-menu-linkfield-label', style: { marginTop: '4px' } }, __( 'Item Gap', TD ) ),
				gapDevices,
				gapToggle,
				gapCustom,
				el( ToggleControl, { label: __( 'Allow to wrap to multiple lines', TD ), checked: false !== attributes.menuWrap, onChange: function ( v ) { setAttributes( { menuWrap: v } ); } } )
			);

			var typographyPanel = el(
				PanelBody,
				{ title: __( 'Typography', TD ), initialOpen: false },
				el( SelectControl, {
					label: __( 'Font Family', TD ),
					value: attributes.fontFamily || '',
					options: [
						{ label: __( 'Default', TD ), value: '' },
						{ label: 'System', value: 'system' },
						{ label: 'Arial', value: 'arial' },
						{ label: 'Helvetica', value: 'helvetica' },
						{ label: 'Georgia', value: 'georgia' },
						{ label: 'Times New Roman', value: 'times' },
						{ label: 'Courier', value: 'courier' },
						{ label: 'Verdana', value: 'verdana' },
						{ label: 'Tahoma', value: 'tahoma' }
					],
					onChange: function ( v ) { setAttributes( { fontFamily: v } ); }
				} ),
				eelfgToggleGroup( {
					label: __( 'Font Size', TD ),
					value: attributes.fontSize || '',
					options: [ { label: __( 'Def', TD ), value: '' }, { label: 'S', value: '14px' }, { label: 'M', value: '16px' }, { label: 'L', value: '18px' }, { label: 'XL', value: '22px' } ],
					onChange: function ( v ) { setAttributes( { fontSize: v } ); }
				} ),
				eelfgToggleGroup( {
					label: __( 'Font Weight', TD ),
					value: attributes.fontWeight || '',
					options: [ { label: __( 'Def', TD ), value: '' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' } ],
					onChange: function ( v ) { setAttributes( { fontWeight: v } ); }
				} ),
				eelfgToggleGroup( {
					label: __( 'Text Transform', TD ),
					value: attributes.textTransform || '',
					options: [ { label: __( 'Def', TD ), value: '' }, { label: 'AB', value: 'uppercase' }, { label: 'ab', value: 'lowercase' }, { label: 'Ab', value: 'capitalize' }, { label: __( 'None', TD ), value: 'none' } ],
					onChange: function ( v ) { setAttributes( { textTransform: v } ); }
				} )
			);

			// Colours: a Text / Hover / Active toggle drives one colour picker; Description is separate.
			var colorAttrKey = ( 'hover' === colorState ) ? 'hoverColor' : ( 'active' === colorState ? 'activeColor' : 'textColor' );
			var currentColorVal = attributes[ colorAttrKey ] || '';
			var colorPickerEl = ColorPalette ? el( ColorPalette, {
				value: currentColorVal,
				onChange: function ( v ) { var p = {}; p[ colorAttrKey ] = v || ''; setAttributes( p ); }
			} ) : colorRow( __( 'Color', TD ), currentColorVal, function ( v ) { var p = {}; p[ colorAttrKey ] = v || ''; setAttributes( p ); } );

			var colorsPanel = el(
				PanelBody,
				{ title: __( 'Colors', TD ), initialOpen: true },
				eelfgToggleGroup( {
					label: __( 'Item Color', TD ),
					value: colorState,
					options: [ { label: __( 'Text', TD ), value: 'text' }, { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Active', TD ), value: 'active' } ],
					onChange: setColorState
				} ),
				colorPickerEl,
				el( 'div', { className: 'eelfg-menu-linkfield-label', style: { marginTop: '14px' } }, __( 'Description Color', TD ) ),
				ColorPalette ? el( ColorPalette, {
					value: attributes.descriptionColor || '',
					onChange: function ( v ) { setAttributes( { descriptionColor: v || '' } ); }
				} ) : colorRow( __( 'Description Color', TD ), attributes.descriptionColor, function ( v ) { setAttributes( { descriptionColor: v } ); } )
			);

			// ---- Inspector: Responsive ----
			var responsivePanel = el(
				PanelBody,
				{ title: __( 'Responsive', TD ), initialOpen: false },
				eelfgToggleGroup( {
					label: __( 'Overlay Visibility', TD ),
					help: __( 'Off: full menu always. Mobile: hamburger below the breakpoint. Always: hamburger on every screen.', TD ),
					value: mobileMode,
					options: [
						{ label: __( 'Off', TD ), value: 'off' },
						{ label: __( 'Mobile', TD ), value: 'mobile' },
						{ label: __( 'Always', TD ), value: 'always' }
					],
					onChange: function ( v ) { setAttributes( { mobileMode: v, mobileEnable: 'off' !== v } ); }
				} ),
				( 'mobile' === mobileMode ) ? el( RangeControl, {
					label: __( 'Mobile breakpoint (px)', TD ),
					help: __( 'Below this screen width the hamburger + off-canvas drawer show.', TD ),
					value: attributes.mobileBreakpoint || 782,
					min: 320,
					max: 1200,
					step: 1,
					onChange: function ( v ) { setAttributes( { mobileBreakpoint: v || 782 } ); }
				} ) : null,
				( 'off' !== mobileMode ) ? eelfgToggleGroup( {
					label: __( 'Drawer opens from', TD ),
					value: 'left' === attributes.drawerSide ? 'left' : 'right',
					options: [ { label: __( 'Right', TD ), value: 'right' }, { label: __( 'Left', TD ), value: 'left' } ],
					onChange: function ( v ) { setAttributes( { drawerSide: v } ); }
				} ) : null,
				( 'off' !== mobileMode ) ? el( RangeControl, {
					label: __( 'Drawer width (px)', TD ),
					value: attributes.drawerWidth || 320,
					min: 240,
					max: 480,
					step: 1,
					onChange: function ( v ) { setAttributes( { drawerWidth: v || 320 } ); }
				} ) : null,
				( 'off' !== mobileMode ) ? colorRow( __( 'Drawer Background', TD ), attributes.drawerBg, function ( v ) { setAttributes( { drawerBg: v } ); } ) : null,
				( 'off' !== mobileMode ) ? colorRow( __( 'Hamburger / Close Color', TD ), attributes.toggleColor, function ( v ) { setAttributes( { toggleColor: v } ); } ) : null
			);

			// ---- Live preview (links do NOT navigate in the editor) ----
			function renderLi( item, key, isChild, onLabel, onChildLabel, onRemove, onChildRemove, onAddChild ) {
				var kids   = ( ! isChild && item.children && item.children.length ) ? item.children : [];
				var itSide = 'left' === item.iconSide ? 'left' : 'right';
				var itype  = eelfgItemType( item );
				var iconEl = null;
				if ( 'image' === itype && item.iconUrl ) {
					iconEl = el( 'span', { className: 'eelfg-menu-item-icon eelfg-menu-item-icon--' + itSide, 'aria-hidden': 'true' },
						el( 'img', { className: 'eelfg-menu-item-img', src: item.iconUrl, alt: '' } ) );
				} else if ( 'icon' === itype && item.iconName && EELFG_SVG[ item.iconName ] ) {
					iconEl = el( 'span', {
						className: 'eelfg-menu-item-icon eelfg-menu-item-icon--' + itSide,
						'aria-hidden': 'true',
						dangerouslySetInnerHTML: { __html: EELFG_SVG[ item.iconName ] }
					} );
				}

				var textEl = el( 'span', { className: 'eelfg-menu-text' },
					// The label is editable right in the preview via RichText — plain text, no formatting
					// toolbar, no line breaks. This integrates cleanly with the editor (caret + typing).
					el( RichText, {
						identifier: 'eelfg-label-' + key,
						tagName: 'span',
						className: 'eelfg-menu-label',
						value: item.label || '',
						allowedFormats: [],
						withoutInteractiveFormatting: true,
						disableLineBreaks: true,
						placeholder: __( 'Label', TD ),
						onChange: function ( v ) { onLabel( v ); },
						// Backspace on an already-empty label removes the whole item.
						onKeyDown: function ( e ) {
							if ( 'Backspace' === e.key && onRemove && ! ( item.label || '' ).trim() ) {
								e.preventDefault();
								onRemove();
							}
						}
					} ),
					item.description ? el( 'span', { className: 'eelfg-menu-desc' }, item.description ) : null
				);

				var ddVal = attributes.dropdownIcon || 'caret';
				var ddKey = eelfgDropdownKey( ddVal );

				// Content for the sub-menu picker popover ( search page / URL / create ).
				function subPickerContent( c ) {
					return el( AddMenuSearch, { onPick: function ( v ) { onAddChild( v ); c.onClose(); } } );
				}

				// Editor: the caret shows ONLY when the item actually has a dropdown. It doubles as a
				// button that opens the popover to add more sub-menu items. ( The first sub-menu item
				// is added from the Inspector's "+ Add dropdown item". )
				var subToggle = null;
				if ( ! isChild && onAddChild && kids.length ) {
					if ( showDrawer ) {
						// In the mobile-drawer preview the caret toggles the accordion ( like the front end ).
						var ap = { type: 'button', className: 'eelfg-menu-sub-toggle eelfg-menu-sub-trigger eelfg-menu-sub-toggle--' + ( 'none' === ddVal ? 'none' : ddVal ), 'aria-label': __( 'Toggle sub-menu', TD ), onClick: function () { toggleSubOpen( key ); } };
						if ( ddKey ) { ap.dangerouslySetInnerHTML = { __html: EELFG_SVG[ ddKey ] }; }
						subToggle = el( 'button', ap );
					} else {
						subToggle = el( Dropdown, {
							className: 'eelfg-menu-subadd',
							popoverProps: { className: 'eelfg-menu-add-pop', placement: 'bottom-start' },
							renderToggle: function ( t ) {
								var p = { type: 'button', className: 'eelfg-menu-sub-toggle eelfg-menu-sub-trigger eelfg-menu-sub-toggle--' + ( 'none' === ddVal ? 'none' : ddVal ), 'aria-label': __( 'Add sub-menu', TD ), 'aria-expanded': t.isOpen, onClick: t.onToggle };
								if ( ddKey ) { p.dangerouslySetInnerHTML = { __html: EELFG_SVG[ ddKey ] }; }
								return el( 'button', p );
							},
							renderContent: subPickerContent
						} );
					}
				}

				// Children + a trailing "+" to add more sub-menu items.
				var childLis = kids.map( function ( c, ci ) {
					return renderLi( c, 'sc' + ci, true,
						function ( text ) { onChildLabel( ci, text ); },
						null,
						function () { if ( onChildRemove ) { onChildRemove( ci ); } }
					);
				} );
				if ( ! isChild && onAddChild ) {
					childLis.push( el( 'li', { key: 'sc-add', className: 'eelfg-menu-add-item eelfg-menu-subadd-item' },
						el( Dropdown, {
							popoverProps: { className: 'eelfg-menu-add-pop', placement: 'bottom-start' },
							renderToggle: function ( t ) {
								return el( Button, { icon: plusIcon, variant: 'secondary', className: 'eelfg-menu-add-btn', label: __( 'Add sub-menu item', TD ), showTooltip: true, 'aria-expanded': t.isOpen, onClick: t.onToggle } );
							},
							renderContent: subPickerContent
						} )
					) );
				}

				return el(
					'li',
					{ key: key, className: 'menu-item' + ( kids.length ? ' menu-item-has-children' : '' ) + ( showDrawer && kids.length && openSubs[ key ] ? ' is-sub-open' : '' ) },
					el( 'a', { href: item.url || '#', onClick: function ( e ) { e.preventDefault(); } },
						'left' === itSide ? iconEl : null,
						textEl,
						'right' === itSide ? iconEl : null
					),
					subToggle,
					kids.length ? el( 'ul', { className: 'sub-menu' }, childLis ) : null
				);
			}

			var addControl = el( Dropdown, {
				className: 'eelfg-menu-add-dropdown',
				popoverProps: { className: 'eelfg-menu-add-pop', placement: 'bottom-start' },
				renderToggle: function ( t ) {
					return el( Button, { icon: plusIcon, variant: 'secondary', className: 'eelfg-menu-add-btn', label: __( 'Add menu item', TD ), showTooltip: true, 'aria-expanded': t.isOpen, onClick: t.onToggle } );
				},
				renderContent: function ( c ) {
					return el( AddMenuSearch, { onPick: function ( v ) { addLinkItem( v ); c.onClose(); } } );
				}
			} );

			var previewClass = 'eelfg-menu eelfg-menu--' + ( 'vertical' === attributes.layout ? 'vertical' : 'horizontal' ) + ' eelfg-menu-align-' + ( attributes.alignment || 'left' ) + ( 'click' === attributes.submenuTrigger ? ' eelfg-menu-click' : '' );

			var lis = items.map( function ( item, i ) {
				return renderLi( item, 'it' + i, false,
					function ( text ) { updateItem( i, { label: text } ); },
					function ( ci, text ) { updateChild( i, ci, { label: text } ); },
					function () { removeItem( i ); },
					function ( ci ) { removeChild( i, ci ); },
					function ( v ) { addChildLink( i, v ); }
				);
			} );
			lis.push( el( 'li', { key: 'eelfg-add', className: 'eelfg-menu-add-item' }, addControl ) );


			// Editor-scoped colour/gap preview. render.php builds the same rules for the front-end;
			// here we mirror them so the colour pickers update the live editor preview too.
			var editorId = 'eelfg-menu-ed-' + String( props.clientId || '' ).replace( /[^a-zA-Z0-9_-]/g, '' );
			var edSel    = '#' + editorId;
			var edCss    = '';
			// Show the gap for the CURRENTLY selected device directly ( the editor canvas isn't
			// actually resized, so media queries wouldn't fire ). Tablet/Mobile inherit desktop.
			var edGap = ( 'tablet' === device ) ? ( attributes.gapTablet || attributes.itemGap ) : ( 'mobile' === device ? ( attributes.gapMobile || attributes.itemGap ) : attributes.itemGap );
			if ( edGap ) { edCss += edSel + ' > .eelfg-menu-list{gap:' + edGap + ';}'; }
			var edFont = '';
			if ( attributes.fontFamily && EELFG_FONTS[ attributes.fontFamily ] ) { edFont += 'font-family:' + EELFG_FONTS[ attributes.fontFamily ] + ';'; }
			if ( attributes.fontSize ) { edFont += 'font-size:' + attributes.fontSize + ';'; }
			if ( attributes.fontWeight ) { edFont += 'font-weight:' + attributes.fontWeight + ';'; }
			if ( attributes.textTransform ) { edFont += 'text-transform:' + attributes.textTransform + ';'; }
			if ( edFont ) {
				edCss += edSel + ' .eelfg-menu-list a{' + edFont + '}';
			}
			if ( attributes.textColor ) {
				edCss += edSel + ' .eelfg-menu-list a{color:' + attributes.textColor + ';}';
			}
			if ( attributes.hoverColor ) {
				edCss += edSel + ' .eelfg-menu-list a:hover,' + edSel + ' .eelfg-menu-list a:focus{color:' + attributes.hoverColor + ';}';
			}
			if ( attributes.activeColor ) {
				edCss += edSel + ' .eelfg-menu-list .current-menu-item > a{color:' + attributes.activeColor + ';}';
			}
			if ( attributes.descriptionColor ) {
				edCss += edSel + ' .eelfg-menu-desc{color:' + attributes.descriptionColor + ';}';
			}

			// Mobile-menu drawer preview ( showDrawer computed near the top of edit ).
			if ( showDrawer ) {
				// Same off-canvas drawer as the front end ( slide-in panel + overlay + close ).
				var edSide = 'left' === attributes.drawerSide ? 'left' : 'right';
				var edOff  = 'left' === edSide ? '-100%' : '100%';
				var edW    = ( attributes.drawerWidth || 320 ) + 'px';
				var edBg   = attributes.drawerBg || '#ffffff';
				edCss += edSel + ' .eelfg-menu-toggle{display:inline-flex;}';
				edCss += edSel + ' .eelfg-menu-close{display:flex;}';
				edCss += edSel + ' .eelfg-menu-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;z-index:9998;}';
				edCss += edSel + '.is-open .eelfg-menu-overlay{opacity:1;visibility:visible;}';
				edCss += edSel + ' .eelfg-menu-panel{display:block;position:fixed;top:0;bottom:0;' + edSide + ':0;width:' + edW + ';max-width:85vw;background:' + edBg + ';transform:translateX(' + edOff + ');transition:transform 0.3s ease;z-index:9999;overflow-y:auto;padding:56px 22px 28px;}';
				edCss += edSel + '.is-open .eelfg-menu-panel{transform:translateX(0);}';
				edCss += edSel + ' .eelfg-menu-list{flex-direction:column;align-items:stretch;width:100%;gap:0;}';
				edCss += edSel + ' .eelfg-menu-list .menu-item > a{padding:9px 0;}';
				edCss += edSel + ' .eelfg-menu-list .sub-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;border-radius:0;min-width:0;padding:0 0 0 18px;max-height:0;overflow:hidden;transition:max-height 0.3s ease;}';
				edCss += edSel + ' .menu-item-has-children.is-sub-open > .sub-menu{max-height:1000px;}';
			} else {
				edCss += edSel + ' .eelfg-menu-panel{display:contents;}';
				edCss += edSel + ' .eelfg-menu-toggle,' + edSel + ' .eelfg-menu-close{display:none;}';
				edCss += edSel + ' .eelfg-menu-overlay{display:none;}';
			}

			var previewToggle = showDrawer ? el( 'button', {
				type: 'button',
				className: 'eelfg-menu-toggle',
				'aria-label': __( 'Toggle menu', TD ),
				onClick: function () { setOpenPreview( ! isOpenPreview ); }
			},
				el( 'span', { className: 'eelfg-menu-toggle-bar' } ),
				el( 'span', { className: 'eelfg-menu-toggle-bar' } ),
				el( 'span', { className: 'eelfg-menu-toggle-bar' } )
			) : null;

			var previewOverlay = showDrawer ? el( 'div', { className: 'eelfg-menu-overlay', 'aria-hidden': 'true', onClick: function () { setOpenPreview( false ); } } ) : null;
			var previewClose = showDrawer ? el( 'button', {
				type: 'button',
				className: 'eelfg-menu-close',
				'aria-label': __( 'Close menu', TD ),
				onClick: function () { setOpenPreview( false ); },
				dangerouslySetInnerHTML: { __html: '<svg class="eelfg-menu-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 8 8"/><path d="m12 4-8 8"/></svg>' }
			} ) : null;

			var preview = el(
				'div',
				{ id: editorId, className: previewClass + ( items.length ? '' : ' eelfg-menu-is-empty' ) + ( showDrawer && isOpenPreview ? ' is-open' : '' ) },
				edCss ? el( 'style', {}, edCss ) : null,
				previewToggle,
				previewOverlay,
				el( 'div', { className: 'eelfg-menu-panel' }, previewClose, el( 'ul', { className: 'eelfg-menu-list' }, lis ) )
			);

			var blockProps = useBlockProps();

			return el(
				Fragment,
				{},
				// Three custom tabs: Menu Items / Settings / Style.
				el( InspectorControls, {},
					el( TabPanel, {
						className: 'eelfg-menu-tabs',
						tabs: [
							{ name: 'items', title: __( 'Menu', TD ) },
							{ name: 'settings', title: __( 'Settings', TD ) },
							{ name: 'style', title: __( 'Style', TD ) }
						]
					}, function ( tab ) {
						if ( 'items' === tab.name ) {
							return el( Fragment, {}, itemEditors, addItemEl );
						}
						if ( 'settings' === tab.name ) {
							return el( Fragment, {}, layoutPanel, dropdownPanel, responsivePanel );
						}
						// Style tab: colours + typography.
						return el( Fragment, {}, colorsPanel, typographyPanel );
					} )
				),
				el( 'div', blockProps, preview )
			);
		},
		save: function () {
			return null;
		}
	} );

	// ---------------------------------------------------------------------------
	// "Easy Elements Menu" — a variation of the core Navigation block. This IS core
	// Navigation under the hood, so its dropdowns, appenders, mobile overlay and
	// "add any block" behaviour work EXACTLY like the default Navigation block.
	// ---------------------------------------------------------------------------
	if ( wp.domReady && wp.blocks && wp.blocks.registerBlockVariation ) {
		wp.domReady( function () {
			if ( ! wp.blocks.getBlockType || ! wp.blocks.getBlockType( 'core/navigation' ) ) {
				return; // Core Navigation not available.
			}
			wp.blocks.registerBlockVariation( 'core/navigation', {
				name: 'eelfg-menu',
				title: __( 'Easy Elements Menu', TD ),
				description: __( 'A navigation menu that works exactly like the default Navigation, in Easy Elements style.', TD ),
				icon: 'menu',
				scope: [ 'inserter' ],
				attributes: { className: 'eelfg-nav' }
			} );
		} );
	}

} )( window.wp );
