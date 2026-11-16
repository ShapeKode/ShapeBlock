<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Paragraph block: one <p>, styled from the
 * block's settings through the page stylesheet (no style attribute).
 */

$H = '\ShapeBlock\Frontend\Helper';

$text_raw = isset( $attributes['content'] ) ? (string) $attributes['content'] : '';
if ( '' === trim( wp_strip_all_tags( $text_raw ) ) ) {
	return;
}

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-paragraph-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

// Highlight: {{text}} -> <span>text</span> (the editor's Highlight button stores the span itself).
$text = preg_replace_callback( '/\{\{(.*?)\}\}/', function ( $m ) {
	return '<span>' . trim( $m[1] ) . '</span>';
}, $text_raw );

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

// The paragraph, per device.
$text_css = [ 'desktop' => $typo( $attributes['typography'] ?? [] ) ];
if ( ! empty( $attributes['align'] ) && in_array( $attributes['align'], [ 'left', 'center', 'right', 'justify' ], true ) ) {
	$text_css['desktop']['text-align'] = $attributes['align'];
}
if ( ! empty( $attributes['textColor'] ) ) {
	$text_css['desktop']['color'] = $attributes['textColor'];
}
$text_css['tablet'] = $typo( $attributes['typographyTablet'] ?? [] );
$text_css['mobile'] = $typo( $attributes['typographyMobile'] ?? [] );

// Highlighted words, per device.
$hl = $typo( $attributes['highlightTypography'] ?? [] );
if ( ! empty( $attributes['highlightColor'] ) ) $hl['color'] = $attributes['highlightColor'];
if ( ! empty( $attributes['highlightBgGradient'] ) ) {
	$hl['background'] = $attributes['highlightBgGradient'];
} elseif ( ! empty( $attributes['highlightBgColor'] ) ) {
	$hl['background'] = $attributes['highlightBgColor'];
}
$hl_css = [
	'desktop' => array_merge( $hl, $dims( $attributes['highlightPadding'] ?? [], 'padding' ), $dims( $attributes['highlightMargin'] ?? [], 'margin' ), $dims( $attributes['highlightBorderRadius'] ?? [], 'radius' ) ),
];
foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device ) {
	$hl_css[ $device ] = array_merge(
		$typo( $attributes[ 'highlightTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'highlightPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'highlightMargin' . $suffix ] ?? [], 'margin' )
	);
}

// As strong as the Heading block's own selector, so page CSS that styled a
// Heading's text keeps the same weight against the block's settings.
$selector     = '.shapeblock-block.shapeblock-paragraph.' . $unique_id . '.' . $unique_id;
$style_handle = 'shapeblock-paragraph-style';
wp_enqueue_style( $style_handle );
// Links in the text.
$link_css  = ! empty( $attributes['linkColor'] ) ? $H::generate_responsive_css( $selector . ' a', [ 'desktop' => [ 'color' => $attributes['linkColor'] ] ] ) : '';
$link_css .= ! empty( $attributes['linkColorHover'] ) ? $H::generate_responsive_css( $selector . ' a:hover', [ 'desktop' => [ 'color' => $attributes['linkColorHover'] ] ] ) : '';
$H::add_css( $style_handle, $H::generate_responsive_css( $selector, $text_css ) . $H::generate_responsive_css( $selector . ' span', $hl_css ) . $link_css );

$wrap = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-paragraph ' . $unique_id ) );
if ( empty( $wrap ) ) {
	$wrap = 'class="shapeblock-block shapeblock-paragraph ' . esc_attr( $unique_id ) . '"';
}
?>
<p <?php echo wp_kses_post( $wrap ); ?>><?php echo wp_kses( $text, $H::inline_allowed_html() ); ?></p>
<?php } )( $attributes, $content, $block );
