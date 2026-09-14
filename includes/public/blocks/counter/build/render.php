<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Counter block.
 *
 * Mirrors the markup of the Elementor "Counter" widget
 * (easy-elements/widgets/counter). Element classes use the "shapeblock-" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-cnt-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$number    = isset( $attributes['number'] ) && '' !== $attributes['number'] ? $attributes['number'] : '0';
$start     = isset( $attributes['startNumber'] ) && '' !== $attributes['startNumber'] ? $attributes['startNumber'] : '0';
$prefix    = isset( $attributes['prefix'] ) ? $attributes['prefix'] : '';
$suffix    = isset( $attributes['suffix'] ) ? $attributes['suffix'] : '';
$title     = isset( $attributes['title'] ) ? $attributes['title'] : '';
$allowed   = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'span';
$duration  = isset( $attributes['duration'] ) && '' !== $attributes['duration'] ? (int) $attributes['duration'] : 1000;
$format    = isset( $attributes['format'] ) ? $attributes['format'] : 'default';
$animation = ( isset( $attributes['animationType'] ) && 'odometer' === $attributes['animationType'] ) ? 'odometer' : 'counter';
$icon_on   = ! empty( $attributes['iconEnable'] );
$icon      = isset( $attributes['icon'] ) ? $attributes['icon'] : '';
$title_pos = isset( $attributes['titlePosition'] ) ? $attributes['titlePosition'] : 'bottom';
$icon_pos  = isset( $attributes['iconPosition'] ) ? $attributes['iconPosition'] : 'top';

$wrap_classes = [ 'shapeblock-block', 'shapeblock-cnt-block-wrap', $unique_id ];
if ( '' !== $title ) { $wrap_classes[] = 'shapeblock-cnt-title-pos-' . $title_pos; }
if ( $icon_on ) { $wrap_classes[] = 'shapeblock-cnt-icon-pos-' . $icon_pos; }

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-cnt-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-counter-style';

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
$dims = function ( $obj, $type ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
	$map = 'padding' === $type
		? [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ]
		: [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
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
$tshadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) return [];
	$x = $obj['x'] ?? ''; $y = $obj['y'] ?? ''; $blur = $obj['blur'] ?? ''; $c = $obj['color'] ?? '';
	if ( '' === $x && '' === $y && '' === $blur && '' === $c ) return [];
	$val = $H::ensure_unit( '' === $x ? 0 : $x ) . ' ' . $H::ensure_unit( '' === $y ? 0 : $y ) . ' ' . $H::ensure_unit( '' === $blur ? 0 : $blur ) . ' ' . ( '' !== $c ? $c : 'rgba(0,0,0,0.3)' );
	return [ 'text-shadow' => $val ];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Wrap (align/justify/gap).
$wrap = [];
if ( ! empty( $attributes['wrapAlign'] ) ) $wrap['align-items'] = $attributes['wrapAlign'];
if ( ! empty( $attributes['wrapJustify'] ) ) $wrap['justify-content'] = $attributes['wrapJustify'];
if ( $icon_on && '' !== $u( 'iconGap' ) ) $wrap['gap'] = $u( 'iconGap' );

$content = [];
if ( '' !== $u( 'contentGap' ) ) $content['gap'] = $u( 'contentGap' );
if ( ! empty( $attributes['contentVerticalAlign'] ) ) $content['align-items'] = $attributes['contentVerticalAlign'];

$number_wrap = [];
if ( '' !== $u( 'subPreGap' ) ) $number_wrap['gap'] = $u( 'subPreGap' );

// Number.
$number_styles = $typo( $attributes['numberTypography'] ?? [] );
if ( ! empty( $attributes['numberColor'] ) ) $number_styles['color'] = $attributes['numberColor'];
if ( '' !== $u( 'numberStrokeWidth' ) ) $number_styles['-webkit-text-stroke-width'] = $u( 'numberStrokeWidth' );
if ( ! empty( $attributes['numberStrokeColor'] ) ) $number_styles['-webkit-text-stroke-color'] = $attributes['numberStrokeColor'];
$number_styles = array_merge( $number_styles, $number_wrap, $tshadow( $attributes['numberTextShadow'] ?? [] ) );

// Prefix / suffix.
$prefix_styles = $typo( $attributes['prefixTypography'] ?? [] );
if ( ! empty( $attributes['prefixColor'] ) ) $prefix_styles['color'] = $attributes['prefixColor'];
$prefix_styles = array_merge( $prefix_styles, $tshadow( $attributes['prefixTextShadow'] ?? [] ) );
$suffix_styles = $typo( $attributes['suffixTypography'] ?? [] );
if ( ! empty( $attributes['suffixColor'] ) ) $suffix_styles['color'] = $attributes['suffixColor'];
$suffix_styles = array_merge( $suffix_styles, $tshadow( $attributes['suffixTextShadow'] ?? [] ) );

// Title.
$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];
if ( ! empty( $attributes['titleAlign'] ) ) $title_styles['text-align'] = $attributes['titleAlign'];
$title_styles = array_merge( $title_styles, $tshadow( $attributes['titleTextShadow'] ?? [] ) );

// Icon.
$icon_box = [];
if ( ! empty( $attributes['iconBgColor'] ) ) $icon_box['background'] = $attributes['iconBgColor'];
if ( '' !== $u( 'iconBoxSize' ) ) { $icon_box['width'] = $u( 'iconBoxSize' ) . ' !important'; $icon_box['height'] = $u( 'iconBoxSize' ) . ' !important'; }
$icon_box = array_merge( $icon_box, $dims( $attributes['iconBorderRadius'] ?? [], 'radius' ), $dims( $attributes['iconPadding'] ?? [], 'padding' ), $shadow( $attributes['iconBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['iconBorder'] ) ) $icon_box = array_merge( $icon_box, $H::border_to_css_props( $attributes['iconBorder'] ) );
$icon_color = ! empty( $attributes['iconColor'] ) ? [ 'color' => $attributes['iconColor'], 'fill' => $attributes['iconColor'] ] : [];
$icon_svg = ( '' !== $u( 'iconSize' ) ) ? [ 'width' => $u( 'iconSize' ) . ' !important', 'height' => $u( 'iconSize' ) . ' !important' ] : [];
$icon_i = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides for layout controls. The desktop CSS
// above is unchanged; these rules are emitted only when the matching per-device
// attribute is set, so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $u, $icon_on ) {
	$wrap = [];
	if ( ! empty( $attributes[ 'wrapAlign' . $suffix ] ) ) $wrap['align-items'] = $attributes[ 'wrapAlign' . $suffix ];
	if ( $icon_on && '' !== $u( 'iconGap' . $suffix ) ) $wrap['gap'] = $u( 'iconGap' . $suffix );

	$content = [];
	if ( '' !== $u( 'contentGap' . $suffix ) ) $content['gap'] = $u( 'contentGap' . $suffix );
	if ( ! empty( $attributes[ 'contentVerticalAlign' . $suffix ] ) ) $content['align-items'] = $attributes[ 'contentVerticalAlign' . $suffix ];

	$number = $typo( $attributes[ 'numberTypography' . $suffix ] ?? [] );
	if ( '' !== $u( 'numberStrokeWidth' . $suffix ) ) $number['-webkit-text-stroke-width'] = $u( 'numberStrokeWidth' . $suffix );
	if ( '' !== $u( 'subPreGap' . $suffix ) ) $number['gap'] = $u( 'subPreGap' . $suffix );

	$prefix   = $typo( $attributes[ 'prefixTypography' . $suffix ] ?? [] );
	$suffix_s = $typo( $attributes[ 'suffixTypography' . $suffix ] ?? [] );

	$title = $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] );
	if ( ! empty( $attributes[ 'titleAlign' . $suffix ] ) ) $title['text-align'] = $attributes[ 'titleAlign' . $suffix ];

	$icon = $dims( $attributes[ 'iconPadding' . $suffix ] ?? [], 'padding' );

	return [
		'.shapeblock-cnt-wrap'        => $wrap,
		'.shapeblock-cnt-content'     => $content,
		'.shapeblock-cnt-number-wrap' => $number,
		'.shapeblock-cnt-prefix'      => $prefix,
		'.shapeblock-cnt-suffix'      => $suffix_s,
		'.shapeblock-cnt-title'       => $title,
		'.shapeblock-cnt-icon'        => $icon,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-cnt-wrap', '.shapeblock-cnt-content', '.shapeblock-cnt-number-wrap', '.shapeblock-cnt-prefix', '.shapeblock-cnt-suffix', '.shapeblock-cnt-title', '.shapeblock-cnt-icon' ] as $sub_sel ) {
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
	'.shapeblock-cnt-wrap'                            => $H::get_inline_styles( $wrap ),
	'.shapeblock-cnt-content'                         => $H::get_inline_styles( $content ),
	'.shapeblock-cnt-number-wrap'                     => $H::get_inline_styles( $number_styles ),
	'.shapeblock-cnt-prefix'                          => $H::get_inline_styles( $prefix_styles ),
	'.shapeblock-cnt-suffix'                          => $H::get_inline_styles( $suffix_styles ),
	'.shapeblock-cnt-title'                           => $H::get_inline_styles( $title_styles ),
	'.shapeblock-cnt-icon'                            => $H::get_inline_styles( $icon_box ),
	'.shapeblock-cnt-icon svg, ' . $selector . ' .shapeblock-cnt-icon svg path, ' . $selector . ' .shapeblock-cnt-icon i' => $H::get_inline_styles( $icon_color ),
	'.shapeblock-cnt-icon svg'                        => $H::get_inline_styles( $icon_svg ),
	'.shapeblock-cnt-icon i'                          => $H::get_inline_styles( $icon_i ),
] );

$icon_html = ( $icon_on && ! empty( $icon ) && 'none' !== $icon ) ? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : '';
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-cnt-wrap">
		<?php if ( $icon_html ) : ?>
			<div class="shapeblock-cnt-icon"><?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
		<?php endif; ?>
		<div class="shapeblock-cnt-content">
			<div class="shapeblock-cnt-number-wrap">
				<?php if ( '' !== $prefix ) : ?>
					<span class="shapeblock-cnt-prefix"><?php echo esc_html( $prefix ); ?></span>
				<?php endif; ?>
				<span class="shapeblock-cnt-number shapeblock-counter"
					data-count="<?php echo esc_attr( $number ); ?>"
					data-start="<?php echo esc_attr( $start ); ?>"
					data-duration="<?php echo esc_attr( $duration ); ?>"
					data-format="<?php echo esc_attr( $format ); ?>"
					data-animation="<?php echo esc_attr( $animation ); ?>"><?php echo esc_html( $start ); ?></span>
				<?php if ( '' !== $suffix ) : ?>
					<span class="shapeblock-cnt-suffix"><?php echo esc_html( $suffix ); ?></span>
				<?php endif; ?>
			</div>
			<?php if ( '' !== $title ) : ?>
				<<?php echo tag_escape( $title_tag ); ?> class="shapeblock-cnt-title"><?php echo wp_kses_post( $title ); ?></<?php echo tag_escape( $title_tag ); ?>>
			<?php endif; ?>
		</div>
	</div>
</div>
