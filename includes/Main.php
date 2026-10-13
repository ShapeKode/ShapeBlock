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
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_filter( 'plugin_action_links_' . SHAPEBLOCK_PLUGIN_BASE, array( $this, 'plugin_action_links' ) );

        $this->includes();
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
     * Labels are plain text; they are escaped where they are printed.
     */
    public static function get_admin_pages() {
        $pages = array(
            // The first page shares the menu's own slug: it is the one the ShapeBlock menu item opens.
            'shapeblock'                        => array( 'tab' => 'settings',      'label' => __( 'General', 'shapeblock' ) ),
            'shapeblock-blocks'                 => array( 'tab' => 'blocks',        'label' => __( 'Blocks', 'shapeblock' ) ),
            'shapeblock-theme-builder'          => array( 'tab' => 'theme-builder', 'label' => __( 'Theme Builder', 'shapeblock' ) ),
            'shapeblock-templates'              => array( 'tab' => 'templates',     'label' => __( 'Custom Templates', 'shapeblock' ) ),
        );

        // Add-ons can add their own pages to the dashboard. Each one becomes a
        // submenu item and a tab in the app; the add-on draws the tab's content
        // when the app fires the `shapeblock.admin.tabMounted` JS action.
        // The built-in pages cannot be replaced.
        $reserved = array( 'shapeblock-export-import' );
        foreach ( (array) apply_filters( 'shapeblock_admin_pages', array() ) as $slug => $page ) {
            $slug = sanitize_key( $slug );
            if ( '' === $slug || isset( $pages[ $slug ] ) || in_array( $slug, $reserved, true ) || ! is_array( $page ) || empty( $page['tab'] ) || empty( $page['label'] ) ) {
                continue;
            }
            $pages[ $slug ] = array(
                'tab'   => sanitize_key( $page['tab'] ),
                'label' => wp_strip_all_tags( (string) $page['label'] ),
                'addon' => true,
            );
        }

        // Export & Import always comes last, after any add-on pages.
        $pages['shapeblock-export-import'] = array( 'tab' => 'export-import', 'label' => __( 'Export & Import', 'shapeblock' ) );

        return $pages;
    }

    /**
     * Pages added by add-ons through the `shapeblock_admin_pages` filter, for
     * the dashboard app: tab key, label and page slug.
     *
     * @return array
     */
    public static function get_addon_pages() {
        $out = array();
        foreach ( self::get_admin_pages() as $slug => $page ) {
            if ( ! empty( $page['addon'] ) ) {
                $out[] = array(
                    'tab'   => $page['tab'],
                    'label' => $page['label'],
                    'page'  => $slug,
                );
            }
        }
        return $out;
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
                esc_html( 'ShapeBlock - ' . $page['label'] ),
                esc_html( $page['label'] ),
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
        $tab   = isset( $pages[ $page ] ) ? $pages[ $page ]['tab'] : 'settings';

        echo '<div id="shapeblock-dashboard" data-initial-tab="' . esc_attr( $tab ) . '"></div>';
    }

    public function plugin_action_links( $plugin_actions ) {

		$new_actions = array();
		$new_actions['shapeblock_plugin_actions_setting'] = '<a href="' . esc_url( admin_url( 'admin.php?page=shapeblock' ) ) . '">' . esc_html__( 'Settings', 'shapeblock' ) . '</a>';

		return array_merge( $new_actions, $plugin_actions );

	}
}

