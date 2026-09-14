<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_testimonials_grid_block_init() {
	wp_register_style(
		'shapeblock-testimonials-grid-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-testimonials-grid-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-testimonials-grid-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-testimonials-grid-style',
		'editor_style' => 'shapeblock-testimonials-grid-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_testimonials_grid_block_init' );
