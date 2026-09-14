<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Social Icon block.
 *
 * Mirrors the markup of the Elementor "Social Icon" widget
 * (easy-elements/widgets/social-icon). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-si-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$links      = isset( $attributes['socialLinks'] ) && is_array( $attributes['socialLinks'] ) ? $attributes['socialLinks'] : [];
// Must match the block.json default, or a block saved without the attribute
// would render in a different mode than the editor shows.
$color_mode = isset( $attributes['colorMode'] ) ? $attributes['colorMode'] : 'global';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-social-icon-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-social-icon-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( empty( $links ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add social links.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-social-icon-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-social-icon-style';

$dims = function ( $obj ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
	$map = [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) $out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
	}
	return $out;
};
$shadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) return [];
	$x = (int) ( $obj['x'] ?? 0 ); $y = (int) ( $obj['y'] ?? 0 ); $b = (int) ( $obj['b'] ?? 0 ); $s = (int) ( $obj['s'] ?? 0 );
	$c = $obj['c'] ?? '';
	$transparent = in_array( str_replace( ' ', '', (string) $c ), [ '', 'rgba(0,0,0,0)' ], true );
	if ( 0 === $x && 0 === $y && 0 === $b && 0 === $s && $transparent ) return [];
	return [ 'box-shadow' => $H::box_shadow_to_css( $obj ) ];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Button box.
$button = [];
if ( '' !== $u( 'buttonSize' ) ) { $b = $u( 'buttonSize' ); $button['width'] = $b; $button['height'] = $b; $button['line-height'] = $b; }
$button = array_merge( $button, $dims( $attributes['buttonRadius'] ?? [] ), $shadow( $attributes['buttonBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['buttonBorder'] ) ) $button = array_merge( $button, $H::border_to_css_props( $attributes['buttonBorder'] ) );

$button_hover = [];
if ( ! empty( $attributes['buttonBorderHover'] ) ) $button_hover = array_merge( $button_hover, $H::border_to_css_props( $attributes['buttonBorderHover'] ) );

$buttons_wrap = ( '' !== $u( 'buttonSpacing' ) ) ? [ 'gap' => $u( 'buttonSpacing' ) ] : [];

$icon_i   = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];
$icon_svg = ( '' !== $u( 'iconSize' ) ) ? [ 'width' => $u( 'iconSize' ), 'height' => $u( 'iconSize' ) ] : [];

$sub = [
	'.shapeblock-si-buttons'        => $H::get_inline_styles( $buttons_wrap ),
	'.shapeblock-si-button'         => $H::get_inline_styles( $button ),
	'.shapeblock-si-button:hover'   => $H::get_inline_styles( $button_hover ),
	'.shapeblock-si-button i'       => $H::get_inline_styles( $icon_i ),
	'.shapeblock-si-button svg'     => $H::get_inline_styles( $icon_svg ),
];

// Global colour mode: one set of colours for all buttons.
if ( 'global' === $color_mode ) {
	$g_bg = ! empty( $attributes['gBgGradient'] ) ? $attributes['gBgGradient'] : ( ! empty( $attributes['gBgColor'] ) ? $attributes['gBgColor'] : '' );
	$g_hbg = ! empty( $attributes['gHoverBgGradient'] ) ? $attributes['gHoverBgGradient'] : ( ! empty( $attributes['gHoverBgColor'] ) ? $attributes['gHoverBgColor'] : '' );
	if ( '' !== $g_bg )  $sub['.shapeblock-si-button']       = $H::get_inline_styles( array_merge( $button, [ 'background' => $g_bg ] ) );
	if ( '' !== $g_hbg ) $sub['.shapeblock-si-button:hover'] = $H::get_inline_styles( array_merge( $button_hover, [ 'background' => $g_hbg ] ) );
	if ( ! empty( $attributes['gIconColor'] ) ) {
		$sub['.shapeblock-si-button i']   = $H::get_inline_styles( array_merge( $icon_i, [ 'color' => $attributes['gIconColor'] ] ) );
		$sub['.shapeblock-si-button svg'] = $H::get_inline_styles( array_merge( $icon_svg, [ 'fill' => $attributes['gIconColor'] ] ) );
	}
	if ( ! empty( $attributes['gHoverIconColor'] ) ) {
		$sub['.shapeblock-si-button:hover i']   = 'color:' . $attributes['gHoverIconColor'];
		$sub['.shapeblock-si-button:hover svg'] = 'fill:' . $attributes['gHoverIconColor'];
	}
}

// Custom colour mode: per-item hover rules (base colours are inline on each <a>).
$extra_css = '';
if ( 'custom' === $color_mode ) {
	foreach ( $links as $index => $link ) {
		$item_sel = $selector . ' .shapeblock-si-item-' . $index;
		$hbg = ! empty( $link['hoverBgGradient'] ) ? $link['hoverBgGradient'] : ( ! empty( $link['hoverBgColor'] ) ? $link['hoverBgColor'] : '' );
		$hic = ! empty( $link['hoverIconColor'] ) ? $link['hoverIconColor'] : '';
		if ( '' !== $hbg ) {
			$extra_css .= $item_sel . ':hover{background:' . $hbg . '!important;}';
		}
		if ( '' !== $hic ) {
			$extra_css .= $item_sel . ':hover i,' . $item_sel . ':hover svg{color:' . $hic . '!important;fill:' . $hic . '!important;}';
		}
	}
}

// Alignment — align the icon row (left / center / right) within the block,
// responsive per device (alignment / alignmentTablet / alignmentMobile).
$justify_map = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
$align_resp  = [];
foreach ( [ '' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$align_val = isset( $attributes[ 'alignment' . $suffix ] ) ? $attributes[ 'alignment' . $suffix ] : '';
	if ( $align_val !== '' && isset( $justify_map[ $align_val ] ) ) {
		$align_resp[ $device_key ]['justify-content'] = $justify_map[ $align_val ];
	}
}
$extra_css .= $H::generate_responsive_css( $selector . ' .shapeblock-si-buttons', $align_resp );

// Sizing (Button Size / Button Spacing / Icon Size) — responsive Tablet/Mobile
// overrides. The desktop values above are unchanged; these rules are emitted
// only when the matching per-device attribute is set, so existing content
// renders identically.
$u_dev = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};
$size_resp = [
	'.shapeblock-si-buttons'    => [],
	'.shapeblock-si-button'     => [],
	'.shapeblock-si-button i'   => [],
	'.shapeblock-si-button svg' => [],
];
foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$bs = $u_dev( 'buttonSize' . $suffix );
	if ( '' !== $bs ) {
		$size_resp['.shapeblock-si-button'][ $device_key ] = [ 'width' => $bs, 'height' => $bs, 'line-height' => $bs ];
	}
	$sp = $u_dev( 'buttonSpacing' . $suffix );
	if ( '' !== $sp ) {
		$size_resp['.shapeblock-si-buttons'][ $device_key ] = [ 'gap' => $sp ];
	}
	$isz = $u_dev( 'iconSize' . $suffix );
	if ( '' !== $isz ) {
		$size_resp['.shapeblock-si-button i'][ $device_key ]   = [ 'font-size' => $isz ];
		$size_resp['.shapeblock-si-button svg'][ $device_key ] = [ 'width' => $isz, 'height' => $isz ];
	}
}
foreach ( $size_resp as $sub_sel => $rdata ) {
	if ( ! empty( $rdata ) ) {
		$extra_css .= $H::generate_responsive_css( $selector . ' ' . $sub_sel, $rdata );
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $extra_css, $sub );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-si-share">
		<div class="shapeblock-si-buttons">
			<?php
			foreach ( $links as $index => $link ) {
				$title = isset( $link['linkTitle'] ) ? $link['linkTitle'] : '';
				$url   = ! empty( $link['linkUrl'] ) ? $link['linkUrl'] : '#';
				$icon  = isset( $link['icon'] ) ? $link['icon'] : '';

				$external = ! empty( $link['isExternal'] );
				$nofollow = ! empty( $link['nofollow'] );
				$target   = $external ? '_blank' : '_self';
				$rel      = [];
				if ( $external ) { $rel[] = 'noopener'; }
				if ( $nofollow ) { $rel[] = 'nofollow'; }
				$rel_attr = ! empty( $rel ) ? ' rel="' . esc_attr( implode( ' ', $rel ) ) . '"' : '';

				// Per-item base colours (custom mode only).
				$style = '';
				$icon_style = '';
				if ( 'custom' === $color_mode ) {
					$bg = ! empty( $link['bgGradient'] ) ? $link['bgGradient'] : ( ! empty( $link['bgColor'] ) ? $link['bgColor'] : '' );
					if ( '' !== $bg ) { $style .= 'background:' . $bg . ';'; }
					if ( ! empty( $link['iconColor'] ) ) {
						$style .= 'color:' . $link['iconColor'] . ';';
						$icon_style = ' style="color:' . esc_attr( $link['iconColor'] ) . ';fill:' . esc_attr( $link['iconColor'] ) . ';"';
					}
				}

				echo '<a href="' . esc_url( $url ) . '" class="shapeblock-si-button shapeblock-si-item-' . esc_attr( $index ) . '" target="' . esc_attr( $target ) . '"' . $rel_attr // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					. ' title="' . esc_attr( $title ) . '"' . ( '' !== $style ? ' style="' . esc_attr( $style ) . '"' : '' ) . '>';
				if ( ! empty( $icon ) && 'none' !== $icon ) {
					echo '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"' . $icon_style . '></i>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
				echo '</a>';
			}
			?>
		</div>
	</div>
</div>
