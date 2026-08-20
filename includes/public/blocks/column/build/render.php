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
    : 'eelfg-col-' . wp_rand( 100, 99999 );

$selector = '.' . $unique_id;

$col_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];

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
                $w_num = (float) $w; // "50%" -> 50
                $calc  = sprintf(
                    'calc(%s - (var(--bp-cols, 1) - 1) * var(--bp-gap, 0px) * %s / 100)',
                    $w,
                    rtrim( rtrim( number_format( $w_num, 4, '.', '' ), '0' ), '.' )
                );
                $col_responsive[ $device ]['flex']      = '0 1 ' . $calc;
                $col_responsive[ $device ]['max-width'] = $calc;
            } else {
                $col_responsive[ $device ]['width']     = $w;
                $col_responsive[ $device ]['flex']      = '0 0 auto';
            }
        }
    } elseif ( $width_type === 'flex' ) {
        $grow  = isset( $attributes[ 'flexGrow' . $suffix ] ) ? trim( (string) $attributes[ 'flexGrow' . $suffix ] ) : '';
        $basis = isset( $attributes[ 'flexBasis' . $suffix ] ) ? trim( (string) $attributes[ 'flexBasis' . $suffix ] ) : '';
        if ( $grow !== '' )  $col_responsive[ $device ]['flex-grow']  = (float) $grow;
        if ( $basis !== '' ) $col_responsive[ $device ]['flex-basis'] = $basis;
    }
}

\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'minHeight', 'min-height' );

// Padding / margin.
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'padding', '', [
    'top'    => 'padding-top',
    'right'  => 'padding-right',
    'bottom' => 'padding-bottom',
    'left'   => 'padding-left',
], true );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $col_responsive, 'margin', '', [
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
    foreach ( \EELFG\Frontend\Helper::border_to_css_props( $attributes['border'] ) as $prop => $val ) {
        $col_responsive['desktop'][ $prop ] = $val;
    }
}

// Border radius.
$radius = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : [];
if ( ! empty( $radius['top'] ) )    $col_responsive['desktop']['border-top-left-radius']     = \EELFG\Frontend\Helper::ensure_unit( $radius['top'] );
if ( ! empty( $radius['right'] ) )  $col_responsive['desktop']['border-top-right-radius']    = \EELFG\Frontend\Helper::ensure_unit( $radius['right'] );
if ( ! empty( $radius['bottom'] ) ) $col_responsive['desktop']['border-bottom-right-radius'] = \EELFG\Frontend\Helper::ensure_unit( $radius['bottom'] );
if ( ! empty( $radius['left'] ) )   $col_responsive['desktop']['border-bottom-left-radius']  = \EELFG\Frontend\Helper::ensure_unit( $radius['left'] );

// Box shadow.
if ( ! empty( $attributes['boxShadow'] ) && ! empty( $attributes['boxShadow']['c'] ) && $attributes['boxShadow']['c'] !== 'rgba(0,0,0,0)' ) {
    $col_responsive['desktop']['box-shadow'] = \EELFG\Frontend\Helper::box_shadow_to_css( $attributes['boxShadow'] );
}

if ( $vertical ) {
    $col_responsive['desktop']['align-self'] = $vertical;
}

// Content flexbox — the inner wrapper becomes a flex container ONLY when the user
// sets at least one flex option (otherwise it stays normal block flow, so the empty
// appender / stacked content is not disturbed).
$inner_selector   = $selector . ' > .eelfg-column__inner';
$inner_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'flexDirection',  'flex-direction' );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'justifyContent', 'justify-content' );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'alignItems',     'align-items' );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'alignContent',   'align-content' );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'flexWrap',       'flex-wrap' );
\EELFG\Frontend\Helper::add_responsive_vars( $attributes, $inner_responsive, 'contentGap',     'gap' );
if ( ! empty( $inner_responsive['desktop'] ) || ! empty( $inner_responsive['tablet'] ) || ! empty( $inner_responsive['mobile'] ) ) {
    $inner_responsive['desktop'] = array_merge( [ 'display' => 'flex' ], $inner_responsive['desktop'] );
}

// Compile CSS.
$style_handle = 'eelfg-column-style';
$css  = \EELFG\Frontend\Helper::generate_responsive_css( $selector, $col_responsive );
$css .= \EELFG\Frontend\Helper::generate_responsive_css( $inner_selector, $inner_responsive );

wp_enqueue_style( $style_handle );
\EELFG\Frontend\Helper::add_custom_style( $style_handle, $selector, $css, [] );

$classes = [
    'eelfg-block',
    'eelfg-column',
    $unique_id,
];
if ( $vertical ) $classes[] = 'is-self-' . sanitize_html_class( $vertical );
if ( $custom_class ) {
    foreach ( explode( ' ', $custom_class ) as $c ) {
        $c = sanitize_html_class( $c );
        if ( $c ) $classes[] = $c;
    }
}

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => implode( ' ', $classes ) ] );

printf(
    '<%1$s %2$s><div class="eelfg-column__inner">%3$s</div></%1$s>',
    tag_escape( $tag ),
    $wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from get_block_wrapper_attributes()
    $content        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is pre-rendered inner blocks HTML
);
