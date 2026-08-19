<?php
namespace EELFG\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Api {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'easy-elements-for-gutenberg/v1', '/update-block-status', array(
            'methods' => 'POST',
            'callback' => array( $this, 'update_block_status' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ) );

        register_rest_route( 'easy-elements-for-gutenberg/v1', '/update-all-block-status', array(
            'methods' => 'POST',
            'callback' => array( $this, 'update_all_block_status' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ) );

        // Templates endpoints
        register_rest_route( 'easy-elements-for-gutenberg/v1', '/templates', array(
            array(
                'methods'  => 'GET',
                'callback' => array( $this, 'get_templates' ),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
            array(
                'methods'  => 'POST',
                'callback' => array( $this, 'create_template' ),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
        ) );

        register_rest_route( 'easy-elements-for-gutenberg/v1', '/templates/(?P<id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array( $this, 'get_template' ),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
            array(
                'methods'  => 'PUT,PATCH',
                'callback' => array( $this, 'update_template' ),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
            array(
                'methods'  => 'DELETE',
                'callback' => array( $this, 'delete_template' ),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
        ) );

        register_rest_route( 'easy-elements-for-gutenberg/v1', '/templates/(?P<id>\d+)/restore', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'restore_template' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ) );

        register_rest_route( 'easy-elements-for-gutenberg/v1', '/templates/bulk-delete', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'bulk_delete_templates' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ) );

        // Colors endpoints
        register_rest_route( 'easy-elements-for-gutenberg/v1', '/colors', array(
            array(
                'methods'  => 'GET',
                'callback' => array( $this, 'get_colors' ),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ),
            array(
                'methods'  => 'POST',
                'callback' => array( $this, 'save_colors' ),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ),
        ) );

        // Layout endpoints — global container width, etc.
        register_rest_route( 'easy-elements-for-gutenberg/v1', '/layout', array(
            array(
                'methods'  => 'GET',
                'callback' => array( $this, 'get_layout' ),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ),
            array(
                'methods'  => 'POST',
                'callback' => array( $this, 'save_layout' ),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ),
        ) );
    }

    public static function get_color_defaults() {
        return array(
            'primary'    => '#126bf0',
            'secondary'  => '#5096ff',
            'tertiary'   => '#f3f3f3',
            'white'      => '#ffffff',
            'contrast_1' => '#1e1e1e',
            'contrast_2' => '#11111194',
            'border'     => '#8383831f',
        );
    }

    public static function get_saved_colors() {
        $defaults = self::get_color_defaults();
        $saved    = get_option( 'eelfg_colors', array() );
        if ( ! is_array( $saved ) ) {
            $saved = array();
        }
        return array_merge( $defaults, $saved );
    }

    private function sanitize_color( $value ) {
        $value = is_string( $value ) ? trim( $value ) : '';
        if ( $value === '' ) {
            return '';
        }
        // Accept #rgb, #rrggbb, #rrggbbaa, rgb(), rgba()
        if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value ) ) {
            return strtolower( $value );
        }
        if ( preg_match( '/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/', $value ) ) {
            return $value;
        }
        return '';
    }

    public function get_colors() {
        return rest_ensure_response( array(
            'colors'   => self::get_saved_colors(),
            'defaults' => self::get_color_defaults(),
        ) );
    }

    public function save_colors( $request ) {
        $input    = $request->get_param( 'colors' );
        $defaults = self::get_color_defaults();

        if ( ! is_array( $input ) ) {
            return new \WP_Error( 'invalid_payload', 'Colors payload must be an object.', array( 'status' => 400 ) );
        }

        $clean = array();
        foreach ( $defaults as $key => $default ) {
            if ( isset( $input[ $key ] ) ) {
                $sanitized = $this->sanitize_color( $input[ $key ] );
                $clean[ $key ] = $sanitized !== '' ? $sanitized : $default;
            } else {
                $clean[ $key ] = $default;
            }
        }

        update_option( 'eelfg_colors', $clean );

        return rest_ensure_response( array(
            'status' => 'success',
            'colors' => $clean,
        ) );
    }

    public static function get_layout_defaults() {
        return array(
            'container_width' => '1200px',
        );
    }

    public static function get_saved_layout() {
        $defaults = self::get_layout_defaults();
        $saved    = get_option( 'eelfg_layout', array() );
        if ( ! is_array( $saved ) ) {
            $saved = array();
        }
        return array_merge( $defaults, $saved );
    }

    private function sanitize_css_length( $value ) {
        $value = is_string( $value ) ? trim( $value ) : (string) $value;
        if ( $value === '' ) {
            return '';
        }
        // Bare number → treat as px.
        if ( is_numeric( $value ) ) {
            $n = (float) $value;
            return $n > 0 ? $n . 'px' : '';
        }
        // Length with allowed CSS unit (px, %, rem, em, vw, vh, ch).
        if ( preg_match( '/^([0-9]*\.?[0-9]+)(px|%|rem|em|vw|vh|ch)$/i', $value, $m ) ) {
            $n = (float) $m[1];
            return $n > 0 ? $n . strtolower( $m[2] ) : '';
        }
        return '';
    }

    public function get_layout() {
        return rest_ensure_response( array(
            'layout'   => self::get_saved_layout(),
            'defaults' => self::get_layout_defaults(),
        ) );
    }

    public function save_layout( $request ) {
        $input    = $request->get_param( 'layout' );
        $defaults = self::get_layout_defaults();

        if ( ! is_array( $input ) ) {
            return new \WP_Error( 'invalid_payload', 'Layout payload must be an object.', array( 'status' => 400 ) );
        }

        $clean = array();
        // container_width
        if ( isset( $input['container_width'] ) ) {
            $sanitized = $this->sanitize_css_length( $input['container_width'] );
            $clean['container_width'] = $sanitized !== '' ? $sanitized : $defaults['container_width'];
        } else {
            $clean['container_width'] = $defaults['container_width'];
        }

        update_option( 'eelfg_layout', $clean );

        return rest_ensure_response( array(
            'status' => 'success',
            'layout' => $clean,
        ) );
    }

    public function update_block_status( $request ) {
        $block_id = $request->get_param( 'blockId' );
        $status = $request->get_param( 'status' );


        
        // Update the block status in the database
        update_option( 'eelfg_block_' . $block_id, $status );

        $saved_status = get_option( 'eelfg_block_' . $block_id );

        return rest_ensure_response( array( 'status' => 'success', 'saved_status' => $saved_status ) );
    }

    public function update_all_block_status( $request ) {
        $block_ids = $request->get_param( 'blockIds' );
        $status    = $request->get_param( 'status' );

        // Only allow the two valid statuses.
        if ( ! in_array( $status, array( 'enable', 'disable' ), true ) ) {
            return new \WP_Error( 'invalid_status', 'Invalid status value.', array( 'status' => 400 ) );
        }

        if ( ! is_array( $block_ids ) || empty( $block_ids ) ) {
            return new \WP_Error( 'invalid_block_ids', 'No blocks provided.', array( 'status' => 400 ) );
        }

        $updated = array();
        foreach ( $block_ids as $block_id ) {
            $block_id = sanitize_text_field( $block_id );
            update_option( 'eelfg_block_' . $block_id, $status );
            $updated[ $block_id ] = get_option( 'eelfg_block_' . $block_id );
        }

        return rest_ensure_response( array( 'status' => 'success', 'saved_status' => $status, 'updated' => $updated ) );
    }

    // Templates CRUD

    public function get_templates( $request ) {
        $page     = (int) $request->get_param('page') ?: 1;
        $per_page = (int) $request->get_param('per_page') ?: 10;
        $search   = sanitize_text_field( $request->get_param('search') ?: '' );
        $orderby  = sanitize_text_field( $request->get_param('orderby') ?: 'date' );
        $order    = sanitize_text_field( $request->get_param('order') ?: 'DESC' );
        $status   = sanitize_text_field( $request->get_param('status') ?: 'publish' );
        if ( ! in_array( $status, array( 'publish', 'trash' ), true ) ) {
            $status = 'publish';
        }

        $args = array(
            'post_type'      => 'eelfg-template',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'orderby'        => $orderby,
            'order'          => strtoupper($order) === 'ASC' ? 'ASC' : 'DESC',
            'post_status'    => $status,
        );

        if ( ! empty( $search ) ) {
            $args['s'] = $search;
        }

        $query = new \WP_Query( $args );
        $templates = array();

        foreach ( $query->posts as $post ) {
            $templates[] = $this->format_template( $post );
        }

        // Counts per status so the UI can show the free-limit badge and the
        // Trash tab count regardless of which view is currently loaded.
        $active_q = new \WP_Query( array(
            'post_type'      => 'eelfg-template',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ) );
        $trash_q = new \WP_Query( array(
            'post_type'      => 'eelfg-template',
            'post_status'    => 'trash',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ) );

        return rest_ensure_response( array(
            'templates'    => $templates,
            'total'        => (int) $query->found_posts,
            'pages'        => (int) $query->max_num_pages,
            'page'         => $page,
            'per_page'     => $per_page,
            'active_count' => (int) $active_q->found_posts,
            'trash_count'  => (int) $trash_q->found_posts,
        ) );
    }

    public function get_template( $request ) {
        $id   = (int) $request->get_param('id');
        $post = get_post( $id );

        if ( ! $post || $post->post_type !== 'eelfg-template' ) {
            return new \WP_Error( 'not_found', 'Template not found', array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->format_template( $post ) );
    }

    public function create_template( $request ) {
        // Check template limit for free version
        $is_pro = false;
        if ( class_exists( '\EELFG_LICENSE' ) ) {
            $is_pro = (bool) \EELFG_LICENSE::instance()->is_license_active();
        }

        if ( ! $is_pro ) {
            $user_templates = new \WP_Query( array(
                'post_type'      => 'eelfg-template',
                'post_status'    => 'publish',
                'posts_per_page' => 1,
                'fields'         => 'ids',
            ) );
            $total = (int) $user_templates->found_posts;
            if ( $total >= 3 ) {
                return new \WP_Error( 'template_limit', 'Free version allows up to 3 templates. Upgrade to Pro for unlimited templates.', array( 'status' => 403 ) );
            }
        }

        $title = sanitize_text_field( $request->get_param('title') );

        if ( empty( $title ) ) {
            return new \WP_Error( 'missing_title', 'Template title is required', array( 'status' => 400 ) );
        }

        $post_id = wp_insert_post( array(
            'post_title'  => $title,
            'post_type'   => 'eelfg-template',
            'post_status' => 'publish',
            'post_content' => '',
        ), true );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        $post = get_post( $post_id );
        return rest_ensure_response( $this->format_template( $post ) );
    }

    public function update_template( $request ) {
        $id    = (int) $request->get_param('id');
        $post  = get_post( $id );

        if ( ! $post || $post->post_type !== 'eelfg-template' ) {
            return new \WP_Error( 'not_found', 'Template not found', array( 'status' => 404 ) );
        }

        $update_args = array( 'ID' => $id );

        $title = $request->get_param('title');
        if ( $title !== null ) {
            $update_args['post_title'] = sanitize_text_field( $title );
        }

        $content = $request->get_param('content');
        if ( $content !== null ) {
            $update_args['post_content'] = wp_kses_post( $content );
        }

        $result = wp_update_post( $update_args, true );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        $post = get_post( $id );
        return rest_ensure_response( $this->format_template( $post ) );
    }

    public function delete_template( $request ) {
        $id   = (int) $request->get_param('id');
        $post = get_post( $id );

        if ( ! $post || $post->post_type !== 'eelfg-template' ) {
            return new \WP_Error( 'not_found', 'Template not found', array( 'status' => 404 ) );
        }

        // Permanently delete only when explicitly forced (from the Trash view);
        // otherwise move the template to Trash so it can be restored.
        $force = filter_var( $request->get_param('force'), FILTER_VALIDATE_BOOLEAN );
        if ( $force ) {
            wp_delete_post( $id, true );
        } else {
            wp_trash_post( $id );
        }

        return rest_ensure_response( array( 'status' => 'success', 'id' => $id, 'force' => $force ) );
    }

    public function restore_template( $request ) {
        $id   = (int) $request->get_param('id');
        $post = get_post( $id );

        if ( ! $post || $post->post_type !== 'eelfg-template' ) {
            return new \WP_Error( 'not_found', 'Template not found', array( 'status' => 404 ) );
        }

        wp_untrash_post( $id );
        // wp_untrash_post can restore to 'draft' on some setups; force back to publish.
        if ( 'publish' !== get_post_status( $id ) ) {
            wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
        }

        return rest_ensure_response( array( 'status' => 'success', 'id' => $id ) );
    }

    public function bulk_delete_templates( $request ) {
        $ids    = $request->get_param('ids');
        $action = sanitize_text_field( $request->get_param('action') ?: 'trash' );
        if ( ! in_array( $action, array( 'trash', 'restore', 'delete' ), true ) ) {
            $action = 'trash';
        }

        if ( ! is_array( $ids ) || empty( $ids ) ) {
            return new \WP_Error( 'missing_ids', 'Template IDs are required', array( 'status' => 400 ) );
        }

        $deleted = array();
        foreach ( $ids as $id ) {
            $id   = (int) $id;
            $post = get_post( $id );
            if ( $post && $post->post_type === 'eelfg-template' ) {
                if ( 'delete' === $action ) {
                    wp_delete_post( $id, true );
                } elseif ( 'restore' === $action ) {
                    wp_untrash_post( $id );
                    if ( 'publish' !== get_post_status( $id ) ) {
                        wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
                    }
                } else {
                    wp_trash_post( $id );
                }
                $deleted[] = $id;
            }
        }

        return rest_ensure_response( array( 'status' => 'success', 'deleted' => $deleted, 'action' => $action ) );
    }

    private function format_template( $post ) {
        $author = get_userdata( $post->post_author );
        return array(
            'id'         => $post->ID,
            'title'      => $post->post_title,
            'content'    => $post->post_content,
            'date'       => $post->post_date,
            'modified'   => $post->post_modified,
            'author'     => $author ? $author->display_name : '',
            'status'     => $post->post_status,
            'editUrl'    => admin_url( 'post.php?post=' . $post->ID . '&action=edit' ),
        );
    }
}

