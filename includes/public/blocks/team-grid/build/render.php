<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Team Member block.
 *
 * Mirrors the markup of the Elementor "Team Grid" widget
 * (easy-elements/widgets/team-grid) — 5 skins, social icons, contact info and
 * an optional popup. Element classes use this plugin's "shapeblock-" prefix.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id  = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-team-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
$popup_id   = $unique_id . '-popup';

$skin       = isset( $attributes['teamSkin'] ) ? $attributes['teamSkin'] : 'default';
$overlay4   = isset( $attributes['skin4HoverOverlay'] ) ? $attributes['skin4HoverOverlay'] : 'overlay1';
$image      = isset( $attributes['image'] ) && is_array( $attributes['image'] ) ? $attributes['image'] : [];
$img_url    = ! empty( $image['url'] ) ? $image['url'] : '';
$allowed    = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ];
$tag        = isset( $attributes['titleTag'] ) && in_array( $attributes['titleTag'], $allowed, true ) ? $attributes['titleTag'] : 'h4';
$name       = isset( $attributes['name'] ) ? $attributes['name'] : '';
$designation = isset( $attributes['designation'] ) ? $attributes['designation'] : '';
$details    = isset( $attributes['details'] ) ? $attributes['details'] : '';
$action     = isset( $attributes['actionType'] ) ? $attributes['actionType'] : 'link';
$link       = isset( $attributes['linkUrl'] ) ? $attributes['linkUrl'] : '';
$target     = ! empty( $attributes['linkTarget'] ) ? ' target="_blank"' : '';
$nofollow   = ! empty( $attributes['linkNofollow'] ) ? ' rel="nofollow"' : '';
$content_show = isset( $attributes['contentShow'] ) ? $attributes['contentShow'] : 'inside';
$show_social  = ! empty( $attributes['showSocialIcon'] );
$social_pos   = isset( $attributes['socialIconPosition'] ) ? $attributes['socialIconPosition'] : 'default';
$social_show  = isset( $attributes['socialIconShow'] ) ? $attributes['socialIconShow'] : 'dafault_show';
$social_hover_icon = isset( $attributes['socialHoverIcon'] ) ? $attributes['socialHoverIcon'] : '';
$social_links = isset( $attributes['socialLinks'] ) && is_array( $attributes['socialLinks'] ) ? $attributes['socialLinks'] : [];

$show_contact = ! empty( $attributes['showContactInfo'] );
$email      = isset( $attributes['teamEmail'] ) ? $attributes['teamEmail'] : '';
$phone      = isset( $attributes['teamPhone'] ) ? $attributes['teamPhone'] : '';

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-team-grid-block-wrap ' . $unique_id . ' shapeblock-team-wraps shapeblock-team-grid shapeblock-grid-layout ' . $skin,
) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-team-grid-block-wrap ' . esc_attr( $unique_id ) . ' shapeblock-team-wraps shapeblock-team-grid shapeblock-grid-layout ' . esc_attr( $skin ) . '"';
}

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-team-grid-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-team-grid-style';

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

// Team item.
$card = $bg( 'cardBgColor', 'cardBgGradient' );
$card = array_merge( $card, $dims( $attributes['itemPadding'] ?? [], 'padding' ), $dims( $attributes['itemBorderRadius'] ?? [], 'radius' ), $shadow( $attributes['teamBoxShadow'] ?? [] ) );
if ( ! empty( $attributes['teamBorder'] ) ) $card = array_merge( $card, $H::border_to_css_props( $attributes['teamBorder'] ) );
$card_hover = ! empty( $attributes['teamHoverBorderColor'] ) ? [ 'border-color' => $attributes['teamHoverBorderColor'] ] : [];
$content_align = ! empty( $attributes['teamContentAlignment'] ) ? [ 'text-align' => $attributes['teamContentAlignment'] ] : [];

// Image.
$img_box = [];
if ( '' !== $u( 'imageWidth' ) ) $img_box['max-width'] = $u( 'imageWidth' );
$img_box = array_merge( $img_box, $dims( $attributes['imageStyleRadius'] ?? [], 'radius' ) );
$img_el = ( '' !== $u( 'imageHeightStyle' ) ) ? [ 'height' => $u( 'imageHeightStyle' ) ] : [];
$img_area = $dims( $attributes['imagePadding'] ?? [], 'padding' );
$below = [];
if ( ! empty( $attributes['imageBelowBg'] ) ) $below['background-color'] = $attributes['imageBelowBg'];
if ( ! empty( $attributes['imageBelowHeight'] ) ) $below['height'] = $attributes['imageBelowHeight'] . '%';
if ( ! empty( $attributes['imageBelowPosition'] ) ) {
	if ( 'bottom' === $attributes['imageBelowPosition'] ) { $below['top'] = 'auto'; $below['bottom'] = '0'; } else { $below['top'] = '0'; $below['bottom'] = 'auto'; }
}
$below = array_merge( $below, $dims( $attributes['imageBelowRadius'] ?? [], 'radius' ) );
$overlay = $bg( 'imageOverlayColor', 'imageOverlayGradient' );

// Name & designation area.
$area = [];
if ( ! empty( $attributes['areaBgColor'] ) ) $area['background-color'] = $attributes['areaBgColor'];
$area = array_merge( $area, $dims( $attributes['wrapPadding'] ?? [], 'padding' ), $dims( $attributes['wrapMargin'] ?? [], 'margin' ), $dims( $attributes['areaBorderRadius'] ?? [], 'radius' ) );

// Skin4 overlay.
$ov = $bg( 'skin4OverlayColor', 'skin4OverlayGradient' );
if ( '' !== $u( 'skin4OverlayBlur' ) ) { $ov['backdrop-filter'] = 'blur(' . $u( 'skin4OverlayBlur' ) . ')'; $ov['-webkit-backdrop-filter'] = 'blur(' . $u( 'skin4OverlayBlur' ) . ')'; }
if ( ! empty( $attributes['skin4OverlayTextColor'] ) ) $ov['color'] = $attributes['skin4OverlayTextColor'];
$ov = array_merge( $ov, $dims( $attributes['skin4OverlayPadding'] ?? [], 'padding' ), $dims( $attributes['skin4OverlayBorderRadius'] ?? [], 'radius' ) );
$ov2 = ( '' !== $u( 'skin4Overlay2CircleSize' ) ) ? [ 'width' => $u( 'skin4Overlay2CircleSize' ) ] : [];

// Name / designation.
$name_styles = $typo( $attributes['nameTypography'] ?? [] );
if ( ! empty( $attributes['nameColor'] ) ) $name_styles['color'] = $attributes['nameColor'];
$name_styles = array_merge( $name_styles, $dims( $attributes['namePadding'] ?? [], 'padding' ) );
$deg_styles = $typo( $attributes['designationTypography'] ?? [] );
if ( ! empty( $attributes['designationColor'] ) ) $deg_styles['color'] = $attributes['designationColor'];

// Contact (skin5).
$contact_wrap = ( '' !== $u( 'contactGap' ) ) ? [ 'gap' => $u( 'contactGap' ) ] : [];
$contact_item = $typo( $attributes['contactTypography'] ?? [] );
if ( ! empty( $attributes['contactTextColor'] ) ) $contact_item['color'] = $attributes['contactTextColor'];
$contact_item = array_merge( $contact_item, $bg( 'contactItemBgColor', 'contactItemBgGradient' ), $dims( $attributes['contactItemRadius'] ?? [], 'radius' ), $dims( $attributes['contactItemPadding'] ?? [], 'padding' ) );
$contact_item_hover = [];
if ( ! empty( $attributes['contactTextHoverColor'] ) ) $contact_item_hover['color'] = $attributes['contactTextHoverColor'];
$contact_item_hover = array_merge( $contact_item_hover, $bg( 'contactItemBgHoverColor', 'contactItemBgHoverGradient' ) );
$contact_icon = $bg( 'contactIconBgColor', 'contactIconBgGradient' );
if ( ! empty( $attributes['contactIconColor'] ) ) $contact_icon['color'] = $attributes['contactIconColor'];
if ( '' !== $u( 'contactIconBoxSize' ) ) { $contact_icon['width'] = $u( 'contactIconBoxSize' ); $contact_icon['height'] = $u( 'contactIconBoxSize' ); }
$contact_icon = array_merge( $contact_icon, $dims( $attributes['contactIconRadius'] ?? [], 'radius' ) );
$contact_icon_glyph = ( '' !== $u( 'contactIconSize' ) ) ? [ 'font-size' => $u( 'contactIconSize' ) ] : [];
$contact_icon_fill = ! empty( $attributes['contactIconColor'] ) ? [ 'fill' => $attributes['contactIconColor'] ] : [];

// Description (default/skin1/skin2).
$tdesc = $typo( $attributes['teamDescriptionTypography'] ?? [] );
if ( ! empty( $attributes['teamDescriptionColor'] ) ) $tdesc['color'] = $attributes['teamDescriptionColor'];
$tdesc = array_merge( $tdesc, $dims( $attributes['teamDescriptionMargin'] ?? [], 'margin' ), $dims( $attributes['teamDescriptionPadding'] ?? [], 'padding' ) );

// Description (skin3 overlay).
$desc3 = $typo( $attributes['descTypography'] ?? [] );
if ( ! empty( $attributes['descColor'] ) ) $desc3['color'] = $attributes['descColor'];
$desc3_box = $bg( 'descBgColor', 'descBgGradient' );
$desc3_box = array_merge( $desc3_box, $dims( $attributes['descPadding'] ?? [], 'padding' ) );
$desc3_hover = ! empty( $attributes['descColorHover'] ) ? [ 'color' => $attributes['descColorHover'] ] : [];
$desc3_hover_bg = $bg( 'descBgHoverColor', 'descBgHoverGradient' );
if ( '' !== $u( 'descBgHoverOpacity' ) ) $desc3_hover_bg['opacity'] = $attributes['descBgHoverOpacity'];

// Social.
$soc = [];
if ( ! empty( $attributes['sIconColor'] ) ) $soc['color'] = $attributes['sIconColor'];
if ( ! empty( $attributes['sIconBgColor'] ) ) $soc['background'] = $attributes['sIconBgColor'];
$soc = array_merge( $soc, $typo( $attributes['sIconTypography'] ?? [] ), $dims( $attributes['sIconRadius'] ?? [], 'radius' ), $shadow( $attributes['socialBoxShadow'] ?? [] ) );
if ( '' !== $u( 'sIconButtonSize' ) ) { $soc['width'] = $u( 'sIconButtonSize' ); $soc['height'] = $u( 'sIconButtonSize' ); }
$soc_hover = [];
if ( ! empty( $attributes['sIconHoverColor'] ) ) $soc_hover['color'] = $attributes['sIconHoverColor'];
if ( ! empty( $attributes['sIconHoverBgColor'] ) ) $soc_hover['background'] = $attributes['sIconHoverBgColor'];
$soc_ul = ( '' !== $u( 'sIconGap' ) ) ? [ 'gap' => $u( 'sIconGap' ) ] : [];
$soc_area = $dims( $attributes['sIconAreaPadding'] ?? [], 'padding' );
if ( ! empty( $attributes['socialItemBorder'] ) ) $soc_area = array_merge( $soc_area, $H::border_to_css_props( $attributes['socialItemBorder'] ) );
$soc_align = ! empty( $attributes['teamSocialIconAlignment'] ) ? [ 'justify-content' => $attributes['teamSocialIconAlignment'] ] : [];
// Social position offsets.
$soc_pos = [];
if ( '' !== $u( 'sIconPosiTop' ) ) $soc_pos['top'] = $u( 'sIconPosiTop' );
if ( '' !== $u( 'sIconPosiBottom' ) ) $soc_pos['bottom'] = $u( 'sIconPosiBottom' );
if ( '' !== $u( 'sIconPosiLeft' ) ) $soc_pos['left'] = $u( 'sIconPosiLeft' );
if ( '' !== $u( 'sIconPosiRight' ) ) $soc_pos['right'] = $u( 'sIconPosiRight' );

// Popup.
$pop_content = ! empty( $attributes['popupBgColor'] ) ? [ 'background-color' => $attributes['popupBgColor'] ] : [];
$pop_name = $typo( $attributes['popupNameTypography'] ?? [] );
if ( ! empty( $attributes['popupNameColor'] ) ) $pop_name['color'] = $attributes['popupNameColor'];
$pop_deg = $typo( $attributes['popupDesignationTypography'] ?? [] );
if ( ! empty( $attributes['popupDesignationColor'] ) ) $pop_deg['color'] = $attributes['popupDesignationColor'];
$pop_det = $typo( $attributes['popupDetailsTypography'] ?? [] );
if ( ! empty( $attributes['popupDetailsColor'] ) ) $pop_det['color'] = $attributes['popupDetailsColor'];
$pop_close = ! empty( $attributes['popupCloseColor'] ) ? [ 'color' => $attributes['popupCloseColor'] ] : [];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$name_sel        = '.shapeblock-name, ' . $selector . ' .shapeblock-team-grid.skin4 .shapeblock-team-hover-content.overlay2 .shapeblock-name';
$deg_sel         = '.shapeblock-designation, ' . $selector . ' .shapeblock-team-grid.skin4 .shapeblock-team-hover-content.overlay2 .shapeblock-designation';
$cicon_glyph_sel = '.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item .shapeblock-contact-icon i, ' . $selector . ' .shapeblock-team-card.skin5 .shapeblock-contact-icon svg';
$soc_sel         = '.shapeblock-team-social ul li a, ' . $selector . ' .shapeblock-team-social .shapeblock-team-social-hover a';

$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H, $name_sel, $deg_sel, $cicon_glyph_sel, $soc_sel ) {
	$ru = function ( $key ) use ( $attributes, $H ) {
		return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	};

	// Team item padding.
	$card = $dims( $attributes[ 'itemPadding' . $suffix ] ?? [], 'padding' );

	// Name & designation area: padding + margin + alignment.
	$wrap = array_merge( $dims( $attributes[ 'wrapPadding' . $suffix ] ?? [], 'padding' ), $dims( $attributes[ 'wrapMargin' . $suffix ] ?? [], 'margin' ) );
	if ( ! empty( $attributes[ 'teamContentAlignment' . $suffix ] ) ) $wrap['text-align'] = $attributes[ 'teamContentAlignment' . $suffix ];

	// Image box / img / area.
	$img_box  = ( '' !== $ru( 'imageWidth' . $suffix ) ) ? [ 'max-width' => $ru( 'imageWidth' . $suffix ) ] : [];
	$img_el   = ( '' !== $ru( 'imageHeightStyle' . $suffix ) ) ? [ 'height' => $ru( 'imageHeightStyle' . $suffix ) ] : [];
	$img_area = $dims( $attributes[ 'imagePadding' . $suffix ] ?? [], 'padding' );
	$below    = ( isset( $attributes[ 'imageBelowHeight' . $suffix ] ) && '' !== $attributes[ 'imageBelowHeight' . $suffix ] ) ? [ 'height' => $attributes[ 'imageBelowHeight' . $suffix ] . '%' ] : [];

	// Name / designation typography.
	$name_styles = $typo( $attributes[ 'nameTypography' . $suffix ] ?? [] );
	$deg_styles  = $typo( $attributes[ 'designationTypography' . $suffix ] ?? [] );

	// Contact (skin5).
	$contact_wrap       = ( '' !== $ru( 'contactGap' . $suffix ) ) ? [ 'gap' => $ru( 'contactGap' . $suffix ) ] : [];
	$contact_item       = $typo( $attributes[ 'contactTypography' . $suffix ] ?? [] );
	$contact_icon       = ( '' !== $ru( 'contactIconBoxSize' . $suffix ) ) ? [ 'width' => $ru( 'contactIconBoxSize' . $suffix ), 'height' => $ru( 'contactIconBoxSize' . $suffix ) ] : [];
	$contact_icon_glyph = ( '' !== $ru( 'contactIconSize' . $suffix ) ) ? [ 'font-size' => $ru( 'contactIconSize' . $suffix ) ] : [];

	// Description.
	$tdesc = $typo( $attributes[ 'teamDescriptionTypography' . $suffix ] ?? [] );
	$desc3 = $typo( $attributes[ 'descTypography' . $suffix ] ?? [] );

	// Social.
	$soc = $typo( $attributes[ 'sIconTypography' . $suffix ] ?? [] );
	if ( '' !== $ru( 'sIconButtonSize' . $suffix ) ) { $soc['width'] = $ru( 'sIconButtonSize' . $suffix ); $soc['height'] = $ru( 'sIconButtonSize' . $suffix ); }
	$soc_ul    = ( '' !== $ru( 'sIconGap' . $suffix ) ) ? [ 'gap' => $ru( 'sIconGap' . $suffix ) ] : [];
	$soc_area  = $dims( $attributes[ 'sIconAreaPadding' . $suffix ] ?? [], 'padding' );
	$soc_align = ! empty( $attributes[ 'teamSocialIconAlignment' . $suffix ] ) ? [ 'justify-content' => $attributes[ 'teamSocialIconAlignment' . $suffix ] ] : [];

	// Popup typography.
	$pop_name = $typo( $attributes[ 'popupNameTypography' . $suffix ] ?? [] );
	$pop_deg  = $typo( $attributes[ 'popupDesignationTypography' . $suffix ] ?? [] );
	$pop_det  = $typo( $attributes[ 'popupDetailsTypography' . $suffix ] ?? [] );

	return [
		'.shapeblock-team-grid .shapeblock-team-card'                                                   => $card,
		'.shapeblock-team-grid .shapeblock-team-card .shapeblock-name-deg-wrap'                              => $wrap,
		'.shapeblock-team-card .shapeblock-team-img-box'                                                => $img_box,
		'.shapeblock-team-card .shapeblock-team-img-box img'                                            => $img_el,
		'.shapeblock-team-card .shapeblock-team-img-area'                                               => $img_area,
		'.shapeblock-team-card .shapeblock-team-img-area .shapeblock-image-below-bg'                         => $below,
		$name_sel                                                                             => $name_styles,
		$deg_sel                                                                              => $deg_styles,
		'.shapeblock-team-card.skin5 .shapeblock-author-contact'                                        => $contact_wrap,
		'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item'                    => $contact_item,
		'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item .shapeblock-contact-icon' => $contact_icon,
		$cicon_glyph_sel                                                                      => $contact_icon_glyph,
		'.shapeblock-team-description'                                                             => $tdesc,
		'.shapeblock-image-content .shapeblock-description'                                             => $desc3,
		$soc_sel                                                                              => $soc,
		'.shapeblock-team-social ul'                                                               => $soc_ul,
		'.shapeblock-team-social'                                                                  => $soc_area,
		'.shapeblock-team-card .shapeblock-team-social.default ul'                                      => $soc_align,
		'.shapeblock-popup-name .shapeblock-name'                                                       => $pop_name,
		'.shapeblock-popup-designation'                                                            => $pop_deg,
		'.shapeblock-popup-details'                                                                => $pop_det,
	];
};
$dev_data      = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$sub_selectors = [
	'.shapeblock-team-grid .shapeblock-team-card',
	'.shapeblock-team-grid .shapeblock-team-card .shapeblock-name-deg-wrap',
	'.shapeblock-team-card .shapeblock-team-img-box',
	'.shapeblock-team-card .shapeblock-team-img-box img',
	'.shapeblock-team-card .shapeblock-team-img-area',
	'.shapeblock-team-card .shapeblock-team-img-area .shapeblock-image-below-bg',
	$name_sel,
	$deg_sel,
	'.shapeblock-team-card.skin5 .shapeblock-author-contact',
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item',
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item .shapeblock-contact-icon',
	$cicon_glyph_sel,
	'.shapeblock-team-description',
	'.shapeblock-image-content .shapeblock-description',
	$soc_sel,
	'.shapeblock-team-social ul',
	'.shapeblock-team-social',
	'.shapeblock-team-card .shapeblock-team-social.default ul',
	'.shapeblock-popup-name .shapeblock-name',
	'.shapeblock-popup-designation',
	'.shapeblock-popup-details',
];
$resp_css = '';
foreach ( $sub_selectors as $sub_sel ) {
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
	'.shapeblock-team-grid .shapeblock-team-card'                  => $H::get_inline_styles( $card ),
	'.shapeblock-team-grid .shapeblock-team-card:hover'            => $H::get_inline_styles( $card_hover ),
	'.shapeblock-team-grid .shapeblock-team-card .shapeblock-name-deg-wrap' => $H::get_inline_styles( array_merge( $area, $content_align ) ),
	'.shapeblock-team-card .shapeblock-team-img-box'               => $H::get_inline_styles( $img_box ),
	'.shapeblock-team-card .shapeblock-team-img-box img'           => $H::get_inline_styles( $img_el ),
	'.shapeblock-team-card .shapeblock-team-img-area'              => $H::get_inline_styles( $img_area ),
	'.shapeblock-team-card .shapeblock-team-img-area .shapeblock-image-below-bg' => $H::get_inline_styles( $below ),
	'.shapeblock-team-card .shapeblock-image-overlay'              => $H::get_inline_styles( $overlay ),
	'.shapeblock-team-grid.skin4 .shapeblock-team-hover-content, ' . $selector . ' .shapeblock-team-grid.skin4 .shapeblock-team-card .shapeblock-team-hover-content.overlay2' => $H::get_inline_styles( $ov ),
	'.shapeblock-team-grid.skin4 .shapeblock-team-card .shapeblock-team-hover-content.overlay2' => $H::get_inline_styles( $ov2 ),
	'.shapeblock-name, ' . $selector . ' .shapeblock-team-grid.skin4 .shapeblock-team-hover-content.overlay2 .shapeblock-name' => $H::get_inline_styles( $name_styles ),
	'.shapeblock-designation, ' . $selector . ' .shapeblock-team-grid.skin4 .shapeblock-team-hover-content.overlay2 .shapeblock-designation' => $H::get_inline_styles( $deg_styles ),
	'.shapeblock-team-card.skin5 .shapeblock-author-contact'       => $H::get_inline_styles( $contact_wrap ),
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item' => $H::get_inline_styles( $contact_item ),
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item:hover' => $H::get_inline_styles( $contact_item_hover ),
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item .shapeblock-contact-icon' => $H::get_inline_styles( $contact_icon ),
	'.shapeblock-team-card.skin5 .shapeblock-author-contact .shapeblock-contact-item .shapeblock-contact-icon i, ' . $selector . ' .shapeblock-team-card.skin5 .shapeblock-contact-icon svg' => $H::get_inline_styles( array_merge( $contact_icon_glyph, $contact_icon_fill ) ),
	'.shapeblock-team-description'                            => $H::get_inline_styles( $tdesc ),
	'.shapeblock-image-content .shapeblock-description'            => $H::get_inline_styles( $desc3 ),
	'.shapeblock-image-content'                               => $H::get_inline_styles( $desc3_box ),
	'.shapeblock-image-content:hover .shapeblock-description'      => $H::get_inline_styles( $desc3_hover ),
	'.shapeblock-image-content:hover::before'                 => $H::get_inline_styles( $desc3_hover_bg ),
	'.shapeblock-team-social ul li a, ' . $selector . ' .shapeblock-team-social .shapeblock-team-social-hover a' => $H::get_inline_styles( $soc ),
	'.shapeblock-team-social ul li a:hover, ' . $selector . ' .shapeblock-team-social .shapeblock-team-social-hover a:hover' => $H::get_inline_styles( $soc_hover ),
	'.shapeblock-team-social ul'                              => $H::get_inline_styles( $soc_ul ),
	'.shapeblock-team-social'                                 => $H::get_inline_styles( array_merge( $soc_area, $soc_pos ) ),
	'.shapeblock-team-card .shapeblock-team-social.default ul'     => $H::get_inline_styles( $soc_align ),
	'.shapeblock-popup-content'                               => $H::get_inline_styles( $pop_content ),
	'.shapeblock-popup-name .shapeblock-name'                      => $H::get_inline_styles( $pop_name ),
	'.shapeblock-popup-designation'                           => $H::get_inline_styles( $pop_deg ),
	'.shapeblock-popup-details'                               => $H::get_inline_styles( $pop_det ),
	'.shapeblock-popup-close'                                 => $H::get_inline_styles( $pop_close ),
] );

// ---------------------------------------------------------------------------
// Markup helpers.
// ---------------------------------------------------------------------------
$icon_i = function ( $val, $fallback ) {
	return ( ! empty( $val ) && 'none' !== $val ) ? '<i class="shapeblock-icon ' . esc_attr( $val ) . '" aria-hidden="true"></i>' : $fallback;
};
$svg_link  = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12a3 3 0 013-3h3v2H6.9a1 1 0 100 2h3v2h-3a3 3 0 01-3-3zm6 1h4v-2h-4v2zm4-4h3a3 3 0 010 6h-3v-2h3a1 1 0 100-2h-3V9z"/></svg>';
$svg_plus  = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z"/></svg>';
$svg_mail  = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18v14H3V5zm9 7L4 7v1l8 5 8-5V7l-8 5z"/></svg>';
$svg_phone = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.55 3.4 1 1 0 01-.24 1l-2.2 2.4z"/></svg>';

// Open/close link wrapper.
$open_link = '';
$close_link = '';
if ( 'link' === $action && $link ) {
	$open_link = '<a href="' . esc_url( $link ) . '"' . $target . $nofollow . '>';
	$close_link = '</a>';
} elseif ( 'popup' === $action ) {
	$open_link = '<a href="#' . esc_attr( $popup_id ) . '" class="shapeblock-popup-trigger" data-popup-id="' . esc_attr( $popup_id ) . '">';
	$close_link = '</a>';
}

$name_html = $name ? sprintf( '<%1$s class="shapeblock-name">%2$s</%1$s>', tag_escape( $tag ), esc_html( $name ) ) : '';

// Social markup.
$social_html = '';
if ( $show_social && ! empty( $social_links ) ) {
	$pos_classes = $social_pos . ' ' . $social_show;
	ob_start();
	?>
	<div class="shapeblock-team-social <?php echo esc_attr( $pos_classes ); ?>">
		<?php if ( 'hover_show' === $social_show && ! empty( $social_hover_icon ) ) : ?>
			<div class="shapeblock-team-social-hover"><a href="#"><?php echo $icon_i( $social_hover_icon, $svg_plus ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></a></div>
		<?php endif; ?>
		<ul>
			<?php foreach ( $social_links as $s ) : $su = isset( $s['url'] ) ? $s['url'] : '#'; ?>
				<li><a href="<?php echo esc_url( $su ); ?>"><?php echo $icon_i( isset( $s['icon'] ) ? $s['icon'] : '', $svg_link ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></a></li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php
	$social_html = ob_get_clean();
}
$social_default = ( $show_social && ! empty( $social_links ) && 'default' === $social_pos ) ? $social_html : '';
$social_positioned = ( $show_social && ! empty( $social_links ) && 'default' !== $social_pos ) ? $social_html : '';

// Image markup.
$img_alt = $img_url ? esc_attr( $image['alt'] ?? '' ) : esc_attr__( 'Team Image', 'shapeblock' );
$placeholder = SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png';
$img_src = $img_url ? $img_url : $placeholder;
ob_start();
?>
<div class="shapeblock-team-img-box">
	<img class="shapeblock-team-img" src="<?php echo esc_url( $img_src ); ?>" alt="<?php echo $img_alt; // phpcs:ignore ?>" loading="lazy" decoding="async">
	<div class="shapeblock-image-below-bg"></div>
	<div class="shapeblock-image-overlay"></div>
	<?php if ( in_array( $skin, [ 'skin3', 'skin5' ], true ) && $details ) : ?>
		<div class="shapeblock-image-content <?php echo 'skin5' === $skin ? 'has-description' : ''; ?>">
			<div class="shapeblock-description"><?php echo nl2br( esc_html( $details ) ); ?></div>
		</div>
	<?php endif; ?>
</div>
<?php
$img_box_html = ob_get_clean();

// Name-deg-wrap (with optional details + default social).
$build_name_wrap = function ( $extra_class = '', $with_details = true, $with_social = true ) use ( $name_html, $designation, $details, $social_default ) {
	ob_start();
	?>
	<div class="shapeblock-name-deg-wrap <?php echo esc_attr( $extra_class ); ?>">
		<?php echo $name_html; // phpcs:ignore ?>
		<?php if ( $designation ) : ?><div class="shapeblock-designation"><?php echo esc_html( $designation ); ?></div><?php endif; ?>
		<?php if ( $with_details && $details ) : ?><div class="shapeblock-team-description"><?php echo nl2br( esc_html( $details ) ); ?></div><?php endif; ?>
		<?php if ( $with_social ) { echo $social_default; } // phpcs:ignore ?>
	</div>
	<?php
	return ob_get_clean();
};

ob_start();
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-grid-wrap">
		<?php if ( 'skin1' === $skin ) : ?>
			<div class="shapeblock-grid-item">
				<div class="shapeblock-team-card">
					<div class="shapeblock-team-left">
						<?php echo $open_link; // phpcs:ignore ?>
						<div class="shapeblock-team-img-area"><?php echo $img_box_html; // phpcs:ignore ?></div>
						<?php echo $close_link; // phpcs:ignore ?>
					</div>
					<div class="shapeblock-team-right">
						<?php echo $build_name_wrap( '', true, false ); // phpcs:ignore ?>
						<?php echo $social_default; // phpcs:ignore ?>
					</div>
				</div>
			</div>
		<?php elseif ( 'skin3' === $skin ) : ?>
			<div class="shapeblock-grid-item skin3">
				<div class="shapeblock-team-card">
					<?php echo $open_link; // phpcs:ignore ?>
					<div class="shapeblock-team-img-area"><?php echo $img_box_html; // phpcs:ignore ?></div>
					<div class="shapeblock-team-deg-content">
						<div class="shapeblock-name-deg-wrap">
							<?php echo $name_html; // phpcs:ignore ?>
							<?php if ( $designation ) : ?><div class="shapeblock-designation"><?php echo esc_html( $designation ); ?></div><?php endif; ?>
						</div>
					</div>
					<?php echo $close_link; // phpcs:ignore ?>
					<div class="shapeblock-social-media"><?php echo $social_default; // phpcs:ignore ?></div>
					<?php echo $social_positioned; // phpcs:ignore ?>
				</div>
			</div>
		<?php elseif ( 'skin4' === $skin ) : ?>
			<div class="shapeblock-grid-item">
				<div class="shapeblock-team-card">
					<?php echo $open_link; // phpcs:ignore ?>
					<div class="shapeblock-team-img-area"><?php echo $img_box_html; // phpcs:ignore ?></div>
					<?php echo $close_link; // phpcs:ignore ?>
					<div class="shapeblock-team-hover-content <?php echo esc_attr( $overlay4 ); ?>">
						<div class="shapeblock-name-deg-wrap">
							<?php echo $name_html; // phpcs:ignore ?>
							<?php if ( $designation ) : ?><div class="shapeblock-designation"><?php echo esc_html( $designation ); ?></div><?php endif; ?>
						</div>
						<?php echo ( $show_social && ! empty( $social_links ) ) ? $social_html : ''; // phpcs:ignore ?>
					</div>
				</div>
			</div>
		<?php elseif ( 'skin5' === $skin ) : ?>
			<div class="shapeblock-grid-item">
				<div class="shapeblock-team-card skin5">
					<div class="shapeblock-team-img-area">
						<?php echo $open_link; // phpcs:ignore ?>
						<?php echo $img_box_html; // phpcs:ignore ?>
						<?php echo $close_link; // phpcs:ignore ?>
						<div class="shapeblock-name-deg-wrap">
							<div class="shapeblock-author-content">
								<?php echo $name_html; // phpcs:ignore ?>
								<?php if ( $designation ) : ?><div class="shapeblock-designation"><?php echo esc_html( $designation ); ?></div><?php endif; ?>
							</div>
							<?php if ( $show_contact && ( $email || $phone ) ) : ?>
								<div class="shapeblock-author-contact">
									<div class="shapeblock-contact-inner">
										<?php if ( $email ) : ?>
											<div class="shapeblock-team-email shapeblock-contact-item">
												<div class="shapeblock-contact-icon"><?php echo $icon_i( $attributes['teamEmailIcon'] ?? '', $svg_mail ); // phpcs:ignore ?></div>
												<?php echo esc_html( $email ); ?>
											</div>
										<?php endif; ?>
										<?php if ( $phone ) : ?>
											<div class="shapeblock-team-phone shapeblock-contact-item">
												<div class="shapeblock-contact-icon"><?php echo $icon_i( $attributes['teamPhoneIcon'] ?? '', $svg_phone ); // phpcs:ignore ?></div>
												<?php echo esc_html( $phone ); ?>
											</div>
										<?php endif; ?>
									</div>
								</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</div>
		<?php else : // default + skin2 ?>
			<div class="shapeblock-grid-item">
				<div class="shapeblock-team-card">
					<div class="shapeblock-team-img-area">
						<?php echo $open_link; // phpcs:ignore ?>
						<?php echo $img_box_html; // phpcs:ignore ?>
						<?php echo $close_link; // phpcs:ignore ?>
						<?php if ( 'inside' === $content_show ) { echo $build_name_wrap( 'inside', true, true ); } // phpcs:ignore ?>
					</div>
					<?php if ( 'inside' !== $content_show ) { echo $build_name_wrap( '', true, true ); } // phpcs:ignore ?>
					<?php echo $social_positioned; // phpcs:ignore ?>
				</div>
			</div>
		<?php endif; ?>

		<?php if ( 'popup' === $action ) : ?>
			<div id="<?php echo esc_attr( $popup_id ); ?>" class="shapeblock-popup-modal" style="display:none;">
				<div class="shapeblock-popup-content">
					<span class="shapeblock-popup-close">&times;</span>
					<div class="shapeblock-popup-header">
						<?php if ( $name_html ) : ?><div class="shapeblock-popup-name"><?php echo $name_html; // phpcs:ignore ?></div><?php endif; ?>
						<?php if ( $designation ) : ?><div class="shapeblock-popup-designation"><?php echo esc_html( $designation ); ?></div><?php endif; ?>
					</div>
					<div class="shapeblock-popup-details">
						<?php echo $details ? nl2br( esc_html( $details ) ) : '<p>' . esc_html__( 'No additional details available.', 'shapeblock' ) . '</p>'; ?>
					</div>
				</div>
			</div>
		<?php endif; ?>
	</div>
</div>
<?php
echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup assembled from escaped parts above.
