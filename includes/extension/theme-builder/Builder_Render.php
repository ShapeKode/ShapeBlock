<?php
namespace ShapeBlock\Extension\ThemeBuilder;

/**
 * Theme Builder — frontend rendering.
 *
 * Replaces the active (classic) theme's header and footer with the matching
 * builder template. The replacement leans on a WordPress core detail: both
 * get_header() and get_footer() fire their action and then call
 * locate_template( [...], true, $load_once = true ) — i.e. require_once. So if
 * we render our own markup inside the hook and then pre-require the theme's
 * own header.php / footer.php into a discarded buffer, core's subsequent
 * require_once becomes a no-op and the theme part never visibly renders.
 *
 * Resolution is location-agnostic and reads from the template-type registry,
 * so wiring a future type into get_header-like output is a small addition.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Builder_Render {

	/**
	 * Resolved post id per location for the current request. null = not resolved
	 * yet, false = resolved to "nothing matches".
	 *
	 * @var array<string,int|false|null>
	 */
	private $resolved = array();

	/**
	 * Pre-rendered HTML per location. We render in the get_header/get_footer hook
	 * (before wp_head() runs) so block styles enqueue in time for the document
	 * <head>, then the template wrapper just echoes the cached markup.
	 *
	 * @var array<string,string>
	 */
	private $output = array();

	public static function instance() {
		static $instance = null;
		if ( null === $instance ) {
			$instance = new self();
		}
		return $instance;
	}

	public function __construct() {
		// Classic themes: take over get_header() / get_footer().
		add_action( 'get_header', array( $this, 'maybe_override_header' ) );
		add_action( 'get_footer', array( $this, 'maybe_override_footer' ) );

		// Block (FSE) themes: replace the header/footer template-part blocks.
		add_filter( 'pre_render_block', array( $this, 'maybe_replace_template_part' ), 10, 2 );

		add_shortcode( 'shapeblock_builder', array( $this, 'shortcode' ) );
	}

	/**
	 * Block-theme replacement: swap the matching builder template in for the
	 * theme's `core/template-part` header/footer.
	 *
	 * Block themes render header/footer as template parts (area/slug =
	 * header|footer) rather than calling get_header()/get_footer(). Returning a
	 * non-null value from pre_render_block short-circuits the part's render.
	 *
	 * @param string|null $pre   Pre-rendered content, or null to render normally.
	 * @param array       $block Parsed block.
	 * @return string|null
	 */
	public function maybe_replace_template_part( $pre, $block ) {
		// Leave the editor / REST previews showing the real theme parts.
		if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return $pre;
		}

		if ( empty( $block['blockName'] ) || 'core/template-part' !== $block['blockName'] ) {
			return $pre;
		}

		$attrs = isset( $block['attrs'] ) ? $block['attrs'] : array();
		$area  = isset( $attrs['area'] ) ? $attrs['area'] : '';
		$slug  = isset( $attrs['slug'] ) ? $attrs['slug'] : '';

		$type = '';
		if ( 'header' === $area || 'header' === $slug ) {
			$type = 'header';
		} elseif ( 'footer' === $area || 'footer' === $slug ) {
			$type = 'footer';
		}

		if ( ! $type || ! \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::is_valid_type( $type ) ) {
			return $pre;
		}

		$post_id = $this->get_location_post( $type );
		if ( ! $post_id ) {
			return $pre;
		}

		return $this->render_post( $post_id, $type );
	}

	/**
	 * Resolve the best-matching builder post id for a location, cached per request.
	 *
	 * @param string $type Template type slug (e.g. header, footer).
	 * @return int|false
	 */
	public function get_location_post( $type ) {
		if ( array_key_exists( $type, $this->resolved ) && null !== $this->resolved[ $type ] ) {
			return $this->resolved[ $type ];
		}

		$this->resolved[ $type ] = $this->find_matching_post( $type );
		return $this->resolved[ $type ];
	}

	/**
	 * Find the most recently modified published builder post of $type whose
	 * display conditions match the current request.
	 *
	 * @return int|false
	 */
	private function find_matching_post( $type ) {
		if ( ! \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::is_valid_type( $type ) ) {
			return false;
		}

		$query = new \WP_Query(
			array(
				'post_type'      => \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::POST_TYPE,
				'post_status'    => 'publish',
				'posts_per_page' => 100,
				'orderby'        => 'modified',
				'order'          => 'DESC',
				'no_found_rows'  => true,
				'fields'         => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Filtering a small template post type by its type meta to resolve the active template.
				'meta_query'     => array(
					array(
						'key'   => \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::META_TYPE,
						'value' => $type,
					),
				),
			)
		);

		foreach ( $query->posts as $post_id ) {
			$conditions = \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::get_post_conditions( $post_id );
			if ( \ShapeBlock\Extension\ThemeBuilder\Builder_Conditions::matches_current_request( $conditions ) ) {
				return (int) $post_id;
			}
		}

		return false;
	}

	public function maybe_override_header() {
		if ( is_admin() || ! $this->get_location_post( 'header' ) ) {
			return;
		}

		// Render now (before wp_head) so block styles enqueue for the <head>.
		$builder_header = $this->render_location( 'header' );
		$this->output['header'] = $builder_header;

		// Capture the theme's own header.php (require_once, so core's own
		// require_once no-ops it) and swap only its <header> region for the
		// builder header. Keeping the rest of header.php preserves the theme's
		// document opening AND its content wrapper divs (e.g. #page/.main-contain/
		// .container/#content), which only close back in footer.php — discarding
		// the whole file would leave the page body without its layout wrapper.
		ob_start();
		locate_template( array( 'header.php' ), true, true );
		$theme_header = ob_get_clean();

		if ( '' === $theme_header ) {
			// Theme has no header.php (unusual for a classic theme) — fall back
			// to our own complete document opening.
			require SHAPEBLOCK_PL_PATH . 'includes/extension/theme-builder/templates/header.php';
			return;
		}

		echo $this->replace_region( $theme_header, $builder_header, 'header' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Builder header is sanitised/escaped in render_post(); theme header.php is trusted template output.
	}

	public function maybe_override_footer() {
		if ( is_admin() || ! $this->get_location_post( 'footer' ) ) {
			return;
		}

		$builder_footer = $this->render_location( 'footer' );
		$this->output['footer'] = $builder_footer;

		// Mirror the header handling: keep the theme's footer.php (its structural
		// wrapper closes + the single wp_footer() + closing body/html tags) and
		// swap only its <footer> region for the builder footer.
		ob_start();
		locate_template( array( 'footer.php' ), true, true );
		$theme_footer = ob_get_clean();

		if ( '' === $theme_footer ) {
			require SHAPEBLOCK_PL_PATH . 'includes/extension/theme-builder/templates/footer.php';
			return;
		}

		echo $this->replace_region( $theme_footer, $builder_footer, 'footer' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Builder footer is sanitised/escaped in render_post(); theme footer.php is trusted template output.
	}

	/**
	 * Swap the theme template's <header>/<footer> element for the builder markup
	 * while preserving everything else it emitted (document opening, content
	 * wrapper divs, the single wp_head()/wp_footer() output and closing tags).
	 *
	 * substr splicing (not preg_replace replacement) is used so `$`/`\` byte
	 * sequences in the builder markup are inserted verbatim.
	 *
	 * @param string $theme_html Captured output of the theme's header.php/footer.php.
	 * @param string $builder    Rendered builder location HTML.
	 * @param string $tag        Region element to replace: 'header' or 'footer'.
	 * @return string
	 */
	private function replace_region( $theme_html, $builder, $tag ) {
		$quoted = preg_quote( $tag, '#' );
		if ( preg_match( '#<' . $quoted . '\b[^>]*>.*?</' . $quoted . '>#is', $theme_html, $m, PREG_OFFSET_CAPTURE ) ) {
			$start = $m[0][1];
			$len   = strlen( $m[0][0] );
			return substr( $theme_html, 0, $start ) . $builder . substr( $theme_html, $start + $len );
		}

		// No <header>/<footer> element found — inject at a safe balanced point so
		// the theme structure is preserved.
		if ( 'footer' === $tag ) {
			$pos = stripos( $theme_html, '</body>' );
			if ( false !== $pos ) {
				return substr( $theme_html, 0, $pos ) . $builder . substr( $theme_html, $pos );
			}
		} elseif ( preg_match( '#<body\b[^>]*>#i', $theme_html, $bm, PREG_OFFSET_CAPTURE ) ) {
			$at = $bm[0][1] + strlen( $bm[0][0] );
			return substr( $theme_html, 0, $at ) . $builder . substr( $theme_html, $at );
		}

		return $theme_html . $builder;
	}

	/**
	 * Return the pre-rendered HTML for a location (used by the template wrappers).
	 */
	public function get_output( $type ) {
		return isset( $this->output[ $type ] ) ? $this->output[ $type ] : '';
	}

	/**
	 * Render the matching builder template for a location, wrapped for styling.
	 *
	 * @param string $type Template type slug.
	 */
	public function render_location( $type ) {
		$post_id = $this->get_location_post( $type );
		if ( ! $post_id ) {
			return '';
		}

		return $this->render_post( $post_id, $type );
	}

	/**
	 * Render a builder post's stored block content for the frontend.
	 *
	 * @param int    $post_id Builder post id.
	 * @param string $type    Location type, used for the wrapper class/attr.
	 */
	public function render_post( $post_id, $type = '' ) {
		$post = get_post( $post_id );
		if ( ! $post || \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::POST_TYPE !== $post->post_type ) {
			return '';
		}

		$content = $post->post_content;
		$content = do_blocks( $content );
		// Core's Shortcode block runs its content through wpautop(), which leaves a
		// shortcode wrapped in <p>. On the_content, shortcode_unautop() strips that
		// wrapper before do_shortcode() runs; mirror that order here, otherwise a
		// shortcode returning a block-level element produces <p><div>…</div></p>
		// and the browser repairs it into stray empty paragraphs.
		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );

		$type = $type ? $type : \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::get_post_type_slug( $post_id );

		$wrapper_class = 'shapeblock-builder-location shapeblock-builder-' . sanitize_html_class( $type );

		return sprintf(
			'<div class="%1$s" data-shapeblock-builder-type="%2$s" data-shapeblock-builder-id="%3$d">%4$s</div>',
			esc_attr( $wrapper_class ),
			esc_attr( $type ),
			(int) $post_id,
			$content
		);
	}

	/**
	 * [shapeblock_builder id="123"] — render a builder template anywhere.
	 */
	public function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'id' => 0 ), $atts, 'shapeblock_builder' );
		$id   = (int) $atts['id'];
		if ( ! $id ) {
			return '';
		}
		return $this->render_post( $id );
	}
}
