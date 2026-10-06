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
        require_once SHAPEBLOCK_PL_PATH . 'includes/public/responsive-spacing.php';
        require_once SHAPEBLOCK_PL_PATH . 'includes/public/blocks/blocks.php';
    }

    /**
     * Page slug => dashboard tab. The parent menu slug doubles as the first
     * submenu (Blocks). Add a row here and a matching React tab to grow the menu.
     */
    public static function get_admin_pages() {
        return array(
            'shapeblock' => array( 'tab' => 'blocks',        'label' => esc_html__( 'Blocks Settings', 'shapeblock' ) ),
            'shapeblock-theme-builder'          => array( 'tab' => 'theme-builder', 'label' => esc_html__( 'Theme Builder', 'shapeblock' ) ),
            'shapeblock-templates'              => array( 'tab' => 'templates',     'label' => esc_html__( 'Custom Templates', 'shapeblock' ) ),
            'shapeblock-settings'               => array( 'tab' => 'settings',      'label' => esc_html__( 'Settings', 'shapeblock' ) ),
        );
    }

    /**
     * Which ShapeBlock admin page (if any) is currently being viewed.
     *
     * Reads the resolved admin screen instead of $_GET['page'] so page
     * detection needs no nonce: get_current_screen() reflects WordPress's own
     * routing of the request, not an unverified query argument.
     *
     * @return string Page slug, or '' if the current screen is not one of ours.
     */
    public static function get_current_page_slug() {
        if ( ! function_exists( 'get_current_screen' ) ) {
            return '';
        }
        $screen = get_current_screen();
        if ( ! $screen ) {
            return '';
        }
        return isset( self::$page_hooks[ $screen->id ] ) ? self::$page_hooks[ $screen->id ] : '';
    }

    /**
     * Hook suffix => page slug, recorded in add_menu() from the values
     * add_menu_page()/add_submenu_page() actually return.
     *
     * A submenu's suffix is built from the parent's sanitized menu TITLE
     * ("ShapeBlock" => "shapeblock_page_…"), not the parent slug, so it
     * must be recorded rather than rebuilt by hand.
     *
     * @var array<string,string>
     */
    private static $page_hooks = array();

    /**
     * The admin menu icon, carried in the page rather than fetched.
     *
     * As a file URL the icon is downloaded once and then kept by the browser
     * for a week, so a redrawn icon shipped with a plugin update stays unseen
     * until that runs out -- and looks, from the outside, like the new file
     * never arrived. WordPress accepts a data URI here, which travels with the
     * admin page itself: replacing the plugin replaces the icon, with nothing
     * to clear and no second request to make.
     *
     * @return string A data URI, or a Dashicon name if the file cannot be read.
     */
    private static function menu_icon() {
        $file = SHAPEBLOCK_PL_PATH . 'assets/images/icons/plugin-icon-18_18.svg';

        if ( ! is_readable( $file ) ) {
            return 'dashicons-screenoptions';
        }

        // WP_Filesystem rather than file_get_contents(): the same read, through
        // the API WordPress expects a plugin to use for local files.
        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $svg = $wp_filesystem ? $wp_filesystem->get_contents( $file ) : '';

        if ( ! $svg ) {
            return 'dashicons-screenoptions';
        }

        return 'data:image/svg+xml;base64,' . base64_encode( $svg );
    }

    public function add_menu() {
        $hook = add_menu_page(
            'ShapeBlock',
            'ShapeBlock',
            'manage_options',
            'shapeblock',
            array( $this, 'render_menu_page' ),
            self::menu_icon(),
            26
        );
        if ( $hook ) {
            self::$page_hooks[ $hook ] = 'shapeblock';
        }

        foreach ( self::get_admin_pages() as $slug => $page ) {
            $hook = add_submenu_page(
                'shapeblock',
                'ShapeBlock - ' . $page['label'], // Label is already escaped.
                $page['label'],
                'manage_options',
                $slug,
                array( $this, 'render_menu_page' )
            );
            if ( $hook ) {
                self::$page_hooks[ $hook ] = $slug;
            }
        }
    }

    public function render_menu_page() {
        $pages = self::get_admin_pages();
        $page  = self::get_current_page_slug();
        $tab   = isset( $pages[ $page ] ) ? $pages[ $page ]['tab'] : 'blocks';

        echo '<div class="shapeblock-options-wrap">';
        echo '<div id="shapeblock-dashboard" data-initial-tab="' . esc_attr( $tab ) . '"></div>';
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
		$new_actions['shapeblock_plugin_actions_setting'] = '<a href="' . esc_url( admin_url( 'admin.php?page=shapeblock' ) ) . '">' . esc_html__( 'Settings', 'shapeblock' ) . '</a>';

		return array_merge( $new_actions, $plugin_actions );

	}
}

