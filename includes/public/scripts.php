<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'enqueue_block_editor_assets', 'eelfg_enqueue_block_scripts' );
add_action( 'wp_enqueue_scripts', 'eelfg_enqueue_block_scripts' );
function eelfg_enqueue_block_scripts() {
	wp_enqueue_style( 'eelfg-public-style', EELFG_PL_URL . 'includes/public/assets/css/public.css', array(), EELFG_VERSION );

	// Styling for the "Easy Elements Menu" core-Navigation variation ( .eelfg-nav ). Versioned by
	// file modified time so CSS tweaks always bust the browser cache.
	$nav_var_file = EELFG_PL_PATH . 'includes/public/assets/css/eelfg-nav-variation.css';
	wp_enqueue_style(
		'eelfg-nav-variation',
		EELFG_PL_URL . 'includes/public/assets/css/eelfg-nav-variation.css',
		array(),
		file_exists( $nav_var_file ) ? filemtime( $nav_var_file ) : EELFG_VERSION
	);

	$colors  = \EELFG\Admin\Api::get_saved_colors();
	$css_map = array(
		'primary'    => '--eelfg-preset-color-primary',
		'secondary'  => '--eelfg-preset-color-secondary',
		'tertiary'   => '--eelfg-preset-color-tertiary',
		'white'      => '--eelfg-preset-color-white',
		'contrast_1' => '--eelfg-preset-color-contrast-1',
		'contrast_2' => '--eelfg-preset-color-contrast-2',
		'border'     => '--eelfg-preset-color-border',
	);

	$declarations = '';
	foreach ( $css_map as $key => $var ) {
		if ( ! empty( $colors[ $key ] ) ) {
			$declarations .= $var . ':' . esc_attr( $colors[ $key ] ) . ';';
		}
	}

	// Global layout — drives the Row block's boxed max-width fallback. The SCSS in
	// layout-row reads `var(--eelfg-layout-row-max-width, 1200px)`, so setting it
	// here on :root applies plugin-wide unless an individual Row overrides it.
	$layout = \EELFG\Admin\Api::get_saved_layout();
	if ( ! empty( $layout['container_width'] ) ) {
		$declarations .= '--eelfg-layout-row-max-width:' . esc_attr( $layout['container_width'] ) . ';';
	}

	if ( $declarations !== '' ) {
		wp_add_inline_style( 'eelfg-public-style', ':root{' . $declarations . '}' );
	}
}
