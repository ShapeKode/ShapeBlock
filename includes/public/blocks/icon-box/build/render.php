<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Icon Box block.
 *
 * Mirrors the markup of the Elementor "Icon Box" widget
 * (easy-elements/widgets/icon-box). Element classes use the "eelfg-" prefix.
 */

$H = '\EELFG\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'eelfg-icon-box-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$view       = isset( $attributes['iconView'] ) ? $attributes['iconView'] : 'stracked';
$shape      = isset( $attributes['iconShape'] ) ? $attributes['iconShape'] : 'rounded';
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag  = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';

// Single-item content.
$type = isset( $attributes['iconType'] ) ? $attributes['iconType'] : 'icon';
$icon = isset( $attributes['icon'] ) ? $attributes['icon'] : '';
$num  = isset( $attributes['number'] ) ? $attributes['number'] : '';
$img  = isset( $attributes['image'] ) && is_array( $attributes['image'] ) ? $attributes['image'] : [];
$ttl  = isset( $attributes['title'] ) ? $attributes['title'] : '';
$desc = isset( $attributes['desc'] ) ? $attributes['desc'] : '';

// Alignment: left = icon left, right = icon right, center = icon on top.
$align = ( isset( $attributes['boxAlign'] ) && in_array( $attributes['boxAlign'], [ 'left', 'center', 'right' ], true ) ) ? $attributes['boxAlign'] : 'center';

$wrap_classes = [
	'eelfg-block', 'eelfg-icon-box-block-wrap', $unique_id, 'eelfg-icon-box-wrapper',
	'eelfg-icon-box-icon-view-' . $view,
	'eelfg-icon-box-icon-shape-' . $shape,
];

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.eelfg-icon-box-block-wrap.' . $unique_id;
$style_handle = 'eelfg-icon-box-style';

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
	return $out;
};
$dims = function ( $obj, $type ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
	if ( 'padding' === $type ) {
		$map = [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ];
	} elseif ( 'margin' === $type ) {
		$map = [ 'top' => 'margin-top', 'right' => 'margin-right', 'bottom' => 'margin-bottom', 'left' => 'margin-left' ];
	} else {
		$map = [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
	}
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
$bg = function ( $colorKey, $gradKey ) use ( $attributes ) {
	if ( ! empty( $attributes[ $gradKey ] ) ) return [ 'background' => $attributes[ $gradKey ] ];
	if ( ! empty( $attributes[ $colorKey ] ) ) return [ 'background' => $attributes[ $colorKey ] ];
	return [];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// List item.
$list = $bg( 'listBgColor', 'listBgGradient' );
if ( ! empty( $attributes['feaListBorder'] ) ) $list = array_merge( $list, $H::border_to_css_props( $attributes['feaListBorder'] ) );
$list = array_merge( $list, $dims( $attributes['feaListBorderRadius'] ?? [], 'radius' ), $dims( $attributes['feaListPadding'] ?? [], 'padding' ) );
if ( '' !== $u( 'feaItemGap' ) ) $list['margin-bottom'] = $u( 'feaItemGap' );
if ( '' !== $u( 'feaMiddleGap' ) ) $list['gap'] = $u( 'feaMiddleGap' );
// Vertical alignment only applies when the icon sits left / right of the text.
if ( in_array( $align, [ 'left', 'right' ], true ) && ! empty( $attributes['boxVAlign'] ) ) {
	$list['align-items'] = $attributes['boxVAlign'];
}

$extra_css = '';

// Icon.
$icon_color = [];
if ( ! empty( $attributes['iconColor'] ) ) { $icon_color['color'] = $attributes['iconColor']; $icon_color['fill'] = $attributes['iconColor']; }
$icon_box = $bg( 'iconBgColor', 'iconBgGradient' );
if ( '' !== $u( 'iconBoxSize' ) ) { $b = $u( 'iconBoxSize' ); $icon_box['min-width'] = $b; $icon_box['min-height'] = $b; $icon_box['line-height'] = $b; }
if ( ! empty( $attributes['iconAlignment'] ) ) $icon_box['justify-content'] = $attributes['iconAlignment'];
$icon_box = array_merge( $icon_box, $shadow( $attributes['iconShadow'] ?? [] ), $dims( $attributes['iconRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['iconBorder'] ) ) $icon_box = array_merge( $icon_box, $H::border_to_css_props( $attributes['iconBorder'] ) );
$icon_svg = ( '' !== $u( 'iconSize' ) ) ? [ 'width' => $u( 'iconSize' ), 'height' => $u( 'iconSize' ) ] : [];
$icon_num = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];

// Title / description.
$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];
$title_styles = array_merge( $title_styles, $dims( $attributes['titlePadding'] ?? [], 'padding' ) );
$desc_styles = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc_styles['color'] = $attributes['descColor'];

// Block wrapper margin (desktop).
$block_margin = $dims( $attributes['feaBlockMargin'] ?? [], 'margin' );
$block_margin_decls = $H::get_inline_styles( $block_margin );
if ( $block_margin_decls ) {
	$extra_css .= $selector . '{' . $block_margin_decls . '}';
}

// ---------------------------------------------------------------------------
// Responsive (tablet / mobile) â€” padding, margin and typography only.
// ---------------------------------------------------------------------------
$resp = function ( $suffix ) use ( $attributes, $selector, $typo, $dims, $H ) {
	// ensure_unit helper for a per-device (suffixed) attribute.
	$uu = function ( $key ) use ( $attributes, $H, $suffix ) {
		$k = $key . $suffix;
		return ( isset( $attributes[ $k ] ) && '' !== $attributes[ $k ] ) ? $H::ensure_unit( $attributes[ $k ] ) : '';
	};

	// List item â€” padding + gaps.
	$list = $dims( $attributes[ 'feaListPadding' . $suffix ] ?? [], 'padding' );
	if ( '' !== $uu( 'feaItemGap' ) )   $list['margin-bottom'] = $uu( 'feaItemGap' );
	if ( '' !== $uu( 'feaMiddleGap' ) ) $list['gap']           = $uu( 'feaMiddleGap' );

	$wrap_m   = $dims( $attributes[ 'feaBlockMargin' . $suffix ] ?? [], 'margin' );
	$icon_box = ( '' !== $uu( 'iconBoxSize' ) ) ? [ 'min-width' => $uu( 'iconBoxSize' ), 'min-height' => $uu( 'iconBoxSize' ), 'line-height' => $uu( 'iconBoxSize' ) ] : [];
	$icon_svg = ( '' !== $uu( 'iconSize' ) ) ? [ 'width' => $uu( 'iconSize' ), 'height' => $uu( 'iconSize' ) ] : [];
	$icon_num = ( '' !== $uu( 'iconSize' ) ) ? [ 'font-size' => $uu( 'iconSize' ) ] : [];
	$title_r  = array_merge( $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ), $dims( $attributes[ 'titlePadding' . $suffix ] ?? [], 'padding' ) );
	$desc_r   = $typo( $attributes[ 'descTypography' . $suffix ] ?? [] );

	$css   = '';
	$rules = [
		''                          => $H::get_inline_styles( $wrap_m ),
		' .eelfg-icon-box'          => $H::get_inline_styles( $list ),
		' .eelfg-icon-box-icon'     => $H::get_inline_styles( $icon_box ),
		' .eelfg-icon-box-icon svg' => $H::get_inline_styles( $icon_svg ),
		' .eelfg-icon-box-number'   => $H::get_inline_styles( $icon_num ),
		' .eelfg-icon-box-title'    => $H::get_inline_styles( $title_r ),
		' .eelfg-icon-box-desc'     => $H::get_inline_styles( $desc_r ),
	];
	foreach ( $rules as $sub => $decls ) {
		if ( $decls ) {
			$css .= $selector . $sub . '{' . $decls . '}';
		}
	}

	return $css;
};
$tablet_css = $resp( 'Tablet' );
$mobile_css = $resp( 'Mobile' );

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $extra_css, [
	'.eelfg-icon-box'                            => $H::get_inline_styles( $list ),
	'.eelfg-icon-box-icon svg, ' . $selector . ' .eelfg-icon-box-icon svg path, ' . $selector . ' .eelfg-icon-box-icon i, ' . $selector . ' .eelfg-icon-box-number' => $H::get_inline_styles( $icon_color ),
	'.eelfg-icon-box-icon'                       => $H::get_inline_styles( $icon_box ),
	'.eelfg-icon-box-icon svg'                   => $H::get_inline_styles( $icon_svg ),
	'.eelfg-icon-box-number'                     => $H::get_inline_styles( $icon_num ),
	'.eelfg-icon-box-title'                      => $H::get_inline_styles( $title_styles ),
	'.eelfg-icon-box-desc'                       => $H::get_inline_styles( $desc_styles ),
] );

// Responsive media queries are printed AFTER the desktop rules so they win at
// their breakpoints (media queries add no specificity â€” source order decides).
$responsive_media = '';
if ( '' !== $tablet_css ) $responsive_media .= '@media (max-width:1024px){' . $tablet_css . '}';
if ( '' !== $mobile_css ) $responsive_media .= '@media (max-width:767px){' . $mobile_css . '}';
if ( '' !== $responsive_media ) {
	$H::add_custom_style( $style_handle, $selector, $responsive_media, [] );
}

// ---------------------------------------------------------------------------
// Markup.
// ---------------------------------------------------------------------------
$svg_star = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>';
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<?php
	$show_icon = ! ( isset( $attributes['showIcon'] ) && false === $attributes['showIcon'] );
	$has_icon = $show_icon && (
		( 'image' === $type && ! empty( $img['url'] ) )
		|| ( 'icon' === $type )
		|| ( 'number' === $type && '' !== $num ) );
	?>
	<div class="eelfg-icon-box eelfg-icon-box-align-<?php echo esc_attr( $align ); ?>">
		<?php if ( $has_icon ) : ?>
			<div class="eelfg-icon-box-icon eelfg-icon-box-type-<?php echo esc_attr( $type ); ?>">
				<?php
				if ( 'image' === $type && ! empty( $img['url'] ) ) {
					echo '<img src="' . esc_url( $img['url'] ) . '" alt="' . esc_attr( $img['alt'] ?? $ttl ) . '" class="eelfg-icon-box-img">';
				} elseif ( 'number' === $type ) {
					echo '<span class="eelfg-icon-box-number">' . esc_html( $num ) . '</span>';
				} else {
					echo ( ! empty( $icon ) && 'none' !== $icon ) ? '<i class="eelfg-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : $svg_star; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
				?>
			</div>
		<?php endif; ?>
		<?php if ( '' !== $ttl || '' !== $desc ) : ?>
			<div class="eelfg-icon-box-info">
				<?php if ( '' !== $ttl ) : ?>
					<?php printf( '<%1$s class="eelfg-icon-box-title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses_post( $ttl ) ); ?>
				<?php endif; ?>
				<?php if ( '' !== $desc ) : ?>
					<p class="eelfg-icon-box-desc"><?php echo esc_html( $desc ); ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</div>
