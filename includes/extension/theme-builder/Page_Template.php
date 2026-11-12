<?php
/**
 * Page layouts and the page title switch.
 *
 * Two page templates, offered in the editor's Template setting and in the
 * "ShapeBlock Page" panel of the page sidebar:
 *   - ShapeBlock Full Width: the site header and footer (the Theme Builder
 *     ones when set) around the page content at full width - no sidebar or
 *     boxed container;
 *   - ShapeBlock Canvas: the page content alone, without header or footer.
 * Classic themes get them as PHP page templates; block themes as block
 * templates (WordPress 6.7 and newer).
 *
 * The page title shows by default; "Show Page Title" in the same panel hides
 * it, whatever template the page uses. Pages imported from ShapeBlock →
 * Templates use Full Width with the title hidden, so a demo looks the way it
 * was designed whatever theme is active.
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Extension\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Page_Template {

	/** Value stored in _wp_page_template for Full Width, classic themes. */
	const SLUG = 'shapeblock-full-width.php';

	/** Value stored in _wp_page_template for Canvas, classic themes. */
	const CANVAS = 'shapeblock-canvas.php';

	/** Block template slugs (block themes). */
	const BLOCK_FULL   = 'shapeblock-full-width';
	const BLOCK_CANVAS = 'shapeblock-canvas';

	/** Post meta: true hides the page title. */
	const META_HIDE_TITLE = '_shapeblock_hide_title';

	public static function instance() {
		static $instance = null;
		if ( null === $instance ) {
			$instance = new self();
		}
		return $instance;
	}

	public function __construct() {
		add_filter( 'theme_page_templates', array( $this, 'add_templates' ) );
		add_filter( 'template_include', array( $this, 'load_template' ), 99 );
		add_action( 'init', array( $this, 'register' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_front' ) );
		add_filter( 'body_class', array( $this, 'body_class' ) );
		add_filter( 'render_block_core/post-title', array( $this, 'hide_block_title' ), 10, 3 );
	}

	/**
	 * Whether the PHP page templates are used: the active theme is a classic one.
	 *
	 * @return bool
	 */
	public static function available() {
		return ! self::is_block_theme();
	}

	/**
	 * @return bool
	 */
	private static function is_block_theme() {
		return function_exists( 'wp_is_block_theme' ) && wp_is_block_theme();
	}

	/**
	 * The value of each layout for the active theme, '' where it is not
	 * available (a block theme before WordPress 6.7).
	 *
	 * @return array{full:string,canvas:string}
	 */
	public static function slugs() {
		if ( ! self::is_block_theme() ) {
			return array(
				'full'   => self::SLUG,
				'canvas' => self::CANVAS,
			);
		}
		$blocks = function_exists( 'register_block_template' );
		return array(
			'full'   => $blocks ? self::BLOCK_FULL : '',
			'canvas' => $blocks ? self::BLOCK_CANVAS : '',
		);
	}

	/**
	 * The post meta that hides a page's title on this site: the theme's own
	 * when the theme has a title switch (Blockode), so there is one switch
	 * only; else ShapeBlock's.
	 *
	 * @return string
	 */
	public static function title_meta() {
		return defined( 'BLOCKODE_HIDE_TITLE_META' ) ? (string) BLOCKODE_HIDE_TITLE_META : self::META_HIDE_TITLE;
	}

	/**
	 * Whether the theme brings its own title switch (it then does the hiding).
	 *
	 * @return bool
	 */
	public static function theme_has_title_switch() {
		return self::META_HIDE_TITLE !== self::title_meta();
	}

	/**
	 * Whether a page's title is switched off.
	 *
	 * @param int $post_id Post ID.
	 * @return bool
	 */
	public static function title_hidden( $post_id ) {
		return (bool) get_post_meta( (int) $post_id, self::title_meta(), true );
	}

	/**
	 * The title switch as post meta the editor can save, and the block
	 * templates for block themes.
	 *
	 * @return void
	 */
	public function register() {
		if ( ! self::theme_has_title_switch() ) {
			$this->register_title_meta();
		}
		$this->register_block_templates();
	}

	/**
	 * @return void
	 */
	private function register_title_meta() {
		register_post_meta(
			'page',
			self::META_HIDE_TITLE,
			array(
				'type'              => 'boolean',
				'single'            => true,
				'default'           => false,
				'show_in_rest'      => true,
				'sanitize_callback' => 'rest_sanitize_boolean',
				'auth_callback'     => static function ( $allowed, $meta_key, $post_id ) {
					return current_user_can( 'edit_post', $post_id );
				},
			)
		);
	}

	/**
	 * @return void
	 */
	private function register_block_templates() {
		if ( ! self::is_block_theme() || ! function_exists( 'register_block_template' ) ) {
			return;
		}
		$title = '<!-- wp:group {"layout":{"type":"constrained"},"className":"shapeblock-page-title-wrap"} --><div class="wp-block-group shapeblock-page-title-wrap"><!-- wp:post-title {"level":1} /--></div><!-- /wp:group -->';
		$main  = '<!-- wp:group {"tagName":"main","align":"full","className":"shapeblock-page-main","layout":{"type":"default"}} --><main class="wp-block-group alignfull shapeblock-page-main">' . $title . '<!-- wp:post-content {"align":"full","layout":{"type":"default"}} /--></main><!-- /wp:group -->';
		register_block_template(
			'shapeblock//' . self::BLOCK_FULL,
			array(
				'title'       => __( 'ShapeBlock Full Width', 'shapeblock' ),
				'description' => __( 'The site header and footer, with the page content at full width.', 'shapeblock' ),
				'post_types'  => array( 'page' ),
				'content'     => '<!-- wp:template-part {"slug":"header","area":"header","tagName":"header"} /-->' . $main . '<!-- wp:template-part {"slug":"footer","area":"footer","tagName":"footer"} /-->',
			)
		);
		register_block_template(
			'shapeblock//' . self::BLOCK_CANVAS,
			array(
				'title'       => __( 'ShapeBlock Canvas', 'shapeblock' ),
				'description' => __( 'The page content alone, without the site header and footer.', 'shapeblock' ),
				'post_types'  => array( 'page' ),
				'content'     => $main,
			)
		);
	}

	/**
	 * @param array<string,string> $templates Page templates.
	 * @return array<string,string>
	 */
	public function add_templates( $templates ) {
		if ( self::available() ) {
			$templates[ self::SLUG ]   = __( 'ShapeBlock Full Width', 'shapeblock' );
			$templates[ self::CANVAS ] = __( 'ShapeBlock Canvas', 'shapeblock' );
		}
		return $templates;
	}

	/**
	 * @param string $template Template file WordPress picked.
	 * @return string
	 */
	public function load_template( $template ) {
		if ( ! self::available() || ! is_singular( 'page' ) ) {
			return $template;
		}
		$files = array(
			self::SLUG   => 'full-width.php',
			self::CANVAS => 'canvas.php',
		);
		$slug  = get_page_template_slug();
		if ( isset( $files[ $slug ] ) ) {
			return SHAPEBLOCK_PL_PATH . 'includes/extension/theme-builder/templates/' . $files[ $slug ];
		}
		return $template;
	}

	/**
	 * The "ShapeBlock Page" panel in the page sidebar: layout and title.
	 *
	 * @return void
	 */
	public function enqueue_editor() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || 'page' !== $screen->post_type ) {
			return;
		}
		$js = 'includes/public/assets/js/page-settings.js';
		wp_enqueue_script(
			'shapeblock-page-settings',
			SHAPEBLOCK_PL_URL . $js,
			array( 'wp-components', 'wp-data', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-plugins' ),
			shapeblock_asset_version( SHAPEBLOCK_PL_PATH . $js ),
			true
		);
		wp_set_script_translations( 'shapeblock-page-settings', 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );
		wp_add_inline_script(
			'shapeblock-page-settings',
			'window.shapeblockPageSettings = ' . wp_json_encode(
				array(
					// Empty when the theme has its own title switch: the panel then has layout only.
					'meta'  => self::theme_has_title_switch() ? '' : self::META_HIDE_TITLE,
					'slugs' => self::slugs(),
				)
			) . ';',
			'before'
		);
	}

	/**
	 * Front end: the layout of the two templates, and the title hidden on a
	 * classic theme's own templates.
	 *
	 * @return void
	 */
	public function enqueue_front() {
		if ( ! is_singular( 'page' ) ) {
			return;
		}
		$slug = get_page_template_slug();
		$css  = '';
		if ( self::available() && in_array( $slug, array( self::SLUG, self::CANVAS ), true ) ) {
			// Many classic themes wrap the content in a boxed container
			// (Astra's .ast-container, for one): it breaks out to the full width.
			$css .= 'html,body{overflow-x:clip}main.shapeblock-full-width{position:relative;width:100vw;max-width:100vw;margin:0 calc(50% - 50vw);padding:0;flex:0 0 100vw}main.shapeblock-full-width>*{margin-block-start:0}';
		}
		if ( in_array( $slug, array( self::SLUG, self::CANVAS, self::BLOCK_FULL, self::BLOCK_CANVAS ), true ) ) {
			$css .= '.shapeblock-page-title-wrap{max-width:var(--wp--style--global--content-size,1140px);margin:0 auto;padding:48px 24px 24px;box-sizing:border-box}.shapeblock-page-title-wrap:not(:has(h1)){display:none}.shapeblock-page-title-wrap h1{margin:0}.shapeblock-page-main>.wp-block-post-content{margin-block-start:0}';
		}
		if ( ! self::theme_has_title_switch() && self::title_hidden( get_queried_object_id() ) ) {
			// Classic themes print the title themselves.
			$css .= '.shapeblock-hide-title .entry-header .entry-title,.shapeblock-hide-title h1.entry-title,.shapeblock-hide-title .page-header .page-title{display:none}';
		}
		if ( '' === $css ) {
			return;
		}
		wp_register_style( 'shapeblock-page', false, array(), SHAPEBLOCK_VERSION );
		wp_add_inline_style( 'shapeblock-page', $css );
		wp_enqueue_style( 'shapeblock-page' );
	}

	/**
	 * @param string[] $classes Body classes.
	 * @return string[]
	 */
	public function body_class( $classes ) {
		if ( is_singular( 'page' ) && ! self::theme_has_title_switch() && self::title_hidden( get_queried_object_id() ) ) {
			$classes[] = 'shapeblock-hide-title';
		}
		return $classes;
	}

	/**
	 * Block themes: the Post Title block of the page being viewed prints
	 * nothing when its title is switched off.
	 *
	 * @param string    $content Rendered block.
	 * @param array     $block   Parsed block.
	 * @param \WP_Block $instance Block instance.
	 * @return string
	 */
	public function hide_block_title( $content, $block, $instance = null ) {
		if ( ! is_singular( 'page' ) || self::theme_has_title_switch() ) {
			return $content;
		}
		$post_id = $instance instanceof \WP_Block && isset( $instance->context['postId'] ) ? (int) $instance->context['postId'] : 0;
		if ( $post_id && get_queried_object_id() === $post_id && self::title_hidden( $post_id ) ) {
			return '';
		}
		return $content;
	}
}
