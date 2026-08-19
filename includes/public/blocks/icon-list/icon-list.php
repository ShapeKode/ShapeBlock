<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function eelfg_create_block_icon_list_block_init() {
	wp_register_style(
		'eelfg-icon-list-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'eelfg-public-style' ),
		EELFG_VERSION
	);

	wp_register_style(
		'eelfg-icon-list-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'eelfg-icon-list-style' ),
		EELFG_VERSION
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'eelfg-icon-list-style',
		'editor_style' => 'eelfg-icon-list-editor-style',
	) );
}
add_action( 'init', 'eelfg_create_block_icon_list_block_init' );
