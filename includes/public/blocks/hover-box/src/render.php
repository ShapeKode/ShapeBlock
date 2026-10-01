<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Hover Box block.
 *
 * The shape is two stacked layers: the picture or icon, and an overlay holding
 * the title and description. Which of them moves, and from where, is decided by
 * a class on the wrapper and lives in style.scss; everything an author can set
 * is written here as a rule scoped to this one block.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-hover-box-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$allowed_tags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag    = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed_tags, true ) ? $attributes['titleTag'] : 'h3';

$media_type = ( isset( $attributes['mediaType'] ) && 'icon' === $attributes['mediaType'] ) ? 'icon' : 'image';
$img        = isset( $attributes['image'] ) && is_array( $attributes['image'] ) ? $attributes['image'] : [];
$icon       = isset( $attributes['icon'] ) ? $attributes['icon'] : '';
$ttl        = isset( $attributes['title'] ) ? $attributes['title'] : '';
$desc       = isset( $attributes['desc'] ) ? $attributes['desc'] : '';

// Only shapes, effects and directions the stylesheet actually knows are allowed
// through; anything else would leave a class on the wrapper that nothing
// answers, and the box would sit there doing nothing on hover.
//
// Each effect names the directions it understands. An effect that reads the
// same from every side -- a fade, a blur -- has none, and the direction class
// is simply left off.
$directions = [
	'fade'      => [],
	'slide'     => [ 'top', 'bottom', 'left', 'right' ],
	'push'      => [ 'top', 'bottom', 'left', 'right' ],
	'hinge'     => [ 'top', 'bottom', 'left', 'right' ],
	'shutter'   => [ 'top', 'bottom', 'left', 'right' ],
	'zoom'      => [ 'up', 'down' ],
	'flip'      => [ 'horizontal', 'vertical' ],
	'spin'      => [],
	'blur'      => [],
	'grayscale' => [],
	'circle'    => [],
	'curtain'   => [],
];

$shapes = [ 'circle', 'square' ];
$shape  = ( isset( $attributes['shape'] ) && in_array( $attributes['shape'], $shapes, true ) ) ? $attributes['shape'] : 'circle';
$effect = ( isset( $attributes['effect'] ) && isset( $directions[ $attributes['effect'] ] ) ) ? $attributes['effect'] : 'fade';
$align  = ( isset( $attributes['boxAlign'] ) && in_array( $attributes['boxAlign'], [ 'left', 'center', 'right' ], true ) ) ? $attributes['boxAlign'] : 'center';

$allowed_dirs = $directions[ $effect ];
$direction    = '';
if ( $allowed_dirs ) {
	$direction = ( isset( $attributes['direction'] ) && in_array( $attributes['direction'], $allowed_dirs, true ) )
		? $attributes['direction']
		: $allowed_dirs[0];
}

$wrap_classes = [
	'shapeblock-block',
	'shapeblock-hover-box-block-wrap',
	$unique_id,
	'shapeblock-hover-box-wrapper',
	'shapeblock-hover-box-shape-' . $shape,
	'shapeblock-hover-box-effect-' . $effect,
	'shapeblock-hover-box-align-' . $align,
];

if ( '' !== $direction ) {
	$wrap_classes[] = 'shapeblock-hover-box-dir-' . $direction;
}

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-hover-box-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-hover-box-style';

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

// The shape itself. Width and height are the same value: the box is square, and
// the circle shape is that square with its corners rounded away.
$box = $bg( 'boxBgColor', 'boxBgGradient' );
if ( '' !== $u( 'boxSize' ) ) {
	$box['width']  = $u( 'boxSize' );
	$box['height'] = $u( 'boxSize' );
}
if ( ! empty( $attributes['boxBorder'] ) ) {
	$box = array_merge( $box, $H::border_to_css_props( $attributes['boxBorder'] ) );
}
$box = array_merge( $box, $shadow( $attributes['boxShadow'] ?? [] ) );

// A corner radius only means anything on the square; on a circle the 50% that
// makes it round has to win, so the setting is ignored there rather than
// producing a shape that is neither.
$box_radius = ( 'square' === $shape ) ? $dims( $attributes['boxRadius'] ?? [], 'radius' ) : [];
$box        = array_merge( $box, $box_radius );

$overlay = $bg( 'overlayColor', 'overlayGradient' );
$overlay = array_merge( $overlay, $dims( $attributes['contentPadding'] ?? [], 'padding' ) );

// How long the movement takes. It belongs on both layers, since an effect may
// move either of them.
$speed = '';
if ( isset( $attributes['speed'] ) && '' !== $attributes['speed'] ) {
	$speed = (int) $attributes['speed'] . 'ms';
}
$timing = ( '' !== $speed ) ? [ 'transition-duration' => $speed ] : [];

$icon_styles = ( '' !== $u( 'iconSize' ) ) ? [ 'font-size' => $u( 'iconSize' ) ] : [];
if ( ! empty( $attributes['iconColor'] ) ) {
	$icon_styles['color'] = $attributes['iconColor'];
	$icon_styles['fill']  = $attributes['iconColor'];
}

$title_styles = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_styles['color'] = $attributes['titleColor'];

$desc_styles = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc_styles['color'] = $attributes['descColor'];

$extra_css     = '';
$block_margin  = $dims( $attributes['blockMargin'] ?? [], 'margin' );
$margin_decls  = $H::get_inline_styles( $block_margin );
if ( $margin_decls ) {
	$extra_css .= $selector . '{' . $margin_decls . '}';
}

// ---------------------------------------------------------------------------
// Responsive (tablet / mobile).
// ---------------------------------------------------------------------------
$resp = function ( $suffix ) use ( $attributes, $selector, $typo, $dims, $H, $shape ) {
	$uu = function ( $key ) use ( $attributes, $H, $suffix ) {
		$k = $key . $suffix;
		return ( isset( $attributes[ $k ] ) && '' !== $attributes[ $k ] ) ? $H::ensure_unit( $attributes[ $k ] ) : '';
	};

	$box = [];
	if ( '' !== $uu( 'boxSize' ) ) {
		$box['width']  = $uu( 'boxSize' );
		$box['height'] = $uu( 'boxSize' );
	}

	$rules = [
		''                              => $H::get_inline_styles( $dims( $attributes[ 'blockMargin' . $suffix ] ?? [], 'margin' ) ),
		' .shapeblock-hover-box'        => $H::get_inline_styles( $box ),
		' .shapeblock-hover-box-overlay' => $H::get_inline_styles( $dims( $attributes[ 'contentPadding' . $suffix ] ?? [], 'padding' ) ),
		' .shapeblock-hover-box-media i' => $H::get_inline_styles( ( '' !== $uu( 'iconSize' ) ) ? [ 'font-size' => $uu( 'iconSize' ) ] : [] ),
		' .shapeblock-hover-box-title'  => $H::get_inline_styles( $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] ) ),
		' .shapeblock-hover-box-desc'   => $H::get_inline_styles( $typo( $attributes[ 'descTypography' . $suffix ] ?? [] ) ),
	];

	$css = '';
	foreach ( $rules as $sub => $decls ) {
		if ( $decls ) {
			$css .= $selector . $sub . '{' . $decls . '}';
		}
	}
	return $css;
};
$tablet_css = $resp( 'Tablet' );
$mobile_css = $resp( 'Mobile' );

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $extra_css, [
	'.shapeblock-hover-box'                                     => $H::get_inline_styles( $box ),
	'.shapeblock-hover-box-overlay'                             => $H::get_inline_styles( $overlay ),
	'.shapeblock-hover-box-media, ' . $selector . ' .shapeblock-hover-box-overlay' => $H::get_inline_styles( $timing ),
	'.shapeblock-hover-box-media i'                             => $H::get_inline_styles( $icon_styles ),
	'.shapeblock-hover-box-title'                               => $H::get_inline_styles( $title_styles ),
	'.shapeblock-hover-box-desc'                                => $H::get_inline_styles( $desc_styles ),
] );

// Media queries are printed after the desktop rules so they win at their
// breakpoints -- a media query adds no specificity, so source order decides.
$responsive_media = '';
if ( '' !== $tablet_css ) $responsive_media .= '@media (max-width:1024px){' . $tablet_css . '}';
if ( '' !== $mobile_css ) $responsive_media .= '@media (max-width:767px){' . $mobile_css . '}';
if ( '' !== $responsive_media ) {
	$H::add_custom_style( $style_handle, $selector, $responsive_media, [] );
}

// ---------------------------------------------------------------------------
// Markup.
// ---------------------------------------------------------------------------
$link_url = isset( $attributes['linkUrl'] ) ? trim( (string) $attributes['linkUrl'] ) : '';
$new_tab  = ! empty( $attributes['linkNewTab'] );
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-hover-box">
		<div class="shapeblock-hover-box-media">
			<?php
			if ( 'image' === $media_type ) {
				// Until a picture is chosen the bundled placeholder stands in, so a
				// box dropped onto the page shows what it is instead of an empty
				// shape that looks like the block failed to render.
				$img_src = ! empty( $img['url'] ) ? $img['url'] : SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png';
				echo '<img src="' . esc_url( $img_src ) . '" alt="' . esc_attr( $img['alt'] ?? $ttl ) . '" class="shapeblock-hover-box-img" loading="lazy" decoding="async">';
			} elseif ( 'icon' === $media_type && '' !== $icon && 'none' !== $icon ) {
				echo '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>';
			}
			?>
		</div>
		<div class="shapeblock-hover-box-overlay">
			<?php if ( '' !== $ttl ) : ?>
				<?php printf( '<%1$s class="shapeblock-hover-box-title">%2$s</%1$s>', tag_escape( $title_tag ), esc_html( $ttl ) ); ?>
			<?php endif; ?>
			<?php if ( '' !== $desc ) : ?>
				<p class="shapeblock-hover-box-desc"><?php echo esc_html( $desc ); ?></p>
			<?php endif; ?>
		</div>
		<?php if ( '' !== $link_url ) : ?>
			<a class="shapeblock-hover-box-link"
				href="<?php echo esc_url( $link_url ); ?>"
				<?php echo $new_tab ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
				<span class="screen-reader-text"><?php echo esc_html( '' !== $ttl ? $ttl : __( 'Read more', 'shapeblock' ) ); ?></span>
			</a>
		<?php endif; ?>
	</div>
</div>
<?php } )( $attributes, $content, $block );
