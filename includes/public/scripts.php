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
	wp_enqueue_style( 'shapeblock-public-style', SHAPEBLOCK_PL_URL . 'includes/public/assets/css/public.css', array(), SHAPEBLOCK_VERSION );

	// Styling for the "ShapeBlock Menu" core-Navigation variation ( .shapeblock-nav ). Versioned by
	// file modified time so CSS tweaks always bust the browser cache.
	$nav_var_file = SHAPEBLOCK_PL_PATH . 'includes/public/assets/css/shapeblock-nav-variation.css';
	wp_enqueue_style(
		'shapeblock-nav-variation',
		SHAPEBLOCK_PL_URL . 'includes/public/assets/css/shapeblock-nav-variation.css',
		array(),
		file_exists( $nav_var_file ) ? filemtime( $nav_var_file ) : SHAPEBLOCK_VERSION
	);

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
			$declarations .= $var . ':' . esc_attr( $colors[ $key ] ) . ';';
		}
	}

	// Global layout — drives the Row block's boxed max-width fallback. The SCSS in
	// layout-row reads `var(--shapeblock-layout-row-max-width, 1200px)`, so setting it
	// here on :root applies plugin-wide unless an individual Row overrides it.
	$layout = \ShapeBlock\Admin\Api::get_saved_layout();
	if ( ! empty( $layout['container_width'] ) ) {
		$declarations .= '--shapeblock-layout-row-max-width:' . esc_attr( $layout['container_width'] ) . ';';
	}

	if ( $declarations !== '' ) {
		wp_add_inline_style( 'shapeblock-public-style', ':root{' . $declarations . '}' );
	}
}
