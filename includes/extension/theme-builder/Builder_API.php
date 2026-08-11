<?php
namespace EELFG\Extension\ThemeBuilder;

/**
 * Theme Builder — REST API.
 *
 * CRUD for builder templates plus condition load/save and the metadata the
 * dashboard needs (registered types, condition rules, selectable objects).
 * Mirrors the conventions of \EELFG\Admin\Api (easy-elements-for-gutenberg/v1 namespace, edit_posts cap).
 *
 * @package EasyElementsForGutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Builder_API {

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

	public function permission() {
		return current_user_can( 'edit_posts' );
	}

	public function register_routes() {
		$can_edit = array( $this, 'permission' );

		// Metadata: registered template types + condition rules.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/meta',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_meta' ),
				'permission_callback' => $can_edit,
			)
		);

		// Selectable objects for object-bound condition rules (pages, posts).
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/objects',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_objects' ),
				'permission_callback' => $can_edit,
			)
		);

		// Collection: list + create.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => $can_edit,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => $can_edit,
				),
			)
		);

		// Single item: get + delete.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => $can_edit,
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => $can_edit,
				),
			)
		);

		// Restore a single trashed item.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/(?P<id>\d+)/restore',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'restore_item' ),
				'permission_callback' => $can_edit,
			)
		);

		// Conditions for a single item.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/(?P<id>\d+)/conditions',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_conditions' ),
					'permission_callback' => $can_edit,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_conditions' ),
					'permission_callback' => $can_edit,
				),
			)
		);

		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/bulk-delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'bulk_delete' ),
				'permission_callback' => $can_edit,
			)
		);

		// Bulk restore trashed items.
		register_rest_route(
			'easy-elements-for-gutenberg/v1',
			'/builder/bulk-restore',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'bulk_restore' ),
				'permission_callback' => $can_edit,
			)
		);
	}

	public function get_meta() {
		return rest_ensure_response(
			array(
				'types' => array_values( \EELFG\Extension\ThemeBuilder\Theme_Builder::get_template_types() ),
				'rules' => \EELFG\Extension\ThemeBuilder\Builder_Conditions::get_rules(),
			)
		);
	}

	/**
	 * Return selectable objects for a given object type (page|post).
	 */
	public function get_objects( $request ) {
		$object_type = sanitize_key( $request->get_param( 'objectType' ) );
		$search      = sanitize_text_field( (string) $request->get_param( 'search' ) );

		$post_type = in_array( $object_type, array( 'page', 'post' ), true ) ? $object_type : 'page';

		$args = array(
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'no_found_rows'  => true,
			'fields'         => 'ids',
		);

		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$query   = new \WP_Query( $args );
		$objects = array();
		foreach ( $query->posts as $id ) {
			$objects[] = array(
				'value' => (int) $id,
				'label' => get_the_title( $id ) ? get_the_title( $id ) : sprintf( '#%d', $id ),
			);
		}

		return rest_ensure_response( array( 'objects' => $objects ) );
	}

	public function get_items( $request ) {
		$type     = sanitize_key( (string) $request->get_param( 'type' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = (int) $request->get_param( 'per_page' );
		$per_page = $per_page > 0 ? $per_page : 10;
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

		// 'trash' lists trashed templates; anything else lists active (published) ones.
		$status      = sanitize_key( (string) $request->get_param( 'status' ) );
		$post_status = ( 'trash' === $status ) ? 'trash' : 'publish';

		$args = array(
			'post_type'      => \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE,
			'post_status'    => $post_status,
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		);

		if ( $type && \EELFG\Extension\ThemeBuilder\Theme_Builder::is_valid_type( $type ) ) {
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Filtering a small admin-only template post type by its type meta.
			$args['meta_query'] = array(
				array(
					'key'   => \EELFG\Extension\ThemeBuilder\Theme_Builder::META_TYPE,
					'value' => $type,
				),
			);
		}

		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );
		$items = array();
		foreach ( $query->posts as $post ) {
			$items[] = $this->format_item( $post );
		}

		return rest_ensure_response(
			array(
				'items'      => $items,
				'total'      => (int) $query->found_posts,
				'pages'      => (int) $query->max_num_pages,
				'page'       => $page,
				'per_page'   => $per_page,
				'trashTotal' => $this->count_by_status( 'trash' ),
			)
		);
	}

	/**
	 * Count builder templates in a given post status (used for the Trash badge).
	 *
	 * @param string $status Post status to count.
	 * @return int
	 */
	private function count_by_status( $status ) {
		$counts = wp_count_posts( \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE );
		return isset( $counts->$status ) ? (int) $counts->$status : 0;
	}

	public function get_item( $request ) {
		$post = $this->get_builder_post( $request );
		if ( is_wp_error( $post ) ) {
			return $post;
		}
		return rest_ensure_response( $this->format_item( $post ) );
	}

	public function create_item( $request ) {
		$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
		$type  = sanitize_key( (string) $request->get_param( 'type' ) );

		if ( '' === $title ) {
			return new \WP_Error( 'missing_title', __( 'A title is required.', 'easy-elements-for-gutenberg' ), array( 'status' => 400 ) );
		}

		if ( ! \EELFG\Extension\ThemeBuilder\Theme_Builder::is_valid_type( $type ) ) {
			return new \WP_Error( 'invalid_type', __( 'Please choose a valid template type.', 'easy-elements-for-gutenberg' ), array( 'status' => 400 ) );
		}

		$post_id = wp_insert_post(
			array(
				'post_title'   => $title,
				'post_type'    => \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE,
				'post_status'  => 'publish',
				'post_content' => '',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, \EELFG\Extension\ThemeBuilder\Theme_Builder::META_TYPE, $type );
		// New templates default to "entire site".
		update_post_meta(
			$post_id,
			\EELFG\Extension\ThemeBuilder\Theme_Builder::META_CONDITIONS,
			array( array( 'type' => 'include', 'rule' => 'entire_site', 'ids' => array() ) )
		);

		return rest_ensure_response( $this->format_item( get_post( $post_id ) ) );
	}

	public function delete_item( $request ) {
		$post = $this->get_builder_post( $request );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		// A first delete moves the template to Trash; deleting an already-trashed
		// item (or an explicit force=1) removes it permanently.
		$force = rest_sanitize_boolean( $request->get_param( 'force' ) );
		if ( $force || 'trash' === $post->post_status ) {
			wp_delete_post( $post->ID, true );
			return rest_ensure_response( array( 'status' => 'success', 'action' => 'deleted', 'id' => $post->ID ) );
		}

		wp_trash_post( $post->ID );
		return rest_ensure_response( array( 'status' => 'success', 'action' => 'trashed', 'id' => $post->ID ) );
	}

	public function restore_item( $request ) {
		$post = $this->get_builder_post( $request );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		wp_untrash_post( $post->ID );

		// Templates are only ever published, so make sure a restore lands back on
		// 'publish' regardless of what the trashed status meta held.
		$restored = get_post( $post->ID );
		if ( $restored && 'publish' !== $restored->post_status ) {
			wp_update_post( array( 'ID' => $post->ID, 'post_status' => 'publish' ) );
		}

		return rest_ensure_response( array( 'status' => 'success', 'action' => 'restored', 'id' => $post->ID ) );
	}

	public function bulk_delete( $request ) {
		$ids = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || empty( $ids ) ) {
			return new \WP_Error( 'missing_ids', __( 'No items provided.', 'easy-elements-for-gutenberg' ), array( 'status' => 400 ) );
		}

		$force   = rest_sanitize_boolean( $request->get_param( 'force' ) );
		$deleted = array();
		foreach ( $ids as $id ) {
			$id   = (int) $id;
			$post = get_post( $id );
			if ( $post && \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE === $post->post_type ) {
				if ( $force || 'trash' === $post->post_status ) {
					wp_delete_post( $id, true );
				} else {
					wp_trash_post( $id );
				}
				$deleted[] = $id;
			}
		}

		return rest_ensure_response( array( 'status' => 'success', 'deleted' => $deleted ) );
	}

	public function bulk_restore( $request ) {
		$ids = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || empty( $ids ) ) {
			return new \WP_Error( 'missing_ids', __( 'No items provided.', 'easy-elements-for-gutenberg' ), array( 'status' => 400 ) );
		}

		$restored = array();
		foreach ( $ids as $id ) {
			$id   = (int) $id;
			$post = get_post( $id );
			if ( $post && \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE === $post->post_type && 'trash' === $post->post_status ) {
				wp_untrash_post( $id );
				$after = get_post( $id );
				if ( $after && 'publish' !== $after->post_status ) {
					wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
				}
				$restored[] = $id;
			}
		}

		return rest_ensure_response( array( 'status' => 'success', 'restored' => $restored ) );
	}

	public function get_conditions( $request ) {
		$post = $this->get_builder_post( $request );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		return rest_ensure_response(
			array(
				'conditions' => \EELFG\Extension\ThemeBuilder\Theme_Builder::get_post_conditions( $post->ID ),
				'rules'      => \EELFG\Extension\ThemeBuilder\Builder_Conditions::get_rules(),
			)
		);
	}

	public function save_conditions( $request ) {
		$post = $this->get_builder_post( $request );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$clean = \EELFG\Extension\ThemeBuilder\Builder_Conditions::sanitize( $request->get_param( 'conditions' ) );
		update_post_meta( $post->ID, \EELFG\Extension\ThemeBuilder\Theme_Builder::META_CONDITIONS, $clean );

		return rest_ensure_response(
			array(
				'status'     => 'success',
				'conditions' => $clean,
				'summary'    => \EELFG\Extension\ThemeBuilder\Builder_Conditions::summarize( $clean ),
			)
		);
	}

	/**
	 * Resolve and validate the builder post for an id-bearing request.
	 *
	 * @return WP_Post|\WP_Error
	 */
	private function get_builder_post( $request ) {
		$id   = (int) $request->get_param( 'id' );
		$post = get_post( $id );

		if ( ! $post || \EELFG\Extension\ThemeBuilder\Theme_Builder::POST_TYPE !== $post->post_type ) {
			return new \WP_Error( 'not_found', __( 'Builder template not found.', 'easy-elements-for-gutenberg' ), array( 'status' => 404 ) );
		}

		return $post;
	}

	private function format_item( $post ) {
		$type       = \EELFG\Extension\ThemeBuilder\Theme_Builder::get_post_type_slug( $post->ID );
		$conditions = \EELFG\Extension\ThemeBuilder\Theme_Builder::get_post_conditions( $post->ID );
		$author     = get_userdata( $post->post_author );

		return array(
			'id'                => $post->ID,
			'title'             => $post->post_title,
			'type'              => $type,
			'typeLabel'         => \EELFG\Extension\ThemeBuilder\Theme_Builder::get_type_label( $type ),
			'conditions'        => $conditions,
			'conditionsSummary' => \EELFG\Extension\ThemeBuilder\Builder_Conditions::summarize( $conditions ),
			'date'              => $post->post_date,
			'modified'          => $post->post_modified,
			'author'            => $author ? $author->display_name : '',
			'status'            => $post->post_status,
			'editUrl'           => admin_url( 'post.php?post=' . $post->ID . '&action=edit' ),
		);
	}
}
