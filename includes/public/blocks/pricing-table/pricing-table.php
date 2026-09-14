<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_pricing_table_block_init() {
	// Register the block-specific style handle so render.php can attach the
	// per-instance inline CSS to it (matches the post-grid / gallery pattern).
	wp_register_style(
		'shapeblock-pricing-table-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-pricing-table-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-pricing-table-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-pricing-table-style',
		'editor_style' => 'shapeblock-pricing-table-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_pricing_table_block_init' );
