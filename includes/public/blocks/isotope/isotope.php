<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_isotope_block_init() {
	wp_register_style(
		'shapeblock-isotope-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-isotope-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-isotope-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-isotope-style',
		'editor_style' => 'shapeblock-isotope-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_isotope_block_init' );

/**
 * Make the filter buttons work in the editor canvas too.
 *
 * WordPress only enqueues a block's `viewScript` on the front end, so without
 * this the preview shows the filter bar but clicking it does nothing.
 */
function shapeblock_isotope_editor_preview_script() {
	// enqueue_block_assets fires on every wp-admin screen, not only the block
	// editor, so is_admin() alone is not enough - see blocks.php's
	// shapeblock_is_block_editor_screen().
	if ( ! function_exists( 'shapeblock_is_block_editor_screen' ) || ! shapeblock_is_block_editor_screen() ) {
		return;
	}

	wp_enqueue_script(
		'shapeblock-isotope-editor-preview',
		plugins_url( 'build/view.js', __FILE__ ),
		array(),
		shapeblock_asset_version( __DIR__ . '/build/view.js' ),
		true
	);
}
add_action( 'enqueue_block_assets', 'shapeblock_isotope_editor_preview_script' );
