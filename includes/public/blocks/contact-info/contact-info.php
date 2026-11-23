<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_contact_info_block_init() {
	wp_register_style(
		'shapeblock-contact-info-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	wp_register_style(
		'shapeblock-contact-info-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-contact-info-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-contact-info-style',
		'editor_style' => 'shapeblock-contact-info-editor-style',
	) );
}
add_action( 'init', 'shapeblock_create_block_contact_info_block_init' );
