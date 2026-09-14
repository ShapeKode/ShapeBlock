<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Image Carousel block.
 *
 * Several images are shown at once and scroll horizontally; the per-instance
 * CSS below is scoped to this block's unique class so two carousels on one page
 * never affect each other.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-image-carousel-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$carousel_images = isset( $attributes['images'] ) && is_array( $attributes['images'] ) ? $attributes['images'] : array();

// An item whose image has not been chosen yet shows the plugin's placeholder
// rather than collapsing, so a carousel that was just dragged in already looks
// like a carousel and each item can be seen and filled in. Matches how
// team-grid and testimonials-grid handle a missing image.
$placeholder = SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png';

$is_marquee = ! empty( $attributes['marquee'] );

$wrap_classes = 'shapeblock-block shapeblock-image-carousel-block-wrap ' . $unique_id;
if ( $is_marquee ) {
	$wrap_classes .= ' is-marquee';
}

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => $wrap_classes ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( $wrap_classes ) . '"';
}

// Only an emptied repeater has nothing to show; an item awaiting its image
// still renders, as a placeholder.
if ( empty( $carousel_images ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add at least one image.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-image-carousel-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-image-carousel-style';

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
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Image box.
$slide = array_merge(
	$dims( $attributes['slideRadius'] ?? [], 'radius' ),
	$dims( $attributes['slidePadding'] ?? [], 'padding' ),
	$H::border_to_css_props( $attributes['slideBorder'] ?? [] )
);
if ( '' !== $u( 'slideHeight' ) ) $slide['height'] = $u( 'slideHeight' );
if ( ! empty( $attributes['slideBg'] ) ) $slide['background-color'] = $attributes['slideBg'];

// Image fit is restricted to the values the control offers.
$fit_allowed = array( 'cover', 'contain', 'fill' );
$fit         = ( isset( $attributes['imageFit'] ) && in_array( $attributes['imageFit'], $fit_allowed, true ) ) ? $attributes['imageFit'] : 'cover';
$image       = array( 'object-fit' => $fit );

// Several images are on screen at once, so the registered size is served rather
// than the full upload. The stored URL is the fallback for an image that is not
// in the media library, or whose attachment has since been deleted.
$image_size = ( isset( $attributes['imageSize'] ) && '' !== $attributes['imageSize'] ) ? $attributes['imageSize'] : 'thumbnail';
if ( ! in_array( $image_size, get_intermediate_image_sizes(), true ) && 'full' !== $image_size ) {
	$image_size = 'thumbnail';
}
$sized_url = function ( $img ) use ( $image_size, $placeholder ) {
	if ( ! empty( $img['id'] ) ) {
		$url = wp_get_attachment_image_url( (int) $img['id'], $image_size );
		if ( $url ) {
			return $url;
		}
	}
	return ! empty( $img['url'] ) ? $img['url'] : $placeholder;
};

// Overlay: a gradient wins over a flat colour, matching the other blocks.
$overlay = [];
if ( ! empty( $attributes['overlayGradient'] ) ) {
	$overlay['background'] = $attributes['overlayGradient'];
} elseif ( ! empty( $attributes['overlayColor'] ) ) {
	$overlay['background'] = $attributes['overlayColor'];
}

// Emphasis for the active image. Both settings shrink or fade the *inactive*
// slides rather than growing the active one — a scaled-up slide would be
// clipped by the carousel's own overflow. Both are optional, so an untouched
// carousel keeps every image at its natural size and full opacity.
$slide_inactive = [];
if ( isset( $attributes['inactiveScale'] ) && '' !== $attributes['inactiveScale'] ) {
	$scale = min( 100, max( 1, (float) $attributes['inactiveScale'] ) ) / 100;
	$slide_inactive['transform'] = 'scale(' . round( $scale, 4 ) . ')';
}
if ( isset( $attributes['inactiveOpacity'] ) && '' !== $attributes['inactiveOpacity'] ) {
	$opacity = min( 100, max( 0, (float) $attributes['inactiveOpacity'] ) ) / 100;
	$slide_inactive['opacity'] = (string) round( $opacity, 3 );
}

$arrow = $dims( $attributes['arrowRadius'] ?? [], 'radius' );
if ( ! empty( $attributes['arrowColor'] ) ) $arrow['color'] = $attributes['arrowColor'];
if ( ! empty( $attributes['arrowBgColor'] ) ) $arrow['background-color'] = $attributes['arrowBgColor'];
if ( '' !== $u( 'arrowSize' ) ) { $arrow['width'] = $u( 'arrowSize' ); $arrow['height'] = $u( 'arrowSize' ); }

$dot = [];
if ( ! empty( $attributes['dotColor'] ) ) $dot['background'] = $attributes['dotColor'];
if ( '' !== $u( 'dotSize' ) ) { $dot['width'] = $u( 'dotSize' ); $dot['height'] = $u( 'dotSize' ); }
$dot_active = ! empty( $attributes['dotActiveColor'] ) ? [ 'background' => $attributes['dotActiveColor'] ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $H, $dims ) {
	$uu = function ( $key ) use ( $attributes, $H ) {
		return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	};

	$slide = $dims( $attributes[ 'slidePadding' . $suffix ] ?? [], 'padding' );
	if ( '' !== $uu( 'slideHeight' . $suffix ) ) {
		$slide['height'] = $uu( 'slideHeight' . $suffix );
	}

	$arrow = [];
	if ( '' !== $uu( 'arrowSize' . $suffix ) ) { $arrow['width'] = $uu( 'arrowSize' . $suffix ); $arrow['height'] = $uu( 'arrowSize' . $suffix ); }

	return [
		'.shapeblock-image-carousel-slide' => $slide,
		'.shapeblock-image-carousel-arrow' => $arrow,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( array_keys( $dev_data['Tablet'] ) as $sub_sel ) {
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

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-image-carousel-slide'   => $H::get_inline_styles( $slide ),
	'.shapeblock-image-carousel-image'   => $H::get_inline_styles( $image ),
	'.shapeblock-image-carousel-overlay' => $H::get_inline_styles( $overlay ),
	'.swiper-slide:not(.swiper-slide-active) .shapeblock-image-carousel-slide' => $H::get_inline_styles( $slide_inactive ),
	'.shapeblock-image-carousel-arrow'   => $H::get_inline_styles( $arrow ),
	'.swiper-pagination-bullet'          => $H::get_inline_styles( $dot ),
	'.swiper-pagination-bullet-active'   => $H::get_inline_styles( $dot_active ),
] );

// ---------------------------------------------------------------------------
// Swiper options travel as one data attribute so view.js needs no inline JS.
// ---------------------------------------------------------------------------
$int = function ( $key, $fallback ) use ( $attributes ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? (int) $attributes[ $key ] : $fallback;
};
$per_view = function ( $key, $fallback ) use ( $attributes ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? max( 1, (int) $attributes[ $key ] ) : $fallback;
};

// Continuous scroll is autoplay with no pause between slides; the linear
// timing function that completes the effect lives in style.scss.
$autoplay_on = $is_marquee || ! empty( $attributes['autoplay'] );

$options = array(
	'slidesPerView'  => $per_view( 'slidesPerViewMobile', $per_view( 'slidesPerView', 1 ) ),
	'spaceBetween'   => $int( 'spaceBetweenMobile', $int( 'spaceBetween', 20 ) ),
	'speed'          => $is_marquee ? max( 1, $int( 'marqueeSpeed', 4000 ) ) : max( 0, $int( 'speed', 600 ) ),
	'loop'           => ! empty( $attributes['loop'] ),
	'centeredSlides' => ! empty( $attributes['centeredSlides'] ),
	'marquee'        => $is_marquee,
	'autoplay'       => $autoplay_on
		? array(
			'delay'                => $is_marquee ? 0 : max( 0, $int( 'autoplayDelay', 3000 ) ),
			'pauseOnMouseEnter'    => ! empty( $attributes['pauseOnHover'] ),
			'disableOnInteraction' => false,
		)
		: false,
	'arrows'         => ! empty( $attributes['showArrows'] ),
	'dots'           => ! empty( $attributes['showDots'] ),
	// Swiper reads breakpoints min-width first, so tablet/mobile values are
	// applied by listing the desktop value at the widest breakpoint.
	'breakpoints'    => array(
		768  => array(
			'slidesPerView' => $per_view( 'slidesPerViewTablet', $per_view( 'slidesPerView', 1 ) ),
			'spaceBetween'  => $int( 'spaceBetweenTablet', $int( 'spaceBetween', 20 ) ),
		),
		1025 => array(
			'slidesPerView' => $per_view( 'slidesPerView', 1 ),
			'spaceBetween'  => $int( 'spaceBetween', 20 ),
		),
	),
);

$arrow_prev = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z"/></svg>';
$arrow_next = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4 4.6-4.6z"/></svg>';
$svg_allowed = array(
	'svg'  => array( 'viewbox' => true, 'aria-hidden' => true, 'xmlns' => true ),
	'path' => array( 'fill' => true, 'd' => true ),
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-image-carousel swiper" data-shapeblock-image-carousel="<?php echo esc_attr( wp_json_encode( $options ) ); ?>">
		<div class="swiper-wrapper">
			<?php
			foreach ( $carousel_images as $carousel_item ) :
				$carousel_image = isset( $carousel_item['image'] ) && is_array( $carousel_item['image'] ) ? $carousel_item['image'] : array();
				$is_placeholder = empty( $carousel_image['url'] ) && empty( $carousel_image['id'] );
				?>
				<div class="swiper-slide">
					<div class="shapeblock-image-carousel-slide<?php echo $is_placeholder ? ' is-placeholder' : ''; ?>">
						<img class="shapeblock-image-carousel-image"
							src="<?php echo esc_url( $sized_url( $carousel_image ) ); ?>"
							alt="<?php echo $is_placeholder ? esc_attr__( 'Placeholder image', 'shapeblock' ) : esc_attr( $carousel_image['alt'] ?? '' ); ?>" />
						<?php if ( ! empty( $overlay ) ) : ?>
							<span class="shapeblock-image-carousel-overlay" aria-hidden="true"></span>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php if ( ! empty( $attributes['showDots'] ) ) : ?>
			<div class="swiper-pagination"></div>
		<?php endif; ?>
	</div>

	<?php if ( ! empty( $attributes['showArrows'] ) ) : ?>
		<button class="shapeblock-image-carousel-arrow shapeblock-image-carousel-prev" type="button" aria-label="<?php esc_attr_e( 'Previous image', 'shapeblock' ); ?>">
			<?php echo wp_kses( $arrow_prev, $svg_allowed ); ?>
		</button>
		<button class="shapeblock-image-carousel-arrow shapeblock-image-carousel-next" type="button" aria-label="<?php esc_attr_e( 'Next image', 'shapeblock' ); ?>">
			<?php echo wp_kses( $arrow_next, $svg_allowed ); ?>
		</button>
	<?php endif; ?>
</div>
