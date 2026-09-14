<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Progress Bar block.
 *
 * Mirrors the markup of the Elementor "Progress Bar" widget
 * (easy-elements/widgets/progress). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-pb-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$style   = ( isset( $attributes['selectStyle'] ) && 'style2' === $attributes['selectStyle'] ) ? 'style2' : 'style1';
$title   = isset( $attributes['title'] ) ? $attributes['title'] : '';
$percent = isset( $attributes['percent'] ) ? max( 0, min( 100, (int) $attributes['percent'] ) ) : 0;

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-progress-bar-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-progress-bar-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-progress-bar-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-progress-style';

$typo = function ( $obj ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
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
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

$track = [];
$fill  = [];
if ( 'style2' === $style ) {
	$bg = ! empty( $attributes['style2BgGradient'] ) ? $attributes['style2BgGradient'] : ( ! empty( $attributes['style2BgColor'] ) ? $attributes['style2BgColor'] : '' );
	if ( '' !== $bg ) $track['background'] = $bg;
} else {
	if ( ! empty( $attributes['progressColor'] ) ) $track['background'] = $attributes['progressColor'];
	if ( ! empty( $attributes['progressBarColor'] ) ) $fill['background'] = $attributes['progressBarColor'];
}
if ( '' !== $u( 'progressHeight' ) ) $track['height'] = $u( 'progressHeight' );
if ( '' !== $u( 'progressRadius' ) ) $track['border-radius'] = $u( 'progressRadius' );

$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];

$percent_styles = $typo( $attributes['percentTypography'] ?? [] );
if ( ! empty( $attributes['percentColor'] ) ) $percent_styles['color'] = $attributes['percentColor'];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $H ) {
	$track = [];
	if ( isset( $attributes[ 'progressHeight' . $suffix ] ) && '' !== $attributes[ 'progressHeight' . $suffix ] ) {
		$track['height'] = $H::ensure_unit( $attributes[ 'progressHeight' . $suffix ] );
	}
	return [
		'.shapeblock-progress'   => $track,
		'.shapeblock-pb-title'   => $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ),
		'.shapeblock-pb-percent' => $typo( $attributes[ 'percentTypography' . $suffix ] ?? [] ),
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-progress', '.shapeblock-pb-title', '.shapeblock-pb-percent' ] as $sub_sel ) {
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
	'.shapeblock-progress'      => $H::get_inline_styles( $track ),
	'.shapeblock-progress-fill' => $H::get_inline_styles( $fill ),
	'.shapeblock-pb-title'      => $H::get_inline_styles( $title_styles ),
	'.shapeblock-pb-percent'    => $H::get_inline_styles( $percent_styles ),
] );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-progress-bar shapeblock-progress-<?php echo esc_attr( $style ); ?>">
		<?php if ( 'style2' === $style ) : ?>
			<div class="shapeblock-progress-style2">
				<?php if ( '' !== $title ) : ?>
					<p class="shapeblock-pb-title"><?php echo wp_kses_post( $title ); ?></p>
				<?php endif; ?>
				<div class="shapeblock-progress">
					<div class="shapeblock-progress-fill" role="progressbar" style="width: <?php echo esc_attr( $percent ); ?>%" data-width="<?php echo esc_attr( $percent ); ?>" aria-valuenow="<?php echo esc_attr( $percent ); ?>" aria-valuemin="0" aria-valuemax="100"></div>
					<span class="shapeblock-pb-percent"><?php echo esc_html( $percent ); ?>%</span>
				</div>
			</div>
		<?php else : ?>
			<div class="shapeblock-progress-top">
				<?php if ( '' !== $title ) : ?>
					<p class="shapeblock-pb-title"><?php echo wp_kses_post( $title ); ?></p>
				<?php endif; ?>
				<span class="shapeblock-pb-percent"><?php echo esc_html( $percent ); ?>%</span>
			</div>
			<div class="shapeblock-progress">
				<div class="shapeblock-progress-fill" role="progressbar" style="width: <?php echo esc_attr( $percent ); ?>%" data-width="<?php echo esc_attr( $percent ); ?>" aria-valuenow="<?php echo esc_attr( $percent ); ?>" aria-valuemin="0" aria-valuemax="100"></div>
			</div>
		<?php endif; ?>
	</div>
</div>
