<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_drop_caps_block_init() {
	wp_register_style(
		'shapeblock-drop-caps-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style' => 'shapeblock-drop-caps-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_drop_caps_block_init' );
