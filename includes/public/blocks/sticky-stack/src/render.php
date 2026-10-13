<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Sticky Stack block.
 *
 * A list of cards that each stick to the top of the screen while the visitor
 * scrolls, so the next card slides over the one before it. The stacking is CSS
 * (`position: sticky`); view.js only adds the depth effect.
 * Element classes use the "shapeblock-ss" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-ss-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$unique_id = $H::unique_block_id( sanitize_html_class( $unique_id ) );

$cards       = isset( $attributes['cards'] ) && is_array( $attributes['cards'] ) ? array_values( $attributes['cards'] ) : [];
$flag        = function ( $key ) use ( $attributes ) {
	return ! isset( $attributes[ $key ] ) || false !== $attributes[ $key ];
};
$show_number = $flag( 'showNumber' );
$show_icon   = $flag( 'showIcon' );
$show_points = $flag( 'showPoints' );
$show_image  = $flag( 'showImage' );
$show_button = $flag( 'showButton' );
$allowed     = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag   = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';
$stack_on    = isset( $attributes['stackOn'] ) && in_array( $attributes['stackOn'], [ 'all', 'desktop-tablet', 'desktop' ], true ) ? $attributes['stackOn'] : 'desktop-tablet';
$depth       = $flag( 'depthEffect' );
$img_fit     = isset( $attributes['imageFit'] ) && in_array( $attributes['imageFit'], [ 'cover', 'contain' ], true ) ? $attributes['imageFit'] : 'cover';
$valign_map  = [ 'start' => 'flex-start', 'center' => 'center', 'end' => 'flex-end' ];
$valign      = isset( $attributes['verticalAlign'], $valign_map[ $attributes['verticalAlign'] ] ) ? $valign_map[ $attributes['verticalAlign'] ] : 'center';

$wrap_classes = [
	'shapeblock-block',
	'shapeblock-ss-block-wrap',
	$unique_id,
	'shapeblock-ss',
];

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class'      => implode( ' ', $wrap_classes ),
	'data-stack' => $stack_on,
	'data-depth' => $depth ? '1' : '0',
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '" data-stack="' . esc_attr( $stack_on ) . '" data-depth="' . ( $depth ? '1' : '0' ) . '"';
}

// Nothing to show: say so, in the editor and for visitors alike.
if ( empty( $cards ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Add a card to show here.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-ss-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-sticky-stack-style';

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
$bg = function ( $colorKey, $gradKey = '' ) use ( $attributes ) {
	if ( '' !== $gradKey && ! empty( $attributes[ $gradKey ] ) ) return [ 'background' => $attributes[ $gradKey ] ];
	if ( ! empty( $attributes[ $colorKey ] ) ) return [ 'background' => $attributes[ $colorKey ] ];
	return [];
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};
$pct = function ( $key, $min, $max, $fallback ) use ( $attributes ) {
	return ( isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) ) ? max( $min, min( $max, (float) $attributes[ $key ] ) ) : $fallback;
};

// Columns of a card for a media position. Content takes $cw percent of the width.
$cw = (int) $pct( 'contentWidth', 20, 80, 46 );
$layout_for = function ( $position ) use ( $cw ) {
	$rest = 100 - $cw;
	switch ( $position ) {
		case 'left':
			return [ '--ss-cols' => 'minmax(0,' . $rest . 'fr) minmax(0,' . $cw . 'fr)', '--ss-co' => '1', '--ss-mo' => '0' ];
		case 'top':
			return [ '--ss-cols' => 'minmax(0,1fr)', '--ss-co' => '1', '--ss-mo' => '0' ];
		case 'bottom':
			return [ '--ss-cols' => 'minmax(0,1fr)', '--ss-co' => '0', '--ss-mo' => '1' ];
		case 'right':
			return [ '--ss-cols' => 'minmax(0,' . $cw . 'fr) minmax(0,' . $rest . 'fr)', '--ss-co' => '0', '--ss-mo' => '1' ];
	}
	return [];
};
$align_vars = function ( $align ) {
	$flex = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
	return isset( $flex[ $align ] ) ? [ '--ss-ta' => $align, '--ss-items' => $flex[ $align ] ] : [];
};

// Everything that changes per device is a CSS variable on the wrapper, so the
// stylesheet has one rule and the variable carries the value.
$wrap_vars = function ( $s ) use ( $attributes, $u, $layout_for, $align_vars ) {
	$o = [];
	$map = [
		'stickyTop'     => '--ss-top',
		'stepOffset'    => '--ss-step',
		'cardGap'       => '--ss-gap',
		'cardMinHeight' => '--ss-minh',
		'columnGap'     => '--ss-colgap',
		'imageHeight'   => '--ss-img-h',
	];
	foreach ( $map as $key => $var ) {
		// A bare 0 is not a length inside calc(); give it a unit.
		if ( '' !== $u( $key . $s ) ) $o[ $var ] = ( '0' === (string) $u( $key . $s ) ) ? '0px' : $u( $key . $s );
	}
	$pos = isset( $attributes[ 'mediaPosition' . $s ] ) ? (string) $attributes[ 'mediaPosition' . $s ] : '';
	if ( '' !== $pos ) $o = array_merge( $o, $layout_for( $pos ) );
	$al = isset( $attributes[ 'contentAlign' . $s ] ) ? (string) $attributes[ 'contentAlign' . $s ] : '';
	if ( '' !== $al ) $o = array_merge( $o, $align_vars( $al ) );
	return $o;
};

$wrap = $wrap_vars( '' );
$wrap['--ss-valign'] = $valign;
$wrap['--ss-fit']    = $img_fit;
$wrap['--ss-scale']  = sprintf( '%.3f', $pct( 'depthScale', 0, 15, 4 ) / 100 );
$wrap['--ss-dim']    = sprintf( '%.3f', $pct( 'depthDim', 0, 40, 10 ) / 100 );
if ( '' !== $u( 'textGap' ) ) $wrap['--ss-textgap'] = $u( 'textGap' );
if ( '' !== $u( 'pointsGap' ) ) $wrap['--ss-pointsgap'] = $u( 'pointsGap' );
if ( ! empty( $attributes['pointsBulletColor'] ) ) $wrap['--ss-bullet'] = $attributes['pointsBulletColor'];

// Card.
$card_css = array_merge( $bg( 'cardBg', 'cardBgGradient' ), $dims( $attributes['cardRadius'] ?? [], 'radius' ), $dims( $attributes['cardPadding'] ?? [], 'padding' ), $shadow( $attributes['cardShadow'] ?? [] ) );
if ( ! empty( $attributes['cardBorder'] ) ) $card_css = array_merge( $card_css, $H::border_to_css_props( $attributes['cardBorder'] ) );

// Badge (the number) and icon.
$badge = array_merge( $bg( 'badgeBg', 'badgeBgGradient' ), $dims( $attributes['badgeRadius'] ?? [], 'radius' ), $typo( $attributes['badgeTypography'] ?? [] ) );
if ( ! empty( $attributes['badgeColor'] ) ) $badge['color'] = $attributes['badgeColor'];
if ( '' !== $u( 'badgeSize' ) ) { $badge['min-width'] = $u( 'badgeSize' ); $badge['height'] = $u( 'badgeSize' ); }
$icon_i = [];
if ( ! empty( $attributes['iconColor'] ) ) $icon_i['color'] = $attributes['iconColor'];
if ( '' !== $u( 'iconSize' ) ) $icon_i['font-size'] = $u( 'iconSize' );

// Text.
$title = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title['color'] = $attributes['titleColor'];
$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $attributes['descColor'];
$points = $typo( $attributes['pointsTypography'] ?? [] );
if ( ! empty( $attributes['pointsColor'] ) ) $points['color'] = $attributes['pointsColor'];

// Button: normal / hover.
$btn = array_merge( $typo( $attributes['btnTypography'] ?? [] ), $dims( $attributes['btnPadding'] ?? [], 'padding' ), $dims( $attributes['btnRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['btnColor'] ) ) $btn['color'] = $attributes['btnColor'];
$btn = array_merge( $btn, $bg( 'btnBg', 'btnBgGradient' ) );
if ( ! empty( $attributes['btnBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['btnBorder'] ) );
$btn_hover = [];
if ( ! empty( $attributes['btnColorHover'] ) ) $btn_hover['color'] = $attributes['btnColorHover'];
$btn_hover = array_merge( $btn_hover, $bg( 'btnBgHover', 'btnBgGradientHover' ) );
if ( ! empty( $attributes['btnBorderColorHover'] ) ) $btn_hover['border-color'] = $attributes['btnBorderColorHover'];

// Image.
$image_css = array_merge( $dims( $attributes['imageRadius'] ?? [], 'radius' ), $shadow( $attributes['imageShadow'] ?? [] ) );

// Tablet / Mobile overrides, printed only for what was actually set.
$resp_css = '';
// The wrapper carries the per-device values as CSS variables: desktop plain, tablet and mobile in media queries.
$wrap_resp = [ 'desktop' => $wrap ];
foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$vars = $wrap_vars( $suffix );
	if ( ! empty( $vars ) ) {
		$wrap_resp[ $device_key ] = $vars;
	}
}
$resp_css .= $H::generate_responsive_css( $selector, $wrap_resp );
$per_device = [
	'.shapeblock-ss-card'   => function ( $s ) use ( $attributes, $dims ) {
		return $dims( $attributes[ 'cardPadding' . $s ] ?? [], 'padding' );
	},
	'.shapeblock-ss-badge'  => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'badgeTypography' . $s ] ?? [] );
	},
	'.shapeblock-ss-title'  => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'titleTypography' . $s ] ?? [] );
	},
	'.shapeblock-ss-desc'   => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'descTypography' . $s ] ?? [] );
	},
	'.shapeblock-ss-points' => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'pointsTypography' . $s ] ?? [] );
	},
	'.shapeblock-ss-btn'    => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'btnTypography' . $s ] ?? [] ), $dims( $attributes[ 'btnPadding' . $s ] ?? [], 'padding' ) );
	},
];
foreach ( $per_device as $sub_sel => $build ) {
	$rdata = [];
	foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
		$decls = $build( $suffix );
		if ( ! empty( $decls ) ) {
			$rdata[ $device_key ] = $decls;
		}
	}
	if ( ! empty( $rdata ) ) {
		$resp_css .= $H::generate_responsive_css( $selector . ' ' . $sub_sel, $rdata );
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-ss-card'               => $H::get_inline_styles( $card_css ),
	'.shapeblock-ss-badge'              => $H::get_inline_styles( $badge ),
	'.shapeblock-ss-icon i'             => $H::get_inline_styles( $icon_i ),
	'.shapeblock-ss-title'              => $H::get_inline_styles( $title ),
	'.shapeblock-ss-desc'               => $H::get_inline_styles( $desc ),
	'.shapeblock-ss-points'             => $H::get_inline_styles( $points ),
	'.shapeblock-ss-btn'                => $H::get_inline_styles( $btn ),
	'.shapeblock-ss-btn:hover'          => $H::get_inline_styles( $btn_hover ),
	'.shapeblock-ss-media img'          => $H::get_inline_styles( $image_css ),
] );

$icon_class = function ( $value ) {
	return trim( preg_replace( '/[^A-Za-z0-9_ -]/', '', (string) $value ) );
};
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-ss-list">
		<?php foreach ( $cards as $ci => $card ) : ?>
			<?php
			if ( ! is_array( $card ) ) {
				continue;
			}
			$number    = isset( $card['number'] ) ? trim( (string) $card['number'] ) : '';
			$icon      = isset( $card['icon'] ) ? $icon_class( $card['icon'] ) : '';
			$ttl       = isset( $card['title'] ) ? (string) $card['title'] : '';
			$dsc       = isset( $card['desc'] ) ? (string) $card['desc'] : '';
			$pts_raw   = isset( $card['points'] ) ? (string) $card['points'] : '';
			$pts       = array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $pts_raw ) ), 'strlen' ) );
			$img_id    = isset( $card['imageId'] ) ? absint( $card['imageId'] ) : 0;
			$img_url   = isset( $card['imageUrl'] ) ? (string) $card['imageUrl'] : '';
			$img_alt   = isset( $card['imageAlt'] ) ? (string) $card['imageAlt'] : '';
			$btn_text  = isset( $card['btnText'] ) ? trim( (string) $card['btnText'] ) : '';
			$btn_url   = isset( $card['btnUrl'] ) ? trim( (string) $card['btnUrl'] ) : '';
			$btn_new   = ! empty( $card['btnNewTab'] );

			$has_img = false;
			if ( $show_image ) {
				if ( $img_id && wp_attachment_is_image( $img_id ) ) {
					$has_img = true;
				} elseif ( '' !== $img_url && '' !== esc_url( $img_url ) ) {
					$has_img = true;
				}
			}

			// Per-card badge background (colour or gradient).
			$badge_bg = '';
			if ( ! empty( $card['badgeBgGradient'] ) ) {
				$badge_bg = $H::get_inline_styles( [ 'background' => $card['badgeBgGradient'] ] );
			} elseif ( ! empty( $card['badgeBg'] ) ) {
				$badge_bg = $H::get_inline_styles( [ 'background' => $card['badgeBg'] ] );
			}
			?>
			<article class="shapeblock-ss-card<?php echo $has_img ? ' has-media' : ''; ?>" style="--i:<?php echo (int) $ci; ?>">
				<div class="shapeblock-ss-content">
					<?php if ( ( $show_number && '' !== $number ) || ( $show_icon && '' !== $icon && 'none' !== $icon ) ) : ?>
						<div class="shapeblock-ss-head">
							<?php if ( $show_number && '' !== $number ) : ?>
								<span class="shapeblock-ss-badge"<?php echo '' !== $badge_bg ? ' style="' . esc_attr( $badge_bg ) . '"' : ''; ?>><?php echo esc_html( $number ); ?></span>
							<?php endif; ?>
							<?php if ( $show_icon && '' !== $icon && 'none' !== $icon ) : ?>
								<span class="shapeblock-ss-icon"><i class="shapeblock-icon <?php echo esc_attr( $icon ); ?>" aria-hidden="true"></i></span>
							<?php endif; ?>
						</div>
					<?php endif; ?>
					<?php if ( '' !== $ttl ) : ?>
						<?php printf( '<%1$s class="shapeblock-ss-title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses_post( $ttl ) ); ?>
					<?php endif; ?>
					<?php if ( '' !== $dsc ) : ?>
						<p class="shapeblock-ss-desc"><?php echo wp_kses( nl2br( $dsc ), \ShapeBlock\Frontend\Helper::inline_allowed_html() ); ?></p>
					<?php endif; ?>
					<?php if ( $show_points && ! empty( $pts ) ) : ?>
						<ul class="shapeblock-ss-points">
							<?php foreach ( $pts as $pt ) : ?>
								<li><?php echo wp_kses( $pt, \ShapeBlock\Frontend\Helper::inline_allowed_html() ); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
					<?php if ( $show_button && '' !== $btn_text ) : ?>
						<a class="shapeblock-ss-btn" href="<?php echo esc_url( '' !== $btn_url ? $btn_url : '#' ); ?>"<?php echo $btn_new ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>><?php echo esc_html( $btn_text ); ?></a>
					<?php endif; ?>
				</div>
				<?php if ( $has_img ) : ?>
					<div class="shapeblock-ss-media">
						<?php
						if ( $img_id && wp_attachment_is_image( $img_id ) ) {
							echo wp_get_attachment_image( $img_id, 'large', false, array(
								'alt'      => $img_alt,
								'loading'  => 'lazy',
								'decoding' => 'async',
							) );
						} else {
							?>
							<img src="<?php echo esc_url( $img_url ); ?>" alt="<?php echo esc_attr( $img_alt ); ?>" loading="lazy" decoding="async">
							<?php
						}
						?>
					</div>
				<?php endif; ?>
			</article>
		<?php endforeach; ?>
	</div>
</div>
<?php } )( $attributes, $content, $block );
