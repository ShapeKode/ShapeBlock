<?php
/**
 * "ShapeBlock Full Width" page template (classic themes).
 *
 * Shows the site header and footer (the Theme Builder ones when set) around
 * the page content at full width — no theme title, sidebar or boxed
 * container. Pages imported from ShapeBlock → Templates use it, so a demo
 * looks the way it was designed whatever classic theme is active. Block
 * themes are left alone: their pages use the theme's own block templates.
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Extension\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Page_Template {

	/** Value stored in _wp_page_template. */
	const SLUG = 'shapeblock-full-width.php';

	public static function instance() {
		static $instance = null;
		if ( null === $instance ) {
			$instance = new self();
		}
		return $instance;
	}

	public function __construct() {
		add_filter( 'theme_page_templates', array( $this, 'add_template' ) );
		add_filter( 'template_include', array( $this, 'load_template' ), 99 );
	}

	/**
	 * @return bool Whether the template can be used with the active theme.
	 */
	public static function available() {
		return ! ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() );
	}

	/**
	 * @param array<string,string> $templates Page templates.
	 * @return array<string,string>
	 */
	public function add_template( $templates ) {
		if ( self::available() ) {
			$templates[ self::SLUG ] = __( 'ShapeBlock Full Width', 'shapeblock' );
		}
		return $templates;
	}

	/**
	 * @param string $template Template file WordPress picked.
	 * @return string
	 */
	public function load_template( $template ) {
		if ( self::available() && is_singular( 'page' ) && self::SLUG === get_page_template_slug() ) {
			return SHAPEBLOCK_PL_PATH . 'includes/extension/theme-builder/templates/full-width.php';
		}
		return $template;
	}
}
