<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_tab_block_init() {
	// Front-end + shared style handle so render.php can attach per-instance inline CSS.
	wp_register_style(
		'shapeblock-tab-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (sidebar repeater UI). Compiled from src/editor.scss.
	wp_register_style(
		'shapeblock-tab-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-tab-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-tab-style',
		'editor_style' => 'shapeblock-tab-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_tab_block_init' );
