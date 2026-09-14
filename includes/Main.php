<?php
namespace ShapeBlock;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Main {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function __construct() {
        add_action( 'plugins_loaded', array( $this, 'init' ) );
    }

    public function init() {
        // Initialize the plugin
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_filter( 'plugin_action_links_' . SHAPEBLOCK_PLUGIN_BASE, array( $this, 'plugin_action_links' ), 10, 4 );
        add_filter( 'upload_mimes', array( $this, 'allow_svg_upload' ) );

        $this->includes();
    }

    public function register_settings() {
        register_setting( 'shapeblock_settings', 'shapeblock_version', 'sanitize_text_field' );
    }

    public function includes() {
        // Entry-point classes are PSR-4 autoloaded on reference; instantiating
        // each one registers its WordPress hooks.
        Admin\Admin::instance();
        Admin\Api::instance();
        Editor\Block_Editor::instance();
        Extension\ThemeBuilder\Theme_Builder::instance();

        // Procedural files (define functions / run bootstrap code — not autoloadable).
        require_once SHAPEBLOCK_PL_PATH . 'includes/admin/post-types.php';
        require_once SHAPEBLOCK_PL_PATH . 'includes/public/scripts.php';
        require_once SHAPEBLOCK_PL_PATH . 'includes/public/responsive-visibility.php';
        require_once SHAPEBLOCK_PL_PATH . 'includes/public/blocks/blocks.php';
    }

    /**
     * Page slug => dashboard tab. The parent menu slug doubles as the first
     * submenu (Blocks). Add a row here and a matching React tab to grow the menu.
     */
    public static function get_admin_pages() {
        return array(
            'shapeblock' => array( 'tab' => 'blocks',        'label' => 'Blocks Settings' ),
            'shapeblock-theme-builder'          => array( 'tab' => 'theme-builder', 'label' => 'Theme Builder' ),
            'shapeblock-templates'              => array( 'tab' => 'templates',     'label' => 'Custom Templates' ),
            'shapeblock-settings'               => array( 'tab' => 'settings',      'label' => 'Settings' ),
        );
    }

    public function add_menu() {
        add_menu_page(
            'ShapeBlock',
            'ShapeBlock',
            'manage_options',
            'shapeblock',
            array( $this, 'render_menu_page' ),
            SHAPEBLOCK_PL_URL . 'assets/images/icons/plugin-icon-18_18.svg', // image icon
            26
        );

        foreach ( self::get_admin_pages() as $slug => $page ) {
            add_submenu_page(
                'shapeblock',
                'ShapeBlock - ' . $page['label'],
                $page['label'],
                'manage_options',
                $slug,
                array( $this, 'render_menu_page' )
            );
        }
    }

    public function render_menu_page() {
        $pages = self::get_admin_pages();
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only admin page detection, no data is processed.
        $page  = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
        $tab   = isset( $pages[ $page ] ) ? $pages[ $page ]['tab'] : 'blocks';

        echo '<div class="shapeblock-options-wrap">';
        echo '<div id="shapeblock-dashboard" data-initial-tab="' . esc_attr( $tab ) . '"></div>';
        echo '</div>';
    }

    public function render_blocks_page() {
        echo '<div class="shapeblock-options-wrap">';
        echo '<div id="shapeblock-blocks">ShapeBlock Blocks</div>';
        echo '</div>';
    }

    public static function activate() {
        update_option( 'shapeblock_version', SHAPEBLOCK_VERSION );

        // enable all blocks 
        $blocks = \ShapeBlock\Admin\Blocks::instance()->get_blocks();
        foreach ( $blocks as $block ) {
            // update option if option not exist
            if (!get_option('shapeblock_block_' . $block['id'])) {
                update_option('shapeblock_block_' . $block['id'], 'enable');
            }
        }
    }

    public static function deactivate() {
        delete_option( 'shapeblock_version' );
    }

    public function plugin_action_links( $plugin_actions, $plugin_file, $plugin_data, $context ) {

		$new_actions = array();
		/* translators: 1: Settings Text */
		$new_actions['shapeblock_plugin_actions_setting'] = sprintf( __( '<a href="%s" target="_self">Settings</a>', 'shapeblock' ), esc_url( admin_url( 'admin.php?page=shapeblock' ) ) );

		return array_merge( $new_actions, $plugin_actions );

	}
    // Allow SVG upload
    public function allow_svg_upload( $mimes ) {
        $mimes['svg']  = 'image/svg+xml';
        $mimes['svgz'] = 'image/svg+xml';
        return $mimes;
    }
}

