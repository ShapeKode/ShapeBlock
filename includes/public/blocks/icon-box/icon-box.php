<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function eelfg_create_block_icon_box_block_init() {
	wp_register_style(
		'eelfg-icon-box-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'eelfg-public-style' ),
		EELFG_VERSION
	);

	wp_register_style(
		'eelfg-icon-box-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'eelfg-icon-box-style' ),
		EELFG_VERSION
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'eelfg-icon-box-style',
		'editor_style' => 'eelfg-icon-box-editor-style',
	) );
}
add_action( 'init', 'eelfg_create_block_icon_box_block_init' );
