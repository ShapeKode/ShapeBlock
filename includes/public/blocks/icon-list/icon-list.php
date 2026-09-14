<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_icon_list_block_init() {
	wp_register_style(
		'shapeblock-icon-list-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	wp_register_style(
		'shapeblock-icon-list-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-icon-list-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-icon-list-style',
		'editor_style' => 'shapeblock-icon-list-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_icon_list_block_init' );
