<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_image_carousel_block_init() {
	wp_register_style(
		'shapeblock-image-carousel-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style', 'swiper' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-image-carousel-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-image-carousel-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-image-carousel-style',
		'editor_style' => 'shapeblock-image-carousel-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_image_carousel_block_init' );

/**
 * Run the carousel in the editor canvas too.
 *
 * WordPress only enqueues a block's `viewScript` on the front end, so without
 * this the editor preview shows every image stacked instead of a carousel.
 * Swiper itself is already present in the canvas via `enqueue_block_assets`.
 */
function shapeblock_image_carousel_editor_preview_script() {
	if ( ! is_admin() ) {
		return;
	}

	wp_enqueue_script(
		'shapeblock-image-carousel-editor-preview',
		plugins_url( 'build/view.js', __FILE__ ),
		array( 'swiper' ),
		shapeblock_asset_version( __DIR__ . '/build/view.js' ),
		true
	);
}
add_action( 'enqueue_block_assets', 'shapeblock_image_carousel_editor_preview_script' );
