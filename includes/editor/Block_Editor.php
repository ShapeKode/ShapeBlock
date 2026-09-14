<?php
namespace ShapeBlock\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Block_Editor {
    /**
     * Base URL the template importer would talk to.
     *
     * The importer itself is currently parked — `src/index.js` does not import
     * `template-importer`, so nothing in the editor bundle reads this value. It
     * defaults to this site's own REST root rather than a third-party host, so
     * the plugin makes no outside request. When the importer is wired up again,
     * point this filter at whichever host serves the library.
     *
     * @return string
     */
    private function get_api_url() {
        return apply_filters(
            'shapeblock_template_api_url',
            untrailingslashit( rest_url( 'shapeblock/v1' ) )
        );
    }

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

        wp_enqueue_script(
            'shapeblock-block-editor-js',
            SHAPEBLOCK_PL_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

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
                'api_url'       => $this->get_api_url(),
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

