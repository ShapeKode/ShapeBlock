<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_faq_block_init() {
	// Register the block-specific style handle so render.php can attach the
	// per-instance inline CSS to it (matches the post-grid / gallery pattern).
	wp_register_style(
		'shapeblock-faq-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (inline editing UI: accordion toggle, item controls).
	// Compiled from src/editor.scss. Without this the editor markup is unstyled.
	wp_register_style(
		'shapeblock-faq-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-faq-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-faq-style',
		'editor_style' => 'shapeblock-faq-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_faq_block_init' );
