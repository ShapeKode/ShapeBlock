<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Icon block.
 *
 * A single icon (optionally linked) with color, size, background, border,
 * rotation and hover states — a simple counterpart to Elementor's Icon widget.
 * Element classes use this plugin's "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-icon-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$icon        = isset( $attributes['icon'] ) ? $attributes['icon'] : '';
$url         = isset( $attributes['iconUrl'] ) ? trim( $attributes['iconUrl'] ) : '';
$is_external = ! empty( $attributes['iconTarget'] );
$nofollow    = ! empty( $attributes['iconNofollow'] );
$alignment   = isset( $attributes['alignment'] ) ? $attributes['alignment'] : 'center';

$view  = ( isset( $attributes['view'] ) && in_array( $attributes['view'], array( 'default', 'stacked', 'framed' ), true ) ) ? $attributes['view'] : 'default';
$shape = ( isset( $attributes['shape'] ) && in_array( $attributes['shape'], array( 'circle', 'rounded', 'square' ), true ) ) ? $attributes['shape'] : 'circle';

$el_classes = 'shapeblock-icon-el shapeblock-icon-view-' . $view;
if ( 'default' !== $view ) {
	$el_classes .= ' shapeblock-icon-shape-' . $shape;
}

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-icon-block-wrap ' . $unique_id,
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-icon-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-icon-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-icon-style';

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

// Wrapper alignment.
$wrap_styles = [];
if ( ! empty( $alignment ) ) {
	$wrap_styles['justify-content'] = $alignment;
}

// Icon box (normal). Font-size drives BOTH the glyph and the (em-based) box, so
// the Stacked / Framed square stays square and the Circle shape is a true circle.
$box_styles = [];
if ( ! empty( $attributes['iconBg'] ) ) {
	$box_styles['background-color'] = $attributes['iconBg'];
}
if ( isset( $attributes['iconSize'] ) && '' !== $attributes['iconSize'] ) {
	$box_styles['font-size'] = $H::ensure_unit( $attributes['iconSize'] );
}
$box_styles = array_merge( $box_styles, $dims( $attributes['iconPadding'] ?? [], 'padding' ), $dims( $attributes['iconBorderRadius'] ?? [], 'radius' ), $shadow( $attributes['iconBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['iconBorder'] ) ) {
	$box_styles = array_merge( $box_styles, $H::border_to_css_props( $attributes['iconBorder'] ) );
}

// Icon glyph (normal). Size is inherited from the box font-size above.
$i_styles   = [];
$svg_styles = [];
if ( ! empty( $attributes['iconColor'] ) ) {
	$i_styles['color']   = $attributes['iconColor'];
	$svg_styles['fill']  = $attributes['iconColor'];
}
if ( isset( $attributes['iconRotation'] ) && '' !== $attributes['iconRotation'] ) {
	$rot = 'rotate(' . $attributes['iconRotation'] . 'deg)';
	$i_styles['transform']   = $rot;
	$svg_styles['transform'] = $rot;
}

// Icon box (hover).
$box_hover = [];
if ( ! empty( $attributes['iconBgHover'] ) ) {
	$box_hover['background-color'] = $attributes['iconBgHover'];
}
if ( ! empty( $attributes['iconBorderHover'] ) ) {
	$box_hover = array_merge( $box_hover, $H::border_to_css_props( $attributes['iconBorderHover'] ) );
}

// Icon glyph (hover).
$i_hover   = [];
$svg_hover = [];
if ( ! empty( $attributes['iconColorHover'] ) ) {
	$i_hover['color']  = $attributes['iconColorHover'];
	$svg_hover['fill'] = $attributes['iconColorHover'];
}
if ( isset( $attributes['iconRotationHover'] ) && '' !== $attributes['iconRotationHover'] ) {
	$rot_h = 'rotate(' . $attributes['iconRotationHover'] . 'deg)';
	$i_hover['transform']   = $rot_h;
	$svg_hover['transform'] = $rot_h;
}

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $dims, $H ) {
	$wrap = [];
	if ( ! empty( $attributes[ 'alignment' . $suffix ] ) ) {
		$wrap['justify-content'] = $attributes[ 'alignment' . $suffix ];
	}

	$box = [];
	if ( isset( $attributes[ 'iconSize' . $suffix ] ) && '' !== $attributes[ 'iconSize' . $suffix ] ) {
		$box['font-size'] = $H::ensure_unit( $attributes[ 'iconSize' . $suffix ] );
	}
	$box = array_merge( $box, $dims( $attributes[ 'iconPadding' . $suffix ] ?? [], 'padding' ) );

	return [
		'.shapeblock-icon-wrap' => $wrap,
		'.shapeblock-icon-el'   => $box,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-icon-wrap', '.shapeblock-icon-el' ] as $sub_sel ) {
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
	'.shapeblock-icon-wrap'        => $H::get_inline_styles( $wrap_styles ),
	'.shapeblock-icon-el'          => $H::get_inline_styles( $box_styles ),
	'.shapeblock-icon-el i'        => $H::get_inline_styles( $i_styles ),
	'.shapeblock-icon-el svg'      => $H::get_inline_styles( $svg_styles ),
	'.shapeblock-icon-el:hover'    => $H::get_inline_styles( $box_hover ),
	'.shapeblock-icon-el:hover i'  => $H::get_inline_styles( $i_hover ),
	'.shapeblock-icon-el:hover svg' => $H::get_inline_styles( $svg_hover ),
] );

$icon_html = ( ! empty( $icon ) && 'none' !== $icon ) ? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : '';

// Optional link wrapper.
$has_link = ( '' !== $url && '#' !== $url );
$rel      = [];
if ( $is_external ) {
	$rel[] = 'noopener';
}
if ( $nofollow ) {
	$rel[] = 'nofollow';
}
$rel_attr = ! empty( $rel ) ? ' rel="' . esc_attr( implode( ' ', $rel ) ) . '"' : '';
$target   = $is_external ? ' target="_blank"' : '';
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-icon-wrap">
		<?php if ( $has_link ) : ?>
			<a class="<?php echo esc_attr( $el_classes ); ?>" href="<?php echo esc_url( $url ); ?>"<?php echo $target . $rel_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>>
				<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Icon markup escaped above. ?>
			</a>
		<?php else : ?>
			<span class="<?php echo esc_attr( $el_classes ); ?>">
				<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Icon markup escaped above. ?>
			</span>
		<?php endif; ?>
	</div>
</div>
