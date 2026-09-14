/**
 * Editor script for the ShapeBlock "Menu" block.
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
	var useRef            = wp.element.useRef;
	var __                = wp.i18n.__;
	var sprintf           = wp.i18n.sprintf;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var BlockControls     = wp.blockEditor.BlockControls;
	var ToolbarGroup      = wp.components.ToolbarGroup;
	var ToolbarButton     = wp.components.ToolbarButton;
	var Popover           = wp.components.Popover;
	var useBlockProps      = wp.blockEditor.useBlockProps;
	var RichText          = wp.blockEditor.RichText;
	var MediaUpload       = wp.blockEditor.MediaUpload;
	var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
	var PanelColorSettings = wp.blockEditor.PanelColorSettings;
	var ColorPalette      = wp.blockEditor.ColorPalette || wp.components.ColorPalette;
	// Combined solid-colour + gradient picker ( experimental in wp.blockEditor ).
	var ColorGradientControl = ( wp.blockEditor && ( wp.blockEditor.__experimentalColorGradientControl || wp.blockEditor.ColorGradientControl ) ) || null;
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
	function shapeblockToggleGroup( props ) {
		if ( ToggleGroupControl && ToggleGroupOptionText ) {
			return el( ToggleGroupControl, { label: props.label, value: props.value, isBlock: true, help: props.help, onChange: props.onChange },
				props.options.map( function ( o ) { return el( ToggleGroupOptionText, { key: o.value, value: o.value, label: o.label } ); } ) );
		}
		return el( wp.components.SelectControl, { label: props.label, value: props.value, options: props.options, help: props.help, onChange: props.onChange } );
	}

	// Small stroke icons for the icon-based Orientation / Justification controls.
	function shapeblockSvgEl( paths ) {
		return el( 'svg', { width: 24, height: 24, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', stroke: 'currentColor', 'strokeWidth': 1.8, 'strokeLinecap': 'round', 'strokeLinejoin': 'round' },
			paths.map( function ( d, k ) { return el( 'path', { key: k, d: d } ); } ) );
	}
	var SHAPEBLOCK_UI_ICONS = {
		horizontal: shapeblockSvgEl( [ 'M4 12h13', 'M13 7l5 5-5 5' ] ),
		vertical:   shapeblockSvgEl( [ 'M12 4v13', 'M7 13l5 5 5-5' ] ),
		alignLeft:  shapeblockSvgEl( [ 'M4 7h10', 'M4 12h16', 'M4 17h10' ] ),
		alignCenter: shapeblockSvgEl( [ 'M7 7h10', 'M4 12h16', 'M7 17h10' ] ),
		alignRight: shapeblockSvgEl( [ 'M10 7h10', 'M4 12h16', 'M10 17h10' ] )
	};
	var RangeControl      = wp.components.RangeControl;
	var Button            = wp.components.Button;
	var Dropdown          = wp.components.Dropdown;
	var Spinner           = wp.components.Spinner;
	var apiFetch          = wp.apiFetch;

	// Shared inline SVG icons ( identical markup to render.php's shapeblock_menu_icon_svg ).
	var SHAPEBLOCK_SVG_OPEN = '<svg class="shapeblock-menu-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"';
	var SHAPEBLOCK_SVG_LINE = ' fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
	var SHAPEBLOCK_SVG = {
		'caret':         SHAPEBLOCK_SVG_OPEN + ' fill="currentColor"><path d="M8 11 3.6 6.2h8.8z"/></svg>',
		'chevron-down':  SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="m4 6 4 4 4-4"/></svg>',
		'arrow-down':    SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M8 3.5v9"/><path d="m4.5 9 3.5 3.5L11.5 9"/></svg>',
		'plus':          SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M8 3.5v9"/><path d="M3.5 8h9"/></svg>',
		'arrow-right':   SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M3.5 8h9"/><path d="M9 4.5 12.5 8 9 11.5"/></svg>',
		'chevron-right': SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="m6 4 4 4-4 4"/></svg>',
		'external':      SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M6.5 3.5H3.5v9h9v-3"/><path d="M9.5 3.5h3v3"/><path d="M12.5 3.5 7.5 8.5"/></svg>',
		'star':          SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M8 2.5 9.7 6l3.8.5-2.8 2.7.7 3.8L8 11.7 4.6 13l.7-3.8L2.5 6.5 6.3 6z"/></svg>',
		'heart':         SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M8 13.3S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.3 8 13.3z"/></svg>',
		'check':         SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="m3.5 8.5 3 3 6-7"/></svg>',
		'home':          SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M3 8l5-4.5L13 8"/><path d="M4.5 7v6h7V7"/></svg>',
		'user':          SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><circle cx="8" cy="6" r="2.5"/><path d="M3.5 13c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4"/></svg>',
		'cart':          SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M2.5 3h1.5l1.1 7h6.2l1.2-5H4.6"/><circle cx="6.5" cy="12.5" r="0.9"/><circle cx="11" cy="12.5" r="0.9"/></svg>',
		'search':        SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><circle cx="7" cy="7" r="3.5"/><path d="m12.5 12.5-2.8-2.8"/></svg>',
		'phone':         SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><path d="M4 3h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5l1-1.5 3 1v2c0 .6-.5 1.1-1.1 1A9.4 9.4 0 0 1 3 4.1C2.9 3.5 3.4 3 4 3z"/></svg>',
		'envelope':      SHAPEBLOCK_SVG_OPEN + SHAPEBLOCK_SVG_LINE + '><rect x="2.5" y="4" width="11" height="8" rx="1"/><path d="m3 4.5 5 4 5-4"/></svg>'
	};
	// Built-in icon choices offered per item ( value = SHAPEBLOCK_SVG key ).
	var SHAPEBLOCK_ICON_CHOICES = [
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
	function shapeblockItemType( item ) {
		if ( item.iconType ) { return item.iconType; }
		if ( item.iconUrl ) { return 'image'; }
		if ( item.iconName ) { return 'icon'; }
		return 'none';
	}

	// Map the dropdown-indicator choice to an SVG key ( '' = no indicator ).
	function shapeblockDropdownKey( v ) {
		if ( 'chevron' === v ) { return 'chevron-down'; }
		if ( 'arrow' === v ) { return 'arrow-down'; }
		if ( 'plus' === v ) { return 'plus'; }
		if ( 'none' === v ) { return ''; }
		return 'caret';
	}
	// Map a per-item icon choice to an SVG key ( '' = no icon ).
	function shapeblockItemKey( v ) {
		if ( 'arrow' === v ) { return 'arrow-right'; }
		if ( 'chevron' === v ) { return 'chevron-right'; }
		if ( 'plus' === v ) { return 'plus'; }
		if ( 'external' === v ) { return 'external'; }
		return '';
	}

	var TD = 'shapeblock';

	// Switch WordPress's own editor preview ( canvas ) to Desktop / Tablet / Mobile width.
	function shapeblockSetPreview( d ) {
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
	var SHAPEBLOCK_FONTS = {
		system:    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
		arial:     'Arial,Helvetica,sans-serif',
		helvetica: '"Helvetica Neue",Helvetica,Arial,sans-serif',
		georgia:   'Georgia,"Times New Roman",serif',
		times:     '"Times New Roman",Times,serif',
		courier:   '"Courier New",Courier,monospace',
		verdana:   'Verdana,Geneva,sans-serif',
		tahoma:    'Tahoma,Geneva,sans-serif'
	};

	// Popular Google Fonts ( family names ). Selecting one loads it from Google ( editor + front end ).
	var GOOGLE_FONTS = [
		'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Inter',
		'Nunito', 'Nunito Sans', 'Playfair Display', 'Merriweather', 'Roboto Condensed', 'Roboto Slab',
		'Ubuntu', 'Rubik', 'Work Sans', 'Noto Sans', 'PT Sans', 'PT Serif', 'Mukta', 'Quicksand',
		'Fira Sans', 'Barlow', 'Josefin Sans', 'Karla', 'Dosis', 'Cabin', 'Titillium Web', 'Libre Franklin',
		'Source Sans 3', 'Manrope', 'DM Sans', 'DM Serif Display', 'Heebo', 'Mulish', 'Bitter', 'Arvo',
		'Bebas Neue', 'Anton', 'Lobster', 'Pacifico', 'Dancing Script', 'Caveat', 'Comfortaa', 'Exo 2',
		'Teko', 'Kanit', 'Prompt', 'Sarabun', 'IBM Plex Sans', 'IBM Plex Serif', 'Crimson Text',
		'EB Garamond', 'Cormorant Garamond', 'Space Grotesk', 'Space Mono', 'Fira Code', 'JetBrains Mono',
		'Zilla Slab', 'Assistant', 'Hind', 'Signika', 'Questrial', 'Abel', 'Archivo', 'Chivo', 'Overpass',
		'Red Hat Display', 'Sora', 'Outfit', 'Lexend', 'Plus Jakarta Sans', 'Figtree', 'Albert Sans'
	];
	// Build the Google Fonts stylesheet URL for a family ( common weights, swap display ).
	function shapeblockGoogleFontUrl( family ) {
		return 'https://fonts.googleapis.com/css2?family=' + family.replace( / /g, '+' ) + ':wght@300;400;500;600;700&display=swap';
	}

	// Live Google Fonts list ( fetched server-side from the Google Fonts API and localized ).
	// Falls back to the bundled popular list when the API list is unavailable.
	function shapeblockGoogleFontList() {
		if ( window.shapeblockMenuFonts && window.shapeblockMenuFonts.length ) {
			return window.shapeblockMenuFonts;
		}
		return GOOGLE_FONTS;
	}

	// Is this fontFamily value one of the web-safe keys ( vs. a Google font family name )?
	function shapeblockIsWebSafe( key ) {
		return !! ( key && SHAPEBLOCK_FONTS[ key ] );
	}

	// Options for the Font Family select: Default + web-safe stacks + every Google font.
	function shapeblockFontOptions() {
		var opts = [
			{ label: __( 'Default', TD ), value: '' },
			{ label: 'System', value: 'system' },
			{ label: 'Arial', value: 'arial' },
			{ label: 'Helvetica', value: 'helvetica' },
			{ label: 'Georgia', value: 'georgia' },
			{ label: 'Times New Roman', value: 'times' },
			{ label: 'Courier', value: 'courier' },
			{ label: 'Verdana', value: 'verdana' },
			{ label: 'Tahoma', value: 'tahoma' }
		];
		var list = shapeblockGoogleFontList();
		for ( var i = 0; i < list.length; i++ ) {
			opts.push( { label: list[ i ], value: list[ i ] } );
		}
		return opts;
	}

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
	function shapeblockPathFromUrl( u ) {
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
				? '/wp/v2/search?search=' + encodeURIComponent( query ) + '&per_page=8&_fields=id,title,url,type,subtype'
				: '/wp/v2/pages?per_page=8&_fields=id,title,link&orderby=title&order=asc';

			apiFetch( { path: path } )
				.then( function ( res ) {
					if ( cancelled ) { return; }
					setResults( ( res || [] ).map( function ( r ) {
						return {
							id: r.id || 0,
							type: r.subtype || r.type || 'page',
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
					props.onPick( { url: url, title: ( page.title && ( page.title.rendered || page.title ) ) || t, id: page.id, type: 'page' } );
				} )
				.catch( function () { setCreating( false ); } );
		}

		// ---- "Create page" sub-panel ( title + publish toggle ), like core Navigation ----
		if ( 'create' === view ) {
			return el( 'div', { className: 'shapeblock-menu-add-search shapeblock-menu-add-createview' },
				el( Button, { className: 'shapeblock-menu-add-back', icon: 'arrow-left-alt2', onClick: function () { setView( 'main' ); } }, __( 'Back', TD ) ),
				el( TextControl, { label: __( 'Title', TD ), value: newTitle, placeholder: __( 'No title', TD ), onChange: setNewTitle, autoComplete: 'off' } ),
				el( CheckboxControl, {
					label: __( 'Publish', TD ),
					help: __( 'Turn off to save as a draft. Drafts won’t appear on your site until published.', TD ),
					checked: publish,
					onChange: setPublish
				} ),
				el( 'div', { className: 'shapeblock-menu-add-actions' },
					el( Button, { variant: 'tertiary', onClick: function () { setView( 'main' ); } }, __( 'Cancel', TD ) ),
					el( Button, { variant: 'primary', onClick: doCreate, disabled: creating || ! newTitle.trim() }, creating ? el( Spinner, {} ) : __( 'Create page', TD ) )
				)
			);
		}

		var rows = [];

		// Row: use the typed URL directly.
		if ( isUrl ) {
			rows.push( el( 'li', { key: 'url', className: 'shapeblock-menu-add-row' },
				el( Button, { className: 'shapeblock-menu-add-result', onClick: useTypedUrl },
					el( 'span', { className: 'dashicons dashicons-admin-links' } ),
					el( 'span', { className: 'shapeblock-menu-add-result-text' },
						el( 'span', { className: 'shapeblock-menu-add-result-title' }, __( 'Link to URL', TD ) ),
						el( 'span', { className: 'shapeblock-menu-add-result-sub' }, normalizeUrl( trimmed ) )
					)
				)
			) );
		}

		// Search results ( each with its path / slug ).
		if ( loading ) {
			rows.push( el( 'li', { key: 'loading', className: 'shapeblock-menu-add-row shapeblock-menu-add-loading' }, el( Spinner, {} ) ) );
		} else {
			results.forEach( function ( r, idx ) {
				rows.push( el( 'li', { key: 'r' + idx, className: 'shapeblock-menu-add-row' },
					el( Button, { className: 'shapeblock-menu-add-result', onClick: function () { props.onPick( { url: r.url, title: r.title, id: r.id, type: r.type } ); } },
						el( 'span', { className: 'dashicons dashicons-admin-page' } ),
						el( 'span', { className: 'shapeblock-menu-add-result-text' },
							el( 'span', { className: 'shapeblock-menu-add-result-title' }, r.title ),
							el( 'span', { className: 'shapeblock-menu-add-result-sub' }, shapeblockPathFromUrl( r.url ) )
						)
					)
				) );
			} );
			if ( ! results.length && ! isUrl ) {
				rows.push( el( 'li', { key: 'empty', className: 'shapeblock-menu-add-row shapeblock-menu-add-empty' }, __( 'No pages match. Type a URL to link directly.', TD ) ) );
			}
		}

		// Always-visible "Create page" row — opens the title + publish sub-panel.
		rows.push( el( 'li', { key: 'create', className: 'shapeblock-menu-add-row shapeblock-menu-add-create' },
			el( Button, { className: 'shapeblock-menu-add-result', onClick: openCreate },
				el( 'span', { className: 'dashicons dashicons-plus-alt2' } ),
				el( 'span', {}, __( 'Create page', TD ) )
			)
		) );


		return el( 'div', { className: 'shapeblock-menu-add-search' },
			el( 'div', { className: 'shapeblock-menu-add-input' },
				el( TextControl, { value: q, placeholder: __( 'Search or type a URL…', TD ), onChange: setQ, autoComplete: 'off', onKeyDown: function ( e ) {
					if ( 'Enter' === e.key ) {
						e.preventDefault();
						if ( isUrl ) { useTypedUrl(); }
						else if ( results.length ) { props.onPick( { url: results[0].url, title: results[0].title, id: results[0].id, type: results[0].type } ); }
					}
				} } ),
				isUrl ? el( Button, { className: 'shapeblock-menu-add-go', icon: 'arrow-right-alt2', label: __( 'Use URL', TD ), onClick: useTypedUrl } ) : null
			),
			el( 'ul', { className: 'shapeblock-menu-add-results' }, rows )
		);
	}

	/**
	 * A link field: shows the current link and opens the search popover to change it.
	 * props: url, onPick( { url, title } ).
	 */
	function LinkPicker( props ) {
		return el( Dropdown, {
			className: 'shapeblock-menu-linkpicker',
			popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'bottom-start' },
			renderToggle: function ( t ) {
				// Show whatever is stored ( "#", a URL, … ); only truly empty shows the placeholder.
				// The button is full-width ( CSS ), so even "#" stays easy to click and change.
				return el( Button, {
					variant: 'secondary',
					className: 'shapeblock-menu-linkpicker-btn',
					onClick: t.onToggle,
					'aria-expanded': t.isOpen
				}, props.url ? props.url : __( 'Set link…', TD ) );
			},
			renderContent: function ( c ) {
				return el( AddMenuSearch, { url: props.url, onPick: function ( v ) { props.onPick( v || {} ); c.onClose(); } } );
			}
		} );
	}

	// The theme / global-styles palette, so the picker offers the same swatches
	// the rest of the editor does. Empty array = custom picker only.
	function shapeblockPaletteColors() {
		try {
			var store = wp.data && wp.data.select( 'core/block-editor' );
			var settings = store && store.getSettings ? store.getSettings() : null;
			if ( settings && settings.colors && settings.colors.length ) {
				return settings.colors;
			}
		} catch ( e ) {}
		return [];
	}

	/**
	 * A colour row: label on the left, a swatch button on the right that opens
	 * the full palette + custom picker. Falls back to a plain colour input if
	 * the Dropdown / ColorPalette components are unavailable.
	 */
	function colorRow( label, value, onChange ) {
		var row = { className: 'shapeblock-menu-color-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } };

		if ( ! Dropdown || ! ColorPalette ) {
			return el( 'div', row,
				el( 'span', {}, label ),
				el( 'span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
					el( 'input', { type: 'color', value: value || '#000000', onChange: function ( e ) { onChange( e.target.value ); } } ),
					value ? el( Button, { variant: 'link', onClick: function () { onChange( '' ); } }, __( 'Clear', TD ) ) : null
				)
			);
		}

		// Checkerboard when nothing is set, so "no colour" reads differently from white.
		var swatch = el( 'span', {
			'aria-hidden': 'true',
			style: {
				display: 'block',
				width: '24px',
				height: '24px',
				borderRadius: '50%',
				boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
				background: value
					? value
					: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
			}
		} );

		return el( 'div', row,
			el( 'span', {}, label ),
			el( 'span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
				el( Dropdown, {
					popoverProps: { placement: 'left-start', offset: 12 },
					renderToggle: function ( toggle ) {
						return el( Button, {
							onClick: toggle.onToggle,
							'aria-expanded': toggle.isOpen,
							label: label,
							showTooltip: true,
							style: { padding: '2px', minWidth: 'auto', height: 'auto', lineHeight: 0 }
						}, swatch );
					},
					renderContent: function () {
						return el( 'div', { style: { padding: '12px', minWidth: '216px' } },
							el( ColorPalette, {
								colors: shapeblockPaletteColors(),
								value: value || '',
								onChange: function ( v ) { onChange( v || '' ); },
								clearable: true,
								enableAlpha: true,
								__experimentalIsRenderedInSidebar: true
							} )
						);
					}
				} ),
				value ? el( Button, { variant: 'link', isSmall: true, onClick: function () { onChange( '' ); } }, __( 'Clear', TD ) ) : null
			)
		);
	}

	registerBlockType( 'shapeblock/menu', {
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

			// Editor-only: which item-background state ( normal / hover / active ) is being edited.
			var bgStateState = useState( 'normal' );
			var bgState      = bgStateState[0];
			var setBgState   = bgStateState[1];

			// Editor-only: which dropdown text state ( text / hover ) is being edited.
			var ddStateState = useState( 'text' );
			var ddState      = ddStateState[0];
			var setDdState   = ddStateState[1];

			// Editor-only: mobile ( drawer ) text + background states being edited.
			var mTextStateState = useState( 'text' );
			var mTextState      = mTextStateState[0];
			var setMTextState   = mTextStateState[1];
			var mBgStateState   = useState( 'normal' );
			var mBgState        = mBgStateState[0];
			var setMBgState     = mBgStateState[1];

			// Theme colour + gradient palettes for the background pickers ( solid + gradient ).
			var shapeblockUsePalettes = wp.blockEditor.__experimentalUseMultipleOriginColorsAndGradients || wp.blockEditor.useMultipleOriginColorsAndGradients;
			var colorGradientSettings = shapeblockUsePalettes ? shapeblockUsePalettes() : { colors: [], gradients: [] };

			// Editor-only: is the mobile-menu preview open ( hamburger toggled )?
			var openPrevState  = useState( false );
			var isOpenPreview  = openPrevState[0];
			var setOpenPreview = openPrevState[1];

			// Editor-only: which parent submenus are expanded in the mobile drawer preview.
			var openSubsState = useState( {} );
			var openSubs      = openSubsState[0];
			var setOpenSubs   = openSubsState[1];
			function toggleSubOpen( k ) { var o = Object.assign( {}, openSubs ); o[ k ] = ! o[ k ]; setOpenSubs( o ); }

			// The menu item whose label is currently focused — its link is editable from the block toolbar.
			var activePathState = useState( null );
			var activePath      = activePathState[0];
			var setActivePath   = activePathState[1];

			// Effective overlay mode + whether the selected device shows the drawer ( used by renderNode ).
			var mobileMode = attributes.mobileMode || ( false === attributes.mobileEnable ? 'off' : 'mobile' );
			var edBreak    = attributes.mobileBreakpoint || 782;
			var edDevW     = ( 'mobile' === device ) ? 360 : ( ( 'tablet' === device ) ? 780 : 9999 );
			var showDrawer = ( 'always' === mobileMode ) || ( 'mobile' === mobileMode && edDevW <= edBreak );


			function clone() { return JSON.parse( JSON.stringify( items ) ); }

			// Remember the most recently edited menu ( debounced ) so a freshly inserted, empty block can
			// auto-restore it — the way a new menu comes pre-filled by default.
			var saveTimer = useRef( null );
			function commit( next ) {
				setAttributes( { items: next } );
				if ( saveTimer.current ) { clearTimeout( saveTimer.current ); }
				saveTimer.current = setTimeout( function () {
					apiFetch( { path: '/shapeblock/v1/menu-last', method: 'POST', data: { items: next } } ).catch( function () {} );
				}, 800 );
			}

			// On a brand-new ( empty ) block, restore the last saved menu once.
			useEffect( function () {
				if ( ( attributes.items || [] ).length ) { return; }
				apiFetch( { path: '/shapeblock/v1/menu-last' } ).then( function ( res ) {
					if ( res && Array.isArray( res.items ) && res.items.length && ! ( attributes.items || [] ).length ) {
						setAttributes( { items: res.items } );
					}
				} ).catch( function () {} );
			}, [] );

			// Dashboard menus ( Appearance → Menus ) the user can import into this block.
			var wpMenusState   = useState( [] );
			var wpMenus        = wpMenusState[0];
			var setWpMenus     = wpMenusState[1];
			var selMenuState   = useState( '' );
			var selMenu        = selMenuState[0];
			var setSelMenu     = selMenuState[1];
			var loadMenuState  = useState( false );
			var loadingMenu    = loadMenuState[0];
			var setLoadingMenu = loadMenuState[1];

			useEffect( function () {
				apiFetch( { path: '/wp/v2/menus?per_page=100&_fields=id,name' } ).then( function ( res ) {
					if ( Array.isArray( res ) ) { setWpMenus( res ); }
				} ).catch( function () {} );
			}, [] );

			// Fetch a Dashboard menu's items and convert them into this block's nested item tree.
			function shapeblockLoadWpMenu( id ) {
				if ( ! id ) { return; }
				setLoadingMenu( true );
				apiFetch( { path: '/wp/v2/menu-items?menus=' + encodeURIComponent( id ) + '&per_page=100&_fields=id,title,url,parent,menu_order,object_id,type,target,description' } )
					.then( function ( list ) {
						setLoadingMenu( false );
						if ( ! Array.isArray( list ) ) { return; }
						var byId = {}, roots = [];
						list.forEach( function ( mi ) {
							byId[ mi.id ] = {
								label: ( mi.title && mi.title.rendered ) ? mi.title.rendered : '',
								url: mi.url || '#',
								description: mi.description || '',
								newTab: '_blank' === mi.target,
								objectId: ( 'post_type' === mi.type ) ? ( mi.object_id || 0 ) : 0,
								objectType: mi.type || '',
								children: []
							};
						} );
						// Order by menu_order, then nest under each item's parent.
						list.slice().sort( function ( a, b ) { return ( a.menu_order || 0 ) - ( b.menu_order || 0 ); } ).forEach( function ( mi ) {
							var node = byId[ mi.id ];
							if ( mi.parent && byId[ mi.parent ] ) { byId[ mi.parent ].children.push( node ); } else { roots.push( node ); }
						} );
						commit( roots );
					} )
					.catch( function () { setLoadingMenu( false ); } );
			}

			function blankItem() { return { label: __( 'New Item', TD ), url: '#', description: '', newTab: false, children: [] }; }
			function blankChild() { return { label: __( 'Sub Item', TD ), url: '#', description: '', newTab: false, children: [] }; }

			// Strip HTML tags for plain-text contexts ( inspector text fields, panel titles ).
			function shapeblockStripTags( s ) { return String( s == null ? '' : s ).replace( /<[^>]*>/g, '' ); }

			function addItem() { var n = clone(); n.push( blankItem() ); commit( n ); }
			function addLinkItem( v ) {
				v = v || {};
				var n = clone();
				var it = blankItem();
				it.url = v.url || '#';
				it.label = v.title || __( 'New Item', TD );
				it.objectId = v.id || 0;
				it.objectType = v.type || '';
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
				c.objectId = v.id || 0;
				c.objectType = v.type || '';
				n[ i ].children.push( c );
				commit( n );
			}
			function updateChild( i, ci, patch ) { var n = clone(); n[ i ].children[ ci ] = Object.assign( {}, n[ i ].children[ ci ], patch ); commit( n ); }
			function removeChild( i, ci ) { var n = clone(); n[ i ].children.splice( ci, 1 ); commit( n ); }

			// ---- Path-based tree operations ( unlimited nesting: [2] = 3rd item, [2,0] = its 1st child, [2,0,1] = a grandchild ) ----
			// Return the node object at `path` ( or null if the path no longer resolves ).
			function nodeByPath( tree, path ) {
				if ( ! path ) { return null; }
				var arr = tree, node = null;
				for ( var k = 0; k < path.length; k++ ) {
					if ( ! arr || ! arr[ path[ k ] ] ) { return null; }
					node = arr[ path[ k ] ];
					arr = node.children;
				}
				return node;
			}
			// Return the array that directly holds the node at `path` ( i.e. its parent's child list ).
			function nodeArrAt( tree, path ) {
				var arr = tree;
				for ( var k = 0; k < path.length - 1; k++ ) {
					if ( ! Array.isArray( arr[ path[ k ] ].children ) ) { arr[ path[ k ] ].children = []; }
					arr = arr[ path[ k ] ].children;
				}
				return arr;
			}
			function updateAt( path, patch ) { var n = clone(), arr = nodeArrAt( n, path ), i = path[ path.length - 1 ]; arr[ i ] = Object.assign( {}, arr[ i ], patch ); commit( n ); }
			function removeAt( path ) { var n = clone(), arr = nodeArrAt( n, path ); arr.splice( path[ path.length - 1 ], 1 ); commit( n ); }
			function moveAt( path, dir ) {
				var n = clone(), arr = nodeArrAt( n, path );
				var i = path[ path.length - 1 ], j = i + dir;
				if ( j < 0 || j >= arr.length ) { return; }
				var t = arr[ i ]; arr[ i ] = arr[ j ]; arr[ j ] = t; commit( n );
			}
			// Add a child into the node at `parentPath` ( [] = top level ).
			function addChildAt( parentPath, child ) {
				var n = clone();
				if ( ! parentPath.length ) { n.push( child ); commit( n ); return; }
				var arr = n, node = null;
				for ( var k = 0; k < parentPath.length; k++ ) { node = arr[ parentPath[ k ] ]; if ( ! Array.isArray( node.children ) ) { node.children = []; } arr = node.children; }
				node.children.push( child );
				commit( n );
			}
			// Build a sub-item from a link pick, then add it under `parentPath`.
			function addChildLinkAt( parentPath, v ) {
				v = v || {};
				var c = blankChild();
				if ( v.url ) { c.url = v.url; }
				if ( v.title ) { c.label = v.title; }
				c.objectId = v.id || 0;
				c.objectType = v.type || '';
				addChildAt( parentPath, c );
			}

			// ---- Inspector: Menu Items ( recursive — every level can hold its own dropdown items ) ----
			function renderItemEditor( node, path, siblingCount ) {
				var idx     = path[ path.length - 1 ];
				var isTop   = 1 === path.length;
				var level   = path.length;       // 1 = top menu item, 2 = its dropdown, 3 = next level, …
				var subLvl  = level + 1;          // the level of items added under THIS node
				var kids    = node.children || [];

				// Nested dropdown-item editors ( recurse to any depth ).
				var childEditors = kids.map( function ( child, ci ) {
					return renderItemEditor( child, path.concat( ci ), kids.length );
				} );

				var iconField = el( 'div', { key: 'icon', className: 'shapeblock-menu-field' },
					el( ToggleControl, {
						label: __( 'Icon', TD ),
						checked: 'none' !== shapeblockItemType( node ),
						onChange: function ( v ) { updateAt( path, { iconType: v ? ( ( node.iconType && 'none' !== node.iconType ) ? node.iconType : 'icon' ) : 'none' } ); }
					} ),
					( 'none' !== shapeblockItemType( node ) ) ? el( SelectControl, {
						label: __( 'Type', TD ),
						value: 'image' === shapeblockItemType( node ) ? 'image' : 'icon',
						options: [ { label: __( 'Icon', TD ), value: 'icon' }, { label: __( 'Image', TD ), value: 'image' } ],
						onChange: function ( v ) { updateAt( path, { iconType: v } ); }
					} ) : null,
					( 'icon' === shapeblockItemType( node ) ) ? el( 'div', { className: 'shapeblock-menu-icon-picker' },
						( node.iconName && SHAPEBLOCK_SVG[ node.iconName ] ) ? el( 'span', { className: 'shapeblock-menu-icon-preview', dangerouslySetInnerHTML: { __html: SHAPEBLOCK_SVG[ node.iconName ] } } ) : null,
						el( SelectControl, {
							value: node.iconName || 'arrow-right',
							options: SHAPEBLOCK_ICON_CHOICES,
							onChange: function ( v ) { updateAt( path, { iconName: v } ); }
						} )
					) : null,
					( 'image' === shapeblockItemType( node ) ) ? el( 'div', { className: 'shapeblock-menu-icon-picker' },
						node.iconUrl ? el( 'span', { className: 'shapeblock-menu-icon-thumb' }, el( 'img', { src: node.iconUrl, alt: '' } ) ) : null,
						el( MediaUploadCheck, {},
							el( MediaUpload, {
								allowedTypes: [ 'image' ],
								value: node.iconId,
								onSelect: function ( m ) { updateAt( path, { iconUrl: m.url, iconId: m.id } ); },
								render: function ( o ) {
									return el( Button, { variant: 'secondary', onClick: o.open }, node.iconUrl ? __( 'Replace', TD ) : __( 'Upload image', TD ) );
								}
							} )
						),
						node.iconUrl ? el( Button, { variant: 'link', isDestructive: true, onClick: function () { updateAt( path, { iconUrl: '', iconId: 0 } ); } }, __( 'Remove', TD ) ) : null
					) : null,
					( 'none' !== shapeblockItemType( node ) ) ? el( SelectControl, {
						label: __( 'Icon Side', TD ),
						value: 'left' === node.iconSide ? 'left' : 'right',
						options: [ { label: __( 'Right', TD ), value: 'right' }, { label: __( 'Left', TD ), value: 'left' } ],
						onChange: function ( v ) { updateAt( path, { iconSide: v } ); }
					} ) : null
				);

				var fields = [
					// A small badge on nested editors so it is always clear which level you are editing.
					isTop ? null : el( 'div', { key: 'badge', className: 'shapeblock-menu-level-badge' }, sprintf( __( 'Level %d sub-item', TD ), level ) ),
					el( TextControl, { key: 'label', label: isTop ? __( 'Label', TD ) : sprintf( __( 'Level %d label', TD ), level ), value: shapeblockStripTags( node.label || '' ), onChange: function ( v ) { updateAt( path, { label: v } ); } } ),
					el( 'div', { key: 'link', className: 'shapeblock-menu-field' },
						el( 'div', { className: 'shapeblock-menu-linkfield-label' }, __( 'Link', TD ) ),
						el( LinkPicker, { url: node.url, onPick: function ( v ) {
							// Only the link changes here — the label is edited separately.
							updateAt( path, { url: v.url || '', objectId: v.id || 0, objectType: v.type || '' } );
						} } )
					),
					el( TextControl, { key: 'desc', label: __( 'Description', TD ), value: node.description || '', onChange: function ( v ) { updateAt( path, { description: v } ); } } ),
					el( ToggleControl, { key: 'newtab', label: __( 'Open in new tab', TD ), checked: !! node.newTab, onChange: function ( v ) { updateAt( path, { newTab: v } ); } } ),
					iconField,
					// --- Nested dropdown items ( unlimited depth ). The heading names the level being added,
					//     so the tree is easy to follow: Level 2 = dropdown, Level 3, Level 4, and so on. ---
					el( 'div', { key: 'subs', className: 'shapeblock-menu-subsection' },
						el( 'div', { className: 'shapeblock-menu-section-label' }, sprintf( __( 'Level %d dropdown items', TD ), subLvl ) ),
						childEditors,
						el( Button, { variant: 'secondary', className: 'shapeblock-menu-add-child', onClick: function () { addChildAt( path, blankChild() ); } }, sprintf( __( '+ Add Level %d item', TD ), subLvl ) )
					),
					// --- Actions ---
					el( 'div', { key: 'actions', className: 'shapeblock-menu-item-actions' },
						el( Button, { variant: 'tertiary', onClick: function () { moveAt( path, -1 ); }, disabled: 0 === idx }, '↑' ),
						el( Button, { variant: 'tertiary', onClick: function () { moveAt( path, 1 ); }, disabled: idx === siblingCount - 1 }, '↓' ),
						el( Button, { isDestructive: true, variant: 'link', onClick: function () { removeAt( path ); } }, isTop ? __( 'Remove item', TD ) : __( 'Remove sub-item', TD ) )
					)
				];

				if ( isTop ) {
					return el( PanelBody, {
						key: 'i' + idx,
						className: 'shapeblock-menu-item-panel',
						title: shapeblockStripTags( node.label || '' ).trim() || __( 'Untitled', TD ),
						initialOpen: false
					}, fields );
				}
				return el( 'div', { key: 'c' + idx, className: 'shapeblock-menu-item-editor is-child' }, fields );
			}

			var itemEditors = items.map( function ( item, i ) {
				return renderItemEditor( item, [ i ], items.length );
			} );

			// Each item is its own collapsible panel ( titled with the item's name ); an "Add Item"
			// button under the list opens the same page / URL / Create-page popover as the canvas "+".
			var addItemEl = el( 'div', { className: 'shapeblock-menu-additem-row' },
				el( Dropdown, {
					className: 'shapeblock-menu-additem-dropdown',
					popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'bottom-start' },
					renderToggle: function ( t ) {
						return el( Button, { variant: 'primary', onClick: t.onToggle, 'aria-expanded': t.isOpen }, __( '+ Add Item', TD ) );
					},
					renderContent: function ( c ) {
						return el( AddMenuSearch, { onPick: function ( v ) { addLinkItem( v ); c.onClose(); } } );
					}
				} )
			);

			// Import a menu built in the Dashboard ( Appearance → Menus ) into this block.
			var wpMenuPicker = el(
				PanelBody,
				{ title: __( 'Import from WordPress Menu', TD ), initialOpen: false },
				wpMenus.length ? el( SelectControl, {
					label: __( 'Menu', TD ),
					value: selMenu,
					options: [ { label: __( '— Select a menu —', TD ), value: '' } ].concat(
						wpMenus.map( function ( m ) { return { label: shapeblockStripTags( ( m.name || '' ) ) || ( '#' + m.id ), value: String( m.id ) }; } )
					),
					onChange: setSelMenu
				} ) : el( 'p', { className: 'shapeblock-menu-section-label' }, __( 'No menus found. Create one under Appearance → Menus.', TD ) ),
				el( Button, {
					variant: 'secondary',
					disabled: ! selMenu || loadingMenu,
					onClick: function () { shapeblockLoadWpMenu( selMenu ); }
				}, loadingMenu ? __( 'Loading…', TD ) : __( 'Load menu items', TD ) ),
				el( 'p', { className: 'shapeblock-menu-section-label', style: { marginTop: '8px' } }, __( 'This replaces the items above with the selected menu.', TD ) )
			);

			// Dropdown settings ( always available in the Settings tab ).
			var dropdownPanel = el(
				PanelBody,
				{ title: __( 'Dropdown', TD ), initialOpen: false },
				shapeblockToggleGroup( {
					label: __( 'Submenu Visibility', TD ),
					help: __( 'How the dropdown opens on the live site ( and in this preview ). Edit dropdown items from each item panel under Menu.', TD ),
					value: 'click' === attributes.submenuTrigger ? 'click' : 'hover',
					options: [ { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Click', TD ), value: 'click' } ],
					onChange: function ( v ) { setAttributes( { submenuTrigger: v } ); }
				} ),
				shapeblockToggleGroup( {
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
				el( ToggleGroupOption, { value: 'horizontal', icon: SHAPEBLOCK_UI_ICONS.horizontal, label: __( 'Horizontal', TD ) } ),
				el( ToggleGroupOption, { value: 'vertical', icon: SHAPEBLOCK_UI_ICONS.vertical, label: __( 'Vertical', TD ) } )
			) : el( SelectControl, { label: __( 'Orientation', TD ), value: attributes.layout, options: [ { label: __( 'Horizontal', TD ), value: 'horizontal' }, { label: __( 'Vertical', TD ), value: 'vertical' } ], onChange: function ( v ) { setAttributes( { layout: v } ); } } );

			var justifyCtrl = useIconGroups ? el( ToggleGroupControl, {
				label: __( 'Justification', TD ),
				value: attributes.alignment || 'left',
				isBlock: true,
				onChange: function ( v ) { setAttributes( { alignment: v } ); }
			},
				el( ToggleGroupOption, { value: 'left', icon: SHAPEBLOCK_UI_ICONS.alignLeft, label: __( 'Left', TD ) } ),
				el( ToggleGroupOption, { value: 'center', icon: SHAPEBLOCK_UI_ICONS.alignCenter, label: __( 'Center', TD ) } ),
				el( ToggleGroupOption, { value: 'right', icon: SHAPEBLOCK_UI_ICONS.alignRight, label: __( 'Right', TD ) } )
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
			var gapDevices = el( 'div', { className: 'shapeblock-menu-devices' },
				[ [ 'desktop', 'dashicons-desktop', __( 'Desktop', TD ) ], [ 'tablet', 'dashicons-tablet', __( 'Tablet', TD ) ], [ 'mobile', 'dashicons-smartphone', __( 'Mobile', TD ) ] ].map( function ( d ) {
					return el( Button, {
						key: d[0],
						label: d[2],
						showTooltip: true,
						isPressed: device === d[0],
						onClick: function () { setDevice( d[0] ); shapeblockSetPreview( d[0] ); }
					}, el( 'span', { className: 'dashicons ' + d[1] } ) );
				} )
			);
			var gapToggle = shapeblockToggleGroup( {
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
				el( 'div', { className: 'shapeblock-menu-linkfield-label', style: { marginTop: '4px' } }, __( 'Item Gap', TD ) ),
				gapDevices,
				gapToggle,
				gapCustom,
				el( ToggleControl, { label: __( 'Allow to wrap to multiple lines', TD ), checked: false !== attributes.menuWrap, onChange: function ( v ) { setAttributes( { menuWrap: v } ); } } )
			);

			// Font Size — responsive ( per-device: fontSize=desktop, fontSizeTablet, fontSizeMobile ).
			var fontAttrKey = ( 'tablet' === device ) ? 'fontSizeTablet' : ( 'mobile' === device ? 'fontSizeMobile' : 'fontSize' );
			var fontDevVal  = attributes[ fontAttrKey ] || '';
			var fontPreset  = ( [ '', '14px', '16px', '18px', '22px' ].indexOf( fontDevVal ) !== -1 ) ? fontDevVal : 'custom';
			function setFontDevice( val ) {
				var patch = {};
				patch[ fontAttrKey ] = val || '';
				setAttributes( patch );
			}
			var fontDevices = el( 'div', { className: 'shapeblock-menu-devices' },
				[ [ 'desktop', 'dashicons-desktop', __( 'Desktop', TD ) ], [ 'tablet', 'dashicons-tablet', __( 'Tablet', TD ) ], [ 'mobile', 'dashicons-smartphone', __( 'Mobile', TD ) ] ].map( function ( d ) {
					return el( Button, {
						key: d[0],
						label: d[2],
						showTooltip: true,
						isPressed: device === d[0],
						onClick: function () { setDevice( d[0] ); shapeblockSetPreview( d[0] ); }
					}, el( 'span', { className: 'dashicons ' + d[1] } ) );
				} )
			);
			var fontToggle = shapeblockToggleGroup( {
				label: __( 'Font Size', TD ),
				value: fontPreset,
				options: [ { label: __( 'Def', TD ), value: '' }, { label: 'S', value: '14px' }, { label: 'M', value: '16px' }, { label: 'L', value: '18px' }, { label: 'XL', value: '22px' }, { label: __( 'Custom', TD ), value: 'custom' } ],
				onChange: function ( v ) { setFontDevice( 'custom' === v ? ( 'custom' === fontPreset ? fontDevVal : '20px' ) : v ); }
			} );
			var fontCustom = ( 'custom' === fontPreset ) ? el( RangeControl, {
				label: __( 'Custom Size (px)', TD ),
				value: parseInt( fontDevVal, 10 ) || 16,
				min: 8,
				max: 72,
				step: 1,
				onChange: function ( v ) { setFontDevice( ( v || 0 ) + 'px' ); }
			} ) : null;

			var typographyPanel = el(
				PanelBody,
				{ title: __( 'Typography', TD ), initialOpen: false },
				el( SelectControl, {
					label: __( 'Font Family', TD ),
					value: attributes.fontFamily || '',
					options: shapeblockFontOptions(),
					onChange: function ( v ) { setAttributes( { fontFamily: v } ); }
				} ),
				el( 'div', { className: 'shapeblock-menu-linkfield-label', style: { marginTop: '4px' } }, __( 'Font Size', TD ) ),
				fontDevices,
				fontToggle,
				fontCustom,
				shapeblockToggleGroup( {
					label: __( 'Font Weight', TD ),
					value: attributes.fontWeight || '',
					options: [ { label: __( 'Def', TD ), value: '' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' } ],
					onChange: function ( v ) { setAttributes( { fontWeight: v } ); }
				} ),
				shapeblockToggleGroup( {
					label: __( 'Text Transform', TD ),
					value: attributes.textTransform || '',
					options: [ { label: __( 'Def', TD ), value: '' }, { label: 'AB', value: 'uppercase' }, { label: 'ab', value: 'lowercase' }, { label: 'Ab', value: 'capitalize' }, { label: __( 'None', TD ), value: 'none' } ],
					onChange: function ( v ) { setAttributes( { textTransform: v } ); }
				} )
			);

			// A small helper: a solid-colour picker bound to one attribute key.
			function shapeblockColorPicker( attrKey ) {
				var val = attributes[ attrKey ] || '';
				var onSet = function ( v ) { var p = {}; p[ attrKey ] = v || ''; setAttributes( p ); };
				return ColorPalette ? el( ColorPalette, { value: val, onChange: onSet } ) : colorRow( __( 'Color', TD ), val, onSet );
			}
			// A background picker offering BOTH a solid colour and a gradient. Solid and gradient are stored
			// in SEPARATE attributes ( like core ); each handler writes only its own key so neither clears
			// the other. The CSS then prefers the gradient when set, otherwise the solid colour.
			function shapeblockBgPicker( solidKey, gradKey ) {
				if ( ColorGradientControl ) {
					return el( ColorGradientControl, {
						__nextHasNoMargin: true,
						colors: colorGradientSettings.colors,
						gradients: colorGradientSettings.gradients,
						colorValue: attributes[ solidKey ] || undefined,
						gradientValue: attributes[ gradKey ] || undefined,
						onColorChange: function ( c ) { var p = {}; p[ solidKey ] = c || ''; setAttributes( p ); },
						onGradientChange: function ( g ) { var p = {}; p[ gradKey ] = g || ''; setAttributes( p ); }
					} );
				}
				// Fallback ( older WP ): solid colour only.
				return shapeblockColorPicker( solidKey );
			}
			function shapeblockColorLabel( text ) {
				return el( 'div', { className: 'shapeblock-menu-linkfield-label', style: { marginTop: '14px' } }, text );
			}

			// Text colour: Text / Hover / Active toggle drives one picker.
			var colorAttrKey = ( 'hover' === colorState ) ? 'hoverColor' : ( 'active' === colorState ? 'activeColor' : 'textColor' );
			// Item background: Normal / Hover / Active toggle drives one picker ( solid + gradient keys ).
			var bgAttrKey = ( 'hover' === bgState ) ? 'itemBgHoverColor' : ( 'active' === bgState ? 'itemBgActiveColor' : 'itemBgColor' );
			var bgGradKey = ( 'hover' === bgState ) ? 'itemBgHoverGradient' : ( 'active' === bgState ? 'itemBgActiveGradient' : 'itemBgGradient' );
			// Dropdown text: Text / Hover toggle drives one picker.
			var ddTextKey = ( 'hover' === ddState ) ? 'dropdownHoverColor' : 'dropdownTextColor';
			// Mobile text + background keys ( Text/Hover/Active and Normal/Hover/Active ).
			var mTextKey   = ( 'hover' === mTextState ) ? 'mobileHoverColor' : ( 'active' === mTextState ? 'mobileActiveColor' : 'mobileTextColor' );
			var mBgKey     = ( 'hover' === mBgState ) ? 'mobileBgHoverColor' : ( 'active' === mBgState ? 'mobileBgActiveColor' : 'mobileBgColor' );
			var mBgGradKey = ( 'hover' === mBgState ) ? 'mobileBgHoverGradient' : ( 'active' === mBgState ? 'mobileBgActiveGradient' : 'mobileBgGradient' );

			var colorsPanel = el(
				PanelBody,
				{ title: __( 'Colors', TD ), initialOpen: true },
				// --- Item text colour ---
				shapeblockToggleGroup( {
					label: __( 'Item Text', TD ),
					value: colorState,
					options: [ { label: __( 'Text', TD ), value: 'text' }, { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Active', TD ), value: 'active' } ],
					onChange: setColorState
				} ),
				shapeblockColorPicker( colorAttrKey ),
				// --- Item background colour ---
				shapeblockColorLabel( __( 'Item Background', TD ) ),
				shapeblockToggleGroup( {
					value: bgState,
					options: [ { label: __( 'Normal', TD ), value: 'normal' }, { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Active', TD ), value: 'active' } ],
					onChange: setBgState
				} ),
				shapeblockBgPicker( bgAttrKey, bgGradKey ),
				// --- Description colour ---
				shapeblockColorLabel( __( 'Description Color', TD ) ),
				shapeblockColorPicker( 'descriptionColor' )
			);

			// Dropdown colours: their own collapsible panel under the Style tab.
			var dropdownColorsPanel = el(
				PanelBody,
				{ title: __( 'Dropdown Colors', TD ), initialOpen: false },
				shapeblockColorLabel( __( 'Dropdown Background', TD ) ),
				shapeblockBgPicker( 'dropdownBg', 'dropdownBgGradient' ),
				shapeblockColorLabel( __( 'Dropdown Item Text', TD ) ),
				shapeblockToggleGroup( {
					value: ddState,
					options: [ { label: __( 'Text', TD ), value: 'text' }, { label: __( 'Hover', TD ), value: 'hover' } ],
					onChange: setDdState
				} ),
				shapeblockColorPicker( ddTextKey ),
				shapeblockColorLabel( __( 'Dropdown Item Hover Background', TD ) ),
				shapeblockBgPicker( 'dropdownHoverBg', 'dropdownHoverBgGradient' )
			);

			// Mobile ( drawer ) colours: their own collapsible panel. These override the desktop colours
			// only when the mobile drawer is active, so the mobile menu can be styled separately.
			var mobilePanel = el(
				PanelBody,
				{ title: __( 'Mobile Colors', TD ), initialOpen: false },
				shapeblockColorLabel( __( 'Item Text', TD ) ),
				shapeblockToggleGroup( {
					value: mTextState,
					options: [ { label: __( 'Text', TD ), value: 'text' }, { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Active', TD ), value: 'active' } ],
					onChange: setMTextState
				} ),
				shapeblockColorPicker( mTextKey ),
				shapeblockColorLabel( __( 'Item Background', TD ) ),
				shapeblockToggleGroup( {
					value: mBgState,
					options: [ { label: __( 'Normal', TD ), value: 'normal' }, { label: __( 'Hover', TD ), value: 'hover' }, { label: __( 'Active', TD ), value: 'active' } ],
					onChange: setMBgState
				} ),
				shapeblockBgPicker( mBgKey, mBgGradKey )
			);

			// ---- Inspector: Responsive ----
			var responsivePanel = el(
				PanelBody,
				{ title: __( 'Responsive', TD ), initialOpen: false },
				shapeblockToggleGroup( {
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
				( 'off' !== mobileMode ) ? shapeblockToggleGroup( {
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
				// Where the hamburger sits once the overlay is on.
				( 'off' !== mobileMode ) ? ( useIconGroups ? el( ToggleGroupControl, {
					label: __( 'Hamburger Alignment', TD ),
					value: attributes.toggleAlign || 'left',
					isBlock: true,
					onChange: function ( v ) { setAttributes( { toggleAlign: v || 'left' } ); }
				},
					el( ToggleGroupOption, { value: 'left', icon: SHAPEBLOCK_UI_ICONS.alignLeft, label: __( 'Left', TD ) } ),
					el( ToggleGroupOption, { value: 'center', icon: SHAPEBLOCK_UI_ICONS.alignCenter, label: __( 'Center', TD ) } ),
					el( ToggleGroupOption, { value: 'right', icon: SHAPEBLOCK_UI_ICONS.alignRight, label: __( 'Right', TD ) } )
				) : el( SelectControl, {
					label: __( 'Hamburger Alignment', TD ),
					value: attributes.toggleAlign || 'left',
					options: [ { label: __( 'Left', TD ), value: 'left' }, { label: __( 'Center', TD ), value: 'center' }, { label: __( 'Right', TD ), value: 'right' } ],
					onChange: function ( v ) { setAttributes( { toggleAlign: v || 'left' } ); }
				} ) ) : null,
				( 'off' !== mobileMode ) ? colorRow( __( 'Drawer Background', TD ), attributes.drawerBg, function ( v ) { setAttributes( { drawerBg: v } ); } ) : null,

				// Button skin. The outer tabs pick which button is being styled and the inner
				// tabs pick the state, so the hamburger and the drawer close button each keep
				// their own six colours. Left empty a colour falls back to the stylesheet
				// ( transparent background, currentColor border ).
				( 'off' !== mobileMode ) ? el( 'div', { className: 'shapeblock-menu-toggle-colors', style: { marginTop: '12px' } },
					el( 'p', { className: 'shapeblock-menu-section-label', style: { margin: '0 0 6px', fontWeight: 600 } }, __( 'Buttons', TD ) ),
					el( TabPanel, {
						className: 'shapeblock-menu-button-tabs shapeblock-inspector-tabs',
						activeClass: 'is-active',
						tabs: [
							{ name: 'hamburger', title: __( 'Hamburger', TD ) },
							{ name: 'close', title: __( 'Close', TD ) }
						]
					}, function ( target ) {
						var prefix = 'close' === target.name ? 'close' : 'toggle';
						return el( TabPanel, {
							className: 'shapeblock-menu-state-tabs shapeblock-inspector-tabs',
							activeClass: 'is-active',
							tabs: [
								{ name: 'normal', title: __( 'Normal', TD ) },
								{ name: 'hover', title: __( 'Hover', TD ) }
							]
						}, function ( state ) {
							var isHover = 'hover' === state.name;
							// Builds toggleColor / toggleBgHover / closeBorderColor / ... from the two tabs.
							var row = function ( label, base ) {
								var key = prefix + base + ( isHover ? 'Hover' : '' );
								return colorRow( label, attributes[ key ], function ( v ) {
									var next = {};
									next[ key ] = v;
									setAttributes( next );
								} );
							};
							return el( 'div', { style: { marginTop: '12px' } },
								row( __( 'Icon Color', TD ), 'Color' ),
								row( __( 'Background', TD ), 'Bg' ),
								row( __( 'Border Color', TD ), 'BorderColor' ),
								( 'close' === prefix && ! isHover ) ? el( 'p', { className: 'shapeblock-menu-section-label', style: { margin: '4px 0 0', opacity: 0.7 } },
									__( 'Leave Icon Color empty to follow the hamburger.', TD ) ) : null
							);
						} );
					} )
				) : null
			);

			// ---- Live preview (links do NOT navigate in the editor) ----
			// Recursive canvas renderer. `path` locates the node in the tree ( [i], [i,ci], [i,ci,gci] … ),
			// so the label, caret and sub-menu work identically at every nesting level.
			function renderNode( node, path ) {
				var key    = 'nd-' + path.join( '-' );
				var kids   = ( node.children && node.children.length ) ? node.children : [];
				var itSide = 'left' === node.iconSide ? 'left' : 'right';
				var itype  = shapeblockItemType( node );
				var iconEl = null;
				if ( 'image' === itype && node.iconUrl ) {
					iconEl = el( 'span', { className: 'shapeblock-menu-item-icon shapeblock-menu-item-icon--' + itSide, 'aria-hidden': 'true' },
						el( 'img', { className: 'shapeblock-menu-item-img', src: node.iconUrl, alt: '' } ) );
				} else if ( 'icon' === itype && node.iconName && SHAPEBLOCK_SVG[ node.iconName ] ) {
					iconEl = el( 'span', {
						className: 'shapeblock-menu-item-icon shapeblock-menu-item-icon--' + itSide,
						'aria-hidden': 'true',
						dangerouslySetInnerHTML: { __html: SHAPEBLOCK_SVG[ node.iconName ] }
					} );
				}

				var textEl = el( 'span', { className: 'shapeblock-menu-text' },
					// The label is editable right in the preview via RichText; selecting text shows the
					// Bold / Italic toolbar. Line breaks stay off ( a menu label is a single line ).
					el( RichText, {
						identifier: 'shapeblock-label-' + key,
						tagName: 'span',
						className: 'shapeblock-menu-label',
						value: node.label || '',
						allowedFormats: [ 'core/bold', 'core/italic' ],
						disableLineBreaks: true,
						placeholder: __( 'Label', TD ),
						onFocus: function () { setActivePath( path ); },
						onChange: function ( v ) { updateAt( path, { label: v } ); },
						// Backspace on an already-empty label removes the whole item.
						onKeyDown: function ( e ) {
							if ( 'Backspace' === e.key && ! shapeblockStripTags( node.label || '' ).trim() ) {
								e.preventDefault();
								removeAt( path );
							}
						}
					} ),
					node.description ? el( 'span', { className: 'shapeblock-menu-desc' }, node.description ) : null
				);

				var ddVal = attributes.dropdownIcon || 'caret';
				var ddKey = shapeblockDropdownKey( ddVal );

				// Content for the sub-menu picker popover ( search page / URL / create ). Adds under THIS node.
				function subPickerContent( c ) {
					return el( AddMenuSearch, { onPick: function ( v ) { addChildLinkAt( path, v ); c.onClose(); } } );
				}

				// The caret shows only when this node actually has a dropdown. It doubles as a button that
				// opens the popover to add more sub-items. ( The first sub-item is added from the Inspector. )
				var subToggle = null;
				if ( kids.length ) {
					if ( showDrawer ) {
						// In the mobile-drawer preview the caret toggles the accordion ( like the front end ).
						var ap = { type: 'button', className: 'shapeblock-menu-sub-toggle shapeblock-menu-sub-trigger shapeblock-menu-sub-toggle--' + ( 'none' === ddVal ? 'none' : ddVal ), 'aria-label': __( 'Toggle sub-menu', TD ), onClick: function () { toggleSubOpen( key ); } };
						if ( ddKey ) { ap.dangerouslySetInnerHTML = { __html: SHAPEBLOCK_SVG[ ddKey ] }; }
						subToggle = el( 'button', ap );
					} else {
						subToggle = el( Dropdown, {
							className: 'shapeblock-menu-subadd',
							popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'bottom-start' },
							renderToggle: function ( t ) {
								var p = { type: 'button', className: 'shapeblock-menu-sub-toggle shapeblock-menu-sub-trigger shapeblock-menu-sub-toggle--' + ( 'none' === ddVal ? 'none' : ddVal ), 'aria-label': __( 'Add sub-menu', TD ), 'aria-expanded': t.isOpen, onClick: t.onToggle };
								if ( ddKey ) { p.dangerouslySetInnerHTML = { __html: SHAPEBLOCK_SVG[ ddKey ] }; }
								return el( 'button', p );
							},
							renderContent: subPickerContent
						} );
					}
				} else if ( path.length >= 2 && ! showDrawer ) {
					// A leaf item inside a dropdown gets a small "+" on its right that adds the NEXT level
					// under it ( Level 3, then Level 4, and so on ) — no need to open the Inspector.
					subToggle = el( Dropdown, {
						className: 'shapeblock-menu-subadd shapeblock-menu-subadd--leaf',
						popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'right-start' },
						renderToggle: function ( t ) {
							return el( Button, { icon: plusIcon, className: 'shapeblock-menu-sub-plus', label: sprintf( __( 'Add Level %d item', TD ), path.length + 1 ), showTooltip: true, 'aria-expanded': t.isOpen, onClick: t.onToggle } );
						},
						renderContent: subPickerContent
					} );
				}

				var hasLeafAdd = ( ! kids.length && subToggle );

				// Children ( recurse ) + a trailing "+" to add another sub-item at this level.
				var subMenuEl = null;
				if ( kids.length ) {
					var childLis = kids.map( function ( c, ci ) { return renderNode( c, path.concat( ci ) ); } );
					childLis.push( el( 'li', { key: 'sc-add', className: 'shapeblock-menu-add-item shapeblock-menu-subadd-item' },
						el( Dropdown, {
							popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'bottom-start' },
							renderToggle: function ( t ) {
								return el( Button, { icon: plusIcon, variant: 'secondary', className: 'shapeblock-menu-add-btn', label: __( 'Add sub-menu item', TD ), showTooltip: true, 'aria-expanded': t.isOpen, onClick: t.onToggle } );
							},
							renderContent: subPickerContent
						} )
					) );
					subMenuEl = el( 'ul', { className: 'sub-menu' }, childLis );
				}

				return el(
					'li',
					{ key: key, className: 'menu-item' + ( kids.length ? ' menu-item-has-children' : '' ) + ( hasLeafAdd ? ' shapeblock-menu-has-add' : '' ) + ( showDrawer && kids.length && openSubs[ key ] ? ' is-sub-open' : '' ) },
					el( 'a', { href: node.url || '#', onClick: function ( e ) { e.preventDefault(); } },
						'left' === itSide ? iconEl : null,
						textEl,
						'right' === itSide ? iconEl : null,
						// The caret / "+" lives INSIDE the link ( like the front end ) so it sits within
						// the item's background pill and picks up the exact same styling.
						subToggle
					),
					subMenuEl
				);
			}

			var addControl = el( Dropdown, {
				className: 'shapeblock-menu-add-dropdown',
				popoverProps: { className: 'shapeblock-menu-add-pop', placement: 'bottom-start' },
				renderToggle: function ( t ) {
					return el( Button, { icon: plusIcon, variant: 'secondary', className: 'shapeblock-menu-add-btn', label: __( 'Add menu item', TD ), showTooltip: true, 'aria-expanded': t.isOpen, onClick: t.onToggle } );
				},
				renderContent: function ( c ) {
					return el( AddMenuSearch, { onPick: function ( v ) { addLinkItem( v ); c.onClose(); } } );
				}
			} );

			var previewClass = 'shapeblock-menu shapeblock-menu--' + ( 'vertical' === attributes.layout ? 'vertical' : 'horizontal' ) + ' shapeblock-menu-align-' + ( attributes.alignment || 'left' ) + ( 'click' === attributes.submenuTrigger ? ' shapeblock-menu-click' : '' );

			var lis = items.map( function ( item, i ) {
				return renderNode( item, [ i ] );
			} );
			lis.push( el( 'li', { key: 'shapeblock-add', className: 'shapeblock-menu-add-item' }, addControl ) );


			// Editor-scoped colour/gap preview. render.php builds the same rules for the front-end;
			// here we mirror them so the colour pickers update the live editor preview too.
			var editorId = 'shapeblock-menu-ed-' + String( props.clientId || '' ).replace( /[^a-zA-Z0-9_-]/g, '' );
			var edSel    = '#' + editorId;
			var edCss    = '';
			var edImport = ''; // Google Fonts @import — must stay first in the stylesheet.
			// Show the gap for the CURRENTLY selected device directly ( the editor canvas isn't
			// actually resized, so media queries wouldn't fire ). Tablet/Mobile inherit desktop.
			var edGap = ( 'tablet' === device ) ? ( attributes.gapTablet || attributes.itemGap ) : ( 'mobile' === device ? ( attributes.gapMobile || attributes.itemGap ) : attributes.itemGap );
			if ( edGap ) { edCss += edSel + ' .shapeblock-menu-list{gap:' + edGap + ';}'; }
			var edFont = '';
			if ( attributes.fontFamily && shapeblockIsWebSafe( attributes.fontFamily ) ) {
				edFont += 'font-family:' + SHAPEBLOCK_FONTS[ attributes.fontFamily ] + ';';
			} else if ( attributes.fontFamily ) {
				// A Google font family name — load it and apply it.
				edImport += "@import url('" + shapeblockGoogleFontUrl( attributes.fontFamily ) + "');";
				edFont += 'font-family:"' + attributes.fontFamily + '",sans-serif;';
			}
			// Show the font size for the CURRENTLY selected device ( tablet/mobile fall back to desktop ).
			var edFontSize = ( 'tablet' === device ) ? ( attributes.fontSizeTablet || attributes.fontSize ) : ( 'mobile' === device ? ( attributes.fontSizeMobile || attributes.fontSize ) : attributes.fontSize );
			if ( edFontSize ) { edFont += 'font-size:' + edFontSize + ';'; }
			if ( attributes.fontWeight ) { edFont += 'font-weight:' + attributes.fontWeight + ';'; }
			if ( attributes.textTransform ) { edFont += 'text-transform:' + attributes.textTransform + ';'; }
			if ( edFont ) {
				edCss += edSel + ' .shapeblock-menu-list a{' + edFont + '}';
			}
			if ( attributes.textColor ) {
				edCss += edSel + ' .shapeblock-menu-list a{color:' + attributes.textColor + ';}';
			}
			if ( attributes.hoverColor ) {
				edCss += edSel + ' .shapeblock-menu-list a:hover,' + edSel + ' .shapeblock-menu-list a:focus{color:' + attributes.hoverColor + ';}';
			}
			if ( attributes.activeColor ) {
				edCss += edSel + ' .shapeblock-menu-list .current-menu-item > a{color:' + attributes.activeColor + ';}';
			}
			if ( attributes.descriptionColor ) {
				edCss += edSel + ' .shapeblock-menu-desc{color:' + attributes.descriptionColor + ';}';
			}
			// Item background ( normal / hover / active ). Any background opts the items into padded pills.
			// Backgrounds prefer the gradient when set, otherwise the solid colour.
			var edItemBgN = attributes.itemBgGradient || attributes.itemBgColor;
			var edItemBgH = attributes.itemBgHoverGradient || attributes.itemBgHoverColor;
			var edItemBgA = attributes.itemBgActiveGradient || attributes.itemBgActiveColor;
			var edDdBg    = attributes.dropdownBgGradient || attributes.dropdownBg;
			var edDdHovBg = attributes.dropdownHoverBgGradient || attributes.dropdownHoverBg;
			if ( edItemBgN || edItemBgH || edItemBgA ) {
				edCss += edSel + ' .shapeblock-menu-list > li > a{padding:8px 14px;border-radius:6px;}';
			}
			if ( edItemBgN ) {
				edCss += edSel + ' .shapeblock-menu-list > li > a{background:' + edItemBgN + ';}';
			}
			if ( edItemBgH ) {
				edCss += edSel + ' .shapeblock-menu-list > li > a:hover,' + edSel + ' .shapeblock-menu-list > li > a:focus{background:' + edItemBgH + ';}';
			}
			if ( edItemBgA ) {
				edCss += edSel + ' .shapeblock-menu-list > li.current-menu-item > a{background:' + edItemBgA + ';}';
			}
			// Dropdown ( sub-menu ) colours.
			if ( edDdBg ) {
				edCss += edSel + ' .sub-menu{background:' + edDdBg + ';}';
			}
			if ( attributes.dropdownTextColor ) {
				edCss += edSel + ' .sub-menu a{color:' + attributes.dropdownTextColor + ';}';
			}
			if ( attributes.dropdownHoverColor ) {
				edCss += edSel + ' .sub-menu a:hover,' + edSel + ' .sub-menu a:focus{color:' + attributes.dropdownHoverColor + ';}';
			}
			if ( edDdHovBg ) {
				edCss += edSel + ' .sub-menu a:hover,' + edSel + ' .sub-menu a:focus{background:' + edDdHovBg + ';}';
			}

			// Mobile-menu drawer preview ( showDrawer computed near the top of edit ).
			if ( showDrawer ) {
				// Same off-canvas drawer as the front end ( slide-in panel + overlay + close ).
				var edSide = 'left' === attributes.drawerSide ? 'left' : 'right';
				var edOff  = 'left' === edSide ? '-100%' : '100%';
				var edW    = ( attributes.drawerWidth || 320 ) + 'px';
				var edBg   = attributes.drawerBg || '#ffffff';
				// Mirrors the front end: display:flex so the auto margins can place it.
				var edTAlign = attributes.toggleAlign || 'left';
				var edTMargin = 'center' === edTAlign
					? 'margin-left:auto;margin-right:auto;'
					: ( 'right' === edTAlign ? 'margin-left:auto;margin-right:0;' : 'margin-left:0;margin-right:auto;' );
				edCss += edSel + ' .shapeblock-menu-toggle{display:flex;' + edTMargin + '}';
				edCss += edSel + ' .shapeblock-menu-close{display:flex;}';

				// Hamburger skin — same rules the front end prints, so the preview matches.
				var edTgl    = edSel + ' .shapeblock-menu-toggle';
				var edTglHov = edTgl + ':hover,' + edTgl + ':focus';
				if ( attributes.toggleColor ) { edCss += edTgl + '{color:' + attributes.toggleColor + ';}'; }
				if ( attributes.toggleBg ) { edCss += edTgl + '{background:' + attributes.toggleBg + ';}'; }
				if ( attributes.toggleBorderColor ) { edCss += edTgl + '{border-color:' + attributes.toggleBorderColor + ';}'; }
				if ( attributes.toggleColorHover ) { edCss += edTglHov + '{color:' + attributes.toggleColorHover + ';}'; }
				if ( attributes.toggleBgHover ) { edCss += edTglHov + '{background:' + attributes.toggleBgHover + ';}'; }
				if ( attributes.toggleBorderColorHover ) { edCss += edTglHov + '{border-color:' + attributes.toggleBorderColorHover + ';}'; }

				// Close button skin — closeColor falls back to toggleColor, matching render.php.
				var edCls    = edSel + ' .shapeblock-menu-close';
				var edClsHov = edCls + ':hover,' + edCls + ':focus';
				var edClsCol = attributes.closeColor || attributes.toggleColor;
				if ( edClsCol ) { edCss += edCls + '{color:' + edClsCol + ';}'; }
				if ( attributes.closeBg ) { edCss += edCls + '{background:' + attributes.closeBg + ';}'; }
				if ( attributes.closeBorderColor ) { edCss += edCls + '{border-color:' + attributes.closeBorderColor + ';}'; }
				if ( attributes.closeColorHover ) { edCss += edClsHov + '{color:' + attributes.closeColorHover + ';}'; }
				if ( attributes.closeBgHover ) { edCss += edClsHov + '{background:' + attributes.closeBgHover + ';}'; }
				if ( attributes.closeBorderColorHover ) { edCss += edClsHov + '{border-color:' + attributes.closeBorderColorHover + ';}'; }
				edCss += edSel + ' .shapeblock-menu-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;z-index:9998;}';
				edCss += edSel + '.is-open .shapeblock-menu-overlay{opacity:1;visibility:visible;}';
				edCss += edSel + ' .shapeblock-menu-panel{display:block;position:fixed;top:0;bottom:0;' + edSide + ':0;width:' + edW + ';max-width:85vw;background:' + edBg + ';transform:translateX(' + edOff + ');transition:transform 0.3s ease;z-index:9999;overflow-y:auto;padding:56px 22px 28px;}';
				edCss += edSel + '.is-open .shapeblock-menu-panel{transform:translateX(0);}';
				edCss += edSel + ' .shapeblock-menu-list{flex-direction:column;align-items:stretch;width:100%;gap:6px;}';
				edCss += edSel + ' .shapeblock-menu-list li{width:100%;}';
				edCss += edSel + ' .shapeblock-menu-list a{display:flex;align-items:center;width:100%;padding:12px 14px;}';
				edCss += edSel + ' .shapeblock-menu-list .shapeblock-menu-sub-toggle,' + edSel + ' .shapeblock-menu-list .shapeblock-menu-subadd{flex:0 0 auto;margin-left:auto;}';
				edCss += edSel + ' .shapeblock-menu-list .sub-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;border-radius:0;min-width:0;width:100%;padding:0 0 0 14px;max-height:0;overflow:hidden;transition:max-height 0.35s ease;}';
				edCss += edSel + ' .menu-item-has-children.is-sub-open > .sub-menu{max-height:1200px;}';

				// Mobile-only colours ( override desktop colours while the drawer is active ).
				var edMBgN = attributes.mobileBgGradient || attributes.mobileBgColor;
				var edMBgH = attributes.mobileBgHoverGradient || attributes.mobileBgHoverColor;
				var edMBgA = attributes.mobileBgActiveGradient || attributes.mobileBgActiveColor;
				if ( attributes.mobileTextColor ) { edCss += edSel + ' .shapeblock-menu-list a{color:' + attributes.mobileTextColor + ';}'; }
				if ( attributes.mobileHoverColor ) { edCss += edSel + ' .shapeblock-menu-list a:hover,' + edSel + ' .shapeblock-menu-list a:focus{color:' + attributes.mobileHoverColor + ';}'; }
				if ( attributes.mobileActiveColor ) { edCss += edSel + ' .shapeblock-menu-list .current-menu-item > a{color:' + attributes.mobileActiveColor + ';}'; }
				if ( edMBgN ) { edCss += edSel + ' .shapeblock-menu-list > li > a{background:' + edMBgN + ';border-radius:6px;}'; }
				if ( edMBgH ) { edCss += edSel + ' .shapeblock-menu-list > li > a:hover,' + edSel + ' .shapeblock-menu-list > li > a:focus{background:' + edMBgH + ';}'; }
				if ( edMBgA ) { edCss += edSel + ' .shapeblock-menu-list > li.current-menu-item > a{background:' + edMBgA + ';}'; }
			} else {
				edCss += edSel + ' .shapeblock-menu-panel{display:contents;}';
				edCss += edSel + ' .shapeblock-menu-toggle,' + edSel + ' .shapeblock-menu-close{display:none;}';
				edCss += edSel + ' .shapeblock-menu-overlay{display:none;}';
			}

			var previewToggle = showDrawer ? el( 'button', {
				type: 'button',
				className: 'shapeblock-menu-toggle',
				'aria-label': __( 'Toggle menu', TD ),
				onClick: function () { setOpenPreview( ! isOpenPreview ); }
			},
				el( 'span', { className: 'shapeblock-menu-toggle-bar' } ),
				el( 'span', { className: 'shapeblock-menu-toggle-bar' } ),
				el( 'span', { className: 'shapeblock-menu-toggle-bar' } )
			) : null;

			var previewOverlay = showDrawer ? el( 'div', { className: 'shapeblock-menu-overlay', 'aria-hidden': 'true', onClick: function () { setOpenPreview( false ); } } ) : null;
			var previewClose = showDrawer ? el( 'button', {
				type: 'button',
				className: 'shapeblock-menu-close',
				'aria-label': __( 'Close menu', TD ),
				onClick: function () { setOpenPreview( false ); },
				dangerouslySetInnerHTML: { __html: '<svg class="shapeblock-menu-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 8 8"/><path d="m12 4-8 8"/></svg>' }
			} ) : null;

			var preview = el(
				'div',
				{ id: editorId, className: previewClass + ( items.length ? '' : ' shapeblock-menu-is-empty' ) + ( showDrawer && isOpenPreview ? ' is-open' : '' ) },
				( edImport || edCss ) ? el( 'style', {}, edImport + edCss ) : null,
				previewToggle,
				previewOverlay,
				el( 'div', { className: 'shapeblock-menu-panel' }, previewClose, el( 'ul', { className: 'shapeblock-menu-list' }, lis ) )
			);

			var blockProps = useBlockProps();
			var activeNode = nodeByPath( items, activePath );

			return el(
				Fragment,
				{},
				// Block toolbar: edit the link of the menu item whose label is currently focused.
				el( BlockControls, { group: 'block' },
					el( ToolbarGroup, {},
						el( Dropdown, {
							popoverProps: { placement: 'bottom-start' },
							renderToggle: function ( t ) {
								return el( ToolbarButton, {
									icon: 'admin-links',
									title: activeNode ? __( 'Edit link', TD ) : __( 'Click a menu item to edit its link', TD ),
									isActive: t.isOpen,
									'aria-expanded': t.isOpen,
									disabled: ! activeNode,
									onClick: t.onToggle
								} );
							},
							renderContent: function ( c ) {
								return el( AddMenuSearch, {
									url: activeNode ? activeNode.url : '',
									onPick: function ( v ) {
										v = v || {};
										updateAt( activePath, { url: v.url || '', objectId: v.id || 0, objectType: v.type || '' } );
										c.onClose();
									}
								} );
							}
						} )
					)
				),
				// Settings / Layout / Style — the same three tabs every ShapeBlock block uses.
				el( InspectorControls, {},
					el( TabPanel, {
						className: 'shapeblock-menu-tabs shapeblock-inspector-tabs',
						tabs: [
							{ name: 'settings', title: __( 'Settings', TD ) },
							{ name: 'layout', title: __( 'Layout', TD ) },
							{ name: 'style', title: __( 'Style', TD ) }
						]
					}, function ( tab ) {
						if ( 'settings' === tab.name ) {
							return el( Fragment, {}, wpMenuPicker, itemEditors, addItemEl, dropdownPanel );
						}
						if ( 'layout' === tab.name ) {
							return el( Fragment, {}, layoutPanel, responsivePanel );
						}
						// Style tab: colours + typography.
						return el( Fragment, {}, colorsPanel, dropdownColorsPanel, mobilePanel, typographyPanel );
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
	// "ShapeBlock Menu" — a variation of the core Navigation block. This IS core
	// Navigation under the hood, so its dropdowns, appenders, mobile overlay and
	// "add any block" behaviour work EXACTLY like the default Navigation block.
	// ---------------------------------------------------------------------------
	if ( wp.domReady && wp.blocks && wp.blocks.registerBlockVariation ) {
		wp.domReady( function () {
			if ( ! wp.blocks.getBlockType || ! wp.blocks.getBlockType( 'core/navigation' ) ) {
				return; // Core Navigation not available.
			}
			wp.blocks.registerBlockVariation( 'core/navigation', {
				name: 'shapeblock-menu',
				title: __( 'ShapeBlock Menu', TD ),
				description: __( 'A navigation menu that works exactly like the default Navigation, in ShapeBlock style.', TD ),
				icon: 'menu',
				scope: [ 'inserter' ],
				attributes: { className: 'shapeblock-nav' }
			} );
		} );
	}

} )( window.wp );
