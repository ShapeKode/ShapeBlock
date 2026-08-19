<?php
namespace EELFG\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Block_Editor {
    private $api_site_url = 'https://themewant.com/plugins/eelfgst/wp-json/eelfgst/v1';
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
        
        $asset_file = include EELFG_PL_PATH . 'build/index.asset.php';

        wp_enqueue_script(
            'eelfg-block-editor-js',
            EELFG_PL_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'eelfg-block-editor-css',
            EELFG_PL_URL . 'build/index.css',
            array( 'wp-components' ),
            $asset_file['version']
        );

        wp_localize_script(
            'eelfg-block-editor-js',
            'eelfgEditor',
            [
                'plugin_url'    => EELFG_PL_URL,
                'api_url'       => $this->api_site_url,
                'nonce'         => wp_create_nonce( 'wp_rest' ),
                'admin_url'     => admin_url(),
                'new_tpl_url'   => admin_url( 'post-new.php?post_type=eelfg-template' ),
            ]
        );
    }

    public function admin_body_class( $classes ) {
        global $pagenow;
        if (!$pagenow || 'post.php' !== $pagenow) {
           return $classes;
        }
        $classes .= ' eelfg-block-editor';
        return $classes;
    }
}

