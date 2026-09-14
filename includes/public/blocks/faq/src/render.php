<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the FAQ Accordion block.
 *
 * Mirrors the markup produced by the Elementor "Accordion" widget
 * (easy-elements/widgets/faq/faq.php) so the shared CSS/JS apply identically
 * on the front end. Element classes use this plugin's own "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$faq_items = isset( $attributes['faqItems'] ) && is_array( $attributes['faqItems'] ) ? $attributes['faqItems'] : [];

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-faq-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$allowed_tags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ];
$title_tag    = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed_tags, true ) ? $attributes['titleTag'] : 'h4';

$open_all      = ! empty( $attributes['openAll'] );
$enable_sticky = $open_all && ! empty( $attributes['enableSticky'] );

$icon_open     = isset( $attributes['iconOpen'] ) ? $attributes['iconOpen'] : '';
$icon_close    = isset( $attributes['iconClose'] ) ? $attributes['iconClose'] : '';
$icon_position = isset( $attributes['iconPosition'] ) ? $attributes['iconPosition'] : 'row';

$open_all_class = $open_all ? 'shapeblock-faq-open-all' : '';
$sticky_class   = $enable_sticky ? 'shapeblock-faq-sticky' : '';

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-faq-block-wrap ' . $unique_id,
) );

if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-faq-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Empty state.
// ---------------------------------------------------------------------------
if ( empty( $faq_items ) ) {
	?>
	<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
		<p><?php esc_html_e( 'Please add FAQ items to display the accordion.', 'shapeblock' ); ?></p>
	</div>
	<?php
	return;
}

// ---------------------------------------------------------------------------
// Dynamic / inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-faq-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-faq-style';

$H = '\ShapeBlock\Frontend\Helper';

/** Helper: dimensions object -> CSS map for a given property. */
$dims = function ( $obj, $prop ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	$map = [
		'top'    => 'padding' === $prop ? 'padding-top' : ( 'margin' === $prop ? 'margin-top' : 'border-top-left-radius' ),
		'right'  => 'padding' === $prop ? 'padding-right' : ( 'margin' === $prop ? 'margin-right' : 'border-top-right-radius' ),
		'bottom' => 'padding' === $prop ? 'padding-bottom' : ( 'margin' === $prop ? 'margin-bottom' : 'border-bottom-right-radius' ),
		'left'   => 'padding' === $prop ? 'padding-left' : ( 'margin' === $prop ? 'margin-left' : 'border-bottom-left-radius' ),
	];
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) {
			$out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
		}
	}
	return $out;
};

// ---- Accordion (gap) + question layout (icon position) --------------------
$accordion_styles = [];
if ( ! empty( $attributes['itemsGap'] ) ) {
	$accordion_styles['gap'] = $H::ensure_unit( $attributes['itemsGap'] );
}

// Responsive (Tablet / Mobile) accordion gap. Desktop above is unchanged; these
// keys are added only when the matching per-device attribute is set.
$accordion_responsive = [ 'desktop' => $accordion_styles ];
if ( ! empty( $attributes['itemsGapTablet'] ) ) {
	$accordion_responsive['tablet'] = [ 'gap' => $H::ensure_unit( $attributes['itemsGapTablet'] ) ];
}
if ( ! empty( $attributes['itemsGapMobile'] ) ) {
	$accordion_responsive['mobile'] = [ 'gap' => $H::ensure_unit( $attributes['itemsGapMobile'] ) ];
}

$question_layout_styles = [
	'flex-direction'  => in_array( $icon_position, [ 'row', 'row-reverse' ], true ) ? $icon_position : 'row',
	'justify-content' => 'left',
];

// ---- Item: normal / hover / active ----------------------------------------
$item_styles = [];
if ( ! empty( $attributes['itemBackgroundColor'] ) ) {
	$item_styles['background'] = $attributes['itemBackgroundColor'];
}
$item_styles = array_merge( $item_styles, $dims( $attributes['itemBorderRadius'] ?? [], 'radius' ) );
$item_styles = array_merge( $item_styles, $dims( $attributes['itemPadding'] ?? [], 'padding' ) );
if ( ! empty( $attributes['itemBorder'] ) ) {
	$item_styles = array_merge( $item_styles, $H::border_to_css_props( $attributes['itemBorder'] ) );
}
if ( ! empty( $attributes['itemBoxShadow'] ) ) {
	$item_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['itemBoxShadow'] );
}

$item_hover_styles = [];
if ( ! empty( $attributes['itemBackgroundColorHover'] ) ) {
	$item_hover_styles['background'] = $attributes['itemBackgroundColorHover'];
}
if ( ! empty( $attributes['itemBorderHover'] ) ) {
	$item_hover_styles = array_merge( $item_hover_styles, $H::border_to_css_props( $attributes['itemBorderHover'] ) );
}
if ( ! empty( $attributes['itemBoxShadowHover'] ) ) {
	$item_hover_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['itemBoxShadowHover'] );
}

$item_active_styles = [];
if ( ! empty( $attributes['itemBackgroundColorActive'] ) ) {
	$item_active_styles['background'] = $attributes['itemBackgroundColorActive'];
}
if ( ! empty( $attributes['itemBorderActive'] ) ) {
	$item_active_styles = array_merge( $item_active_styles, $H::border_to_css_props( $attributes['itemBorderActive'] ) );
}
if ( ! empty( $attributes['itemBoxShadowActive'] ) ) {
	$item_active_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['itemBoxShadowActive'] );
}

// ---- Title (text) responsive + states -------------------------------------
$title_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];
$H::add_responsive_vars( $attributes, $title_responsive, 'titleTypography', '', [
	'fontFamily'    => 'font-family',
	'fontSize'      => 'font-size',
	'fontWeight'    => 'font-weight',
	'fontStyle'     => 'font-style',
	'lineHeight'    => 'line-height',
	'textTransform' => 'text-transform',
	'letterSpacing' => 'letter-spacing',
	'textDecoration' => 'text-decoration',
], true );
if ( ! empty( $attributes['titleColor'] ) ) {
	$title_responsive['desktop']['color'] = $attributes['titleColor'];
}

$title_hover_styles = [];
if ( ! empty( $attributes['titleColorHover'] ) ) {
	$title_hover_styles['color'] = $attributes['titleColorHover'];
}
$title_active_styles = [];
if ( ! empty( $attributes['titleColorActive'] ) ) {
	$title_active_styles['color'] = $attributes['titleColorActive'];
}

// ---- Question (bar) normal / hover / active -------------------------------
$question_styles = [];
if ( ! empty( $attributes['titleBgColor'] ) ) {
	$question_styles['background-color'] = $attributes['titleBgColor'];
}
$question_styles = array_merge( $question_styles, $dims( $attributes['questionPadding'] ?? [], 'padding' ) );
$question_styles = array_merge( $question_styles, $dims( $attributes['questionBorderRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['titleBorder'] ) ) {
	$question_styles = array_merge( $question_styles, $H::border_to_css_props( $attributes['titleBorder'] ) );
}
if ( ! empty( $attributes['titleBoxShadow'] ) ) {
	$question_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['titleBoxShadow'] );
}
$question_styles = array_merge( $question_layout_styles, $question_styles );

$question_hover_styles = [];
if ( ! empty( $attributes['titleBgColorHover'] ) ) {
	$question_hover_styles['background-color'] = $attributes['titleBgColorHover'];
}
if ( ! empty( $attributes['titleBorderColorHover'] ) ) {
	$question_hover_styles['border-color'] = $attributes['titleBorderColorHover'];
}
if ( ! empty( $attributes['titleBoxShadowHover'] ) ) {
	$question_hover_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['titleBoxShadowHover'] );
}

$question_active_styles = [];
if ( ! empty( $attributes['titleBgColorActive'] ) ) {
	$question_active_styles['background-color'] = $attributes['titleBgColorActive'];
}
if ( ! empty( $attributes['titleBorderColorActive'] ) ) {
	$question_active_styles['border-color'] = $attributes['titleBorderColorActive'];
}
if ( ! empty( $attributes['titleBoxShadowActive'] ) ) {
	$question_active_styles['box-shadow'] = $H::box_shadow_to_css( $attributes['titleBoxShadowActive'] );
}

// ---- Answer (description) responsive + states -----------------------------
$answer_responsive = [ 'desktop' => [], 'tablet' => [], 'mobile' => [] ];
$H::add_responsive_vars( $attributes, $answer_responsive, 'descriptionTypography', '', [
	'fontFamily'    => 'font-family',
	'fontSize'      => 'font-size',
	'fontWeight'    => 'font-weight',
	'fontStyle'     => 'font-style',
	'lineHeight'    => 'line-height',
	'textTransform' => 'text-transform',
	'letterSpacing' => 'letter-spacing',
	'textDecoration' => 'text-decoration',
], true );
if ( ! empty( $attributes['descriptionColor'] ) ) {
	$answer_responsive['desktop']['color'] = $attributes['descriptionColor'];
}
if ( ! empty( $attributes['descriptionBgColor'] ) ) {
	$answer_responsive['desktop']['background-color'] = $attributes['descriptionBgColor'];
}
$answer_responsive['desktop'] = array_merge( $answer_responsive['desktop'], $dims( $attributes['answerPadding'] ?? [], 'padding' ) );
$answer_responsive['tablet']  = array_merge( $answer_responsive['tablet'], $dims( $attributes['answerPaddingTablet'] ?? [], 'padding' ) );
$answer_responsive['mobile']  = array_merge( $answer_responsive['mobile'], $dims( $attributes['answerPaddingMobile'] ?? [], 'padding' ) );
$answer_responsive['desktop'] = array_merge( $answer_responsive['desktop'], $dims( $attributes['descriptionBorderRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['descriptionBorder'] ) ) {
	$answer_responsive['desktop'] = array_merge( $answer_responsive['desktop'], $H::border_to_css_props( $attributes['descriptionBorder'] ) );
}

$answer_hover_styles = [];
if ( ! empty( $attributes['descriptionColorHover'] ) ) {
	$answer_hover_styles['color'] = $attributes['descriptionColorHover'];
}
if ( ! empty( $attributes['descriptionBgColorHover'] ) ) {
	$answer_hover_styles['background-color'] = $attributes['descriptionBgColorHover'];
}
if ( ! empty( $attributes['descriptionBorderColorHover'] ) ) {
	$answer_hover_styles['border-color'] = $attributes['descriptionBorderColorHover'];
}

$answer_active_styles = [];
if ( ! empty( $attributes['descriptionColorActive'] ) ) {
	$answer_active_styles['color'] = $attributes['descriptionColorActive'];
}
if ( ! empty( $attributes['descriptionBgColorActive'] ) ) {
	$answer_active_styles['background-color'] = $attributes['descriptionBgColorActive'];
}
if ( ! empty( $attributes['descriptionBorderColorActive'] ) ) {
	$answer_active_styles['border-color'] = $attributes['descriptionBorderColorActive'];
}

// ---- Icon: normal / hover / active ----------------------------------------
$icon_styles = [];
if ( ! empty( $attributes['iconColor'] ) ) {
	$icon_styles['color'] = $attributes['iconColor'];
	$icon_styles['fill']  = $attributes['iconColor'];
}
if ( ! empty( $attributes['iconBgColor'] ) ) {
	$icon_styles['background'] = $attributes['iconBgColor'];
}
if ( ! empty( $attributes['iconSize'] ) ) {
	$icon_styles['font-size'] = $H::ensure_unit( $attributes['iconSize'] );
}
if ( ! empty( $attributes['iconBoxSize'] ) ) {
	$box = $H::ensure_unit( $attributes['iconBoxSize'] );
	$icon_styles['min-width']   = $box;
	$icon_styles['min-height']  = $box;
	$icon_styles['width']       = $box;
	$icon_styles['height']      = $box;
	$icon_styles['line-height'] = $box;
}
$icon_styles = array_merge( $icon_styles, $dims( $attributes['iconBorderRadius'] ?? [], 'radius' ) );
if ( ! empty( $attributes['iconBorder'] ) ) {
	$icon_styles = array_merge( $icon_styles, $H::border_to_css_props( $attributes['iconBorder'] ) );
}
if ( isset( $attributes['iconPositionY'] ) && '' !== $attributes['iconPositionY'] ) {
	$icon_styles['transform'] = 'translateY(' . $H::ensure_unit( $attributes['iconPositionY'] ) . ')';
}

$icon_hover_styles = [];
if ( ! empty( $attributes['iconColorHover'] ) ) {
	$icon_hover_styles['color'] = $attributes['iconColorHover'];
	$icon_hover_styles['fill']  = $attributes['iconColorHover'];
}
if ( ! empty( $attributes['iconBgColorHover'] ) ) {
	$icon_hover_styles['background'] = $attributes['iconBgColorHover'];
}
if ( ! empty( $attributes['iconBorderColorHover'] ) ) {
	$icon_hover_styles['border-color'] = $attributes['iconBorderColorHover'];
}

$icon_active_styles = [];
if ( ! empty( $attributes['iconColorActive'] ) ) {
	$icon_active_styles['color'] = $attributes['iconColorActive'];
	$icon_active_styles['fill']  = $attributes['iconColorActive'];
}
if ( ! empty( $attributes['iconBgColorActive'] ) ) {
	$icon_active_styles['background'] = $attributes['iconBgColorActive'];
}
if ( ! empty( $attributes['iconBorderColorActive'] ) ) {
	$icon_active_styles['border-color'] = $attributes['iconBorderColorActive'];
}
if ( isset( $attributes['iconPositionYActive'] ) && '' !== $attributes['iconPositionYActive'] ) {
	$icon_active_styles['transform'] = 'translateY(' . $H::ensure_unit( $attributes['iconPositionYActive'] ) . ')';
}

// ---- Assemble responsive + state CSS --------------------------------------
$full_responsive_css  = $H::generate_responsive_css( $selector . ' .shapeblock-faq-accordion', $accordion_responsive );
$full_responsive_css .= $H::generate_responsive_css( $selector . ' .shapeblock-faq-title', $title_responsive );
$full_responsive_css .= $H::generate_responsive_css( $selector . ' .shapeblock-faq-answer', $answer_responsive );

// Responsive (Tablet / Mobile) padding for the item + question. Desktop padding
// stays in the inline sub-styles below (unchanged); only per-device overrides
// are emitted here, and only when the matching attribute is set.
$item_padding_responsive = [];
$item_padding_tablet     = $dims( $attributes['itemPaddingTablet'] ?? [], 'padding' );
$item_padding_mobile     = $dims( $attributes['itemPaddingMobile'] ?? [], 'padding' );
if ( ! empty( $item_padding_tablet ) ) {
	$item_padding_responsive['tablet'] = $item_padding_tablet;
}
if ( ! empty( $item_padding_mobile ) ) {
	$item_padding_responsive['mobile'] = $item_padding_mobile;
}
if ( ! empty( $item_padding_responsive ) ) {
	$full_responsive_css .= $H::generate_responsive_css( $selector . ' .shapeblock-faq-item', $item_padding_responsive );
}

$question_padding_responsive = [];
$question_padding_tablet     = $dims( $attributes['questionPaddingTablet'] ?? [], 'padding' );
$question_padding_mobile     = $dims( $attributes['questionPaddingMobile'] ?? [], 'padding' );
if ( ! empty( $question_padding_tablet ) ) {
	$question_padding_responsive['tablet'] = $question_padding_tablet;
}
if ( ! empty( $question_padding_mobile ) ) {
	$question_padding_responsive['mobile'] = $question_padding_mobile;
}
if ( ! empty( $question_padding_responsive ) ) {
	$full_responsive_css .= $H::generate_responsive_css( $selector . ' .shapeblock-faq-question', $question_padding_responsive );
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $full_responsive_css, [
	'.shapeblock-faq-item'                                  => $H::get_inline_styles( $item_styles ),
	'.shapeblock-faq-item:hover'                            => $H::get_inline_styles( $item_hover_styles ),
	'.shapeblock-faq-item.active'                           => $H::get_inline_styles( $item_active_styles ),
	'.shapeblock-faq-question'                              => $H::get_inline_styles( $question_styles ),
	'.shapeblock-faq-item:hover .shapeblock-faq-question'        => $H::get_inline_styles( $question_hover_styles ),
	'.shapeblock-faq-item.active .shapeblock-faq-question'       => $H::get_inline_styles( $question_active_styles ),
	'.shapeblock-faq-item:hover .shapeblock-faq-title'           => $H::get_inline_styles( $title_hover_styles ),
	'.shapeblock-faq-item.active .shapeblock-faq-title'          => $H::get_inline_styles( $title_active_styles ),
	'.shapeblock-faq-item:hover .shapeblock-faq-answer'          => $H::get_inline_styles( $answer_hover_styles ),
	'.shapeblock-faq-item.active .shapeblock-faq-answer'         => $H::get_inline_styles( $answer_active_styles ),
	'.shapeblock-faq-icon'                                  => $H::get_inline_styles( $icon_styles ),
	'.shapeblock-faq-item:hover .shapeblock-faq-icon'            => $H::get_inline_styles( $icon_hover_styles ),
	'.shapeblock-faq-item.active .shapeblock-faq-icon'           => $H::get_inline_styles( $icon_active_styles ),
] );

// Default icons (used when no custom icon is selected). Plus = collapsed, minus = expanded.
$default_icon_close = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>'; // plus
$default_icon_open  = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 11h14v2H5z"/></svg>'; // minus

?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-faq-accordion <?php echo esc_attr( $open_all_class ); ?> <?php echo esc_attr( $sticky_class ); ?>">
		<?php
		foreach ( $faq_items as $item ) :
			$title       = isset( $item['title'] ) ? $item['title'] : '';
			$description = isset( $item['description'] ) ? $item['description'] : '';
			$is_active   = ! empty( $item['active'] ) ? 'active' : '';
			?>
			<div class="shapeblock-faq-item <?php echo esc_attr( $is_active ); ?>">
				<div class="shapeblock-faq-question">
					<<?php echo esc_html( $title_tag ); ?> class="shapeblock-faq-title" tabindex="0">
						<?php echo wp_kses_post( $title ); ?>
					</<?php echo esc_html( $title_tag ); ?>>
					<span class="shapeblock-faq-icon shapeblock-faq-icon-open">
						<?php
						if ( ! empty( $icon_open ) && 'none' !== $icon_open ) {
							echo '<i class="shapeblock-icon ' . esc_attr( $icon_open ) . '" aria-hidden="true"></i>';
						} else {
							echo $default_icon_open; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static inline SVG.
						}
						?>
					</span>
					<span class="shapeblock-faq-icon shapeblock-faq-icon-close">
						<?php
						if ( ! empty( $icon_close ) && 'none' !== $icon_close ) {
							echo '<i class="shapeblock-icon ' . esc_attr( $icon_close ) . '" aria-hidden="true"></i>';
						} else {
							echo $default_icon_close; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static inline SVG.
						}
						?>
					</span>
				</div>
				<div class="shapeblock-faq-answer">
					<?php echo wp_kses_post( $description ); ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>
