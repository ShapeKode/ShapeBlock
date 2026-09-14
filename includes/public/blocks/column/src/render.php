<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template variables.

$allowed_tags = [ 'div', 'section', 'article', 'aside' ];
$tag          = isset( $attributes['htmlTag'] ) && in_array( $attributes['htmlTag'], $allowed_tags, true )
    ? $attributes['htmlTag']
    : 'div';

$width_type   = isset( $attributes['widthType'] ) ? $attributes['widthType'] : 'percentage';
$vertical     = isset( $attributes['verticalAlign'] ) ? $attributes['verticalAlign'] : '';
$custom_class = isset( $attributes['customClass'] ) ? trim( (string) $attributes['customClass'] ) : '';
$unique_id    = ! empty( $attributes['blockId'] )
    ? sanitize_html_class( $attributes['blockId'] )
    : 'shapeblock-col-' . wp_rand( 100, 99999 );

$selector = '.' . $unique_id;

$col_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];

// Width declarations live in their own array and are emitted through a
// higher-specificity, !important rule (see $width_selector below). The parent Row
// ships a stacking rule with BOTH higher specificity and !important:
//   @media (max-width:767px){ .shapeblock-layout-row > .__inner > .shapeblock-column {
//       flex:1 1 100% !important; max-width:100% !important } }
// A plain `.shapeblock-col-xxx { … }` width rule (specificity 0,1,0, no !important) can
// never beat that, so any per-device Tablet/Mobile width was silently ignored on
// the front end. Giving the width its own 0,4,0 + !important rule fixes that while
// leaving desktop rendering identical.
$col_width = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];

// Width handling per type.
$devices = [ '' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile' ];
foreach ( $devices as $suffix => $device ) {
    if ( $width_type === 'percentage' || $width_type === 'custom' ) {
        $w = isset( $attributes[ 'width' . $suffix ] ) ? trim( (string) $attributes[ 'width' . $suffix ] ) : '';
        if ( $w !== '' ) {
            if ( $width_type === 'percentage' ) {
                // Subtract this column's share of the row gap so columns total exactly
                // 100% of the row regardless of gap. Math runs in CSS via vars set by
                // the parent row (see layout-row/src/render.php): --bp-cols, --bp-gap.
                //   calc(W% - (cols - 1) * gap * W / 100)
                // "50" and "50%" both mean 50% here; without the unit the calc()
                // below is invalid and the column loses its width entirely.
                if ( is_numeric( $w ) ) {
                    $w = $w . '%';
                }
                $w_num = (float) $w; // "50%" -> 50
                $calc  = sprintf(
                    'calc(%s - (var(--bp-cols, 1) - 1) * var(--bp-gap, 0px) * %s / 100)',
                    $w,
                    rtrim( rtrim( number_format( $w_num, 4, '.', '' ), '0' ), '.' )
                );
                $col_width[ $device ]['flex']      = '0 1 ' . $calc . ' !important';
                $col_width[ $device ]['max-width'] = $calc . ' !important';
            } else {
                $col_width[ $device ]['width']     = $w . ' !important';
                $col_width[ $device ]['flex']      = '0 0 auto !important';
            }
        }
    } elseif ( $width_type === 'flex' ) {
        $grow  = isset( $attributes[ 'flexGrow' . $suffix ] ) ? trim( (string) $attributes[ 'flexGrow' . $suffix ] ) : '';
        $basis = isset( $attributes[ 'flexBasis' . $suffix ] ) ? trim( (string) $attributes[ 'flexBasis' . $suffix ] ) : '';
        if ( $grow !== '' )  $col_width[ $device ]['flex-grow']  = (float) $grow . ' !important';
        if ( $basis !== '' ) $col_width[ $device ]['flex-basis'] = $basis . ' !important';
    }
}

\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'minHeight', 'min-height' );

// Padding / margin.
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'padding', '', [
    'top'    => 'padding-top',
    'right'  => 'padding-right',
    'bottom' => 'padding-bottom',
    'left'   => 'padding-left',
], true );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'margin', '', [
    'top'    => 'margin-top',
    'right'  => 'margin-right',
    'bottom' => 'margin-bottom',
    'left'   => 'margin-left',
], true );

// Background.
if ( ! empty( $attributes['background'] ) ) {
    $col_responsive['desktop']['background-color'] = $attributes['background'];
}
if ( ! empty( $attributes['backgroundGradient'] ) ) {
    $col_responsive['desktop']['background-image'] = $attributes['backgroundGradient'];
}

// Border.
if ( ! empty( $attributes['border'] ) ) {
    foreach ( \ShapeBlock\Frontend\Helper::border_to_css_props( $attributes['border'] ) as $prop => $val ) {
        $col_responsive['desktop'][ $prop ] = $val;
    }
}

// Border radius.
$radius = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : [];
if ( ! empty( $radius['top'] ) )    $col_responsive['desktop']['border-top-left-radius']     = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['top'] );
if ( ! empty( $radius['right'] ) )  $col_responsive['desktop']['border-top-right-radius']    = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['right'] );
if ( ! empty( $radius['bottom'] ) ) $col_responsive['desktop']['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['bottom'] );
if ( ! empty( $radius['left'] ) )   $col_responsive['desktop']['border-bottom-left-radius']  = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['left'] );

// Box shadow.
if ( ! empty( $attributes['boxShadow'] ) && ! empty( $attributes['boxShadow']['c'] ) && $attributes['boxShadow']['c'] !== 'rgba(0,0,0,0)' ) {
    $col_responsive['desktop']['box-shadow'] = \ShapeBlock\Frontend\Helper::box_shadow_to_css( $attributes['boxShadow'] );
}

if ( $vertical ) {
    $col_responsive['desktop']['align-self'] = $vertical;
}

// Content flexbox — the inner wrapper becomes a flex container ONLY when the user
// sets at least one flex option (otherwise it stays normal block flow, so the empty
// appender / stacked content is not disturbed).
$inner_selector   = $selector . ' > .shapeblock-column__inner';
$inner_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'flexDirection',  'flex-direction' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'justifyContent', 'justify-content' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'alignItems',     'align-items' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'alignContent',   'align-content' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'flexWrap',       'flex-wrap' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'contentGap',     'gap' );
if ( ! empty( $inner_responsive['desktop'] ) || ! empty( $inner_responsive['tablet'] ) || ! empty( $inner_responsive['mobile'] ) ) {
    // Stack vertically from the top unless the user picked a direction, so turning on a
    // single option (gap, align, justify) does not flip content into a horizontal row
    // where "align items: center" would read as vertical centring.
    $inner_responsive['desktop'] = array_merge( [ 'display' => 'flex', 'flex-direction' => 'column' ], $inner_responsive['desktop'] );
}

// Compile CSS.
$style_handle = 'shapeblock-column-style';
// Column is always a direct child of the Row's inner wrapper, so this 0,4,0
// selector + !important reliably outweighs the Row's mobile stacking rule while
// only ever targeting this specific column.
$width_selector = '.shapeblock-layout-row > .shapeblock-layout-row__inner > .shapeblock-column' . $selector;
$css  = \ShapeBlock\Frontend\Helper::generate_responsive_css( $selector, $col_responsive );
$css .= \ShapeBlock\Frontend\Helper::generate_responsive_css( $width_selector, $col_width );
$css .= \ShapeBlock\Frontend\Helper::generate_responsive_css( $inner_selector, $inner_responsive );

wp_enqueue_style( $style_handle );
\ShapeBlock\Frontend\Helper::add_custom_style( $style_handle, $selector, $css, [] );

$classes = [
    'shapeblock-block',
    'shapeblock-column',
    $unique_id,
];
if ( $vertical ) $classes[] = 'is-self-' . sanitize_html_class( $vertical );
if ( ! empty( $attributes['hideDesktop'] ) ) $classes[] = 'shapeblock-hide-desktop';
if ( ! empty( $attributes['hideTablet'] ) )  $classes[] = 'shapeblock-hide-tablet';
if ( ! empty( $attributes['hideMobile'] ) )  $classes[] = 'shapeblock-hide-mobile';
if ( $custom_class ) {
    foreach ( explode( ' ', $custom_class ) as $c ) {
        $c = sanitize_html_class( $c );
        if ( $c ) $classes[] = $c;
    }
}

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => implode( ' ', $classes ) ] );

printf(
    '<%1$s %2$s><div class="shapeblock-column__inner">%3$s</div></%1$s>',
    tag_escape( $tag ),
    $wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from get_block_wrapper_attributes()
    $content        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is pre-rendered inner blocks HTML
);
