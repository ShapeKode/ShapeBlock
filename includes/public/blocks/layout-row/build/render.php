<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
return ( function ( $attributes, $content, $block ) {

$allowed_tags = [ 'div', 'section', 'article', 'main', 'header', 'footer', 'aside' ];
$tag          = isset( $attributes['htmlTag'] ) && in_array( $attributes['htmlTag'], $allowed_tags, true )
    ? $attributes['htmlTag']
    : 'div';

$content_width = isset( $attributes['contentWidth'] ) && in_array( $attributes['contentWidth'], [ 'boxed', 'full', 'custom' ], true ) ? $attributes['contentWidth'] : 'boxed';
$vertical      = isset( $attributes['verticalAlign'] ) ? $attributes['verticalAlign'] : '';
$equal_height  = ! empty( $attributes['equalHeight'] );
$stretch       = ! empty( $attributes['stretchColumns'] );
$custom_class  = isset( $attributes['customClass'] ) ? trim( (string) $attributes['customClass'] ) : '';
$unique_id     = ! empty( $attributes['blockId'] )
    ? sanitize_html_class( $attributes['blockId'] )
    : 'shapeblock-layout-row-' . wp_rand( 100, 99999 );
// A copied row that still carries the original's id gets its own.
$unique_id = \ShapeBlock\Frontend\Helper::unique_block_id( $unique_id );

$selector = '.' . $unique_id;

$row_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];

// A gap of a bare number gets px - including 0, which would otherwise count as
// "not set": the row kept its default 20px gap while the columns, sized for no
// gap, overflowed it (and a unitless 0 inside their calc() is invalid CSS).
foreach ( [ 'gap', 'rowGap', 'columnGap' ] as $gap_key ) {
    foreach ( [ '', 'Tablet', 'Mobile' ] as $gap_sfx ) {
        if ( isset( $attributes[ $gap_key . $gap_sfx ] ) && is_numeric( $attributes[ $gap_key . $gap_sfx ] ) ) {
            $attributes[ $gap_key . $gap_sfx ] = ( 0 + $attributes[ $gap_key . $gap_sfx ] ) . 'px';
        }
    }
}

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
if ( isset( $attributes['overflow'] ) && in_array( $attributes['overflow'], [ 'visible', 'hidden', 'auto', 'scroll' ], true ) ) $row_responsive['desktop']['overflow'] = $attributes['overflow'];
if ( isset( $attributes['position'] ) && in_array( $attributes['position'], [ 'static', 'relative', 'absolute', 'fixed' ], true ) ) $row_responsive['desktop']['position'] = $attributes['position'];
if ( isset( $attributes['zIndex'] ) && $attributes['zIndex'] !== '' ) {
    $z = trim( (string) $attributes['zIndex'] );
    if ( $z !== '' ) $row_responsive['desktop']['z-index'] = (int) $z;
}

// Sticky positioning - apply when isSticky is enabled.
if ( ! empty( $attributes['isSticky'] ) ) {
    $row_responsive['desktop']['position'] = 'sticky';
    // The Z-Index setting still applies to a sticky row.
    $row_responsive['desktop']['z-index'] = ( isset( $attributes['zIndex'] ) && '' !== trim( (string) $attributes['zIndex'] ) ) ? (int) $attributes['zIndex'] : 'auto';
    $row_responsive['desktop']['width'] = '100%';

    $sticky_top = isset( $attributes['stickyTop'] ) ? trim( (string) $attributes['stickyTop'] ) : '0px';
    $row_responsive['desktop']['top'] = \ShapeBlock\Frontend\Helper::ensure_unit( $sticky_top );
}

// The gap, as a custom property for the column-width calc: columns read it via
// cascade and compute their own width as `calc(W% - gap * (100 - W) / 100)`, so
// a non-zero gap never pushes the row to overflow. See column/src/render.php.
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
    // Position among the row's rendered children. A column is matched by its
    // place, not its blockId: a copied column that still carries the original's
    // id is printed under a fresh one (Helper::unique_block_id()), which an
    // id-based rule written here would no longer reach.
    $position = 0;

    foreach ( $inner_blocks as $inner ) {
        if ( empty( $inner['blockName'] ) ) {
            continue;
        }
        $position++;
        if ( 'shapeblock/column' !== $inner['blockName'] ) {
            continue;
        }

        $col_attrs = isset( $inner['attrs'] ) && is_array( $inner['attrs'] ) ? $inner['attrs'] : [];

        // The column speaks for itself on this device.
        $own_width = trim( (string) ( $col_attrs[ 'width' . $suffix ] ?? '' ) );
        $own_basis = trim( (string) ( $col_attrs[ 'flexBasis' . $suffix ] ?? '' ) );

        if ( '' !== $own_width || '' !== $own_basis ) {
            continue;
        }

        $rules .= '.shapeblock-layout-row' . $selector . ' > .shapeblock-layout-row__inner > .shapeblock-column:nth-child(' . $position . ')'
            . '{flex:0 1 ' . $basis . ' !important;max-width:' . $basis . ' !important;}';
    }

    if ( '' !== $rules ) {
        $per_device_css .= $query . '{' . $rules . '}';
    }
}

// Direction "column": the columns are stacked, so the row-of-columns widths
// (a flex basis and max-width of e.g. 33%) would leave each one a third wide
// and give it a third of the height. Each stacked column takes the full width
// instead - unless it has a width of its own for that device.
$dir_desktop = (string) ( $attributes['flexDirection'] ?? '' );
$dir_tablet  = (string) ( $attributes['flexDirectionTablet'] ?? '' );
$dir_mobile  = (string) ( $attributes['flexDirectionMobile'] ?? '' );
$dir_tablet  = '' !== $dir_tablet ? $dir_tablet : $dir_desktop;
$dir_mobile  = '' !== $dir_mobile ? $dir_mobile : $dir_tablet;
foreach ( [
    ''       => [ '', $dir_desktop ],
    'Tablet' => [ '@media (max-width: 1024px)', $dir_tablet ],
    'Mobile' => [ '@media (max-width: 767px)', $dir_mobile ],
] as $suffix => $device ) {
    list( $query, $dir ) = $device;
    if ( 0 !== strpos( $dir, 'column' ) ) {
        continue;
    }
    $rules    = '';
    $position = 0;
    foreach ( $inner_blocks as $inner ) {
        if ( empty( $inner['blockName'] ) ) {
            continue;
        }
        $position++;
        if ( 'shapeblock/column' !== $inner['blockName'] ) {
            continue;
        }
        $col_attrs = isset( $inner['attrs'] ) && is_array( $inner['attrs'] ) ? $inner['attrs'] : [];
        if ( '' !== trim( (string) ( $col_attrs[ 'width' . $suffix ] ?? '' ) ) ) {
            continue;
        }
        $rules .= '.shapeblock-layout-row' . $selector . ' > .shapeblock-layout-row__inner > .shapeblock-column.shapeblock-column:nth-child(' . $position . ')'
            . '{flex:0 0 auto !important;max-width:100% !important;width:100%;}';
    }
    if ( '' !== $rules ) {
        $per_device_css .= '' === $query ? $rules : $query . '{' . $rules . '}';
    }
}

// Max-width for boxed mode. Write the CSS variable on the row wrapper — the SCSS
// in style.scss already reads it on the inner via var(--shapeblock-layout-row-max-width).
// Setting it as a direct max-width inline would lose a specificity fight with the
// SCSS .is-content-boxed > .__inner rule, so use the variable.
if ( $content_width === 'boxed' ) {
    \ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'maxWidth', '--shapeblock-layout-row-max-width' );
}

// Custom width: the width of the whole Row, per device, read by style.scss.
if ( $content_width === 'custom' ) {
    \ShapeBlock\Frontend\Helper::add_responsive_vars( $attributes, $row_responsive, 'customWidth', '--shapeblock-layout-row-width' );
}

// Margin gets its own, stronger rule. A row placed straight in the page content
// sits in WordPress's constrained layout, which prints
//   :root :where(.is-layout-constrained) > * { margin-block: 1.5rem 0 }
// at the same specificity as `.<blockId>` and later in the page -- so it won and
// the row's margin (bottom above all) was reset to 0 on the front end. The Row's
// own reset in style.scss has two classes as well, so the margin rule has three:
// it wins whatever order a cache or minify plugin prints the stylesheets in,
// without !important.
$row_margin = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];
foreach ( $row_responsive as $device => $decls ) {
    foreach ( $decls as $prop => $val ) {
        if ( 0 === strpos( $prop, 'margin-' ) ) {
            $row_margin[ $device ][ $prop ] = $val;
            unset( $row_responsive[ $device ][ $prop ] );
        }
    }
}

// Compile CSS.
$style_handle = 'shapeblock-layout-row-style';
$css  = \ShapeBlock\Frontend\Helper::generate_responsive_css( $selector, $row_responsive );
$css .= \ShapeBlock\Frontend\Helper::generate_responsive_css( '.shapeblock-block.shapeblock-layout-row' . $selector, $row_margin );
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
    $sticky_z       = ( isset( $attributes['zIndex'] ) && '' !== trim( (string) $attributes['zIndex'] ) ) ? (int) $attributes['zIndex'] : 'auto';
    $sticky_styles  = 'position:sticky;z-index:' . $sticky_z . ';';
    $sticky_styles .= 'top:' . \ShapeBlock\Frontend\Helper::ensure_unit(
        ! empty( $attributes['stickyTop'] ) ? (string) $attributes['stickyTop'] : '0px'
    ) . ';';
}

// Wide / Full width come from the theme's layout (theme.json). A theme without
// theme.json gives them no size, so the Row sizes itself there (style.scss).
$align = isset( $attributes['align'] ) && in_array( $attributes['align'], [ 'wide', 'full' ], true ) ? $attributes['align'] : '';
if ( '' !== $align && ! wp_theme_has_theme_json() ) {
    $classes[] = 'has-align-fallback';
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
    wp_kses_post( $wrapper_attrs ),
    // The inner blocks, already rendered by WordPress, escaped against the
    // shared template allowlist - see the note in the Column block.
    // Any CSS the inner blocks carry in their markup is kept (see move_block_css()).
    wp_kses( \ShapeBlock\Frontend\Helper::move_block_css( $content, $style_handle ), \ShapeBlock\Frontend\Helper::template_allowed_html() )
);

} )( $attributes, $content, $block );
