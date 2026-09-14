<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Testimonials Grid block.
 *
 * Mirrors the markup of the Elementor "Testimonials Grid" widget
 * (easy-elements/widgets/testimonials-grid) — 6 skins, ratings, quote icons,
 * logos and a view-all reveal. Element classes use this plugin's "shapeblock-" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-tstml-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$skin        = isset( $attributes['testimonialsSkin'] ) ? preg_replace( '/[^a-z0-9_-]/i', '', (string) $attributes['testimonialsSkin'] ) : 'default';
if ( '' === $skin ) { $skin = 'default'; }
// Only three styles are supported; any legacy/removed skin falls back to default.
if ( ! in_array( $skin, [ 'default', 'skin3', 'skin6' ], true ) ) { $skin = 'default'; }
$items       = isset( $attributes['testimonials'] ) && is_array( $attributes['testimonials'] ) ? $attributes['testimonials'] : [];
$show_image  = ! empty( $attributes['showImage'] );
$show_rating = ! empty( $attributes['showRating'] );

if ( empty( $items ) ) {
	$wrap = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-testimonial-block-wrap ' . $unique_id ) );
	echo '<div ' . wp_kses_post( $wrap ) . '><p>' . esc_html__( 'Please add testimonials.', 'shapeblock' ) . '</p></div>';
	return;
}

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-testimonial-block-wrap ' . $unique_id . ' shapeblock-testimonial shapeblock-grid-layout',
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-testimonial-block-wrap ' . esc_attr( $unique_id ) . ' shapeblock-testimonial shapeblock-grid-layout"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-testimonial-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-testimonials-grid-style';

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
$shadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) return [];
	$x = (int) ( $obj['x'] ?? 0 ); $y = (int) ( $obj['y'] ?? 0 ); $b = (int) ( $obj['b'] ?? 0 ); $s = (int) ( $obj['s'] ?? 0 );
	$c = $obj['c'] ?? '';
	$transparent = in_array( str_replace( ' ', '', (string) $c ), [ '', 'rgba(0,0,0,0)' ], true );
	if ( 0 === $x && 0 === $y && 0 === $b && 0 === $s && $transparent ) return [];
	return [ 'box-shadow' => $H::box_shadow_to_css( $obj ) ];
};
$bg = function ( $colorKey, $gradKey ) use ( $attributes ) {
	if ( ! empty( $attributes[ $gradKey ] ) ) return [ 'background' => $attributes[ $gradKey ] ];
	if ( ! empty( $attributes[ $colorKey ] ) ) return [ 'background' => $attributes[ $colorKey ] ];
	return [];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Columns (responsive) — not applied on default/skin4 (full-width).
$col_css = '';
if ( ! in_array( $skin, [ 'default', 'skin4' ], true ) ) {
	$c_d = isset( $attributes['columns'] ) ? (int) $attributes['columns'] : 3;
	$c_t = isset( $attributes['columnsTablet'] ) && '' !== $attributes['columnsTablet'] ? (int) $attributes['columnsTablet'] : $c_d;
	$c_m = isset( $attributes['columnsMobile'] ) && '' !== $attributes['columnsMobile'] ? (int) $attributes['columnsMobile'] : 2;
	$grid_resp = [
		'desktop' => [ 'width' => 'calc(100% / ' . max( 1, $c_d ) . ')' ],
		'tablet'  => [ 'width' => 'calc(100% / ' . max( 1, $c_t ) . ')' ],
		'mobile'  => [ 'width' => 'calc(100% / ' . max( 1, $c_m ) . ')' ],
	];
	// Pin the width to this skin's own items. Blocks duplicated before the editor
	// started re-issuing blockId still share a selector, and without this the column
	// width of a Style 2/3 copy would also land on a Style 1 copy, whose rows are
	// meant to stay full width.
	$col_css = $H::generate_responsive_css( $selector . ' .shapeblock-grid-item.shapeblock-testimonials--' . $skin, $grid_resp );
}

$align       = ! empty( $attributes['testimonialsAlignment'] ) ? $attributes['testimonialsAlignment'] : '';
$align_styles = $align ? [ 'text-align' => $align ] : [];

$item_pad = $dims( $attributes['itemPadding'] ?? [], 'padding' );
$inner = $bg( 'bgColor', 'bgGradient' );
$inner = array_merge( $inner, $dims( $attributes['itemBorderRadius'] ?? [], 'radius' ), $dims( $attributes['itemInnerPadding'] ?? [], 'padding' ), $shadow( $attributes['itemBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['itemBorder'] ) ) $inner = array_merge( $inner, $H::border_to_css_props( $attributes['itemBorder'] ) );
if ( '' !== $u( 'wrapperGap' ) ) $inner['gap'] = $u( 'wrapperGap' );

$name_styles = $typo( $attributes['nameTypography'] ?? [] );
if ( ! empty( $attributes['nameColor'] ) ) $name_styles['color'] = $attributes['nameColor'];
$name_margin = $dims( $attributes['nameMargin'] ?? [], 'margin' );

$deg_styles = $typo( $attributes['designationTypography'] ?? [] );
if ( ! empty( $attributes['designationColor'] ) ) $deg_styles['color'] = $attributes['designationColor'];

$desc_styles = $typo( $attributes['descriptionTypography'] ?? [] );
if ( ! empty( $attributes['descriptionColor'] ) ) $desc_styles['color'] = $attributes['descriptionColor'];
$desc_styles = array_merge( $desc_styles, $dims( $attributes['descriptionMargin'] ?? [], 'margin' ) );
if ( '' !== $u( 'minHeight' ) ) $desc_styles['min-height'] = $u( 'minHeight' );
if ( '' !== $u( 'maxWidth' ) ) $desc_styles['max-width'] = $u( 'maxWidth' );

$rating_styles = [];
if ( ! empty( $attributes['ratingColor'] ) ) $rating_styles['color'] = $attributes['ratingColor'];
if ( '' !== $u( 'ratingSize' ) ) $rating_styles['font-size'] = $u( 'ratingSize' );

$author_wrap = ! empty( $attributes['authorMetaAlignment'] ) ? [ 'align-items' => $attributes['authorMetaAlignment'] ] : [];
$picture_margin = $dims( $attributes['authorMetaGap'] ?? [], 'margin' );
$img_styles = [];
if ( '' !== $u( 'authorImageSize' ) ) { $img_styles['width'] = $u( 'authorImageSize' ) . ' !important'; $img_styles['height'] = $u( 'authorImageSize' ) . ' !important'; $img_styles['object-fit'] = 'cover'; }
$img_styles = array_merge( $img_styles, $dims( $attributes['authorImageBorderRadius'] ?? [], 'radius' ) );
$logo_styles = ( '' !== $u( 'logoHeight' ) ) ? [ 'height' => $u( 'logoHeight' ), 'width' => 'auto' ] : [];

$quote_styles = [];
if ( ! empty( $attributes['quoteIconColor'] ) ) $quote_styles['fill'] = $attributes['quoteIconColor'];
$quote_size = ( '' !== $u( 'quoteIconSize' ) ) ? [ 'width' => $u( 'quoteIconSize' ), 'height' => $u( 'quoteIconSize' ) ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H, $selector ) {
	$out = [];

	// Item padding.
	$out[ $selector . ' .shapeblock-grid-item' ] = $dims( $attributes[ 'itemPadding' . $suffix ] ?? [], 'padding' );

	// Inner padding + wrapper gap.
	$inner = $dims( $attributes[ 'itemInnerPadding' . $suffix ] ?? [], 'padding' );
	if ( isset( $attributes[ 'wrapperGap' . $suffix ] ) && '' !== $attributes[ 'wrapperGap' . $suffix ] ) $inner['gap'] = $H::ensure_unit( $attributes[ 'wrapperGap' . $suffix ] );
	$out[ $selector . ' .shapeblock-tstml-inner' ] = $inner;

	// Content alignment (mirrors the desktop compound selector).
	$align = [];
	if ( ! empty( $attributes[ 'testimonialsAlignment' . $suffix ] ) ) $align['text-align'] = $attributes[ 'testimonialsAlignment' . $suffix ];
	$out[ $selector . ' .shapeblock-tstml-inner, ' . $selector . ' .shapeblock-tstml-inner .eel-description' ] = $align;

	// Name typography.
	$out[ $selector . ' .shapeblock-tstml-inner .shapeblock-name' ] = $typo( $attributes[ 'nameTypography' . $suffix ] ?? [] );

	// Name margin + author-meta alignment.
	$awrap = $dims( $attributes[ 'nameMargin' . $suffix ] ?? [], 'margin' );
	if ( ! empty( $attributes[ 'authorMetaAlignment' . $suffix ] ) ) $awrap['align-items'] = $attributes[ 'authorMetaAlignment' . $suffix ];
	$out[ $selector . ' .shapeblock-tstml-inner .shapeblock-author-wrap' ] = $awrap;

	// Designation typography.
	$out[ $selector . ' .shapeblock-tstml-inner .shapeblock-designation' ] = $typo( $attributes[ 'designationTypography' . $suffix ] ?? [] );

	// Description typography + margin + min-height + max-width.
	$desc = $typo( $attributes[ 'descriptionTypography' . $suffix ] ?? [] );
	$desc = array_merge( $desc, $dims( $attributes[ 'descriptionMargin' . $suffix ] ?? [], 'margin' ) );
	if ( isset( $attributes[ 'minHeight' . $suffix ] ) && '' !== $attributes[ 'minHeight' . $suffix ] ) $desc['min-height'] = $H::ensure_unit( $attributes[ 'minHeight' . $suffix ] );
	if ( isset( $attributes[ 'maxWidth' . $suffix ] ) && '' !== $attributes[ 'maxWidth' . $suffix ] ) $desc['max-width'] = $H::ensure_unit( $attributes[ 'maxWidth' . $suffix ] );
	$out[ $selector . ' .shapeblock-tstml-inner .shapeblock-description' ] = $desc;

	// Skin 4 author alignment.
	$s4 = [];
	if ( ! empty( $attributes[ 'authorMetaAlignmentStyle4' . $suffix ] ) ) $s4['text-align'] = $attributes[ 'authorMetaAlignmentStyle4' . $suffix ];
	$out[ $selector . ' .shapeblock-tstml-inner.skin4 .shapeblock-author' ] = $s4;

	// Author info gap.
	$out[ $selector . ' .shapeblock-author-wrap .shapeblock-picture' ] = $dims( $attributes[ 'authorMetaGap' . $suffix ] ?? [], 'margin' );

	// Logo height.
	$logo = [];
	if ( isset( $attributes[ 'logoHeight' . $suffix ] ) && '' !== $attributes[ 'logoHeight' . $suffix ] ) { $logo['height'] = $H::ensure_unit( $attributes[ 'logoHeight' . $suffix ] ); $logo['width'] = 'auto'; }
	$out[ $selector . ' .shapeblock-company-logo img' ] = $logo;

	return $out;
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( array_keys( $dev_data['Tablet'] ) as $full_sel ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		if ( ! empty( $dev_data[ $suffix ][ $full_sel ] ) ) {
			$rdata[ $device_key ] = $dev_data[ $suffix ][ $full_sel ];
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $full_sel, $rdata );
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $col_css . $resp_css, [
	'.shapeblock-grid-item'                          => $H::get_inline_styles( $item_pad ),
	'.shapeblock-tstml-inner'                        => $H::get_inline_styles( $inner ),
	'.shapeblock-tstml-inner, ' . $selector . ' .shapeblock-tstml-inner .eel-description' => $H::get_inline_styles( $align_styles ),
	'.shapeblock-tstml-inner .shapeblock-name'            => $H::get_inline_styles( $name_styles ),
	'.shapeblock-tstml-inner .shapeblock-author-wrap'     => $H::get_inline_styles( array_merge( $name_margin, $author_wrap ) ),
	'.shapeblock-tstml-inner .shapeblock-designation'     => $H::get_inline_styles( $deg_styles ),
	'.shapeblock-tstml-inner .shapeblock-description'     => $H::get_inline_styles( $desc_styles ),
	'.shapeblock-rating span.star'                   => $H::get_inline_styles( $rating_styles ),
	'.shapeblock-author-wrap .shapeblock-picture'         => $H::get_inline_styles( $picture_margin ),
	'.shapeblock-author-wrap .shapeblock-picture img, ' . $selector . ' .shapeblock-picture img' => $H::get_inline_styles( $img_styles ),
	'.shapeblock-company-logo img'                   => $H::get_inline_styles( $logo_styles ),
	'.shapeblock-quote svg, ' . $selector . ' .shapeblock-quote svg path' => $H::get_inline_styles( $quote_styles ),
	'.shapeblock-quote svg'                          => $H::get_inline_styles( $quote_size ),
] );

// ---------------------------------------------------------------------------
// Markup helpers.
// ---------------------------------------------------------------------------
$placeholder = SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png';
$svg_quote = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 7H5a2 2 0 00-2 2v4a2 2 0 002 2h2v-2H5V9h4V7zm10 0h-4a2 2 0 00-2 2v4a2 2 0 002 2h2v-2h-2V9h4V7z"/></svg>';
$icon_i = function ( $val, $fallback ) {
	return ( ! empty( $val ) && 'none' !== $val ) ? '<i class="shapeblock-icon ' . esc_attr( $val ) . '" aria-hidden="true"></i>' : $fallback;
};

$render_picture = function ( $item ) use ( $show_image, $placeholder ) {
	if ( ! $show_image ) return '';
	$src = ! empty( $item['image']['url'] ) ? $item['image']['url'] : $placeholder;
	$alt = ! empty( $item['image']['alt'] ) ? $item['image']['alt'] : '';
	return '<div class="shapeblock-picture"><img src="' . esc_url( $src ) . '" alt="' . esc_attr( $alt ) . '" loading="lazy" decoding="async"></div>';
};
$render_logo = function ( $item ) {
	if ( empty( $item['logo']['url'] ) ) return '';
	return '<div class="shapeblock-company-logo"><img src="' . esc_url( $item['logo']['url'] ) . '" alt="' . esc_attr( $item['logo']['alt'] ?? '' ) . '" loading="lazy" decoding="async"></div>';
};
$render_rating = function ( $item ) use ( $show_rating ) {
	if ( ! $show_rating || empty( $item['rating'] ) ) return '';
	$r = (int) $item['rating'];
	$out = '<div class="shapeblock-rating" aria-label="Rating: ' . esc_attr( $r ) . ' out of 5">';
	for ( $i = 1; $i <= 5; $i++ ) {
		$out .= '<span class="star' . ( $i <= $r ? ' filled' : '' ) . '">' . ( $i <= $r ? '★' : '☆' ) . '</span>';
	}
	return $out . '</div>';
};
$render_name = function ( $item ) {
	if ( empty( $item['name'] ) ) return '';
	return '<div class="shapeblock-name">' . esc_html( $item['name'] ) . '</div>';
};
$render_desig = function ( $item ) {
	return ! empty( $item['designation'] ) ? '<em class="shapeblock-designation">' . esc_html( $item['designation'] ) . '</em>' : '';
};
$render_desc = function ( $item ) {
	return ! empty( $item['description'] ) ? '<div class="shapeblock-description">' . esc_html( $item['description'] ) . '</div>' : '';
};
$render_quote = function ( $item ) use ( $icon_i, $svg_quote ) {
	if ( empty( $item['quoteIcon'] ) || 'none' === $item['quoteIcon'] ) return '';
	return '<div class="shapeblock-quote" aria-hidden="true">' . $icon_i( $item['quoteIcon'], $svg_quote ) . '</div>';
};

/** Render one testimonial's inner-wrap for the active skin. */
$render_inner = function ( $item ) use ( $skin, $render_picture, $render_logo, $render_rating, $render_name, $render_desig, $render_desc, $render_quote ) {
	$picture = $render_picture( $item );
	$logo = $render_logo( $item );
	$rating = $render_rating( $item );
	$desc = $render_desc( $item );
	$quote = $render_quote( $item );
	$name = $render_name( $item );
	$desig = $render_desig( $item );

	if ( 'skin3' === $skin ) {
		return '<div class="shapeblock-tstml-inner skin3">' . $logo . $desc
			. '<div class="shapeblock-author-wrap">' . $picture . '<div class="shapeblock-author">' . $name . $desig . '</div>' . $rating . '</div></div>';
	}
	if ( 'skin6' === $skin ) {
		return '<div class="shapeblock-tstml-inner skin6">' . $logo . $rating . $desc
			. '<div class="shapeblock-author-wrap">' . $picture . '<div class="shapeblock-author">' . $name . $desig . '</div></div></div>';
	}
	// default
	return '<div class="shapeblock-tstml-inner">'
		. '<div class="shapeblock-author-wrap">' . $picture . '<div class="shapeblock-author">' . $name . $desig . $rating . '</div></div>'
		. $desc . $quote . '</div>';
};
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-grid-wrap">
		<?php
		foreach ( $items as $item ) :
			?>
			<div class="shapeblock-grid-item shapeblock-testimonials--<?php echo esc_attr( $skin ); ?>">
				<div class="shapeblock-testimonial-item">
					<?php echo $render_inner( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Assembled from escaped parts. ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>
