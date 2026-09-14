<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Heading block.
 *
 * Mirrors the markup of the Elementor "Heading" widget
 * (easy-elements/widgets/heading) so the shared CSS applies on the front end.
 * Element classes use this plugin's "shapeblock-" prefix. Animation features that
 * required external JS in the Elementor widget are intentionally omitted.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-heading-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$allowed_tags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span' ];
$tag          = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed_tags, true ) ? $attributes['titleTag'] : 'h2';

$title_raw   = isset( $attributes['title'] ) ? $attributes['title'] : '';

$link        = isset( $attributes['linkUrl'] ) ? $attributes['linkUrl'] : '';
$target      = ! empty( $attributes['linkTarget'] ) ? ' target="_blank"' : '';
$nofollow    = ! empty( $attributes['linkNofollow'] ) ? ' rel="nofollow"' : '';

// Highlight: {{text}} -> <span>text</span>.
$title = preg_replace_callback( '/\{\{(.*?)\}\}/', function ( $m ) {
	return '<span>' . wp_kses_post( trim( $m[1] ) ) . '</span>';
}, $title_raw );
if ( '' !== $link ) {
	$title = '<a href="' . esc_url( $link ) . '"' . $target . $nofollow . '>' . $title . '</a>';
}

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-heading-block-wrap ' . $unique_id,
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-heading-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-heading-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-heading-style';

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
// Heading wrapper alignment.
$heading_styles = [];
if ( ! empty( $attributes['align'] ) ) $heading_styles['text-align'] = $attributes['align'];

// Title.
$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];
$title_styles = array_merge( $title_styles, $dims( $attributes['titleMargin'] ?? [], 'margin' ), $dims( $attributes['titlePadding'] ?? [], 'padding' ) );

// Highlight.
$hl = $typo( $attributes['highlightTypography'] ?? [] );
if ( ! empty( $attributes['highlightColor'] ) ) $hl['color'] = $attributes['highlightColor'];
if ( ! empty( $attributes['highlightBgGradient'] ) ) {
	$hl['background'] = $attributes['highlightBgGradient'];
} elseif ( ! empty( $attributes['highlightBgColor'] ) ) {
	$hl['background'] = $attributes['highlightBgColor'];
}
$hl = array_merge( $hl, $dims( $attributes['highlightPadding'] ?? [], 'padding' ), $dims( $attributes['highlightMargin'] ?? [], 'margin' ), $dims( $attributes['highlightBorderRadius'] ?? [], 'radius' ) );

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically. Only layout controls (typography,
// padding/margin and size sliders) are made responsive.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	// Title.
	$title = array_merge(
		$typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'titleMargin' . $suffix ] ?? [], 'margin' ),
		$dims( $attributes[ 'titlePadding' . $suffix ] ?? [], 'padding' )
	);

	// Highlight.
	$hl = array_merge(
		$typo( $attributes[ 'highlightTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'highlightPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'highlightMargin' . $suffix ] ?? [], 'margin' )
	);

	return [
		'title' => $title,
		'hl'    => $hl,
	];
};
// Full CSS selectors that mirror the desktop sub-selectors exactly, so the
// per-device overrides target the same elements.
$resp_sel_map = [
	'title' => $selector . ' .shapeblock-heading .shapeblock-title',
	'hl'    => $selector . ' .shapeblock-heading .shapeblock-title span',
];
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( $resp_sel_map as $key => $full_sel ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		if ( ! empty( $dev_data[ $suffix ][ $key ] ) ) {
			$rdata[ $device_key ] = $dev_data[ $suffix ][ $key ];
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $full_sel, $rdata );
	}
}

// Google fonts are loaded globally via the render_block filter (blocks.php),
// deduped by handle — no per-block enqueue needed here.

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-heading'                              => $H::get_inline_styles( $heading_styles ),
	'.shapeblock-heading .shapeblock-title'                 => $H::get_inline_styles( $title_styles ),
	'.shapeblock-heading .shapeblock-title span'            => $H::get_inline_styles( $hl ),
] );

?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-heading">
		<?php
		if ( '' !== trim( (string) $title_raw ) ) {
			printf(
				'<%1$s class="shapeblock-title">%2$s</%1$s>',
				tag_escape( $tag ),
				wp_kses_post( $title )
			);
		}
		?>
	</div>
</div>
