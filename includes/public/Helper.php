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

	public static function ensure_unit ($value) {
		if ( $value === '' || $value === null ) return '0px';
		if ( is_numeric( $value ) && $value != 0 ) return $value . 'px';
		return $value;
	}

	public static function get_inline_styles ($style_map) {
		$styles = [];
		foreach ( $style_map as $prop => $value ) {
			//if ( $value !== '' && $value !== null && $value !== 'inherit' && $value !== '0px' ) {
				$styles[] = $prop . ':' . $value;
			//}
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

		foreach ($breakpoints as $device => $media) {
			if (!empty($responsive_data[$device])) {
				$decls = "";
				foreach ($responsive_data[$device] as $prop => $val) {
					$decls .= $prop . ":" . wp_strip_all_tags( $val ) . ";";
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
		$css = $responsive_css;
		
		foreach ( $sub_styles as $sub_sel => $style ) {
			if ( ! empty( $style ) ) {
				 $css .= $selector . " " . $sub_sel . " { " . $style . "; }\n";
			}
		}

		if ( ! empty( $css ) ) {
			if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS values are sanitized via wp_strip_all_tags() during generation
				echo '<style>' . $css . '</style>';
			} elseif ( did_action( 'wp_head' ) ) {
				// Classic (non-block) themes render blocks inside the_content() AFTER wp_head()
				// has already printed. wp_add_inline_style() would queue the CSS to a handle
				// that's already been output, so it never reaches the page. Print inline instead.
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS values are sanitized via wp_strip_all_tags() during generation
				echo '<style id="' . esc_attr( $handle ) . '-inline">' . $css . '</style>';
			} else {
				wp_add_inline_style( $handle, $css );
			}

		}
	}

	public static function box_shadow_to_css($shadow) {
		$x = self::ensure_unit($shadow['x'] ?? 0);
		$y = self::ensure_unit($shadow['y'] ?? 0);
		$b = self::ensure_unit($shadow['b'] ?? 0);
		$s = self::ensure_unit($shadow['s'] ?? 0);
		$c = $shadow['c'] ?? 'rgba(0,0,0,0)';
		// Absent or false keeps the outer shadow every saved block already has.
		$inset = empty($shadow['inset']) ? '' : 'inset ';
		return "$inset$x $y $b $s $c";
	}

	public static function border_to_css_props($border) {
		$style = $border['style'] ?? 'solid';
		$color = $border['color'] ?? 'rgba(0,0,0,0)';
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
		$width = $border['width'] ?? 0;
		if ( is_array( $width ) ) {
			$width = $width['top'] ?? 0;
		}
		$w     = self::ensure_unit( $width );
		$style = $border['style'] ?? 'solid';
		$color = $border['color'] ?? 'rgba(0,0,0,0)';
		return "$w $style $color";
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
}