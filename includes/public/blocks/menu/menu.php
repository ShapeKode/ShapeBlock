<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function eelfg_create_block_menu_block_init() {
	// Shared style handle (front-end + editor) so render.php styling stays consistent.
	// Version follows the CSS file's modified time so style updates always bust the browser cache.
	$style_file = __DIR__ . '/build/style-index.css';
	$style_ver  = file_exists( $style_file ) ? filemtime( $style_file ) : EELFG_VERSION;
	wp_register_style(
		'eelfg-menu-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'eelfg-public-style' ),
		$style_ver
	);

	register_block_type(
		__DIR__ . '/build',
		array(
			'style'        => 'eelfg-menu-style',
			'editor_style' => 'eelfg-menu-style',
		)
	);
}
add_action( 'init', 'eelfg_create_block_menu_block_init' );
