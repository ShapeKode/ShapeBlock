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

        // A plain "Upgrade to Pro" link under each block's settings; not loaded when Pro is active.
        $upgrade_url = \ShapeBlock\Main::get_upgrade_url();
        if ( '' !== $upgrade_url ) {
            wp_enqueue_script(
                'shapeblock-upgrade-link',
                SHAPEBLOCK_PL_URL . 'includes/public/assets/js/upgrade-link.js',
                array( 'wp-hooks', 'wp-compose', 'wp-element', 'wp-block-editor', 'wp-i18n' ),
                \shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/js/upgrade-link.js' ),
                true
            );
            wp_localize_script( 'shapeblock-upgrade-link', 'shapeblockUpgrade', array( 'url' => $upgrade_url ) );
            wp_set_script_translations( 'shapeblock-upgrade-link', 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );
        }

        // The inserter's search box gets the cursor when the inserter opens.
        wp_enqueue_script(
            'shapeblock-editor-inserter',
            SHAPEBLOCK_PL_URL . 'includes/public/assets/js/editor-inserter.js',
            array( 'wp-data' ),
            \shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/js/editor-inserter.js' ),
            true
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

