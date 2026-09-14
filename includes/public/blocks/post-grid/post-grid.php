<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_post_grid_block_init() {
	// Register block-specific styles manually to be sure
	wp_register_style(
		'shapeblock-post-grid-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array('shapeblock-public-style'),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'         => 'shapeblock-post-grid-style',
		'editor_style'  => 'shapeblock-post-grid-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_post_grid_block_init' );
