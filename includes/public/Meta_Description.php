<?php
/**
 * A default meta description for every page, until an SEO plugin takes over.
 *
 * WordPress itself prints no meta description, so a new site has none and
 * search results and audits (Lighthouse "Document does not have a meta
 * description") show that. ShapeBlock prints one made from what the page
 * already has:
 *  - a post or page: its excerpt, or the start of its text (ShapeBlock
 *    Heading and Paragraph blocks included),
 *  - the front page: the site tagline, then the start of the page's text,
 *  - a category, tag or other term: its description, else its name and the site name,
 *  - an author: the author's bio.
 * Pages get the Excerpt box, so a page's description can be written by hand.
 *
 * Nothing is added when the theme or another plugin already prints a
 * description in the head. As soon as an SEO plugin (Yoast SEO, Rank Math, All in One SEO, SEOPress,
 * The SEO Framework, Slim SEO, Squirrly, SmartCrawl) is active, ShapeBlock
 * prints nothing and the SEO plugin's description is used.
 *
 * Filters: shapeblock_meta_description (the text; '' turns it off for a page),
 * shapeblock_seo_plugin_active (bool).
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Meta_Description {

	/** Longest description printed, in characters. */
	const MAX = 160;

	/**
	 * @var Meta_Description|null
	 */
	private static $instance = null;

	/**
	 * @return Meta_Description
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'page_excerpts' ) );
		// The head is held back while it is printed, so a description from the theme
		// or another plugin is seen and no second one is added.
		add_action( 'wp_head', array( $this, 'start_head' ), 0 );
		add_action( 'wp_head', array( $this, 'end_head' ), PHP_INT_MAX );
	}

	/**
	 * Pages get the Excerpt box: their description can be written by hand.
	 */
	public function page_excerpts() {
		add_post_type_support( 'page', 'excerpt' );
	}

	/**
	 * @return bool An SEO plugin that prints its own description is active.
	 */
	public static function seo_plugin_active() {
		$active = defined( 'WPSEO_VERSION' )              // Yoast SEO.
			|| defined( 'RANK_MATH_VERSION' )             // Rank Math.
			|| defined( 'AIOSEO_VERSION' )                // All in One SEO.
			|| defined( 'SEOPRESS_VERSION' )              // SEOPress.
			|| defined( 'THE_SEO_FRAMEWORK_VERSION' )     // The SEO Framework.
			|| defined( 'SLIM_SEO_VER' )                  // Slim SEO.
			|| defined( 'SQ_VERSION' )                    // Squirrly SEO.
			|| defined( 'WDS_VERSION' );                  // SmartCrawl.

		/**
		 * Whether an SEO plugin handles the meta description, so ShapeBlock prints none.
		 *
		 * @param bool $active Detected.
		 */
		return (bool) apply_filters( 'shapeblock_seo_plugin_active', $active );
	}

	/** @var bool Head output is being held back. */
	private $buffering = false;

	/** @var string The tag to add when the head has no description. */
	private $tag = '';

	public function start_head() {
		if ( is_feed() || is_robots() || is_404() || self::seo_plugin_active() ) {
			return;
		}
		$this->buffering = ob_start( array( $this, 'add_tag' ) );
	}

	public function end_head() {
		if ( ! $this->buffering ) {
			return;
		}
		$this->buffering = false;
		// Worked out here: building it may render blocks, which an output handler must not do.
		$this->tag = self::tag();
		ob_end_flush();
	}

	/**
	 * Output handler for the head: the description goes first, unless the
	 * head already has one.
	 *
	 * @param string $head Head HTML printed by WordPress, the theme and plugins.
	 * @return string
	 */
	public function add_tag( $head ) {
		if ( '' === $this->tag || preg_match( '/<meta\s[^>]*name=["\']description["\']/i', $head ) ) {
			return $head;
		}
		return $this->tag . $head;
	}

	/**
	 * @return string The meta tag, or '' when there is no description.
	 */
	private static function tag() {
		/**
		 * The page's meta description. Return '' to print none.
		 *
		 * @param string $description Description made by ShapeBlock.
		 */
		$description = self::clean( (string) apply_filters( 'shapeblock_meta_description', self::description() ) );
		return '' === $description ? '' : '<meta name="description" content="' . esc_attr( $description ) . '" />' . "\n";
	}

	/**
	 * @return string Description for the current page, shortened.
	 */
	public static function description() {
		$tagline = self::clean( get_bloginfo( 'description', 'display' ) );

		if ( is_front_page() && is_home() ) {
			return self::shorten( '' !== $tagline ? $tagline : get_bloginfo( 'name', 'display' ) );
		}

		if ( is_singular() || ( is_home() && get_option( 'page_for_posts' ) ) ) {
			$post = is_home() ? get_post( (int) get_option( 'page_for_posts' ) ) : get_queried_object();
			if ( ! $post instanceof \WP_Post || post_password_required( $post ) ) {
				return '';
			}
			if ( has_excerpt( $post ) ) {
				return self::shorten( $post->post_excerpt );
			}
			$text = self::content_text( $post );
			if ( is_front_page() && '' !== $tagline ) {
				$text = rtrim( $tagline, '.' ) . '. ' . $text;
			}
			return self::shorten( $text );
		}

		if ( is_category() || is_tag() || is_tax() ) {
			$term = get_queried_object();
			if ( ! $term instanceof \WP_Term ) {
				return '';
			}
			$text = self::clean( term_description( $term ) );
			if ( '' === $text ) {
				/* translators: 1: category or tag name, 2: site name. */
				$text = sprintf( __( '%1$s articles from %2$s.', 'shapeblock' ), $term->name, get_bloginfo( 'name', 'display' ) );
			}
			return self::shorten( $text );
		}

		if ( is_author() ) {
			return self::shorten( get_the_author_meta( 'description', (int) get_queried_object_id() ) );
		}

		return '';
	}

	/**
	 * The start of a post's text, the way WordPress builds an automatic excerpt.
	 *
	 * @param \WP_Post $post Post.
	 * @return string
	 */
	private static function content_text( $post ) {
		$content = strip_shortcodes( $post->post_content );
		if ( function_exists( 'excerpt_remove_blocks' ) ) {
			$content = excerpt_remove_blocks( $content );
		}
		// One line per paragraph, heading or box, so labels and short headings
		// are not run together; the first real sentence describes the page best.
		$content = preg_replace( '#</(p|h[1-6]|div|li|figcaption|blockquote|td|th)>|<br\s*/?>#i', "\n", $content );
		$lines   = array_values( array_filter( array_map( array( __CLASS__, 'clean' ), explode( "\n", wp_strip_all_tags( $content ) ) ) ) );
		foreach ( $lines as $line ) {
			if ( str_word_count( $line ) >= 8 && preg_match( '/[.!?]$/u', $line ) ) {
				return $line;
			}
		}
		foreach ( $lines as $line ) {
			if ( str_word_count( $line ) >= 8 ) {
				return $line;
			}
		}
		return self::clean( wp_trim_words( implode( ' ', $lines ), 30, '' ) );
	}

	/**
	 * @param string $text Text or HTML.
	 * @return string Plain text on one line.
	 */
	private static function clean( $text ) {
		$text = html_entity_decode( wp_strip_all_tags( (string) $text, true ), ENT_QUOTES, get_bloginfo( 'charset' ) );
		return trim( preg_replace( '/\s+/u', ' ', $text ) );
	}

	/**
	 * @param string $text Text.
	 * @return string At most MAX characters, cut at a word.
	 */
	private static function shorten( $text ) {
		$text = self::clean( $text );
		if ( function_exists( 'mb_strlen' ) ? mb_strlen( $text ) <= self::MAX : strlen( $text ) <= self::MAX ) {
			return $text;
		}
		$cut   = function_exists( 'mb_substr' ) ? mb_substr( $text, 0, self::MAX - 1 ) : substr( $text, 0, self::MAX - 1 );
		$space = strrpos( $cut, ' ' );
		return rtrim( false !== $space ? substr( $cut, 0, $space ) : $cut, " ,.;:-–" ) . '…';
	}
}
