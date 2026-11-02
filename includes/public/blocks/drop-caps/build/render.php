<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Drop Caps block: one paragraph whose first
 * letter (::first-letter in the stylesheet) drops across a number of lines,
 * plain, in a filled or outlined box, or as an outlined letter. The text can
 * run in newspaper columns.
 *
 * Everything the letter needs is a custom property on the block, so edit.js
 * sets the same properties for the preview.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-dc-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$text      = isset( $attributes['text'] ) && is_string( $attributes['text'] ) ? $attributes['text'] : '';
$cap_style = isset( $attributes['capStyle'] ) && in_array( $attributes['capStyle'], [ 'plain', 'filled', 'outline', 'stroke' ], true ) ? $attributes['capStyle'] : 'plain';
if ( '' === trim( wp_strip_all_tags( $text ) ) ) {
	return;
}

$selector     = '.shapeblock-dc.' . $unique_id;
$style_handle = 'shapeblock-drop-caps-style';

$color = function ( $key ) use ( $attributes, $H ) {
	return ! empty( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $H::sanitize_css_color( $attributes[ $key ], '' ) : '';
};
$size  = function ( $key ) use ( $attributes, $H ) {
	return isset( $attributes[ $key ] ) && is_scalar( $attributes[ $key ] ) && '' !== (string) $attributes[ $key ] ? $H::ensure_unit( $attributes[ $key ] ) : '';
};
$count = function ( $key, $max ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) ? max( 0, min( $max, (int) $attributes[ $key ] ) ) : 0;
};

// One device's rules; $suffix is '', 'Tablet' or 'Mobile'.
$rules = function ( $suffix ) use ( $attributes, $selector, $color, $size, $count, $H ) {
	$root = [];
	$text = [];
	if ( $count( 'lines' . $suffix, 8 ) ) $root['--shapeblock-dc-lines'] = (string) max( 2, $count( 'lines' . $suffix, 8 ) );
	if ( $count( 'columns' . $suffix, 4 ) ) {
		$root['--shapeblock-dc-cols'] = (string) $count( 'columns' . $suffix, 4 );
	} elseif ( 'Mobile' === $suffix && ( $count( 'columns', 4 ) > 1 || $count( 'columnsTablet', 4 ) > 1 ) ) {
		// Phones read one column until a phone value is set.
		$root['--shapeblock-dc-cols'] = '1';
	}
	$typo = isset( $attributes[ 'textTypography' . $suffix ] ) && is_array( $attributes[ 'textTypography' . $suffix ] ) ? $attributes[ 'textTypography' . $suffix ] : [];
	foreach ( [ 'fontFamily' => 'font-family', 'fontWeight' => 'font-weight', 'fontStyle' => 'font-style', 'textTransform' => 'text-transform', 'textDecoration' => 'text-decoration' ] as $key => $prop ) {
		if ( ! empty( $typo[ $key ] ) ) $text[ $prop ] = $typo[ $key ];
	}
	foreach ( [ 'fontSize' => 'font-size', 'letterSpacing' => 'letter-spacing' ] as $key => $prop ) {
		if ( ! empty( $typo[ $key ] ) ) $text[ $prop ] = $H::ensure_unit( $typo[ $key ] );
	}
	// The letter is sized from a plain line height; any other kind is used as it is.
	if ( ! empty( $typo['lineHeight'] ) ) {
		if ( is_numeric( $typo['lineHeight'] ) ) {
			$root['--shapeblock-dc-lh'] = (string) ( 0 + $typo['lineHeight'] );
		} else {
			$text['line-height'] = $typo['lineHeight'];
		}
	}
	if ( '' === $suffix ) {
		foreach ( [ 'capColor' => '--shapeblock-dc-color', 'capBg' => '--shapeblock-dc-bg', 'columnRuleColor' => '--shapeblock-dc-rule-color' ] as $key => $prop ) {
			if ( '' !== $color( $key ) ) $root[ $prop ] = $color( $key );
		}
		foreach ( [ 'capRadius' => '--shapeblock-dc-radius', 'capGap' => '--shapeblock-dc-gap', 'columnGap' => '--shapeblock-dc-col-gap' ] as $key => $prop ) {
			if ( '' !== $size( $key ) ) $root[ $prop ] = $size( $key );
		}
		if ( ! empty( $attributes['capFontFamily'] ) && is_string( $attributes['capFontFamily'] ) ) $root['--shapeblock-dc-font'] = $H::sanitize_css_value( $attributes['capFontFamily'] );
		if ( ! empty( $attributes['capFontWeight'] ) && preg_match( '/^[1-9]00$/', (string) $attributes['capFontWeight'] ) ) $root['--shapeblock-dc-weight'] = (string) $attributes['capFontWeight'];
		if ( '' !== $color( 'textColor' ) ) $text['color'] = $color( 'textColor' );
	}
	$css = '';
	foreach ( [ '' => $root, ' .shapeblock-dc__text' => $text ] as $sub => $decls ) {
		$decls = $H::get_inline_styles( $decls );
		if ( $decls ) $css .= $selector . $sub . '{' . $decls . '}';
	}
	return $css;
};

wp_enqueue_style( $style_handle );
$css    = $rules( '' );
$tablet = $rules( 'Tablet' );
$mobile = $rules( 'Mobile' );
$css   .= '' !== $tablet ? '@media (max-width:1024px){' . $tablet . '}' : '';
$css   .= '' !== $mobile ? '@media (max-width:767px){' . $mobile . '}' : '';
if ( '' !== $css ) {
	$H::add_custom_style( $style_handle, $selector, $css, [] );
}

$block_wrap_attr = get_block_wrapper_attributes(
	array(
		'class'      => 'shapeblock-block shapeblock-dc ' . $unique_id,
		'data-cap'   => $cap_style,
		'data-rule'  => ! empty( $attributes['columnRule'] ) ? '1' : '0',
		'data-multicol' => $count( 'columns', 4 ) > 1 || $count( 'columnsTablet', 4 ) > 1 || $count( 'columnsMobile', 4 ) > 1 ? '1' : '0',
	)
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>><p class="shapeblock-dc__text"><?php echo wp_kses( nl2br( $text ), $H::inline_allowed_html() ); ?></p></div>
<?php } )( $attributes, $content, $block );
