<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_gallery_block_init() {
	// Register the block-specific style handle so render.php can attach the
	// per-instance inline CSS to it (matches the post-grid pattern).
	wp_register_style(
		'shapeblock-gallery-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-gallery-style',
		'editor_style' => 'shapeblock-gallery-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_gallery_block_init' );
