<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_slider_block_init() {
	wp_register_style(
		'shapeblock-slider-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style', 'swiper' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-slider-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-slider-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-slider-style',
		'editor_style' => 'shapeblock-slider-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_slider_block_init' );
