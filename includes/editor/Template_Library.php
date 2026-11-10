<?php
/**
 * ShapeBlock Template Library — browse ready-made block templates (template
 * groups with their landing and inner pages, pages, sections, headers and
 * footers) from the ShapeBlock template server and insert them in the block
 * editor, or import a whole demo (pages, header, footer, menus, settings)
 * from ShapeBlock → Templates. Only free items are listed.
 *
 * The editor never talks to the template server directly: every request goes
 * through the shapeblock/v1/template-library/* routes below, so
 *   - there is no cross-origin request from the browser,
 *   - list responses are cached for a while,
 *   - images in an inserted template can be copied to this site's Media Library.
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library {

	/**
	 * The ShapeBlock template server (the shapeblock-templates/v1 REST namespace).
	 * Override with the SHAPEBLOCK_TEMPLATES_API_URL constant or the
	 * shapeblock_template_library_api_url filter.
	 */
	const DEFAULT_API_URL = 'https://shapekode.com/product/shapeblock/demo-template/wp-json/shapeblock-templates/v1';

	const REST_NAMESPACE = 'shapeblock/v1';
	const REST_BASE      = '/template-library';

	/** Library content types the template server knows. */
	const TYPES = array( 'template', 'page', 'pattern', 'header', 'footer' );

	/** How long a list response is kept. Content is never cached. */
	const CACHE_TTL = 15 * MINUTE_IN_SECONDS;

	/** Option holding the cache generation; bumping it drops every cached list. */
	const CACHE_VERSION_OPTION = 'shapeblock_template_library_cache';

	/** Attachment meta: the template-server URL an image was copied from. */
	const SOURCE_META = '_shapeblock_template_source';

	/** Most images copied for one insert, so a request can't run for minutes. */
	const MAX_MEDIA = 40;

	const SCRIPT_HANDLE = 'shapeblock-template-library';

	public static function instance() {
		static $instance = null;
		if ( null === $instance ) {
			$instance = new self();
		}
		return $instance;
	}

	public function __construct() {
		if ( ! self::enabled() ) {
			return;
		}
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue' ) );
		add_action( 'admin_menu', array( $this, 'add_admin_page' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin' ), 20 );
		add_action( 'in_admin_header', array( $this, 'suppress_notices' ), 1 );
		add_filter( 'admin_body_class', array( $this, 'body_class' ) );
	}

	/** ShapeBlock → Templates: its own full-screen page, outside the dashboard app. */
	const ADMIN_PAGE = 'shapeblock-starter-templates';

	/** Hook suffix of the Templates page, set in add_admin_page(). */
	private static $page_hook = '';

	/**
	 * Adds ShapeBlock → Templates right after "Custom Templates".
	 */
	public function add_admin_page() {
		$hook = add_submenu_page(
			'shapeblock',
			__( 'ShapeBlock - Templates', 'shapeblock' ),
			__( 'Templates', 'shapeblock' ),
			'manage_options',
			self::ADMIN_PAGE,
			array( $this, 'render_admin_page' ),
			4
		);
		if ( $hook ) {
			self::$page_hook = $hook;
		}
	}

	/**
	 * The page is drawn by template-library-admin.js; this is its mount point
	 * and a message for browsers without JavaScript.
	 */
	public function render_admin_page() {
		echo '<div class="wrap sbtl-starter-wrap"><h1 class="screen-reader-text">' . esc_html__( 'Templates', 'shapeblock' ) . '</h1>';
		echo '<div id="sbtl-starter"><noscript>' . esc_html__( 'The template library needs JavaScript.', 'shapeblock' ) . '</noscript></div></div>';
	}

	/**
	 * @return bool Whether the current screen is the Templates page.
	 */
	private static function is_admin_page() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		return $screen && '' !== self::$page_hook && self::$page_hook === $screen->id;
	}

	/**
	 * Full-screen: the page draws its own top bar.
	 *
	 * @param string $classes Body classes.
	 * @return string
	 */
	public function body_class( $classes ) {
		return self::is_admin_page() ? $classes . ' sbtl-fullscreen' : $classes;
	}

	/**
	 * Other plugins' notices would sit on top of the full-screen page.
	 */
	public function suppress_notices() {
		if ( ! self::is_admin_page() ) {
			return;
		}
		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
		remove_all_actions( 'user_admin_notices' );
		remove_all_actions( 'network_admin_notices' );
	}

	/**
	 * @return bool
	 */
	public static function enabled() {
		return (bool) apply_filters( 'shapeblock_template_library_enabled', true );
	}

	/**
	 * Base URL of the template server's REST namespace, without a trailing slash.
	 *
	 * @return string
	 */
	public static function api_url() {
		$url = defined( 'SHAPEBLOCK_TEMPLATES_API_URL' ) ? SHAPEBLOCK_TEMPLATES_API_URL : self::DEFAULT_API_URL;
		$url = (string) apply_filters( 'shapeblock_template_library_api_url', $url );
		return untrailingslashit( esc_url_raw( $url ) );
	}

	/**
	 * ShapeBlock lists and inserts the template server's free items only.
	 */
	const ACCESS = 'free';

	/**
	 * Parameters of the REST request being served, passed on to the
	 * shapeblock_template_library_request action.
	 *
	 * @var array
	 */
	private static $params = array();

	/* --------------------------------------------------------------------- */
	/* Editor assets                                                         */
	/* --------------------------------------------------------------------- */

	/**
	 * The shared UI (cards, sidebar, preview) used by both the editor modal
	 * and the dashboard page, plus its settings and stylesheet.
	 */
	private static function register_shared() {
		$js  = 'includes/public/assets/js/template-library-ui.js';
		$css = 'includes/public/assets/css/template-library.css';

		wp_register_script(
			'shapeblock-template-library-ui',
			SHAPEBLOCK_PL_URL . $js,
			array( 'wp-api-fetch', 'wp-components', 'wp-element', 'wp-i18n', 'wp-url', 'wp-a11y' ),
			\shapeblock_asset_version( SHAPEBLOCK_PL_PATH . $js ),
			true
		);
		wp_set_script_translations( 'shapeblock-template-library-ui', 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );

		wp_add_inline_script(
			'shapeblock-template-library-ui',
			'window.shapeblockTemplateLibrary = ' . wp_json_encode(
				array(
					'restPath'      => self::REST_NAMESPACE . self::REST_BASE,
					'logo'          => SHAPEBLOCK_PL_URL . 'assets/images/icons/plugin-icon-18_18.svg',
					'placeholder'   => SHAPEBLOCK_PL_URL . 'includes/public/assets/img/template-placeholder.svg',
					'perPage'       => 24,
					'canUpload'     => current_user_can( 'upload_files' ),
					'canPublish'    => current_user_can( 'publish_pages' ),
					'canManage'     => current_user_can( 'manage_options' ),
					'dashboardUrl'  => admin_url( 'admin.php?page=shapeblock' ),
					'themeBuilder'  => admin_url( 'admin.php?page=shapeblock-theme-builder' ),
					'pagesUrl'      => admin_url( 'edit.php?post_type=page' ),
					'homeUrl'       => home_url( '/' ),
					'upgradeUrl'    => \ShapeBlock\Main::get_upgrade_url(),
				)
			) . ';',
			'before'
		);

		wp_register_style(
			'shapeblock-template-library',
			SHAPEBLOCK_PL_URL . $css,
			array( 'wp-components' ),
			\shapeblock_asset_version( SHAPEBLOCK_PL_PATH . $css )
		);
	}

	public function enqueue() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		// Post editor and Site Editor only; the widgets screens have no page to fill.
		if ( ! $screen || ! $screen->is_block_editor() || in_array( $screen->id, array( 'widgets', 'customize' ), true ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		self::register_shared();
		$js = 'includes/public/assets/js/template-library.js';

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			SHAPEBLOCK_PL_URL . $js,
			array( 'shapeblock-template-library-ui', 'wp-dom-ready', 'wp-blocks', 'wp-block-editor', 'wp-data' ),
			\shapeblock_asset_version( SHAPEBLOCK_PL_PATH . $js ),
			true
		);
		wp_set_script_translations( self::SCRIPT_HANDLE, 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );
		wp_enqueue_style( 'shapeblock-template-library' );

		/**
		 * Fires after the template library's scripts are enqueued, so add-ons
		 * can load a script that registers with window.shapeblockTL.extend().
		 *
		 * @param string $screen 'editor' (block editor modal) or 'admin' (ShapeBlock → Templates).
		 */
		do_action( 'shapeblock_template_library_enqueue', 'editor' );
	}

	/**
	 * ShapeBlock → Templates page.
	 */
	public function enqueue_admin() {
		if ( ! self::is_admin_page() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		self::register_shared();
		$js = 'includes/public/assets/js/template-library-admin.js';

		wp_enqueue_script(
			'shapeblock-template-library-admin',
			SHAPEBLOCK_PL_URL . $js,
			array( 'shapeblock-template-library-ui', 'wp-dom-ready' ),
			\shapeblock_asset_version( SHAPEBLOCK_PL_PATH . $js ),
			true
		);
		wp_set_script_translations( 'shapeblock-template-library-admin', 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );
		wp_enqueue_style( 'shapeblock-template-library' );

		/** This action is documented in enqueue(). */
		do_action( 'shapeblock_template_library_enqueue', 'admin' );
	}

	/* --------------------------------------------------------------------- */
	/* REST proxy                                                            */
	/* --------------------------------------------------------------------- */

	public function register_routes() {
		$base = self::REST_BASE;

		// A whole-demo import step: the demo's WordPress export (posts, media, menus).
		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/import-xml',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'import_xml' ),
				'permission_callback' => static function () {
					return current_user_can( 'manage_options' ) && current_user_can( 'import' );
				},
				'args'                => array(
					'group' => array(
						'type'     => 'string',
						'pattern'  => '^[a-z0-9_-]+$',
						'required' => true,
					),
					'media' => array(
						'type'    => 'boolean',
						'default' => true,
					),
				),
			)
		);

		// The last step of a whole-demo import: links, menus and settings.
		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/setup',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'setup_site' ),
				'permission_callback' => static function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'group'    => array(
						'type'     => 'string',
						'pattern'  => '^[a-z0-9_-]+$',
						'required' => true,
					),
					'posts'    => array(
						'description' => __( 'Imported posts: library key ("page:647") => new post ID.', 'shapeblock' ),
						'type'        => 'object',
						'required'    => true,
					),
					'menus'    => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'settings' => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'site'     => array(
						'description' => __( "Use the demo's site title and tagline.", 'shapeblock' ),
						'type'        => 'boolean',
						'default'     => false,
					),
					'xml_menus' => array(
						'description' => __( 'Menus created from the demo content file.', 'shapeblock' ),
						'type'        => 'array',
						'items'       => array( 'type' => 'integer' ),
						'default'     => array(),
					),
				),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/library',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_library' ),
				'permission_callback' => array( $this, 'can_browse' ),
				'args'                => array(
					'type'       => array(
						'type'     => 'string',
						'enum'     => self::TYPES,
						'required' => true,
					),
					'categories' => array(
						'type'    => 'string',
						'default' => '',
					),
					'groups'     => array(
						'type'    => 'string',
						'default' => '',
					),
					'landing'    => array(
						'type'    => 'string',
						'enum'    => array( 'all', 'yes', 'no' ),
						'default' => 'all',
					),
					'search'     => array(
						'type'      => 'string',
						'default'   => '',
						'maxLength' => 100,
					),
					'sort'       => array(
						'type'    => 'string',
						'enum'    => array( 'newest', 'oldest', 'az', 'za' ),
						'default' => 'newest',
					),
					'page'       => array(
						'type'    => 'integer',
						'minimum' => 1,
						'default' => 1,
					),
					'per_page'   => array(
						'type'    => 'integer',
						'minimum' => 1,
						'maximum' => 48,
						'default' => 24,
					),
					'refresh'    => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/groups',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_groups' ),
				'permission_callback' => array( $this, 'can_browse' ),
				'args'                => array(
					'refresh' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/groups/(?P<slug>[a-z0-9_-]+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_group' ),
				'permission_callback' => array( $this, 'can_browse' ),
				'args'                => array(
					'refresh' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/content/(?P<type>[a-z]+)/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_content' ),
				'permission_callback' => array( $this, 'can_browse' ),
				'args'                => array(
					'type'  => array(
						'type'     => 'string',
						'enum'     => self::TYPES,
						'required' => true,
					),
					'id'    => array(
						'type'     => 'integer',
						'minimum'  => 1,
						'required' => true,
					),
					'media' => array(
						'description' => __( 'Copy the images to the Media Library.', 'shapeblock' ),
						'type'        => 'boolean',
						'default'     => false,
					),
				),
			)
		);

		// Creates a page (templates, pages) or a Theme Builder header/footer
		// from one library item — the steps of a whole-demo import.
		register_rest_route(
			self::REST_NAMESPACE,
			$base . '/import',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'import_item' ),
				'permission_callback' => array( $this, 'can_import' ),
				'args'                => array(
					'type'     => array(
						'type'     => 'string',
						'enum'     => self::TYPES,
						'required' => true,
					),
					'id'       => array(
						'type'     => 'integer',
						'minimum'  => 1,
						'required' => true,
					),
					'media'    => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'front'    => array(
						'description' => __( 'Make the new page the homepage.', 'shapeblock' ),
						'type'        => 'boolean',
						'default'     => false,
					),
					'activate' => array(
						'description' => __( 'Show the new header/footer on the entire site.', 'shapeblock' ),
						'type'        => 'boolean',
						'default'     => false,
					),
				),
			)
		);
	}

	/**
	 * Pages need publish_pages; headers and footers go to the Theme Builder,
	 * which is administrators only, as is changing the homepage.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return bool
	 */
	public function can_import( $request ) {
		if ( in_array( $request['type'], array( 'header', 'footer' ), true ) || $request['front'] ) {
			return current_user_can( 'manage_options' );
		}
		return current_user_can( 'publish_pages' );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function import_item( $request ) {
		self::$params = $request->get_params();
		$type = $request['type'];
		$data = self::fetch_content( $type, (int) $request['id'], (bool) $request['media'] );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		if ( '' === trim( $data['content'] ) ) {
			return new \WP_Error( 'shapeblock_tl_empty', __( 'This template has no content to import.', 'shapeblock' ), array( 'status' => 422 ) );
		}

		$is_part = in_array( $type, array( 'header', 'footer' ), true );
		$builder = '\ShapeBlock\Extension\ThemeBuilder\Theme_Builder';
		if ( $is_part && ! class_exists( $builder ) ) {
			return new \WP_Error( 'shapeblock_tl_no_builder', __( 'The Theme Builder is not available.', 'shapeblock' ), array( 'status' => 500 ) );
		}

		$post_id = wp_insert_post(
			wp_slash(
				array(
					'post_type'    => $is_part ? $builder::POST_TYPE : 'page',
					'post_status'  => 'publish',
					'post_title'   => '' !== $data['title'] ? $data['title'] : __( 'Imported template', 'shapeblock' ),
					'post_content' => $data['content'],
				)
			),
			true
		);
		if ( is_wp_error( $post_id ) ) {
			$post_id->add_data( array( 'status' => 500 ) );
			return $post_id;
		}
		update_post_meta( $post_id, '_shapeblock_template_import', $type . ':' . (int) $request['id'] );

		// Demo pages are designed edge to edge: no theme title, sidebar or box.
		if ( ! $is_part && \ShapeBlock\Extension\ThemeBuilder\Page_Template::available() ) {
			update_post_meta( $post_id, '_wp_page_template', \ShapeBlock\Extension\ThemeBuilder\Page_Template::SLUG );
		}

		if ( $is_part ) {
			update_post_meta( $post_id, $builder::META_TYPE, $type );
			update_post_meta(
				$post_id,
				$builder::META_CONDITIONS,
				$request['activate']
					? array(
						array(
							'type' => 'include',
							'rule' => 'entire_site',
							'ids'  => array(),
						),
					)
					: array()
			);
		} elseif ( $request['front'] ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', $post_id );
		}

		return rest_ensure_response(
			array(
				'post_id'  => $post_id,
				'title'    => get_the_title( $post_id ),
				'kind'     => $is_part ? $type : 'page',
				'edit_url' => get_edit_post_link( $post_id, 'raw' ),
				'view_url' => $is_part ? '' : get_permalink( $post_id ),
				'media'    => $data['media'],
			)
		);
	}

	/**
	 * One item's block markup from the template server, with its images
	 * copied to the Media Library when asked (and allowed).
	 *
	 * @param string $type  Library type.
	 * @param int    $id    Item ID.
	 * @param bool   $media Copy images.
	 * @return array{id:int,title:string,content:string,media:array}|\WP_Error
	 */
	private static function fetch_content( $type, $id, $media ) {
		$data = self::remote( '/library/' . $type . '/' . $id . '/content' );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$content = isset( $data['content'] ) && is_string( $data['content'] ) ? $data['content'] : '';
		$stats   = array(
			'imported' => 0,
			'failed'   => 0,
		);

		if ( $media && '' !== $content && current_user_can( 'upload_files' ) ) {
			$result  = self::import_media( $content );
			$content = $result['content'];
			$stats   = array(
				'imported' => $result['imported'],
				'failed'   => $result['failed'],
			);
		}

		return array(
			'id'      => isset( $data['id'] ) ? (int) $data['id'] : $id,
			'title'   => isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : '',
			'content' => $content,
			'media'   => $stats,
		);
	}

	/**
	 * Anyone who can write posts can browse and insert; copying images also
	 * needs upload_files (checked in get_content()).
	 *
	 * @return bool
	 */
	public function can_browse() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_library( $request ) {
		self::$params = $request->get_params();
		$query = array(
			'type'     => $request['type'],
			'access'   => self::ACCESS,
			'landing'  => $request['landing'],
			'sort'     => $request['sort'],
			'page'     => (int) $request['page'],
			'per_page' => (int) $request['per_page'],
		);
		foreach ( array( 'categories', 'groups' ) as $key ) {
			$slugs = self::slug_list( $request[ $key ] );
			if ( $slugs ) {
				$query[ $key ] = implode( ',', $slugs );
			}
		}
		$search = trim( sanitize_text_field( $request['search'] ) );
		if ( '' !== $search ) {
			$query['search'] = $search;
		}

		$sent = array();
		$data = self::cached( '/library', $query, (bool) $request['refresh'], $sent );
		if ( ! is_wp_error( $data ) && isset( $data['counts'] ) && is_array( $data['counts'] ) ) {
			// Only the number of items for the access level that was asked for.
			$access         = isset( $sent['access'] ) ? (string) $sent['access'] : self::ACCESS;
			$data['counts'] = array( 'total' => isset( $data['counts'][ $access ] ) ? (int) $data['counts'][ $access ] : 0 );
		}
		return self::respond( $data );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_groups( $request ) {
		self::$params = $request->get_params();
		$data = self::cached( '/groups', array( 'access' => self::ACCESS ), (bool) $request['refresh'] );
		if ( ! is_wp_error( $data ) && isset( $data['groups'] ) && is_array( $data['groups'] ) ) {
			// A demo is offered only when its main (landing) page was listed.
			$data['groups'] = array_values(
				array_filter(
					$data['groups'],
					static function ( $group ) {
						return ! empty( $group['landing'] );
					}
				)
			);
		}
		return self::respond( $data );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_group( $request ) {
		self::$params = $request->get_params();
		$slug = sanitize_title( $request['slug'] );
		return self::respond( self::cached( '/groups/' . rawurlencode( $slug ), array( 'access' => self::ACCESS ), (bool) $request['refresh'] ) );
	}

	/**
	 * The block markup of one item, optionally with its images copied to the
	 * Media Library and the markup pointed at the copies.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_content( $request ) {
		self::$params = $request->get_params();
		$data = self::fetch_content( $request['type'], (int) $request['id'], (bool) $request['media'] );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$data['type'] = $request['type'];

		$response = rest_ensure_response( $data );
		$response->header( 'Cache-Control', 'private, no-store' );
		return $response;
	}

	/* --------------------------------------------------------------------- */
	/* Whole-demo setup: links, menus, settings                              */
	/* --------------------------------------------------------------------- */

	/**
	 * Runs after the demo's pages, header and footer were imported:
	 *   1. links to the demo's live pages inside the imported content now
	 *      point at the new pages (so navigation and buttons work),
	 *   2. the demo's menus are created and the first one is assigned to the
	 *      theme's menu location (classic themes) or saved as a Navigation
	 *      menu (block themes),
	 *   3. the demo's settings are applied: ShapeBlock colors and layout,
	 *      Additional CSS, and — only when asked — site title and tagline.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function setup_site( $request ) {
		self::$params = $request->get_params();
		$data = self::cached( '/groups/' . rawurlencode( sanitize_title( $request['group'] ) ), array( 'access' => self::ACCESS ), false );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$group = isset( $data['group'] ) && is_array( $data['group'] ) ? $data['group'] : array();
		$setup = isset( $group['setup'] ) && is_array( $group['setup'] ) ? $group['setup'] : array();

		// Library key => imported post the current user may edit.
		$posts = array();
		foreach ( (array) $request['posts'] as $key => $post_id ) {
			$post = get_post( absint( $post_id ) );
			if ( preg_match( '/^[a-z]+:\d+$/', (string) $key ) && $post && current_user_can( 'edit_post', $post->ID ) ) {
				$posts[ $key ] = $post->ID;
			}
		}
		if ( ! empty( $group['landing'][0] ) ) {
			$landing_key = $group['landing'][0]['type'] . ':' . (int) $group['landing'][0]['id'];
			if ( isset( $posts[ $landing_key ] ) ) {
				$posts['landing'] = $posts[ $landing_key ];
			}
		}

		$result = array(
			'links'    => self::rewrite_links( isset( $setup['links'] ) ? (array) $setup['links'] : array(), $posts ),
			'menus'    => array(),
			'settings' => array(),
		);

		if ( $request['menus'] && ! empty( $setup['menus'] ) ) {
			foreach ( (array) $setup['menus'] as $index => $menu ) {
				$created = self::create_menu( (array) $menu, $posts, 0 === $index );
				if ( $created ) {
					$result['menus'][] = $created;
				}
			}
		}

		// No menu from the library: the demo file's first menu becomes the main one.
		if ( ! $result['menus'] && $request['xml_menus'] && ! ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) ) {
			$menu      = wp_get_nav_menu_object( (int) $request['xml_menus'][0] );
			$locations = get_registered_nav_menus();
			if ( $menu && $locations ) {
				$location              = isset( $locations['primary'] ) ? 'primary' : (string) array_key_first( $locations );
				$assigned              = (array) get_theme_mod( 'nav_menu_locations', array() );
				$assigned[ $location ] = (int) $menu->term_id;
				set_theme_mod( 'nav_menu_locations', $assigned );
				$result['menus'][] = array(
					'name'     => $menu->name,
					'id'       => (int) $menu->term_id,
					'location' => $location,
				);
			}
		}

		$settings = isset( $setup['settings'] ) && is_array( $setup['settings'] ) ? $setup['settings'] : array();
		if ( $request['settings'] ) {
			$result['settings'] = array_merge( $result['settings'], self::apply_design_settings( $settings, isset( $group['name'] ) ? $group['name'] : '' ) );
		}
		if ( $request['site'] && ! empty( $settings['site'] ) ) {
			if ( ! empty( $settings['site']['title'] ) ) {
				update_option( 'blogname', sanitize_text_field( $settings['site']['title'] ) );
				$result['settings'][] = 'title';
			}
			if ( isset( $settings['site']['tagline'] ) ) {
				update_option( 'blogdescription', sanitize_text_field( $settings['site']['tagline'] ) );
				$result['settings'][] = 'tagline';
			}
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Imports the demo's WordPress export file. The file URL comes from the
	 * template server's group data, never from the request.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function import_xml( $request ) {
		self::$params = $request->get_params();
		$data = self::cached( '/groups/' . rawurlencode( sanitize_title( $request['group'] ) ), array( 'access' => self::ACCESS ), false );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$url = isset( $data['group']['setup']['xml'] ) ? esc_url_raw( (string) $data['group']['setup']['xml'], array( 'http', 'https' ) ) : '';
		if ( '' === $url ) {
			return new \WP_Error( 'shapeblock_tl_no_xml', __( 'This template has no demo content file.', 'shapeblock' ), array( 'status' => 404 ) );
		}

		$importer = new Demo_Content_Importer( $request['media'] && current_user_can( 'upload_files' ) );

		// Same-site template server (a development copy): read the file from
		// this site's uploads instead of a loopback download.
		$uploads = wp_get_upload_dir();
		$local   = '';
		if ( null !== self::local_route( self::api_url() ) && 0 === strpos( $url, trailingslashit( $uploads['baseurl'] ) ) ) {
			$path = wp_normalize_path( $uploads['basedir'] . '/' . substr( $url, strlen( trailingslashit( $uploads['baseurl'] ) ) ) );
			if ( 0 === strpos( $path, wp_normalize_path( $uploads['basedir'] ) . '/' ) && false === strpos( $path, '..' ) && is_readable( $path ) ) {
				$local = $path;
			}
		}
		$result = '' !== $local ? $importer->import_file( $local ) : $importer->import_url( $url );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return rest_ensure_response( $result );
	}

	/**
	 * Points links to the demo's live pages at the imported pages, in every
	 * imported post. Only whole URLs are replaced (followed by a quote,
	 * space, "<", "#", "?" or the end), so asset URLs under the same address
	 * stay untouched.
	 *
	 * @param array $links Live URL => library key.
	 * @param array $posts Library key => post ID.
	 * @return int Number of posts changed.
	 */
	private static function rewrite_links( array $links, array $posts ) {
		$map = array();
		foreach ( $links as $url => $key ) {
			$url = esc_url_raw( (string) $url );
			if ( '' === $url || ! isset( $posts[ $key ] ) || 'page' !== get_post_type( $posts[ $key ] ) ) {
				continue;
			}
			$target = get_permalink( $posts[ $key ] );
			if ( ! $target ) {
				continue;
			}
			$map[ trailingslashit( $url ) ]   = trailingslashit( $target );
			$map[ untrailingslashit( $url ) ] = untrailingslashit( $target );
		}
		if ( ! $map ) {
			return 0;
		}

		// Longest first, so a page URL wins over the demo's root URL.
		uksort(
			$map,
			static function ( $a, $b ) {
				return strlen( $b ) - strlen( $a );
			}
		);
		$pattern = '#(' . implode( '|', array_map( static function ( $url ) {
			return preg_quote( $url, '#' );
		}, array_keys( $map ) ) ) . ')(?=["\'\s<\#?]|\\\\u0022|$)#';

		$changed = 0;
		foreach ( array_unique( array_diff_key( $posts, array( 'landing' => 0 ) ) ) as $post_id ) {
			$content = (string) get_post_field( 'post_content', $post_id, 'raw' );
			$updated = preg_replace_callback(
				$pattern,
				static function ( $m ) use ( $map ) {
					return $map[ $m[1] ];
				},
				$content
			);
			if ( null !== $updated && $updated !== $content ) {
				wp_update_post(
					wp_slash(
						array(
							'ID'           => $post_id,
							'post_content' => $updated,
						)
					)
				);
				++$changed;
			}
		}
		return $changed;
	}

	/**
	 * @param array $menu      { name, location, items }.
	 * @param array $posts     Library key => post ID.
	 * @param bool  $is_first  The demo's first menu (gets a location by default).
	 * @return array|null { name, id, location }.
	 */
	private static function create_menu( array $menu, array $posts, $is_first ) {
		$items = isset( $menu['items'] ) && is_array( $menu['items'] ) ? $menu['items'] : array();
		if ( ! $items ) {
			return null;
		}
		$name = isset( $menu['name'] ) && '' !== trim( (string) $menu['name'] ) ? sanitize_text_field( $menu['name'] ) : __( 'Main menu', 'shapeblock' );

		if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
			$post_id = wp_insert_post(
				wp_slash(
					array(
						'post_type'    => 'wp_navigation',
						'post_status'  => 'publish',
						'post_title'   => $name,
						'post_content' => self::navigation_blocks( $items, $posts ),
					)
				),
				true
			);
			return is_wp_error( $post_id ) ? null : array(
				'name'     => $name,
				'id'       => $post_id,
				'location' => '',
			);
		}

		// A unique name: "Nova Agency Menu", then "Nova Agency Menu 2", …
		$unique = $name;
		for ( $n = 2; wp_get_nav_menu_object( $unique ); $n++ ) {
			$unique = $name . ' ' . $n;
		}
		$menu_id = wp_create_nav_menu( $unique );
		if ( is_wp_error( $menu_id ) ) {
			return null;
		}
		self::add_menu_items( $menu_id, $items, $posts, 0 );

		// The menu's own location if the theme has it; otherwise the first
		// menu takes the theme's first location.
		$locations = get_registered_nav_menus();
		$location  = isset( $menu['location'] ) ? sanitize_key( $menu['location'] ) : '';
		if ( ! isset( $locations[ $location ] ) ) {
			$location = $is_first && $locations ? (string) array_key_first( $locations ) : '';
		}
		if ( '' !== $location ) {
			$assigned              = (array) get_theme_mod( 'nav_menu_locations', array() );
			$assigned[ $location ] = $menu_id;
			set_theme_mod( 'nav_menu_locations', $assigned );
		}

		return array(
			'name'     => $unique,
			'id'       => $menu_id,
			'location' => $location,
		);
	}

	/**
	 * @param int   $menu_id Menu term ID.
	 * @param array $items   Menu items.
	 * @param array $posts   Library key => post ID.
	 * @param int   $parent  Parent menu item ID.
	 */
	private static function add_menu_items( $menu_id, array $items, array $posts, $parent ) {
		foreach ( $items as $item ) {
			$args = self::menu_item_args( (array) $item, $posts );
			if ( ! $args ) {
				continue;
			}
			$args['menu-item-parent-id'] = $parent;
			$args['menu-item-status']    = 'publish';
			$item_id                     = wp_update_nav_menu_item( $menu_id, 0, $args );
			if ( ! is_wp_error( $item_id ) && ! empty( $item['children'] ) && is_array( $item['children'] ) ) {
				self::add_menu_items( $menu_id, $item['children'], $posts, $item_id );
			}
		}
	}

	/**
	 * @param array $item  { title, item | url }.
	 * @param array $posts Library key => post ID.
	 * @return array|null wp_update_nav_menu_item() args.
	 */
	private static function menu_item_args( array $item, array $posts ) {
		$title = isset( $item['title'] ) ? sanitize_text_field( $item['title'] ) : '';
		if ( ! empty( $item['item'] ) ) {
			$post_id = isset( $posts[ $item['item'] ] ) ? $posts[ $item['item'] ] : 0;
			// Only pages can be menu links; headers/footers and missing items are skipped.
			if ( ! $post_id || 'page' !== get_post_type( $post_id ) ) {
				return null;
			}
			return array(
				'menu-item-title'     => '' !== $title ? $title : get_the_title( $post_id ),
				'menu-item-object'    => 'page',
				'menu-item-object-id' => $post_id,
				'menu-item-type'      => 'post_type',
			);
		}
		if ( ! empty( $item['url'] ) && '' !== $title ) {
			$url = (string) $item['url'];
			return array(
				'menu-item-title' => $title,
				'menu-item-url'   => esc_url_raw( 0 === strpos( $url, '/' ) ? home_url( $url ) : $url ),
				'menu-item-type'  => 'custom',
			);
		}
		return null;
	}

	/**
	 * Navigation-link blocks for a block theme's wp_navigation menu.
	 *
	 * @param array $items Menu items.
	 * @param array $posts Library key => post ID.
	 * @return string Serialized blocks.
	 */
	private static function navigation_blocks( array $items, array $posts ) {
		$out = '';
		foreach ( $items as $item ) {
			$args = self::menu_item_args( (array) $item, $posts );
			if ( ! $args ) {
				continue;
			}
			$attrs = array( 'label' => $args['menu-item-title'] );
			if ( 'post_type' === $args['menu-item-type'] ) {
				$attrs += array(
					'type' => 'page',
					'id'   => $args['menu-item-object-id'],
					'url'  => get_permalink( $args['menu-item-object-id'] ),
					'kind' => 'post-type',
				);
			} else {
				$attrs += array(
					'url'  => $args['menu-item-url'],
					'kind' => 'custom',
				);
			}
			$children = ! empty( $item['children'] ) && is_array( $item['children'] ) ? self::navigation_blocks( $item['children'], $posts ) : '';
			$out     .= '' !== $children
				? serialize_block( array( 'blockName' => 'core/navigation-submenu', 'attrs' => $attrs, 'innerBlocks' => parse_blocks( $children ), 'innerHTML' => '', 'innerContent' => array_fill( 0, count( parse_blocks( $children ) ), null ) ) )
				: serialize_block( array( 'blockName' => 'core/navigation-link', 'attrs' => $attrs, 'innerBlocks' => array(), 'innerHTML' => '', 'innerContent' => array() ) );
		}
		return $out;
	}

	/**
	 * ShapeBlock colors/layout (through ShapeBlock's own import, with the
	 * same sanitizing) and Additional CSS (appended once per demo).
	 *
	 * @param array  $settings Group settings.
	 * @param string $name     Demo name, for the CSS comment.
	 * @return string[] What was applied.
	 */
	private static function apply_design_settings( array $settings, $name ) {
		$applied = array();

		if ( ! empty( $settings['shapeblock'] ) && is_array( $settings['shapeblock'] ) ) {
			$payload = array();
			// Keys the demo doesn't set keep this site's values.
			if ( ! empty( $settings['shapeblock']['colors'] ) && is_array( $settings['shapeblock']['colors'] ) ) {
				$payload['colors'] = array_merge( \ShapeBlock\Admin\Api::get_saved_colors(), $settings['shapeblock']['colors'] );
			}
			if ( ! empty( $settings['shapeblock']['layout'] ) && is_array( $settings['shapeblock']['layout'] ) ) {
				$payload['layout'] = array_merge( \ShapeBlock\Admin\Api::get_saved_layout(), $settings['shapeblock']['layout'] );
			}
			if ( $payload ) {
				$import = new \WP_REST_Request( 'POST', '/shapeblock/v1/import' );
				$import->set_body_params(
					array(
						'data'    => array(
							'format'   => \ShapeBlock\Admin\Api::EXPORT_FORMAT,
							'version'  => \ShapeBlock\Admin\Api::EXPORT_VERSION,
							'settings' => $payload,
						),
						'include' => array( 'settings' ),
					)
				);
				$response = rest_do_request( $import );
				if ( ! $response->is_error() ) {
					$applied[] = 'shapeblock';
				}
			}
		}

		if ( ! empty( $settings['custom_css'] ) && is_string( $settings['custom_css'] ) && function_exists( 'wp_update_custom_css_post' ) ) {
			$marker = '/* ShapeBlock template: ' . sanitize_text_field( $name ) . ' */';
			$css    = (string) wp_get_custom_css();
			if ( false === strpos( $css, $marker ) ) {
				$result = wp_update_custom_css_post( trim( $css . "\n\n" . $marker . "\n" . wp_strip_all_tags( $settings['custom_css'] ) ) );
				if ( ! is_wp_error( $result ) ) {
					$applied[] = 'css';
				}
			}
		}

		return $applied;
	}

	/**
	 * Drops every cached list response.
	 */
	public static function flush_cache() {
		update_option( self::CACHE_VERSION_OPTION, (int) get_option( self::CACHE_VERSION_OPTION, 1 ) + 1, false );
	}

	/* --------------------------------------------------------------------- */
	/* Template server requests                                              */
	/* --------------------------------------------------------------------- */

	/**
	 * A list response from the cache, or fetched and cached.
	 *
	 * @param string $path    Path under the API namespace.
	 * @param array  $query   Query arguments.
	 * @param bool   $refresh Skip (and replace) the cached copy.
	 * @param array  $sent    Set to the query that was finally used.
	 * @return array|\WP_Error
	 */
	private static function cached( $path, array $query, $refresh, &$sent = array() ) {
		$request = self::prepare( $path, $query );
		$sent    = $request->query;

		$query = $request->query;
		ksort( $query );
		$key = 'shapeblock_tl_' . md5(
			wp_json_encode(
				array(
					self::api_url(),
					$path,
					$query,
					$request->headers,
					(int) get_option( self::CACHE_VERSION_OPTION, 1 ),
					SHAPEBLOCK_VERSION,
				)
			)
		);

		if ( ! $refresh ) {
			$cached = get_transient( $key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$data = self::send( $request );
		if ( ! is_wp_error( $data ) ) {
			set_transient( $key, $data, self::CACHE_TTL );
		}
		return $data;
	}

	/**
	 * One request to the template server, before it is sent.
	 *
	 * @param string $path  Path under the API namespace, starting with "/".
	 * @param array  $query Query arguments.
	 * @return object { path: string, query: array, headers: array, params: array }
	 */
	private static function prepare( $path, array $query ) {
		$request = (object) array(
			'path'    => $path,
			'query'   => $query,
			'headers' => array(),
			'params'  => self::$params,
		);

		/**
		 * Fires before a request is sent to the template server. Add-ons may
		 * change $request->query and add $request->headers; $request->path and
		 * $request->params (the parameters of the REST request being served)
		 * are for reading.
		 *
		 * @param object $request { path, query, headers, params }.
		 */
		do_action( 'shapeblock_template_library_request', $request );

		return (object) array(
			'path'    => $path,
			'query'   => is_array( $request->query ) ? $request->query : $query,
			'headers' => is_array( $request->headers ) ? array_map( 'strval', $request->headers ) : array(),
		);
	}

	/**
	 * GET a path on the template server and decode the JSON answer.
	 *
	 * @param string $path  Path under the API namespace, starting with "/".
	 * @param array  $query Query arguments.
	 * @return array|\WP_Error
	 */
	private static function remote( $path, array $query = array() ) {
		return self::send( self::prepare( $path, $query ) );
	}

	/**
	 * Sends a prepared request. When the template server is this same site
	 * (a development copy), it is dispatched internally instead of over
	 * HTTP, which avoids loopback problems on local servers.
	 *
	 * @param object $request From prepare().
	 * @return array|\WP_Error
	 */
	private static function send( $request ) {
		$base = self::api_url();
		if ( '' === $base ) {
			return new \WP_Error( 'shapeblock_tl_no_server', __( 'No template server is configured.', 'shapeblock' ), array( 'status' => 500 ) );
		}

		$local = self::local_route( $base );
		if ( null !== $local ) {
			return self::dispatch_local( $local . $request->path, $request->query, $request->headers );
		}

		$url     = add_query_arg( array_map( 'rawurlencode', $request->query ), $base . $request->path );
		$headers = array_merge( $request->headers, array( 'Accept' => 'application/json' ) );

		// The URL comes from a constant or filter, never from the request.
		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 20,
				'headers' => $headers,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'shapeblock_tl_unreachable',
				__( 'Could not reach the ShapeBlock template library. Please check your internet connection and try again.', 'shapeblock' ),
				array(
					'status' => 502,
					'detail' => $response->get_error_message(),
				)
			);
		}

		$status = (int) wp_remote_retrieve_response_code( $response );
		$data   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status >= 400 ) {
			return self::remote_error( is_array( $data ) ? $data : array(), $status );
		}
		if ( ! is_array( $data ) ) {
			return new \WP_Error( 'shapeblock_tl_bad_response', __( 'The template library sent an unexpected response.', 'shapeblock' ), array( 'status' => 502 ) );
		}
		return $data;
	}

	/**
	 * The REST route prefix to dispatch internally when the API URL points at
	 * this very site and the namespace is registered here; null otherwise.
	 *
	 * @param string $base API base URL.
	 * @return string|null
	 */
	private static function local_route( $base ) {
		$rest_root = untrailingslashit( rest_url() );
		if ( 0 !== strpos( $base, $rest_root . '/' ) ) {
			return null;
		}
		$route = substr( $base, strlen( $rest_root ) );
		return in_array( ltrim( $route, '/' ), rest_get_server()->get_namespaces(), true ) ? $route : null;
	}

	/**
	 * @param string $route   Full REST route.
	 * @param array  $query   Query arguments.
	 * @param array  $headers Request headers.
	 * @return array|\WP_Error
	 */
	private static function dispatch_local( $route, array $query, array $headers = array() ) {
		$request = new \WP_REST_Request( 'GET', $route );
		$request->set_query_params( $query );
		foreach ( $headers as $name => $value ) {
			$request->set_header( $name, $value );
		}

		$response = rest_do_request( $request );
		$data     = rest_get_server()->response_to_data( $response, false );
		$data     = json_decode( wp_json_encode( $data ), true );

		if ( $response->is_error() ) {
			return self::remote_error( is_array( $data ) ? $data : array(), $response->get_status() );
		}
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Passes the template server's own error on.
	 *
	 * @param array $data   Decoded error body.
	 * @param int   $status HTTP status.
	 * @return \WP_Error
	 */
	private static function remote_error( array $data, $status ) {
		$code    = isset( $data['code'] ) ? sanitize_key( $data['code'] ) : 'shapeblock_tl_error';
		$message = isset( $data['message'] ) ? sanitize_text_field( $data['message'] ) : __( 'The template library could not complete the request.', 'shapeblock' );
		return new \WP_Error( $code, $message, array( 'status' => $status ) );
	}

	/**
	 * @param array|\WP_Error $data Data or error.
	 * @return \WP_REST_Response|\WP_Error
	 */
	private static function respond( $data ) {
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		// Access details are the server's business; the library only shows free items.
		unset( $data['has_pro_access'], $data['upgrade_url'] );
		return rest_ensure_response( $data );
	}

	/**
	 * @param string $value Comma-separated slugs.
	 * @return string[]
	 */
	private static function slug_list( $value ) {
		$slugs = array_values( array_unique( array_filter( array_map( 'sanitize_title', explode( ',', (string) $value ) ) ) ) );
		sort( $slugs );
		return $slugs;
	}

	/* --------------------------------------------------------------------- */
	/* Media import                                                          */
	/* --------------------------------------------------------------------- */

	/**
	 * Copies images hosted on the template server into the Media Library and
	 * points the markup at the copies: URLs everywhere, plus the attachment ID
	 * stored next to each URL (block attributes like {"id":…,"url":…},
	 * mediaId/mediaUrl, and the wp-image-{id} class of core images).
	 * An image already copied before is reused, not downloaded again.
	 *
	 * @param string $content Block markup.
	 * @return array{content:string, imported:int, failed:int}
	 */
	private static function import_media( $content ) {
		$result = array(
			'content'  => $content,
			'imported' => 0,
			'failed'   => 0,
		);

		$host = wp_parse_url( self::api_url(), PHP_URL_HOST );
		if ( ! $host || ! preg_match_all( '#https?://[^\s"\'<>()\\\\]+?\.(?:jpe?g|png|gif|webp|avif)(?=[\s"\'<>()?\\\\]|$)#i', $content, $matches ) ) {
			return $result;
		}

		$urls = array();
		foreach ( array_unique( $matches[0] ) as $url ) {
			if ( strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) ) === strtolower( $host ) ) {
				$urls[] = $url;
			}
		}
		if ( ! $urls ) {
			return $result;
		}

		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$url_map = array(); // old URL => new URL.
		$id_map  = array(); // new URL => new attachment ID.

		foreach ( array_slice( $urls, 0, self::MAX_MEDIA ) as $url ) {
			$attachment_id = self::existing_copy( $url );
			if ( ! $attachment_id ) {
				$attachment_id = media_sideload_image( $url, 0, null, 'id' );
				if ( is_wp_error( $attachment_id ) ) {
					++$result['failed'];
					continue;
				}
				update_post_meta( $attachment_id, self::SOURCE_META, esc_url_raw( $url ) );
				++$result['imported'];
			}

			$new_url = wp_get_attachment_url( $attachment_id );
			if ( $new_url ) {
				$url_map[ $url ]    = $new_url;
				$id_map[ $new_url ] = (int) $attachment_id;
			}
		}

		if ( ! $url_map ) {
			return $result;
		}

		// Longest first, so "photo.jpg" never rewrites part of "photo.jpg.webp".
		uksort(
			$url_map,
			static function ( $a, $b ) {
				return strlen( $b ) - strlen( $a );
			}
		);
		$content = strtr( $content, $url_map );

		if ( function_exists( 'parse_blocks' ) && has_blocks( $content ) ) {
			$blocks  = self::fix_block_ids( parse_blocks( $content ), $id_map );
			$content = serialize_blocks( $blocks );
		}

		$result['content'] = $content;
		return $result;
	}

	/**
	 * @param string $url Template-server image URL.
	 * @return int Attachment ID of an earlier copy, or 0.
	 */
	private static function existing_copy( $url ) {
		$found = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- one indexed meta lookup per image, only while inserting a template.
				'meta_query'     => array(
					array(
						'key'   => self::SOURCE_META,
						'value' => esc_url_raw( $url ),
					),
				),
			)
		);
		return $found ? (int) $found[0] : 0;
	}

	/**
	 * @param array $blocks Parsed blocks.
	 * @param array $id_map New URL => attachment ID.
	 * @return array
	 */
	private static function fix_block_ids( array $blocks, array $id_map ) {
		foreach ( $blocks as &$block ) {
			if ( ! empty( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
				$block['attrs'] = self::fix_attr_ids( $block['attrs'], $id_map );
			}

			// Core image/media blocks keep the URL in the HTML and the ID in
			// attrs.id / attrs.mediaId plus the wp-image-{id} class.
			$html = isset( $block['innerHTML'] ) ? (string) $block['innerHTML'] : '';
			if ( '' !== $html && preg_match( '/wp-image-(\d+)/', $html, $class ) && preg_match( '/<img[^>]+src="([^"]+)"/', $html, $src ) ) {
				$src_url = html_entity_decode( $src[1], ENT_QUOTES, 'UTF-8' );
				if ( isset( $id_map[ $src_url ] ) ) {
					$old = (int) $class[1];
					$new = $id_map[ $src_url ];
					foreach ( array( 'id', 'mediaId' ) as $key ) {
						if ( isset( $block['attrs'][ $key ] ) && (int) $block['attrs'][ $key ] === $old ) {
							$block['attrs'][ $key ] = $new;
						}
					}
					$block['innerHTML'] = str_replace( 'wp-image-' . $old, 'wp-image-' . $new, $html );
					foreach ( $block['innerContent'] as $i => $chunk ) {
						if ( is_string( $chunk ) ) {
							$block['innerContent'][ $i ] = str_replace( 'wp-image-' . $old, 'wp-image-' . $new, $chunk );
						}
					}
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = self::fix_block_ids( $block['innerBlocks'], $id_map );
			}
		}
		unset( $block );
		return $blocks;
	}

	/**
	 * Wherever an attribute array has a copied URL under "url" / "…Url" / "…URL",
	 * the matching "id" / "…Id" / "…ID" key gets the new attachment ID.
	 *
	 * @param array $attrs  Attributes (any depth).
	 * @param array $id_map New URL => attachment ID.
	 * @return array
	 */
	private static function fix_attr_ids( array $attrs, array $id_map ) {
		foreach ( $attrs as $key => $value ) {
			if ( is_array( $value ) ) {
				$attrs[ $key ] = self::fix_attr_ids( $value, $id_map );
				continue;
			}
			if ( ! is_string( $value ) || ! isset( $id_map[ $value ] ) || ! is_string( $key ) || ! preg_match( '/^(.*?)(url|Url|URL)$/', $key, $parts ) ) {
				continue;
			}
			$prefix = $parts[1];
			foreach ( array( $prefix . 'id', $prefix . 'Id', $prefix . 'ID' ) as $id_key ) {
				if ( array_key_exists( $id_key, $attrs ) && ( is_int( $attrs[ $id_key ] ) || is_numeric( $attrs[ $id_key ] ) || '' === $attrs[ $id_key ] ) ) {
					$attrs[ $id_key ] = is_string( $attrs[ $id_key ] ) ? (string) $id_map[ $value ] : $id_map[ $value ];
				}
			}
		}
		return $attrs;
	}
}
