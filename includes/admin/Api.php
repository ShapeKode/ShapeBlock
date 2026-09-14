<?php
namespace ShapeBlock\Admin;

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
        register_rest_route( 'shapeblock/v1', '/update-block-status', array(
            'methods' => 'POST',
            'callback' => array( $this, 'update_block_status' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ) );

        register_rest_route( 'shapeblock/v1', '/update-all-block-status', array(
            'methods' => 'POST',
            'callback' => array( $this, 'update_all_block_status' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ) );

        // Templates endpoints
        register_rest_route( 'shapeblock/v1', '/templates', array(
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

        register_rest_route( 'shapeblock/v1', '/templates/(?P<id>\d+)', array(
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

        register_rest_route( 'shapeblock/v1', '/templates/(?P<id>\d+)/restore', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'restore_template' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ) );

        register_rest_route( 'shapeblock/v1', '/templates/bulk-delete', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'bulk_delete_templates' ),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ) );

        // Colors endpoints
        register_rest_route( 'shapeblock/v1', '/colors', array(
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
        register_rest_route( 'shapeblock/v1', '/layout', array(
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

        // Export / Import — settings, custom templates and theme builder templates.
        register_rest_route( 'shapeblock/v1', '/export', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'export_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ) );

        register_rest_route( 'shapeblock/v1', '/import', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'import_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ) );
    }

    /**
     * Identifier written into every export file so imports can reject foreign JSON.
     */
    const EXPORT_FORMAT  = 'shapeblock-export';
    const EXPORT_VERSION = 1;

    /**
     * Block namespace used by this plugin's blocks inside post content.
     */
    const BLOCK_NAMESPACE = 'shapeblock';

    /**
     * Export formats this plugin can read, mapped to the block namespace the
     * file's template content uses. ShapeBlock is the renamed successor of
     * Easy Elements For Gutenberg and ships the same 28 blocks, so its files
     * import here after a namespace rewrite.
     *
     * @return array<string,string>
     */
    private function compatible_formats() {
        return array(
            'shapeblock-export'                  => 'shapeblock',
            'easy-elements-for-gutenberg-export' => 'easy-elements-for-gutenberg',
        );
    }

    /**
     * Retarget block delimiters written by a sibling plugin at this plugin's
     * namespace. Only the two exact comment openers are replaced, so attribute
     * JSON and inner markup are untouched.
     *
     * @param string $content Post content from the export file.
     * @param string $from    Namespace the content was written with.
     * @return string
     */
    private function migrate_block_namespace( $content, $from ) {
        $to = self::BLOCK_NAMESPACE;

        if ( '' === $from || $from === $to || ! preg_match( '/^[a-z0-9-]+$/', $from ) ) {
            return $content;
        }

        return str_replace(
            array( '<!-- wp:' . $from . '/', '<!-- /wp:' . $from . '/' ),
            array( '<!-- wp:' . $to . '/', '<!-- /wp:' . $to . '/' ),
            $content
        );
    }

    /**
     * The three sections an export/import can cover.
     *
     * @return string[]
     */
    private function export_sections() {
        return array( 'settings', 'templates', 'builder' );
    }

    /**
     * Normalise the "include" param (array or comma separated string) down to
     * known section names. Empty/missing means "everything".
     *
     * @param mixed $raw Raw request param.
     * @return string[]
     */
    private function parse_sections( $raw ) {
        $all = $this->export_sections();

        if ( is_string( $raw ) ) {
            $raw = explode( ',', $raw );
        }
        if ( ! is_array( $raw ) || empty( $raw ) ) {
            return $all;
        }

        $clean = array();
        foreach ( $raw as $section ) {
            $section = sanitize_key( $section );
            if ( in_array( $section, $all, true ) ) {
                $clean[] = $section;
            }
        }

        return empty( $clean ) ? $all : array_values( array_unique( $clean ) );
    }

    /**
     * Current enable/disable status of every registered block, keyed by block id.
     *
     * @return array<string,string>
     */
    private function get_block_status_map() {
        $statuses = array();
        foreach ( Blocks::instance()->get_blocks() as $block ) {
            $id = isset( $block['id'] ) ? (string) $block['id'] : '';
            if ( '' === $id ) {
                continue;
            }
            $saved = get_option( 'shapeblock_block_' . $id );
            $statuses[ $id ] = ( 'disable' === $saved ) ? 'disable' : 'enable';
        }
        return $statuses;
    }

    /**
     * GET /export — build the portable payload.
     */
    public function export_data( $request ) {
        $sections = $this->parse_sections( $request->get_param( 'include' ) );

        $payload = array(
            'format'         => self::EXPORT_FORMAT,
            'version'        => self::EXPORT_VERSION,
            'plugin_version' => defined( 'SHAPEBLOCK_VERSION' ) ? SHAPEBLOCK_VERSION : '',
            'source'         => array(
                'plugin'          => 'shapeblock',
                'block_namespace' => self::BLOCK_NAMESPACE,
            ),
            'site_url'       => site_url(),
            'exported_at'    => current_time( 'mysql' ),
            'includes'       => $sections,
        );

        if ( in_array( 'settings', $sections, true ) ) {
            $payload['settings'] = array(
                'colors' => self::get_saved_colors(),
                'layout' => self::get_saved_layout(),
                'blocks' => $this->get_block_status_map(),
            );
        }

        if ( in_array( 'templates', $sections, true ) ) {
            $payload['templates'] = $this->export_templates();
        }

        if ( in_array( 'builder', $sections, true ) ) {
            $payload['builder_templates'] = $this->export_builder_templates();
        }

        return rest_ensure_response( $payload );
    }

    /**
     * Published custom templates, stripped of site-specific data (IDs, authors, URLs).
     *
     * @return array<int,array<string,string>>
     */
    private function export_templates() {
        $query = new \WP_Query( array(
            'post_type'      => 'shapeblock-template',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'date',
            'order'          => 'ASC',
            'no_found_rows'  => true,
        ) );

        $items = array();
        foreach ( $query->posts as $post ) {
            $items[] = array(
                'title'   => $post->post_title,
                'content' => $post->post_content,
            );
        }
        return $items;
    }

    /**
     * Published theme builder templates with their type and display conditions.
     *
     * @return array<int,array<string,mixed>>
     */
    private function export_builder_templates() {
        if ( ! class_exists( '\ShapeBlock\Extension\ThemeBuilder\Theme_Builder' ) ) {
            return array();
        }

        $query = new \WP_Query( array(
            'post_type'      => \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'date',
            'order'          => 'ASC',
            'no_found_rows'  => true,
        ) );

        $items = array();
        foreach ( $query->posts as $post ) {
            $items[] = array(
                'title'      => $post->post_title,
                'content'    => $post->post_content,
                'type'       => \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::get_post_type_slug( $post->ID ),
                'conditions' => \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::get_post_conditions( $post->ID ),
            );
        }
        return $items;
    }

    /**
     * POST /import — restore an export payload.
     *
     * Body: { data: <export payload>, include: [...], on_duplicate: 'create'|'skip' }
     */
    public function import_data( $request ) {
        $data = $request->get_param( 'data' );

        if ( ! is_array( $data ) ) {
            return new \WP_Error( 'invalid_payload', __( 'The import file could not be read.', 'shapeblock' ), array( 'status' => 400 ) );
        }

        $format     = isset( $data['format'] ) ? sanitize_key( $data['format'] ) : '';
        $compatible = $this->compatible_formats();
        if ( ! isset( $compatible[ $format ] ) ) {
            return new \WP_Error( 'invalid_format', __( 'This is not a ShapeBlock export file.', 'shapeblock' ), array( 'status' => 400 ) );
        }

        $version = isset( $data['version'] ) ? (int) $data['version'] : 0;
        if ( $version > self::EXPORT_VERSION ) {
            return new \WP_Error( 'unsupported_version', __( 'This file was created by a newer version of ShapeBlock.', 'shapeblock' ), array( 'status' => 400 ) );
        }

        // The file states its own block namespace; fall back to the one implied
        // by its format so older files still import.
        $namespace = '';
        if ( isset( $data['source']['block_namespace'] ) && is_string( $data['source']['block_namespace'] ) ) {
            $namespace = sanitize_key( $data['source']['block_namespace'] );
        }
        if ( '' === $namespace ) {
            $namespace = $compatible[ $format ];
        }

        $sections     = $this->parse_sections( $request->get_param( 'include' ) );
        $on_duplicate = 'skip' === sanitize_key( (string) $request->get_param( 'on_duplicate' ) ) ? 'skip' : 'create';

        $result = array(
            'settings'          => array( 'colors' => false, 'layout' => false, 'blocks' => 0 ),
            'templates'         => array( 'imported' => 0, 'skipped' => 0 ),
            'builder_templates' => array( 'imported' => 0, 'skipped' => 0 ),
        );

        if ( in_array( 'settings', $sections, true ) && isset( $data['settings'] ) && is_array( $data['settings'] ) ) {
            $result['settings'] = $this->import_settings( $data['settings'] );
        }

        if ( in_array( 'templates', $sections, true ) && isset( $data['templates'] ) && is_array( $data['templates'] ) ) {
            $result['templates'] = $this->import_templates( $data['templates'], $on_duplicate, $namespace );
        }

        if ( in_array( 'builder', $sections, true ) && isset( $data['builder_templates'] ) && is_array( $data['builder_templates'] ) ) {
            $result['builder_templates'] = $this->import_builder_templates( $data['builder_templates'], $on_duplicate, $namespace );
        }

        return rest_ensure_response( array(
            'status'   => 'success',
            'imported' => $result,
            'migrated' => $namespace !== self::BLOCK_NAMESPACE,
            'colors'   => self::get_saved_colors(),
            'layout'   => self::get_saved_layout(),
            'blocks'   => $this->get_block_status_map(),
        ) );
    }

    /**
     * Apply the settings section of an import. Every value goes through the same
     * sanitizers the normal save endpoints use.
     *
     * @param array $settings Settings section of the payload.
     * @return array Summary of what was applied.
     */
    private function import_settings( $settings ) {
        $summary = array( 'colors' => false, 'layout' => false, 'blocks' => 0 );

        if ( isset( $settings['colors'] ) && is_array( $settings['colors'] ) ) {
            $defaults = self::get_color_defaults();
            $clean    = array();
            foreach ( $defaults as $key => $default ) {
                $sanitized = isset( $settings['colors'][ $key ] ) ? $this->sanitize_color( $settings['colors'][ $key ] ) : '';
                $clean[ $key ] = '' !== $sanitized ? $sanitized : $default;
            }
            update_option( 'shapeblock_colors', $clean );
            $summary['colors'] = true;
        }

        if ( isset( $settings['layout'] ) && is_array( $settings['layout'] ) ) {
            $defaults  = self::get_layout_defaults();
            $sanitized = isset( $settings['layout']['container_width'] ) ? $this->sanitize_css_length( $settings['layout']['container_width'] ) : '';
            update_option( 'shapeblock_layout', array(
                'container_width' => '' !== $sanitized ? $sanitized : $defaults['container_width'],
            ) );
            $summary['layout'] = true;
        }

        if ( isset( $settings['blocks'] ) && is_array( $settings['blocks'] ) ) {
            // Only ids this install actually registers are accepted, so a stale
            // export can never create orphan options.
            $known = array_keys( $this->get_block_status_map() );
            foreach ( $settings['blocks'] as $block_id => $status ) {
                $block_id = sanitize_key( $block_id );
                if ( ! in_array( $block_id, $known, true ) ) {
                    continue;
                }
                $status = ( 'disable' === $status ) ? 'disable' : 'enable';
                update_option( 'shapeblock_block_' . $block_id, $status );
                $summary['blocks']++;
            }
        }

        return $summary;
    }

    /**
     * Does a published post of this type already carry this exact title?
     *
     * @param string $post_type Post type slug.
     * @param string $title     Title to look for.
     * @return bool
     */
    private function title_exists( $post_type, $title ) {
        $existing = new \WP_Query( array(
            'post_type'      => $post_type,
            'post_status'    => 'publish',
            'title'          => $title,
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ) );
        return ! empty( $existing->posts );
    }

    /**
     * Create custom templates from the payload.
     *
     * @param array  $items        Template rows.
     * @param string $on_duplicate 'skip' or 'create'.
     * @param string $namespace    Block namespace the content was written with.
     * @return array Summary counts.
     */
    private function import_templates( $items, $on_duplicate, $namespace ) {
        $summary = array( 'imported' => 0, 'skipped' => 0 );

        foreach ( $items as $item ) {
            if ( ! is_array( $item ) ) {
                continue;
            }
            $title = isset( $item['title'] ) ? sanitize_text_field( $item['title'] ) : '';
            if ( '' === $title ) {
                $summary['skipped']++;
                continue;
            }

            if ( 'skip' === $on_duplicate && $this->title_exists( 'shapeblock-template', $title ) ) {
                $summary['skipped']++;
                continue;
            }

            // Block markup is stored as-is; wp_insert_post applies the normal
            // content_save_pre / kses chain for the current user's capabilities.
            $content = isset( $item['content'] ) ? (string) $item['content'] : '';
            $content = $this->migrate_block_namespace( $content, $namespace );

            $post_id = wp_insert_post( array(
                'post_title'   => $title,
                'post_content' => wp_slash( $content ),
                'post_type'    => 'shapeblock-template',
                'post_status'  => 'publish',
            ), true );

            if ( is_wp_error( $post_id ) ) {
                $summary['skipped']++;
                continue;
            }

            $summary['imported']++;
        }

        return $summary;
    }

    /**
     * Create theme builder templates from the payload, restoring type and conditions.
     *
     * @param array  $items        Builder template rows.
     * @param string $on_duplicate 'skip' or 'create'.
     * @param string $namespace    Block namespace the content was written with.
     * @return array Summary counts.
     */
    private function import_builder_templates( $items, $on_duplicate, $namespace ) {
        $summary = array( 'imported' => 0, 'skipped' => 0 );

        if ( ! class_exists( '\ShapeBlock\Extension\ThemeBuilder\Theme_Builder' ) ) {
            return $summary;
        }

        $post_type = \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::POST_TYPE;

        foreach ( $items as $item ) {
            if ( ! is_array( $item ) ) {
                continue;
            }
            $title = isset( $item['title'] ) ? sanitize_text_field( $item['title'] ) : '';
            $type  = isset( $item['type'] ) ? sanitize_key( $item['type'] ) : '';

            if ( '' === $title || ! \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::is_valid_type( $type ) ) {
                $summary['skipped']++;
                continue;
            }

            if ( 'skip' === $on_duplicate && $this->title_exists( $post_type, $title ) ) {
                $summary['skipped']++;
                continue;
            }

            $content = isset( $item['content'] ) ? (string) $item['content'] : '';
            $content = $this->migrate_block_namespace( $content, $namespace );

            $post_id = wp_insert_post( array(
                'post_title'   => $title,
                'post_content' => wp_slash( $content ),
                'post_type'    => $post_type,
                'post_status'  => 'publish',
            ), true );

            if ( is_wp_error( $post_id ) ) {
                $summary['skipped']++;
                continue;
            }

            update_post_meta( $post_id, \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::META_TYPE, $type );

            $conditions = isset( $item['conditions'] ) ? $item['conditions'] : array();
            $conditions = \ShapeBlock\Extension\ThemeBuilder\Builder_Conditions::sanitize( $conditions );
            if ( empty( $conditions ) ) {
                $conditions = array( array( 'type' => 'include', 'rule' => 'entire_site', 'ids' => array() ) );
            }
            update_post_meta( $post_id, \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::META_CONDITIONS, $conditions );

            $summary['imported']++;
        }

        return $summary;
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
        $saved    = get_option( 'shapeblock_colors', array() );
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

        update_option( 'shapeblock_colors', $clean );

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
        $saved    = get_option( 'shapeblock_layout', array() );
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

        update_option( 'shapeblock_layout', $clean );

        return rest_ensure_response( array(
            'status' => 'success',
            'layout' => $clean,
        ) );
    }

    public function update_block_status( $request ) {
        $block_id = $request->get_param( 'blockId' );
        $status = $request->get_param( 'status' );


        
        // Update the block status in the database
        update_option( 'shapeblock_block_' . $block_id, $status );

        $saved_status = get_option( 'shapeblock_block_' . $block_id );

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
            update_option( 'shapeblock_block_' . $block_id, $status );
            $updated[ $block_id ] = get_option( 'shapeblock_block_' . $block_id );
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
            'post_type'      => 'shapeblock-template',
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
            'post_type'      => 'shapeblock-template',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ) );
        $trash_q = new \WP_Query( array(
            'post_type'      => 'shapeblock-template',
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

        if ( ! $post || $post->post_type !== 'shapeblock-template' ) {
            return new \WP_Error( 'not_found', 'Template not found', array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->format_template( $post ) );
    }

    public function create_template( $request ) {
        $title = sanitize_text_field( $request->get_param('title') );

        if ( empty( $title ) ) {
            return new \WP_Error( 'missing_title', 'Template title is required', array( 'status' => 400 ) );
        }

        $post_id = wp_insert_post( array(
            'post_title'  => $title,
            'post_type'   => 'shapeblock-template',
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

        if ( ! $post || $post->post_type !== 'shapeblock-template' ) {
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

        if ( ! $post || $post->post_type !== 'shapeblock-template' ) {
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

        if ( ! $post || $post->post_type !== 'shapeblock-template' ) {
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
            if ( $post && $post->post_type === 'shapeblock-template' ) {
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

