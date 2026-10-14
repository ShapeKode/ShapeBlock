<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_social_share_block_init() {
	// Front-end + shared style handle so render.php can attach per-instance inline CSS.
	wp_register_style(
		'shapeblock-social-share-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (sidebar repeater UI). Compiled from src/editor.scss.
	wp_register_style(
		'shapeblock-social-share-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-social-share-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-social-share-style',
		'editor_style' => 'shapeblock-social-share-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_social_share_block_init' );

/**
 * Whether a Query Loop's Post Template is being rendered right now. Inside
 * one, a block's postId is the loop's own post; outside, WordPress still gives
 * every block the global post as postId, which on an archive or in a Theme
 * Builder header or footer is just whichever post was loaded last.
 *
 * @param int $change 1 when a Post Template starts, -1 when it ends.
 * @return bool
 */
function shapeblock_social_share_in_query_loop( $change = 0 ) {
	static $depth = 0;
	$depth = max( 0, $depth + (int) $change );
	return $depth > 0;
}

/**
 * Counts a Post Template as it starts rendering.
 *
 * @param array $parsed_block The block about to render.
 * @return array
 */
function shapeblock_social_share_loop_start( $parsed_block ) {
	if ( isset( $parsed_block['blockName'] ) && 'core/post-template' === $parsed_block['blockName'] ) {
		shapeblock_social_share_in_query_loop( 1 );
	}
	return $parsed_block;
}
add_filter( 'render_block_data', 'shapeblock_social_share_loop_start' );

/**
 * Counts a Post Template as it finishes rendering.
 *
 * @param string $content The rendered Post Template.
 * @return string
 */
function shapeblock_social_share_loop_end( $content ) {
	shapeblock_social_share_in_query_loop( -1 );
	return $content;
}
add_filter( 'render_block_core/post-template', 'shapeblock_social_share_loop_end' );
