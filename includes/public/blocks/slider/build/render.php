<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Slider block.
 *
 * Markup is a Swiper container; the per-instance CSS below is scoped to this
 * block's unique class so two sliders on one page never affect each other.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-slider-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$slides = isset( $attributes['slides'] ) && is_array( $attributes['slides'] ) ? $attributes['slides'] : array();

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-slider-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-slider-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( empty( $slides ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add at least one slide.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-slider-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-slider-style';

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

// Slide box.
$slide = $dims( $attributes['slideRadius'] ?? [], 'radius' );
if ( '' !== $u( 'slideHeight' ) ) $slide['height'] = $u( 'slideHeight' );

// Overlay: a gradient wins over a flat colour, matching the other blocks.
$overlay = [];
if ( ! empty( $attributes['overlayGradient'] ) ) {
	$overlay['background'] = $attributes['overlayGradient'];
} elseif ( ! empty( $attributes['overlayColor'] ) ) {
	$overlay['background'] = $attributes['overlayColor'];
}

// Content box.
$content = $dims( $attributes['contentPadding'] ?? [], 'padding' );
if ( ! empty( $attributes['contentAlign'] ) ) $content['text-align'] = $attributes['contentAlign'];
if ( '' !== $u( 'contentWidth' ) ) $content['max-width'] = $u( 'contentWidth' );

$title = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title['color'] = $attributes['titleColor'];
$title = array_merge( $title, $dims( $attributes['titleMargin'] ?? [], 'margin' ) );

$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $attributes['descColor'];
$desc = array_merge( $desc, $dims( $attributes['descMargin'] ?? [], 'margin' ) );

$button = $typo( $attributes['buttonTypography'] ?? [] );
if ( ! empty( $attributes['buttonColor'] ) ) $button['color'] = $attributes['buttonColor'];
if ( ! empty( $attributes['buttonBgColor'] ) ) $button['background-color'] = $attributes['buttonBgColor'];
$button = array_merge( $button, $dims( $attributes['buttonPadding'] ?? [], 'padding' ), $dims( $attributes['buttonRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['buttonBorder'] ) ) $button = array_merge( $button, $H::border_to_css_props( $attributes['buttonBorder'] ) );

$button_hover = [];
if ( ! empty( $attributes['buttonHoverColor'] ) ) $button_hover['color'] = $attributes['buttonHoverColor'];
if ( ! empty( $attributes['buttonHoverBgColor'] ) ) $button_hover['background-color'] = $attributes['buttonHoverBgColor'];

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
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	$uu = function ( $key ) use ( $attributes, $H ) {
		return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	};

	$slide = ( '' !== $uu( 'slideHeight' . $suffix ) ) ? [ 'height' => $uu( 'slideHeight' . $suffix ) ] : [];

	$content = $dims( $attributes[ 'contentPadding' . $suffix ] ?? [], 'padding' );
	if ( ! empty( $attributes[ 'contentAlign' . $suffix ] ) ) $content['text-align'] = $attributes[ 'contentAlign' . $suffix ];
	if ( '' !== $uu( 'contentWidth' . $suffix ) ) $content['max-width'] = $uu( 'contentWidth' . $suffix );

	$title = array_merge(
		$typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'titleMargin' . $suffix ] ?? [], 'margin' )
	);
	$desc = array_merge(
		$typo( $attributes[ 'descTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'descMargin' . $suffix ] ?? [], 'margin' )
	);
	$button = array_merge(
		$typo( $attributes[ 'buttonTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'buttonPadding' . $suffix ] ?? [], 'padding' )
	);

	$arrow = [];
	if ( '' !== $uu( 'arrowSize' . $suffix ) ) { $arrow['width'] = $uu( 'arrowSize' . $suffix ); $arrow['height'] = $uu( 'arrowSize' . $suffix ); }

	return [
		'.shapeblock-slider-slide'   => $slide,
		'.shapeblock-slider-content' => $content,
		'.shapeblock-slider-title'   => $title,
		'.shapeblock-slider-text'    => $desc,
		'.shapeblock-slider-btn'     => $button,
		'.shapeblock-slider-arrow'   => $arrow,
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
	'.shapeblock-slider-slide'          => $H::get_inline_styles( $slide ),
	'.shapeblock-slider-overlay'        => $H::get_inline_styles( $overlay ),
	'.shapeblock-slider-content'        => $H::get_inline_styles( $content ),
	'.shapeblock-slider-title'          => $H::get_inline_styles( $title ),
	'.shapeblock-slider-text'           => $H::get_inline_styles( $desc ),
	'.shapeblock-slider-btn'            => $H::get_inline_styles( $button ),
	'.shapeblock-slider-btn:hover'      => $H::get_inline_styles( $button_hover ),
	'.shapeblock-slider-arrow'          => $H::get_inline_styles( $arrow ),
	'.swiper-pagination-bullet'         => $H::get_inline_styles( $dot ),
	'.swiper-pagination-bullet-active'  => $H::get_inline_styles( $dot_active ),
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
	'slidesPerView'  => $per_view( 'slidesPerViewMobile', $per_view( 'slidesPerView', 1 ) ),
	'spaceBetween'   => $int( 'spaceBetweenMobile', $int( 'spaceBetween', 24 ) ),
	'speed'          => max( 0, $int( 'speed', 600 ) ),
	'loop'           => ! empty( $attributes['loop'] ),
	'autoplay'       => ! empty( $attributes['autoplay'] )
		? array(
			'delay'                => max( 0, $int( 'autoplayDelay', 4000 ) ),
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
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-slider swiper" data-shapeblock-slider="<?php echo esc_attr( wp_json_encode( $options ) ); ?>">
		<div class="swiper-wrapper">
			<?php foreach ( $slides as $slide_item ) : ?>
				<div class="swiper-slide">
					<div class="shapeblock-slider-slide">
						<?php if ( ! empty( $slide_item['image']['url'] ) ) : ?>
							<img class="shapeblock-slider-image"
								src="<?php echo esc_url( $slide_item['image']['url'] ); ?>"
								alt="<?php echo esc_attr( $slide_item['image']['alt'] ?? '' ); ?>" />
						<?php endif; ?>

						<span class="shapeblock-slider-overlay" aria-hidden="true"></span>

						<div class="shapeblock-slider-content">
							<?php if ( ! empty( $slide_item['title'] ) ) : ?>
								<h3 class="shapeblock-slider-title"><?php echo esc_html( $slide_item['title'] ); ?></h3>
							<?php endif; ?>

							<?php if ( ! empty( $slide_item['description'] ) ) : ?>
								<p class="shapeblock-slider-text"><?php echo esc_html( $slide_item['description'] ); ?></p>
							<?php endif; ?>

							<?php if ( ! empty( $slide_item['buttonText'] ) ) : ?>
								<a class="shapeblock-slider-btn"
									href="<?php echo esc_url( ! empty( $slide_item['buttonUrl'] ) ? $slide_item['buttonUrl'] : '#' ); ?>"
									<?php if ( ! empty( $slide_item['buttonNewTab'] ) ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>>
									<?php echo esc_html( $slide_item['buttonText'] ); ?>
								</a>
							<?php endif; ?>
						</div>
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
			<?php echo wp_kses( $arrow_prev, array( 'svg' => array( 'viewbox' => true, 'aria-hidden' => true, 'xmlns' => true ), 'path' => array( 'fill' => true, 'd' => true ) ) ); ?>
		</button>
		<button class="shapeblock-slider-arrow shapeblock-slider-next" type="button" aria-label="<?php esc_attr_e( 'Next slide', 'shapeblock' ); ?>">
			<?php echo wp_kses( $arrow_next, array( 'svg' => array( 'viewbox' => true, 'aria-hidden' => true, 'xmlns' => true ), 'path' => array( 'fill' => true, 'd' => true ) ) ); ?>
		</button>
	<?php endif; ?>
</div>
