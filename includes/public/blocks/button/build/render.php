<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Button block.
 *
 * Element classes use this plugin's "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-button-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$text          = isset( $attributes['buttonText'] ) ? $attributes['buttonText'] : '';
$url           = ! empty( $attributes['buttonUrl'] ) ? $attributes['buttonUrl'] : '#';
$is_external   = ! empty( $attributes['buttonTarget'] );
$nofollow      = ! empty( $attributes['buttonNofollow'] );
$button_type   = isset( $attributes['buttonType'] ) ? $attributes['buttonType'] : 'primary';
$icon          = isset( $attributes['buttonIcon'] ) ? $attributes['buttonIcon'] : '';
$icon_position = isset( $attributes['iconPosition'] ) ? $attributes['iconPosition'] : 'after';
// Full gradient strings from the Background (Normal / Hover) and Border
// Gradient controls. The older fixed three-colour gradient (showGradient,
// gradient1-3) and two-colour border (borderGradientColor1-2) still render for
// buttons saved before, until the editor carries them over on next edit.
$bg_gradient       = isset( $attributes['bgGradient'] ) ? (string) $attributes['bgGradient'] : '';
$bg_gradient_hover = isset( $attributes['bgGradientHover'] ) ? (string) $attributes['bgGradientHover'] : '';
$border_gradient   = isset( $attributes['borderGradient'] ) ? (string) $attributes['borderGradient'] : '';
$show_gradient     = ! empty( $attributes['showGradient'] ) && '' === $bg_gradient && '' === $bg_gradient_hover;
$border_grad       = ! empty( $attributes['borderGradientButton'] );

$target   = $is_external ? '_blank' : '_self';
$rel      = [];
if ( $is_external ) {
	$rel[] = 'noopener';
}
if ( $nofollow ) {
	$rel[] = 'nofollow';
}
$rel_attr = ! empty( $rel ) ? implode( ' ', $rel ) : '';

$button_classes = [ 'shapeblock-button' ];
if ( ! empty( $button_type ) ) {
	$button_classes[] = 'shapeblock-button-' . $button_type;
}
if ( $show_gradient ) {
	$button_classes[] = 'shapeblock-button-gradient';
}
if ( $border_grad ) {
	$button_classes[] = '' !== $border_gradient ? 'shapeblock-button-has-border-gradient' : 'shapeblock-button-border-gradient';
}
if ( '' !== $bg_gradient_hover ) {
	$button_classes[] = 'shapeblock-button-has-hover-gradient';
}

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-button-block-wrap ' . $unique_id,
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-button-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-button-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-button-style';

$typo = function ( $obj ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	if ( ! empty( $obj['fontFamily'] ) ) $out['font-family'] = $obj['fontFamily'];
	if ( ! empty( $obj['fontSize'] ) ) $out['font-size'] = $H::ensure_unit( $obj['fontSize'] );
	if ( ! empty( $obj['fontWeight'] ) ) $out['font-weight'] = $obj['fontWeight'];
	if ( ! empty( $obj['fontStyle'] ) ) $out['font-style'] = $obj['fontStyle'];
	if ( ! empty( $obj['textTransform'] ) ) $out['text-transform'] = $obj['textTransform'];
	if ( ! empty( $obj['lineHeight'] ) ) $out['line-height'] = $obj['lineHeight'];
	if ( ! empty( $obj['letterSpacing'] ) ) $out['letter-spacing'] = $H::ensure_unit( $obj['letterSpacing'] );
	if ( ! empty( $obj['textDecoration'] ) ) $out['text-decoration'] = $obj['textDecoration'];
	return $out;
};

$dims = function ( $obj, $type ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	if ( 'padding' === $type ) {
		$map = [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ];
	} elseif ( 'margin' === $type ) {
		$map = [ 'top' => 'margin-top', 'right' => 'margin-right', 'bottom' => 'margin-bottom', 'left' => 'margin-left' ];
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
$button_styles = $typo( $attributes['buttonTypography'] ?? [] );
if ( ! empty( $attributes['buttonAlignment'] ) ) $button_styles['justify-content'] = $attributes['buttonAlignment'];
if ( ! empty( $attributes['minWidth'] ) ) $button_styles['min-width'] = $H::ensure_unit( $attributes['minWidth'] );
if ( ! empty( $attributes['textColor'] ) ) $button_styles['color'] = $attributes['textColor'];
if ( ! empty( $attributes['bgColor'] ) ) $button_styles['background-color'] = $attributes['bgColor'];
$button_styles = array_merge( $button_styles, $dims( $attributes['buttonBorderRadius'] ?? [], 'radius' ), $dims( $attributes['buttonPadding'] ?? [], 'padding' ), $dims( $attributes['buttonMargin'] ?? [], 'margin' ), $shadow( $attributes['buttonBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['buttonBorder'] ) ) $button_styles = array_merge( $button_styles, $H::border_to_css_props( $attributes['buttonBorder'] ) );

// Button (hover).
$button_hover = [];
if ( ! empty( $attributes['textColorHover'] ) ) $button_hover['color'] = $attributes['textColorHover'];
if ( ! empty( $attributes['bgColorHover'] ) ) $button_hover['background-color'] = $attributes['bgColorHover'];
if ( ! empty( $attributes['buttonBorderHover'] ) ) $button_hover = array_merge( $button_hover, $H::border_to_css_props( $attributes['buttonBorderHover'] ) );

// Gradient background. The normal one is the button's own background-image;
// the hover one sits in ::after and fades in (a gradient cannot transition).
if ( '' !== $bg_gradient ) {
	$button_styles['background-image'] = $bg_gradient;
	// A plain hover colour would otherwise stay hidden under the gradient.
	if ( '' === $bg_gradient_hover && ! empty( $attributes['bgColorHover'] ) ) {
		$button_hover['background-image'] = 'none';
	}
}
if ( '' !== $bg_gradient_hover ) {
	$button_styles['--shapeblock-button-hover-gradient'] = $bg_gradient_hover;
}
if ( $border_grad && '' !== $border_gradient ) {
	$button_styles['--shapeblock-button-border-gradient'] = $border_gradient;
	$bw = isset( $attributes['borderGradientWidth'] ) && '' !== $attributes['borderGradientWidth'] ? $attributes['borderGradientWidth'] : '2';
	$button_styles['--shapeblock-button-border-width'] = $H::ensure_unit( $bw );
}

// Gradient CSS variables.
$gradient_vars = [];
if ( $show_gradient ) {
	if ( ! empty( $attributes['gradient1'] ) ) $gradient_vars['--shapeblock-gradient-1'] = $attributes['gradient1'];
	if ( ! empty( $attributes['gradient2'] ) ) $gradient_vars['--shapeblock-gradient-2'] = $attributes['gradient2'];
	if ( ! empty( $attributes['gradient3'] ) ) $gradient_vars['--shapeblock-gradient-3'] = $attributes['gradient3'];
}
$border_gradient_vars = [];
if ( $border_grad && '' === $border_gradient ) {
	if ( ! empty( $attributes['borderGradientColor1'] ) ) $border_gradient_vars['--shapeblock-border-gradient-1'] = $attributes['borderGradientColor1'];
	if ( ! empty( $attributes['borderGradientColor2'] ) ) $border_gradient_vars['--shapeblock-border-gradient-2'] = $attributes['borderGradientColor2'];
}

// Icon spacing.
$icon_before = [];
$icon_after  = [];
if ( isset( $attributes['iconSpacing'] ) && '' !== $attributes['iconSpacing'] ) {
	$sp = $H::ensure_unit( $attributes['iconSpacing'] );
	$icon_before = [ 'margin-right' => $sp ];
	$icon_after  = [ 'margin-left' => $sp, 'margin-right' => '0' ];
}

// Icon (normal).
$icon_color_styles = [];
if ( ! empty( $attributes['iconColor'] ) ) $icon_color_styles['color'] = $attributes['iconColor'];
$icon_fill_styles = [];
if ( ! empty( $attributes['iconColor'] ) ) $icon_fill_styles['fill'] = $attributes['iconColor'];

$icon_box_styles = [];
if ( ! empty( $attributes['iconBg'] ) ) $icon_box_styles['background-color'] = $attributes['iconBg'];
if ( ! empty( $attributes['iconBoxWidth'] ) ) $icon_box_styles['width'] = $H::ensure_unit( $attributes['iconBoxWidth'] );
if ( ! empty( $attributes['iconBoxHeight'] ) ) $icon_box_styles['height'] = $H::ensure_unit( $attributes['iconBoxHeight'] );
$icon_box_styles = array_merge( $icon_box_styles, $dims( $attributes['iconBoxBorderRadius'] ?? [], 'radius' ) );

$icon_i_styles   = [];
$icon_svg_styles = [];
if ( ! empty( $attributes['iconSize'] ) ) {
	$is = $H::ensure_unit( $attributes['iconSize'] );
	$icon_i_styles['font-size'] = $is;
	$icon_svg_styles['width']   = $is;
	$icon_svg_styles['height']  = $is;
}
if ( isset( $attributes['iconRotation'] ) && '' !== $attributes['iconRotation'] ) {
	$rot = $attributes['iconRotation'] . 'deg';
	$icon_i_styles['transform']   = 'rotate(' . $rot . ')';
	$icon_svg_styles['transform'] = 'rotate(' . $rot . ')';
}

// Icon (hover).
$icon_hover_color = [];
if ( ! empty( $attributes['iconColorHover'] ) ) $icon_hover_color['color'] = $attributes['iconColorHover'];
$icon_hover_fill = [];
if ( ! empty( $attributes['iconColorHover'] ) ) $icon_hover_fill['fill'] = $attributes['iconColorHover'];
$icon_hover_bg = [];
if ( ! empty( $attributes['iconBgHover'] ) ) $icon_hover_bg['background-color'] = $attributes['iconBgHover'];
$icon_hover_rot = [];
if ( isset( $attributes['iconRotationHover'] ) && '' !== $attributes['iconRotationHover'] ) {
	$icon_hover_rot['transform'] = 'rotate(' . $attributes['iconRotationHover'] . 'deg)';
}

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	$btn = $typo( $attributes[ 'buttonTypography' . $suffix ] ?? [] );
	if ( ! empty( $attributes[ 'buttonAlignment' . $suffix ] ) ) $btn['justify-content'] = $attributes[ 'buttonAlignment' . $suffix ];
	if ( isset( $attributes[ 'minWidth' . $suffix ] ) && '' !== $attributes[ 'minWidth' . $suffix ] ) $btn['min-width'] = $H::ensure_unit( $attributes[ 'minWidth' . $suffix ] );
	$btn = array_merge( $btn, $dims( $attributes[ 'buttonPadding' . $suffix ] ?? [], 'padding' ), $dims( $attributes[ 'buttonMargin' . $suffix ] ?? [], 'margin' ) );

	$icon_i   = [];
	$icon_svg = [];
	if ( isset( $attributes[ 'iconSize' . $suffix ] ) && '' !== $attributes[ 'iconSize' . $suffix ] ) {
		$is = $H::ensure_unit( $attributes[ 'iconSize' . $suffix ] );
		$icon_i['font-size'] = $is;
		$icon_svg['width']   = $is;
		$icon_svg['height']  = $is;
	}

	$box = [];
	if ( isset( $attributes[ 'iconBoxWidth' . $suffix ] ) && '' !== $attributes[ 'iconBoxWidth' . $suffix ] ) $box['width'] = $H::ensure_unit( $attributes[ 'iconBoxWidth' . $suffix ] );
	if ( isset( $attributes[ 'iconBoxHeight' . $suffix ] ) && '' !== $attributes[ 'iconBoxHeight' . $suffix ] ) $box['height'] = $H::ensure_unit( $attributes[ 'iconBoxHeight' . $suffix ] );

	$before = $box;
	$after  = $box;
	if ( isset( $attributes[ 'iconSpacing' . $suffix ] ) && '' !== $attributes[ 'iconSpacing' . $suffix ] ) {
		$sp = $H::ensure_unit( $attributes[ 'iconSpacing' . $suffix ] );
		$before['margin-right'] = $sp;
		$after['margin-left']   = $sp;
		$after['margin-right']  = '0';
	}

	return [
		'.shapeblock-button'                           => $btn,
		'.shapeblock-button i'                         => $icon_i,
		'.shapeblock-button svg'                       => $icon_svg,
		'.shapeblock-button .shapeblock-button-icon-before' => $before,
		'.shapeblock-button .shapeblock-button-icon-after'  => $after,
	];
};
$dev_data     = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css     = '';

// Button position in its row: text-align on the wrapper (the button is inline-flex).
$position_data = [];
foreach ( [ '' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$pos = $attributes[ 'buttonPosition' . $suffix ] ?? '';
	if ( in_array( $pos, [ 'left', 'center', 'right' ], true ) ) {
		$position_data[ $device_key ] = [ 'text-align' => $pos ];
	}
}
if ( ! empty( $position_data ) ) {
	$resp_css .= $H::generate_responsive_css( $selector, $position_data );
}
foreach ( [ '.shapeblock-button', '.shapeblock-button i', '.shapeblock-button svg', '.shapeblock-button .shapeblock-button-icon-before', '.shapeblock-button .shapeblock-button-icon-after' ] as $sub_sel ) {
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
	'.shapeblock-button'                                    => $H::get_inline_styles( $button_styles ),
	'.shapeblock-button:hover'                              => $H::get_inline_styles( $button_hover ),
	'.shapeblock-button-gradient'                           => $H::get_inline_styles( $gradient_vars ),
	'.shapeblock-button-border-gradient'                    => $H::get_inline_styles( $border_gradient_vars ),
	'.shapeblock-button .shapeblock-button-icon-before'          => $H::get_inline_styles( array_merge( $icon_before, $icon_box_styles ) ),
	'.shapeblock-button .shapeblock-button-icon-after'           => $H::get_inline_styles( array_merge( $icon_after, $icon_box_styles ) ),
	'.shapeblock-button i'                                  => $H::get_inline_styles( array_merge( $icon_color_styles, $icon_i_styles ) ),
	'.shapeblock-button svg'                                => $H::get_inline_styles( array_merge( $icon_fill_styles, $icon_svg_styles ) ),
	'.shapeblock-button:hover i'                            => $H::get_inline_styles( array_merge( $icon_hover_color, $icon_hover_rot ) ),
	'.shapeblock-button:hover svg'                          => $H::get_inline_styles( array_merge( $icon_hover_fill, $icon_hover_rot ) ),
	'.shapeblock-button:hover .shapeblock-button-icon-before, ' . $selector . ' .shapeblock-button:hover .shapeblock-button-icon-after' => $H::get_inline_styles( $icon_hover_bg ),
] );

$icon_html = ( ! empty( $icon ) && 'none' !== $icon ) ? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : '';
// Only the icon font class markup above is ever put in this string, so a single-tag allow-list is enough.
$icon_allowed_html = array(
	'i' => array(
		'class'       => true,
		'aria-hidden' => true,
	),
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<a href="<?php echo esc_url( $url ); ?>" class="<?php echo esc_attr( implode( ' ', $button_classes ) ); ?>" target="<?php echo esc_attr( $target ); ?>"<?php echo $rel_attr ? ' rel="' . esc_attr( $rel_attr ) . '"' : ''; ?>>
		<?php if ( $icon_html && 'before' === $icon_position ) : ?>
			<span class="shapeblock-button-icon-before"><?php echo wp_kses( $icon_html, $icon_allowed_html ); ?></span>
		<?php endif; ?>
		<span class="shapeblock-button-text"><?php echo esc_html( $text ); ?></span>
		<?php if ( $icon_html && 'after' === $icon_position ) : ?>
			<span class="shapeblock-button-icon-after"><?php echo wp_kses( $icon_html, $icon_allowed_html ); ?></span>
		<?php endif; ?>
	</a>
</div>
<?php } )( $attributes, $content, $block );
