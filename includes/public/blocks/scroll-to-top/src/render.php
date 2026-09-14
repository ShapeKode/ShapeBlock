<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Scroll Top block.
 *
 * Mirrors the markup of the Elementor "Scroll Top" widget
 * (easy-elements/widgets/scroll-to-top). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-stt-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$icon       = isset( $attributes['scrollIcon'] ) ? $attributes['scrollIcon'] : '';
$position   = ( isset( $attributes['position'] ) && 'left' === $attributes['position'] ) ? 'left' : 'right';
$show_after = ( isset( $attributes['showAfter'] ) && '' !== $attributes['showAfter'] ) ? (int) $attributes['showAfter'] : 150;

// In the editor, render the button inline + visible so it can be seen and styled
// (on the front end it is a fixed button that appears after scrolling).
$is_editor = ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin();

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-scroll-top-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-scroll-top-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-scroll-top-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-scroll-to-top-style';

// Shared mappers (same conventions as the Button block).
$dims = function ( $obj, $type ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	if ( 'padding' === $type ) {
		$map = [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ];
	} else {
		$map = [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
	}
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) {
			$out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
		}
	}
	return $out;
};
$shadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return [];
	}
	$x = (int) ( $obj['x'] ?? 0 );
	$y = (int) ( $obj['y'] ?? 0 );
	$b = (int) ( $obj['b'] ?? 0 );
	$s = (int) ( $obj['s'] ?? 0 );
	$c = $obj['c'] ?? '';
	$transparent = in_array( str_replace( ' ', '', (string) $c ), [ '', 'rgba(0,0,0,0)' ], true );
	if ( 0 === $x && 0 === $y && 0 === $b && 0 === $s && $transparent ) {
		return [];
	}
	return [ 'box-shadow' => $H::box_shadow_to_css( $obj ) ];
};

// Button (normal).
$btn = [];
if ( ! empty( $attributes['bgColor'] ) ) $btn['background-color'] = $attributes['bgColor'];
if ( ! empty( $attributes['color'] ) ) $btn['color'] = $attributes['color'];
if ( ! empty( $attributes['buttonSize'] ) ) {
	$size = $H::ensure_unit( $attributes['buttonSize'] );
	$btn['width']       = $size;
	$btn['height']      = $size;
	$btn['line-height'] = $size;
}
$btn = array_merge( $btn, $dims( $attributes['sttRadius'] ?? [], 'radius' ), $dims( $attributes['sttPadding'] ?? [], 'padding' ), $shadow( $attributes['sttBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['sttBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['sttBorder'] ) );

// Position / offset apply only on the front end (in the editor the button is inline).
if ( ! $is_editor ) {
	if ( isset( $attributes['offsetY'] ) && '' !== $attributes['offsetY'] ) {
		$btn['bottom'] = $H::ensure_unit( $attributes['offsetY'] );
	}
	if ( isset( $attributes['offsetX'] ) && '' !== $attributes['offsetX'] ) {
		$off = $H::ensure_unit( $attributes['offsetX'] );
		if ( 'left' === $position ) {
			$btn['left']  = $off;
			$btn['right'] = 'auto';
		} else {
			$btn['right'] = $off;
		}
	} elseif ( 'left' === $position ) {
		$btn['left']  = '28px';
		$btn['right'] = 'auto';
	}
}

// Button (hover).
$btn_hover = [];
if ( ! empty( $attributes['bgColorHover'] ) ) $btn_hover['background-color'] = $attributes['bgColorHover'];
if ( ! empty( $attributes['colorHover'] ) ) $btn_hover['color'] = $attributes['colorHover'];

// Icon size.
$icon_i   = [];
$icon_svg = [];
if ( ! empty( $attributes['color'] ) ) $icon_svg['fill'] = $attributes['color'];
if ( ! empty( $attributes['iconSize'] ) ) {
	$is = $H::ensure_unit( $attributes['iconSize'] );
	$icon_i['font-size'] = $is;
	$icon_svg['width']   = $is;
	$icon_svg['height']  = $is;
}
$icon_svg_hover = ! empty( $attributes['colorHover'] ) ? [ 'fill' => $attributes['colorHover'] ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $dims, $H ) {
	$btn = [];
	if ( isset( $attributes[ 'buttonSize' . $suffix ] ) && '' !== $attributes[ 'buttonSize' . $suffix ] ) {
		$size = $H::ensure_unit( $attributes[ 'buttonSize' . $suffix ] );
		$btn['width']       = $size;
		$btn['height']      = $size;
		$btn['line-height'] = $size;
	}
	$btn = array_merge( $btn, $dims( $attributes[ 'sttPadding' . $suffix ] ?? [], 'padding' ) );

	$icon_i   = [];
	$icon_svg = [];
	if ( isset( $attributes[ 'iconSize' . $suffix ] ) && '' !== $attributes[ 'iconSize' . $suffix ] ) {
		$is = $H::ensure_unit( $attributes[ 'iconSize' . $suffix ] );
		$icon_i['font-size'] = $is;
		$icon_svg['width']   = $is;
		$icon_svg['height']  = $is;
	}

	return [
		'.shapeblock-scroll-top'   => $btn,
		'.shapeblock-scroll-top i' => $icon_i,
		'.shapeblock-scroll-top svg' => $icon_svg,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-scroll-top', '.shapeblock-scroll-top i', '.shapeblock-scroll-top svg' ] as $sub_sel ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		if ( ! empty( $dev_data[ $suffix ][ $sub_sel ] ) ) {
			$rdata[ $device_key ] = $dev_data[ $suffix ][ $sub_sel ];
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $selector . ' ' . $sub_sel, $rdata );
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-scroll-top'       => $H::get_inline_styles( $btn ),
	'.shapeblock-scroll-top:hover' => $H::get_inline_styles( $btn_hover ),
	'.shapeblock-scroll-top i'     => $H::get_inline_styles( $icon_i ),
	'.shapeblock-scroll-top svg, ' . $selector . ' .shapeblock-scroll-top svg path' => $H::get_inline_styles( $icon_svg ),
	'.shapeblock-scroll-top:hover svg, ' . $selector . ' .shapeblock-scroll-top:hover svg path' => $H::get_inline_styles( $icon_svg_hover ),
] );

$icon_html = ( ! empty( $icon ) && 'none' !== $icon )
	? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>'
	: '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 4l8 8-1.4 1.4L13 7.8V20h-2V7.8L5.4 13.4 4 12z"></path></svg>';

$btn_classes = 'shapeblock-scroll-top';
if ( $is_editor ) {
	$btn_classes .= ' shapeblock-scroll-visible shapeblock-scroll-editor';
}

// Allowed markup for the icon output (icon font <i> or inline SVG fallback).
$shapeblock_icon_allowed = array(
	'i'    => array( 'class' => array(), 'aria-hidden' => array() ),
	'svg'  => array( 'viewbox' => array(), 'aria-hidden' => array(), 'xmlns' => array() ),
	'path' => array( 'fill' => array(), 'd' => array() ),
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="<?php echo esc_attr( $btn_classes ); ?>" role="button" tabindex="0" aria-label="<?php echo esc_attr__( 'Scroll to top', 'shapeblock' ); ?>" data-show-after="<?php echo esc_attr( $show_after ); ?>">
		<?php echo wp_kses( $icon_html, $shapeblock_icon_allowed ); ?>
	</div>
</div>
