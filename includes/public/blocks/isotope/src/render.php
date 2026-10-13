<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Isotope Filter block.
 *
 * A filter bar (one button per category, plus an optional "All") above a grid of
 * items. Each item belongs to the category it was added under and carries that
 * category's key in `data-cat`; view.js shows and hides items from that.
 * Element classes use the "shapeblock-iso" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-iso-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$unique_id = $H::unique_block_id( sanitize_html_class( $unique_id ) );

$categories = isset( $attributes['categories'] ) && is_array( $attributes['categories'] ) ? array_values( $attributes['categories'] ) : [];
$show_bar   = ! isset( $attributes['showFilters'] ) || false !== $attributes['showFilters'];
$show_all   = ! isset( $attributes['showAll'] ) || false !== $attributes['showAll'];
$all_label  = isset( $attributes['allLabel'] ) && '' !== trim( (string) $attributes['allLabel'] ) ? (string) $attributes['allLabel'] : __( 'All', 'shapeblock' );
$show_icon  = ! isset( $attributes['showIcon'] ) || false !== $attributes['showIcon'];
// Search box, off unless switched on. With it on, the filter bar sits on the
// left and the box on the right of one header row.
$show_search = ! empty( $attributes['showSearch'] );
$search_ph   = isset( $attributes['searchPlaceholder'] ) && '' !== trim( (string) $attributes['searchPlaceholder'] ) ? (string) $attributes['searchPlaceholder'] : __( 'Search…', 'shapeblock' );
$no_results  = isset( $attributes['noResultsText'] ) && '' !== trim( (string) $attributes['noResultsText'] ) ? (string) $attributes['noResultsText'] : __( 'Nothing found. Try another word.', 'shapeblock' );
$lower       = function ( $text ) {
	$text = wp_strip_all_tags( (string) $text );
	return function_exists( 'mb_strtolower' ) ? mb_strtolower( $text ) : strtolower( $text );
};
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag  = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';
$equal      = ! isset( $attributes['equalHeight'] ) || false !== $attributes['equalHeight'];
$icon_pos   = ( isset( $attributes['iconPosition'] ) && 'left' === $attributes['iconPosition'] ) ? 'left' : 'top';
$card_align = isset( $attributes['cardAlign'] ) && in_array( $attributes['cardAlign'], [ 'left', 'center', 'right' ], true ) ? $attributes['cardAlign'] : 'left';
$anim       = isset( $attributes['animationType'] ) && in_array( $attributes['animationType'], [ 'none', 'fade', 'scale' ], true ) ? $attributes['animationType'] : 'scale';
$duration   = isset( $attributes['animationDuration'] ) && is_numeric( $attributes['animationDuration'] ) ? max( 0, min( 2000, (int) $attributes['animationDuration'] ) ) : 400;
$load_more  = ! isset( $attributes['loadMore'] ) || false !== $attributes['loadMore'];
$initial    = isset( $attributes['initialItems'] ) && is_numeric( $attributes['initialItems'] ) ? max( 1, min( 500, (int) $attributes['initialItems'] ) ) : 12;
$more_step  = isset( $attributes['loadMoreStep'] ) && is_numeric( $attributes['loadMoreStep'] ) ? max( 1, min( 500, (int) $attributes['loadMoreStep'] ) ) : 12;
$more_label = isset( $attributes['loadMoreText'] ) && '' !== trim( (string) $attributes['loadMoreText'] ) ? (string) $attributes['loadMoreText'] : __( 'Load More', 'shapeblock' );
$badge_pos  = isset( $attributes['badgePosition'] ) && in_array( $attributes['badgePosition'], [ 'top-right', 'top-left', 'inline' ], true ) ? $attributes['badgePosition'] : 'top-right';
$badge_look = isset( $attributes['badgeStyle'] ) && in_array( $attributes['badgeStyle'], [ 'pill', 'square', 'soft', 'outline', 'ribbon', 'tab' ], true ) ? $attributes['badgeStyle'] : 'pill';
// A ribbon and a tab need the card's corner / top edge; above the title they
// fall back to a pill and a square.
if ( 'inline' === $badge_pos && in_array( $badge_look, [ 'ribbon', 'tab' ], true ) ) {
	$badge_look = 'ribbon' === $badge_look ? 'pill' : 'square';
}

// Which filter is showing first: "all", or a category's position.
$default = isset( $attributes['defaultFilter'] ) ? (string) $attributes['defaultFilter'] : 'all';
$active  = 'all';
if ( ctype_digit( $default ) && isset( $categories[ (int) $default ] ) ) {
	$active = 'c' . (int) $default;
}
// No "All" button, so start on the first category. With the filter bar hidden
// there are no buttons at all, and "all" simply shows every item.
if ( 'all' === $active && $show_bar && ! $show_all && ! empty( $categories ) ) {
	$active = 'c0';
}

// Items that belong to the filter showing first. With Load More on, only the
// first $initial of them start visible; view.js shows the rest on request.
$matching_total = 0;
foreach ( $categories as $ci => $cat ) {
	if ( 'all' === $active || 'c' . (int) $ci === $active ) {
		$matching_total += ( ! empty( $cat['items'] ) && is_array( $cat['items'] ) ) ? count( $cat['items'] ) : 0;
	}
}
$shown = 0;

$wrap_classes = [
	'shapeblock-block',
	'shapeblock-iso-block-wrap',
	$unique_id,
	'shapeblock-iso',
	'shapeblock-iso-icon-' . $icon_pos,
	'shapeblock-iso-badge-' . $badge_pos,
	'shapeblock-iso-badge-style-' . $badge_look,
];
if ( $equal ) {
	$wrap_classes[] = 'is-equal-height';
}

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// Nothing to show: say so, in the editor and for visitors alike.
$has_items = false;
foreach ( $categories as $cat ) {
	if ( ! empty( $cat['items'] ) && is_array( $cat['items'] ) ) {
		$has_items = true;
		break;
	}
}
if ( ! $has_items ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Add a category and some items to show here.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-iso-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-isotope-style';

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
	if ( 'padding' === $type ) {
		$map = [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ];
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
$bg = function ( $colorKey, $gradKey = '' ) use ( $attributes ) {
	if ( '' !== $gradKey && ! empty( $attributes[ $gradKey ] ) ) return [ 'background' => $attributes[ $gradKey ] ];
	if ( ! empty( $attributes[ $colorKey ] ) ) return [ 'background' => \ShapeBlock\Frontend\Helper::sanitize_css_color( (string) $attributes[ $colorKey ], '' ) ];
	return [];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};
$n = function ( $key, $fallback ) use ( $attributes ) {
	return ( isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) && (int) $attributes[ $key ] > 0 ) ? (int) $attributes[ $key ] : $fallback;
};

// Filter bar. With the search box on, the space below belongs to the header
// row that holds both, and the bar keeps to the left (style.scss).
// The space is a custom property there: with the line below the header on,
// it sits on both sides of the line (style.scss).
$bar    = [];
$header = [];
if ( '' !== $u( 'filterSpace' ) ) {
	if ( $show_search ) {
		$header['--shapeblock-iso-header-space'] = $u( 'filterSpace' );
	} else {
		$bar['margin-bottom'] = $u( 'filterSpace' );
	}
}
$separator = $show_search && ( ! isset( $attributes['showSeparator'] ) || false !== $attributes['showSeparator'] );
if ( $separator ) {
	$header['border-bottom-style'] = isset( $attributes['separatorStyle'] ) && in_array( $attributes['separatorStyle'], [ 'solid', 'dashed', 'dotted', 'double' ], true ) ? $attributes['separatorStyle'] : 'solid';
	if ( '' !== $u( 'separatorWidth' ) ) $header['border-bottom-width'] = $u( 'separatorWidth' );
	if ( ! empty( $attributes['separatorColor'] ) ) $header['border-bottom-color'] = $H::sanitize_css_color( (string) $attributes['separatorColor'], '' );
}
if ( '' !== $u( 'filterGap' ) ) $bar['gap'] = $u( 'filterGap' );

// Search box.
$search_wrap = '' !== $u( 'searchWidth' ) ? [ 'width' => $u( 'searchWidth' ) ] : [];
$search      = array_merge( $typo( $attributes['searchTypography'] ?? [] ), $bg( 'searchBg', 'searchBgGradient' ), $dims( $attributes['searchRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['searchColor'] ) ) $search['color'] = $H::sanitize_css_color( (string) $attributes['searchColor'], '' );
if ( ! empty( $attributes['searchBorder'] ) ) $search = array_merge( $search, $H::border_to_css_props( $attributes['searchBorder'] ) );
$search_focus       = ! empty( $attributes['searchBorderColorFocus'] ) ? [ 'border-color' => $attributes['searchBorderColorFocus'] ] : [];
$search_placeholder = ! empty( $attributes['searchPlaceholderColor'] ) ? [ 'color' => $attributes['searchPlaceholderColor'] ] : [];
$search_icon        = ! empty( $attributes['searchIconColor'] ) ? [ 'color' => $attributes['searchIconColor'] ] : [];
$empty              = ! empty( $attributes['noResultsColor'] ) ? [ 'color' => $attributes['noResultsColor'] ] : [];

// Filter button: normal / hover / active.
$btn = array_merge( $typo( $attributes['filterTypography'] ?? [] ), $dims( $attributes['filterPadding'] ?? [], 'padding' ), $dims( $attributes['filterRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['filterColor'] ) ) $btn['color'] = $H::sanitize_css_color( (string) $attributes['filterColor'], '' );
$btn = array_merge( $btn, $bg( 'filterBg', 'filterBgGradient' ) );
if ( ! empty( $attributes['filterBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['filterBorder'] ) );
$btn_hover = [];
if ( ! empty( $attributes['filterColorHover'] ) ) $btn_hover['color'] = $H::sanitize_css_color( (string) $attributes['filterColorHover'], '' );
$btn_hover = array_merge( $btn_hover, $bg( 'filterBgHover', 'filterBgGradientHover' ) );
if ( ! empty( $attributes['filterBorderColorHover'] ) ) $btn_hover['border-color'] = $H::sanitize_css_color( (string) $attributes['filterBorderColorHover'], '' );
$btn_active = [];
if ( ! empty( $attributes['filterColorActive'] ) ) $btn_active['color'] = $H::sanitize_css_color( (string) $attributes['filterColorActive'], '' );
$btn_active = array_merge( $btn_active, $bg( 'filterBgActive', 'filterBgGradientActive' ) );
if ( ! empty( $attributes['filterBorderColorActive'] ) ) $btn_active['border-color'] = $H::sanitize_css_color( (string) $attributes['filterBorderColorActive'], '' );

// Grid. Columns and gap are CSS variables so the stylesheet default and the
// per-device values share one rule.
$grid = [
	'--shapeblock-iso-cols' => (string) $n( 'columns', 3 ),
];
if ( '' !== $u( 'gap' ) ) $grid['--shapeblock-iso-gap'] = $u( 'gap' );

// Card alignment moves everything in the card: the icon, the title and the
// description. With the icon above the text that is a column, so it is
// align-items; with the icon beside the text it is a row, so it is
// justify-content. text-align covers text that wraps to several lines.
$align_css = function ( $align ) use ( $icon_pos ) {
	$flex = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
	if ( ! isset( $flex[ $align ] ) ) {
		return [];
	}
	return [
		'text-align'                                  => $align,
		( 'left' === $icon_pos ? 'justify-content' : 'align-items' ) => $flex[ $align ],
		'--shapeblock-iso-badge-align'                => $flex[ $align ],
	];
};

// Card: normal / hover.
$card = array_merge( $align_css( $card_align ), $bg( 'cardBg', 'cardBgGradient' ), $dims( $attributes['cardRadius'] ?? [], 'radius' ), $dims( $attributes['cardPadding'] ?? [], 'padding' ), $shadow( $attributes['cardShadow'] ?? [] ) );
if ( ! empty( $attributes['cardBorder'] ) ) $card = array_merge( $card, $H::border_to_css_props( $attributes['cardBorder'] ) );
if ( '' !== $u( 'iconSpace' ) ) $card['gap'] = $u( 'iconSpace' );
$card_hover = array_merge( $bg( 'cardBgHover', 'cardBgGradientHover' ), $shadow( $attributes['cardShadowHover'] ?? [] ) );
if ( ! empty( $attributes['cardBorderColorHover'] ) ) $card_hover['border-color'] = $H::sanitize_css_color( (string) $attributes['cardBorderColorHover'], '' );

// Icon.
$icon_box = array_merge( $bg( 'iconBg', 'iconBgGradient' ), $dims( $attributes['iconRadius'] ?? [], 'radius' ) );
if ( '' !== $u( 'iconBoxSize' ) ) { $icon_box['width'] = $u( 'iconBoxSize' ); $icon_box['height'] = $u( 'iconBoxSize' ); }
$icon_i = [];
if ( ! empty( $attributes['iconColor'] ) ) $icon_i['color'] = $H::sanitize_css_color( (string) $attributes['iconColor'], '' );
if ( '' !== $u( 'iconSize' ) ) $icon_i['font-size'] = $u( 'iconSize' );

// Text.
$text = [];
if ( '' !== $u( 'textGap' ) ) $text['gap'] = $u( 'textGap' );
$title = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title['color'] = $H::sanitize_css_color( (string) $attributes['titleColor'], '' );
$title_hover = ! empty( $attributes['titleColorHover'] ) ? [ 'color' => $attributes['titleColorHover'] ] : [];
$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $H::sanitize_css_color( (string) $attributes['descColor'], '' );

// Badge. Its colours are custom properties, which each style (style.scss)
// uses in its own way; a card's own colours set the same properties on it.
$badge = array_merge( $typo( $attributes['badgeTypography'] ?? [] ), $dims( $attributes['badgePadding'] ?? [], 'padding' ), $dims( $attributes['badgeRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['badgeColor'] ) ) $badge['--shapeblock-iso-badge-color'] = $H::sanitize_css_color( (string) $attributes['badgeColor'], '' );
if ( ! empty( $attributes['badgeBg'] ) ) $badge['--shapeblock-iso-badge-bg'] = $H::sanitize_css_color( (string) $attributes['badgeBg'], '' );
// Its place in the corner. A ribbon has a fixed place, and a tab stays on the
// top edge, so only its distance from the side moves.
if ( 'inline' !== $badge_pos && 'ribbon' !== $badge_look ) {
	if ( 'tab' !== $badge_look && '' !== $u( 'badgeTop' ) ) {
		$badge['top'] = $u( 'badgeTop' );
	}
	if ( '' !== $u( 'badgeSide' ) ) {
		$badge[ 'top-left' === $badge_pos ? 'left' : 'right' ] = $u( 'badgeSide' );
	}
}

// Load More button.
$flex_map_more = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
$more_align    = isset( $attributes['loadMoreAlign'] ) && isset( $flex_map_more[ $attributes['loadMoreAlign'] ] ) ? $attributes['loadMoreAlign'] : 'center';
$more_wrap     = [ 'justify-content' => $flex_map_more[ $more_align ] ];
if ( '' !== $u( 'loadMoreSpace' ) ) $more_wrap['margin-top'] = $u( 'loadMoreSpace' );
$more_btn = array_merge( $typo( $attributes['loadMoreTypography'] ?? [] ), $dims( $attributes['loadMorePadding'] ?? [], 'padding' ), $dims( $attributes['loadMoreRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['loadMoreColor'] ) ) $more_btn['color'] = $H::sanitize_css_color( (string) $attributes['loadMoreColor'], '' );
$more_btn = array_merge( $more_btn, $bg( 'loadMoreBg', 'loadMoreBgGradient' ) );
if ( ! empty( $attributes['loadMoreBorder'] ) ) $more_btn = array_merge( $more_btn, $H::border_to_css_props( $attributes['loadMoreBorder'] ) );
$more_hover = [];
if ( ! empty( $attributes['loadMoreColorHover'] ) ) $more_hover['color'] = $H::sanitize_css_color( (string) $attributes['loadMoreColorHover'], '' );
$more_hover = array_merge( $more_hover, $bg( 'loadMoreBgHover', 'loadMoreBgGradientHover' ) );
if ( ! empty( $attributes['loadMoreBorderColorHover'] ) ) $more_hover['border-color'] = $H::sanitize_css_color( (string) $attributes['loadMoreBorderColorHover'], '' );

// Tablet / Mobile overrides, printed only for what was actually set.
$resp_css = '';
$per_device = [
	'.shapeblock-iso-header'     => function ( $s ) use ( $u, $show_search ) {
		return $show_search && '' !== $u( 'filterSpace' . $s ) ? [ '--shapeblock-iso-header-space' => $u( 'filterSpace' . $s ) ] : [];
	},
	'.shapeblock-iso-search'     => function ( $s ) use ( $u, $show_search ) {
		return $show_search && '' !== $u( 'searchWidth' . $s ) ? [ 'width' => $u( 'searchWidth' . $s ) ] : [];
	},
	'.shapeblock-iso-filters'    => function ( $s ) use ( $attributes, $u, $show_search ) {
		$o = [];
		if ( ! $show_search && '' !== $u( 'filterSpace' . $s ) ) $o['margin-bottom'] = $u( 'filterSpace' . $s );
		if ( '' !== $u( 'filterGap' . $s ) ) $o['gap'] = $u( 'filterGap' . $s );
		if ( ! $show_search && ! empty( $attributes[ 'filterAlign' . $s ] ) ) {
			$map = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
			if ( isset( $map[ $attributes[ 'filterAlign' . $s ] ] ) ) $o['justify-content'] = $map[ $attributes[ 'filterAlign' . $s ] ];
		}
		return $o;
	},
	'.shapeblock-iso-filter'     => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'filterTypography' . $s ] ?? [] ), $dims( $attributes[ 'filterPadding' . $s ] ?? [], 'padding' ) );
	},
	'.shapeblock-iso-grid'       => function ( $s ) use ( $attributes, $u, $n ) {
		$o = [];
		// A device left empty never keeps a wide desktop grid: tablet gets at most 2 columns, mobile 1.
		if ( isset( $attributes[ 'columns' . $s ] ) && is_numeric( $attributes[ 'columns' . $s ] ) && (int) $attributes[ 'columns' . $s ] > 0 ) {
			$o['--shapeblock-iso-cols'] = (string) (int) $attributes[ 'columns' . $s ];
		} else {
			$o['--shapeblock-iso-cols'] = 'Tablet' === $s ? (string) min( $n( 'columns', 3 ), 2 ) : '1';
		}
		if ( '' !== $u( 'gap' . $s ) ) $o['--shapeblock-iso-gap'] = $u( 'gap' . $s );
		return $o;
	},
	'.shapeblock-iso-card'       => function ( $s ) use ( $attributes, $dims, $align_css ) {
		return array_merge( $dims( $attributes[ 'cardPadding' . $s ] ?? [], 'padding' ), $align_css( $attributes[ 'cardAlign' . $s ] ?? '' ) );
	},
	'.shapeblock-iso-icon'       => function ( $s ) use ( $u ) {
		$o = [];
		if ( '' !== $u( 'iconBoxSize' . $s ) ) { $o['width'] = $u( 'iconBoxSize' . $s ); $o['height'] = $u( 'iconBoxSize' . $s ); }
		return $o;
	},
	'.shapeblock-iso-icon i'     => function ( $s ) use ( $u ) {
		return '' !== $u( 'iconSize' . $s ) ? [ 'font-size' => $u( 'iconSize' . $s ) ] : [];
	},
	'.shapeblock-iso-title'      => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'titleTypography' . $s ] ?? [] );
	},
	'.shapeblock-iso-desc'       => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'descTypography' . $s ] ?? [] );
	},
	'.shapeblock-iso-badge'      => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'badgeTypography' . $s ] ?? [] ), $dims( $attributes[ 'badgePadding' . $s ] ?? [], 'padding' ) );
	},
	'.shapeblock-iso-more'       => function ( $s ) use ( $attributes, $u, $flex_map_more ) {
		$o = [];
		if ( '' !== $u( 'loadMoreSpace' . $s ) ) $o['margin-top'] = $u( 'loadMoreSpace' . $s );
		if ( ! empty( $attributes[ 'loadMoreAlign' . $s ] ) && isset( $flex_map_more[ $attributes[ 'loadMoreAlign' . $s ] ] ) ) $o['justify-content'] = $flex_map_more[ $attributes[ 'loadMoreAlign' . $s ] ];
		return $o;
	},
	'.shapeblock-iso-load-more'  => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'loadMoreTypography' . $s ] ?? [] ), $dims( $attributes[ 'loadMorePadding' . $s ] ?? [], 'padding' ) );
	},
];
foreach ( $per_device as $sub_sel => $build ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		$decls = $build( $suffix );
		if ( ! empty( $decls ) ) {
			$rdata[ $device_key ] = $decls;
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $selector . ' ' . $sub_sel, $rdata );
	}
}

// Filter-bar alignment on desktop is a class (see style.scss) so it also works
// without any inline style; the per-device rules above override it.
$filter_align = isset( $attributes['filterAlign'] ) && in_array( $attributes['filterAlign'], [ 'left', 'center', 'right' ], true ) ? $attributes['filterAlign'] : 'center';
$flex_map     = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
if ( ! $show_search ) {
	$bar['justify-content'] = $flex_map[ $filter_align ];
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-iso-header'                        => $H::get_inline_styles( $header ),
	'.shapeblock-iso-filters'                       => $H::get_inline_styles( $bar ),
	'.shapeblock-iso-search'                        => $H::get_inline_styles( $search_wrap ),
	'.shapeblock-iso-search-input'                  => $H::get_inline_styles( $search ),
	'.shapeblock-iso-search-input:focus'            => $H::get_inline_styles( $search_focus ),
	'.shapeblock-iso-search-input::placeholder'     => $H::get_inline_styles( $search_placeholder ),
	'.shapeblock-iso-search-icon'                   => $H::get_inline_styles( $search_icon ),
	'.shapeblock-iso-empty'                         => $H::get_inline_styles( $empty ),
	'.shapeblock-iso-filter'                        => $H::get_inline_styles( $btn ),
	'.shapeblock-iso-filter:hover'                  => $H::get_inline_styles( $btn_hover ),
	'.shapeblock-iso-filter.is-active'              => $H::get_inline_styles( $btn_active ),
	'.shapeblock-iso-grid'                          => $H::get_inline_styles( $grid ),
	'.shapeblock-iso-card'                          => $H::get_inline_styles( $card ),
	'.shapeblock-iso-card:hover'                    => $H::get_inline_styles( $card_hover ),
	'.shapeblock-iso-icon'                          => $H::get_inline_styles( $icon_box ),
	'.shapeblock-iso-icon i'                        => $H::get_inline_styles( $icon_i ),
	'.shapeblock-iso-text'                          => $H::get_inline_styles( $text ),
	'.shapeblock-iso-title'                         => $H::get_inline_styles( $title ),
	'.shapeblock-iso-card:hover .shapeblock-iso-title' => $H::get_inline_styles( $title_hover ),
	'.shapeblock-iso-desc'                          => $H::get_inline_styles( $desc ),
	'.shapeblock-iso-badge'                         => $H::get_inline_styles( $badge ),
	'.shapeblock-iso-more'                        => $H::get_inline_styles( $more_wrap ),
	'.shapeblock-iso-load-more'                     => $H::get_inline_styles( $more_btn ),
	'.shapeblock-iso-load-more:hover'               => $H::get_inline_styles( $more_hover ),
] );

?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?> data-active="<?php echo esc_attr( $active ); ?>" data-anim="<?php echo esc_attr( $anim ); ?>" data-duration="<?php echo esc_attr( (string) $duration ); ?>"<?php if ( $load_more ) : ?> data-load-more="1" data-initial="<?php echo esc_attr( (string) $initial ); ?>" data-step="<?php echo esc_attr( (string) $more_step ); ?>"<?php endif; ?>>
	<?php if ( $show_search ) : ?>
	<div class="shapeblock-iso-header<?php echo $separator ? ' has-separator' : ''; ?>">
	<?php endif; ?>
	<?php if ( $show_bar ) : ?>
	<div class="shapeblock-iso-filters" role="group" aria-label="<?php esc_attr_e( 'Filter', 'shapeblock' ); ?>">
		<?php if ( $show_all ) : ?>
			<button type="button" class="shapeblock-iso-filter<?php echo 'all' === $active ? ' is-active' : ''; ?>" data-filter="all" aria-pressed="<?php echo 'all' === $active ? 'true' : 'false'; ?>"><?php echo esc_html( $all_label ); ?></button>
		<?php endif; ?>
		<?php foreach ( $categories as $ci => $cat ) : ?>
			<?php
			$key  = 'c' . (int) $ci;
			$name = isset( $cat['name'] ) && '' !== trim( (string) $cat['name'] ) ? (string) $cat['name'] : sprintf(
				/* translators: %d: category number. */
				__( 'Category %d', 'shapeblock' ),
				$ci + 1
			);
			?>
			<button type="button" class="shapeblock-iso-filter<?php echo $key === $active ? ' is-active' : ''; ?>" data-filter="<?php echo esc_attr( $key ); ?>" aria-pressed="<?php echo $key === $active ? 'true' : 'false'; ?>"><?php echo esc_html( $name ); ?></button>
		<?php endforeach; ?>
	</div>
	<?php endif; ?>
	<?php if ( $show_search ) : ?>
		<div class="shapeblock-iso-search" role="search">
			<svg class="shapeblock-iso-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
			<input type="search" class="shapeblock-iso-search-input" placeholder="<?php echo esc_attr( $search_ph ); ?>" aria-label="<?php echo esc_attr( $search_ph ); ?>" autocomplete="off">
		</div>
	</div>
	<?php endif; ?>

	<div class="shapeblock-iso-grid">
		<?php foreach ( $categories as $ci => $cat ) : ?>
			<?php
			$key   = 'c' . (int) $ci;
			$items = isset( $cat['items'] ) && is_array( $cat['items'] ) ? $cat['items'] : [];
			foreach ( $items as $item ) :
				$icon     = isset( $item['icon'] ) ? (string) $item['icon'] : '';
				$ttl      = isset( $item['title'] ) ? (string) $item['title'] : '';
				$dsc      = isset( $item['desc'] ) ? (string) $item['desc'] : '';
				$link     = isset( $item['link'] ) ? esc_url_raw( (string) $item['link'] ) : ''; // Safe protocols only; escaped once, at output.
				$rel      = trim( ( ! empty( $item['linkNewTab'] ) ? 'noopener noreferrer ' : '' ) . ( ! empty( $item['linkNofollow'] ) ? 'nofollow' : '' ) );
				$visible  = ( 'all' === $active || $key === $active );
				if ( $visible && $load_more ) {
					if ( $shown >= $initial ) {
						$visible = false;
					} else {
						++$shown;
					}
				}
				$has_icon  = $show_icon && '' !== $icon && 'none' !== $icon;
				$badge_txt = isset( $item['badge'] ) ? trim( (string) $item['badge'] ) : '';
				$badge_css = [];
				foreach ( [ 'badgeColor' => '--shapeblock-iso-badge-color', 'badgeBg' => '--shapeblock-iso-badge-bg' ] as $badge_key => $badge_prop ) {
					$badge_val = isset( $item[ $badge_key ] ) ? $H::sanitize_css_color( (string) $item[ $badge_key ], '' ) : '';
					if ( '' !== $badge_val ) {
						$badge_css[] = $badge_prop . ':' . $badge_val;
					}
				}
				$badge_html = '' !== $badge_txt ? '<span class="shapeblock-iso-badge"' . ( $badge_css ? ' style="' . esc_attr( implode( ';', $badge_css ) ) . '"' : '' ) . '>' . esc_html( $badge_txt ) . '</span>' : '';
				$badge_kses = [ 'span' => [ 'class' => true, 'style' => true ] ];
				// This card's own colours, if set: a declaration for each part.
				$own = function ( $field, $prop ) use ( $item, $H ) {
					$value = isset( $item[ $field ] ) ? $H::sanitize_css_color( (string) $item[ $field ], '' ) : '';
					return '' !== $value ? $prop . ':' . $value : '';
				};
				// A card gradient wins over its flat colour.
				$card_grad = isset( $item['cardBgGradient'] ) ? $H::sanitize_css_value( (string) $item['cardBgGradient'] ) : '';
				$card_own  = '' !== $card_grad ? 'background:' . $card_grad : $own( 'cardBg', 'background' );
				$icon_own  = $own( 'iconColor', 'color' );
				$title_own = $own( 'titleColor', 'color' );
				$desc_own  = $own( 'descColor', 'color' );
				?>
				<div class="shapeblock-iso-item" data-cat="<?php echo esc_attr( $key ); ?>"<?php if ( $show_search ) : ?> data-search="<?php echo esc_attr( trim( $lower( $ttl . ' ' . $dsc . ' ' . $badge_txt ) ) ); ?>"<?php endif; ?><?php echo $visible ? '' : ' hidden'; ?>>
					<div class="shapeblock-iso-card<?php echo '' !== $link ? ' has-link' : ''; ?>"<?php echo '' !== $card_own ? ' style="' . esc_attr( $card_own ) . '"' : ''; ?>>
						<?php
						// The whole card is clickable through a link stretched over it -
						// a wrapping link would nest any link typed in the description.
						if ( '' !== $link ) :
							?>
							<a class="shapeblock-iso-card-link" href="<?php echo esc_url( $link ); ?>"<?php echo ! empty( $item['linkNewTab'] ) ? ' target="_blank"' : ''; ?><?php echo '' !== $rel ? ' rel="' . esc_attr( $rel ) . '"' : ''; ?> aria-label="<?php echo esc_attr( wp_strip_all_tags( '' !== $ttl ? $ttl : $link ) ); ?>"></a>
						<?php endif; ?>
						<?php if ( '' !== $badge_html && 'inline' !== $badge_pos ) : ?>
							<?php echo wp_kses( $badge_html, $badge_kses ); ?>
						<?php endif; ?>
						<?php if ( $has_icon ) : ?>
							<div class="shapeblock-iso-icon"><i class="<?php echo esc_attr( 'shapeblock-icon ' . $icon ); ?>" aria-hidden="true"<?php echo '' !== $icon_own ? ' style="' . esc_attr( $icon_own ) . '"' : ''; ?>></i></div>
						<?php endif; ?>
						<div class="shapeblock-iso-text">
							<?php if ( '' !== $badge_html && 'inline' === $badge_pos ) : ?>
								<?php echo wp_kses( $badge_html, $badge_kses ); ?>
							<?php endif; ?>
							<?php if ( '' !== $ttl ) : ?>
								<?php printf( '<%1$s class="shapeblock-iso-title"%2$s>%3$s</%1$s>', tag_escape( $title_tag ), '' !== $title_own ? ' style="' . esc_attr( $title_own ) . '"' : '', wp_kses_post( $ttl ) ); ?>
							<?php endif; ?>
							<?php if ( '' !== $dsc ) : ?>
								<p class="shapeblock-iso-desc"<?php echo '' !== $desc_own ? ' style="' . esc_attr( $desc_own ) . '"' : ''; ?>><?php echo wp_kses( nl2br( $dsc ), \ShapeBlock\Frontend\Helper::inline_allowed_html() ); ?></p>
							<?php endif; ?>
						</div>
					</div>
				</div>
			<?php endforeach; ?>
		<?php endforeach; ?>
	</div>
	<?php if ( $show_search ) : ?>
		<p class="shapeblock-iso-empty" role="status" hidden><?php echo esc_html( $no_results ); ?></p>
	<?php endif; ?>
	<?php if ( $load_more ) : ?>
		<div class="shapeblock-iso-more"<?php echo $matching_total > $initial ? '' : ' hidden'; ?>>
			<button type="button" class="shapeblock-iso-load-more"><?php echo esc_html( $more_label ); ?></button>
		</div>
	<?php endif; ?>
</div>
<?php } )( $attributes, $content, $block );
