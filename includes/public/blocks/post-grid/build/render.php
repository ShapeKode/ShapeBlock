<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

// Attributes are available as $attributes array
// Map camelCase attributes to match the logic (or use direct access)

// Clamp to a sane positive range so an attribute value like -1 cannot reach
// posts_per_page as an unbounded query.
$per_page = isset($attributes['perPage']) ? (int) $attributes['perPage'] : 6;
$per_page = max( 1, min( 100, $per_page ) );
// Newest first unless the block says otherwise.
$order = isset($attributes['order']) ? $attributes['order'] : 'DESC';
$orderby = isset( $attributes['orderby'] ) ? ( 'id' === $attributes['orderby'] ? 'ID' : $attributes['orderby'] ) : 'date';
$orderby = in_array( $orderby, array( 'date', 'title', 'modified', 'rand', 'menu_order', 'comment_count', 'ID', 'author', 'name' ), true ) ? $orderby : 'date';
$offset = isset($attributes['offset']) ? $attributes['offset'] : '';
$style = isset($attributes['gridStyle']) && in_array( $attributes['gridStyle'], array( 'default', '1' ), true ) ? $attributes['gridStyle'] : 'default';
$thumbnail_size = isset($attributes['thumbnailSize']) ? $attributes['thumbnailSize'] : 'large';
$is_featured = !empty($attributes['isFeatured']) ? true : false;
$pagination = !empty($attributes['pagination']) ? true : false;
$pagination_type = isset($attributes['paginationType']) ? $attributes['paginationType'] : 'numeric';
$ignore_stikcy_posts = !empty($attributes['ignoreStikcyPosts']) ? 1 : 0;
$unique_id    = !empty($attributes['blockId']) ? sanitize_html_class( (string) $attributes['blockId'] ) : '';
if ( '' === $unique_id ) {
	$unique_id = 'shapeblock-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
}
$page_key = 'paged_' . $unique_id;

if ( is_archive() ) {
    $paged = max( 1, get_query_var('paged') );
} else {
    // filter_input() reads the raw request value directly rather than the
    // $_GET superglobal, so this public, read-only pagination parameter
    // does not need a nonce (it changes no state and matches a plain
    // bookmarkable/paginated URL, the same as WordPress's own ?paged=).
    $shapeblock_paged_param = filter_input( INPUT_GET, $page_key, FILTER_VALIDATE_INT );
    $paged                  = $shapeblock_paged_param ? max( 1, $shapeblock_paged_param ) : 1;
}

$paged = max( 1, (int) $paged );

// Styles attributes
$show_meta = !empty($attributes['showMeta']) ? true : false;
$allowed_metas = isset($attributes['allowedMetas']) ? $attributes['allowedMetas'] : [];
$meta_position = isset($attributes['metaPosition']) ? $attributes['metaPosition'] : '';
$author_prefix = isset($attributes['authorPrefix']) ? $attributes['authorPrefix'] : 'by';
$title_tag = isset($attributes['titleTag']) && in_array( $attributes['titleTag'], array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div' ), true ) ? $attributes['titleTag'] : 'h3';
$show_excerpt = !empty($attributes['showExcerpt']) ? 'yes' : 'no';
$show_read_more = !empty($attributes['showReadMore']) ? 'yes' : 'no';
$read_more_text = isset($attributes['readMoreText']) ? $attributes['readMoreText'] : 'Read More';
$read_more_icon = isset($attributes['readMoreIcon']) ? $attributes['readMoreIcon'] : 'none';
$read_more_icon_pos = isset($attributes['readMoreIconPosition']) ? $attributes['readMoreIconPosition'] : 'after';
$show_date_on_top = !empty($attributes['showDateOnTop']) ? 'yes' : 'no';
// Word counts; an empty or zero value would cut every title / excerpt to "...".
$title_trim   = isset( $attributes['titleTrim'] ) && (int) $attributes['titleTrim'] > 0 ? (int) $attributes['titleTrim'] : 100;
$excerpt_trim = isset( $attributes['excerptTrim'] ) && (int) $attributes['excerptTrim'] > 0 ? (int) $attributes['excerptTrim'] : 20;
$anim_style = isset( $attributes['animStyle'] ) && in_array( $attributes['animStyle'], array( 'left_right', 'top_bottom', 'zoom' ), true ) ? $attributes['animStyle'] : '';

$meta_style = ! empty( $attributes['metaStyle'] ) && in_array( $attributes['metaStyle'], array( 'default', '1', '2', '3' ), true ) ? $attributes['metaStyle'] : 'default';

if ( ! in_array( $meta_position, array( 'up_title', 'below_title', 'below_content' ), true ) ) {
    $meta_position = 'up_title';
}

// Columns
$c_desktop = isset($attributes['columns']) ? (int)$attributes['columns'] : 3;
$c_tablet  = isset($attributes['columnsTablet']) ? (int)$attributes['columnsTablet'] : $c_desktop;
$c_mobile  = isset($attributes['columnsMobile']) ? (int)$attributes['columnsMobile'] : 1;

$bs_col_lg = (int)(12 / max( 1, $c_desktop ));
$bs_col_md = (int)(12 / max( 1, $c_tablet ));
$bs_col_xs = (int)(12 / max( 1, $c_mobile ));

$col_class = "shapeblock-col-lg-{$bs_col_lg} shapeblock-col-md-{$bs_col_md} shapeblock-col-{$bs_col_xs}";

// Those Bootstrap classes switch at 992px and 768px, while every other setting
// in this plugin switches at 1024px and 767px — so between 993px and 1024px the
// grid still showed the desktop column count. The width is written here on the
// plugin's own breakpoints; the classes stay for anything that still reads them.
$column_responsive = [
    'desktop' => [ 'width' => 'calc(100% / ' . max( 1, $c_desktop ) . ')', 'flex' => '0 0 auto' ],
    'tablet'  => [ 'width' => 'calc(100% / ' . max( 1, $c_tablet ) . ')',  'flex' => '0 0 auto' ],
    'mobile'  => [ 'width' => 'calc(100% / ' . max( 1, $c_mobile ) . ')',  'flex' => '0 0 auto' ],
];

// Gaps
$g_desktop = isset($attributes['itemGap']) ? $attributes['itemGap'] : '4';
$g_tablet = isset($attributes['itemGapTablet']) ? $attributes['itemGapTablet'] : $g_desktop;
$g_mobile = isset($attributes['itemGapMobile']) ? $attributes['itemGapMobile'] : 0;

// Bootstrap's responsive gutter classes switch at its own breakpoints — 768px
// and 992px — which are not the ones this plugin uses ( tablet <= 1024px,
// mobile <= 767px ). Between 992px and 1024px the row therefore kept its desktop
// gutter while everything else had already switched to tablet, and below 576px
// `gx-sm-*` stopped applying altogether, so a phone silently fell back to the
// default 1.5rem instead of the mobile setting. The gutter is written here as
// plain custom properties on the row instead, on this plugin's breakpoints.
$gutter_scale = [ '0' => '0px', '1' => '0.25rem', '2' => '0.5rem', '3' => '1rem', '4' => '1.5rem', '5' => '3rem' ];
$gutter_value = function ( $step ) use ( $gutter_scale ) {
    $step = (string) (int) $step;
    return isset( $gutter_scale[ $step ] ) ? $gutter_scale[ $step ] : '1.5rem';
};
$gutter_half = function ( $step ) use ( $gutter_value ) {
    return 'calc(' . $gutter_value( $step ) . ' * 0.5)';
};

// Row gap
$rg_desktop = isset($attributes['itemRowGap']) ? $attributes['itemRowGap'] : '4';
$rg_tablet = isset($attributes['itemRowGapTablet']) ? $attributes['itemRowGapTablet'] : $rg_desktop;
$rg_mobile = isset($attributes['itemRowGapMobile']) ? $attributes['itemRowGapMobile'] : 0;

// The gutter itself, on the row.
$grid_responsive = [
    'desktop' => [ '--shapeblock-gutter-x' => $gutter_value( $g_desktop ), '--shapeblock-gutter-y' => $gutter_value( $rg_desktop ) ],
    'tablet'  => [ '--shapeblock-gutter-x' => $gutter_value( $g_tablet ),  '--shapeblock-gutter-y' => $gutter_value( $rg_tablet ) ],
    'mobile'  => [ '--shapeblock-gutter-x' => $gutter_value( $g_mobile ),  '--shapeblock-gutter-y' => $gutter_value( $rg_mobile ) ],
];

// A Bootstrap row pulls half a gutter out on each side and expects to sit in a
// container that pads the same amount back. The block has no such container, so
// the row stuck out past the block on both sides. The wrapper pays that half
// gutter back here, on the same breakpoints, which leaves the cards exactly
// where they were and keeps the row inside the block.
$wrap_responsive = [
    'desktop' => [ 'padding-right' => $gutter_half( $g_desktop ), 'padding-left' => $gutter_half( $g_desktop ) ],
    'tablet'  => [ 'padding-right' => $gutter_half( $g_tablet ),  'padding-left' => $gutter_half( $g_tablet ) ],
    'mobile'  => [ 'padding-right' => $gutter_half( $g_mobile ),  'padding-left' => $gutter_half( $g_mobile ) ],
];

// Item Styles
$item_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $item_responsive, 'itemPadding', '', ['top'=>'padding-top','right'=>'padding-right','bottom'=>'padding-bottom','left'=>'padding-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $item_responsive, 'itemMargin', '', ['top'=>'margin-top','right'=>'margin-right','bottom'=>'margin-bottom','left'=>'margin-left'], true);

$item_desktop = [];
if ( ! empty( $attributes['itemBackgroundColor'] ) ) {
    $item_desktop['background-color'] = $attributes['itemBackgroundColor'];
}
if ( ! empty( $attributes['itemBackgroundGradient'] ) ) {
    $item_desktop['background'] = $attributes['itemBackgroundGradient'];
}

$i_border_radius = $attributes['itemBorderRadius'] ?? [];
if ( ( isset( $i_border_radius['top'] ) && '' !== (string) $i_border_radius['top'] ) ) $item_desktop['border-top-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_border_radius['top'] );
if ( ( isset( $i_border_radius['right'] ) && '' !== (string) $i_border_radius['right'] ) ) $item_desktop['border-top-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_border_radius['right'] );
if ( ( isset( $i_border_radius['bottom'] ) && '' !== (string) $i_border_radius['bottom'] ) ) $item_desktop['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_border_radius['bottom'] );
if ( ( isset( $i_border_radius['left'] ) && '' !== (string) $i_border_radius['left'] ) ) $item_desktop['border-bottom-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_border_radius['left'] );

$item_responsive['desktop'] = array_merge($item_responsive['desktop'], $item_desktop);

if ( ! empty( $attributes['itemBoxShadow'] ) ) {
    $item_desktop['box-shadow'] = \ShapeBlock\Frontend\Helper::box_shadow_to_css($attributes['itemBoxShadow']);
}

if ( ! empty( $attributes['itemBorder'] ) ) {
    foreach ( \ShapeBlock\Frontend\Helper::border_to_css_props( $attributes['itemBorder'] ) as $prop => $val ) {
        $item_desktop[$prop] = $val;
    }
}

// Hover background
$item_hover = [];
if(!empty($attributes['itemBackgroundColorHover'])) {
    $item_hover['background-color'] = $attributes['itemBackgroundColorHover'] . ' !important';
}
if(!empty($attributes['itemBackgroundGradientHover'])) {
    $item_hover['background'] = $attributes['itemBackgroundGradientHover'] . ' !important';
}
if ( ! empty( $attributes['itemBorderColorHover'] ) ) {
    $item_hover['border-color'] = $attributes['itemBorderColorHover'];
}
$hover_shadow = $attributes['itemBoxShadowHover'] ?? [];
if ( is_array( $hover_shadow ) && ( ! empty( $hover_shadow['x'] ) || ! empty( $hover_shadow['y'] ) || ! empty( $hover_shadow['b'] ) || ! empty( $hover_shadow['s'] ) ) ) {
    $item_hover['box-shadow'] = \ShapeBlock\Frontend\Helper::box_shadow_to_css( $hover_shadow );
}

// Overlay Styles
$overlay_styles = [];
if ( ! empty( $attributes['itemOverlayBackgroundColor'] ) ) {
    $overlay_styles['background-color'] = $attributes['itemOverlayBackgroundColor'];
}
if ( ! empty( $attributes['itemOverlayBackgroundGradient'] ) ) {
    $overlay_styles['background'] = $attributes['itemOverlayBackgroundGradient'];
}

// content
$content_padding_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $content_padding_responsive, 'contentPadding', '', ['top'=>'padding-top','right'=>'padding-right','bottom'=>'padding-bottom','left'=>'padding-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $content_padding_responsive, 'contentTextAlign', 'text-align', [], false);

// Title
$title_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $title_responsive, 'itemTitlePadding', '', ['top'=>'padding-top','right'=>'padding-right','bottom'=>'padding-bottom','left'=>'padding-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $title_responsive, 'itemTitleMargin', '', ['top'=>'margin-top','right'=>'margin-right','bottom'=>'margin-bottom','left'=>'margin-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $title_responsive, 'itemTitleTypography', '', [
    'fontFamily'=>'font-family',
    'fontSize'=>'font-size',
    'fontWeight'=>'font-weight',
    'fontStyle'=>'font-style',
    'lineHeight'=>'line-height', 
    'textTransform'=>'text-transform', 
    'letterSpacing'=>'letter-spacing',
    'textDecoration'=>'text-decoration',
], true);

if ( ! empty( $attributes['itemTitleColor'] ) ) {
    $title_responsive['desktop']['color'] = $attributes['itemTitleColor'];
}

\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $title_responsive, 'titleTextAlign', 'text-align', [], false);

$title_hover = [];
if(!empty($attributes['itemTitleColorHover'])) {
    $title_hover['color'] = $attributes['itemTitleColorHover'];
}

// Excerpt
$excerpt_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $excerpt_responsive, 'itemExcerptPadding', '', ['top'=>'padding-top','right'=>'padding-right','bottom'=>'padding-bottom','left'=>'padding-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $excerpt_responsive, 'itemExcerptMargin', '', ['top'=>'margin-top','right'=>'margin-right','bottom'=>'margin-bottom','left'=>'margin-left'], true);
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $excerpt_responsive, 'itemExcerptTypography', '', [
    'fontFamily'=>'font-family',
    'fontSize'=>'font-size',
    'fontWeight'=>'font-weight',
    'fontStyle'=>'font-style',
    'lineHeight'=>'line-height', 
    'textTransform'=>'text-transform', 
    'letterSpacing'=>'letter-spacing',
    'textDecoration'=>'text-decoration',
], true);

if ( ! empty( $attributes['itemExcerptColor'] ) ) {
    $excerpt_responsive['desktop']['color'] = $attributes['itemExcerptColor'];
}

\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $excerpt_responsive, 'excerptTextAlign', 'text-align', [], false);

// Button Styles
$button_styles = [];
if ( ! empty( $attributes['readMoreBackgroundColor'] ) ) {
    $button_styles['background-color'] = $attributes['readMoreBackgroundColor'];
}
if ( ! empty( $attributes['readMoreColor'] ) ) {
    $button_styles['color'] = $attributes['readMoreColor'];
}
if ( ! empty( $attributes['readMoreBackgroundGradient'] ) ) {
    $button_styles['background'] = $attributes['readMoreBackgroundGradient'];
}

$ib_padding = $attributes['readMorePadding'] ?? [];
if ( ( isset( $ib_padding['top'] ) && '' !== (string) $ib_padding['top'] ) ) $button_styles['padding-top'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_padding['top'] );
if ( ( isset( $ib_padding['right'] ) && '' !== (string) $ib_padding['right'] ) ) $button_styles['padding-right'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_padding['right'] );
if ( ( isset( $ib_padding['bottom'] ) && '' !== (string) $ib_padding['bottom'] ) ) $button_styles['padding-bottom'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_padding['bottom'] );
if ( ( isset( $ib_padding['left'] ) && '' !== (string) $ib_padding['left'] ) ) $button_styles['padding-left'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_padding['left'] );

$ib_margin = $attributes['readMoreMargin'] ?? [];
if ( ( isset( $ib_margin['top'] ) && '' !== (string) $ib_margin['top'] ) ) $button_styles['margin-top'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_margin['top'] );
if ( ( isset( $ib_margin['right'] ) && '' !== (string) $ib_margin['right'] ) ) $button_styles['margin-right'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_margin['right'] );
if ( ( isset( $ib_margin['bottom'] ) && '' !== (string) $ib_margin['bottom'] ) ) $button_styles['margin-bottom'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_margin['bottom'] );
if ( ( isset( $ib_margin['left'] ) && '' !== (string) $ib_margin['left'] ) ) $button_styles['margin-left'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_margin['left'] );

$ib_typo = $attributes['readMoreTypography'] ?? [];
if ( ! empty( $ib_typo['fontFamily'] ) ) $button_styles['font-family'] = $ib_typo['fontFamily'];
if ( ! empty( $ib_typo['fontSize'] ) ) $button_styles['font-size'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_typo['fontSize'] );
if ( ! empty( $ib_typo['fontWeight'] ) ) $button_styles['font-weight'] = $ib_typo['fontWeight'];
if ( ! empty( $ib_typo['fontStyle'] ) ) $button_styles['font-style'] = $ib_typo['fontStyle'];
if ( ! empty( $ib_typo['lineHeight'] ) ) $button_styles['line-height'] = $ib_typo['lineHeight'];
if ( ! empty( $ib_typo['textDecoration'] ) ) $button_styles['text-decoration'] = $ib_typo['textDecoration'];
if ( ! empty( $ib_typo['textTransform'] ) ) $button_styles['text-transform'] = $ib_typo['textTransform'];
if ( ! empty( $ib_typo['letterSpacing'] ) ) $button_styles['letter-spacing'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_typo['letterSpacing'] );

$button_text_align_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $button_text_align_responsive, 'buttonTextAlign', 'text-align', [], false);

$ib_border_radius = $attributes['readMoreBorderRadius'] ?? [];
if ( ( isset( $ib_border_radius['top'] ) && '' !== (string) $ib_border_radius['top'] ) ) $button_styles['border-top-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_border_radius['top'] );
if ( ( isset( $ib_border_radius['right'] ) && '' !== (string) $ib_border_radius['right'] ) ) $button_styles['border-top-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_border_radius['right'] );
if ( ( isset( $ib_border_radius['bottom'] ) && '' !== (string) $ib_border_radius['bottom'] ) ) $button_styles['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_border_radius['bottom'] );
if ( ( isset( $ib_border_radius['left'] ) && '' !== (string) $ib_border_radius['left'] ) ) $button_styles['border-bottom-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $ib_border_radius['left'] );
if ( ! empty( $attributes['readMoreBorder'] ) ) {
    foreach ( \ShapeBlock\Frontend\Helper::border_to_css_props( $attributes['readMoreBorder'] ) as $prop => $val ) {
        $button_styles[$prop] = $val;
    }
}

$button_hover = [];
if(!empty($attributes['readMoreBackgroundColorHover'])) {
    $button_hover['background-color'] = $attributes['readMoreBackgroundColorHover'] . ' !important';
}
if(!empty($attributes['readMoreColorHover'])) {
    $button_hover['color'] = $attributes['readMoreColorHover'] . ' !important';
}
if(!empty($attributes['readMoreBackgroundGradientHover'])) {
    $button_hover['background'] = $attributes['readMoreBackgroundGradientHover'] . ' !important';
}

$td_styles = [];
if ( ! empty( $attributes['topDateBackgroundGradient'] ) ) {
    $td_styles['background'] = $attributes['topDateBackgroundGradient'];
} elseif ( ! empty( $attributes['topDateBackgroundColor'] ) ) {
    $td_styles['background-color'] = $attributes['topDateBackgroundColor'];
}
if(!empty($attributes['topDateColor'])) $td_styles['color'] = $attributes['topDateColor'];

$meta_styles = [];
if(!empty($attributes['metaColor'])) $meta_styles['color'] = $attributes['metaColor'];

$metas_styles = [];
$meta_margin = $attributes['metaMargin'] ?? [];
if(( isset( $meta_margin['top'] ) && '' !== (string) $meta_margin['top'] )) $metas_styles['margin-top'] = \ShapeBlock\Frontend\Helper::ensure_unit($meta_margin['top']);
if(( isset( $meta_margin['right'] ) && '' !== (string) $meta_margin['right'] )) $metas_styles['margin-right'] = \ShapeBlock\Frontend\Helper::ensure_unit($meta_margin['right']);
if(( isset( $meta_margin['bottom'] ) && '' !== (string) $meta_margin['bottom'] )) $metas_styles['margin-bottom'] = \ShapeBlock\Frontend\Helper::ensure_unit($meta_margin['bottom']);
if(( isset( $meta_margin['left'] ) && '' !== (string) $meta_margin['left'] )) $metas_styles['margin-left'] = \ShapeBlock\Frontend\Helper::ensure_unit($meta_margin['left']);

$meta_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $meta_responsive, 'metaTypography', '', [
    'fontFamily'=>'font-family',
    'fontSize'=>'font-size',
    'fontWeight'=>'font-weight',
    'fontStyle'=>'font-style',
    'lineHeight'=>'line-height',
    'textTransform'=>'text-transform',
    'letterSpacing'=>'letter-spacing',
    'textDecoration'=>'text-decoration',
], true);

$meta_hover = [];
if(!empty($attributes['metaColorHover'])) $meta_hover['color'] = $attributes['metaColorHover'];

$meta_icon_styles = [];
if(!empty($attributes['metaIconColor'])) $meta_icon_styles['color'] = $attributes['metaIconColor'];

$meta_icon_hover = [];
if(!empty($attributes['metaIconColorHover'])) $meta_icon_hover['color'] = $attributes['metaIconColorHover'];

$pag_styles = [];
if ( ! empty( $attributes['paginationColor'] ) ) $pag_styles['color'] = $attributes['paginationColor'];
if ( ! empty( $attributes['paginationBackgroundGradient'] ) ) {
    $pag_styles['background'] = $attributes['paginationBackgroundGradient'];
} elseif ( ! empty( $attributes['paginationBackgroundColor'] ) ) {
    $pag_styles['background-color'] = $attributes['paginationBackgroundColor'];
}

$pag_typo = $attributes['paginationTypography'] ?? [];
if ( ! empty( $pag_typo['fontFamily'] ) ) $pag_styles['font-family'] = $pag_typo['fontFamily'];
if ( ! empty( $pag_typo['fontSize'] ) ) $pag_styles['font-size'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pag_typo['fontSize'] );
if ( ! empty( $pag_typo['fontWeight'] ) ) $pag_styles['font-weight'] = $pag_typo['fontWeight'];
if ( ! empty( $pag_typo['fontStyle'] ) ) $pag_styles['font-style'] = $pag_typo['fontStyle'];
if ( ! empty( $pag_typo['lineHeight'] ) ) $pag_styles['line-height'] = $pag_typo['lineHeight'];
if ( ! empty( $pag_typo['textTransform'] ) ) $pag_styles['text-transform'] = $pag_typo['textTransform'];
if ( ! empty( $pag_typo['letterSpacing'] ) ) $pag_styles['letter-spacing'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pag_typo['letterSpacing'] );
if ( ! empty( $pag_typo['textDecoration'] ) ) $pag_styles['text-decoration'] = $pag_typo['textDecoration'];

$pag_hover = [];
if ( ! empty( $attributes['paginationColorHover'] ) ) $pag_hover['color'] = $attributes['paginationColorHover'];
// The border follows the hover colour only; a gradient cannot be a border colour.
// A hover colour over a normal-state gradient must use the shorthand, or the gradient image stays on top.
if ( ! empty( $attributes['paginationBackgroundGradientHover'] ) ) {
    $pag_hover['background'] = $attributes['paginationBackgroundGradientHover'];
} elseif ( ! empty( $attributes['paginationBackgroundColorHover'] ) ) {
    $pag_hover[ ! empty( $attributes['paginationBackgroundGradient'] ) ? 'background' : 'background-color' ] = $attributes['paginationBackgroundColorHover'];
}
if ( ! empty( $attributes['paginationBackgroundColorHover'] ) ) {
    $pag_hover['border-color'] = $attributes['paginationBackgroundColorHover'];
}

// Pagination Button Border
if ( ! empty( $attributes['paginationBtnBorder'] ) ) {
    foreach ( \ShapeBlock\Frontend\Helper::border_to_css_props( $attributes['paginationBtnBorder'] ) as $prop => $val ) {
        $pag_styles[$prop] = $val;
    }
}

// Pagination Button Border Radius
$pagination_btn_border_radius = $attributes['paginationBtnBorderRadius'] ?? [];
if ( ( isset( $pagination_btn_border_radius['top'] ) && '' !== (string) $pagination_btn_border_radius['top'] ) ) $pag_styles['border-top-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pagination_btn_border_radius['top'] );
if ( ( isset( $pagination_btn_border_radius['right'] ) && '' !== (string) $pagination_btn_border_radius['right'] ) ) $pag_styles['border-top-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pagination_btn_border_radius['right'] );
if ( ( isset( $pagination_btn_border_radius['bottom'] ) && '' !== (string) $pagination_btn_border_radius['bottom'] ) ) $pag_styles['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pagination_btn_border_radius['bottom'] );
if ( ( isset( $pagination_btn_border_radius['left'] ) && '' !== (string) $pagination_btn_border_radius['left'] ) ) $pag_styles['border-bottom-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $pagination_btn_border_radius['left'] );


$thumbnail_height_responsive = ['desktop' => [], 'tablet' => [], 'mobile' => []];
\ShapeBlock\Frontend\Helper::add_responsive_vars($attributes, $thumbnail_height_responsive, 'thumbnailHeight', 'height', [], false);

// Thumbnail Border Radius
$thumbnail_border_radius_styles = [];
$t_border_radius = $attributes['thumbnailBorderRadius'] ?? [];
if ( ( isset( $t_border_radius['top'] ) && '' !== (string) $t_border_radius['top'] ) ) $thumbnail_border_radius_styles['border-top-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $t_border_radius['top'] );
if ( ( isset( $t_border_radius['right'] ) && '' !== (string) $t_border_radius['right'] ) ) $thumbnail_border_radius_styles['border-top-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $t_border_radius['right'] );
if ( ( isset( $t_border_radius['bottom'] ) && '' !== (string) $t_border_radius['bottom'] ) ) $thumbnail_border_radius_styles['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $t_border_radius['bottom'] );
if ( ( isset( $t_border_radius['left'] ) && '' !== (string) $t_border_radius['left'] ) ) $thumbnail_border_radius_styles['border-bottom-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $t_border_radius['left'] );

$style_handle = 'shapeblock-post-grid-style';
$selector    = '.shapeblock-post-grid-block-wrap.' . $unique_id;

$full_responsive_css = "";
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector, $wrap_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.shapeblock-row', $grid_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid > .shapeblock-grid-item', $column_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-grid-item-inner', $item_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-blog-title', $title_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-post-metas', $meta_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-blog-excerpt', $excerpt_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-blog-content', $content_padding_responsive);
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-blog-img img', $thumbnail_height_responsive);   
$full_responsive_css .= \ShapeBlock\Frontend\Helper::generate_responsive_css($selector . ' .shapeblock-post-grid.style-' . $style . ' .shapeblock-grid-item .shapeblock-read-more', $button_text_align_responsive);   

wp_enqueue_style( $style_handle );
\ShapeBlock\Frontend\Helper::add_custom_style( $style_handle, $selector, $full_responsive_css, [
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-grid-item-inner'    => \ShapeBlock\Frontend\Helper::get_inline_styles($item_desktop),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-grid-item-inner:hover'    => \ShapeBlock\Frontend\Helper::get_inline_styles($item_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-overlay-all'        => \ShapeBlock\Frontend\Helper::get_inline_styles($overlay_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-blog-title a:hover' => \ShapeBlock\Frontend\Helper::get_inline_styles($title_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-read-more .shapeblock-read-more-link'     => \ShapeBlock\Frontend\Helper::get_inline_styles($button_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-read-more .shapeblock-read-more-link:hover'=> \ShapeBlock\Frontend\Helper::get_inline_styles($button_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-blog-date-top'      => \ShapeBlock\Frontend\Helper::get_inline_styles($td_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas'         => \ShapeBlock\Frontend\Helper::get_inline_styles($metas_styles),
    // Meta text is links (author, category, tag) and plain text (date, comments).
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas .bldpost-meta'       => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas a'                   => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas .bldpost-meta:hover' => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas a:hover'             => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas .shapeblock-meta-icon'                     => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_icon_styles),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-post-metas .bldpost-meta:hover .shapeblock-meta-icon' => \ShapeBlock\Frontend\Helper::get_inline_styles($meta_icon_hover),
    '.shapeblock-pagination .page-numbers' => \ShapeBlock\Frontend\Helper::get_inline_styles($pag_styles),
    '.shapeblock-pagination .page-numbers.current' => \ShapeBlock\Frontend\Helper::get_inline_styles($pag_hover),
    '.shapeblock-pagination a:hover' => \ShapeBlock\Frontend\Helper::get_inline_styles($pag_hover),
    '.shapeblock-post-grid .shapeblock-grid-item .shapeblock-blog-img'   => \ShapeBlock\Frontend\Helper::get_inline_styles($thumbnail_border_radius_styles),
] );


$args = array(
    'post_type'      => 'post',
    'posts_per_page' => $per_page,
    'post_status'    => 'publish',
    'order'          => in_array( $order, ['ASC','DESC'], true ) ? $order : 'DESC',
    'orderby'        => $orderby,
    'paged'          => $paged,
    'ignore_sticky_posts' => $ignore_stikcy_posts,
);

if ( ! empty( $offset ) ) {
    // When using offset with pagination, we need to adjust it for each page
    $args['offset'] = (int) $offset + ( ( $paged - 1 ) * $per_page );
}

if ( ! empty( $attributes['posts'] ) && ! in_array( 'all', $attributes['posts'] ) ) {
    $args['post__in'] = array_map( 'intval', $attributes['posts'] );
    $args['orderby'] = 'post__in';
}

if ( ! empty( $attributes['excludes'] ) && ! in_array( 'no-excludes', $attributes['excludes'] ) ) {
    $exclude_ids = array_map( 'intval', $attributes['excludes'] );

    if ( ! empty( $args['post__in'] ) ) {
        // The editor also picked specific posts, so the exclusion is just a
        // subtraction from that list — no extra query needed.
        $args['post__in'] = array_values( array_diff( $args['post__in'], $exclude_ids ) );
    } else {
        /*
         * Turn "everything except these" into "exactly these". An exclusion in
         * the query makes the database walk rows only to throw them away, which
         * is why post__not_in is discouraged; resolving the ids first costs one
         * extra query over a single indexed column and then the grid asks for a
         * set it already knows.
         */
        $candidates = get_posts(
            array(
                'post_type'      => $args['post_type'],
                'post_status'    => $args['post_status'],
                // Bounded: a grid never pages through more than this many posts.
                'posts_per_page' => 1000,
                'fields'         => 'ids',
                'no_found_rows'  => true,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
                'orderby'        => $args['orderby'],
                'order'          => $args['order'],
            )
        );

        $args['post__in'] = array_values( array_diff( array_map( 'intval', $candidates ), $exclude_ids ) );
    }

    // WP_Query ignores an empty post__in and would show everything; an
    // impossible id shows nothing, which is what excluding everything means.
    if ( empty( $args['post__in'] ) ) {
        $args['post__in'] = array( 0 );
    }
}

if ( ! empty( $attributes['categories'] ) && ! in_array( 'all', $attributes['categories'] ) ) {
    $cat_ids = [];

    foreach ( $attributes['categories'] as $cat ) {
        if ( is_numeric( $cat ) ) {
            $cat_ids[] = (int) $cat;
        } else {
            $term = get_term_by( 'slug', $cat, 'category' );
            if ( $term ) {
                $cat_ids[] = (int) $term->term_id;
            }
        }
    }
    $args['category__in'] = array_map( 'intval', $cat_ids );
}


if($is_featured == true) {
    /*
     * "Featured" is WordPress's own sticky flag — the one editors set with
     * "Stick to the top of the blog". This used to filter on an _is_featured post
     * meta key that nothing in the plugin ever wrote, so turning the option on
     * returned nothing at all. Sticky posts are the feature editors actually
     * have, and reading them needs no meta query.
     */
    $sticky = array_map( 'intval', (array) get_option( 'sticky_posts', array() ) );

    if ( ! empty( $args['post__in'] ) ) {
        $sticky = array_values( array_intersect( $args['post__in'], $sticky ) );
    }

    // WP_Query ignores an empty post__in, which would show everything; an
    // impossible id shows nothing, which is what "no featured posts" means.
    $args['post__in']            = $sticky ? $sticky : array( 0 );
    $args['ignore_sticky_posts'] = true;
}

$query = new \WP_Query( $args );

// WP_Query counts pages over every post, ignoring the offset, so the pager
// would offer pages that come out empty. Count them over what is left.
if ( ! empty( $offset ) ) {
    $query->max_num_pages = (int) ceil( max( 0, (int) $query->found_posts - (int) $offset ) / $per_page );
}
$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-post-grid-block-wrap ' . $unique_id ) );

if ( empty( $block_wrap_attr ) ) {
    $block_wrap_attr = 'class="shapeblock-block shapeblock-post-grid-block-wrap ' . esc_attr( $unique_id ) . '"';
}

$template_pl_path = SHAPEBLOCK_PL_PATH;

if ( $query->have_posts() ) :
?>
    <div <?php echo wp_kses_post($block_wrap_attr); ?>>
        <div class="<?php echo esc_attr( 'shapeblock-post-grid shapeblock-row style-' . $style . ( ! empty( $attributes['itemHoverLift'] ) ? ' is-hover-lift' : '' ) . ( ! empty( $attributes['buttonAtBottom'] ) ? ' is-button-bottom' : '' ) ); ?>">
            <?php
            while ( $query->have_posts() ) : $query->the_post();
                $item_class = $col_class;
                if(is_sticky()) {
                    $item_class .= ' shapeblock-sticky-post';
                }

                if(!empty($anim_style)) {
                    $item_class .= ' ' . $anim_style;
                }

                $trimmed_title = wp_trim_words( get_the_title(), $title_trim, '...' );
                $trimmed_excerpt = wp_trim_words( get_the_excerpt(), $excerpt_trim, '...' );

                $style_file = $template_pl_path . 'includes/public/template-parts/post-grid/style-' . $style . '.php';

                if ( file_exists( $style_file ) ) {
                    include $style_file;
                }
            endwhile;
            ?>
        </div>
        <?php include SHAPEBLOCK_PL_PATH . 'includes/public/template-parts/pagination/pagination.php'; ?>
    </div>
<?php
    wp_reset_postdata();
else:
    ?>
    <div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
        <p><?php esc_html_e('No posts found.', 'shapeblock'); ?></p>
    </div>
    <?php
endif;
?>
<?php } )( $attributes, $content, $block );
