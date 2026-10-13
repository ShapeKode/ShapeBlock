<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Filterable List block.
 *
 * A header with filter buttons (each with the number of items it holds) and a
 * search box, above a list of links with icons. An item may belong to several
 * filters; it carries their ids in `data-filters` and its searchable words in
 * `data-search`, and view.js shows and hides items from those.
 * Element classes use the "shapeblock-fl" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-fl-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$unique_id = $H::unique_block_id( sanitize_html_class( $unique_id ) );

$lower = function ( $text ) {
	$text = wp_strip_all_tags( (string) $text );
	return function_exists( 'mb_strtolower' ) ? mb_strtolower( $text ) : strtolower( $text );
};

// Filters: only those with an id an item can point to.
$filters = [];
if ( isset( $attributes['filters'] ) && is_array( $attributes['filters'] ) ) {
	foreach ( $attributes['filters'] as $fi => $filter ) {
		$fid = isset( $filter['id'] ) ? sanitize_html_class( (string) $filter['id'] ) : '';
		if ( '' === $fid || isset( $filters[ $fid ] ) ) {
			continue;
		}
		$name = isset( $filter['name'] ) && '' !== trim( (string) $filter['name'] ) ? (string) $filter['name'] : sprintf(
			/* translators: %d: filter number. */
			__( 'Filter %d', 'shapeblock' ),
			$fi + 1
		);
		$filters[ $fid ] = [ 'name' => $name, 'count' => 0 ];
	}
}

$items = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? array_values( $attributes['items'] ) : [];
foreach ( $items as $item ) {
	$own = isset( $item['filters'] ) && is_array( $item['filters'] ) ? $item['filters'] : [];
	foreach ( array_unique( array_map( 'strval', $own ) ) as $fid ) {
		$fid = sanitize_html_class( $fid );
		if ( isset( $filters[ $fid ] ) ) {
			++$filters[ $fid ]['count'];
		}
	}
}

$show_bar    = ( ! isset( $attributes['showFilters'] ) || false !== $attributes['showFilters'] ) && ! empty( $filters );
$show_all    = ! isset( $attributes['showAll'] ) || false !== $attributes['showAll'];
$all_label   = isset( $attributes['allLabel'] ) && '' !== trim( (string) $attributes['allLabel'] ) ? (string) $attributes['allLabel'] : __( 'All', 'shapeblock' );
$show_count  = ! isset( $attributes['showCount'] ) || false !== $attributes['showCount'];
$show_search = ! isset( $attributes['showSearch'] ) || false !== $attributes['showSearch'];
$placeholder = isset( $attributes['searchPlaceholder'] ) && '' !== trim( (string) $attributes['searchPlaceholder'] ) ? (string) $attributes['searchPlaceholder'] : __( 'Search…', 'shapeblock' );
$no_results  = isset( $attributes['noResultsText'] ) && '' !== trim( (string) $attributes['noResultsText'] ) ? (string) $attributes['noResultsText'] : __( 'Nothing found. Try another word.', 'shapeblock' );
$show_icon   = ! isset( $attributes['showIcon'] ) || false !== $attributes['showIcon'];
$all_new_tab = ! empty( $attributes['linksNewTab'] );
$layout      = isset( $attributes['headerLayout'] ) && 'stacked' === $attributes['headerLayout'] ? 'stacked' : 'split';
$flow        = isset( $attributes['listFlow'] ) && 'rows' === $attributes['listFlow'] ? 'rows' : 'columns';
$separator   = ! isset( $attributes['showSeparator'] ) || false !== $attributes['showSeparator'];

// The filter showing first: "all", or one filter's id. Without an "All"
// button the bar starts on its first filter.
$active  = 'all';
$default = isset( $attributes['defaultFilter'] ) ? sanitize_html_class( (string) $attributes['defaultFilter'] ) : 'all';
if ( isset( $filters[ $default ] ) ) {
	$active = $default;
}
if ( 'all' === $active && $show_bar && ! $show_all ) {
	$active = (string) array_key_first( $filters );
}

$wrap_classes = [
	'shapeblock-block',
	'shapeblock-fl-block-wrap',
	$unique_id,
	'shapeblock-fl',
	'shapeblock-fl-header-' . $layout,
	'shapeblock-fl-flow-' . $flow,
];

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );

if ( empty( $items ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Add some items to show here.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Styles, scoped to this block through $unique_id.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-fl-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-filter-list-style';

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
// A gradient wins over the flat colour of the same control.
$bg = function ( $color_key, $grad_key ) use ( $attributes ) {
	if ( ! empty( $attributes[ $grad_key ] ) ) return [ 'background' => $attributes[ $grad_key ] ];
	if ( ! empty( $attributes[ $color_key ] ) ) return [ 'background' => \ShapeBlock\Frontend\Helper::sanitize_css_color( (string) $attributes[ $color_key ], '' ) ];
	return [];
};
$color = function ( $key, $prop = 'color' ) use ( $attributes ) {
	return ! empty( $attributes[ $key ] ) ? [ $prop => \ShapeBlock\Frontend\Helper::sanitize_css_color( (string) $attributes[ $key ], '' ) ] : [];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};
$cols = function ( $suffix ) use ( $attributes ) {
	$key = 'columns' . $suffix;
	return ( isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) && (int) $attributes[ $key ] > 0 ) ? min( 8, (int) $attributes[ $key ] ) : 0;
};
$flex_map = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];

// Header and its separator line.
$header = [];
if ( '' !== $u( 'headerSpace' ) ) {
	$header['--shapeblock-fl-header-space'] = $u( 'headerSpace' );
}
if ( $separator ) {
	$sep_style = isset( $attributes['separatorStyle'] ) && in_array( $attributes['separatorStyle'], [ 'solid', 'dashed', 'dotted', 'double' ], true ) ? $attributes['separatorStyle'] : 'dashed';
	$header['border-bottom-style'] = $sep_style;
	if ( '' !== $u( 'separatorWidth' ) ) $header['border-bottom-width'] = $u( 'separatorWidth' );
	$header = array_merge( $header, $color( 'separatorColor', 'border-bottom-color' ) );
}

// Filter bar and buttons: normal / hover / active.
$bar = [];
$filter_align = isset( $attributes['filterAlign'] ) && isset( $flex_map[ $attributes['filterAlign'] ] ) ? $attributes['filterAlign'] : 'left';
$bar['justify-content'] = $flex_map[ $filter_align ];
if ( '' !== $u( 'filterGap' ) ) $bar['gap'] = $u( 'filterGap' );

$btn = array_merge( $typo( $attributes['filterTypography'] ?? [] ), $dims( $attributes['filterPadding'] ?? [], 'padding' ), $dims( $attributes['filterRadius'] ?? [], 'radius' ), $color( 'filterColor' ), $bg( 'filterBg', 'filterBgGradient' ) );
if ( ! empty( $attributes['filterBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['filterBorder'] ) );
$btn_hover = array_merge( $color( 'filterColorHover' ), $bg( 'filterBgHover', 'filterBgGradientHover' ), $color( 'filterBorderColorHover', 'border-color' ) );
$btn_active = array_merge( $color( 'filterColorActive' ), $bg( 'filterBgActive', 'filterBgGradientActive' ), $color( 'filterBorderColorActive', 'border-color' ) );
$count        = $color( 'countColor' );
$count_active = $color( 'countColorActive' );

// Search box.
$search_wrap = [];
if ( '' !== $u( 'searchWidth' ) ) $search_wrap['width'] = $u( 'searchWidth' );
$search = array_merge( $typo( $attributes['searchTypography'] ?? [] ), $color( 'searchColor' ), $bg( 'searchBg', 'searchBgGradient' ), $dims( $attributes['searchRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['searchBorder'] ) ) $search = array_merge( $search, $H::border_to_css_props( $attributes['searchBorder'] ) );
if ( '' !== $u( 'searchHeight' ) ) $search['height'] = $u( 'searchHeight' );
$search_focus       = $color( 'searchBorderColorFocus', 'border-color' );
$search_placeholder = $color( 'searchPlaceholderColor' );
$search_icon        = $color( 'searchIconColor' );

// List.
$list = [];
if ( $cols( '' ) ) $list['--shapeblock-fl-cols'] = (string) $cols( '' );
if ( '' !== $u( 'rowGap' ) ) $list['--shapeblock-fl-row-gap'] = $u( 'rowGap' );
if ( '' !== $u( 'columnGap' ) ) $list['--shapeblock-fl-col-gap'] = $u( 'columnGap' );

// Item: normal / hover.
$link = array_merge( $bg( 'itemBg', 'itemBgGradient' ), $dims( $attributes['itemRadius'] ?? [], 'radius' ), $dims( $attributes['itemPadding'] ?? [], 'padding' ) );
if ( ! empty( $attributes['itemBorder'] ) ) $link = array_merge( $link, $H::border_to_css_props( $attributes['itemBorder'] ) );
if ( '' !== $u( 'iconSpace' ) ) $link['gap'] = $u( 'iconSpace' );
$link_hover = array_merge( $bg( 'itemBgHover', 'itemBgGradientHover' ), $color( 'itemBorderColorHover', 'border-color' ) );

$icon = $color( 'iconColor' );
if ( '' !== $u( 'iconSize' ) ) $icon['font-size'] = $u( 'iconSize' );
$icon_hover  = $color( 'iconColorHover' );
$title       = array_merge( $typo( $attributes['titleTypography'] ?? [] ), $color( 'titleColor' ) );
$title_hover = $color( 'titleColorHover' );

// Badge: its colours are custom properties, so an item's own colours can set
// the same properties on that one badge.
$badge = array_merge( $typo( $attributes['badgeTypography'] ?? [] ), $dims( $attributes['badgePadding'] ?? [], 'padding' ), $dims( $attributes['badgeRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['badgeColor'] ) ) $badge['--shapeblock-fl-badge-color'] = $H::sanitize_css_color( (string) $attributes['badgeColor'], '' );
if ( ! empty( $attributes['badgeBgGradient'] ) ) {
	$badge['--shapeblock-fl-badge-bg'] = $attributes['badgeBgGradient'];
} elseif ( ! empty( $attributes['badgeBg'] ) ) {
	$badge['--shapeblock-fl-badge-bg'] = $H::sanitize_css_color( (string) $attributes['badgeBg'], '' );
}

$empty = array_merge( $typo( $attributes['noResultsTypography'] ?? [] ), $color( 'noResultsColor' ) );

// Tablet / Mobile, printed only for what was set. An empty column count on a
// smaller screen never keeps a wide desktop list: at most 3 on a tablet, 1 on
// a phone.
$resp_css   = '';
$per_device = [
	'.shapeblock-fl-header'  => function ( $s ) use ( $u ) {
		return '' !== $u( 'headerSpace' . $s ) ? [ '--shapeblock-fl-header-space' => $u( 'headerSpace' . $s ) ] : [];
	},
	'.shapeblock-fl-filters' => function ( $s ) use ( $attributes, $flex_map ) {
		$a = $attributes[ 'filterAlign' . $s ] ?? '';
		return isset( $flex_map[ $a ] ) ? [ 'justify-content' => $flex_map[ $a ] ] : [];
	},
	'.shapeblock-fl-filter'  => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'filterTypography' . $s ] ?? [] ), $dims( $attributes[ 'filterPadding' . $s ] ?? [], 'padding' ) );
	},
	'.shapeblock-fl-search'  => function ( $s ) use ( $u ) {
		return '' !== $u( 'searchWidth' . $s ) ? [ 'width' => $u( 'searchWidth' . $s ) ] : [];
	},
	'.shapeblock-fl-list'    => function ( $s ) use ( $u, $cols ) {
		$o = [ '--shapeblock-fl-cols' => (string) ( $cols( $s ) ? $cols( $s ) : ( 'Tablet' === $s ? min( $cols( '' ) ? $cols( '' ) : 4, 3 ) : 1 ) ) ];
		if ( '' !== $u( 'rowGap' . $s ) ) $o['--shapeblock-fl-row-gap'] = $u( 'rowGap' . $s );
		if ( '' !== $u( 'columnGap' . $s ) ) $o['--shapeblock-fl-col-gap'] = $u( 'columnGap' . $s );
		return $o;
	},
	'.shapeblock-fl-link'    => function ( $s ) use ( $attributes, $dims ) {
		return $dims( $attributes[ 'itemPadding' . $s ] ?? [], 'padding' );
	},
	'.shapeblock-fl-title'   => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'titleTypography' . $s ] ?? [] );
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

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-fl-header'                                 => $H::get_inline_styles( $header ),
	'.shapeblock-fl-filters'                                => $H::get_inline_styles( $bar ),
	'.shapeblock-fl-filter'                                 => $H::get_inline_styles( $btn ),
	'.shapeblock-fl-filter:hover'                           => $H::get_inline_styles( $btn_hover ),
	'.shapeblock-fl-filter.is-active'                       => $H::get_inline_styles( $btn_active ),
	'.shapeblock-fl-count'                                  => $H::get_inline_styles( $count ),
	'.shapeblock-fl-filter.is-active .shapeblock-fl-count'  => $H::get_inline_styles( $count_active ),
	'.shapeblock-fl-search'                                 => $H::get_inline_styles( $search_wrap ),
	'.shapeblock-fl-search-input'                           => $H::get_inline_styles( $search ),
	'.shapeblock-fl-search-input:focus'                     => $H::get_inline_styles( $search_focus ),
	'.shapeblock-fl-search-input::placeholder'              => $H::get_inline_styles( $search_placeholder ),
	'.shapeblock-fl-search-icon'                            => $H::get_inline_styles( $search_icon ),
	'.shapeblock-fl-list'                                   => $H::get_inline_styles( $list ),
	'.shapeblock-fl-link'                                   => $H::get_inline_styles( $link ),
	'.shapeblock-fl-link:hover'                             => $H::get_inline_styles( $link_hover ),
	'.shapeblock-fl-icon'                                   => $H::get_inline_styles( $icon ),
	'.shapeblock-fl-link:hover .shapeblock-fl-icon'         => $H::get_inline_styles( $icon_hover ),
	'.shapeblock-fl-title'                                  => $H::get_inline_styles( $title ),
	'.shapeblock-fl-link:hover .shapeblock-fl-title'        => $H::get_inline_styles( $title_hover ),
	'.shapeblock-fl-badge'                                  => $H::get_inline_styles( $badge ),
	'.shapeblock-fl-empty'                                  => $H::get_inline_styles( $empty ),
] );

$total       = count( $items );
$any_visible = false;
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?> data-active="<?php echo esc_attr( $active ); ?>">
	<?php if ( $show_bar || $show_search ) : ?>
	<div class="shapeblock-fl-header<?php echo $separator ? ' has-separator' : ''; ?>">
		<?php if ( $show_bar ) : ?>
		<div class="shapeblock-fl-filters" role="group" aria-label="<?php esc_attr_e( 'Filter', 'shapeblock' ); ?>">
			<?php if ( $show_all ) : ?>
				<button type="button" class="shapeblock-fl-filter<?php echo 'all' === $active ? ' is-active' : ''; ?>" data-filter="all" aria-pressed="<?php echo 'all' === $active ? 'true' : 'false'; ?>">
					<span class="shapeblock-fl-filter-label"><?php echo esc_html( $all_label ); ?></span>
					<?php if ( $show_count ) : ?><span class="shapeblock-fl-count"><?php echo esc_html( number_format_i18n( $total ) ); ?></span><?php endif; ?>
				</button>
			<?php endif; ?>
			<?php foreach ( $filters as $fid => $filter ) : ?>
				<button type="button" class="shapeblock-fl-filter<?php echo $fid === $active ? ' is-active' : ''; ?>" data-filter="<?php echo esc_attr( $fid ); ?>" aria-pressed="<?php echo $fid === $active ? 'true' : 'false'; ?>">
					<span class="shapeblock-fl-filter-label"><?php echo esc_html( $filter['name'] ); ?></span>
					<?php if ( $show_count ) : ?><span class="shapeblock-fl-count"><?php echo esc_html( number_format_i18n( $filter['count'] ) ); ?></span><?php endif; ?>
				</button>
			<?php endforeach; ?>
		</div>
		<?php endif; ?>
		<?php if ( $show_search ) : ?>
		<div class="shapeblock-fl-search" role="search">
			<svg class="shapeblock-fl-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
			<input type="search" class="shapeblock-fl-search-input" placeholder="<?php echo esc_attr( $placeholder ); ?>" aria-label="<?php echo esc_attr( $placeholder ); ?>" autocomplete="off">
		</div>
		<?php endif; ?>
	</div>
	<?php endif; ?>

	<ul class="shapeblock-fl-list" role="list">
		<?php foreach ( $items as $item ) : ?>
			<?php
			$ttl     = isset( $item['title'] ) ? (string) $item['title'] : '';
			$ico     = isset( $item['icon'] ) ? (string) $item['icon'] : '';
			$url     = isset( $item['link'] ) ? esc_url_raw( (string) $item['link'] ) : ''; // Safe protocols only; escaped once, at output.
			$new_tab = $all_new_tab || ! empty( $item['linkNewTab'] );
			$rel     = trim( ( $new_tab ? 'noopener noreferrer ' : '' ) . ( ! empty( $item['linkNofollow'] ) ? 'nofollow' : '' ) );
			$own_ids = [];
			foreach ( ( isset( $item['filters'] ) && is_array( $item['filters'] ) ? $item['filters'] : [] ) as $fid ) {
				$fid = sanitize_html_class( (string) $fid );
				if ( isset( $filters[ $fid ] ) ) {
					$own_ids[ $fid ] = true;
				}
			}
			$own_ids  = array_keys( $own_ids );
			$visible  = 'all' === $active || in_array( $active, $own_ids, true );
			if ( $visible ) {
				$any_visible = true;
			}
			$keywords = isset( $item['keywords'] ) ? (string) $item['keywords'] : '';
			$haystack = trim( $lower( $ttl . ' ' . $keywords . ' ' . ( $item['badge'] ?? '' ) ) );
			$badge    = isset( $item['badge'] ) ? trim( (string) $item['badge'] ) : '';
			$badge_css = [];
			$badge_bg  = isset( $item['badgeBgGradient'] ) && '' !== $item['badgeBgGradient'] ? $H::sanitize_css_value( (string) $item['badgeBgGradient'] ) : ( isset( $item['badgeBg'] ) ? $H::sanitize_css_color( (string) $item['badgeBg'], '' ) : '' );
			$badge_fg  = isset( $item['badgeColor'] ) ? $H::sanitize_css_color( (string) $item['badgeColor'], '' ) : '';
			if ( '' !== $badge_bg ) $badge_css[] = '--shapeblock-fl-badge-bg:' . $badge_bg;
			if ( '' !== $badge_fg ) $badge_css[] = '--shapeblock-fl-badge-color:' . $badge_fg;
			$tag = '' !== $url ? 'a' : 'span';
			?>
			<li class="shapeblock-fl-item" data-filters="<?php echo esc_attr( implode( ' ', $own_ids ) ); ?>" data-search="<?php echo esc_attr( $haystack ); ?>"<?php echo $visible ? '' : ' hidden'; ?>>
				<<?php echo tag_escape( $tag ); ?> class="shapeblock-fl-link"<?php if ( 'a' === $tag ) : ?> href="<?php echo esc_url( $url ); ?>"<?php echo $new_tab ? ' target="_blank"' : ''; ?><?php echo '' !== $rel ? ' rel="' . esc_attr( $rel ) . '"' : ''; ?><?php endif; ?>>
					<?php if ( $show_icon && '' !== $ico && 'none' !== $ico ) : ?>
						<i class="<?php echo esc_attr( 'shapeblock-fl-icon shapeblock-icon ' . $ico ); ?>" aria-hidden="true"></i>
					<?php endif; ?>
					<span class="shapeblock-fl-title"><?php echo esc_html( $ttl ); ?></span>
					<?php if ( '' !== $badge ) : ?>
						<span class="shapeblock-fl-badge"<?php echo $badge_css ? ' style="' . esc_attr( implode( ';', $badge_css ) ) . '"' : ''; ?>><?php echo esc_html( $badge ); ?></span>
					<?php endif; ?>
				</<?php echo tag_escape( $tag ); ?>>
			</li>
		<?php endforeach; ?>
	</ul>
	<p class="shapeblock-fl-empty" role="status"<?php echo $any_visible ? ' hidden' : ''; ?>><?php echo esc_html( $no_results ); ?></p>
</div>
<?php } )( $attributes, $content, $block );
