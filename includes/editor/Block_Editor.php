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

        // Editor-only sidebar/canvas tweaks, loaded as a plain file so nothing
        // from the dashboard bundle reaches the block editor.
        wp_enqueue_style(
            'shapeblock-block-editor-css',
            SHAPEBLOCK_PL_URL . 'assets/css/editor.css',
            array( 'wp-components' ),
            \shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'assets/css/editor.css' )
        );

        wp_localize_script(
            'shapeblock-block-editor-js',
            'shapeblockEditor',
            [
                'plugin_url'    => SHAPEBLOCK_PL_URL,
                'admin_url'     => admin_url(),
                'new_tpl_url'   => admin_url( 'post-new.php?post_type=shapeblock-template' ),
                // Changes whenever the icon library is rebuilt, so the picker never
                // shows a list the browser kept from before.
                'icons_version' => shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/icon/library.json' ),
            ]
        );
    }
}

