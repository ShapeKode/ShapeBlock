<?php
namespace ShapeBlock\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Helper {

	public static function add_responsive_vars ($attributes, &$target_array, $attr_base, $prop_name, $properties = [], $is_object = false) {
   		$devices = ['' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile'];
    
    	foreach ($devices as $d_suffix => $device) {
			$attr_name = $attr_base . $d_suffix;
			$val = isset($attributes[$attr_name]) && $attributes[$attr_name] !== '' ? $attributes[$attr_name] : null;
			
			if ($is_object && is_array($val)) {
				foreach ($properties as $prop_key => $css_prop) {
					if ( isset( $val[$prop_key] ) && $val[$prop_key] !== '' ) {
						$v = $val[$prop_key];
						if ( in_array( $prop_key, ['top', 'right', 'bottom', 'left', 'fontSize', 'letterSpacing', 'itemGap'] ) ) {
							$v = self::ensure_unit($v);
						}
						$target_array[$device][$css_prop] = $v;
					}
				}
			} elseif ( ! $is_object && ! empty( $val ) ) {
				$v = $val;
				// A bare number is only valid CSS for a handful of properties.
				// Everywhere else it has to carry a unit or the browser throws the
				// whole declaration away — which is what silently dropped gaps,
				// min-heights and max-widths that were stored without one.
				if ( is_numeric( $v ) && ! in_array( $prop_name, self::unitless_props(), true ) ) {
					$v = self::ensure_unit( $v );
				}
				$target_array[$device][$prop_name] = $v;
			}
		}
	}

	/**
	 * CSS properties that take a plain number, so ensure_unit() must leave them
	 * alone.
	 *
	 * @return string[]
	 */
	public static function unitless_props() {
		return [
			'z-index',
			'opacity',
			'line-height',
			'flex-grow',
			'flex-shrink',
			'order',
			'font-weight',
			'zoom',
			'--bp-cols',
		];
	}

	/**
	 * Length units a stored value is allowed to carry.
	 *
	 * @return string[]
	 */
	public static function allowed_units() {
		return [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'pt', 'pc', 'cm', 'mm', 'in', 'fr', 'deg', 'ms', 's' ];
	}

	/**
	 * Keywords a length control may legitimately store instead of a number.
	 *
	 * @return string[]
	 */
	public static function allowed_length_keywords() {
		return [ 'auto', 'none', 'inherit', 'initial', 'revert', 'unset', 'fit-content', 'max-content', 'min-content' ];
	}

	/**
	 * Normalise a stored length.
	 *
	 * A bare number gains "px". Anything else has to *prove* it is a length —
	 * a number with a known unit, a CSS-wide keyword, or one of the functional
	 * forms a control can produce — otherwise it is rejected. Without that an
	 * attribute could carry arbitrary declarations straight into the stylesheet.
	 *
	 * @param mixed $value Stored value.
	 * @return string
	 */
	public static function ensure_unit ($value) {
		if ( $value === '' || $value === null ) return '0px';
		if ( is_numeric( $value ) && $value != 0 ) return $value . 'px';

		if ( is_array( $value ) || is_object( $value ) || is_bool( $value ) ) return '0px';

		$value = trim( (string) $value );
		if ( '' === $value ) return '0px';

		$units = implode( '|', array_map( 'preg_quote', self::allowed_units() ) );
		if ( preg_match( '/^-?(?:\d+\.?\d*|\.\d+)(?:' . $units . ')?$/i', $value ) ) {
			return $value;
		}
		if ( in_array( strtolower( $value ), self::allowed_length_keywords(), true ) ) {
			return $value;
		}
		// calc() / clamp() / var() and friends, but only once the generic value
		// allowlist below has confirmed they contain nothing but safe characters.
		if ( preg_match( '/^(?:calc|clamp|min|max|var|env)\(/i', $value ) && '' !== self::sanitize_css_value( $value ) ) {
			return $value;
		}

		return '0px';
	}

	/**
	 * Validate a CSS property name.
	 *
	 * @param mixed $prop Property name.
	 * @return string Empty string when the name is not a property.
	 */
	public static function sanitize_css_property( $prop ) {
		if ( ! is_string( $prop ) && ! is_numeric( $prop ) ) {
			return '';
		}
		$prop = trim( (string) $prop );
		if ( preg_match( '/^--[A-Za-z0-9_-]+$/', $prop ) ) {
			return $prop;
		}
		if ( preg_match( '/^-?[A-Za-z]+(?:-[A-Za-z0-9]+)*$/', $prop ) ) {
			return $prop;
		}
		return '';
	}

	/**
	 * Validate a CSS declaration value.
	 *
	 * Block attributes are stored as free text, so a value can carry anything a
	 * user (or an imported template) put there. A value that could terminate the
	 * declaration, the rule or the <style> element, open a comment, or invoke a
	 * script URL is rejected outright rather than escaped — there is no escaping
	 * that makes arbitrary text safe inside a stylesheet.
	 *
	 * @param mixed $value Stored value.
	 * @return string Empty string when the value is not usable.
	 */
	public static function sanitize_css_value( $value ) {
		if ( is_array( $value ) || is_object( $value ) || is_bool( $value ) || null === $value ) {
			return '';
		}

		$value = wp_strip_all_tags( (string) $value );
		$value = str_replace( [ "\r", "\n", "\t", "\0" ], ' ', $value );
		$value = trim( preg_replace( '/\s+/', ' ', $value ) );

		if ( '' === $value ) {
			return '';
		}

		// Anything that could end the declaration / rule / element, or start a
		// CSS comment or at-rule.
		if ( preg_match( '#[{}<>;@\\\\]#', $value ) || false !== strpos( $value, '/*' ) || false !== strpos( $value, '*/' ) ) {
			return '';
		}

		// Script execution vectors.
		if ( preg_match( '/(?:expression|behaviou?r|javascript\s*:|vbscript\s*:|-moz-binding)/i', $value ) ) {
			return '';
		}

		// url() may only reference an http(s), protocol-relative or data:image source.
		if ( false !== stripos( $value, 'url(' ) && ! preg_match( '#url\(\s*[\'"]?(?:(?:https?:)?//|data:image/)#i', $value ) ) {
			return '';
		}

		// Final allowlist of characters a generated value can legitimately need.
		if ( preg_match( '#[^A-Za-z0-9 _.,:%\#()\'"/!+*=?&~\^\[\]-]#', $value ) ) {
			return '';
		}

		return $value;
	}

	/**
	 * Strip anything from a selector that could close the rule it opens. The
	 * selector carries the block's own id, which comes from a saved attribute.
	 *
	 * @param mixed $selector Selector text.
	 * @return string
	 */
	public static function sanitize_css_selector( $selector ) {
		if ( ! is_string( $selector ) && ! is_numeric( $selector ) ) {
			return '';
		}
		$selector = preg_replace( '#/\*.*?\*/#s', '', (string) $selector );
		$selector = str_replace( [ '{', '}', ';', '<', '@', '\\', "\0" ], '', $selector );
		$selector = preg_replace( '/\s+/', ' ', $selector );
		return trim( $selector );
	}

	/**
	 * Validate a whole "prop:value;prop:value" string, dropping every
	 * declaration that does not survive validation.
	 *
	 * @param mixed $declarations Declaration list.
	 * @return string
	 */
	public static function sanitize_css_declarations( $declarations ) {
		if ( ! is_string( $declarations ) && ! is_numeric( $declarations ) ) {
			return '';
		}

		$clean = [];
		foreach ( explode( ';', (string) $declarations ) as $declaration ) {
			if ( '' === trim( $declaration ) ) {
				continue;
			}
			$parts = explode( ':', $declaration, 2 );
			if ( count( $parts ) < 2 ) {
				continue;
			}
			$prop  = self::sanitize_css_property( $parts[0] );
			$value = self::sanitize_css_value( $parts[1] );
			if ( '' === $prop || '' === $value ) {
				continue;
			}
			$clean[] = $prop . ':' . $value;
		}

		return implode( ';', $clean );
	}

	public static function get_inline_styles ($style_map) {
		$styles = [];
		if ( ! is_array( $style_map ) ) {
			return '';
		}
		foreach ( $style_map as $prop => $value ) {
			$prop  = self::sanitize_css_property( $prop );
			$value = self::sanitize_css_value( $value );
			if ( '' === $prop || '' === $value ) {
				continue;
			}
			$styles[] = $prop . ':' . $value;
		}
		return implode( ';', $styles );
	}

	public static function generate_responsive_css($selector, $responsive_data) {
		$css = "";
		$breakpoints = [
			'desktop' => '',
			'tablet'  => '@media (max-width: 1024px)',
			'mobile'  => '@media (max-width: 767px)'
		];

		$selector = self::sanitize_css_selector( $selector );
		if ( '' === $selector || ! is_array( $responsive_data ) ) {
			return $css;
		}

		foreach ($breakpoints as $device => $media) {
			if (!empty($responsive_data[$device]) && is_array( $responsive_data[$device] ) ) {
				$decls = "";
				foreach ($responsive_data[$device] as $prop => $val) {
					$prop = self::sanitize_css_property( $prop );
					$val  = self::sanitize_css_value( $val );
					if ( '' === $prop || '' === $val ) {
						continue;
					}
					$decls .= $prop . ":" . $val . ";";
				}
				if ( '' === $decls ) {
					continue;
				}
				if ($media) {
					$css .= $media . " { " . $selector . " { " . $decls . " } }\n";
				} else {
					$css .= $selector . " { " . $decls . " }\n";
				}
			}
		}
		return $css;
	}

	public static function add_custom_style( $handle, $selector, $responsive_css = "", $sub_styles = [] ) {
		// Desktop rules first, media queries after. A media query adds no
		// specificity, so whichever rule comes last wins — emitting the
		// responsive CSS first let every desktop value override its own
		// tablet/mobile override, which silently disabled per-device settings
		// wherever a desktop value was also set.
		$css = "";

		$selector = self::sanitize_css_selector( $selector );

		if ( is_array( $sub_styles ) && '' !== $selector ) {
			foreach ( $sub_styles as $sub_sel => $style ) {
				$sub_sel = self::sanitize_css_selector( $sub_sel );
				$style   = self::sanitize_css_declarations( $style );
				if ( '' === $sub_sel || '' === $style ) {
					continue;
				}
				$css .= $selector . " " . $sub_sel . " { " . $style . "; }\n";
			}
		}

		$css .= (string) $responsive_css;

		self::add_css( $handle, $css );
	}

	/**
	 * Route a finished stylesheet fragment to the page without ever printing a
	 * hand-built <style> tag.
	 *
	 * Three cases, because a block's render.php can run at three very different
	 * points in the request:
	 *
	 * 1. Block themes render the template before wp_head(), and any block that
	 *    renders early on a classic theme is in the same position, so the CSS
	 *    can simply be attached to the block's own (still pending) style handle.
	 * 2. Classic themes render blocks inside the_content(), long after wp_head()
	 *    printed. wp_add_inline_style() would queue CSS onto a handle that has
	 *    already been output, so core's wp_enqueue_block_support_styles() is used
	 *    instead — the same mechanism core uses for its own block support styles.
	 * 3. The editor renders blocks over REST (ServerSideRender). Neither wp_head
	 *    nor wp_footer runs there, so no enqueue can reach the response: the CSS
	 *    has to travel with the block's own markup. It is returned through the
	 *    render_block filter (see inject_pending_css) rather than echoed.
	 *
	 * @param string $handle Style handle the block registered.
	 * @param string $css    Generated CSS.
	 * @return void
	 */
	public static function add_css( $handle, $css ) {
		// Nothing generated from a block attribute may contain markup. Values are
		// already validated one by one; this is the last line of defence for the
		// assembled sheet, so no tag can ever be opened or closed inside it.
		$css = wp_strip_all_tags( (string) $css );

		if ( '' === trim( $css ) ) {
			return;
		}

		if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || did_action( 'wp_footer' ) ) {
			self::queue_pending_css( $css );
			return;
		}

		if ( did_action( 'wp_head' ) ) {
			wp_enqueue_block_support_styles( $css );
			return;
		}

		wp_add_inline_style( $handle, $css );
	}

	/**
	 * CSS waiting to be handed back with the block that produced it.
	 *
	 * @var string[]
	 */
	private static $pending_css = [];

	/**
	 * Hold CSS until the block it belongs to returns its markup.
	 *
	 * @param string $css Generated CSS.
	 * @return void
	 */
	private static function queue_pending_css( $css ) {
		if ( empty( self::$pending_css ) ) {
			add_filter( 'render_block', [ __CLASS__, 'inject_pending_css' ], 5, 1 );
		}
		self::$pending_css[] = $css;
	}

	/**
	 * Prepend any CSS the block just generated to its own markup.
	 *
	 * The style element is built here and returned — never echoed — and its
	 * content cannot escape it: a <style> element is raw text, so the only
	 * sequence that can end it early is "</style", and wp_strip_all_tags() has
	 * already removed every "<" from the sheet.
	 *
	 * @param string $content Block markup.
	 * @return string
	 */
	public static function inject_pending_css( $content ) {
		if ( empty( self::$pending_css ) ) {
			return $content;
		}

		$css                = implode( '', self::$pending_css );
		self::$pending_css  = [];
		$css                = str_ireplace( [ '</style', '<!--', '-->' ], '', $css );

		return '<style>' . $css . '</style>' . $content;
	}

	/**
	 * Validate a stored colour. Hex, rgb/rgba, hsl/hsla, var() and the CSS
	 * colour keywords are kept; anything else falls back to $fallback so one
	 * bad value cannot take a whole composite declaration with it.
	 *
	 * @param mixed  $color    Stored colour.
	 * @param string $fallback Value to use when the colour is not valid.
	 * @return string
	 */
	public static function sanitize_css_color( $color, $fallback = 'rgba(0,0,0,0)' ) {
		if ( ! is_string( $color ) ) {
			return $fallback;
		}
		$color = trim( $color );
		if ( '' === $color ) {
			return $fallback;
		}
		if ( preg_match( '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^(?:rgb|rgba|hsl|hsla)\(\s*[0-9a-z.,%\/\s-]+\s*\)$/i', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^var\(\s*--[A-Za-z0-9_-]+\s*(?:,[^();{}<>@\\\\]*)?\)$/', $color ) ) {
			return $color;
		}
		if ( preg_match( '/^[a-z]+$/i', $color ) ) {
			return $color;
		}
		return $fallback;
	}

	public static function box_shadow_to_css($shadow) {
		if ( ! is_array( $shadow ) ) {
			return '';
		}
		$x = self::ensure_unit($shadow['x'] ?? 0);
		$y = self::ensure_unit($shadow['y'] ?? 0);
		$b = self::ensure_unit($shadow['b'] ?? 0);
		$s = self::ensure_unit($shadow['s'] ?? 0);
		$c = self::sanitize_css_color( $shadow['c'] ?? 'rgba(0,0,0,0)' );
		// Absent or false keeps the outer shadow every saved block already has.
		$inset = empty($shadow['inset']) ? '' : 'inset ';
		return "$inset$x $y $b $s $c";
	}

	public static function border_to_css_props($border) {
		if ( ! is_array( $border ) ) {
			return [];
		}
		$style = self::sanitize_css_border_style( $border['style'] ?? 'solid' );
		$color = self::sanitize_css_color( $border['color'] ?? 'rgba(0,0,0,0)' );
		$width = $border['width'] ?? 0;

		if ( is_array( $width ) ) {
			$top    = self::ensure_unit( $width['top']    ?? 0 );
			$right  = self::ensure_unit( $width['right']  ?? 0 );
			$bottom = self::ensure_unit( $width['bottom'] ?? 0 );
			$left   = self::ensure_unit( $width['left']   ?? 0 );

			// Skip if every side is zero
			if ( (int) $top === 0 && (int) $right === 0 && (int) $bottom === 0 && (int) $left === 0 ) {
				return [];
			}

			return [
				'border-style' => $style,
				'border-color' => $color,
				'border-width' => "$top $right $bottom $left",
			];
		}

		// Skip if width is zero
		if ( (int) $width === 0 ) {
			return [];
		}

		$w = self::ensure_unit( $width );
		return [ 'border' => "$w $style $color" ];
	}

	public static function border_to_css($border) {
		if ( ! is_array( $border ) ) {
			return '';
		}
		$width = $border['width'] ?? 0;
		if ( is_array( $width ) ) {
			$width = $width['top'] ?? 0;
		}
		$w     = self::ensure_unit( $width );
		$style = self::sanitize_css_border_style( $border['style'] ?? 'solid' );
		$color = self::sanitize_css_color( $border['color'] ?? 'rgba(0,0,0,0)' );
		return "$w $style $color";
	}

	/**
	 * Border styles are a fixed CSS keyword list, so an allowlist is exact.
	 *
	 * @param mixed $style Stored style.
	 * @return string
	 */
	public static function sanitize_css_border_style( $style ) {
		$allowed = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];
		$style   = is_string( $style ) ? strtolower( trim( $style ) ) : '';
		return in_array( $style, $allowed, true ) ? $style : 'solid';
	}

	public static function shapeblock_time_ago() {
		return human_time_diff( get_the_time('U'), current_time('timestamp') );
	}

	public static function shapeblock_get_video_embed($video_url, $autoplay = 0, $mute = 0, $controls = 1, $height = '400px', $width = '100%') {

		$embed_video = '';

		if( !empty($video_url) ) {

			// Self-hosted video files: render a <video> tag directly (works in both frontend and editor)
			$video_extensions = ['mp4', 'webm', 'ogg', 'mov'];
			$url_path = strtolower( wp_parse_url( $video_url, PHP_URL_PATH ) );
			$ext = pathinfo( $url_path, PATHINFO_EXTENSION );

			if ( in_array( $ext, $video_extensions, true ) ) {
				$attrs  = $controls ? ' controls' : '';
				$attrs .= $autoplay ? ' autoplay' : '';
				$attrs .= $mute ? ' muted' : '';

				$embed_video = '<video width="' . esc_attr( $width ) . '" height="' . esc_attr( $height ) . '"' . $attrs . ' playsinline>'
					. '<source src="' . esc_url( $video_url ) . '" type="' . esc_attr( wp_check_filetype( $video_url )['type'] ) . '">'
					. '</video>';

				return $embed_video;
			}

			// In the block editor (ServerSideRender via REST), wp_oembed_get's output omits the
			// allow="autoplay" attribute, so the editor's iframe permission policy blocks autoplay.
			// Build the embed iframe directly for YouTube/Vimeo so we can force the params we need.
			if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
				// Browsers block unmuted autoplay; force mute when autoplay is on.
				$effective_mute = $autoplay ? 1 : (int) $mute;

				if ( preg_match( '/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $video_url, $m ) ) {
					$src = add_query_arg( array(
						'autoplay'    => (int) $autoplay,
						'mute'        => $effective_mute,
						'controls'    => (int) $controls,
						'rel'         => 0,
						'playsinline' => 1,
						'referrerpolicy' => 'strict-origin-when-cross-origin',
					), 'https://www.youtube.com/embed/' . $m[1] );

					return '<iframe referrerpolicy="strict-origin-when-cross-origin" width="' . esc_attr( $width ) . '" height="' . esc_attr( $height ) . '" src="' . esc_url( $src ) . '" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
				}

				if ( preg_match( '/vimeo\.com\/(?:video\/)?(\d+)/', $video_url, $m ) ) {
					$src = add_query_arg( array(
						'autoplay' => (int) $autoplay,
						'muted'    => $effective_mute,
						'controls' => (int) $controls,
					), 'https://player.vimeo.com/video/' . $m[1] );

					return '<iframe width="' . esc_attr( $width ) . '" height="' . esc_attr( $height ) . '" src="' . esc_url( $src ) . '" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
				}

				// Unknown provider: skip the embed in the editor.
				return '';
			}

			$embed_video = wp_oembed_get( $video_url, ['height' => $height, 'width' => $width, 'mute' => $mute, 'autoplay' => $autoplay, 'controls' => $controls] );

			if( $embed_video ) {

				$mute_param = 'mute=' . $mute;

				// Vimeo uses muted instead of mute
				if ( strpos($video_url, 'vimeo.com') !== false ) {
					$mute_param = 'muted=' . $mute;
				}

				$params = '&referrerpolicy="strict-origin-when-cross-origin&autoplay=' . $autoplay . '&' . $mute_param . '&controls=' . $controls;

				$embed_video = preg_replace(
					'/src="([^"]+)"/',
					'src="$1' . $params . '"',
					$embed_video
				);

				// Force the height and width since wp_oembed_get ignores these for most providers
				$embed_video = preg_replace( '/\s+height="[^"]*"/', '', $embed_video );
				$embed_video = preg_replace( '/\s+width="[^"]*"/', '', $embed_video );
				$embed_video = preg_replace( '/<iframe/', '<iframe width="' . esc_attr( $width ) . '" height="' . esc_attr( $height ) . '"', $embed_video );

			}
		}

		return $embed_video;
	}

    /**
     * The HTML a rendered template is allowed to contain.
     *
     * WordPress's post allowlist is the starting point — it already covers the
     * ordinary tags, and class, id, style, data-* and the aria-* attributes on
     * them. It has no SVG at all and no form controls, which the ShapeBlock
     * blocks do emit: 16 of them draw inline SVG icons and the Search block
     * renders a real search form. Those tags are added here with the attributes
     * they actually use, so escaping the shortcode's output does not quietly
     * delete half of it.
     *
     * iframe, picture/source and the remaining form controls are allowed too,
     * because a template can hold any block a person puts in it, including
     * core's Embed block.
     *
     * @return array Allowlist in wp_kses() form.
     */
    public static function template_allowed_html() {
        $allowed = wp_kses_allowed_html( 'post' );

        // Attributes every added tag gets. 'data-*' has to be named explicitly:
        // kses only keeps data attributes on tags whose list contains that key.
        $common = array(
            'class'           => true,
            'id'              => true,
            'style'           => true,
            'role'            => true,
            'aria-hidden'     => true,
            'aria-label'      => true,
            'aria-labelledby' => true,
            'aria-describedby' => true,
            'data-*'          => true,
        );

        // Painting attributes shared by every SVG element.
        $paint = array(
            'fill'             => true,
            'fill-rule'        => true,
            'fill-opacity'     => true,
            'clip-rule'        => true,
            'clip-path'        => true,
            'stroke'           => true,
            'stroke-width'     => true,
            'stroke-linecap'   => true,
            'stroke-linejoin'  => true,
            'stroke-dasharray' => true,
            'stroke-opacity'   => true,
            'opacity'          => true,
            'transform'        => true,
        );

        $svg_elements = array(
            // 'version' is here for core's Social Links block, whose icons carry
            // it; without it every social icon loses its svg element.
            'svg'            => array( 'viewbox' => true, 'xmlns' => true, 'xmlns:xlink' => true, 'version' => true, 'width' => true, 'height' => true, 'focusable' => true, 'preserveaspectratio' => true, 'x' => true, 'y' => true ),
            'g'              => array(),
            'path'           => array( 'd' => true ),
            'circle'         => array( 'cx' => true, 'cy' => true, 'r' => true ),
            'ellipse'        => array( 'cx' => true, 'cy' => true, 'rx' => true, 'ry' => true ),
            'rect'           => array( 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true ),
            'line'           => array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true ),
            'polyline'       => array( 'points' => true ),
            'polygon'        => array( 'points' => true ),
            'defs'           => array(),
            'use'            => array( 'href' => true, 'xlink:href' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true ),
            'symbol'         => array( 'viewbox' => true ),
            'title'          => array(),
            'desc'           => array(),
            'mask'           => array( 'maskunits' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true ),
            'clippath'       => array( 'clippathunits' => true ),
            'lineargradient' => array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientunits' => true, 'gradienttransform' => true ),
            'radialgradient' => array( 'cx' => true, 'cy' => true, 'r' => true, 'fx' => true, 'fy' => true, 'gradientunits' => true ),
            'stop'           => array( 'offset' => true, 'stop-color' => true, 'stop-opacity' => true ),
            'text'           => array( 'x' => true, 'y' => true, 'dx' => true, 'dy' => true, 'text-anchor' => true, 'font-size' => true, 'font-family' => true, 'font-weight' => true ),
            'tspan'          => array( 'x' => true, 'y' => true, 'dx' => true, 'dy' => true ),
        );

        foreach ( $svg_elements as $tag => $attrs ) {
            $allowed[ $tag ] = array_merge( $common, $paint, $attrs );
        }

        $allowed['form'] = array_merge( $common, array(
            'action'         => true,
            'method'         => true,
            'target'         => true,
            'name'           => true,
            'accept-charset' => true,
            'enctype'        => true,
            'novalidate'     => true,
        ) );

        $allowed['input'] = array_merge( $common, array(
            'type'         => true,
            'name'         => true,
            'value'        => true,
            'placeholder'  => true,
            'required'     => true,
            'disabled'     => true,
            'readonly'     => true,
            'checked'      => true,
            'min'          => true,
            'max'          => true,
            'step'         => true,
            'size'         => true,
            'maxlength'    => true,
            'pattern'      => true,
            'autocomplete' => true,
            'list'         => true,
        ) );

        $allowed['textarea'] = array_merge( $common, array(
            'name'        => true,
            'rows'        => true,
            'cols'        => true,
            'placeholder' => true,
            'required'    => true,
            'disabled'    => true,
            'readonly'    => true,
            'maxlength'   => true,
        ) );

        $allowed['select'] = array_merge( $common, array(
            'name'     => true,
            'multiple' => true,
            'size'     => true,
            'required' => true,
            'disabled' => true,
        ) );

        $allowed['option']   = array_merge( $common, array( 'value' => true, 'selected' => true, 'disabled' => true, 'label' => true ) );
        $allowed['optgroup'] = array_merge( $common, array( 'label' => true, 'disabled' => true ) );
        $allowed['datalist'] = $common;

        // No srcdoc: it would let a template carry a whole inline document.
        $allowed['iframe'] = array_merge( $common, array(
            'src'             => true,
            'width'           => true,
            'height'          => true,
            'title'           => true,
            'loading'         => true,
            'allow'           => true,
            'allowfullscreen' => true,
            'frameborder'     => true,
            'referrerpolicy'  => true,
            'sandbox'         => true,
            'name'            => true,
        ) );

        /*
         * Attributes the blocks put on tags the post allowlist already knows,
         * but which are not in its attribute lists. Rendering all 31 blocks and
         * comparing the markup before and after escaping is what turned these
         * up: the Progress block loses its ARIA range and every image loses
         * decoding="async" without them.
         */
        $allowed['div']['aria-valuenow']  = true;
        $allowed['div']['aria-valuemin']  = true;
        $allowed['div']['aria-valuemax']  = true;
        $allowed['div']['aria-valuetext'] = true;
        $allowed['img']['decoding']       = true;
        $allowed['img']['srcset']         = true;
        $allowed['img']['sizes']          = true;
        $allowed['img']['fetchpriority']  = true;

        $allowed['picture'] = $common;
        $allowed['source']  = array_merge( $common, array(
            'src'    => true,
            'srcset' => true,
            'sizes'  => true,
            'media'  => true,
            'type'   => true,
            'width'  => true,
            'height' => true,
        ) );

        /**
         * Filters the HTML a rendered ShapeBlock template may contain.
         *
         * A block from another plugin can emit a tag this list does not know
         * about; this is where to add it rather than removing the escaping.
         *
         * @param array $allowed Allowlist in wp_kses() form.
         */
        return apply_filters( 'shapeblock_template_allowed_html', $allowed );
    }
}