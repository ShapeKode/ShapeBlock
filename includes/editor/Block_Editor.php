<?php
namespace ShapeBlock\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Block_Editor {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function __construct() {
        add_action( 'enqueue_block_editor_assets', [$this, 'enqueue_editor_scripts'] );
        add_filter( 'admin_body_class', [$this, 'admin_body_class'] );
    }

    public function enqueue_editor_scripts () {
        $screen = get_current_screen();
        if (!$screen || !$screen->is_block_editor()) {
           return;
        }
        
        $asset_file = include SHAPEBLOCK_PL_PATH . 'build/index.asset.php';

        // The editor only needs the data below (read from window.shapeblockEditor by
        // the block scripts), not the dashboard app in build/index.js, so a
        // source-less handle carries it instead of a large unused script.
        wp_register_script( 'shapeblock-block-editor-js', false, array(), $asset_file['version'], false );
        wp_enqueue_script( 'shapeblock-block-editor-js' );

        wp_enqueue_style(
            'shapeblock-block-editor-css',
            SHAPEBLOCK_PL_URL . 'build/index.css',
            array( 'wp-components' ),
            $asset_file['version']
        );

        wp_localize_script(
            'shapeblock-block-editor-js',
            'shapeblockEditor',
            [
                'plugin_url'    => SHAPEBLOCK_PL_URL,
                'nonce'         => wp_create_nonce( 'wp_rest' ),
                'admin_url'     => admin_url(),
                'new_tpl_url'   => admin_url( 'post-new.php?post_type=shapeblock-template' ),
            ]
        );
    }

    public function admin_body_class( $classes ) {
        global $pagenow;
        if (!$pagenow || 'post.php' !== $pagenow) {
           return $classes;
        }
        $classes .= ' shapeblock-block-editor';
        return $classes;
    }
}

