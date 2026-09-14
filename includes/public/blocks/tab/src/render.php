<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Tabs block.
 *
 * Mirrors the markup of the Elementor "Tabs" widget
 * (easy-elements/widgets/tab). Element classes use this plugin's "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-tab-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$tabs      = isset( $attributes['tabs'] ) && is_array( $attributes['tabs'] ) ? $attributes['tabs'] : [];
$allowed   = [ 'left', 'top', 'right' ];
$direction = isset( $attributes['layoutDirection'] ) && in_array( $attributes['layoutDirection'], $allowed, true ) ? $attributes['layoutDirection'] : 'top';
$icon_pos  = isset( $attributes['iconPosition'] ) && in_array( $attributes['iconPosition'], $allowed, true ) ? $attributes['iconPosition'] : 'left';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-tab-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-tab-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( empty( $tabs ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add tab items.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-tab-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-tab-style';

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

// ---- Tab title (li) normal --------------------------------------------------
$title_li = [];
if ( ! empty( $attributes['titleBgColor'] ) ) $title_li['background-color'] = $attributes['titleBgColor'];
$title_li = array_merge( $title_li, $dims( $attributes['titleBorderRadius'] ?? [], 'radius' ), $dims( $attributes['titlePadding'] ?? [], 'padding' ), $dims( $attributes['titleMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['titleBorder'] ) ) $title_li = array_merge( $title_li, $H::border_to_css_props( $attributes['titleBorder'] ) );

// Tab title text.
$title_text = $typo( $attributes['titleTypography'] ?? [] );
if ( ! empty( $attributes['titleColor'] ) ) $title_text['color'] = $attributes['titleColor'];

// Icon / icon box.
$icon_color = [];
if ( ! empty( $attributes['tabIconColor'] ) ) { $icon_color['color'] = $attributes['tabIconColor']; $icon_color['fill'] = $attributes['tabIconColor']; }
$icon_box = [];
if ( ! empty( $attributes['tabIconBgColor'] ) ) $icon_box['background-color'] = $attributes['tabIconBgColor'];

// Active / hover states.
$title_li_active = [];
if ( ! empty( $attributes['titleActiveBgColor'] ) ) $title_li_active['background-color'] = $attributes['titleActiveBgColor'];
if ( ! empty( $attributes['titleActiveBorderColor'] ) ) $title_li_active['border-color'] = $attributes['titleActiveBorderColor'];
$title_text_active = [];
if ( ! empty( $attributes['titleActiveColor'] ) ) $title_text_active['color'] = $attributes['titleActiveColor'];

// ---- Nav (titles ul) bottom border + spacing (top layout) -------------------
$nav = [];
if ( '' !== $u( 'titleBottomSpacing' ) ) $nav['padding'] = '0 0 ' . $u( 'titleBottomSpacing' );
if ( ! empty( $attributes['navBorder'] ) ) $nav = array_merge( $nav, $H::border_to_css_props( $attributes['navBorder'] ) );

// ---- Content area -----------------------------------------------------------
$content = [];
if ( ! empty( $attributes['contentBgColor'] ) ) $content['background-color'] = $attributes['contentBgColor'];
$content = array_merge( $content, $dims( $attributes['contentBorderRadius'] ?? [], 'radius' ), $dims( $attributes['contentPadding'] ?? [], 'padding' ), $dims( $attributes['contentMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['contentBorder'] ) ) $content = array_merge( $content, $H::border_to_css_props( $attributes['contentBorder'] ) );

$contents_align = [];
if ( ! empty( $attributes['descriptionAlignment'] ) ) $contents_align['text-align'] = $attributes['descriptionAlignment'];

// ---- Content title ----------------------------------------------------------
$content_title = $typo( $attributes['contentTitleTypography'] ?? [] );
if ( ! empty( $attributes['contentTitleColor'] ) ) $content_title['color'] = $attributes['contentTitleColor'];
$content_title = array_merge( $content_title, $dims( $attributes['contentTitleMargin'] ?? [], 'margin' ) );

// ---- Description ------------------------------------------------------------
$desc = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc['color'] = $attributes['descColor'];
$desc_wrap = $dims( $attributes['descMargin'] ?? [], 'margin' );

// ---- Button -----------------------------------------------------------------
$btn = $typo( $attributes['btnTypography'] ?? [] );
if ( ! empty( $attributes['btnColor'] ) ) $btn['color'] = $attributes['btnColor'];
if ( ! empty( $attributes['btnBgColor'] ) ) $btn['background-color'] = $attributes['btnBgColor'];
$btn = array_merge( $btn, $dims( $attributes['btnBorderRadius'] ?? [], 'radius' ), $dims( $attributes['btnPadding'] ?? [], 'padding' ), $dims( $attributes['btnMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['btnBorder'] ) ) $btn = array_merge( $btn, $H::border_to_css_props( $attributes['btnBorder'] ) );

$btn_hover = [];
if ( ! empty( $attributes['btnHoverColor'] ) ) $btn_hover['color'] = $attributes['btnHoverColor'];
if ( ! empty( $attributes['btnHoverBgColor'] ) ) $btn_hover['background-color'] = $attributes['btnHoverBgColor'];
if ( ! empty( $attributes['btnHoverBorderColor'] ) ) $btn_hover['border-color'] = $attributes['btnHoverBorderColor'];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically. Only LAYOUT controls (typography,
// padding/margin, bottom spacing and description alignment) are responsive.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	// Tab title text (typography).
	$title_text = $typo( $attributes[ 'titleTypography' . $suffix ] ?? [] );

	// Tab title (li) padding + margin.
	$title_li = array_merge(
		$dims( $attributes[ 'titlePadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'titleMargin' . $suffix ] ?? [], 'margin' )
	);

	// Nav bottom spacing (top layout).
	$nav = [];
	if ( isset( $attributes[ 'titleBottomSpacing' . $suffix ] ) && '' !== $attributes[ 'titleBottomSpacing' . $suffix ] ) {
		$nav['padding'] = '0 0 ' . $H::ensure_unit( $attributes[ 'titleBottomSpacing' . $suffix ] );
	}

	// Content area padding + margin.
	$content = array_merge(
		$dims( $attributes[ 'contentPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'contentMargin' . $suffix ] ?? [], 'margin' )
	);

	// Description alignment.
	$contents_align = [];
	if ( ! empty( $attributes[ 'descriptionAlignment' . $suffix ] ) ) $contents_align['text-align'] = $attributes[ 'descriptionAlignment' . $suffix ];

	// Content title (typography + margin).
	$content_title = array_merge(
		$typo( $attributes[ 'contentTitleTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'contentTitleMargin' . $suffix ] ?? [], 'margin' )
	);

	// Description (typography + margin).
	$desc = array_merge(
		$typo( $attributes[ 'descTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'descMargin' . $suffix ] ?? [], 'margin' )
	);

	// Button (typography + padding + margin).
	$btn = array_merge(
		$typo( $attributes[ 'btnTypography' . $suffix ] ?? [] ),
		$dims( $attributes[ 'btnPadding' . $suffix ] ?? [], 'padding' ),
		$dims( $attributes[ 'btnMargin' . $suffix ] ?? [], 'margin' )
	);

	return [
		'.shapeblock-tab-titles li'                                            => $title_li,
		'.shapeblock-tab-title-text'                                           => $title_text,
		'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles' => $nav,
		'.shapeblock-tab-content'                                              => $content,
		'.shapeblock-tab-contents'                                             => $contents_align,
		'.shapeblock-content-title'                                            => $content_title,
		'.shapeblock-content-description'                                      => $desc,
		'.shapeblock-read-more'                                                => $btn,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [
	'.shapeblock-tab-titles li',
	'.shapeblock-tab-title-text',
	'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles',
	'.shapeblock-tab-content',
	'.shapeblock-tab-contents',
	'.shapeblock-content-title',
	'.shapeblock-content-description',
	'.shapeblock-read-more',
] as $sub_sel ) {
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
	'.shapeblock-tab-titles li'                                        => $H::get_inline_styles( $title_li ),
	'.shapeblock-tab-title-text'                                       => $H::get_inline_styles( $title_text ),
	'.shapeblock-tab-titles i, ' . $selector . ' .shapeblock-tab-titles svg' => $H::get_inline_styles( $icon_color ),
	'.shapeblock-tab-image, ' . $selector . ' .shapeblock-tab-icon'         => $H::get_inline_styles( $icon_box ),
	'.shapeblock-tab-titles li.active, ' . $selector . ' .shapeblock-tab-titles li:hover' => $H::get_inline_styles( $title_li_active ),
	'.shapeblock-tab-titles li.active .shapeblock-tab-title-text, ' . $selector . ' .shapeblock-tab-titles li:hover .shapeblock-tab-title-text' => $H::get_inline_styles( $title_text_active ),
	'.shapeblock-tabs-wrapper[data-tab-direction="top"] .shapeblock-tab-titles' => $H::get_inline_styles( $nav ),
	'.shapeblock-tab-content'                                          => $H::get_inline_styles( $content ),
	'.shapeblock-tab-contents'                                         => $H::get_inline_styles( $contents_align ),
	'.shapeblock-content-title'                                        => $H::get_inline_styles( $content_title ),
	'.shapeblock-content-description'                                  => $H::get_inline_styles( array_merge( $desc, $desc_wrap ) ),
	'.shapeblock-read-more'                                            => $H::get_inline_styles( $btn ),
	'.shapeblock-read-more:hover'                                      => $H::get_inline_styles( $btn_hover ),
] );

// Default icon when an item has type "icon" but no custom icon selected.
$default_icon = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-6.7-4.3-9.3-8.5C1 9.6 2 6 5.3 5.2 7.3 4.7 9 5.8 12 8.6c3-2.8 4.7-3.9 6.7-3.4C22 6 23 9.6 21.3 12.5 18.7 16.7 12 21 12 21z"/></svg>';
// Button chevron icon.
$chevron = '<svg class="shapeblock-read-more-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-tabs-wrapper" data-tab-direction="<?php echo esc_attr( $direction ); ?>" data-icon-position="<?php echo esc_attr( $icon_pos ); ?>">
		<ul class="shapeblock-tab-titles">
			<?php foreach ( $tabs as $index => $item ) : ?>
				<?php
				$type     = isset( $item['iconType'] ) ? $item['iconType'] : 'icon';
				$icon     = isset( $item['icon'] ) ? $item['icon'] : '';
				$img      = isset( $item['image'] ) && is_array( $item['image'] ) ? $item['image'] : [];
				$tab_title = isset( $item['tabTitle'] ) ? $item['tabTitle'] : '';
				$active    = 0 === $index ? ' active' : '';
				?>
				<li class="shapeblock-tab-nav-item<?php echo esc_attr( $active ); ?>" data-tab="<?php echo esc_attr( $unique_id . '-tab-' . $index ); ?>">
					<?php
					if ( 'icon' === $type ) {
						echo '<span class="shapeblock-tab-icon">';
						echo ( ! empty( $icon ) && 'none' !== $icon ) ? '<i class="shapeblock-icon ' . esc_attr( $icon ) . '" aria-hidden="true"></i>' : $default_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo '</span>';
					} elseif ( 'image' === $type && ! empty( $img['url'] ) ) {
						echo '<span class="shapeblock-tab-image"><img src="' . esc_url( $img['url'] ) . '" alt="' . esc_attr( $img['alt'] ?? $tab_title ) . '"></span>';
					}
					?>
					<span class="shapeblock-tab-title-text"><?php echo esc_html( $tab_title ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
		<div class="shapeblock-tab-contents">
			<?php foreach ( $tabs as $index => $item ) : ?>
				<?php
				$content_title_txt = isset( $item['contentTitle'] ) ? $item['contentTitle'] : '';
				$description       = isset( $item['contentDescription'] ) ? $item['contentDescription'] : '';
				$btn_text          = isset( $item['readMoreText'] ) ? $item['readMoreText'] : '';
				$btn_url           = isset( $item['readMoreUrl'] ) ? $item['readMoreUrl'] : '';
				$btn_target        = ! empty( $item['readMoreNewTab'] ) ? '_blank' : '_self';
				$active            = 0 === $index ? ' active' : '';
				?>
				<div class="shapeblock-tab-content<?php echo esc_attr( $active ); ?>" id="<?php echo esc_attr( $unique_id . '-tab-' . $index ); ?>">
					<?php if ( '' !== $content_title_txt ) : ?>
						<h4 class="shapeblock-content-title"><?php echo esc_html( $content_title_txt ); ?></h4>
					<?php endif; ?>
					<?php if ( '' !== $description ) : ?>
						<div class="shapeblock-content-description"><?php echo wp_kses_post( wpautop( $description ) ); ?></div>
					<?php endif; ?>
					<?php if ( '' !== $btn_text && '' !== $btn_url ) : ?>
						<a class="shapeblock-read-more" href="<?php echo esc_url( $btn_url ); ?>" target="<?php echo esc_attr( $btn_target ); ?>">
							<?php echo esc_html( $btn_text ); ?>
							<?php echo $chevron; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static inline SVG. ?>
						</a>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
