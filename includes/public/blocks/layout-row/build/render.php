<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template variables.

$allowed_tags = [ 'div', 'section', 'article', 'main', 'header', 'footer', 'aside' ];
$tag          = isset( $attributes['htmlTag'] ) && in_array( $attributes['htmlTag'], $allowed_tags, true )
    ? $attributes['htmlTag']
    : 'div';

$content_width = isset( $attributes['contentWidth'] ) ? $attributes['contentWidth'] : 'boxed';
$vertical      = isset( $attributes['verticalAlign'] ) ? $attributes['verticalAlign'] : '';
$equal_height  = ! empty( $attributes['equalHeight'] );
$stretch       = ! empty( $attributes['stretchColumns'] );
$custom_class  = isset( $attributes['customClass'] ) ? trim( (string) $attributes['customClass'] ) : '';
$unique_id     = ! empty( $attributes['blockId'] )
    ? sanitize_html_class( $attributes['blockId'] )
    : 'shapeblock-layout-row-' . wp_rand( 100, 99999 );

$selector = '.' . $unique_id;

$row_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];

// Flexbox controls (D/T/M).
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'flexDirection',  'flex-direction' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'justifyContent', 'justify-content' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'alignItems',     'align-items' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'alignContent',   'align-content' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'flexWrap',       'flex-wrap' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'gap',            'gap' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'rowGap',         'row-gap' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'columnGap',      'column-gap' );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'minHeight',      'min-height' );

// Padding / margin (object, D/T/M).
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'padding', '', [
    'top'    => 'padding-top',
    'right'  => 'padding-right',
    'bottom' => 'padding-bottom',
    'left'   => 'padding-left',
], true );
\ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'margin', '', [
    'top'    => 'margin-top',
    'right'  => 'margin-right',
    'bottom' => 'margin-bottom',
    'left'   => 'margin-left',
], true );

// Background.
if ( ! empty( $attributes['background'] ) ) {
    $row_responsive['desktop']['background-color'] = $attributes['background'];
}

$bg_image_url = ! empty( $attributes['backgroundImage']['url'] ) ? esc_url_raw( $attributes['backgroundImage']['url'] ) : '';
$bg_gradient  = ! empty( $attributes['backgroundGradient'] ) ? $attributes['backgroundGradient'] : '';

if ( $bg_image_url && $bg_gradient ) {
    $row_responsive['desktop']['background-image'] = $bg_gradient . ', url(' . $bg_image_url . ')';
} elseif ( $bg_image_url ) {
    $row_responsive['desktop']['background-image'] = 'url(' . $bg_image_url . ')';
} elseif ( $bg_gradient ) {
    $row_responsive['desktop']['background-image'] = $bg_gradient;
}

if ( $bg_image_url ) {
    if ( ! empty( $attributes['backgroundSize'] ) )       $row_responsive['desktop']['background-size']       = $attributes['backgroundSize'];
    if ( ! empty( $attributes['backgroundPosition'] ) )   $row_responsive['desktop']['background-position']   = $attributes['backgroundPosition'];
    if ( ! empty( $attributes['backgroundRepeat'] ) )     $row_responsive['desktop']['background-repeat']     = $attributes['backgroundRepeat'];
    if ( ! empty( $attributes['backgroundAttachment'] ) ) $row_responsive['desktop']['background-attachment'] = $attributes['backgroundAttachment'];
}

// Border.
if ( ! empty( $attributes['border'] ) ) {
    foreach ( \ShapeBlock\Frontend\Helper::border_to_css_props( $attributes['border'] ) as $prop => $val ) {
        $row_responsive['desktop'][ $prop ] = $val;
    }
}

// Border radius.
$radius = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : [];
if ( ! empty( $radius['top'] ) )    $row_responsive['desktop']['border-top-left-radius']     = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['top'] );
if ( ! empty( $radius['right'] ) )  $row_responsive['desktop']['border-top-right-radius']    = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['right'] );
if ( ! empty( $radius['bottom'] ) ) $row_responsive['desktop']['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['bottom'] );
if ( ! empty( $radius['left'] ) )   $row_responsive['desktop']['border-bottom-left-radius']  = \ShapeBlock\Frontend\Helper::ensure_unit( $radius['left'] );

// Box shadow.
if ( ! empty( $attributes['boxShadow'] ) && ! empty( $attributes['boxShadow']['c'] ) && $attributes['boxShadow']['c'] !== 'rgba(0,0,0,0)' ) {
    $row_responsive['desktop']['box-shadow'] = \ShapeBlock\Frontend\Helper::box_shadow_to_css( $attributes['boxShadow'] );
}

// Advanced.
if ( ! empty( $attributes['overflow'] ) ) $row_responsive['desktop']['overflow'] = $attributes['overflow'];
if ( ! empty( $attributes['position'] ) ) $row_responsive['desktop']['position'] = $attributes['position'];
if ( $attributes['zIndex'] !== '' && $attributes['zIndex'] !== null ) {
    $z = trim( (string) $attributes['zIndex'] );
    if ( $z !== '' ) $row_responsive['desktop']['z-index'] = (int) $z;
}

// Sticky positioning - apply when isSticky is enabled.
if ( ! empty( $attributes['isSticky'] ) ) {
    $row_responsive['desktop']['position'] = 'sticky';
    $row_responsive['desktop']['z-index'] = 'auto';
    $row_responsive['desktop']['width'] = '100%';

    $sticky_top = isset( $attributes['stickyTop'] ) ? trim( (string) $attributes['stickyTop'] ) : '0px';
    $row_responsive['desktop']['top'] = \ShapeBlock\Frontend\Helper::ensure_unit( $sticky_top );
}

// CSS custom props for the column-width calc — columns read these via cascade and
// compute their own width as `calc(W% - (cols-1) * gap * W / 100)` so non-zero gap
// never pushes the row to overflow. See column/src/render.php.
$col_count = ( isset( $block ) && isset( $block->parsed_block['innerBlocks'] ) )
    ? count( $block->parsed_block['innerBlocks'] )
    : 0;
if ( $col_count > 0 ) {
    $row_responsive['desktop']['--bp-cols'] = $col_count;
}
foreach ( [ '' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $sfx => $dev ) {
    // Prefer explicit columnGap, fall back to the gap shorthand.
    foreach ( [ 'columnGap', 'gap' ] as $base ) {
        $val = isset( $attributes[ $base . $sfx ] ) ? trim( (string) $attributes[ $base . $sfx ] ) : '';
        if ( $val !== '' ) {
            $row_responsive[ $dev ]['--bp-gap'] = \ShapeBlock\Frontend\Helper::ensure_unit( $val );
            break;
        }
    }
}

// Columns per line on Tablet / Mobile. 0 (the default) leaves the row exactly
// as it was: desktop widths on tablet, one column per row on mobile.
$columns_per_row = function ( $count ) {
    $count = (int) $count;
    if ( $count < 1 ) {
        return '';
    }
    $pct       = rtrim( rtrim( number_format( 100 / $count, 4, '.', '' ), '0' ), '.' );
    $gap_share = rtrim( rtrim( number_format( ( $count - 1 ) / $count, 4, '.', '' ), '0' ), '.' );
    return 'calc(' . $pct . '% - var(--bp-gap, 0px) * ' . $gap_share . ')';
};
$cols_tablet = $columns_per_row( $attributes['columnsTablet'] ?? 0 );
$cols_mobile = $columns_per_row( $attributes['columnsMobile'] ?? 0 );
if ( $cols_tablet ) {
    $row_responsive['desktop']['--bp-col-tablet'] = $cols_tablet;
}
if ( $cols_mobile ) {
    $row_responsive['desktop']['--bp-col-mobile'] = $cols_mobile;
}

// Per-device widths, written per column.
//
// A column prints its own desktop width as an !important rule with four classes
// (see column/src/render.php), which a rule on the row alone can never outrank —
// that is what kept a 25% column at 25% on a phone. So the row writes one rule
// per column instead, adding that column's own class, and simply skips the
// columns that carry a width for this device themselves. The cascade then reads:
// the column's own per-device width first, this next, its desktop width last.
$per_device_css = '';
$inner_blocks   = ( isset( $block ) && isset( $block->parsed_block['innerBlocks'] ) )
    ? $block->parsed_block['innerBlocks']
    : [];

foreach ( [
    'Tablet' => [ '@media (max-width: 1024px)', $cols_tablet ],
    'Mobile' => [ '@media (max-width: 767px)', $cols_mobile ? $cols_mobile : '100%' ],
] as $suffix => $device ) {
    list( $query, $basis ) = $device;

    if ( '' === $basis ) {
        continue;
    }

    $rules = '';

    foreach ( $inner_blocks as $inner ) {
        if ( empty( $inner['blockName'] ) || 'shapeblock/column' !== $inner['blockName'] ) {
            continue;
        }

        $col_attrs = isset( $inner['attrs'] ) && is_array( $inner['attrs'] ) ? $inner['attrs'] : [];
        $col_id    = isset( $col_attrs['blockId'] ) ? sanitize_html_class( $col_attrs['blockId'] ) : '';

        if ( '' === $col_id ) {
            continue;
        }

        // The column speaks for itself on this device.
        $own_width = trim( (string) ( $col_attrs[ 'width' . $suffix ] ?? '' ) );
        $own_basis = trim( (string) ( $col_attrs[ 'flexBasis' . $suffix ] ?? '' ) );

        if ( '' !== $own_width || '' !== $own_basis ) {
            continue;
        }

        $rules .= '.shapeblock-layout-row' . $selector . ' > .shapeblock-layout-row__inner > .shapeblock-column.' . $col_id
            . '{flex:0 1 ' . $basis . ' !important;max-width:' . $basis . ' !important;}';
    }

    if ( '' !== $rules ) {
        $per_device_css .= $query . '{' . $rules . '}';
    }
}

// Max-width for boxed mode. Write the CSS variable on the row wrapper — the SCSS
// in style.scss already reads it on the inner via var(--shapeblock-layout-row-max-width).
// Setting it as a direct max-width inline would lose a specificity fight with the
// SCSS .is-content-boxed > .__inner rule, so use the variable.
if ( $content_width === 'boxed' ) {
    \ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'maxWidth', '--shapeblock-layout-row-max-width' );
}

// Compile CSS.
$style_handle = 'shapeblock-layout-row-style';
$css  = \ShapeBlock\Frontend\Helper::generate_responsive_css( $selector, $row_responsive );
$css .= $per_device_css;

wp_enqueue_style( $style_handle );
\ShapeBlock\Frontend\Helper::add_custom_style( $style_handle, $selector, $css, [] );

$classes = [
    'shapeblock-block',
    'shapeblock-layout-row',
    $unique_id,
    'is-content-' . sanitize_html_class( $content_width ),
];
if ( $vertical )     $classes[] = 'is-valign-' . sanitize_html_class( $vertical );
if ( $equal_height ) $classes[] = 'is-equal-height';
if ( $stretch )      $classes[] = 'is-stretch';
if ( $cols_tablet )  $classes[] = 'has-tablet-columns';
if ( $cols_mobile )  $classes[] = 'has-mobile-columns';
if ( ! empty( $attributes['isSticky'] ) ) $classes[] = 'is-sticky';
if ( ! empty( $attributes['hideDesktop'] ) ) $classes[] = 'shapeblock-hide-desktop';
if ( ! empty( $attributes['hideTablet'] ) )  $classes[] = 'shapeblock-hide-tablet';
if ( ! empty( $attributes['hideMobile'] ) )  $classes[] = 'shapeblock-hide-mobile';
if ( $custom_class ) {
    foreach ( explode( ' ', $custom_class ) as $c ) {
        $c = sanitize_html_class( $c );
        if ( $c ) $classes[] = $c;
    }
}

// Sticky is written inline as well as in the generated stylesheet: the inline
// declaration is the only one that outranks a theme rule setting position on
// the same element, and style.scss keys off [style*="position:sticky"].
$sticky_styles = '';
if ( ! empty( $attributes['isSticky'] ) ) {
    $sticky_styles  = 'position:sticky;z-index:auto;';
    $sticky_styles .= 'top:' . \ShapeBlock\Frontend\Helper::ensure_unit(
        ! empty( $attributes['stickyTop'] ) ? (string) $attributes['stickyTop'] : '0px'
    ) . ';';
}

$wrapper_args = [ 'class' => implode( ' ', $classes ) ];
if ( $sticky_styles ) {
    $wrapper_args['style'] = $sticky_styles;
}
$wrapper_attrs = get_block_wrapper_attributes( $wrapper_args );

// Output row with inner content.
printf(
    '<%1$s %2$s><div class="shapeblock-layout-row__inner">%3$s</div></%1$s>',
    tag_escape( $tag ),
    $wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from get_block_wrapper_attributes()
    $content        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is pre-rendered inner blocks HTML
);
