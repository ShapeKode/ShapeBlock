<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_filter_list_block_init() {
	wp_register_style(
		'shapeblock-filter-list-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-filter-list-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-filter-list-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-filter-list-style',
		'editor_style' => 'shapeblock-filter-list-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_filter_list_block_init' );

/**
 * Make the filter buttons and the search box work in the editor canvas too.
 *
 * WordPress only enqueues a block's `viewScript` on the front end, so without
 * this the preview shows the buttons and the search box but they do nothing.
 */
function shapeblock_filter_list_editor_preview_script() {
	// enqueue_block_assets fires on every wp-admin screen, not only the block
	// editor - see blocks.php's shapeblock_is_block_editor_screen().
	if ( ! shapeblock_is_block_editor_screen() ) {
		return;
	}

	wp_enqueue_script(
		'shapeblock-filter-list-editor-preview',
		plugins_url( 'build/view.js', __FILE__ ),
		array(),
		shapeblock_asset_version( __DIR__ . '/build/view.js' ),
		true
	);
}
add_action( 'enqueue_block_assets', 'shapeblock_filter_list_editor_preview_script' );
