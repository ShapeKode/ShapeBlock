<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Contact Info block.
 *
 * Each row is one way to reach the business. Its type decides the link it
 * gets when no link is typed in: a phone number calls, an email opens the mail
 * app, an address opens Google Maps, a WhatsApp number opens a chat and a
 * website opens the site. A "text" row (opening times, say) has no link.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : '';
if ( '' === $unique_id ) {
	$unique_id = 'shapeblock-contact-info-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
}

$str  = function ( $key, $fallback = '' ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : $fallback;
};
$pick = function ( $key, $allowed, $fallback ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && in_array( $attributes[ $key ], $allowed, true ) ? $attributes[ $key ] : $fallback;
};

$items      = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();
$layout     = $pick( 'layout', array( 'list', 'grid', 'inline' ), 'list' );
$icon_pos   = $pick( 'iconPosition', array( 'left', 'top' ), 'left' );
$icon_view  = $pick( 'iconView', array( 'default', 'stacked', 'framed' ), 'stacked' );
$show_label = ! ( isset( $attributes['showLabel'] ) && false === $attributes['showLabel'] );
$divider    = ! empty( $attributes['divider'] ) && 'list' === $layout;
$types      = array( 'phone', 'email', 'address', 'whatsapp', 'website', 'text' );

// The link a row opens: the one typed in, or the one its type gives.
$link_for = function ( $type, $value, $link ) {
	$link = trim( (string) $link );
	if ( '' !== $link ) {
		return $link;
	}
	// Line breaks (a two-line address, say) become spaces.
	$plain = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( preg_replace( '/<br\s*\/?>|\R/i', ' ', (string) $value ) ) ) );
	if ( '' === $plain ) {
		return '';
	}
	switch ( $type ) {
		case 'phone':
			$digits = preg_replace( '/[^0-9+]/', '', $plain );
			return '' !== $digits ? 'tel:' . $digits : '';
		case 'whatsapp':
			$digits = preg_replace( '/[^0-9]/', '', $plain );
			return '' !== $digits ? 'https://wa.me/' . $digits : '';
		case 'email':
			$email = sanitize_email( $plain );
			return is_email( $email ) ? 'mailto:' . $email : '';
		case 'address':
			return 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $plain );
		case 'website':
			return preg_match( '#^https?://#i', $plain ) ? $plain : 'https://' . $plain;
	}
	return '';
};

$wrap_classes = array(
	'shapeblock-block',
	'shapeblock-contact-info-block-wrap',
	$unique_id,
	'shapeblock-ci',
	'shapeblock-ci--' . $layout,
	'shapeblock-ci--icon-' . $icon_pos,
);
if ( $divider ) {
	$wrap_classes[] = 'shapeblock-ci--divider';
}
if ( ! empty( $attributes['hoverLift'] ) ) {
	$wrap_classes[] = 'shapeblock-ci--lift';
}
$wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-contact-info-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-contact-info-style';

$typo   = function ( $obj ) use ( $H ) {
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
$dims   = function ( $obj ) use ( $H ) {
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
$bg     = function ( $color_key, $gradient_key ) use ( $attributes, $H ) {
	if ( ! empty( $attributes[ $gradient_key ] ) && is_string( $attributes[ $gradient_key ] ) ) {
		return array( 'background' => $attributes[ $gradient_key ] );
	}
	if ( ! empty( $attributes[ $color_key ] ) && is_string( $attributes[ $color_key ] ) ) {
		return array( 'background' => $H::sanitize_css_color( $attributes[ $color_key ], '' ) );
	}
	return array();
};
$color  = function ( $key, $prop = 'color' ) use ( $attributes, $H ) {
	return ! empty( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? array( $prop => $H::sanitize_css_color( $attributes[ $key ], '' ) ) : array();
};
$px     = function ( $key ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) ? max( 0, (float) $attributes[ $key ] ) . 'px' : '';
};
$shadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return array();
	}
	$c           = (string) ( $obj['c'] ?? '' );
	$transparent = in_array( str_replace( ' ', '', $c ), array( '', 'rgba(0,0,0,0)' ), true );
	if ( 0 === (int) ( $obj['x'] ?? 0 ) && 0 === (int) ( $obj['y'] ?? 0 ) && 0 === (int) ( $obj['b'] ?? 0 ) && 0 === (int) ( $obj['s'] ?? 0 ) && $transparent ) {
		return array();
	}
	return array( 'box-shadow' => $H::box_shadow_to_css( $obj ) );
};
// Variables for one device: columns, gaps, icon sizes and alignment.
$vars = function ( $suffix ) use ( $attributes, $px ) {
	$v = array();
	if ( isset( $attributes[ 'columns' . $suffix ] ) && is_numeric( $attributes[ 'columns' . $suffix ] ) ) {
		$v['--sb-ci-cols'] = (string) min( 6, max( 1, (int) $attributes[ 'columns' . $suffix ] ) );
	}
	foreach ( array( 'rowGap' => '--sb-ci-row-gap', 'columnGap' => '--sb-ci-col-gap', 'iconGap' => '--sb-ci-icon-gap', 'iconSize' => '--sb-ci-icon', 'iconBoxSize' => '--sb-ci-box' ) as $key => $var ) {
		if ( '' !== $px( $key . $suffix ) ) {
			$v[ $var ] = $px( $key . $suffix );
		}
	}
	$align = isset( $attributes[ 'align' . $suffix ] ) ? $attributes[ 'align' . $suffix ] : '';
	$flex  = array( 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' );
	if ( isset( $flex[ $align ] ) ) {
		$v['--sb-ci-justify'] = $flex[ $align ];
		$v['--sb-ci-text']    = $align;
	}
	return $v;
};

$css  = '';
$rule = function ( $sub, $decls ) use ( $selector, $H ) {
	$d = $H::get_inline_styles( $decls );
	return '' !== $d ? $selector . $sub . '{' . $d . '}' : '';
};

$root = $vars( '' );
if ( $divider ) {
	$root['--sb-ci-divider'] = '1px ' . $H::sanitize_css_border_style( $str( 'dividerStyle', 'solid' ) ) . ' ' . ( '' !== $str( 'dividerColor' ) ? $H::sanitize_css_color( $str( 'dividerColor' ), 'rgba(0,0,0,.1)' ) : 'rgba(0,0,0,.1)' );
}
$css .= $rule( '', $root );

// Each row.
$item = array_merge( $bg( 'itemBg', 'itemBgGradient' ), $dims( $attributes['itemPadding'] ?? array() ), $shadow( $attributes['itemShadow'] ?? array() ) );
if ( ! empty( $attributes['itemBorder'] ) ) {
	$item = array_merge( $item, $H::border_to_css_props( $attributes['itemBorder'] ) );
}
if ( '' !== $px( 'itemRadius' ) ) {
	$item['border-radius'] = $px( 'itemRadius' );
}
$css .= $rule( ' .shapeblock-ci__inner', $item );
$css .= $rule( ' .shapeblock-ci__inner:hover', array_merge( $color( 'itemBgHover', 'background' ), $color( 'itemBorderHover', 'border-color' ) ) );

// Icon.
$icon = $color( 'iconColor' );
// Stacked: a filled circle (iconBg is its fill). Framed: an outline (iconBg is its colour).
if ( 'stacked' === $icon_view ) {
	$icon = array_merge( $icon, $bg( 'iconBg', 'iconBgGradient' ) );
} elseif ( 'framed' === $icon_view ) {
	$icon = array_merge( $icon, $color( 'iconBg', 'border-color' ) );
}
if ( 'default' !== $icon_view && '' !== $px( 'iconRadius' ) ) {
	$icon['border-radius'] = $px( 'iconRadius' );
}
$css .= $rule( ' .shapeblock-ci__icon', $icon );
$css .= $rule( ' .shapeblock-ci__inner:hover .shapeblock-ci__icon', array_merge( $color( 'iconColorHover' ), 'stacked' === $icon_view ? $color( 'iconBgHover', 'background' ) : array() ) );

// Text.
$css .= $rule( ' .shapeblock-ci__label', array_merge( $typo( $attributes['labelTypography'] ?? array() ), $color( 'labelColor' ) ) );
$css .= $rule( ' .shapeblock-ci__value', array_merge( $typo( $attributes['valueTypography'] ?? array() ), $color( 'valueColor' ) ) );
$css .= $rule( ' a.shapeblock-ci__inner:hover .shapeblock-ci__value', $color( 'valueColorHover' ) );

// Tablet and mobile, after the desktop rules so they win at their widths.
foreach ( array( 'Tablet' => '1024px', 'Mobile' => '767px' ) as $suffix => $width ) {
	$r  = $rule( '', $vars( $suffix ) );
	$r .= $rule( ' .shapeblock-ci__inner', $dims( $attributes[ 'itemPadding' . $suffix ] ?? array() ) );
	$r .= $rule( ' .shapeblock-ci__label', $typo( $attributes[ 'labelTypography' . $suffix ] ?? array() ) );
	$r .= $rule( ' .shapeblock-ci__value', $typo( $attributes[ 'valueTypography' . $suffix ] ?? array() ) );
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
?>
<div <?php echo wp_kses_post( $wrap_attr ); ?>>
	<?php if ( empty( $items ) ) : ?>
		<p class="shapeblock-ci__empty"><?php esc_html_e( 'Add a row in the block settings.', 'shapeblock' ); ?></p>
	<?php else : ?>
	<ul class="shapeblock-ci__list">
		<?php
		foreach ( $items as $row ) :
			if ( ! is_array( $row ) ) {
				continue;
			}
			$type  = isset( $row['type'] ) && in_array( $row['type'], $types, true ) ? $row['type'] : 'text';
			$label = isset( $row['label'] ) && is_string( $row['label'] ) ? $row['label'] : '';
			$value = isset( $row['value'] ) && is_string( $row['value'] ) ? $row['value'] : '';
			$icon  = isset( $row['icon'] ) && is_string( $row['icon'] ) ? trim( $row['icon'] ) : '';
			$href  = $link_for( $type, $value, $row['link'] ?? '' );
			?>
			<li class="shapeblock-ci__item shapeblock-ci__item--<?php echo esc_attr( $type ); ?>">
				<?php if ( '' !== $href ) : ?>
				<a class="shapeblock-ci__inner" href="<?php echo esc_url( $href ); ?>"<?php if ( ! empty( $row['newTab'] ) ) : ?> target="_blank" rel="noopener"<?php endif; ?>>
				<?php else : ?>
				<div class="shapeblock-ci__inner">
				<?php endif; ?>
					<?php if ( '' !== $icon && 'none' !== $icon ) : ?>
						<span class="shapeblock-ci__icon shapeblock-ci__icon--<?php echo esc_attr( $icon_view ); ?>"><i class="<?php echo esc_attr( 'shapeblock-icon ' . $icon ); ?>" aria-hidden="true"></i></span>
					<?php endif; ?>
					<span class="shapeblock-ci__text">
						<?php if ( $show_label && '' !== trim( $label ) ) : ?>
							<span class="shapeblock-ci__label"><?php echo wp_kses( $label, $allowed_inline ); ?></span>
						<?php endif; ?>
						<span class="shapeblock-ci__value"><?php echo wp_kses( nl2br( $value ), $allowed_inline ); ?></span>
					</span>
				<?php if ( '' !== $href ) : ?></a><?php else : ?></div><?php endif; ?>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php endif; ?>
</div>
<?php } )( $attributes, $content, $block );
