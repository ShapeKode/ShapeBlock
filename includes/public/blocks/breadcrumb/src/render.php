<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Breadcrumb block.
 *
 * Mirrors the markup of the Elementor "Breadcrumb" widget
 * (easy-elements/widgets/breadcrumb). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

if ( ! function_exists( 'shapeblock_breadcrumb_trail' ) ) {
	/**
	 * Build the breadcrumb trail HTML for the current query.
	 */
	function shapeblock_breadcrumb_trail( $separator, $home_title, $show_category_path, $home_icon_html ) {
		$queried   = get_queried_object();
		$object_id = get_queried_object_id();
		$home_title = '' !== $home_title ? $home_title : 'Home';

		$home_link = '<a href="' . esc_url( home_url( '/' ) ) . '">' . $home_icon_html . ( '' !== $home_icon_html ? ' ' : '' ) . '<span class="shapeblock-breadcrumb-home-text">' . esc_html( $home_title ) . '</span></a>';
		$output    = $home_link;

		if ( is_single() ) {
			$post_type = get_post_type();
			if ( 'post' !== $post_type ) {
				$pt_obj = get_post_type_object( $post_type );
				if ( $pt_obj && $pt_obj->has_archive ) {
					$output .= $separator . '<a href="' . esc_url( get_post_type_archive_link( $post_type ) ) . '">' . esc_html( $pt_obj->labels->name ) . '</a>';
				}
				if ( $show_category_path ) {
					foreach ( get_object_taxonomies( $post_type, 'objects' ) as $taxonomy ) {
						if ( $taxonomy->hierarchical ) {
							$terms = get_the_terms( $object_id, $taxonomy->name );
							if ( $terms && ! is_wp_error( $terms ) ) {
								$main_term = $terms[0];
								if ( $main_term->parent ) {
									foreach ( array_reverse( get_ancestors( $main_term->term_id, $taxonomy->name ) ) as $ancestor ) {
										$at = get_term( $ancestor, $taxonomy->name );
										$output .= $separator . '<a href="' . esc_url( get_term_link( $at ) ) . '">' . esc_html( $at->name ) . '</a>';
									}
								}
								$output .= $separator . '<a href="' . esc_url( get_term_link( $main_term ) ) . '">' . esc_html( $main_term->name ) . '</a>';
							}
						}
					}
				}
			}
			if ( 'post' === $post_type && $show_category_path ) {
				$cats = get_the_category( $object_id );
				if ( ! empty( $cats ) && ! is_wp_error( $cats ) ) {
					$main = $cats[0];
					foreach ( array_reverse( get_ancestors( $main->term_id, 'category' ) ) as $pid ) {
						$pt = get_term( $pid, 'category' );
						if ( $pt && ! is_wp_error( $pt ) ) {
							$output .= $separator . '<a href="' . esc_url( get_term_link( $pt ) ) . '">' . esc_html( $pt->name ) . '</a>';
						}
					}
					$output .= $separator . '<a href="' . esc_url( get_term_link( $main ) ) . '">' . esc_html( $main->name ) . '</a>';
				}
			}
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html( get_the_title() ) . '</span>';
		} elseif ( is_page() ) {
			if ( $queried && ! empty( $queried->post_parent ) ) {
				foreach ( array_reverse( get_post_ancestors( $queried->ID ) ) as $ancestor ) {
					$output .= $separator . '<a href="' . esc_url( get_permalink( $ancestor ) ) . '">' . esc_html( get_the_title( $ancestor ) ) . '</a>';
				}
			}
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html( get_the_title() ) . '</span>';
		} elseif ( is_category() || is_tag() || is_tax() ) {
			if ( $queried && ! is_wp_error( $queried ) ) {
				if ( ! empty( $queried->parent ) ) {
					foreach ( array_reverse( get_ancestors( $queried->term_id, $queried->taxonomy ) ) as $ancestor ) {
						$at = get_term( $ancestor, $queried->taxonomy );
						$output .= $separator . '<a href="' . esc_url( get_term_link( $at ) ) . '">' . esc_html( $at->name ) . '</a>';
					}
				}
				$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html( single_term_title( '', false ) ) . '</span>';
			}
		} elseif ( is_post_type_archive() ) {
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html( post_type_archive_title( '', false ) ) . '</span>';
		} elseif ( is_home() && ! is_front_page() ) {
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html( get_the_title( get_option( 'page_for_posts' ) ) ) . '</span>';
		} elseif ( is_search() ) {
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html__( 'Search Results for:', 'shapeblock' ) . ' ' . esc_html( get_search_query() ) . '</span>';
		} elseif ( is_404() ) {
			$output .= $separator . '<span class="shapeblock-breadcrumb-text">' . esc_html__( '404 Not Found', 'shapeblock' ) . '</span>';
		}

		return $output;
	}
}

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-bc-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$show_home_icon = ! empty( $attributes['showHomeIcon'] );
$home_icon      = isset( $attributes['homeIcon'] ) ? $attributes['homeIcon'] : '';
$home_title     = isset( $attributes['homeTitle'] ) ? $attributes['homeTitle'] : 'Home';
$show_cat       = ! empty( $attributes['showCategoryPath'] );
$show_sep_icon  = ! empty( $attributes['showSeparatorIcon'] );
$sep_icon       = isset( $attributes['separatorIcon'] ) ? $attributes['separatorIcon'] : '';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-breadcrumb-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-breadcrumb-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-breadcrumb-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-breadcrumb-style';

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

// Text.
$bc = $typo( $attributes['textTypography'] ?? [] );
if ( ! empty( $attributes['textColor'] ) ) $bc['color'] = $attributes['textColor'];
$link = [];
if ( ! empty( $attributes['textBgColor'] ) ) $link['background-color'] = $attributes['textBgColor'];
$link = array_merge( $link, $dims( $attributes['textPadding'] ?? [], 'padding' ), $dims( $attributes['textRadius'] ?? [], 'radius' ) );
$active = [];
if ( ! empty( $attributes['activeColor'] ) ) $active['color'] = $attributes['activeColor'];
if ( ! empty( $attributes['textBgColorActive'] ) ) $active['background-color'] = $attributes['textBgColorActive'];
$active = array_merge( $active, $dims( $attributes['textPaddingActive'] ?? [], 'padding' ), $dims( $attributes['textRadiusActive'] ?? [], 'radius' ) );

// Home icon.
$home = [];
if ( ! empty( $attributes['homeIconColor'] ) ) $home['color'] = $attributes['homeIconColor'];
if ( ! empty( $attributes['homeIconBg'] ) ) $home['background-color'] = $attributes['homeIconBg'];
if ( '' !== $u( 'homeIconSize' ) ) $home['font-size'] = $u( 'homeIconSize' );
$home = array_merge( $home, $dims( $attributes['homeIconRadius'] ?? [], 'radius' ), $dims( $attributes['homeIconPadding'] ?? [], 'padding' ) );
if ( '' !== $u( 'homeIconPosY' ) ) $home['top'] = $u( 'homeIconPosY' );
if ( '' !== $u( 'homeIconPosX' ) ) $home['left'] = $u( 'homeIconPosX' );
$home_svg = [];
if ( ! empty( $attributes['homeIconColor'] ) ) $home_svg['fill'] = $attributes['homeIconColor'];
if ( '' !== $u( 'homeIconSize' ) ) { $home_svg['width'] = $u( 'homeIconSize' ); $home_svg['height'] = $u( 'homeIconSize' ); }

// Separator.
$sep = [];
if ( ! empty( $attributes['separatorColor'] ) ) $sep['color'] = $attributes['separatorColor'];
if ( ! empty( $attributes['separatorBg'] ) ) $sep['background-color'] = $attributes['separatorBg'];
if ( '' !== $u( 'separatorSize' ) ) $sep['font-size'] = $u( 'separatorSize' );
$sep = array_merge( $sep, $dims( $attributes['separatorRadius'] ?? [], 'radius' ), $dims( $attributes['separatorPadding'] ?? [], 'padding' ), $dims( $attributes['separatorGap'] ?? [], 'margin' ) );
if ( '' !== $u( 'separatorPosY' ) || '' !== $u( 'separatorPosX' ) ) $sep['position'] = 'relative';
if ( '' !== $u( 'separatorPosY' ) ) $sep['top'] = $u( 'separatorPosY' );
if ( '' !== $u( 'separatorPosX' ) ) $sep['left'] = $u( 'separatorPosX' );
$sep_svg = [];
if ( ! empty( $attributes['separatorColor'] ) ) $sep_svg['fill'] = $attributes['separatorColor'];
if ( '' !== $u( 'separatorSize' ) ) { $sep_svg['width'] = $u( 'separatorSize' ); $sep_svg['height'] = $u( 'separatorSize' ); }

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims ) {
	return [
		'typo'      => $typo( $attributes[ 'textTypography' . $suffix ] ?? [] ),
		'link'      => $dims( $attributes[ 'textPadding' . $suffix ] ?? [], 'padding' ),
		'active'    => $dims( $attributes[ 'textPaddingActive' . $suffix ] ?? [], 'padding' ),
		'home'      => $dims( $attributes[ 'homeIconPadding' . $suffix ] ?? [], 'padding' ),
		'separator' => array_merge(
			$dims( $attributes[ 'separatorPadding' . $suffix ] ?? [], 'padding' ),
			$dims( $attributes[ 'separatorGap' . $suffix ] ?? [], 'margin' )
		),
	];
};
$dev_data       = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_selectors = [
	'typo'      => $selector . ' .shapeblock-breadcrumb, ' . $selector . ' .shapeblock-breadcrumb a, ' . $selector . ' .shapeblock-breadcrumb span',
	'link'      => $selector . ' .shapeblock-breadcrumb-path a',
	'active'    => $selector . ' .shapeblock-breadcrumb-text',
	'home'      => $selector . ' .shapeblock-breadcrumb-home-icon',
	'separator' => $selector . ' .shapeblock-breadcrumb-separator',
];
$resp_css = '';
foreach ( $resp_selectors as $sub_key => $full_sel ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		if ( ! empty( $dev_data[ $suffix ][ $sub_key ] ) ) {
			$rdata[ $device_key ] = $dev_data[ $suffix ][ $sub_key ];
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $full_sel, $rdata );
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-breadcrumb, ' . $selector . ' .shapeblock-breadcrumb a, ' . $selector . ' .shapeblock-breadcrumb span' => $H::get_inline_styles( $bc ),
	'.shapeblock-breadcrumb-path a'             => $H::get_inline_styles( $link ),
	'.shapeblock-breadcrumb-text'               => $H::get_inline_styles( $active ),
	'.shapeblock-breadcrumb-home-icon'          => $H::get_inline_styles( $home ),
	'.shapeblock-breadcrumb-home-icon svg, ' . $selector . ' .shapeblock-breadcrumb-home-icon path' => $H::get_inline_styles( $home_svg ),
	'.shapeblock-breadcrumb-separator'          => $H::get_inline_styles( $sep ),
	'.shapeblock-breadcrumb-separator svg, ' . $selector . ' .shapeblock-breadcrumb-separator path' => $H::get_inline_styles( $sep_svg ),
] );

// ---------------------------------------------------------------------------
// Icons.
// ---------------------------------------------------------------------------
$home_icon_html = '';
if ( $show_home_icon ) {
	$home_icon_html = ( ! empty( $home_icon ) && 'none' !== $home_icon )
		? '<i class="shapeblock-icon ' . esc_attr( $home_icon ) . ' shapeblock-breadcrumb-home-icon" aria-hidden="true"></i>'
		: '<svg class="shapeblock-breadcrumb-home-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2z"></path></svg>';
}

if ( $show_sep_icon ) {
	$separator = ( ! empty( $sep_icon ) && 'none' !== $sep_icon )
		? '<i class="shapeblock-icon ' . esc_attr( $sep_icon ) . ' shapeblock-breadcrumb-separator" aria-hidden="true"></i>'
		: '<svg class="shapeblock-breadcrumb-separator" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8.6 5.4 7.2 6.8 12.4 12l-5.2 5.2 1.4 1.4L15.2 12z"></path></svg>';
} else {
	$separator = '<span class="shapeblock-breadcrumb-separator">/</span>';
}

$trail = shapeblock_breadcrumb_trail( $separator, $home_title, $show_cat, $home_icon_html );

$allowed = array_merge(
	wp_kses_allowed_html( 'post' ),
	[
		'svg'  => [ 'xmlns' => true, 'fill' => true, 'viewbox' => true, 'role' => true, 'aria-hidden' => true, 'focusable' => true, 'class' => true, 'width' => true, 'height' => true ],
		'path' => [ 'd' => true, 'fill' => true ],
		'i'    => [ 'class' => true, 'aria-hidden' => true ],
	]
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-breadcrumb">
		<div class="shapeblock-breadcrumb-path"><?php echo wp_kses( $trail, $allowed ); ?></div>
	</div>
</div>
