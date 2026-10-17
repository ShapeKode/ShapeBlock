<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Tabs block.
 *
 * Element classes use this plugin's "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-tab-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$tabs      = isset( $attributes['tabs'] ) && is_array( $attributes['tabs'] ) ? $attributes['tabs'] : [];

// Tabs made of blocks: each its title and icon, its content the blocks in it.
if ( $block instanceof WP_Block && count( $block->inner_blocks ) ) {
	$tabs = array();
	foreach ( $block->inner_blocks as $tab_block ) {
		if ( 'shapeblock/tab-item' !== $tab_block->name ) {
			continue;
		}
		$tab_html = '';
		foreach ( $tab_block->inner_blocks as $inner ) {
			$tab_html .= $inner->render();
		}
		$tabs[] = array(
			'tabTitle' => isset( $tab_block->attributes['tabTitle'] ) ? (string) $tab_block->attributes['tabTitle'] : '',
			'iconType' => isset( $tab_block->attributes['iconType'] ) ? (string) $tab_block->attributes['iconType'] : 'icon',
			'icon'     => isset( $tab_block->attributes['icon'] ) ? (string) $tab_block->attributes['icon'] : '',
			'image'    => isset( $tab_block->attributes['image'] ) && is_array( $tab_block->attributes['image'] ) ? $tab_block->attributes['image'] : array(),
			'html'     => $tab_html,
		);
	}
}
$allowed   = [ 'left', 'top', 'right' ];
$direction = isset( $attributes['layoutDirection'] ) && in_array( $attributes['layoutDirection'], $allowed, true ) ? $attributes['layoutDirection'] : 'top';
$icon_pos  = isset( $attributes['iconPosition'] ) && in_array( $attributes['iconPosition'], $allowed, true ) ? $attributes['iconPosition'] : 'left';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-tab-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-tab-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( empty( $tabs ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add tab items.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-tab-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-tab-style';

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
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// ---- Tab title (li) normal --------------------------------------------------
$title_li = [];
if ( ! empty( $attributes['titleBgColorGradient'] ) ) {
	$title_li['background'] = $attributes['titleBgColorGradient'];
} elseif ( ! empty( $attributes['titleBgColor'] ) ) {
	$title_li['background-color'] = $attributes['titleBgColor'];
}
$title_li = array_merge( $title_li, $dims( $attributes['titleBorderRadius'] ?? [], 'radius' ), $dims( $attributes['titlePadding'] ?? [], 'padding' ), $dims( $attributes['titleMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['titleBorder'] ) ) $title_li = array_merge( $title_li, $H::border_to_css_props( $attributes['titleBorder'] ) );

// Tab title text.
$title_text = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_text['color'] = $attributes['titleColor'];

// Icon / icon box.
$icon_color = [];
if ( ! empty( $attributes['tabIconColor'] ) ) { $icon_color['color'] = $attributes['tabIconColor']; $icon_color['fill'] = $attributes['tabIconColor']; }
$icon_box = [];
if ( ! empty( $attributes['tabIconBgColorGradient'] ) ) {
	$icon_box['background'] = $attributes['tabIconBgColorGradient'];
} elseif ( ! empty( $attributes['tabIconBgColor'] ) ) {
	$icon_box['background-color'] = $attributes['tabIconBgColor'];
}

// Active / hover states.
$title_li_active = [];
// A flat colour here replaces a normal-state gradient, so it is written as
// the shorthand then; otherwise it stays background-color as before.
if ( ! empty( $attributes['titleActiveBgColorGradient'] ) ) {
	$title_li_active['background'] = $attributes['titleActiveBgColorGradient'];
} elseif ( ! empty( $attributes['titleActiveBgColor'] ) ) {
	$title_li_active[ ! empty( $attributes['titleBgColorGradient'] ) ? 'background' : 'background-color' ] = $attributes['titleActiveBgColor'];
}
if ( ! empty( $attributes['titleActiveBorderColor'] ) ) $title_li_active['border-color'] = $attributes['titleActiveBorderColor'];
$title_text_active = [];
if ( ! empty( $attributes['titleActiveColor'] ) ) $title_text_active['color'] = $attributes['titleActiveColor'];

// ---- Nav (titles ul) bottom border + spacing (top layout) -------------------
$nav = [];
if ( '' !== $u( 'titleBottomSpacing' ) ) $nav['padding'] = '0 0 ' . $u( 'titleBottomSpacing' );
if ( ! empty( $attributes['navBorder'] ) ) $nav = array_merge( $nav, $H::border_to_css_props( $attributes['navBorder'] ) );

// ---- Content area -----------------------------------------------------------
$content = [];
if ( ! empty( $attributes['contentBgColorGradient'] ) ) {
	$content['background'] = $attributes['contentBgColorGradient'];
} elseif ( ! empty( $attributes['contentBgColor'] ) ) {
	$content['background-color'] = $attributes['contentBgColor'];
}
$content = array_merge( $content, $dims( $attributes['contentBorderRadius'] ?? [], 'radius' ), $dims( $attributes['contentPadding'] ?? [], 'padding' ), $dims( $attributes['contentMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['contentBorder'] ) ) $content = array_merge( $content, $H::border_to_css_props( $attributes['contentBorder'] ) );

$contents_align = [];
if ( ! empty( $attributes['descriptionAlignment'] ) ) $contents_align['text-align'] = $attributes['descriptionAlignment'];

// ---- Content title ----------------------------------------------------------
$content_title = $typo( $attributes['contentTitleTypography'] ?? [] );
if ( ! empty( $attributes['contentTitleColor'] ) ) $content_title['color'] = $attributes['contentTitleColor'];
$content_title = array_merge( $content_title, $dims( $attributes['contentTitleMargin'] ?? [], 'margin' ) );

// ---- Description ------------------------------------------------------------
$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $attributes['descColor'];
$desc_wrap = $dims( $attributes['descMargin'] ?? [], 'margin' );

// ---- Button -----------------------------------------------------------------
$btn = $typo( $attributes['btnTypography'] ?? [] );
if ( ! empty( $attributes['btnColor'] ) ) $btn['color'] = $attributes['btnColor'];
if ( ! empty( $attributes['btnBgColorGradient'] ) ) {
	$btn['background'] = $attributes['btnBgColorGradient'];
} elseif ( ! empty( $attributes['btnBgColor'] ) ) {
	$btn['background-color'] = $attributes['btnBgColor'];
}
$btn = array_merge( $btn, $dims( $attributes['btnBorderRadius'] ?? [], 'radius' ), $dims( $attributes['btnPadding'] ?? [], 'padding' ), $dims( $attributes['btnMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['btnBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['btnBorder'] ) );

$btn_hover = [];
if ( ! empty( $attributes['btnHoverColor'] ) ) $btn_hover['color'] = $attributes['btnHoverColor'];
// A flat colour here replaces a normal-state gradient, so it is written as
// the shorthand then; otherwise it stays background-color as before.
if ( ! empty( $attributes['btnHoverBgColorGradient'] ) ) {
	$btn_hover['background'] = $attributes['btnHoverBgColorGradient'];
} elseif ( ! empty( $attributes['btnHoverBgColor'] ) ) {
	$btn_hover[ ! empty( $attributes['btnBgColorGradient'] ) ? 'background' : 'background-color' ] = $attributes['btnHoverBgColor'];
}
if ( ! empty( $attributes['btnHoverBorderColor'] ) ) $btn_hover['border-color'] = $attributes['btnHoverBorderColor'];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically. Only LAYOUT controls (typography,
// padding/margin, bottom spacing and description alignment) are responsive.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	// Tab title text (typography).
	$title_text = $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] );

	// Tab title (li) padding + margin.
	$title_li = array_merge(
		$dims( $attributes[ 'titlePadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'titleMargin' . $suffix ] ?? [], 'margin' )
	);

	// Nav bottom spacing (top layout).
	$nav = [];
	if ( isset( $attributes[ 'titleBottomSpacing' . $suffix ] ) && '' !== $attributes[ 'titleBottomSpacing' . $suffix ] ) {
		$nav['padding'] = '0 0 ' . $H::ensure_unit( $attributes[ 'titleBottomSpacing' . $suffix ] );
	}

	// Content area padding + margin.
	$content = array_merge(
		$dims( $attributes[ 'contentPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'contentMargin' . $suffix ] ?? [], 'margin' )
	);

	// Description alignment.
	$contents_align = [];
	if ( ! empty( $attributes[ 'descriptionAlignment' . $suffix ] ) ) $contents_align['text-align'] = $attributes[ 'descriptionAlignment' . $suffix ];

	// Content title (typography + margin).
	$content_title = array_merge(
		$typo( $attributes[ 'contentTitleTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'contentTitleMargin' . $suffix ] ?? [], 'margin' )
	);

	// Description (typography + margin).
	$desc = array_merge(
		$typo( $attributes[ 'descTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'descMargin' . $suffix ] ?? [], 'margin' )
	);

	// Button (typography + padding + margin).
	$btn = array_merge(
		$typo( $attributes[ 'btnTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'btnPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'btnMargin' . $suffix ] ?? [], 'margin' )
	);

	return [
		'.shapeblock-tab-titles li'                                            => $title_li,
		'.shapeblock-tab-title-text'                                           => $title_text,
		'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles' => $nav,
		'.shapeblock-tab-content'                                              => $content,
		'.shapeblock-tab-contents'                                             => $contents_align,
		'.shapeblock-content-title'                                            => $content_title,
		'.shapeblock-content-description'                                      => $desc,
		'.shapeblock-read-more'                                                => $btn,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [
	'.shapeblock-tab-titles li',
	'.shapeblock-tab-title-text',
	'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles',
	'.shapeblock-tab-content',
	'.shapeblock-tab-contents',
	'.shapeblock-content-title',
	'.shapeblock-content-description',
	'.shapeblock-read-more',
] as $sub_sel ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		if ( ! empty( $dev_data[ $suffix ][ $sub_sel ] ) ) {
			$rdata[ $device_key ] = $dev_data[ $suffix ][ $sub_sel ];
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $selector . ' ' . $sub_sel, $rdata );
	}
}

// ---- Tab bar, tab buttons and their icons: desktop and per device ----------
// Each rule lists its own full selector (some target several elements), with
// the desktop value and the Tablet / Mobile ones in one media-query set.
$flex_of  = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
$nav_part = function ( $sfx ) use ( $attributes, $dims, $H, $flex_of ) {
	$v   = function ( $key ) use ( $attributes, $sfx ) {
		return isset( $attributes[ $key . $sfx ] ) ? (string) $attributes[ $key . $sfx ] : '';
	};
	$px  = function ( $key ) use ( $v, $H ) {
		return '' !== $v( $key ) ? $H::ensure_unit( $v( $key ) ) : '';
	};
	$out = [];

	// The bar: space between the tabs, its padding.
	$bar = $dims( $attributes[ 'navPadding' . $sfx ] ?? [], 'padding' );
	if ( '' !== $px( 'navGap' ) ) $bar['gap'] = $px( 'navGap' );
	$out['bar'] = $bar;

	// Tabs on top: stretched to fill the row (the default), or at its left,
	// centre or right at their own width.
	$align = $v( 'navAlign' );
	if ( 'stretch' === $align ) {
		$out['top_li'] = [ 'flex' => '1 1 0' ];
	} elseif ( isset( $flex_of[ $align ] ) ) {
		$out['top_bar'] = [ 'justify-content' => $flex_of[ $align ] ];
		$out['top_li']  = [ 'flex' => '0 0 auto' ];
	}

	// Tabs at a side: the width of their column.
	if ( '' !== $v( 'navWidth' ) && is_numeric( $v( 'navWidth' ) ) ) {
		$w              = max( 5, min( 95, (float) $v( 'navWidth' ) ) ) . '%';
		$out['side_bar'] = [ 'flex' => '0 0 ' . $w, 'max-width' => $w, 'min-width' => '0' ];
	}

	// Inside a tab: its icon and title to the left, centre or right; the space
	// between them.
	$li   = [];
	$item = $v( 'titleItemAlign' );
	if ( isset( $flex_of[ $item ] ) ) {
		$li['justify-content'] = $flex_of[ $item ];
		$li['justify-items']   = $flex_of[ $item ];
		$li['text-align']      = $item;
	}
	if ( '' !== $px( 'tabIconGap' ) ) $li['gap'] = $px( 'tabIconGap' );
	$out['li'] = $li;

	// Icon size; the box round it.
	if ( '' !== $px( 'tabIconSize' ) ) {
		$out['icon_i']   = [ 'font-size' => $px( 'tabIconSize' ) ];
		$out['icon_svg'] = [ 'width' => $px( 'tabIconSize' ), 'height' => $px( 'tabIconSize' ) ];
		$out['icon_img'] = [ 'height' => $px( 'tabIconSize' ) ];
	}
	if ( '' !== $px( 'tabIconBoxSize' ) ) {
		$out['icon_box'] = [ 'width' => $px( 'tabIconBoxSize' ), 'min-width' => $px( 'tabIconBoxSize' ), 'height' => $px( 'tabIconBoxSize' ) ];
	}
	return $out;
};
$nav_targets = [
	'bar'      => [ '.shapeblock-tabs-wrapper .shapeblock-tab-titles' ],
	'top_bar'  => [ '.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles' ],
	'top_li'   => [ '.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles li' ],
	'side_bar' => [ '.shapeblock-tabs-wrapper[data-tab-direction="left"] .shapeblock-tab-titles', '.shapeblock-tabs-wrapper[data-tab-direction="right"] .shapeblock-tab-titles' ],
	'li'       => [ '.shapeblock-tabs-wrapper .shapeblock-tab-titles li' ],
	'icon_i'   => [ '.shapeblock-tab-titles .shapeblock-tab-icon i' ],
	'icon_svg' => [ '.shapeblock-tab-titles .shapeblock-tab-icon svg' ],
	'icon_img' => [ '.shapeblock-tab-titles .shapeblock-tab-image img' ],
	'icon_box' => [ '.shapeblock-tab-titles .shapeblock-tab-icon', '.shapeblock-tab-titles .shapeblock-tab-image' ],
];
$nav_sets = [ 'desktop' => $nav_part( '' ), 'tablet' => $nav_part( 'Tablet' ), 'mobile' => $nav_part( 'Mobile' ) ];
foreach ( $nav_targets as $part => $targets ) {
	$data = [];
	foreach ( $nav_sets as $device => $set ) {
		if ( ! empty( $set[ $part ] ) ) {
			$data[ $device ] = $set[ $part ];
		}
	}
	if ( $data ) {
		$full = implode( ', ', array_map( function ( $t ) use ( $selector ) { return $selector . ' ' . $t; }, $targets ) );
		$resp_css .= $H::generate_responsive_css( $full, $data );
	}
}

// The bar's background and corners.
$nav_box = [];
if ( ! empty( $attributes['navBgGradient'] ) ) {
	$nav_box['background'] = $attributes['navBgGradient'];
} elseif ( ! empty( $attributes['navBgColor'] ) ) {
	$nav_box['background-color'] = $attributes['navBgColor'];
}
$nav_box = array_merge( $nav_box, $dims( $attributes['navRadius'] ?? [], 'radius' ) );

// Shadows: every tab, and the open one (also on hover).
$tab_shadow    = ! empty( $attributes['titleShadow'] ) ? [ 'box-shadow' => $H::box_shadow_to_css( $attributes['titleShadow'] ) ] : [];
$active_shadow = ! empty( $attributes['titleActiveShadow'] ) ? [ 'box-shadow' => $H::box_shadow_to_css( $attributes['titleActiveShadow'] ) ] : [];

// Hover, when it is not the same as the open tab.
$title_li_hover = [];
if ( ! empty( $attributes['titleHoverBgColorGradient'] ) ) {
	$title_li_hover['background'] = $attributes['titleHoverBgColorGradient'];
} elseif ( ! empty( $attributes['titleHoverBgColor'] ) ) {
	$title_li_hover['background'] = $attributes['titleHoverBgColor'];
}
if ( ! empty( $attributes['titleHoverBorderColor'] ) ) $title_li_hover['border-color'] = $attributes['titleHoverBorderColor'];
$title_text_hover = ! empty( $attributes['titleHoverColor'] ) ? [ 'color' => $attributes['titleHoverColor'] ] : [];

// The icon box: switched off, or its corners.
$icon_box = array_merge( $icon_box, $dims( $attributes['tabIconRadius'] ?? [], 'radius' ) );
if ( isset( $attributes['tabIconBox'] ) && false === $attributes['tabIconBox'] ) {
	$icon_box = [ 'background' => 'none', 'min-width' => '0', 'width' => 'auto', 'height' => 'auto', 'padding' => '0' ];
}

// The open tab's icon (also on hover).
$icon_active = [];
if ( ! empty( $attributes['tabIconActiveColor'] ) ) { $icon_active['color'] = $attributes['tabIconActiveColor']; $icon_active['fill'] = $attributes['tabIconActiveColor']; }
$icon_box_active = [];
if ( ! empty( $attributes['tabIconActiveBgGradient'] ) ) {
	$icon_box_active['background'] = $attributes['tabIconActiveBgGradient'];
} elseif ( ! empty( $attributes['tabIconActiveBgColor'] ) ) {
	$icon_box_active['background'] = $attributes['tabIconActiveBgColor'];
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-tab-titles'                                           => $H::get_inline_styles( $nav_box ),
	'.shapeblock-tab-titles li'                                        => $H::get_inline_styles( array_merge( $title_li, $tab_shadow ) ),
	'.shapeblock-tab-title-text'                                       => $H::get_inline_styles( $title_text ),
	'.shapeblock-tab-titles i, ' . $selector . ' .shapeblock-tab-titles svg' => $H::get_inline_styles( $icon_color ),
	'.shapeblock-tab-image, ' . $selector . ' .shapeblock-tab-icon'         => $H::get_inline_styles( $icon_box ),
	'.shapeblock-tab-titles li.active, ' . $selector . ' .shapeblock-tab-titles li:hover' => $H::get_inline_styles( $title_li_active ),
	'.shapeblock-tab-titles li.active .shapeblock-tab-title-text, ' . $selector . ' .shapeblock-tab-titles li:hover .shapeblock-tab-title-text' => $H::get_inline_styles( $title_text_active ),
	'.shapeblock-tab-titles li.active, ' . $selector . ' .shapeblock-tab-titles li:hover ' => $H::get_inline_styles( $active_shadow ),
	'.shapeblock-tab-titles li:hover:not(.active)'                     => $H::get_inline_styles( $title_li_hover ),
	'.shapeblock-tab-titles li:hover:not(.active) .shapeblock-tab-title-text' => $H::get_inline_styles( $title_text_hover ),
	'.shapeblock-tab-titles li.active i, ' . $selector . ' .shapeblock-tab-titles li.active svg, ' . $selector . ' .shapeblock-tab-titles li:hover i, ' . $selector . ' .shapeblock-tab-titles li:hover svg' => $H::get_inline_styles( $icon_active ),
	'.shapeblock-tab-titles li.active .shapeblock-tab-icon, ' . $selector . ' .shapeblock-tab-titles li.active .shapeblock-tab-image, ' . $selector . ' .shapeblock-tab-titles li:hover .shapeblock-tab-icon, ' . $selector . ' .shapeblock-tab-titles li:hover .shapeblock-tab-image' => $H::get_inline_styles( $icon_box_active ),
	'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles' => $H::get_inline_styles( $nav ),
	'.shapeblock-tab-content'                                          => $H::get_inline_styles( $content ),
	'.shapeblock-tab-contents'                                         => $H::get_inline_styles( $contents_align ),
	'.shapeblock-content-title'                                        => $H::get_inline_styles( $content_title ),
	'.shapeblock-content-description'                                  => $H::get_inline_styles( array_merge( $desc, $desc_wrap ) ),
	'.shapeblock-read-more'                                            => $H::get_inline_styles( $btn ),
	'.shapeblock-read-more:hover'                                      => $H::get_inline_styles( $btn_hover ),
] );

// The default heart icon and the read-more chevron below are hard-coded SVG
// constants with no user input. wp_kses() lowercases every attribute name, which
// turns the case-sensitive viewBox into viewbox -- the browser then ignores it and
// the icon loses its intrinsic size. They are written as literal markup at their
// output points instead of being passed through wp_kses(); the icon-font <i> tag
// stays escaped with esc_attr() as before.
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-tabs-wrapper" data-tab-direction="<?php echo esc_attr( $direction ); ?>" data-icon-position="<?php echo esc_attr( $icon_pos ); ?>">
		<ul class="shapeblock-tab-titles">
			<?php foreach ( $tabs as $index => $item ) : ?>
				<?php
				$type     = isset( $item['iconType'] ) ? $item['iconType'] : 'icon';
				$icon     = isset( $item['icon'] ) ? $item['icon'] : '';
				$img      = isset( $item['image'] ) && is_array( $item['image'] ) ? $item['image'] : [];
				$tab_title = isset( $item['tabTitle'] ) ? $item['tabTitle'] : '';
				$active    = 0 === $index ? ' active' : '';
				?>
				<li class="shapeblock-tab-nav-item<?php echo esc_attr( $active ); ?>" data-tab="<?php echo esc_attr( $unique_id . '-tab-' . $index ); ?>">
					<?php
					if ( 'icon' === $type ) {
						echo '<span class="shapeblock-tab-icon">';
						if ( ! empty( $icon ) && 'none' !== $icon ) {
							echo '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>';
						} else {
							?><svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-6.7-4.3-9.3-8.5C1 9.6 2 6 5.3 5.2 7.3 4.7 9 5.8 12 8.6c3-2.8 4.7-3.9 6.7-3.4C22 6 23 9.6 21.3 12.5 18.7 16.7 12 21 12 21z"/></svg><?php
						}
						echo '</span>';
					} elseif ( 'image' === $type && ! empty( $img['url'] ) ) {
						echo '<span class="shapeblock-tab-image"><img src="' . esc_url( $img['url'] ) . '" alt="' . esc_attr( $img['alt'] ?? $tab_title ) . '"></span>';
					}
					?>
					<span class="shapeblock-tab-title-text"><?php echo esc_html( $tab_title ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
		<div class="shapeblock-tab-contents">
			<?php foreach ( $tabs as $index => $item ) : ?>
				<?php
				$content_title_txt = isset( $item['contentTitle'] ) ? $item['contentTitle'] : '';
				$description       = isset( $item['contentDescription'] ) ? $item['contentDescription'] : '';
				$btn_text          = isset( $item['readMoreText'] ) ? $item['readMoreText'] : '';
				$btn_url           = isset( $item['readMoreUrl'] ) ? $item['readMoreUrl'] : '';
				$btn_target        = ! empty( $item['readMoreNewTab'] ) ? '_blank' : '_self';
				$active            = 0 === $index ? ' active' : '';
				?>
				<div class="shapeblock-tab-content<?php echo esc_attr( $active ); ?>" id="<?php echo esc_attr( $unique_id . '-tab-' . $index ); ?>">
					<?php if ( isset( $item['html'] ) ) : ?>
						<?php echo wp_kses( $item['html'], $H::template_allowed_html() ); ?>
					<?php else : ?>
					<?php if ( '' !== $content_title_txt ) : ?>
						<h4 class="shapeblock-content-title"><?php echo esc_html( $content_title_txt ); ?></h4>
					<?php endif; ?>
					<?php if ( '' !== $description ) : ?>
						<div class="shapeblock-content-description"><?php echo wp_kses_post( wpautop( $description ) ); ?></div>
					<?php endif; ?>
					<?php if ( '' !== $btn_text && '' !== $btn_url ) : ?>
						<a class="shapeblock-read-more" href="<?php echo esc_url( $btn_url ); ?>" target="<?php echo esc_attr( $btn_target ); ?>"<?php echo '_blank' === $btn_target ? ' rel="noopener noreferrer"' : ''; ?>>
							<?php echo esc_html( $btn_text ); ?>
							<svg class="shapeblock-read-more-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
						</a>
					<?php endif; ?>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
<?php } )( $attributes, $content, $block );
