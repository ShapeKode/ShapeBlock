<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// enqueue_block_assets fires for BOTH the front end and the block editor iframe,
// so these block styles load correctly inside the editor canvas. Using
// enqueue_block_editor_assets added them to the outer editor page, not the
// iframe, which the editor flags as "added to the iframe incorrectly".
add_action( 'enqueue_block_assets', 'shapeblock_enqueue_block_scripts' );
function shapeblock_enqueue_block_scripts() {
	// shapeblock_should_load_common_assets() is defined in blocks.php: only load
	// on a block editor screen, or on a front-end request that actually
	// contains a ShapeBlock block. See that function for why — this hook
	// otherwise fires on every wp-admin screen and every front-end page.
	if ( ! shapeblock_should_load_common_assets() ) {
		return;
	}

	wp_enqueue_style( 'shapeblock-public-style', SHAPEBLOCK_PL_URL . 'includes/public/assets/css/public.css', array(), shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/css/public.css' ) );

	// The editor canvas can gain a "ShapeBlock Menu" at any moment, so it always
	// has the variation's styling. The front end loads it per render, below.
	if ( is_admin() ) {
		wp_enqueue_style( 'shapeblock-nav-variation' );
	}

	$colors  = \ShapeBlock\Admin\Api::get_saved_colors();
	$css_map = array(
		'primary'    => '--shapeblock-preset-color-primary',
		'secondary'  => '--shapeblock-preset-color-secondary',
		'tertiary'   => '--shapeblock-preset-color-tertiary',
		'white'      => '--shapeblock-preset-color-white',
		'contrast_1' => '--shapeblock-preset-color-contrast-1',
		'contrast_2' => '--shapeblock-preset-color-contrast-2',
		'border'     => '--shapeblock-preset-color-border',
	);

	$declarations = '';
	foreach ( $css_map as $key => $var ) {
		if ( ! empty( $colors[ $key ] ) ) {
			$color = \ShapeBlock\Frontend\Helper::sanitize_css_value( $colors[ $key ] );
			if ( '' !== $color ) {
				$declarations .= $var . ':' . $color . ';';
			}
		}
	}

	// Global layout — drives the Row block's boxed max-width fallback. The SCSS in
	// layout-row reads `var(--shapeblock-layout-row-max-width, 1200px)`, so setting it
	// here on :root applies plugin-wide unless an individual Row overrides it.
	$layout = \ShapeBlock\Admin\Api::get_saved_layout();
	if ( ! empty( $layout['container_width'] ) ) {
		$declarations .= '--shapeblock-layout-row-max-width:' . \ShapeBlock\Frontend\Helper::ensure_unit( $layout['container_width'] ) . ';';
	}

	if ( $declarations !== '' ) {
		wp_add_inline_style( 'shapeblock-public-style', ':root{' . $declarations . '}' );
	}
}

/**
 * The container width for the whole site, when ShapeBlock > General says so:
 * it becomes the theme's wide width (and its content width as well), the same
 * values a theme sets in theme.json. Core blocks, the theme's own layout and
 * the editor then follow it, not just the ShapeBlock Row. Global Styles saved
 * in the Site Editor still take precedence, as they do over the theme.
 *
 * @param WP_Theme_JSON_Data $theme_json The theme's theme.json data.
 * @return WP_Theme_JSON_Data
 */
function shapeblock_apply_container_width( $theme_json ) {
	$layout = \ShapeBlock\Admin\Api::get_saved_layout();
	$width  = (string) $layout['container_width'];
	if ( '' === $width || 'row' === $layout['apply_to'] ) {
		return $theme_json;
	}
	$width = \ShapeBlock\Frontend\Helper::ensure_unit( $width );

	// A theme that keeps its side gutters in the size itself, as
	// min(1140px, 100% - 3rem), keeps them: only the width is replaced.
	$data    = $theme_json->get_data();
	$current = isset( $data['settings']['layout'] ) && is_array( $data['settings']['layout'] ) ? $data['settings']['layout'] : array();
	$size    = function ( $key ) use ( $current, $width ) {
		$theme_size = isset( $current[ $key ] ) && is_string( $current[ $key ] ) ? $current[ $key ] : '';
		if ( preg_match( '/^min\(\s*[^,()]+,\s*(100%\s*-\s*[0-9.]+(?:px|rem|em|vw))\s*\)$/', $theme_size, $m ) ) {
			return 'min(' . $width . ', ' . $m[1] . ')';
		}
		return $width;
	};

	$sizes = array( 'wideSize' => $size( 'wideSize' ) );
	if ( 'all' === $layout['apply_to'] ) {
		$sizes['contentSize'] = $size( 'contentSize' );
	}

	return $theme_json->update_with(
		array(
			'version'  => WP_Theme_JSON::LATEST_SCHEMA,
			'settings' => array( 'layout' => $sizes ),
		)
	);
}
// After the theme's own filters (a theme can set these from its Customizer):
// the site owner chose this width for the whole site.
add_filter( 'wp_theme_json_data_theme', 'shapeblock_apply_container_width', 20 );

/**
 * Register the stylesheet of the "ShapeBlock Menu" core-Navigation variation
 * ( class .shapeblock-nav ). Versioned by file modified time so CSS tweaks
 * always bust the browser cache, and small enough for WordPress to print
 * inline -- see shapeblock_add_style_paths().
 *
 * @return void
 */
function shapeblock_register_nav_variation_style() {
	wp_register_style(
		'shapeblock-nav-variation',
		SHAPEBLOCK_PL_URL . 'includes/public/assets/css/shapeblock-nav-variation.css',
		array(),
		shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/css/shapeblock-nav-variation.css' )
	);
}
add_action( 'init', 'shapeblock_register_nav_variation_style' );

/**
 * Load the variation's stylesheet whenever a core Navigation block carrying the
 * shapeblock-nav class renders.
 *
 * The variation is core Navigation, not a shapeblock/* block, so a page whose
 * only ShapeBlock piece is this menu never passes the shared asset gate. Hooking
 * the render catches it wherever it lives -- post content, a block theme's
 * template part, a Theme Builder header or footer -- and leaves every other
 * page alone. Template parts and Theme Builder locations render before wp_head,
 * so the sheet lands in the head; a menu inside post content of a classic theme
 * gets it printed with the footer styles.
 *
 * @param string $content Rendered block markup.
 * @param array  $block   Parsed block.
 * @return string
 */
function shapeblock_nav_variation_style( $content, $block ) {
	$class = isset( $block['attrs']['className'] ) ? (string) $block['attrs']['className'] : '';
	if ( preg_match( '/(^|\s)shapeblock-nav(\s|$)/', $class ) ) {
		wp_enqueue_style( 'shapeblock-nav-variation' );
	}
	return $content;
}
add_filter( 'render_block_core/navigation', 'shapeblock_nav_variation_style', 10, 2 );
