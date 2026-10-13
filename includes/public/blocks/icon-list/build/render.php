<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Icon List block.
 *
 * Element classes use the "shapeblock-" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-icon-list-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$features   = isset( $attributes['features'] ) && is_array( $attributes['features'] ) ? $attributes['features'] : [];
$dir        = ( isset( $attributes['feaDir'] ) && 'right' === $attributes['feaDir'] ) ? 'right' : 'left';
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag  = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';
$layout     = ( isset( $attributes['layout'] ) && 'inline' === $attributes['layout'] ) ? 'inline' : 'default';
$align      = ( isset( $attributes['listAlign'] ) && in_array( $attributes['listAlign'], [ 'left', 'center', 'right' ], true ) ) ? $attributes['listAlign'] : 'left';
$divider    = ! empty( $attributes['divider'] );
$show_icon  = ! ( isset( $attributes['showIcon'] ) && false === $attributes['showIcon'] );

if ( empty( $features ) ) {
	$w = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-icon-list-block-wrap ' . $unique_id ) );
	echo '<div ' . wp_kses_post( $w ) . '><p>' . esc_html__( 'Please add list items.', 'shapeblock' ) . '</p></div>';
	return;
}

$wrap_classes = [
	'shapeblock-block', 'shapeblock-icon-list-block-wrap', $unique_id, 'shapeblock-icon-list-wrapper',
	'shapeblock-icon-list-layout-' . $layout,
	'shapeblock-icon-list-align-' . $align,
];
if ( $divider ) { $wrap_classes[] = 'shapeblock-icon-list-has-divider'; }

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-icon-list-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-icon-list-style';

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

// List item.
$list = [];
if ( '' !== $u( 'feaMiddleGap' ) ) $list['gap'] = $u( 'feaMiddleGap' );
if ( ! empty( $attributes['feaVerticalAlign'] ) ) $list['align-items'] = $attributes['feaVerticalAlign'];

// The hover colour, the gap and the divider colour go on the wrapper element
// itself (which is the scoped selector), so they can't use the descendant-based
// sub_styles map.
$extra_css = '';

// Icon.
$icon_color = [];
if ( ! empty( $attributes['iconColor'] ) ) { $icon_color['color'] = $attributes['iconColor']; $icon_color['fill'] = $attributes['iconColor']; }
// Adjust vertical position - nudge the icon up/down without affecting the text.
$icon_box = ( '' !== $u( 'iconOffsetY' ) ) ? [ 'transform' => 'translateY(' . $u( 'iconOffsetY' ) . ')' ] : [];
// Icon hover colour.
if ( ! empty( $attributes['iconColorHover'] ) ) {
	$hover_decls = $H::get_inline_styles( [ 'color' => $attributes['iconColorHover'], 'fill' => $attributes['iconColorHover'] ] );
	$extra_css  .= $selector . ' .shapeblock-icon-list:hover .shapeblock-icon-list-icon i,'
		. $selector . ' .shapeblock-icon-list:hover .shapeblock-icon-list-icon svg,'
		. $selector . ' .shapeblock-icon-list:hover .shapeblock-icon-list-icon svg path{' . $hover_decls . '}';
}
$icon_svg = ( '' !== $u( 'iconSize' ) ) ? [ 'width' => $u( 'iconSize' ), 'height' => $u( 'iconSize' ) ] : [];
$icon_i   = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];

// Title.
$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];

// Space-between (gap) + divider colour on the list (desktop). The gap is stored
// in a CSS variable so the divider (::after) can centre itself in it.
$wrap_vars = [];
if ( '' !== $u( 'feaItemGap' ) ) $wrap_vars['--shapeblock-list-gap'] = $u( 'feaItemGap' );
if ( $divider && ! empty( $attributes['dividerColorGradient'] ) ) $wrap_vars['--shapeblock-divider-color'] = $attributes['dividerColorGradient'];
elseif ( $divider && ! empty( $attributes['dividerColor'] ) ) $wrap_vars['--shapeblock-divider-color'] = $attributes['dividerColor'];
$wrap_vars_decls = $H::get_inline_styles( $wrap_vars );
if ( $wrap_vars_decls ) {
	$extra_css .= $selector . '{' . $wrap_vars_decls . '}';
}

// ---------------------------------------------------------------------------
// Responsive (tablet / mobile) — gaps, icon size / offset and typography.
// ---------------------------------------------------------------------------
$resp = function ( $suffix ) use ( $attributes, $selector, $typo, $H ) {
	// ensure_unit helper for a per-device (suffixed) attribute.
	$uu = function ( $key ) use ( $attributes, $H, $suffix ) {
		$k = $key . $suffix;
		return ( isset( $attributes[ $k ] ) && '' !== $attributes[ $k ] ) ? $H::ensure_unit( $attributes[ $k ] ) : '';
	};

	$list     = ( '' !== $uu( 'feaMiddleGap' ) ) ? [ 'gap' => $uu( 'feaMiddleGap' ) ] : [];
	$wrap_v   = ( '' !== $uu( 'feaItemGap' ) ) ? [ '--shapeblock-list-gap' => $uu( 'feaItemGap' ) ] : [];
	$icon_box = ( '' !== $uu( 'iconOffsetY' ) ) ? [ 'transform' => 'translateY(' . $uu( 'iconOffsetY' ) . ')' ] : [];
	$icon_svg = ( '' !== $uu( 'iconSize' ) ) ? [ 'width' => $uu( 'iconSize' ), 'height' => $uu( 'iconSize' ) ] : [];
	$icon_i   = ( '' !== $uu( 'iconSize' ) ) ? [ 'font-size' => $uu( 'iconSize' ) ] : [];
	$title_r  = $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] );

	$css   = '';
	$rules = [
		''                                => $H::get_inline_styles( $wrap_v ),
		' .shapeblock-icon-list'          => $H::get_inline_styles( $list ),
		' .shapeblock-icon-list-icon'     => $H::get_inline_styles( $icon_box ),
		' .shapeblock-icon-list-icon svg' => $H::get_inline_styles( $icon_svg ),
		' .shapeblock-icon-list-icon i'   => $H::get_inline_styles( $icon_i ),
		' .shapeblock-icon-list-title'    => $H::get_inline_styles( $title_r ),
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
	'.shapeblock-icon-list'                            => $H::get_inline_styles( $list ),
	'.shapeblock-icon-list-icon svg, ' . $selector . ' .shapeblock-icon-list-icon svg path, ' . $selector . ' .shapeblock-icon-list-icon i' => $H::get_inline_styles( $icon_color ),
	'.shapeblock-icon-list-icon'                       => $H::get_inline_styles( $icon_box ),
	'.shapeblock-icon-list-icon svg'                   => $H::get_inline_styles( $icon_svg ),
	'.shapeblock-icon-list-icon i'                     => $H::get_inline_styles( $icon_i ),
	'.shapeblock-icon-list-title'                      => $H::get_inline_styles( $title_styles ),
] );

// Responsive media queries are printed AFTER the desktop rules so they win at
// their breakpoints (media queries add no specificity — source order decides).
$responsive_media = '';
if ( '' !== $tablet_css ) $responsive_media .= '@media (max-width:1024px){' . $tablet_css . '}';
if ( '' !== $mobile_css ) $responsive_media .= '@media (max-width:767px){' . $mobile_css . '}';
if ( '' !== $responsive_media ) {
	$H::add_custom_style( $style_handle, $selector, $responsive_media, [] );
}

// ---------------------------------------------------------------------------
// Markup.
// ---------------------------------------------------------------------------
// The star fallback below is a hard-coded SVG constant with no user input. wp_kses()
// lowercases every attribute name, which turns the case-sensitive viewBox into
// viewbox -- the browser then ignores it and the icon loses its intrinsic size. It
// is written as literal markup at its output point instead of being passed through
// wp_kses(); the icon-font <i> tag stays escaped with esc_attr() as before.
?>
<ul <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<?php
	foreach ( $features as $item ) :
		$icon = isset( $item['icon'] ) ? $item['icon'] : '';
		$ttl  = isset( $item['title'] ) ? $item['title'] : '';
		?>
		<li class="shapeblock-icon-list shapeblock-icon-list-dir-<?php echo esc_attr( $dir ); ?>">
			<?php if ( $show_icon ) : ?>
			<span class="shapeblock-icon-list-icon">
				<?php if ( ! empty( $icon ) && 'none' !== $icon ) : ?>
					<i class="shapeblock-icon <?php echo esc_attr( $icon ); ?>" aria-hidden="true"></i>
				<?php else : ?>
					<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>
				<?php endif; ?>
			</span>
			<?php endif; ?>
			<?php if ( '' !== $ttl ) : ?>
				<span class="shapeblock-icon-list-info">
					<?php printf( '<%1$s class="shapeblock-icon-list-title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses_post( $ttl ) ); ?>
				</span>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ul>
<?php } )( $attributes, $content, $block );
