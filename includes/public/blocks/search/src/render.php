<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Search block.
 *
 * Mirrors the markup of the Elementor "Search" widget
 * (easy-elements/widgets/search). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-search-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$style       = ( isset( $attributes['selectStyle'] ) && '2' === $attributes['selectStyle'] ) ? '2' : '1';
$placeholder = isset( $attributes['placeholder'] ) ? $attributes['placeholder'] : '';
$title       = isset( $attributes['searchTitle'] ) && '' !== $attributes['searchTitle'] ? $attributes['searchTitle'] : __( 'What are you looking for?', 'shapeblock' );
$open_icon   = isset( $attributes['openIcon'] ) ? $attributes['openIcon'] : '';
$close_icon  = isset( $attributes['closeIcon'] ) ? $attributes['closeIcon'] : '';
// Optional custom image / SVG for the icons (takes precedence over the icon-font glyph).
$open_icon_image  = ( isset( $attributes['openIconImage'] ) && is_array( $attributes['openIconImage'] ) ) ? $attributes['openIconImage'] : array();
$close_icon_image = ( isset( $attributes['closeIconImage'] ) && is_array( $attributes['closeIconImage'] ) ) ? $attributes['closeIconImage'] : array();

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-search-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-search-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-search-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-search-style';

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
	$map = 'padding' === $type
		? [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ]
		: [ 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' ];
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) $out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
	}
	return $out;
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Icons.
$icon_glyph = [];
if ( '' !== $u( 'iconSize' ) ) { $s = $u( 'iconSize' ); $icon_glyph['font-size'] = $s; $icon_glyph['width'] = $s; $icon_glyph['height'] = $s; }
$open_i  = $icon_glyph;
$open_svg = $icon_glyph;
if ( ! empty( $attributes['iconColor'] ) ) { $open_i['color'] = $attributes['iconColor']; $open_svg['fill'] = $attributes['iconColor']; }
$open_btn = ( '' !== $u( 'iconVerticalPosition' ) ) ? [ 'transform' => 'translateY(' . $u( 'iconVerticalPosition' ) . ')' ] : [];

// Style 2 submit icon position.
$submit2_pos = [];
$side = ( isset( $attributes['iconPositionSide'] ) && 'left' === $attributes['iconPositionSide'] ) ? 'left' : 'right';
if ( 'left' === $side ) {
	$submit2_pos['right'] = 'auto';
	$submit2_pos['left']  = ( '' !== $u( 'iconOffsetLeft' ) ) ? $u( 'iconOffsetLeft' ) : '15px';
} else {
	$submit2_pos['left'] = 'auto';
	if ( '' !== $u( 'iconOffsetRight' ) ) $submit2_pos['right'] = $u( 'iconOffsetRight' );
}

// Input field (shared).
$field = $typo( $attributes['inputTypography'] ?? [] );
if ( ! empty( $attributes['inputTextColor'] ) ) $field['color'] = $attributes['inputTextColor'];
if ( ! empty( $attributes['inputBgColor'] ) ) $field['background'] = $attributes['inputBgColor'];
$field = array_merge( $field, $dims( $attributes['inputPadding'] ?? [], 'padding' ) );
if ( '' !== $u( 'inputHeight' ) ) $field['height'] = $u( 'inputHeight' );
$field2 = [];
if ( '' !== $u( 'inputFieldWidth' ) ) $field2['width'] = $u( 'inputFieldWidth' );
$field2 = array_merge( $field2, $dims( $attributes['inputBorderRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['inputBorderColor'] ) ) $field2['border-color'] = $attributes['inputBorderColor'];
$placeholder_styles = ! empty( $attributes['placeholderColor'] ) ? [ 'color' => $attributes['placeholderColor'] ] : [];

// Submit button.
$submit1 = [];
if ( ! empty( $attributes['submitIconColor'] ) ) $submit1['color'] = $attributes['submitIconColor'];
if ( ! empty( $attributes['submitBtnBg'] ) ) $submit1['background-color'] = $attributes['submitBtnBg'];
$submit1 = array_merge( $submit1, $dims( $attributes['submitPadding'] ?? [], 'padding' ) );
$submit1_svg = ! empty( $attributes['submitIconColor'] ) ? [ 'fill' => $attributes['submitIconColor'] ] : [];
$submit1_hover = [];
if ( ! empty( $attributes['submitIconHoverColor'] ) ) $submit1_hover['color'] = $attributes['submitIconHoverColor'];
if ( ! empty( $attributes['submitBtnHoverBg'] ) ) $submit1_hover['background-color'] = $attributes['submitBtnHoverBg'];
$submit2 = $submit2_pos;
if ( ! empty( $attributes['submitBtnBg'] ) ) $submit2['background-color'] = $attributes['submitBtnBg'];
$submit2 = array_merge( $submit2, $dims( $attributes['submitPadding'] ?? [], 'padding' ) );

// Popup.
$overlay = ! empty( $attributes['overlayBg'] ) ? [ 'background' => $attributes['overlayBg'] ] : [];
$popup_title = $typo( $attributes['popupTitleTypography'] ?? [] );
if ( ! empty( $attributes['popupTitleColor'] ) ) $popup_title['color'] = $attributes['popupTitleColor'];
$close_styles = [];
if ( ! empty( $attributes['closeIconColor'] ) ) $close_styles['color'] = $attributes['closeIconColor'];
$close_svg = ! empty( $attributes['closeIconColor'] ) ? [ 'fill' => $attributes['closeIconColor'] ] : [];
$close_glyph = ( '' !== $u( 'closeIconSize' ) ) ? [ 'font-size' => $u( 'closeIconSize' ), 'width' => $u( 'closeIconSize' ), 'height' => $u( 'closeIconSize' ) ] : [];

// Custom-image icon sizing. SVGs have no intrinsic size, so always emit a size
// (the configured icon size, falling back to 1em of the button) plus object-fit
// so the uploaded image displays at the chosen icon size.
$open_img_size  = [ 'width' => ( '' !== $u( 'iconSize' ) ) ? $u( 'iconSize' ) : '1em', 'height' => ( '' !== $u( 'iconSize' ) ) ? $u( 'iconSize' ) : '1em', 'object-fit' => 'contain', 'display' => 'block' ];
$close_img_size = [ 'width' => ( '' !== $u( 'closeIconSize' ) ) ? $u( 'closeIconSize' ) : '1em', 'height' => ( '' !== $u( 'closeIconSize' ) ) ? $u( 'closeIconSize' ) : '1em', 'object-fit' => 'contain', 'display' => 'block' ];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $u ) {
	// Input field: typography + padding + height.
	$field = $typo( $attributes[ 'inputTypography' . $suffix ] ?? [] );
	$field = array_merge( $field, $dims( $attributes[ 'inputPadding' . $suffix ] ?? [], 'padding' ) );
	if ( '' !== $u( 'inputHeight' . $suffix ) ) $field['height'] = $u( 'inputHeight' . $suffix );

	// Input field width (style 2).
	$field_w = ( '' !== $u( 'inputFieldWidth' . $suffix ) ) ? [ 'width' => $u( 'inputFieldWidth' . $suffix ) ] : [];

	// Search icon glyph size.
	$glyph = [];
	if ( '' !== $u( 'iconSize' . $suffix ) ) { $s = $u( 'iconSize' . $suffix ); $glyph['font-size'] = $s; $glyph['width'] = $s; $glyph['height'] = $s; }

	// Submit button padding.
	$submit_pad = $dims( $attributes[ 'submitPadding' . $suffix ] ?? [], 'padding' );

	// Popup title typography.
	$title = $typo( $attributes[ 'popupTitleTypography' . $suffix ] ?? [] );

	// Close icon glyph size.
	$close_glyph = [];
	if ( '' !== $u( 'closeIconSize' . $suffix ) ) { $c = $u( 'closeIconSize' . $suffix ); $close_glyph['font-size'] = $c; $close_glyph['width'] = $c; $close_glyph['height'] = $c; }

	// Custom-image icon size (width / height only — object-fit is set on desktop).
	$open_img  = ( '' !== $u( 'iconSize' . $suffix ) ) ? [ 'width' => $u( 'iconSize' . $suffix ), 'height' => $u( 'iconSize' . $suffix ) ] : [];
	$close_img = ( '' !== $u( 'closeIconSize' . $suffix ) ) ? [ 'width' => $u( 'closeIconSize' . $suffix ), 'height' => $u( 'closeIconSize' . $suffix ) ] : [];

	return [
		'.shapeblock-search-field'                            => $field,
		'.shapeblock-search-style-2 .shapeblock-search-field'      => $field_w,
		'.shapeblock-search-open-btn i'                       => $glyph,
		'.shapeblock-search-submit-btn i'                     => $glyph,
		'.shapeblock-search-open-btn svg'                     => $glyph,
		'.shapeblock-search-submit-btn svg'                   => $glyph,
		'.shapeblock-search-open-btn .shapeblock-search-open-icon-img'   => $open_img,
		'.shapeblock-search-submit-btn .shapeblock-search-open-icon-img' => $open_img,
		'.shapeblock-search-content .shapeblock-search-submit'     => $submit_pad,
		'.shapeblock-search-style-2 .shapeblock-search-submit-btn' => $submit_pad,
		'.shapeblock-search-title'                            => $title,
		'.shapeblock-search-close-btn i'                      => $close_glyph,
		'.shapeblock-search-close-btn svg'                    => $close_glyph,
		'.shapeblock-search-close-btn .shapeblock-search-close-icon-img' => $close_img,
	];
};
$dev_data  = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css  = '';
$resp_subs = [
	'.shapeblock-search-field',
	'.shapeblock-search-style-2 .shapeblock-search-field',
	'.shapeblock-search-open-btn i',
	'.shapeblock-search-submit-btn i',
	'.shapeblock-search-open-btn svg',
	'.shapeblock-search-submit-btn svg',
	'.shapeblock-search-open-btn .shapeblock-search-open-icon-img',
	'.shapeblock-search-submit-btn .shapeblock-search-open-icon-img',
	'.shapeblock-search-content .shapeblock-search-submit',
	'.shapeblock-search-style-2 .shapeblock-search-submit-btn',
	'.shapeblock-search-title',
	'.shapeblock-search-close-btn i',
	'.shapeblock-search-close-btn svg',
	'.shapeblock-search-close-btn .shapeblock-search-close-icon-img',
];
foreach ( $resp_subs as $sub_sel ) {
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
	'.shapeblock-search-open-btn'                            => $H::get_inline_styles( $open_btn ),
	'.shapeblock-search-open-btn i, ' . $selector . ' .shapeblock-search-submit-btn i' => $H::get_inline_styles( $open_i ),
	'.shapeblock-search-open-btn svg, ' . $selector . ' .shapeblock-search-submit-btn svg' => $H::get_inline_styles( $open_svg ),
	'.shapeblock-search-open-btn .shapeblock-search-open-icon-img, ' . $selector . ' .shapeblock-search-submit-btn .shapeblock-search-open-icon-img' => $H::get_inline_styles( $open_img_size ),
	'.shapeblock-search-field'                               => $H::get_inline_styles( $field ),
	'.shapeblock-search-style-2 .shapeblock-search-field'         => $H::get_inline_styles( $field2 ),
	'.shapeblock-search-field::placeholder'                  => $H::get_inline_styles( $placeholder_styles ),
	'.shapeblock-search-style-2 .shapeblock-search-field:focus'   => ! empty( $attributes['inputFocusBorderColor'] ) ? 'border-color:' . $attributes['inputFocusBorderColor'] : '',
	'.shapeblock-search-content .shapeblock-search-submit'        => $H::get_inline_styles( $submit1 ),
	'.shapeblock-search-content .shapeblock-search-submit svg'    => $H::get_inline_styles( $submit1_svg ),
	'.shapeblock-search-content .shapeblock-search-submit:hover'  => $H::get_inline_styles( $submit1_hover ),
	'.shapeblock-search-style-2 .shapeblock-search-submit-btn'    => $H::get_inline_styles( $submit2 ),
	'.shapeblock-search-lightbox, ' . $selector . ' .shapeblock-search-overlay' => $H::get_inline_styles( $overlay ),
	'.shapeblock-search-title'                               => $H::get_inline_styles( $popup_title ),
	'.shapeblock-search-close-btn i'                         => $H::get_inline_styles( array_merge( $close_styles, $close_glyph ) ),
	'.shapeblock-search-close-btn svg'                       => $H::get_inline_styles( array_merge( $close_svg, $close_glyph ) ),
	'.shapeblock-search-close-btn .shapeblock-search-close-icon-img' => $H::get_inline_styles( $close_img_size ),
] );

// Icons / fallbacks.
$svg_search = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21zM5 10.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"></path></svg>';
$svg_close  = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>';
/**
 * Output an icon: a custom uploaded image (SVG / PNG) takes precedence, then the
 * icon-font glyph, then the built-in SVG fallback. Keeps existing (font-glyph and
 * fallback) blocks rendering identically.
 */
$render_icon = function ( $val, $fallback, $image = array(), $img_class = '' ) {
	if ( ! empty( $image ) && ! empty( $image['url'] ) ) {
		$alt = ! empty( $image['alt'] ) ? $image['alt'] : '';
		return '<img src="' . esc_url( $image['url'] ) . '" alt="' . esc_attr( $alt ) . '" class="' . esc_attr( $img_class ) . '" />';
	}
	return ( ! empty( $val ) && 'none' !== $val ) ? '<i class="shapeblock-icon ' . esc_attr( $val ) . '" aria-hidden="true"></i>' : $fallback;
};
$action = esc_url( home_url( '/' ) );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<?php if ( '2' === $style ) : ?>
		<div class="shapeblock-search shapeblock-search-style-2">
			<form role="search" method="get" class="shapeblock-search-form" action="<?php echo $action; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
				<input type="search" class="shapeblock-search-field" placeholder="<?php echo esc_attr( $placeholder ); ?>" value="" name="s" />
				<button type="submit" class="shapeblock-search-submit-btn" aria-label="<?php esc_attr_e( 'Submit Search', 'shapeblock' ); ?>">
					<?php echo $render_icon( $open_icon, $svg_search, $open_icon_image, 'shapeblock-search-open-icon-img' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</button>
			</form>
		</div>
	<?php else : ?>
		<div class="shapeblock-search shapeblock-search-style-1">
			<a href="#" role="button" class="shapeblock-search-open-btn" aria-label="<?php esc_attr_e( 'Open Search', 'shapeblock' ); ?>">
				<?php echo $render_icon( $open_icon, $svg_search, $open_icon_image, 'shapeblock-search-open-icon-img' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<div class="shapeblock-search-lightbox">
				<div class="shapeblock-search-overlay">
					<a href="#" role="button" class="shapeblock-search-close-btn" aria-label="<?php esc_attr_e( 'Close Search', 'shapeblock' ); ?>">
						<?php echo $render_icon( $close_icon, $svg_close, $close_icon_image, 'shapeblock-search-close-icon-img' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</a>
				</div>
				<div class="shapeblock-search-content">
					<div class="shapeblock-search-title"><?php echo esc_html( $title ); ?></div>
					<form role="search" method="get" class="shapeblock-search-form" action="<?php echo $action; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
						<input type="search" class="shapeblock-search-field" placeholder="<?php echo esc_attr( $placeholder ); ?>" value="" name="s" />
						<button type="submit" class="shapeblock-search-submit" aria-label="<?php esc_attr_e( 'Submit Search', 'shapeblock' ); ?>">
							<?php echo $svg_search; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</button>
					</form>
				</div>
			</div>
		</div>
	<?php endif; ?>
</div>
