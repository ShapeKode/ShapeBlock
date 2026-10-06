<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Offcanvas block.
 *
 * Element classes use the "shapeblock-" prefix.
 * The panel content is a selected "shapeblock-template" post rendered through the
 * the_content filter (so inner blocks/shortcodes run).
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id  = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : 'shapeblock-oc-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$panel_id   = $unique_id . '-panel';

$layout     = ( isset( $attributes['offcanvasLayout'] ) && 'modern' === $attributes['offcanvasLayout'] ) ? 'modern' : 'classic';
$menu_text  = isset( $attributes['menuText'] ) ? $attributes['menuText'] : '';
$btn_icon   = isset( $attributes['btnIcon'] ) ? $attributes['btnIcon'] : '';
$close_icon = isset( $attributes['closeIcon'] ) ? $attributes['closeIcon'] : '';
$position   = ( isset( $attributes['positionOffcanvas'] ) && 'shapeblock-offcanvas-left' === $attributes['positionOffcanvas'] ) ? 'shapeblock-offcanvas-left' : 'shapeblock-offcanvas-right';
$blur       = ! empty( $attributes['needBlur'] ) ? 'shapeblock-blur-effect' : '';
$template   = ! empty( $attributes['contentTemplate'] ) ? absint( $attributes['contentTemplate'] ) : 0;

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-offcanvas-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-offcanvas-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-offcanvas-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-offcanvas-style';

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
$dims = function ( $obj ) use ( $H ) {
	$out = [];
	if ( empty( $obj ) || ! is_array( $obj ) ) return $out;
	$map = [ 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' ];
	foreach ( $map as $side => $css_prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) $out[ $css_prop ] = $H::ensure_unit( $obj[ $side ] );
	}
	return $out;
};
$u = function ( $key ) use ( $attributes, $H ) {
	return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
};

// Opener text.
$opener_text = $typo( $attributes['openerTextTypography'] ?? [] );
if ( ! empty( $attributes['openerTextColor'] ) ) $opener_text['color'] = $attributes['openerTextColor'];

// Opener icon.
$opener_icon_i   = [];
$opener_icon_svg = [];
$opener_menu     = [];
if ( ! empty( $attributes['openerIconColor'] ) ) {
	$opener_icon_i['color']  = $attributes['openerIconColor'];
	$opener_icon_svg['fill'] = $attributes['openerIconColor'];
	$opener_menu['border-bottom-color'] = $attributes['openerIconColor'];
}
if ( '' !== $u( 'openerIconSize' ) ) {
	$opener_icon_i['font-size'] = $u( 'openerIconSize' );
	$opener_icon_svg['width']   = $u( 'openerIconSize' );
	$opener_icon_svg['height']  = $u( 'openerIconSize' );
}
$opener_label_span = ! empty( $attributes['openerHamburgerColor'] ) ? [ 'background' => $attributes['openerHamburgerColor'] ] : [];
$opener_label      = ( '' !== $u( 'openerIconSizeModern' ) ) ? [ 'width' => $u( 'openerIconSizeModern' ) ] : [];

// Close icon.
$close_classic = [];
if ( ! empty( $attributes['closingIconColor'] ) ) $close_classic['color'] = $attributes['closingIconColor'];
if ( '' !== $u( 'closingIconSize' ) ) $close_classic['font-size'] = $u( 'closingIconSize' );
$close_modern_span = ! empty( $attributes['closingIconModernColor'] ) ? [ 'background' => $attributes['closingIconModernColor'] ] : [];

// Panel.
$panel = [];
if ( ! empty( $attributes['offcanvasBg'] ) ) $panel['background'] = $attributes['offcanvasBg'];
$panel = array_merge( $panel, $dims( $attributes['offcanvasPadding'] ?? [] ) );
$panel_width = ( '' !== $u( 'offcanvasWidth' ) ) ? [ 'width' => $u( 'offcanvasWidth' ) ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H ) {
	$text = $typo( $attributes[ 'openerTextTypography' . $suffix ] ?? [] );

	$panel = $dims( $attributes[ 'offcanvasPadding' . $suffix ] ?? [] );

	$width = [];
	if ( isset( $attributes[ 'offcanvasWidth' . $suffix ] ) && '' !== $attributes[ 'offcanvasWidth' . $suffix ] ) {
		$width['width'] = $H::ensure_unit( $attributes[ 'offcanvasWidth' . $suffix ] );
	}

	return [
		'.shapeblock-offcanvas-toggle-text .shapeblock-icon-text' => $text,
		'.shapeblock-offcanvas'                              => $panel,
		'.shapeblock-offcanvas:not(.shapeblock-modern)'           => $width,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( [ '.shapeblock-offcanvas-toggle-text .shapeblock-icon-text', '.shapeblock-offcanvas', '.shapeblock-offcanvas:not(.shapeblock-modern)' ] as $sub_sel ) {
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
	'.shapeblock-offcanvas-toggle-text .shapeblock-icon-text' => $H::get_inline_styles( $opener_text ),
	'.shapeblock-offcanvas-toggle-text i'                => $H::get_inline_styles( $opener_icon_i ),
	'.shapeblock-offcanvas-toggle-text svg'              => $H::get_inline_styles( $opener_icon_svg ),
	'.shapeblock-icon-menu'                              => $H::get_inline_styles( $opener_menu ),
	'.shapeblock-offcanvas-toggle label span'            => $H::get_inline_styles( $opener_label_span ),
	'.shapeblock-offcanvas-toggle label'                 => $H::get_inline_styles( $opener_label ),
	'.shapeblock-offcanvas-close'                        => $H::get_inline_styles( $close_classic ),
	'.shapeblock-modern-close-toggle span'               => $H::get_inline_styles( $close_modern_span ),
	'.shapeblock-offcanvas'                              => $H::get_inline_styles( $panel ),
	'.shapeblock-offcanvas:not(.shapeblock-modern)'           => $H::get_inline_styles( $panel_width ),
] );

// ---------------------------------------------------------------------------
// Markup helpers.
// ---------------------------------------------------------------------------
$render_icon = function ( $val ) {
	return ( ! empty( $val ) && 'none' !== $val ) ? '<i class="shapeblock-icon ' . esc_attr( $val ) . '" aria-hidden="true"></i>' : '';
};
// The default close icon below is a hard-coded SVG constant with no user input.
// wp_kses() lowercases every attribute name, which turns the case-sensitive
// viewBox into viewbox -- the browser then ignores it and the icon loses its
// intrinsic size. It is written as literal markup at its output point instead of
// being passed through wp_kses(); $render_icon()'s output (icon-font <i>, esc_attr'd
// class) stays kses'd as before.
$icon_allowed_html = array(
	'i' => array(
		'class'       => true,
		'aria-hidden' => true,
	),
);

// Panel content from the selected template.
//
// IMPORTANT: do NOT run `apply_filters( 'the_content', ... )` here. Page builders
// hook into `the_content` and re-inject the *current* page's
// builder markup whenever it fires — so re-running it inside this block pulls the
// page's containers into the offcanvas panel. Instead we run the block / shortcode
// / paragraph transforms directly, which renders the template without triggering
// those builder hooks (and avoids infinite recursion if a template references this
// block).
$content_html = '';
if ( $template && $template !== get_queried_object_id() && empty( \ShapeBlock\Frontend\Helper::$rendering_templates[ $template ] ) ) {
	$tpl_post = get_post( $template );
	if ( $tpl_post && 'shapeblock-template' === $tpl_post->post_type && 'publish' === $tpl_post->post_status ) {
		\ShapeBlock\Frontend\Helper::$rendering_templates[ $template ] = true;
		$tpl_content  = do_blocks( $tpl_post->post_content );
		$tpl_content  = wptexturize( $tpl_content );
		$tpl_content  = convert_smilies( $tpl_content );
		$tpl_content  = wpautop( $tpl_content );
		$content_html = do_shortcode( $tpl_content );
		unset( \ShapeBlock\Frontend\Helper::$rendering_templates[ $template ] );
	}
}
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-offcanvas-wrapper <?php echo esc_attr( $layout ); ?>">
		<div class="shapeblock-offcanvas-toggle" data-target="#<?php echo esc_attr( $panel_id ); ?>" role="button" tabindex="0">
			<span class="shapeblock-offcanvas-toggle-text">
				<?php if ( '' !== $menu_text ) : ?>
					<em class="shapeblock-icon-text"><?php echo esc_html( $menu_text ); ?></em>
				<?php endif; ?>
				<?php if ( 'classic' === $layout ) : ?>
					<?php
					if ( '' !== $render_icon( $btn_icon ) ) {
						echo wp_kses( $render_icon( $btn_icon ), $icon_allowed_html );
					} else {
						echo '<span class="shapeblock-icon-menu-wrap"><em class="shapeblock-icon-menu"></em><em class="shapeblock-icon-menu"></em></span>';
					}
					?>
				<?php else : ?>
					<label><span></span><span></span><span></span></label>
				<?php endif; ?>
			</span>
		</div>

		<div class="shapeblock-offcanvas-overlay shapeblock-offcanvas-toggle" data-target="#<?php echo esc_attr( $panel_id ); ?>"></div>
		<div id="<?php echo esc_attr( $panel_id ); ?>" class="shapeblock-offcanvas <?php echo esc_attr( trim( $blur . ' ' . ( 'classic' === $layout ? $position : '' ) . ' ' . $layout ) ); ?>">
			<div class="shapeblock-offcanvas-panel">
				<?php if ( 'classic' === $layout ) : ?>
					<span class="shapeblock-offcanvas-close shapeblock-offcanvas-toggle" data-target="#<?php echo esc_attr( $panel_id ); ?>" role="button" tabindex="0">
						<?php if ( '' !== $render_icon( $close_icon ) ) : ?>
							<?php echo wp_kses( $render_icon( $close_icon ), $icon_allowed_html ); ?>
						<?php else : ?>
							<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"></path></svg>
						<?php endif; ?>
					</span>
				<?php else : ?>
					<span class="shapeblock-offcanvas-close shapeblock-offcanvas-toggle shapeblock-modern-close" data-target="#<?php echo esc_attr( $panel_id ); ?>" role="button" tabindex="0">
						<label class="shapeblock-modern-close-toggle"><span></span><span></span><span></span></label>
					</span>
				<?php endif; ?>
				<div class="shapeblock-offcanvas-content">
					<?php
					// Rendered template markup, escaped against the same allowlist the
					// Templates shortcode uses.
					echo wp_kses( $content_html, \ShapeBlock\Frontend\Helper::template_allowed_html() );
					?>
				</div>
			</div>
		</div>
	</div>
</div>
<?php } )( $attributes, $content, $block );
