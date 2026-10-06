<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Version for a block asset: the file's own modified time, so an updated
 * stylesheet is never served from a stale browser cache between releases.
 *
 * @param string $file Absolute path to the asset.
 * @return string
 */
function shapeblock_asset_version( $file ) {
	return file_exists( $file ) ? (string) filemtime( $file ) : SHAPEBLOCK_VERSION;
}

/**
 * Is the current admin request the block editor (post editor, widgets
 * screen, or the site editor)? Used to gate assets that must load in the
 * editor but that `enqueue_block_assets` would otherwise also fire on every
 * unrelated wp-admin screen (Plugins, Settings, etc.).
 *
 * @return bool
 */
function shapeblock_is_block_editor_screen() {
	if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
		return false;
	}
	$screen = get_current_screen();
	return $screen && method_exists( $screen, 'is_block_editor' ) && $screen->is_block_editor();
}

/**
 * Does a post's content contain any `shapeblock/*` block?
 *
 * core's has_block() only matches a fully-namespaced block name (or a bare
 * 'core/…' one) — it has no wildcard/prefix mode — so a family of ~30 block
 * names is checked with a direct marker search instead, the same technique
 * has_blocks() itself uses for '<!-- wp:'.
 *
 * @param WP_Post|null $post Post to check.
 * @return bool
 */
function shapeblock_content_has_any_block( $post ) {
	if ( ! $post instanceof WP_Post ) {
		return false;
	}
	return function_exists( 'has_blocks' ) && has_blocks( $post )
		&& false !== strpos( (string) $post->post_content, '<!-- wp:shapeblock/' );
}

/**
 * Does the current front-end request actually contain a ShapeBlock block?
 *
 * Checks the main queried post plus any active Theme Builder header/footer
 * template, since those render outside the main query and a check against
 * the main post never sees them.
 *
 * @return bool
 */
function shapeblock_frontend_has_any_block() {
	if ( shapeblock_content_has_any_block( get_post() ) ) {
		return true;
	}

	if ( class_exists( '\ShapeBlock\Extension\ThemeBuilder\Builder_Render' ) ) {
		$shapeblock_builder = \ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance();
		foreach ( array( 'header', 'footer' ) as $shapeblock_location ) {
			$shapeblock_tpl_id = $shapeblock_builder->get_location_post( $shapeblock_location );
			if ( $shapeblock_tpl_id && shapeblock_content_has_any_block( get_post( $shapeblock_tpl_id ) ) ) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Should the shared ShapeBlock assets (swiper, bootstrap grid, the public
 * stylesheet, the colour/layout CSS variables) load on this request?
 *
 * `enqueue_block_assets` fires on every wp-admin screen and every front-end
 * request, not only where a ShapeBlock block is used, so it needs its own
 * gate: any block editor screen (has_block() cannot see unsaved editor
 * content, so the screen itself is the signal there), or a front-end request
 * whose queried content actually contains a ShapeBlock block.
 *
 * @return bool
 */
function shapeblock_should_load_common_assets() {
	if ( is_admin() ) {
		return shapeblock_is_block_editor_screen();
	}
	return shapeblock_frontend_has_any_block();
}

/**
 * Register the shared handles — always, on every request.
 *
 * Registering a handle only records it; nothing is printed and nothing is
 * downloaded, so there is no cost to doing it unconditionally. It must NOT sit
 * behind the load gate: every block stylesheet declares 'shapeblock-public-style'
 * as a dependency (slider and image-carousel also declare 'shapeblock-swiper'),
 * and WordPress silently drops a stylesheet whose dependency is unregistered.
 * Gating registration therefore un-styles every block on any request where the
 * gate happens not to fire, which is a far worse bug than loading one extra file.
 *
 * Only the enqueueing below is gated.
 */
function shapeblock_register_common_assets() {
	if ( ! wp_style_is( 'shapeblock-public-style', 'registered' ) ) {
		wp_register_style(
			'shapeblock-public-style',
			SHAPEBLOCK_PL_URL . 'includes/public/assets/css/public.css',
			array(),
			// File time, not the plugin version: every edit gets a new URL, so
			// browsers and the host's CDN cannot keep serving the old copy.
			shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/css/public.css' )
		);
	}

	if ( ! wp_style_is( 'shapeblock-swiper', 'registered' ) ) {
		wp_register_style( 'shapeblock-swiper', SHAPEBLOCK_PL_URL . 'assets/lib/swiper/swiper-bundle.css', array(), shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'assets/lib/swiper/swiper-bundle.css' ), 'all' );
	}

	if ( ! wp_script_is( 'shapeblock-swiper', 'registered' ) ) {
		// Deferred, like the block view scripts that use it, so it never blocks
		// the first paint. WordPress drops the defer by itself wherever a
		// blocking script depends on it.
		wp_register_script( 'shapeblock-swiper', SHAPEBLOCK_PL_URL . 'assets/lib/swiper/swiper-bundle.js', array(), '12.0.3', array( 'strategy' => 'defer' ) );
	}

	if ( ! wp_style_is( 'shapeblock-bootstrap-grid', 'registered' ) ) {
		wp_register_style( 'shapeblock-bootstrap-grid', SHAPEBLOCK_PL_URL . 'assets/lib/bootstrap/bootstrap-grid.css', array(), shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'assets/lib/bootstrap/bootstrap-grid.css' ), 'all' );
	}
}
add_action( 'init', 'shapeblock_register_common_assets', 9 );

add_action( 'enqueue_block_editor_assets', 'shapeblock_enqueue_block_styles' );
add_action( 'enqueue_block_assets', 'shapeblock_enqueue_block_styles' );
function shapeblock_enqueue_block_styles() {
	shapeblock_register_common_assets();

	if ( ! shapeblock_should_load_common_assets() ) {
		return;
	}

	// Swiper (~150 KB) is only needed by the Slider and Image Carousel blocks.
	// On the front end those blocks pull it in themselves, as a dependency of
	// their own style and view script (shapeblock_add_swiper_dependency()), so
	// it loads only on pages that contain one. The editor canvas keeps it,
	// because a slider can be inserted there at any moment.
	// The Bootstrap grid (~125 KB) is the same story: only the Post Grid block's
	// markup uses its classes, so on the front end it is a dependency of that
	// block's stylesheet and nothing else.
	if ( is_admin() ) {
		wp_enqueue_style( 'shapeblock-swiper' );
		wp_enqueue_script( 'shapeblock-swiper' );
		wp_enqueue_style( 'shapeblock-bootstrap-grid' );
	}
}

/**
 * Let WordPress print small ShapeBlock stylesheets inline.
 *
 * wp_maybe_inline_styles() (wp_head / wp_footer, priority 1) swaps a
 * stylesheet's <link> for an inline style element -- up to 20 KB in total, smallest
 * first -- but only for styles that declare the file's 'path'. Without it every
 * block stylesheet costs its own render-blocking request.
 *
 * @return void
 */
function shapeblock_add_style_paths() {
	$styles = wp_styles();
	foreach ( $styles->registered as $handle => $style ) {
		if ( 0 !== strpos( $handle, 'shapeblock-' ) || ! is_string( $style->src ) || isset( $style->extra['path'] ) ) {
			continue;
		}
		if ( 0 !== strpos( $style->src, SHAPEBLOCK_PL_URL ) ) {
			continue;
		}
		$path = SHAPEBLOCK_PL_PATH . substr( strtok( $style->src, '?' ), strlen( SHAPEBLOCK_PL_URL ) );
		if ( is_readable( $path ) ) {
			$styles->add_data( $handle, 'path', $path );
		}
	}
}
add_action( 'wp_head', 'shapeblock_add_style_paths', 0 );
add_action( 'wp_footer', 'shapeblock_add_style_paths', 0 );

/**
 * Let a little more small CSS be printed inline.
 *
 * WordPress inlines stylesheets smallest-first until they add up to 20 KB. The
 * shared ShapeBlock stylesheet alone is ~15 KB, so a page with a menu or a
 * slider still had its next block stylesheet as a separate render-blocking
 * request. A bit more room removes that request; the extra bytes travel with
 * the HTML, which is compressed.
 *
 * @param int $limit Size limit in bytes.
 * @return int
 */
function shapeblock_inline_styles_limit( $limit ) {
	// Only a page that actually uses ShapeBlock blocks gets the larger budget;
	// every other page keeps WordPress's own limit.
	if ( is_admin() || ! shapeblock_should_load_common_assets() ) {
		return $limit;
	}
	return max( (int) $limit, 64000 );
}
add_filter( 'styles_inline_size_limit', 'shapeblock_inline_styles_limit' );

/**
 * Make Swiper a dependency of a block's front-end view script, so the library
 * is printed only when that block renders, and always before the script that
 * calls `new Swiper()`.
 *
 * @param WP_Block_Type|false $block_type Result of register_block_type().
 * @return void
 */
function shapeblock_add_swiper_dependency( $block_type ) {
	if ( ! $block_type instanceof WP_Block_Type ) {
		return;
	}
	foreach ( (array) $block_type->view_script_handles as $handle ) {
		$script = wp_scripts()->query( $handle, 'registered' );
		if ( $script && ! in_array( 'shapeblock-swiper', $script->deps, true ) ) {
			$script->deps[] = 'shapeblock-swiper';
		}
	}
}

/**
 * Full Google Fonts family list. Reuses the Menu block's cached weekly fetch
 * when available; returns an empty array otherwise (the editor then falls back
 * to its bundled web-safe list).
 *
 * @return array
 */
if ( ! function_exists( 'shapeblock_google_fonts_enabled' ) ) {
	/**
	 * Is the optional Google Fonts connection switched on?
	 *
	 * Off by default. While it is off the plugin never contacts Google: the
	 * font catalogue is not fetched, no fonts.googleapis.com stylesheet is
	 * enqueued on the front end, and the editor offers only locally available
	 * font stacks. Site owners turn it on in ShapeBlock > Settings.
	 *
	 * @return bool
	 */
	function shapeblock_google_fonts_enabled() {
		$layout = get_option( 'shapeblock_layout', array() );
		return is_array( $layout ) && ! empty( $layout['google_fonts'] );
	}
}

if ( ! function_exists( 'shapeblock_get_google_fonts' ) ) {
	function shapeblock_get_google_fonts() {
		if ( ! shapeblock_google_fonts_enabled() ) {
			return array();
		}
		if ( function_exists( 'shapeblock_menu_get_google_fonts' ) ) {
			$fonts = shapeblock_menu_get_google_fonts();
			if ( is_array( $fonts ) && ! empty( $fonts ) ) {
				return $fonts;
			}
		}
		return array();
	}
}

/**
 * Expose the Google Fonts list to the block editor as window.shapeblockFonts so the
 * shared Typography control can populate its Font Family dropdown.
 */
function shapeblock_expose_google_fonts_editor() {
	$fonts = shapeblock_get_google_fonts();
	if ( ! empty( $fonts ) && wp_script_is( 'wp-blocks', 'registered' ) ) {
		wp_add_inline_script(
			'wp-blocks',
			'window.shapeblockFonts = ' . wp_json_encode( array_values( $fonts ) ) . ';',
			'before'
		);
	}

	// Tell the editor whether it may talk to Google Fonts at all.
	if ( wp_script_is( 'wp-blocks', 'registered' ) ) {
		wp_add_inline_script(
			'wp-blocks',
			'window.shapeblockGoogleFonts = ' . ( shapeblock_google_fonts_enabled() ? 'true' : 'false' ) . ';',
			'before'
		);
	}

	// The placeholder image the repeater controls show for an item whose image
	// has not been chosen yet, so an empty row looks the same in the sidebar as
	// it does on the canvas.
	if ( wp_script_is( 'wp-blocks', 'registered' ) ) {
		wp_add_inline_script(
			'wp-blocks',
			'window.shapeblockPlaceholder = ' . wp_json_encode( SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png' ) . ';',
			'before'
		);
	}

	// Loads every used font family into the editor canvas on load / block change
	// so the preview always matches the selected font (no need to select the
	// block or open its Typography control).
	wp_enqueue_script(
		'shapeblock-editor-fonts',
		SHAPEBLOCK_PL_URL . 'includes/public/assets/js/editor-fonts.js',
		array( 'wp-data' ),
		shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/js/editor-fonts.js' ),
		true
	);

	// Shared styling for the 3-tab (Settings / Layout / Style) inspector used by
	// every ShapeBlock block, so the tabs sit evenly across the sidebar.
	wp_register_style( 'shapeblock-editor-ui', false, array(), SHAPEBLOCK_VERSION );
	wp_enqueue_style( 'shapeblock-editor-ui' );
	wp_add_inline_style(
		'shapeblock-editor-ui',
		'.shapeblock-inspector-tabs .components-tab-panel__tabs{display:flex}.shapeblock-inspector-tabs .components-tab-panel__tabs-item{flex:1;justify-content:center}'
	);
}
add_action( 'enqueue_block_editor_assets', 'shapeblock_expose_google_fonts_editor' );

/**
 * Enqueue a single Google font family (front end + editor). Web-safe stacks
 * (which contain a comma) are ignored — only a single Google family name is
 * loaded. Safe to call repeatedly.
 *
 * @param string $family e.g. "Poppins".
 */
if ( ! function_exists( 'shapeblock_enqueue_google_font' ) ) {
	function shapeblock_enqueue_google_font( $family ) {
		if ( ! shapeblock_google_fonts_enabled() ) {
			return;
		}
		$family = trim( (string) $family );
		if ( '' === $family || false !== strpos( $family, ',' ) ) {
			return;
		}
		$handle = 'shapeblock-font-' . sanitize_title( $family );
		if ( wp_style_is( $handle, 'enqueued' ) ) {
			return;
		}
		$url = 'https://fonts.googleapis.com/css2?family=' . str_replace( '%20', '+', rawurlencode( $family ) ) . ':wght@100;200;300;400;500;600;700;800;900&display=swap';
		wp_enqueue_style( $handle, $url, array(), SHAPEBLOCK_VERSION );
	}
}

/**
 * Front end: load the Google fonts used in ANY ShapeBlock block's typography
 * without editing each block's render.php — scan the block attributes for any
 * typography object that sets a `fontFamily` and enqueue it.
 *
 * @param string $content Block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function shapeblock_render_block_load_fonts( $content, $block ) {
	if ( empty( $block['blockName'] ) || 0 !== strpos( (string) $block['blockName'], 'shapeblock/' ) ) {
		return $content;
	}
	if ( ! empty( $block['attrs'] ) && is_array( $block['attrs'] ) && function_exists( 'shapeblock_enqueue_google_font' ) ) {
		array_walk_recursive(
			$block['attrs'],
			function ( $value, $key ) {
				if ( 'fontFamily' === $key && is_string( $value ) && '' !== $value ) {
					shapeblock_enqueue_google_font( $value );
				}
			}
		);
	}
	return $content;
}
add_filter( 'render_block', 'shapeblock_render_block_load_fonts', 10, 2 );

/**
 * Load the files of every enabled block.
 *
 * Runs on `init` rather than while the plugin file loads: the block list
 * carries translated titles, and translations may not be loaded before `init`.
 * Every block file only adds its own hooks (on `init` or later), so loading
 * them at the start of `init` is early enough.
 *
 * @return void
 */
function shapeblock_load_block_files() {
	foreach ( \ShapeBlock\Admin\Blocks::instance()->get_blocks() as $shapeblock_block ) {
		if ( 'disable' === $shapeblock_block['status'] ) {
			continue;
		}
		$shapeblock_file = __DIR__ . '/' . $shapeblock_block['id'] . '/' . $shapeblock_block['id'] . '.php';
		if ( file_exists( $shapeblock_file ) ) {
			require_once $shapeblock_file;
		}
	}
}
add_action( 'init', 'shapeblock_load_block_files', 1 );

/**
 * Reliably load each block's front-end stylesheet in the <head> whenever the current page
 * actually contains that block.
 *
 * Every block registers its own "shapeblock-<id>-style" handle and enqueues it from render.php. On the
 * front end that render-time enqueue can print too late ( footer ) or be skipped by block-asset
 * optimisation, so the front end came out unstyled while the editor — which loads the styles via the
 * editor-style dependency chain — looked correct. Enqueuing here, on wp_enqueue_scripts, guarantees
 * the style is in the <head>. wp_style_is() keeps it safe for any block that does not follow the
 * handle pattern, and has_block() means nothing loads on pages without the block.
 */
add_action( 'wp_enqueue_scripts', function () {
	if ( is_admin() || ! function_exists( 'has_block' ) ) {
		return;
	}

	$shapeblock_blocks = \ShapeBlock\Admin\Blocks::instance()->get_blocks();

	// Theme Builder header/footer templates are separate posts, so has_block()
	// against the main query never sees their blocks and the header/footer would
	// render unstyled. Collect any active builder template posts for this request
	// and check their content too.
	$shapeblock_extra_posts = array();
	if ( class_exists( '\ShapeBlock\Extension\ThemeBuilder\Builder_Render' ) ) {
		$shapeblock_builder = \ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance();
		foreach ( array( 'header', 'footer' ) as $shapeblock_location ) {
			$shapeblock_tpl_id = $shapeblock_builder->get_location_post( $shapeblock_location );
			if ( $shapeblock_tpl_id ) {
				$shapeblock_extra_posts[] = $shapeblock_tpl_id;
			}
		}
	}

	foreach ( $shapeblock_blocks as $shapeblock_block ) {
		if ( 'disable' === $shapeblock_block['status'] ) {
			continue;
		}
		$block_name = 'shapeblock/' . $shapeblock_block['id'];
		$handle     = 'shapeblock-' . $shapeblock_block['id'] . '-style';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			continue;
		}

		$shapeblock_present = has_block( $block_name );
		if ( ! $shapeblock_present ) {
			foreach ( $shapeblock_extra_posts as $shapeblock_tpl_id ) {
				if ( has_block( $block_name, $shapeblock_tpl_id ) ) {
					$shapeblock_present = true;
					break;
				}
			}
		}

		if ( $shapeblock_present ) {
			wp_enqueue_style( $handle );
		}
	}
} );

/**
 * In the block editor, load every block's front-end stylesheet up-front. The blocks' editor previews
 * ( tabs, accordion, etc. ) rely on the front-end CSS to show/hide state via the ".active" class, so
 * the styles must be present in the editor for those interactions to be visible. Loading them all here
 * guarantees that regardless of the per-block editor-style dependency chain.
 */
add_action( 'enqueue_block_editor_assets', function () {
	foreach ( \ShapeBlock\Admin\Blocks::instance()->get_blocks() as $shapeblock_block ) {
		if ( 'disable' === $shapeblock_block['status'] ) {
			continue;
		}
		$handle = 'shapeblock-' . $shapeblock_block['id'] . '-style';
		if ( wp_style_is( $handle, 'registered' ) ) {
			wp_enqueue_style( $handle );
		}
	}
} );

/**
 * CSS for the shared "Advanced" inspector tab.
 *
 * Every ShapeBlock block offers the same Advanced tab — responsive padding and
 * margin plus a background colour — through the AdvancedControls component. The
 * values live in attributes prefixed `adv`, declared in each block.json.
 *
 * Producing the CSS here rather than in each block's render.php keeps the
 * feature in one place: a block does not have to know the tab exists, and there
 * is only one implementation to fix. The hook is `render_block_data`, which runs
 * just before a block renders, so Helper::add_css() sees the same request state
 * it would have seen from inside render.php — that matters because it routes the
 * sheet three different ways depending on whether this is the front end, the
 * editor or a REST render.
 *
 * The block's own `blockId` attribute is already a unique class on its wrapper,
 * so it doubles as the selector and nothing has to be parsed out of the markup.
 * It is repeated to raise specificity: `column`, `layout-row` and `faq` write
 * padding, margin or background onto their own wrapper from their own controls,
 * and those rules are emitted after this one. Without the repetition the value
 * an author typed into Advanced would silently lose to the block's default.
 *
 * @param array $parsed_block The block about to be rendered.
 * @return array The block, unchanged.
 */
function shapeblock_advanced_block_css( $parsed_block ) {
	if ( empty( $parsed_block['blockName'] ) || 0 !== strpos( $parsed_block['blockName'], 'shapeblock/' ) ) {
		return $parsed_block;
	}

	$attrs = ( isset( $parsed_block['attrs'] ) && is_array( $parsed_block['attrs'] ) ) ? $parsed_block['attrs'] : [];

	// Only the block's own generated class is accepted, so the selector can
	// never carry anything an author typed.
	$block_id = isset( $attrs['blockId'] ) ? preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $attrs['blockId'] ) : '';
	if ( '' === $block_id ) {
		return $parsed_block;
	}

	$responsive = [];

	\ShapeBlock\Frontend\Helper::add_responsive_vars(
		$attrs,
		$responsive,
		'advPadding',
		'',
		[
			'top'    => 'padding-top',
			'right'  => 'padding-right',
			'bottom' => 'padding-bottom',
			'left'   => 'padding-left',
		],
		true
	);

	\ShapeBlock\Frontend\Helper::add_responsive_vars(
		$attrs,
		$responsive,
		'advMargin',
		'',
		[
			'top'    => 'margin-top',
			'right'  => 'margin-right',
			'bottom' => 'margin-bottom',
			'left'   => 'margin-left',
		],
		true
	);

	if ( ! empty( $attrs['advBgColor'] ) ) {
		$responsive['desktop']['background-color'] = \ShapeBlock\Frontend\Helper::sanitize_css_color( $attrs['advBgColor'] );
	}

	// A gradient sits on top of the colour (they are separate properties), so
	// either or both can be set. The value is checked again when the CSS is
	// generated, which refuses anything that is not a plain gradient.
	if ( ! empty( $attrs['advBgGradient'] ) && is_string( $attrs['advBgGradient'] ) ) {
		$responsive['desktop']['background-image'] = $attrs['advBgGradient'];
	}

	if ( empty( $responsive ) ) {
		return $parsed_block;
	}

	$selector = '.' . $block_id . '.' . $block_id . '.' . $block_id;
	$css      = \ShapeBlock\Frontend\Helper::generate_responsive_css( $selector, $responsive );

	if ( '' !== $css ) {
		\ShapeBlock\Frontend\Helper::add_css( 'shapeblock-public-style', $css );
	}

	return $parsed_block;
}
add_filter( 'render_block_data', 'shapeblock_advanced_block_css' );

/**
 * Keep a block's `blockId` a plain CSS class name.
 *
 * Every ShapeBlock block builds its CSS selector from `blockId`, and it is a
 * free-text attribute in the saved post. Reducing it to letters, digits, `_`
 * and `-` before any render.php runs means no selector can be broken out of,
 * whatever the stored value is. An id with nothing usable left is dropped so
 * the block falls back to the one it generates itself.
 *
 * @param array $parsed_block The block about to render.
 * @return array
 */
function shapeblock_sanitize_block_id( $parsed_block ) {
	if ( empty( $parsed_block['blockName'] ) || 0 !== strpos( $parsed_block['blockName'], 'shapeblock/' ) ) {
		return $parsed_block;
	}

	if ( isset( $parsed_block['attrs']['blockId'] ) ) {
		$clean = is_scalar( $parsed_block['attrs']['blockId'] ) ? preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $parsed_block['attrs']['blockId'] ) : '';
		if ( '' === $clean ) {
			unset( $parsed_block['attrs']['blockId'] );
		} else {
			$parsed_block['attrs']['blockId'] = $clean;
		}
	}

	return $parsed_block;
}
add_filter( 'render_block_data', 'shapeblock_sanitize_block_id', 1 );

/**
 * Give ShapeBlock's blocks their own inserter category.
 *
 * Every block.json says `"category": "shapeblock"`. WordPress only lists a
 * block under a category it knows about, so the category is declared here, on
 * the server, rather than by a script that has to load first.
 *
 * @param array $categories Existing block categories.
 * @return array
 */
function shapeblock_register_block_category( $categories ) {
	foreach ( $categories as $category ) {
		if ( isset( $category['slug'] ) && 'shapeblock' === $category['slug'] ) {
			return $categories;
		}
	}

	array_unshift(
		$categories,
		array(
			'slug'  => 'shapeblock',
			'title' => __( 'ShapeBlock', 'shapeblock' ),
			'icon'  => null,
		)
	);

	return $categories;
}
add_filter( 'block_categories_all', 'shapeblock_register_block_category' );


/**
 * Make the editor preview as forgiving as the front end.
 *
 * The block editor draws every ShapeBlock block by asking the REST route
 * /wp/v2/block-renderer/shapeblock/<name> for its HTML. That route rejects the
 * whole request when a single attribute has a value of the wrong kind -- a
 * null or an empty string where an object belongs, a value left over from an
 * older version -- and the editor then shows "Error loading block: [object
 * Object]" instead of the block. On the front end WordPress simply drops such
 * a value and uses the attribute's default, so the page still renders.
 *
 * This does the same for the preview: attributes that do not fit the block's
 * own definition are left out of the request, so the block renders with its
 * defaults for those and the rest of what the author set is kept.
 *
 * @param mixed           $result  Response so far; null lets the request continue.
 * @param WP_REST_Server  $server  Server.
 * @param WP_REST_Request $request Request.
 * @return mixed
 */
function shapeblock_clean_renderer_attributes( $result, $server, $request ) {
	if ( null !== $result || ! $request instanceof WP_REST_Request ) {
		return $result;
	}

	if ( ! preg_match( '#^/wp/v2/block-renderer/(shapeblock/[a-z0-9-]+)$#', (string) $request->get_route(), $matches ) ) {
		return $result;
	}

	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $matches[1] );
	$attributes = $request->get_param( 'attributes' );
	if ( ! $block_type || ! is_array( $attributes ) ) {
		return $result;
	}

	foreach ( $attributes as $name => $value ) {
		// Not an attribute this block defines (an old one, for instance).
		if ( ! isset( $block_type->attributes[ $name ] ) ) {
			unset( $attributes[ $name ] );
			continue;
		}
		if ( is_wp_error( rest_validate_value_from_schema( $value, $block_type->attributes[ $name ], (string) $name ) ) ) {
			unset( $attributes[ $name ] );
		}
	}

	$request->set_param( 'attributes', $attributes );

	return $result;
}
add_filter( 'rest_pre_dispatch', 'shapeblock_clean_renderer_attributes', 10, 3 );
