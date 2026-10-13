<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Breadcrumb block.
 *
 * Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

if ( ! function_exists( 'shapeblock_breadcrumb_trail' ) ) {
	/**
	 * Echo the breadcrumb trail HTML for the current query.
	 *
	 * $render_separator and $render_home_icon are callables that echo their own
	 * markup directly (icon-font <i> wrapped in wp_kses(), or a hard-coded fallback
	 * SVG written as literal markup). Every other value inserted below is a post/
	 * term title or permalink escaped inline with esc_html()/esc_url() at the point
	 * it is echoed. Echoing progressively like this -- instead of building one big
	 * string and running the whole thing through wp_kses() afterwards -- is what
	 * keeps the fallback SVGs' case-sensitive viewBox attribute intact; wp_kses()
	 * lowercases every attribute name, so passing an already-built SVG through it
	 * would turn viewBox into viewbox and the browser would ignore it.
	 */
	function shapeblock_breadcrumb_trail( $render_separator, $home_title, $show_category_path, $render_home_icon, $has_home_icon, $show_home_text = true, $show_current = true ) {
		$queried   = get_queried_object();
		$object_id = get_queried_object_id();
		$home_title = '' !== $home_title ? $home_title : __( 'Home', 'shapeblock' );

		// The last item: the page being viewed (hidden with "Show Current Page" off).
		$current = function ( $text ) use ( $render_separator, $show_current ) {
			if ( ! $show_current ) {
				return;
			}
			$render_separator();
			echo '<span class="shapeblock-breadcrumb-text" aria-current="page">' . esc_html( $text ) . '</span>';
		};

		if ( $show_home_text || ! $has_home_icon ) {
			echo '<a href="' . esc_url( home_url( '/' ) ) . '" class="shapeblock-breadcrumb-home">';
		} else {
			// Without visible text the link still needs a name for screen readers.
			echo '<a href="' . esc_url( home_url( '/' ) ) . '" class="shapeblock-breadcrumb-home" aria-label="' . esc_attr( $home_title ) . '">';
		}
		if ( $has_home_icon ) {
			$render_home_icon();
		}
		if ( $show_home_text || ! $has_home_icon ) {
			echo '<span class="shapeblock-breadcrumb-home-text">' . esc_html( $home_title ) . '</span>';
		}
		echo '</a>';

		// Editor preview. The block is rendered over REST there, where no page is
		// being viewed, so the trail would stop at "Home" and the separator and
		// current item -- and every setting for them -- could never be seen. The
		// post being edited is used instead, or a sample trail when that is not a
		// post or page (a template, a header or footer).
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			$preview = get_post();
			if ( $preview && in_array( $preview->post_type, array( 'post', 'page' ), true ) ) {
				if ( 'page' === $preview->post_type ) {
					foreach ( array_reverse( get_post_ancestors( $preview ) ) as $ancestor ) {
						$render_separator();
						echo '<a href="' . esc_url( get_permalink( $ancestor ) ) . '">' . esc_html( get_the_title( $ancestor ) ) . '</a>';
					}
				} elseif ( $show_category_path ) {
					$cats = get_the_category( $preview->ID );
					if ( ! empty( $cats ) ) {
						$render_separator();
						echo '<a href="' . esc_url( get_term_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
					}
				}
				$title = get_the_title( $preview );
				$current( '' !== $title ? $title : __( 'Current Page', 'shapeblock' ) );
			} else {
				$render_separator();
				echo '<a href="#">' . esc_html__( 'Parent Page', 'shapeblock' ) . '</a>';
				$current( __( 'Current Page', 'shapeblock' ) );
			}
			return;
		}

		if ( is_single() ) {
			$post_type = get_post_type();
			if ( 'post' !== $post_type ) {
				$pt_obj = get_post_type_object( $post_type );
				if ( $pt_obj && $pt_obj->has_archive ) {
					$render_separator();
					echo '<a href="' . esc_url( get_post_type_archive_link( $post_type ) ) . '">' . esc_html( $pt_obj->labels->name ) . '</a>';
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
										$render_separator();
										echo '<a href="' . esc_url( get_term_link( $at ) ) . '">' . esc_html( $at->name ) . '</a>';
									}
								}
								$render_separator();
								echo '<a href="' . esc_url( get_term_link( $main_term ) ) . '">' . esc_html( $main_term->name ) . '</a>';
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
							$render_separator();
							echo '<a href="' . esc_url( get_term_link( $pt ) ) . '">' . esc_html( $pt->name ) . '</a>';
						}
					}
					$render_separator();
					echo '<a href="' . esc_url( get_term_link( $main ) ) . '">' . esc_html( $main->name ) . '</a>';
				}
			}
						$current( get_the_title() );
		} elseif ( is_page() ) {
			if ( $queried && ! empty( $queried->post_parent ) ) {
				foreach ( array_reverse( get_post_ancestors( $queried->ID ) ) as $ancestor ) {
					$render_separator();
					echo '<a href="' . esc_url( get_permalink( $ancestor ) ) . '">' . esc_html( get_the_title( $ancestor ) ) . '</a>';
				}
			}
						$current( get_the_title() );
		} elseif ( is_category() || is_tag() || is_tax() ) {
			if ( $queried && ! is_wp_error( $queried ) ) {
				if ( ! empty( $queried->parent ) ) {
					foreach ( array_reverse( get_ancestors( $queried->term_id, $queried->taxonomy ) ) as $ancestor ) {
						$at = get_term( $ancestor, $queried->taxonomy );
						$render_separator();
						echo '<a href="' . esc_url( get_term_link( $at ) ) . '">' . esc_html( $at->name ) . '</a>';
					}
				}
								$current( single_term_title( '', false ) );
			}
		} elseif ( is_post_type_archive() ) {
						$current( post_type_archive_title( '', false ) );
		} elseif ( is_home() && ! is_front_page() ) {
						$current( get_the_title( get_option( 'page_for_posts' ) ) );
		} elseif ( is_search() ) {
						$current( __( 'Search Results for:', 'shapeblock' ) . ' ' . get_search_query() );
		} elseif ( is_404() ) {
						$current( __( '404 Not Found', 'shapeblock' ) );
		}
	}
}

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-bc-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$show_home_icon = ! empty( $attributes['showHomeIcon'] );
$home_icon      = isset( $attributes['homeIcon'] ) ? $attributes['homeIcon'] : '';
$home_title     = isset( $attributes['homeTitle'] ) ? $attributes['homeTitle'] : 'Home';
$show_cat       = ! empty( $attributes['showCategoryPath'] );
$show_sep_icon  = ! empty( $attributes['showSeparatorIcon'] );
$sep_text       = isset( $attributes['separatorText'] ) ? (string) $attributes['separatorText'] : '/';
$show_home_text = ! isset( $attributes['showHomeText'] ) || ! empty( $attributes['showHomeText'] );
$show_current   = ! isset( $attributes['showCurrent'] ) || ! empty( $attributes['showCurrent'] );
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

// Background: a gradient wins over a solid colour.
$bg = function ( $color_key, $grad_key ) use ( $attributes ) {
	if ( ! empty( $attributes[ $grad_key ] ) ) return [ 'background' => $attributes[ $grad_key ] ];
	if ( ! empty( $attributes[ $color_key ] ) ) return [ 'background-color' => $attributes[ $color_key ] ];
	return [];
};

// Container.
$wrap = array_merge(
	$bg( 'bcBg', 'bcBgGradient' ),
	$dims( $attributes['bcPadding'] ?? [], 'padding' ),
	$dims( $attributes['bcRadius'] ?? [], 'radius' ),
	$H::border_to_css_props( $attributes['bcBorder'] ?? [] )
);

// Text. Typography on the whole trail; colours on each kind of item, so the
// link colour cannot override the current-page or separator colour.
$bc   = $typo( $attributes['textTypography'] ?? [] );
// Text decoration is not inherited into the flex items, and links reset it,
// so it is applied to the items themselves.
$deco = isset( $bc['text-decoration'] ) ? [ 'text-decoration' => $bc['text-decoration'] ] : [];
$link = [];
if ( ! empty( $attributes['textColor'] ) ) $link['color'] = $attributes['textColor'];
$link = array_merge( $link, $bg( 'textBgColor', 'textBgGradient' ), $dims( $attributes['textPadding'] ?? [], 'padding' ), $dims( $attributes['textRadius'] ?? [], 'radius' ) );
$link_hover = [];
if ( ! empty( $attributes['linkHoverColor'] ) ) $link_hover['color'] = $attributes['linkHoverColor'];
$link_hover = array_merge( $link_hover, $bg( 'textBgColorHover', 'textBgGradientHover' ) );
$active = [];
if ( ! empty( $attributes['activeColor'] ) ) $active['color'] = $attributes['activeColor'];
$active = array_merge( $active, $bg( 'textBgColorActive', 'textBgGradientActive' ), $dims( $attributes['textPaddingActive'] ?? [], 'padding' ), $dims( $attributes['textRadiusActive'] ?? [], 'radius' ) );
$home_link = ( '' !== $u( 'homeIconGap' ) ) ? [ 'gap' => $u( 'homeIconGap' ) ] : [];

// Home icon.
$home = [];
if ( ! empty( $attributes['homeIconColor'] ) ) $home['color'] = $attributes['homeIconColor'];
$home = array_merge( $home, $bg( 'homeIconBg', 'homeIconBgGradient' ) );
if ( '' !== $u( 'homeIconSize' ) ) $home['font-size'] = $u( 'homeIconSize' );
$home = array_merge( $home, $dims( $attributes['homeIconRadius'] ?? [], 'radius' ), $dims( $attributes['homeIconPadding'] ?? [], 'padding' ) );
if ( '' !== $u( 'homeIconPosY' ) ) $home['top'] = $u( 'homeIconPosY' );
if ( '' !== $u( 'homeIconPosX' ) ) $home['left'] = $u( 'homeIconPosX' );
$home_hover = ! empty( $attributes['homeIconHoverColor'] ) ? [ 'color' => $attributes['homeIconHoverColor'] ] : [];

// Separator.
$sep = [];
if ( ! empty( $attributes['separatorColor'] ) ) $sep['color'] = $attributes['separatorColor'];
$sep = array_merge( $sep, $bg( 'separatorBg', 'separatorBgGradient' ) );
if ( '' !== $u( 'separatorSize' ) ) $sep['font-size'] = $u( 'separatorSize' );
$sep = array_merge( $sep, $dims( $attributes['separatorRadius'] ?? [], 'radius' ), $dims( $attributes['separatorPadding'] ?? [], 'padding' ), $dims( $attributes['separatorGap'] ?? [], 'margin' ) );
if ( '' !== $u( 'separatorPosY' ) || '' !== $u( 'separatorPosX' ) ) $sep['position'] = 'relative';
if ( '' !== $u( 'separatorPosY' ) ) $sep['top'] = $u( 'separatorPosY' );
if ( '' !== $u( 'separatorPosX' ) ) $sep['left'] = $u( 'separatorPosX' );

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims ) {
	return [
		'wrap'      => $dims( $attributes[ 'bcPadding' . $suffix ] ?? [], 'padding' ),
		'typo'      => $typo( $attributes[ 'textTypography' . $suffix ] ?? [] ),
		'deco'      => array_intersect_key( $typo( $attributes[ 'textTypography' . $suffix ] ?? [] ), [ 'text-decoration' => 1 ] ),
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
	'wrap'      => $selector . ' .shapeblock-breadcrumb',
	'typo'      => $selector . ' .shapeblock-breadcrumb',
	'deco'      => $selector . ' .shapeblock-breadcrumb-path a, ' . $selector . ' .shapeblock-breadcrumb-path .shapeblock-breadcrumb-text',
	'link'      => $selector . ' .shapeblock-breadcrumb-path a',
	'active'    => $selector . ' .shapeblock-breadcrumb-path .shapeblock-breadcrumb-text',
	'home'      => $selector . ' .shapeblock-breadcrumb-path .shapeblock-breadcrumb-home-icon',
	'separator' => $selector . ' .shapeblock-breadcrumb-path .shapeblock-breadcrumb-separator',
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

// Alignment of the whole trail: text-align on the wrapper places the trail,
// justify-content keeps the lines in place once a long trail wraps.
$align_data   = [];
$justify_data = [];
$justify_map  = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
foreach ( [ '' => 'desktop', 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$al = $attributes[ 'bcAlign' . $suffix ] ?? '';
	if ( isset( $justify_map[ $al ] ) ) {
		$align_data[ $device_key ]   = [ 'text-align' => $al ];
		$justify_data[ $device_key ] = [ 'justify-content' => $justify_map[ $al ] ];
	}
}
if ( ! empty( $align_data ) ) {
	$resp_css = $H::generate_responsive_css( $selector, $align_data )
		. $H::generate_responsive_css( $selector . ' .shapeblock-breadcrumb-path', $justify_data )
		. $resp_css;
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-breadcrumb'                    => $H::get_inline_styles( array_merge( $wrap, $bc ) ),
	'.shapeblock-breadcrumb-path a, ' . $selector . ' .shapeblock-breadcrumb-path .shapeblock-breadcrumb-text' => $H::get_inline_styles( $deco ),
	'.shapeblock-breadcrumb-path a'             => $H::get_inline_styles( $link ),
	'.shapeblock-breadcrumb-path a:hover, ' . $selector . ' .shapeblock-breadcrumb-path a:focus-visible' => $H::get_inline_styles( $link_hover ),
	'.shapeblock-breadcrumb-path .shapeblock-breadcrumb-home' => $H::get_inline_styles( $home_link ),
	'.shapeblock-breadcrumb-path .shapeblock-breadcrumb-text' => $H::get_inline_styles( $active ),
	'.shapeblock-breadcrumb-path .shapeblock-breadcrumb-home-icon' => $H::get_inline_styles( $home ),
	'.shapeblock-breadcrumb-path a:hover .shapeblock-breadcrumb-home-icon' => $H::get_inline_styles( $home_hover ),
	'.shapeblock-breadcrumb-path .shapeblock-breadcrumb-separator' => $H::get_inline_styles( $sep ),
] );

// ---------------------------------------------------------------------------
// Icons.
// ---------------------------------------------------------------------------
// Allow-list for the dynamic icon-font <i> tag (esc_attr'd class). The static
// home/separator fallback SVGs are written as literal markup by $render_home_icon
// and $render_separator below and never passed through wp_kses() -- see the
// comment on shapeblock_breadcrumb_trail() above.
$icon_allowed_html = [
	'i' => [ 'class' => true, 'aria-hidden' => true ],
];

$has_home_icon  = $show_home_icon;
$render_home_icon = function () use ( $home_icon, $icon_allowed_html ) {
	if ( ! empty( $home_icon ) && 'none' !== $home_icon ) {
		echo wp_kses( '<i class="shapeblock-icon ' . esc_attr( $home_icon ) . ' shapeblock-breadcrumb-home-icon" aria-hidden="true"></i>', $icon_allowed_html );
	} else {
		?><svg class="shapeblock-breadcrumb-home-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2z"></path></svg><?php
	}
};

$render_separator = function () use ( $show_sep_icon, $sep_icon, $sep_text, $icon_allowed_html ) {
	if ( ! $show_sep_icon ) {
		echo '<span class="shapeblock-breadcrumb-separator" aria-hidden="true">' . esc_html( $sep_text ) . '</span>';
		return;
	}
	if ( ! empty( $sep_icon ) && 'none' !== $sep_icon ) {
		echo wp_kses( '<i class="shapeblock-icon ' . esc_attr( $sep_icon ) . ' shapeblock-breadcrumb-separator" aria-hidden="true"></i>', $icon_allowed_html );
	} else {
		?><svg class="shapeblock-breadcrumb-separator" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8.6 5.4 7.2 6.8 12.4 12l-5.2 5.2 1.4 1.4L15.2 12z"></path></svg><?php
	}
};
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-breadcrumb">
		<div class="shapeblock-breadcrumb-path">
			<?php shapeblock_breadcrumb_trail( $render_separator, $home_title, $show_cat, $render_home_icon, $has_home_icon, $show_home_text, $show_current ); ?>
		</div>
	</div>
</div>
<?php } )( $attributes, $content, $block );
