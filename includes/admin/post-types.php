<?php
namespace ShapeBlock\Admin;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SHAPEBLOCK_Post_Types {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function __construct() {
        add_action( 'init', array( $this, 'register_post_types' ) );
        add_shortcode( 'shapeblock_template', array( $this, 'render_shortcode' ) );
    }

    public function register_post_types() {
        $labels = array(
            'name'                  => __( 'Templates', 'shapeblock' ),
            'singular_name'         => __( 'Template', 'shapeblock' ),
            'menu_name'             => __( 'Templates', 'shapeblock' ),
            'name_admin_bar'        => __( 'Template', 'shapeblock' ),
            'add_new'               => __( 'Add New', 'shapeblock' ),
            'add_new_item'          => __( 'Add New Template', 'shapeblock' ),
            'new_item'              => __( 'New Template', 'shapeblock' ),
            'edit_item'             => __( 'Edit Template', 'shapeblock' ),
            'view_item'             => __( 'View Template', 'shapeblock' ),
            'all_items'             => __( 'All Templates', 'shapeblock' ),
            'search_items'          => __( 'Search Templates', 'shapeblock' ),
            'not_found'             => __( 'No templates found.', 'shapeblock' ),
            'not_found_in_trash'    => __( 'No templates found in Trash.', 'shapeblock' ),
        );

        $args = array(
            'labels'             => $labels,
            'public'             => false,
            'publicly_queryable' => false,
            'show_ui'            => true,
            'show_in_menu'       => false,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'shapeblock-template' ),
            // Templates are managed from the ShapeBlock dashboard by administrators
            // only, the same rule the REST routes apply.
            'capabilities'       => array(
                'edit_posts'             => 'manage_options',
                'edit_others_posts'      => 'manage_options',
                'edit_private_posts'     => 'manage_options',
                'edit_published_posts'   => 'manage_options',
                'publish_posts'          => 'manage_options',
                'read_private_posts'     => 'manage_options',
                'delete_posts'           => 'manage_options',
                'delete_others_posts'    => 'manage_options',
                'delete_private_posts'   => 'manage_options',
                'delete_published_posts' => 'manage_options',
                'create_posts'           => 'manage_options',
            ),
            'map_meta_cap'       => true,
            'has_archive'        => false,
            'hierarchical'       => false,
            'supports'           => array( 'title', 'editor', 'author' ),
            'show_in_rest'       => true,
            'rest_base'          => 'shapeblock-templates',
        );

        register_post_type( 'shapeblock-template', $args );
    }
    /**
     * The HTML a rendered template is allowed to contain.
     *
     * Shared with the Offcanvas block and the Theme Builder templates, which
     * print the same kind of content. See Helper::template_allowed_html().
     *
     * @return array Allowlist in wp_kses() form.
     */
    private static function allowed_html() {
        return \ShapeBlock\Frontend\Helper::template_allowed_html();
    }

    public function render_shortcode( $atts ) {
        $atts = shortcode_atts( array(
            'id' => 0,
        ), $atts, 'shapeblock_template' );

        $id = absint( $atts['id'] );
        if ( ! $id ) {
            return '';
        }

        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'shapeblock-template' || $post->post_status !== 'publish' ) {
            return '';
        }

        // A template that renders itself would recurse until PHP gives up.
        if ( isset( self::$rendering[ $id ] ) ) {
            return '';
        }
        self::$rendering[ $id ] = true;

        /*
         * Rendered through core's own the_content(), inside a set-up post context.
         * That runs the whole content pipeline — blocks, shortcodes, wpautop and
         * every the_content filter another plugin has registered — which is what a
         * page builder's markup needs, and it does it by calling the function
         * WordPress provides instead of invoking a core hook name from here.
         */
        $previous = isset( $GLOBALS['post'] ) ? $GLOBALS['post'] : null;

        $GLOBALS['post'] = $post;
        setup_postdata( $post );

        ob_start();
        the_content();
        $content = ob_get_clean();

        wp_reset_postdata();
        $GLOBALS['post'] = $previous;

        if ( $previous instanceof \WP_Post ) {
            setup_postdata( $previous );
        }

        unset( self::$rendering[ $id ] );

        // A shortcode's return value is printed by WordPress, so it is escaped
        // here against an allowlist rather than trusted. See allowed_html() for
        // what the list covers and why.
        return '<div class="shapeblock-template-content">' . wp_kses( $content, self::allowed_html() ) . '</div>';
    }

    /**
     * Templates currently being rendered, keyed by id, so a template that
     * contains its own shortcode stops instead of recursing.
     *
     * @var array<int,bool>
     */
    private static $rendering = array();
}

SHAPEBLOCK_Post_Types::instance();
