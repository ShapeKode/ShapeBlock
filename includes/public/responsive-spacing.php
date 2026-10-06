<?php
/**
 * Per-device padding and margin for the core Dimensions panel.
 *
 * WordPress keeps one padding / margin per block. The editor script
 * ( assets/js/responsive-spacing.js ) makes the Dimensions panel follow the
 * preview device and stores the Tablet / Mobile values in `shapeblockSpacing`;
 * this prints them as media queries. Breakpoints match the rest of the plugin
 * ( tablet <= 1024px, mobile <= 767px ). Core writes the desktop padding as an
 * inline style, so the per-device rules carry !important to take over from it.
 *
 * ShapeBlock's own blocks are left out -- they have their own per-device controls.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Does this block take padding or margin from the core Dimensions panel?
 *
 * @param string $name     Block name.
 * @param array  $supports Block supports.
 * @return bool
 */
function shapeblock_spacing_is_target( $name, $supports ) {
	if ( 0 === strpos( (string) $name, 'shapeblock/' ) || ! is_array( $supports ) ) {
		return false;
	}
	$spacing = isset( $supports['spacing'] ) && is_array( $supports['spacing'] ) ? $supports['spacing'] : array();
	return ! empty( $spacing['padding'] ) || ! empty( $spacing['margin'] );
}

/**
 * Register the attribute, so dynamic blocks and the REST renderer accept it.
 *
 * @param array  $args Block type args.
 * @param string $name Block name.
 * @return array
 */
function shapeblock_spacing_register_attribute( $args, $name ) {
	if ( ! shapeblock_spacing_is_target( $name, isset( $args['supports'] ) ? $args['supports'] : array() ) ) {
		return $args;
	}
	if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
		$args['attributes'] = array();
	}
	if ( ! isset( $args['attributes']['shapeblockSpacing'] ) ) {
		$args['attributes']['shapeblockSpacing'] = array( 'type' => 'object' );
	}
	return $args;
}
add_filter( 'register_block_type_args', 'shapeblock_spacing_register_attribute', 10, 2 );

/**
 * One side's value as CSS: preset references become custom properties.
 *
 * @param mixed $value Stored value.
 * @return string Safe CSS value, or '' to skip.
 */
function shapeblock_spacing_value( $value ) {
	if ( ! is_string( $value ) || '' === $value ) {
		return '';
	}
	if ( 0 === strpos( $value, 'var:' ) ) {
		$value = 'var(--wp--' . str_replace( '|', '--', substr( $value, 4 ) ) . ')';
	}
	return \ShapeBlock\Frontend\Helper::sanitize_css_value( $value );
}

/**
 * Declarations for one device.
 *
 * @param array $device { padding, margin } - each a string or a side map.
 * @return string
 */
function shapeblock_spacing_decls( $device ) {
	$out = '';
	if ( ! is_array( $device ) ) {
		return $out;
	}
	foreach ( array( 'padding', 'margin' ) as $prop ) {
		if ( empty( $device[ $prop ] ) ) {
			continue;
		}
		$sides = $device[ $prop ];
		if ( is_string( $sides ) ) {
			$sides = array_fill_keys( array( 'top', 'right', 'bottom', 'left' ), $sides );
		}
		if ( ! is_array( $sides ) ) {
			continue;
		}
		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$val = isset( $sides[ $side ] ) ? shapeblock_spacing_value( $sides[ $side ] ) : '';
			if ( '' !== $val ) {
				$out .= $prop . '-' . $side . ':' . $val . ' !important;';
			}
		}
	}
	return $out;
}

/**
 * Add the class and the media queries for a block that has per-device spacing.
 *
 * @param string $content Rendered block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function shapeblock_spacing_render_block( $content, $block ) {
	if ( empty( $block['attrs']['shapeblockSpacing'] ) || ! is_array( $block['attrs']['shapeblockSpacing'] ) ) {
		return $content;
	}
	if ( empty( $block['blockName'] ) || 0 === strpos( (string) $block['blockName'], 'shapeblock/' ) || '' === trim( (string) $content ) ) {
		return $content;
	}

	$spacing = $block['attrs']['shapeblockSpacing'];
	$tablet  = shapeblock_spacing_decls( isset( $spacing['tablet'] ) ? $spacing['tablet'] : array() );
	$mobile  = shapeblock_spacing_decls( isset( $spacing['mobile'] ) ? $spacing['mobile'] : array() );
	if ( '' === $tablet && '' === $mobile ) {
		return $content;
	}

	// Same values -> same class, so repeated blocks share one rule.
	$class = 'shapeblock-sp-' . substr( md5( $tablet . '|' . $mobile ), 0, 10 );

	$tags = new WP_HTML_Tag_Processor( $content );
	if ( ! $tags->next_tag() ) {
		return $content;
	}
	$tags->add_class( $class );
	$content = $tags->get_updated_html();

	static $printed = array();
	if ( ! isset( $printed[ $class ] ) ) {
		$printed[ $class ] = true;
		// The class is repeated to outweigh core's layout rules ( .is-layout-flow > * etc. ).
		$sel = '.' . $class . '.' . $class;
		$css = '';
		if ( '' !== $tablet ) {
			$css .= '@media (max-width:1024px){' . $sel . '{' . $tablet . '}}';
		}
		if ( '' !== $mobile ) {
			$css .= '@media (max-width:767px){' . $sel . '{' . $mobile . '}}';
		}
		wp_enqueue_block_support_styles( $css );
	}

	return $content;
}
add_filter( 'render_block', 'shapeblock_spacing_render_block', 10, 2 );

/**
 * The editor side.
 *
 * @return void
 */
function shapeblock_spacing_editor_script() {
	wp_enqueue_script(
		'shapeblock-responsive-spacing',
		SHAPEBLOCK_PL_URL . 'includes/public/assets/js/responsive-spacing.js',
		array( 'wp-blocks', 'wp-hooks', 'wp-compose', 'wp-element', 'wp-data', 'wp-block-editor', 'wp-i18n' ),
		shapeblock_asset_version( SHAPEBLOCK_PL_PATH . 'includes/public/assets/js/responsive-spacing.js' ),
		true
	);
	wp_set_script_translations( 'shapeblock-responsive-spacing', 'shapeblock', SHAPEBLOCK_PL_PATH . 'languages' );
}
add_action( 'enqueue_block_editor_assets', 'shapeblock_spacing_editor_script', 1 );
