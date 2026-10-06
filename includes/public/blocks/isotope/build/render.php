<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Isotope Filter block.
 *
 * A filter bar (one button per category, plus an optional "All") above a grid of
 * items. Each item belongs to the category it was added under and carries that
 * category's key in `data-cat`; view.js shows and hides items from that.
 * Element classes use the "shapeblock-iso" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-iso-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$unique_id = $H::unique_block_id( sanitize_html_class( $unique_id ) );

$categories = isset( $attributes['categories'] ) && is_array( $attributes['categories'] ) ? array_values( $attributes['categories'] ) : [];
$show_all   = ! isset( $attributes['showAll'] ) || false !== $attributes['showAll'];
$all_label  = isset( $attributes['allLabel'] ) && '' !== trim( (string) $attributes['allLabel'] ) ? (string) $attributes['allLabel'] : __( 'All', 'shapeblock' );
$show_icon  = ! isset( $attributes['showIcon'] ) || false !== $attributes['showIcon'];
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' ];
$title_tag  = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h3';
$equal      = ! isset( $attributes['equalHeight'] ) || false !== $attributes['equalHeight'];
$icon_pos   = ( isset( $attributes['iconPosition'] ) && 'left' === $attributes['iconPosition'] ) ? 'left' : 'top';
$card_align = isset( $attributes['cardAlign'] ) && in_array( $attributes['cardAlign'], [ 'left', 'center', 'right' ], true ) ? $attributes['cardAlign'] : 'left';
$anim       = isset( $attributes['animationType'] ) && in_array( $attributes['animationType'], [ 'none', 'fade', 'scale' ], true ) ? $attributes['animationType'] : 'scale';
$duration   = isset( $attributes['animationDuration'] ) && is_numeric( $attributes['animationDuration'] ) ? max( 0, min( 2000, (int) $attributes['animationDuration'] ) ) : 400;

// Which filter is showing first: "all", or a category's position.
$default = isset( $attributes['defaultFilter'] ) ? (string) $attributes['defaultFilter'] : 'all';
$active  = 'all';
if ( ctype_digit( $default ) && isset( $categories[ (int) $default ] ) ) {
	$active = 'c' . (int) $default;
}
if ( 'all' === $active && ! $show_all && ! empty( $categories ) ) {
	$active = 'c0'; // No "All" button, so start on the first category.
}

$wrap_classes = [
	'shapeblock-block',
	'shapeblock-iso-block-wrap',
	$unique_id,
	'shapeblock-iso',
	'shapeblock-iso-icon-' . $icon_pos,
];
if ( $equal ) {
	$wrap_classes[] = 'is-equal-height';
}

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => implode( ' ', $wrap_classes ) ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="' . esc_attr( implode( ' ', $wrap_classes ) ) . '"';
}

// Nothing to show: say so, in the editor and for visitors alike.
$has_items = false;
foreach ( $categories as $cat ) {
	if ( ! empty( $cat['items'] ) && is_array( $cat['items'] ) ) {
		$has_items = true;
		break;
	}
}
if ( ! $has_items ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Add a category and some items to show here.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-iso-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-isotope-style';

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
$n = function ( $key, $fallback ) use ( $attributes ) {
	return ( isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) && (int) $attributes[ $key ] > 0 ) ? (int) $attributes[ $key ] : $fallback;
};

// Filter bar.
$bar = [];
if ( '' !== $u( 'filterSpace' ) ) $bar['margin-bottom'] = $u( 'filterSpace' );
if ( '' !== $u( 'filterGap' ) ) $bar['gap'] = $u( 'filterGap' );

// Filter button: normal / hover / active.
$btn = array_merge( $typo( $attributes['filterTypography'] ?? [] ), $dims( $attributes['filterPadding'] ?? [], 'padding' ), $dims( $attributes['filterRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['filterColor'] ) ) $btn['color'] = $attributes['filterColor'];
$btn = array_merge( $btn, $bg( 'filterBg', 'filterBgGradient' ) );
if ( ! empty( $attributes['filterBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['filterBorder'] ) );
$btn_hover = [];
if ( ! empty( $attributes['filterColorHover'] ) ) $btn_hover['color'] = $attributes['filterColorHover'];
$btn_hover = array_merge( $btn_hover, $bg( 'filterBgHover', 'filterBgGradientHover' ) );
if ( ! empty( $attributes['filterBorderColorHover'] ) ) $btn_hover['border-color'] = $attributes['filterBorderColorHover'];
$btn_active = [];
if ( ! empty( $attributes['filterColorActive'] ) ) $btn_active['color'] = $attributes['filterColorActive'];
$btn_active = array_merge( $btn_active, $bg( 'filterBgActive', 'filterBgGradientActive' ) );
if ( ! empty( $attributes['filterBorderColorActive'] ) ) $btn_active['border-color'] = $attributes['filterBorderColorActive'];

// Grid. Columns and gap are CSS variables so the stylesheet default and the
// per-device values share one rule.
$grid = [
	'--shapeblock-iso-cols' => (string) $n( 'columns', 3 ),
];
if ( '' !== $u( 'gap' ) ) $grid['--shapeblock-iso-gap'] = $u( 'gap' );

// Card alignment moves everything in the card: the icon, the title and the
// description. With the icon above the text that is a column, so it is
// align-items; with the icon beside the text it is a row, so it is
// justify-content. text-align covers text that wraps to several lines.
$align_css = function ( $align ) use ( $icon_pos ) {
	$flex = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
	if ( ! isset( $flex[ $align ] ) ) {
		return [];
	}
	return [
		'text-align'                                  => $align,
		( 'left' === $icon_pos ? 'justify-content' : 'align-items' ) => $flex[ $align ],
	];
};

// Card: normal / hover.
$card = array_merge( $align_css( $card_align ), $bg( 'cardBg', 'cardBgGradient' ), $dims( $attributes['cardRadius'] ?? [], 'radius' ), $dims( $attributes['cardPadding'] ?? [], 'padding' ), $shadow( $attributes['cardShadow'] ?? [] ) );
if ( ! empty( $attributes['cardBorder'] ) ) $card = array_merge( $card, $H::border_to_css_props( $attributes['cardBorder'] ) );
if ( '' !== $u( 'iconSpace' ) ) $card['gap'] = $u( 'iconSpace' );
$card_hover = array_merge( $bg( 'cardBgHover', 'cardBgGradientHover' ), $shadow( $attributes['cardShadowHover'] ?? [] ) );
if ( ! empty( $attributes['cardBorderColorHover'] ) ) $card_hover['border-color'] = $attributes['cardBorderColorHover'];

// Icon.
$icon_box = array_merge( $bg( 'iconBg', 'iconBgGradient' ), $dims( $attributes['iconRadius'] ?? [], 'radius' ) );
if ( '' !== $u( 'iconBoxSize' ) ) { $icon_box['width'] = $u( 'iconBoxSize' ); $icon_box['height'] = $u( 'iconBoxSize' ); }
$icon_i = [];
if ( ! empty( $attributes['iconColor'] ) ) $icon_i['color'] = $attributes['iconColor'];
if ( '' !== $u( 'iconSize' ) ) $icon_i['font-size'] = $u( 'iconSize' );

// Text.
$text = [];
if ( '' !== $u( 'textGap' ) ) $text['gap'] = $u( 'textGap' );
$title = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title['color'] = $attributes['titleColor'];
$title_hover = ! empty( $attributes['titleColorHover'] ) ? [ 'color' => $attributes['titleColorHover'] ] : [];
$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $attributes['descColor'];

// Tablet / Mobile overrides, printed only for what was actually set.
$resp_css = '';
$per_device = [
	'.shapeblock-iso-filters'    => function ( $s ) use ( $attributes, $u ) {
		$o = [];
		if ( '' !== $u( 'filterSpace' . $s ) ) $o['margin-bottom'] = $u( 'filterSpace' . $s );
		if ( '' !== $u( 'filterGap' . $s ) ) $o['gap'] = $u( 'filterGap' . $s );
		if ( ! empty( $attributes[ 'filterAlign' . $s ] ) ) {
			$map = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
			if ( isset( $map[ $attributes[ 'filterAlign' . $s ] ] ) ) $o['justify-content'] = $map[ $attributes[ 'filterAlign' . $s ] ];
		}
		return $o;
	},
	'.shapeblock-iso-filter'     => function ( $s ) use ( $attributes, $typo, $dims ) {
		return array_merge( $typo( $attributes[ 'filterTypography' . $s ] ?? [] ), $dims( $attributes[ 'filterPadding' . $s ] ?? [], 'padding' ) );
	},
	'.shapeblock-iso-grid'       => function ( $s ) use ( $attributes, $u, $n ) {
		$o = [];
		if ( isset( $attributes[ 'columns' . $s ] ) && is_numeric( $attributes[ 'columns' . $s ] ) && (int) $attributes[ 'columns' . $s ] > 0 ) $o['--shapeblock-iso-cols'] = (string) (int) $attributes[ 'columns' . $s ];
		if ( '' !== $u( 'gap' . $s ) ) $o['--shapeblock-iso-gap'] = $u( 'gap' . $s );
		return $o;
	},
	'.shapeblock-iso-card'       => function ( $s ) use ( $attributes, $dims, $align_css ) {
		return array_merge( $dims( $attributes[ 'cardPadding' . $s ] ?? [], 'padding' ), $align_css( $attributes[ 'cardAlign' . $s ] ?? '' ) );
	},
	'.shapeblock-iso-icon'       => function ( $s ) use ( $u ) {
		$o = [];
		if ( '' !== $u( 'iconBoxSize' . $s ) ) { $o['width'] = $u( 'iconBoxSize' . $s ); $o['height'] = $u( 'iconBoxSize' . $s ); }
		return $o;
	},
	'.shapeblock-iso-icon i'     => function ( $s ) use ( $u ) {
		return '' !== $u( 'iconSize' . $s ) ? [ 'font-size' => $u( 'iconSize' . $s ) ] : [];
	},
	'.shapeblock-iso-title'      => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'titleTypography' . $s ] ?? [] );
	},
	'.shapeblock-iso-desc'       => function ( $s ) use ( $attributes, $typo ) {
		return $typo( $attributes[ 'descTypography' . $s ] ?? [] );
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

// Filter-bar alignment on desktop is a class (see style.scss) so it also works
// without any inline style; the per-device rules above override it.
$filter_align = isset( $attributes['filterAlign'] ) && in_array( $attributes['filterAlign'], [ 'left', 'center', 'right' ], true ) ? $attributes['filterAlign'] : 'center';
$flex_map     = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
$bar['justify-content'] = $flex_map[ $filter_align ];

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, [
	'.shapeblock-iso-filters'                       => $H::get_inline_styles( $bar ),
	'.shapeblock-iso-filter'                        => $H::get_inline_styles( $btn ),
	'.shapeblock-iso-filter:hover'                  => $H::get_inline_styles( $btn_hover ),
	'.shapeblock-iso-filter.is-active'              => $H::get_inline_styles( $btn_active ),
	'.shapeblock-iso-grid'                          => $H::get_inline_styles( $grid ),
	'.shapeblock-iso-card'                          => $H::get_inline_styles( $card ),
	'.shapeblock-iso-card:hover'                    => $H::get_inline_styles( $card_hover ),
	'.shapeblock-iso-icon'                          => $H::get_inline_styles( $icon_box ),
	'.shapeblock-iso-icon i'                        => $H::get_inline_styles( $icon_i ),
	'.shapeblock-iso-text'                          => $H::get_inline_styles( $text ),
	'.shapeblock-iso-title'                         => $H::get_inline_styles( $title ),
	'.shapeblock-iso-card:hover .shapeblock-iso-title' => $H::get_inline_styles( $title_hover ),
	'.shapeblock-iso-desc'                          => $H::get_inline_styles( $desc ),
] );

$icon_allowed_html = array(
	'i' => array(
		'class'       => true,
		'aria-hidden' => true,
	),
);
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?> data-active="<?php echo esc_attr( $active ); ?>" data-anim="<?php echo esc_attr( $anim ); ?>" data-duration="<?php echo esc_attr( (string) $duration ); ?>">
	<div class="shapeblock-iso-filters" role="group" aria-label="<?php esc_attr_e( 'Filter', 'shapeblock' ); ?>">
		<?php if ( $show_all ) : ?>
			<button type="button" class="shapeblock-iso-filter<?php echo 'all' === $active ? ' is-active' : ''; ?>" data-filter="all" aria-pressed="<?php echo 'all' === $active ? 'true' : 'false'; ?>"><?php echo esc_html( $all_label ); ?></button>
		<?php endif; ?>
		<?php foreach ( $categories as $ci => $cat ) : ?>
			<?php
			$key  = 'c' . (int) $ci;
			$name = isset( $cat['name'] ) && '' !== trim( (string) $cat['name'] ) ? (string) $cat['name'] : sprintf(
				/* translators: %d: category number. */
				__( 'Category %d', 'shapeblock' ),
				$ci + 1
			);
			?>
			<button type="button" class="shapeblock-iso-filter<?php echo $key === $active ? ' is-active' : ''; ?>" data-filter="<?php echo esc_attr( $key ); ?>" aria-pressed="<?php echo $key === $active ? 'true' : 'false'; ?>"><?php echo esc_html( $name ); ?></button>
		<?php endforeach; ?>
	</div>

	<div class="shapeblock-iso-grid">
		<?php foreach ( $categories as $ci => $cat ) : ?>
			<?php
			$key   = 'c' . (int) $ci;
			$items = isset( $cat['items'] ) && is_array( $cat['items'] ) ? $cat['items'] : [];
			foreach ( $items as $item ) :
				$icon     = isset( $item['icon'] ) ? (string) $item['icon'] : '';
				$ttl      = isset( $item['title'] ) ? (string) $item['title'] : '';
				$dsc      = isset( $item['desc'] ) ? (string) $item['desc'] : '';
				$visible  = ( 'all' === $active || $key === $active );
				$icon_html = ( $show_icon && '' !== $icon && 'none' !== $icon ) ? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : '';
				?>
				<div class="shapeblock-iso-item" data-cat="<?php echo esc_attr( $key ); ?>"<?php echo $visible ? '' : ' hidden'; ?>>
					<div class="shapeblock-iso-card">
						<?php if ( $icon_html ) : ?>
							<div class="shapeblock-iso-icon"><?php echo wp_kses( $icon_html, $icon_allowed_html ); ?></div>
						<?php endif; ?>
						<div class="shapeblock-iso-text">
							<?php if ( '' !== $ttl ) : ?>
								<?php printf( '<%1$s class="shapeblock-iso-title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses_post( $ttl ) ); ?>
							<?php endif; ?>
							<?php if ( '' !== $dsc ) : ?>
								<p class="shapeblock-iso-desc"><?php echo wp_kses( nl2br( $dsc ), \ShapeBlock\Frontend\Helper::inline_allowed_html() ); ?></p>
							<?php endif; ?>
						</div>
					</div>
				</div>
			<?php endforeach; ?>
		<?php endforeach; ?>
	</div>
</div>
<?php } )( $attributes, $content, $block );
