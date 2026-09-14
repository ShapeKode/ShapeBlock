<?php
namespace ShapeBlock\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Admin {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ), 10, 1 );
        add_action( 'enqueue_block_editor_assets', array( $this, 'editor_overrides' ) );
    }

    public function enqueue_scripts($hook) {
       

        $asset_file = include SHAPEBLOCK_PL_PATH . 'build/index.asset.php';

        $deps = array_map(function($dep) {
            return match($dep) {
                'react', 'react-dom', 'react-jsx-runtime' => 'wp-element',
                'wp-scripts' => 'wp-scripts',
                default => $dep,
            };
        }, $asset_file['dependencies']);

        wp_enqueue_style(
            'shapeblock-admin-css',
            SHAPEBLOCK_PL_URL . 'build/style-index.css',
            [],
            $asset_file['version']
        );

        // Load the app on the main page and every ShapeBlock submenu page.
        $our_pages = array_keys( \ShapeBlock\Main::get_admin_pages() );
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only admin page detection, no data is processed.
        $current_page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
        if ( ! in_array( $current_page, $our_pages, true ) ) {
            return;
        }

        wp_enqueue_style( 'shapeblock-admin-icons', SHAPEBLOCK_PL_URL . 'includes/admin/assets/icons/css/shapeblock-icon.css', array(), SHAPEBLOCK_VERSION );

        wp_enqueue_script(
            'shapeblock-admin-js',
            SHAPEBLOCK_PL_URL . 'build/index.js',
            $deps,
            $asset_file['version'],
            true
        );

        
        $blocks = \ShapeBlock\Admin\Blocks::instance()->get_blocks();

        $template_count = wp_count_posts( 'shapeblock-template' );
        $total_templates = isset( $template_count->publish ) ? (int) $template_count->publish : 0;

        wp_localize_script( 'shapeblock-admin-js', 'shapeblock', array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'siteUrl' => site_url(),
            'rest_url' => esc_url_raw(rest_url('shapeblock/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
            'blocks' => $blocks,
            'shapeblockUrl' => SHAPEBLOCK_PL_URL,
            'shapeblockPath' => SHAPEBLOCK_PL_PATH,
            'templateCount' => $total_templates,
            'colors' => \ShapeBlock\Admin\Api::get_saved_colors(),
            'colorDefaults' => \ShapeBlock\Admin\Api::get_color_defaults(),
            'layout' => \ShapeBlock\Admin\Api::get_saved_layout(),
            'layoutDefaults' => \ShapeBlock\Admin\Api::get_layout_defaults(),
            'builderTypes' => array_values( \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::get_template_types() ),
            'builderRules' => \ShapeBlock\Extension\ThemeBuilder\Builder_Conditions::get_rules(),
        ) );
    }

    public function editor_overrides() {
        $screen = get_current_screen();
        if ( ! $screen || ! in_array( $screen->post_type, array( 'shapeblock-template', 'shapeblock-builder' ), true ) ) {
            return;
        }

        // Send the editor "close" button back to the relevant dashboard submenu.
        $page = $screen->post_type === 'shapeblock-builder' ? 'shapeblock-theme-builder' : 'shapeblock-templates';
        $template_page_url = admin_url( 'admin.php?page=' . $page );

        wp_add_inline_script( 'wp-edit-post', "
            (function() {
                var url = " . wp_json_encode( $template_page_url ) . ";
                function updateLink() {
                    var link = document.querySelector('a.edit-post-fullscreen-mode-close');
                    if (link && link.getAttribute('href') !== url) {
                        link.setAttribute('href', url);
                    }
                }
                var observer = new MutationObserver(updateLink);
                observer.observe(document.body, { childList: true, subtree: true });
                updateLink();
            })();
        " );
    }

}

