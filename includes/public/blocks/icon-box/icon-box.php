<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_icon_box_block_init() {
	wp_register_style(
		'shapeblock-icon-box-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	wp_register_style(
		'shapeblock-icon-box-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-icon-box-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-icon-box-style',
		'editor_style' => 'shapeblock-icon-box-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_icon_box_block_init' );
