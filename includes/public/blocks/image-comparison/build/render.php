<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Image Comparison block.
 *
 * Mirrors the markup of the Elementor "Image Comparison" widget
 * (easy-elements/widgets/image-comparison). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-cmp-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$before = isset( $attributes['beforeImage'] ) && is_array( $attributes['beforeImage'] ) ? $attributes['beforeImage'] : [];
$after  = isset( $attributes['afterImage'] ) && is_array( $attributes['afterImage'] ) ? $attributes['afterImage'] : [];
$before_url = ! empty( $before['url'] ) ? $before['url'] : '';
$after_url  = ! empty( $after['url'] ) ? $after['url'] : '';

$orientation = ( isset( $attributes['orientation'] ) && 'vertical' === $attributes['orientation'] ) ? 'vertical' : 'horizontal';
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
if ( '' !== $u( 'height' ) ) $container['min-height'] = $u( 'height' );

$img = ( '' !== $u( 'height' ) ) ? [ 'height' => $u( 'height' ) ] : [];

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
] );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-comparison shapeblock-comparison-<?php echo esc_attr( $orientation ); ?>">
		<div class="shapeblock-comparison-container" data-offset="<?php echo esc_attr( $offset ); ?>" data-orientation="<?php echo esc_attr( $orientation ); ?>">
			<?php if ( '' !== $before_url ) : ?>
				<img class="shapeblock-comparison-before" src="<?php echo esc_url( $before_url ); ?>" alt="<?php echo esc_attr( $before['alt'] ?? __( 'Before', 'shapeblock' ) ); ?>">
			<?php endif; ?>
			<?php if ( '' !== $after_url ) : ?>
				<img class="shapeblock-comparison-after" src="<?php echo esc_url( $after_url ); ?>" alt="<?php echo esc_attr( $after['alt'] ?? __( 'After', 'shapeblock' ) ); ?>">
			<?php endif; ?>
			<div class="shapeblock-comparison-handle">
				<span class="shapeblock-comparison-left-arrow"></span>
				<span class="shapeblock-comparison-right-arrow"></span>
			</div>
		</div>
	</div>
</div>
