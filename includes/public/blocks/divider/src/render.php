<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Divider block.
 *
 * The line is a plain element painted with the line colour (or gradient); its
 * style - dashes, dots, a double line, a wave, a zigzag or slashes - is a CSS
 * mask over it, so a gradient follows every style. The wave, zigzag and
 * slashes masks are small SVG tiles built here for the chosen weight and size,
 * once per device.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : '';
if ( '' === $unique_id ) {
	$unique_id = 'shapeblock-divider-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
}

$str  = function ( $key, $fallback = '' ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : $fallback;
};
$pick = function ( $key, $allowed, $fallback ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && in_array( $attributes[ $key ], $allowed, true ) ? $attributes[ $key ] : $fallback;
};
// A number setting for a device, falling back to the larger devices, then to $default.
$number = function ( $key, $suffix, $default ) use ( $attributes ) {
	$chain = 'Mobile' === $suffix ? array( 'Mobile', 'Tablet', '' ) : ( 'Tablet' === $suffix ? array( 'Tablet', '' ) : array( '' ) );
	foreach ( $chain as $s ) {
		if ( isset( $attributes[ $key . $s ] ) && is_numeric( $attributes[ $key . $s ] ) ) {
			return max( 0, (float) $attributes[ $key . $s ] );
		}
	}
	return $default;
};
$has = function ( $key ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] );
};

$style    = $pick( 'dividerStyle', array( 'solid', 'double', 'dashed', 'dotted', 'wave', 'zigzag', 'slashes' ), 'solid' );
$element  = $pick( 'elementType', array( 'none', 'text', 'icon' ), 'none' );
$position = $pick( 'elementPosition', array( 'start', 'center', 'end' ), 'center' );
$text_tag = $pick( 'textTag', array( 'span', 'p', 'div', 'h2', 'h3', 'h4', 'h5', 'h6' ), 'span' );
$icon_view = $pick( 'iconView', array( 'default', 'stacked', 'framed' ), 'default' );
$text     = $str( 'text' );
$icon     = trim( $str( 'icon' ) );

if ( 'text' === $element && '' === trim( wp_strip_all_tags( $text ) ) ) {
	$element = 'none';
}
if ( 'icon' === $element && ( '' === $icon || 'none' === $icon ) ) {
	$element = 'none';
}

$wrap_classes = array(
	'shapeblock-block',
	'shapeblock-divider-block-wrap',
	$unique_id,
	'shapeblock-divider',
	'shapeblock-divider--' . $style,
);
if ( 'none' !== $element ) {
	$wrap_classes[] = 'shapeblock-divider--has-element';
	$wrap_classes[] = 'shapeblock-divider--element-' . $position;
}
$wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );

// ---------------------------------------------------------------------------
// Geometry for one device: the line's height and, for the drawn styles, its mask.
// ---------------------------------------------------------------------------
$geometry = function ( $suffix ) use ( $style, $number ) {
	$weight = $number( 'weight', $suffix, 1 );
	$weight = $weight > 0 ? $weight : 1;
	$out    = array();

	if ( 'double' === $style ) {
		$out['--sb-dv-h'] = round( $weight * 3, 2 ) . 'px';
	} elseif ( 'dashed' === $style || 'dotted' === $style ) {
		$size             = $number( 'patternSize', $suffix, 'dashed' === $style ? max( 12, $weight * 5 ) : max( 6, $weight * 2.5 ) );
		$out['--sb-dv-h'] = round( $weight, 2 ) . 'px';
		$out['--sb-dv-s'] = round( max( $size, $weight + 1 ), 2 ) . 'px';
	} elseif ( in_array( $style, array( 'wave', 'zigzag', 'slashes' ), true ) ) {
		$tile   = max( 6, $number( 'patternSize', $suffix, 20 ) );
		$height = round( max( $tile * 0.35, $weight * 2 ) + $weight, 2 );
		$half   = $weight / 2;
		$mid    = $height / 2;
		if ( 'wave' === $style ) {
			// A peak at the top edge and a trough at the bottom one, stroke included.
			$control = 2 * $half - $mid;
			$path    = 'M0 ' . $mid . ' Q' . ( $tile / 4 ) . ' ' . $control . ' ' . ( $tile / 2 ) . ' ' . $mid . ' T' . $tile . ' ' . $mid;
			$shape   = '<path d="' . $path . '" fill="none" stroke="#000" stroke-width="' . $weight . '"/>';
		} elseif ( 'zigzag' === $style ) {
			$points = '0,' . ( $height - $half ) . ' ' . ( $tile / 2 ) . ',' . $half . ' ' . $tile . ',' . ( $height - $half );
			$shape  = '<polyline points="' . $points . '" fill="none" stroke="#000" stroke-width="' . $weight . '" stroke-linejoin="miter" stroke-linecap="square"/>';
		} else {
			$shape = '<line x1="' . ( $tile * 0.25 ) . '" y1="' . $height . '" x2="' . ( $tile * 0.75 ) . '" y2="0" stroke="#000" stroke-width="' . $weight . '"/>';
		}
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $tile . '" height="' . $height . '" viewBox="0 0 ' . $tile . ' ' . $height . '" overflow="visible">' . $shape . '</svg>';

		$out['--sb-dv-h']    = $height . 'px';
		$out['--sb-dv-s']    = $tile . 'px';
		$out['--sb-dv-mask'] = 'url("data:image/svg+xml,' . rawurlencode( $svg ) . '")';
	} else {
		$out['--sb-dv-h'] = round( $weight, 2 ) . 'px';
	}

	return $out;
};

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-divider-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-divider-style';

$typo  = function ( $obj ) use ( $H ) {
	$out = array();
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	$map = array( 'fontFamily' => 'font-family', 'fontWeight' => 'font-weight', 'fontStyle' => 'font-style', 'textTransform' => 'text-transform', 'lineHeight' => 'line-height', 'textDecoration' => 'text-decoration' );
	foreach ( $map as $key => $prop ) {
		if ( ! empty( $obj[ $key ] ) ) {
			$out[ $prop ] = $obj[ $key ];
		}
	}
	foreach ( array( 'fontSize' => 'font-size', 'letterSpacing' => 'letter-spacing' ) as $key => $prop ) {
		if ( isset( $obj[ $key ] ) && '' !== $obj[ $key ] ) {
			$out[ $prop ] = $H::ensure_unit( $obj[ $key ] );
		}
	}
	return $out;
};
$dims  = function ( $obj ) use ( $H ) {
	$out = array();
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) {
			$out[ 'padding-' . $side ] = $H::ensure_unit( $obj[ $side ] );
		}
	}
	return $out;
};
$bg    = function ( $color_key, $gradient_key ) use ( $attributes, $H ) {
	if ( ! empty( $attributes[ $gradient_key ] ) && is_string( $attributes[ $gradient_key ] ) ) {
		return array( 'background' => $attributes[ $gradient_key ] );
	}
	if ( ! empty( $attributes[ $color_key ] ) && is_string( $attributes[ $color_key ] ) ) {
		return array( 'background' => $H::sanitize_css_color( $attributes[ $color_key ], '' ) );
	}
	return array();
};
$color = function ( $key, $prop = 'color' ) use ( $attributes, $H ) {
	return ! empty( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? array( $prop => $H::sanitize_css_color( $attributes[ $key ], '' ) ) : array();
};
$px    = function ( $key ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) ? max( 0, (float) $attributes[ $key ] ) . 'px' : '';
};
// Margins that place the line: left, centered or right.
$align = function ( $key ) use ( $attributes ) {
	$value = isset( $attributes[ $key ] ) ? $attributes[ $key ] : '';
	if ( 'left' === $value ) {
		return array( '--sb-dv-ml' => '0', '--sb-dv-mr' => 'auto' );
	}
	if ( 'right' === $value ) {
		return array( '--sb-dv-ml' => 'auto', '--sb-dv-mr' => '0' );
	}
	if ( 'center' === $value ) {
		return array( '--sb-dv-ml' => 'auto', '--sb-dv-mr' => 'auto' );
	}
	return array();
};

$css  = '';
$rule = function ( $sub, $decls ) use ( $selector, $H ) {
	$d = $H::get_inline_styles( $decls );
	return '' !== $d ? $selector . $sub . '{' . $d . '}' : '';
};

// Box: the device-independent parts plus the desktop values.
$vars = $geometry( '' );
if ( $has( 'width' ) ) {
	$vars['--sb-dv-w'] = min( 100, (float) $attributes['width'] ) . '%';
}
if ( '' !== $px( 'gap' ) ) {
	$vars['--sb-dv-gap'] = $px( 'gap' );
}
if ( '' !== $px( 'elementGap' ) ) {
	$vars['--sb-dv-el-gap'] = $px( 'elementGap' );
}
if ( '' !== $px( 'iconSize' ) ) {
	$vars['--sb-dv-icon'] = $px( 'iconSize' );
}
$css .= $rule( '', array_merge( $vars, $align( 'align' ) ) );

// The line: colour or gradient.
$css .= $rule( ' .shapeblock-divider__line', $bg( 'lineColor', 'lineGradient' ) );

// Text.
if ( 'text' === $element ) {
	$text_css = array_merge( $typo( $attributes['textTypography'] ?? array() ), $color( 'textColor' ), $bg( 'textBg', 'textBgGradient' ), $dims( $attributes['textPadding'] ?? array() ) );
	if ( '' !== $px( 'textRadius' ) ) {
		$text_css['border-radius'] = $px( 'textRadius' );
	}
	$css .= $rule( ' .shapeblock-divider__text', $text_css );
}

// Icon.
if ( 'icon' === $element ) {
	$icon_css = $color( 'iconColor' );
	if ( 'default' !== $icon_view ) {
		$icon_css = array_merge( $icon_css, $bg( 'iconBg', 'iconBgGradient' ) );
		if ( '' !== $px( 'iconPadding' ) ) {
			$icon_css['padding'] = $px( 'iconPadding' );
		}
		if ( '' !== $px( 'iconRadius' ) ) {
			$icon_css['border-radius'] = $px( 'iconRadius' );
		}
	}
	if ( 'framed' === $icon_view ) {
		if ( '' !== $px( 'iconBorderWidth' ) ) {
			$icon_css['border-width'] = $px( 'iconBorderWidth' );
		}
		$icon_css = array_merge( $icon_css, $color( 'iconBorderColor', 'border-color' ) );
	}
	$css .= $rule( ' .shapeblock-divider__icon', $icon_css );
}

// Tablet and mobile, after the desktop rules so they win at their widths.
foreach ( array( 'Tablet' => '1024px', 'Mobile' => '767px' ) as $suffix => $width ) {
	$v = array();
	// The line shape changes when this device has its own weight or size.
	if ( $has( 'weight' . $suffix ) || $has( 'patternSize' . $suffix ) ) {
		$v = $geometry( $suffix );
	}
	if ( $has( 'width' . $suffix ) ) {
		$v['--sb-dv-w'] = min( 100, (float) $attributes[ 'width' . $suffix ] ) . '%';
	}
	foreach ( array( 'gap' => '--sb-dv-gap', 'elementGap' => '--sb-dv-el-gap', 'iconSize' => '--sb-dv-icon' ) as $key => $var ) {
		if ( '' !== $px( $key . $suffix ) ) {
			$v[ $var ] = $px( $key . $suffix );
		}
	}
	$r = $rule( '', array_merge( $v, $align( 'align' . $suffix ) ) );
	if ( 'text' === $element ) {
		$r .= $rule( ' .shapeblock-divider__text', array_merge( $typo( $attributes[ 'textTypography' . $suffix ] ?? array() ), $dims( $attributes[ 'textPadding' . $suffix ] ?? array() ) ) );
	}
	if ( '' !== $r ) {
		$css .= '@media (max-width:' . $width . '){' . $r . '}';
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $css, array() );

// ---------------------------------------------------------------------------
// Markup.
// ---------------------------------------------------------------------------
$allowed_inline = $H::inline_allowed_html();
$show_before    = 'none' === $element || 'start' !== $position;
$show_after     = 'none' !== $element && 'end' !== $position;
?>
<div <?php echo wp_kses_post( $wrap_attr ); ?>>
	<div class="shapeblock-divider__inner" role="separator">
		<?php if ( $show_before ) : ?><span class="shapeblock-divider__line"></span><?php endif; ?>
		<?php if ( 'text' === $element ) : ?>
			<?php printf( '<%1$s class="shapeblock-divider__element shapeblock-divider__text">%2$s</%1$s>', tag_escape( $text_tag ), wp_kses( $text, $allowed_inline ) ); ?>
		<?php elseif ( 'icon' === $element ) : ?>
			<span class="shapeblock-divider__element shapeblock-divider__icon shapeblock-divider__icon--<?php echo esc_attr( $icon_view ); ?>"><i class="<?php echo esc_attr( 'shapeblock-icon ' . $icon ); ?>" aria-hidden="true"></i></span>
		<?php endif; ?>
		<?php if ( $show_after ) : ?><span class="shapeblock-divider__line"></span><?php endif; ?>
	</div>
</div>
<?php } )( $attributes, $content, $block );
