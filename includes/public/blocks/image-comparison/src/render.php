<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Image Comparison block.
 *
 * Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-cmp-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$before = isset( $attributes['beforeImage'] ) && is_array( $attributes['beforeImage'] ) ? $attributes['beforeImage'] : [];
$after  = isset( $attributes['afterImage'] ) && is_array( $attributes['afterImage'] ) ? $attributes['afterImage'] : [];
$before_url = ! empty( $before['url'] ) ? $before['url'] : '';
$after_url  = ! empty( $after['url'] ) ? $after['url'] : '';

$orientation = isset( $attributes['orientation'] ) && in_array( $attributes['orientation'], [ 'vertical', 'diagonal' ], true ) ? $attributes['orientation'] : 'horizontal';
$offset      = isset( $attributes['offset'] ) ? max( 0, min( 100, (int) $attributes['offset'] ) ) / 100 : 0.5;

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-image-comparison-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-image-comparison-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( '' === $before_url && '' === $after_url ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please select before and after images.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-image-comparison-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-image-comparison-style';

$dims = function ( $obj ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
	$map = [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) $out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
	}
	return $out;
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

$container = $dims( $attributes['containerRadius'] ?? [] );
if ( ! empty( $attributes['containerBorder'] ) ) {
	$container = array_merge( $container, $H::border_to_css_props( $attributes['containerBorder'] ) );
}
$shadow = $attributes['containerShadow'] ?? [];
if ( is_array( $shadow ) && ( ! empty( $shadow['x'] ) || ! empty( $shadow['y'] ) || ! empty( $shadow['b'] ) || ! empty( $shadow['s'] ) ) ) {
	$container['box-shadow'] = $H::box_shadow_to_css( $shadow );
}
if ( '' !== $u( 'height' ) ) $container['min-height'] = $u( 'height' );

$img = ( '' !== $u( 'height' ) ) ? [ 'height' => $u( 'height' ) ] : [];

// Handle: its style, its icon, and its colours and sizes as the custom
// properties style.scss draws it from.
$handle_style = isset( $attributes['handleStyle'] ) && in_array( $attributes['handleStyle'], [ 'circle', 'filled', 'square', 'pill', 'glass', 'line' ], true ) ? $attributes['handleStyle'] : 'circle';
$handle_icon  = isset( $attributes['handleIcon'] ) && in_array( $attributes['handleIcon'], [ 'triangles', 'chevrons', 'arrows', 'none' ], true ) ? $attributes['handleIcon'] : 'triangles';
$handle_vars  = [];
foreach ( [ 'handleColor' => '--shapeblock-cmp-color', 'handleBg' => '--shapeblock-cmp-bg-set', 'handleIconColor' => '--shapeblock-cmp-icon' ] as $key => $prop ) {
	$value = isset( $attributes[ $key ] ) ? $H::sanitize_css_color( (string) $attributes[ $key ], '' ) : '';
	if ( '' !== $value ) {
		$handle_vars[ $prop ] = $value;
	}
}
// A knob gradient wins over the flat fill; the property is only ever read by
// background rules. get_inline_styles() sanitises the value.
if ( ! empty( $attributes['handleBgGradient'] ) ) {
	$handle_vars['--shapeblock-cmp-bg-set'] = (string) $attributes['handleBgGradient'];
}
if ( '' !== $u( 'handleSize' ) ) $handle_vars['--shapeblock-cmp-size'] = $u( 'handleSize' );
if ( '' !== $u( 'handleLine' ) ) $handle_vars['--shapeblock-cmp-line'] = $u( 'handleLine' );
// Diagonal is dragged sideways like horizontal and shares its handle styles;
// only the dividing line runs corner to corner.
$cmp_classes = 'shapeblock-comparison shapeblock-comparison-' . ( 'diagonal' === $orientation ? 'horizontal shapeblock-comparison-diagonal' : $orientation ) . ' is-handle-' . $handle_style . ( isset( $attributes['handleShadow'] ) && false === $attributes['handleShadow'] ? ' no-shadow' : '' );

// Before / After labels: each sits over its own image and is cut with it, so a
// label never floats over the other picture.
$labels_on    = ! empty( $attributes['showLabels'] );
$before_label = $labels_on ? trim( (string) ( $attributes['beforeLabel'] ?? '' ) ) : '';
$after_label  = $labels_on ? trim( (string) ( $attributes['afterLabel'] ?? '' ) ) : '';
if ( $labels_on ) {
	$label_pos    = isset( $attributes['labelPosition'] ) && in_array( $attributes['labelPosition'], [ 'start', 'center', 'end' ], true ) ? $attributes['labelPosition'] : 'center';
	// Diagonal labels always sit in the corners, so they take no position.
	$cmp_classes .= ' has-labels' . ( 'diagonal' === $orientation ? '' : ' labels-' . $label_pos ) . ( ! empty( $attributes['labelsOnHover'] ) ? ' labels-on-hover' : '' );
	if ( '' !== $u( 'labelOffset' ) ) {
		$handle_vars['--shapeblock-cmp-label-offset'] = $u( 'labelOffset' );
	}
}
$label_css = $dims( $attributes['labelRadius'] ?? [] );
foreach ( [ 'labelColor' => 'color', 'labelBg' => 'background' ] as $key => $prop ) {
	$value = isset( $attributes[ $key ] ) ? $H::sanitize_css_color( (string) $attributes[ $key ], '' ) : '';
	if ( '' !== $value ) {
		$label_css[ $prop ] = $value;
	}
}
if ( ! empty( $attributes['labelBgGradient'] ) ) {
	$label_css['background'] = (string) $attributes['labelBgGradient'];
}
$label_pad = $attributes['labelPadding'] ?? [];
if ( is_array( $label_pad ) ) {
	foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
		if ( isset( $label_pad[ $side ] ) && '' !== $label_pad[ $side ] ) {
			$label_css[ 'padding-' . $side ] = $H::ensure_unit( $label_pad[ $side ] );
		}
	}
}
$label_typo = $attributes['labelTypography'] ?? [];
if ( is_array( $label_typo ) ) {
	foreach ( [ 'fontFamily' => 'font-family', 'fontSize' => 'font-size', 'fontWeight' => 'font-weight', 'fontStyle' => 'font-style', 'lineHeight' => 'line-height', 'textTransform' => 'text-transform', 'letterSpacing' => 'letter-spacing', 'textDecoration' => 'text-decoration' ] as $key => $prop ) {
		if ( ! empty( $label_typo[ $key ] ) ) {
			$label_css[ $prop ] = in_array( $key, [ 'fontSize', 'letterSpacing' ], true ) ? $H::ensure_unit( $label_typo[ $key ] ) : $label_typo[ $key ];
		}
	}
}

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $H ) {
	$key = 'height' . $suffix;
	$val = ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	return [
		'.shapeblock-comparison-container'     => ( '' !== $val ) ? [ 'min-height' => $val ] : [],
		'.shapeblock-comparison-container img' => ( '' !== $val ) ? [ 'height' => $val ] : [],
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-comparison-container', '.shapeblock-comparison-container img' ] as $sub_sel ) {
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
	'.shapeblock-comparison-container'     => $H::get_inline_styles( $container ),
	'.shapeblock-comparison-container img' => $H::get_inline_styles( $img ),
	'.shapeblock-comparison'               => $H::get_inline_styles( $handle_vars ),
	'.shapeblock-comparison-label'         => $H::get_inline_styles( $label_css ),
] );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="<?php echo esc_attr( $cmp_classes ); ?>">
		<div class="shapeblock-comparison-container" data-offset="<?php echo esc_attr( $offset ); ?>" data-orientation="<?php echo esc_attr( $orientation ); ?>">
			<?php if ( '' !== $before_url ) : ?>
				<img class="shapeblock-comparison-before" src="<?php echo esc_url( $before_url ); ?>" alt="<?php echo esc_attr( $before['alt'] ?? __( 'Before', 'shapeblock' ) ); ?>">
			<?php endif; ?>
			<?php if ( '' !== $after_url ) : ?>
				<img class="shapeblock-comparison-after" src="<?php echo esc_url( $after_url ); ?>" alt="<?php echo esc_attr( $after['alt'] ?? __( 'After', 'shapeblock' ) ); ?>">
			<?php endif; ?>
			<?php if ( '' !== $before_label ) : ?>
				<div class="shapeblock-comparison-overlay is-before" aria-hidden="true"><span class="shapeblock-comparison-label"><?php echo esc_html( $before_label ); ?></span></div>
			<?php endif; ?>
			<?php if ( '' !== $after_label ) : ?>
				<div class="shapeblock-comparison-overlay is-after" aria-hidden="true"><span class="shapeblock-comparison-label"><?php echo esc_html( $after_label ); ?></span></div>
			<?php endif; ?>
			<?php if ( 'diagonal' === $orientation ) : ?>
				<div class="shapeblock-comparison-divider" aria-hidden="true"></div>
			<?php endif; ?>
			<div class="shapeblock-comparison-handle" role="slider" tabindex="0" aria-label="<?php esc_attr_e( 'Drag to compare the images', 'shapeblock' ); ?>" aria-orientation="<?php echo esc_attr( 'vertical' === $orientation ? 'vertical' : 'horizontal' ); ?>" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?php echo esc_attr( (string) round( $offset * 100 ) ); ?>">
				<?php if ( 'triangles' === $handle_icon ) : ?>
					<span class="shapeblock-comparison-icon" aria-hidden="true">
						<span class="shapeblock-comparison-left-arrow"></span>
						<span class="shapeblock-comparison-right-arrow"></span>
					</span>
				<?php elseif ( 'chevrons' === $handle_icon ) : ?>
					<span class="shapeblock-comparison-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M9 5 4 12l5 7M15 5l5 7-5 7"/></svg></span>
				<?php elseif ( 'arrows' === $handle_icon ) : ?>
					<span class="shapeblock-comparison-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg></span>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>
<?php } )( $attributes, $content, $block );
