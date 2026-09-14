<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Slider block.
 *
 * Markup is a Swiper container of images; the per-instance CSS below is scoped
 * to this block's unique class so two sliders on one page never affect each
 * other.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-slider-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$slides = isset( $attributes['slides'] ) && is_array( $attributes['slides'] ) ? $attributes['slides'] : array();

// A slide whose image has not been chosen yet shows the plugin's placeholder
// rather than collapsing, so a slider that was just dragged in already looks
// like a slider and each slide can be seen and filled in. Matches how
// team-grid and testimonials-grid handle a missing image.
$placeholder = SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-slider-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-slider-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// Only an emptied repeater has nothing to show; a slide awaiting its image
// still renders, as a placeholder.
if ( empty( $slides ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add at least one image.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-slider-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-slider-style';

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

// Slide box.
$slide = $dims( $attributes['slideRadius'] ?? [], 'radius' );
if ( '' !== $u( 'slideHeight' ) ) $slide['height'] = $u( 'slideHeight' );

// Image fit is restricted to the values the control offers.
$fit_allowed = array( 'cover', 'contain', 'fill' );
$fit         = ( isset( $attributes['imageFit'] ) && in_array( $attributes['imageFit'], $fit_allowed, true ) ) ? $attributes['imageFit'] : 'cover';
$image       = array( 'object-fit' => $fit );

// Overlay: a gradient wins over a flat colour, matching the other blocks.
$overlay = [];
if ( ! empty( $attributes['overlayGradient'] ) ) {
	$overlay['background'] = $attributes['overlayGradient'];
} elseif ( ! empty( $attributes['overlayColor'] ) ) {
	$overlay['background'] = $attributes['overlayColor'];
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
$build_dev = function ( $suffix ) use ( $attributes, $H ) {
	$uu = function ( $key ) use ( $attributes, $H ) {
		return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	};

	$slide = ( '' !== $uu( 'slideHeight' . $suffix ) ) ? [ 'height' => $uu( 'slideHeight' . $suffix ) ] : [];

	$arrow = [];
	if ( '' !== $uu( 'arrowSize' . $suffix ) ) { $arrow['width'] = $uu( 'arrowSize' . $suffix ); $arrow['height'] = $uu( 'arrowSize' . $suffix ); }

	return [
		'.shapeblock-slider-slide' => $slide,
		'.shapeblock-slider-arrow' => $arrow,
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
	'.shapeblock-slider-slide'         => $H::get_inline_styles( $slide ),
	'.shapeblock-slider-image'         => $H::get_inline_styles( $image ),
	'.shapeblock-slider-overlay'       => $H::get_inline_styles( $overlay ),
	'.shapeblock-slider-arrow'         => $H::get_inline_styles( $arrow ),
	'.swiper-pagination-bullet'        => $H::get_inline_styles( $dot ),
	'.swiper-pagination-bullet-active' => $H::get_inline_styles( $dot_active ),
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

$options = array(
	'slidesPerView' => $per_view( 'slidesPerViewMobile', $per_view( 'slidesPerView', 1 ) ),
	'spaceBetween'  => $int( 'spaceBetweenMobile', $int( 'spaceBetween', 24 ) ),
	'speed'         => max( 0, $int( 'speed', 600 ) ),
	'loop'          => ! empty( $attributes['loop'] ),
	'autoplay'      => ! empty( $attributes['autoplay'] )
		? array(
			'delay'                => max( 0, $int( 'autoplayDelay', 4000 ) ),
			'pauseOnMouseEnter'    => ! empty( $attributes['pauseOnHover'] ),
			'disableOnInteraction' => false,
		)
		: false,
	'arrows'        => ! empty( $attributes['showArrows'] ),
	'dots'          => ! empty( $attributes['showDots'] ),
	// Swiper reads breakpoints min-width first, so tablet/mobile values are
	// applied by listing the desktop value at the widest breakpoint.
	'breakpoints'   => array(
		768  => array(
			'slidesPerView' => $per_view( 'slidesPerViewTablet', $per_view( 'slidesPerView', 1 ) ),
			'spaceBetween'  => $int( 'spaceBetweenTablet', $int( 'spaceBetween', 24 ) ),
		),
		1025 => array(
			'slidesPerView' => $per_view( 'slidesPerView', 1 ),
			'spaceBetween'  => $int( 'spaceBetween', 24 ),
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
	<div class="shapeblock-slider swiper" data-shapeblock-slider="<?php echo esc_attr( wp_json_encode( $options ) ); ?>">
		<div class="swiper-wrapper">
			<?php
			foreach ( $slides as $slide_item ) :
				$slide_image    = isset( $slide_item['image'] ) && is_array( $slide_item['image'] ) ? $slide_item['image'] : array();
				$is_placeholder = empty( $slide_image['url'] );
				?>
				<div class="swiper-slide">
					<div class="shapeblock-slider-slide<?php echo $is_placeholder ? ' is-placeholder' : ''; ?>">
						<img class="shapeblock-slider-image"
							src="<?php echo esc_url( $is_placeholder ? $placeholder : $slide_image['url'] ); ?>"
							alt="<?php echo $is_placeholder ? esc_attr__( 'Placeholder image', 'shapeblock' ) : esc_attr( $slide_image['alt'] ?? '' ); ?>" />
						<?php if ( ! empty( $overlay ) ) : ?>
							<span class="shapeblock-slider-overlay" aria-hidden="true"></span>
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
		<button class="shapeblock-slider-arrow shapeblock-slider-prev" type="button" aria-label="<?php esc_attr_e( 'Previous slide', 'shapeblock' ); ?>">
			<?php echo wp_kses( $arrow_prev, $svg_allowed ); ?>
		</button>
		<button class="shapeblock-slider-arrow shapeblock-slider-next" type="button" aria-label="<?php esc_attr_e( 'Next slide', 'shapeblock' ); ?>">
			<?php echo wp_kses( $arrow_next, $svg_allowed ); ?>
		</button>
	<?php endif; ?>
</div>
