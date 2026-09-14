<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function shapeblock_create_block_layout_row_block_init() {
    wp_register_style(
        'shapeblock-layout-row-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array( 'shapeblock-public-style' ),
        shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
    );

    register_block_type( __DIR__ . '/build', array(
        'style'        => 'shapeblock-layout-row-style',
        'editor_style' => 'shapeblock-layout-row-style',
    ) );
}
add_action( 'init', 'shapeblock_create_block_layout_row_block_init' );
