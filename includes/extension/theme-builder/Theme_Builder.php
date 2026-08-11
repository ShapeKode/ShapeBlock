<?php
namespace EELFG\Extension\ThemeBuilder;

/**
 * Theme Builder — core orchestrator.
 *
 * Registers the "Easy Elements GT Builder" post type and exposes a scalable
 * registry of template types. Only `header` and `footer` ship today; future
 * types (single, page, archive, search, 404 …) can be added to the registry
 * or hooked in via the `eelfg_builder_template_types` filter without touching
 * the rest of the system — conditions, rendering and the REST API all read
 * from this registry.
 *
 * @package EasyElementsForGutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Theme_Builder {

	/**
	 * Custom post type slug.
	 */
	const POST_TYPE = 'eelfg-builder';

	/**
	 * Post meta key holding the template type (header|footer|…).
	 */
	const META_TYPE = '_eelfg_builder_type';

	/**
	 * Post meta key holding the display conditions array.
	 */
	const META_CONDITIONS = '_eelfg_builder_conditions';

	public static function instance() {
		static $instance = null;
		if ( null === $instance ) {
			$instance = new self();
		}
		return $instance;
	}

	public function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_meta' ) );

		$this->includes();
	}

	private function includes() {
		// Classes are PSR-4 autoloaded; instantiating them registers their hooks.
		\EELFG\Extension\ThemeBuilder\Builder_Conditions::instance();
		\EELFG\Extension\ThemeBuilder\Builder_Render::instance();
		\EELFG\Extension\ThemeBuilder\Builder_API::instance();
	}

	/**
	 * The scalable registry of template types.
	 *
	 * Each entry describes one buildable location. To add a future type, push a
	 * new entry here (or via the filter) — the rest of the plugin adapts.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function get_template_types() {
		$types = array(
			'header' => array(
				'slug'        => 'header',
				'label'       => __( 'Header', 'easy-elements-for-gutenberg' ),
				'plural'      => __( 'Headers', 'easy-elements-for-gutenberg' ),
				'description' => __( 'Replaces your theme header across the site.', 'easy-elements-for-gutenberg' ),
				'enabled'     => true,
				'isPro'       => false,
			),
			'footer' => array(
				'slug'        => 'footer',
				'label'       => __( 'Footer', 'easy-elements-for-gutenberg' ),
				'plural'      => __( 'Footers', 'easy-elements-for-gutenberg' ),
				'description' => __( 'Replaces your theme footer across the site.', 'easy-elements-for-gutenberg' ),
				'enabled'     => true,
				'isPro'       => false,
			),

			'custom_block' => array(
				'slug'        => 'custom_block',
				'label'       => __( 'Custom Block', 'easy-elements-for-gutenberg' ),
				'plural'      => __( 'Custom Blocks', 'easy-elements-for-gutenberg' ),
				'description' => __( 'A reusable block you place anywhere with its shortcode — it is not injected automatically.', 'easy-elements-for-gutenberg' ),
				'enabled'     => true,
				'isPro'       => false,
				// Rendered only via [eelfg_builder id="…"]; the admin shows the shortcode for this type.
				'shortcode'   => true,
			),

			/*
			 * Future template types — register them here (or via the
			 * `eelfg_builder_template_types` filter) when their rendering is
			 * implemented in \EELFG\Extension\ThemeBuilder\Builder_Render. Kept commented so the UI
			 * only surfaces what actually works today.
			 *
			 * 'single'  => array( 'slug' => 'single',  'label' => 'Single Post', 'plural' => 'Single Posts', 'enabled' => true ),
			 * 'page'    => array( 'slug' => 'page',    'label' => 'Page',        'plural' => 'Pages',        'enabled' => true ),
			 * 'archive' => array( 'slug' => 'archive', 'label' => 'Archive',     'plural' => 'Archives',     'enabled' => true ),
			 */
		);

		/**
		 * Filter the registered Theme Builder template types.
		 *
		 * @param array $types Map of type slug => config.
		 */
		return apply_filters( 'eelfg_builder_template_types', $types );
	}

	/**
	 * Whether a given type slug is a registered, enabled template type.
	 */
	public static function is_valid_type( $type ) {
		$types = self::get_template_types();
		return isset( $types[ $type ] ) && ! empty( $types[ $type ]['enabled'] );
	}

	/**
	 * Human label for a type slug, falling back to the raw slug.
	 */
	public static function get_type_label( $type ) {
		$types = self::get_template_types();
		return isset( $types[ $type ]['label'] ) ? $types[ $type ]['label'] : ucfirst( (string) $type );
	}

	public function register_post_type() {
		$labels = array(
			'name'               => __( 'Easy Elements GT Builder', 'easy-elements-for-gutenberg' ),
			'singular_name'      => __( 'Builder Template', 'easy-elements-for-gutenberg' ),
			'add_new'            => __( 'Add New', 'easy-elements-for-gutenberg' ),
			'add_new_item'       => __( 'Add New Builder Template', 'easy-elements-for-gutenberg' ),
			'edit_item'          => __( 'Edit Builder Template', 'easy-elements-for-gutenberg' ),
			'new_item'           => __( 'New Builder Template', 'easy-elements-for-gutenberg' ),
			'view_item'          => __( 'View Builder Template', 'easy-elements-for-gutenberg' ),
			'search_items'       => __( 'Search Builder Templates', 'easy-elements-for-gutenberg' ),
			'not_found'          => __( 'No builder templates found', 'easy-elements-for-gutenberg' ),
			'not_found_in_trash' => __( 'No builder templates found in Trash', 'easy-elements-for-gutenberg' ),
			'menu_name'          => __( 'Easy Elements GT Builder', 'easy-elements-for-gutenberg' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => $labels,
				'public'              => false,
				'publicly_queryable'  => false,
				'show_ui'             => true,   // Allow editing in the block editor at post.php.
				'show_in_menu'        => false,  // Managed from the Easy Elements dashboard instead.
				'show_in_admin_bar'   => false,
				'show_in_nav_menus'   => false,
				'exclude_from_search' => true,
				'has_archive'         => false,
				'rewrite'             => false,
				'query_var'           => false,
				'hierarchical'        => false,
				'show_in_rest'        => true,   // Required for the Gutenberg editor.
				'rest_base'           => 'eelfg-builder',
				'supports'            => array( 'title', 'editor', 'custom-fields', 'revisions' ),
				'menu_icon'           => 'dashicons-layout',
			)
		);
	}

	public function register_meta() {
		register_post_meta(
			self::POST_TYPE,
			self::META_TYPE,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => 'sanitize_key',
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);

		// Conditions are an arbitrarily-shaped array; we manage read/write via the
		// REST API with explicit sanitization rather than exposing it raw in core REST.
		register_post_meta(
			self::POST_TYPE,
			self::META_CONDITIONS,
			array(
				'type'          => 'array',
				'single'        => true,
				'show_in_rest'  => false,
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Read a builder post's type, normalised.
	 */
	public static function get_post_type_slug( $post_id ) {
		$type = get_post_meta( $post_id, self::META_TYPE, true );
		return self::is_valid_type( $type ) ? $type : '';
	}

	/**
	 * Read a builder post's conditions, always returning an array.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_post_conditions( $post_id ) {
		$conditions = get_post_meta( $post_id, self::META_CONDITIONS, true );
		if ( ! is_array( $conditions ) ) {
			return array();
		}
		return $conditions;
	}
}
