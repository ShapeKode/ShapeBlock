<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Icon List block.
 *
 * Mirrors the markup of the Elementor "Icon List" widget
 * (easy-elements/widgets/icon-list). Element classes use the "eelfg-" prefix.
 */

$H = '\EELFG\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'eelfg-icon-list-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$features   = isset( $attributes['features'] ) && is_array( $attributes['features'] ) ? $attributes['features'] : [];
$dir        = ( isset( $attributes['feaDir'] ) && 'right' === $attributes['feaDir'] ) ? 'right' : 'left';
$view       = isset( $attributes['iconView'] ) ? $attributes['iconView'] : 'stracked';
$shape      = isset( $attributes['iconShape'] ) ? $attributes['iconShape'] : 'rounded';
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag  = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';
$connector  = ! empty( $attributes['feaConnector'] );
$conn_left  = $connector && ! empty( $attributes['feaConnectorLeft'] );
$layout     = ( isset( $attributes['layout'] ) && 'inline' === $attributes['layout'] ) ? 'inline' : 'default';
$align      = ( isset( $attributes['listAlign'] ) && in_array( $attributes['listAlign'], [ 'left', 'center', 'right' ], true ) ) ? $attributes['listAlign'] : 'left';
$ihalign    = ( isset( $attributes['iconHAlign'] ) && in_array( $attributes['iconHAlign'], [ 'left', 'center', 'right' ], true ) ) ? $attributes['iconHAlign'] : 'left';
$divider    = ! empty( $attributes['divider'] );
$show_icon  = ! ( isset( $attributes['showIcon'] ) && false === $attributes['showIcon'] );

if ( empty( $features ) ) {
	$w = get_block_wrapper_attributes( array( 'class' => 'eelfg-block eelfg-icon-list-block-wrap ' . $unique_id ) );
	echo '<div ' . wp_kses_post( $w ) . '><p>' . esc_html__( 'Please add list items.', 'easy-elements-for-gutenberg' ) . '</p></div>';
	return;
}

$wrap_classes = [
	'eelfg-block', 'eelfg-icon-list-block-wrap', $unique_id, 'eelfg-icon-list-wrapper',
	'eelfg-icon-list-icon-view-' . $view,
	'eelfg-icon-list-icon-shape-' . $shape,
	'eelfg-icon-list-dir-' . $dir,
	'eelfg-icon-list-layout-' . $layout,
	'eelfg-icon-list-align-' . $align,
	'eelfg-icon-list-ihalign-' . $ihalign,
];
if ( $connector ) { $wrap_classes[] = 'eelfg-icon-list-connector'; }
if ( $conn_left ) { $wrap_classes[] = 'eelfg-icon-list-connector-left'; }
if ( $divider ) { $wrap_classes[] = 'eelfg-icon-list-has-divider'; }

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.eelfg-icon-list-block-wrap.' . $unique_id;
$style_handle = 'eelfg-icon-list-style';

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
if ( '' !== $u( 'feaMiddleGap' ) ) $list['gap'] = $u( 'feaMiddleGap' );
if ( ! empty( $attributes['feaVerticalAlign'] ) ) $list['align-items'] = $attributes['feaVerticalAlign'];

// Connector (::before on wrapper, ::after on icon for left connector).
$conn = [];
if ( ! empty( $attributes['feaConnectorType'] ) ) $conn['border-style'] = $attributes['feaConnectorType'];
if ( '' !== $u( 'feaConnectorWidth' ) ) $conn['border-width'] = $u( 'feaConnectorWidth' );
if ( ! empty( $attributes['feaConnectorColor'] ) ) $conn['border-color'] = $attributes['feaConnectorColor'];
$conn_before = $conn;
if ( 'left' === $dir && '' !== $u( 'feaConnectorPositionX' ) ) $conn_before['left'] = $u( 'feaConnectorPositionX' );
if ( 'right' === $dir && '' !== $u( 'feaConnectorRightPositionX' ) ) $conn_before['right'] = $u( 'feaConnectorRightPositionX' );

// The connector line is a ::before on the wrapper element itself (which is the
// scoped selector), so it can't go through the descendant-based sub_styles map.
$extra_css = '';
if ( $connector ) {
	$before_decls = $H::get_inline_styles( $conn_before );
	if ( $before_decls ) {
		$extra_css = $selector . '.eelfg-icon-list-connector::before{' . $before_decls . '}';
	}
}

// Icon.
$icon_color = [];
if ( ! empty( $attributes['iconColor'] ) ) { $icon_color['color'] = $attributes['iconColor']; $icon_color['fill'] = $attributes['iconColor']; }
$icon_box = $bg( 'iconBgColor', 'iconBgGradient' );
if ( '' !== $u( 'iconBoxSize' ) ) { $b = $u( 'iconBoxSize' ); $icon_box['min-width'] = $b; $icon_box['min-height'] = $b; $icon_box['line-height'] = $b; }
$icon_box = array_merge( $icon_box, $shadow( $attributes['iconShadow'] ?? [] ), $dims( $attributes['iconRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['iconBorder'] ) ) $icon_box = array_merge( $icon_box, $H::border_to_css_props( $attributes['iconBorder'] ) );
// Adjust vertical position - nudge the icon up/down without affecting the text.
if ( '' !== $u( 'iconOffsetY' ) ) $icon_box['transform'] = 'translateY(' . $u( 'iconOffsetY' ) . ')';
// Icon hover colour.
if ( ! empty( $attributes['iconColorHover'] ) ) {
	$hover_decls = $H::get_inline_styles( [ 'color' => $attributes['iconColorHover'], 'fill' => $attributes['iconColorHover'] ] );
	$extra_css  .= $selector . ' .eelfg-icon-list:hover .eelfg-icon-list-icon i,'
		. $selector . ' .eelfg-icon-list:hover .eelfg-icon-list-icon svg,'
		. $selector . ' .eelfg-icon-list:hover .eelfg-icon-list-icon svg path{' . $hover_decls . '}';
}
$icon_svg = ( '' !== $u( 'iconSize' ) ) ? [ 'width' => $u( 'iconSize' ), 'height' => $u( 'iconSize' ) ] : [];
$icon_num = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];
$icon_i   = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];

// Title / description.
$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];
$title_styles = array_merge( $title_styles, $dims( $attributes['titlePadding'] ?? [], 'padding' ) );
$desc_styles = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc_styles['color'] = $attributes['descColor'];

// Block wrapper margin + space-between (gap) + divider colour on the list (desktop).
// The gap is stored in a CSS variable so the divider (::after) can centre itself in it.
$block_margin = $dims( $attributes['feaBlockMargin'] ?? [], 'margin' );
if ( '' !== $u( 'feaItemGap' ) ) $block_margin['--eelfg-list-gap'] = $u( 'feaItemGap' );
if ( $divider && ! empty( $attributes['dividerColor'] ) ) $block_margin['--eelfg-divider-color'] = $attributes['dividerColor'];
$block_margin_decls = $H::get_inline_styles( $block_margin );
if ( $block_margin_decls ) {
	$extra_css .= $selector . '{' . $block_margin_decls . '}';
}

// ---------------------------------------------------------------------------
// Responsive (tablet / mobile) Ã¢â‚¬â€ padding, margin and typography only.
// ---------------------------------------------------------------------------
$resp = function ( $suffix ) use ( $attributes, $selector, $typo, $dims, $H, $dir, $connector ) {
	// ensure_unit helper for a per-device (suffixed) attribute.
	$uu = function ( $key ) use ( $attributes, $H, $suffix ) {
		$k = $key . $suffix;
		return ( isset( $attributes[ $k ] ) && '' !== $attributes[ $k ] ) ? $H::ensure_unit( $attributes[ $k ] ) : '';
	};

	// List item Ã¢â‚¬â€ padding + gaps.
	$list = $dims( $attributes[ 'feaListPadding' . $suffix ] ?? [], 'padding' );
	if ( '' !== $uu( 'feaMiddleGap' ) ) $list['gap']           = $uu( 'feaMiddleGap' );

	$wrap_m   = $dims( $attributes[ 'feaBlockMargin' . $suffix ] ?? [], 'margin' );
	if ( '' !== $uu( 'feaItemGap' ) ) $wrap_m['--eelfg-list-gap'] = $uu( 'feaItemGap' );
	$icon_box = ( '' !== $uu( 'iconBoxSize' ) ) ? [ 'min-width' => $uu( 'iconBoxSize' ), 'min-height' => $uu( 'iconBoxSize' ), 'line-height' => $uu( 'iconBoxSize' ) ] : [];
	if ( '' !== $uu( 'iconOffsetY' ) ) $icon_box['transform'] = 'translateY(' . $uu( 'iconOffsetY' ) . ')';
	$icon_svg = ( '' !== $uu( 'iconSize' ) ) ? [ 'width' => $uu( 'iconSize' ), 'height' => $uu( 'iconSize' ) ] : [];
	$icon_num = ( '' !== $uu( 'iconSize' ) ) ? [ 'font-size' => $uu( 'iconSize' ) ] : [];
	$icon_i   = ( '' !== $uu( 'iconSize' ) ) ? [ 'font-size' => $uu( 'iconSize' ) ] : [];
	$title_r  = array_merge( $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ), $dims( $attributes[ 'titlePadding' . $suffix ] ?? [], 'padding' ) );
	$desc_r   = $typo( $attributes[ 'descTypography' . $suffix ] ?? [] );

	$css   = '';
	$rules = [
		''                          => $H::get_inline_styles( $wrap_m ),
		' .eelfg-icon-list'          => $H::get_inline_styles( $list ),
		' .eelfg-icon-list-icon'     => $H::get_inline_styles( $icon_box ),
		' .eelfg-icon-list-icon svg' => $H::get_inline_styles( $icon_svg ),
		' .eelfg-icon-list-icon i'   => $H::get_inline_styles( $icon_i ),
		' .eelfg-icon-list-number'   => $H::get_inline_styles( $icon_num ),
		' .eelfg-icon-list-title'    => $H::get_inline_styles( $title_r ),
		' .eelfg-icon-list-desc'     => $H::get_inline_styles( $desc_r ),
	];
	foreach ( $rules as $sub => $decls ) {
		if ( $decls ) {
			$css .= $selector . $sub . '{' . $decls . '}';
		}
	}

	// Connector width + horizontal position.
	if ( $connector ) {
		$conn = ( '' !== $uu( 'feaConnectorWidth' ) ) ? [ 'border-width' => $uu( 'feaConnectorWidth' ) ] : [];
		$after = $H::get_inline_styles( $conn );
		if ( $after ) {
			$css .= $selector . ' .eelfg-icon-list-icon::after{' . $after . '}';
		}
		$before = $conn;
		if ( 'left' === $dir && '' !== $uu( 'feaConnectorPositionX' ) )       $before['left']  = $uu( 'feaConnectorPositionX' );
		if ( 'right' === $dir && '' !== $uu( 'feaConnectorRightPositionX' ) )  $before['right'] = $uu( 'feaConnectorRightPositionX' );
		$before_decls = $H::get_inline_styles( $before );
		if ( $before_decls ) {
			$css .= $selector . '.eelfg-icon-list-connector::before{' . $before_decls . '}';
		}
	}

	return $css;
};
$tablet_css = $resp( 'Tablet' );
$mobile_css = $resp( 'Mobile' );

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $extra_css, [
	'.eelfg-icon-list'                            => $H::get_inline_styles( $list ),
	'.eelfg-icon-list-icon::after'                => $H::get_inline_styles( $conn ),
	'.eelfg-icon-list-icon svg, ' . $selector . ' .eelfg-icon-list-icon svg path, ' . $selector . ' .eelfg-icon-list-icon i, ' . $selector . ' .eelfg-icon-list-number' => $H::get_inline_styles( $icon_color ),
	'.eelfg-icon-list-icon'                       => $H::get_inline_styles( $icon_box ),
	'.eelfg-icon-list-icon svg'                   => $H::get_inline_styles( $icon_svg ),
	'.eelfg-icon-list-icon i'                     => $H::get_inline_styles( $icon_i ),
	'.eelfg-icon-list-number'                     => $H::get_inline_styles( $icon_num ),
	'.eelfg-icon-list-title'                      => $H::get_inline_styles( $title_styles ),
	'.eelfg-icon-list-desc'                       => $H::get_inline_styles( $desc_styles ),
] );

// Responsive media queries are printed AFTER the desktop rules so they win at
// their breakpoints (media queries add no specificity Ã¢â‚¬â€ source order decides).
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
<ul <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<?php
	foreach ( $features as $item ) :
		$icon = isset( $item['icon'] ) ? $item['icon'] : '';
		$ttl  = isset( $item['title'] ) ? $item['title'] : '';
		?>
		<li class="eelfg-icon-list eelfg-icon-list-dir-<?php echo esc_attr( $dir ); ?>">
			<?php if ( $show_icon ) : ?>
			<span class="eelfg-icon-list-icon eelfg-icon-list-type-icon">
				<?php echo ( ! empty( $icon ) && 'none' !== $icon ) ? '<i class="eelfg-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : $svg_star; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</span>
			<?php endif; ?>
			<?php if ( '' !== $ttl ) : ?>
				<span class="eelfg-icon-list-info">
					<?php printf( '<%1$s class="eelfg-icon-list-title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses_post( $ttl ) ); ?>
				</span>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ul>
