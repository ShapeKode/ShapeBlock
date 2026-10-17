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
						if ( in_array( $prop_key, ['top', 'right', 'bottom', 'left', 'fontSize', 'letterSpacing'] ) ) {
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
	 * The inline HTML a description or short text may contain: line breaks and
	 * basic emphasis, links, and nothing that can run code or change the layout.
	 * Used with wp_kses() so what an author types (a <br>, some <strong>) is
	 * shown as formatting instead of as visible tags.
	 *
	 * @return array Allowlist in wp_kses() form.
	 */
	public static function inline_allowed_html() {
		return array(
			'br'     => array(),
			'strong' => array(),
			'b'      => array(),
			'em'     => array(),
			'i'      => array(),
			'u'      => array(),
			's'      => array(),
			'small'  => array(),
			'mark'   => array(),
			'code'   => array(),
			'sup'    => array(),
			'sub'    => array(),
			'span'   => array( 'class' => true ),
			'a'      => array(
				'href'   => true,
				'title'  => true,
				'target' => true,
				'rel'    => true,
			),
		);
	}

	/**
	 * Block ids already printed on this request.
	 *
	 * @var array<string,int>
	 */
	private static $used_block_ids = [];

	/**
	 * A block id that no other block on this page has used yet.
	 *
	 * A duplicated or copy-pasted block keeps the original's blockId, so both
	 * answered to the same `.<id>` selector and a border or shadow set on one
	 * appeared on every copy. The editor now hands copies a fresh id, but pages
	 * saved before still hold the shared one; this gives every repeat a suffix so
	 * its markup and its CSS stay paired with each other only.
	 *
	 * @param string $id Sanitised block id.
	 * @return string
	 */
	public static function unique_block_id( $id ) {
		$id = (string) $id;
		if ( ! isset( self::$used_block_ids[ $id ] ) ) {
			self::$used_block_ids[ $id ] = 1;
			return $id;
		}
		$n = ++self::$used_block_ids[ $id ];
		return $id . '-' . $n;
	}

	/**
	 * A block's hover animation: the class for the element that moves, only
	 * ever one from this list, and its speed as a custom property (100 to
	 * 5000 ms) when one is set. The animations are in public.css.
	 *
	 * @param array $attributes Block attributes (hoverAnimation, hoverAnimSpeed).
	 * @return array { class: string, style: array }
	 */
	public static function hover_animation( $attributes ) {
		$names = array( 'none', 'grow', 'shrink', 'float', 'sink', 'rotate', 'spin', 'pulse', 'pop', 'bob', 'hang', 'wobble-horizontal', 'wobble-vertical', 'buzz' );
		$name  = ( isset( $attributes['hoverAnimation'] ) && in_array( $attributes['hoverAnimation'], $names, true ) ) ? $attributes['hoverAnimation'] : '';
		$style = array();
		if ( '' !== $name && 'none' !== $name && isset( $attributes['hoverAnimSpeed'] ) && is_numeric( $attributes['hoverAnimSpeed'] ) ) {
			$style['--shapeblock-hover-speed'] = min( 5000, max( 100, absint( $attributes['hoverAnimSpeed'] ) ) ) . 'ms';
		}
		return array(
			'class' => '' !== $name ? 'shapeblock-hover-' . $name : '',
			'style' => $style,
		);
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
	 * declaration, the rule or the style element element, open a comment, or invoke a
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

		// url() may only reference an http(s), protocol-relative or data:image
		// source - every one of them, not just the first.
		$urls = preg_match_all( '#url\(#i', $value );
		if ( $urls && preg_match_all( '#url\(\s*[\'"]?(?:(?:https?:)?//|data:image/)#i', $value ) !== $urls ) {
			return '';
		}

		// Final allowlist of characters a generated value can legitimately need.
		if ( preg_match( '#[^A-Za-z0-9 _.,:%\#()\'"/!+*=?&~\^\[\]-]#', $value ) ) {
			return '';
		}

		// An unclosed bracket or quote would swallow the declarations after it.
		if ( ! self::css_value_is_balanced( $value ) ) {
			return '';
		}

		return $value;
	}

	/**
	 * Are the brackets and quotes in a CSS value paired? An unclosed ( or [
	 * runs past the ; and } that follow it, and an unclosed quote swallows the
	 * rest of the line, so either would break the rules printed after it.
	 *
	 * @param string $value CSS value.
	 * @return bool
	 */
	private static function css_value_is_balanced( $value ) {
		$stack = array();
		$quote = '';
		$pairs = array( ')' => '(', ']' => '[' );
		$len   = strlen( $value );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = $value[ $i ];
			if ( '' !== $quote ) {
				if ( $ch === $quote ) {
					$quote = '';
				}
				continue;
			}
			if ( '"' === $ch || "'" === $ch ) {
				$quote = $ch;
			} elseif ( '(' === $ch || '[' === $ch ) {
				$stack[] = $ch;
			} elseif ( isset( $pairs[ $ch ] ) ) {
				if ( array_pop( $stack ) !== $pairs[ $ch ] ) {
					return false;
				}
			}
		}
		return '' === $quote && empty( $stack );
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
	 * hand-built style element tag.
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
			self::queue_pending_css( $css, $handle );
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
	 * Templates being rendered right now, keyed by post id, so a template that
	 * contains a block pointing back at itself stops instead of recursing.
	 *
	 * @var array<int,bool>
	 */
	public static $rendering_templates = [];

	/**
	 * Take the CSS that rendered inner blocks / template markup carry out of
	 * that markup, before the markup is escaped against the template allowlist.
	 *
	 * In the editor (and any render after wp_footer) each block hands its CSS
	 * back inside its own markup as a style element. The allowlist drops that
	 * element but keeps its text, which then shows up on the page as visible
	 * code. The CSS is therefore taken out first and routed through add_css(),
	 * which attaches it to the calling block's output again.
	 *
	 * Callers still escape the returned markup at their output point.
	 *
	 * @param string $html   Rendered markup.
	 * @param string $handle Style handle of the calling block.
	 * @return string Markup without the style elements.
	 */
	public static function move_block_css( $html, $handle ) {
		$html = (string) $html;
		$css  = '';
		$out  = preg_replace_callback(
			'#<(style)\b[^>]*>(.*?)</\1>#is',
			function ( $m ) use ( &$css ) {
				$css .= $m[2] . "\n";
				return '';
			},
			$html
		);
		if ( is_string( $out ) ) {
			$html = $out;
			self::add_css( $handle, $css );
		}
		return $html;
	}

	/**
	 * Hold CSS until the block it belongs to returns its markup.
	 *
	 * The CSS is kept for the block that made it, named from its style handle
	 * ("shapeblock-post-grid-style" → "shapeblock/post-grid"). A block that
	 * renders other blocks before it returns - the Post Grid building excerpts,
	 * say - would otherwise hand its CSS to one of those, whose markup is then
	 * stripped, and the editor preview would lose every style setting.
	 * CSS whose handle names no block goes out with the next block, as before.
	 *
	 * @param string $css    Generated CSS.
	 * @param string $handle Style handle of the block that made it.
	 * @return void
	 */
	private static function queue_pending_css( $css, $handle = '' ) {
		if ( empty( self::$pending_css ) ) {
			add_filter( 'render_block', [ __CLASS__, 'inject_pending_css' ], 5, 2 );
		}
		$owner = '';
		if ( preg_match( '/^shapeblock-(?:pro-)?(.+)-style$/', (string) $handle, $m ) && \WP_Block_Type_Registry::get_instance()->is_registered( 'shapeblock/' . $m[1] ) ) {
			$owner = 'shapeblock/' . $m[1];
		}
		self::$pending_css[ $owner ][] = $css;
	}

	/**
	 * Prepend any CSS the block just generated to its own markup.
	 *
	 * The CSS goes through WordPress's own inline-style API: it is attached to a
	 * throw-away handle with wp_add_inline_style() and printed by
	 * wp_print_styles(), so the style element is built by core, not written
	 * out by hand here. wp_strip_all_tags() has already removed every "<" from
	 * the sheet, so nothing in it can close the element early.
	 *
	 * @param string $content Block markup.
	 * @param array  $block   The block being rendered.
	 * @return string
	 */
	public static function inject_pending_css( $content, $block = [] ) {
		if ( empty( self::$pending_css ) ) {
			return $content;
		}

		// This block's own CSS, plus any that names no block.
		$name  = is_array( $block ) && isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		$parts = [];
		foreach ( array_unique( [ '', $name ] ) as $owner ) {
			if ( isset( self::$pending_css[ $owner ] ) ) {
				$parts = array_merge( $parts, self::$pending_css[ $owner ] );
				unset( self::$pending_css[ $owner ] );
			}
		}
		if ( ! $parts ) {
			return $content;
		}
		$css = str_replace( [ '<!--', '-->' ], '', implode( '', $parts ) );

		// One handle per piece of CSS: core prints a handle only once.
		static $count = 0;
		++$count;
		$handle = 'shapeblock-block-css-' . $count;

		wp_register_style( $handle, false, [], SHAPEBLOCK_VERSION );
		wp_add_inline_style( $handle, $css );

		ob_start();
		wp_print_styles( $handle );
		$tag = (string) ob_get_clean();

		wp_deregister_style( $handle );

		return $tag . $content;
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

	public static function border_to_css_props( $border, $default_color = 'rgba(0,0,0,0)' ) {
		if ( ! is_array( $border ) ) {
			return [];
		}
		$style = self::sanitize_css_border_style( $border['style'] ?? 'solid' );
		$color = self::sanitize_css_color( ! empty( $border['color'] ) ? $border['color'] : $default_color );
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