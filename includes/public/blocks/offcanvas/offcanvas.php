<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_offcanvas_block_init() {
	// Front-end + shared style handle so render.php can attach per-instance inline CSS.
	wp_register_style(
		'shapeblock-offcanvas-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style' => 'shapeblock-offcanvas-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_offcanvas_block_init' );
