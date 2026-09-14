<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Table block.
 *
 * Mirrors the markup of the Elementor "Table" widget
 * (easy-elements/widgets/table). Element classes use the "shapeblock-" prefix.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-table-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$header = isset( $attributes['tableHeader'] ) && is_array( $attributes['tableHeader'] ) ? $attributes['tableHeader'] : [];
$body   = isset( $attributes['tableBody'] ) && is_array( $attributes['tableBody'] ) ? $attributes['tableBody'] : [];
$footer = isset( $attributes['tableFooter'] ) && is_array( $attributes['tableFooter'] ) ? $attributes['tableFooter'] : [];

$tooltip_align = isset( $attributes['tooltipAlign'] ) ? $attributes['tooltipAlign'] : 'top';

$block_wrap_attr = get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-table-block-wrap ' . $unique_id ) );
if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-table-block-wrap ' . esc_attr( $unique_id ) . '"';
}

if ( empty( $header ) && empty( $body ) && empty( $footer ) ) {
	echo '<div ' . wp_kses_post( $block_wrap_attr ) . '><p>' . esc_html__( 'Please add table cells.', 'shapeblock' ) . '</p></div>';
	return;
}

// ---------------------------------------------------------------------------
// Section-level inline styles (scoped to this instance).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-table-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-table-style';

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

// General.
$valign_cells = ! empty( $attributes['verticalAlignTable'] ) ? [ 'vertical-align' => $attributes['verticalAlignTable'] ] : [];
$table_box    = array_merge( $dims( $attributes['tableMargin'] ?? [], 'margin' ), $dims( $attributes['tableRadius'] ?? [], 'radius' ) );
$cell_padding = $dims( $attributes['tablePadding'] ?? [], 'padding' );
$tbody_border = ! empty( $attributes['tableBorder'] ) ? $H::border_to_css_props( $attributes['tableBorder'] ) : [];

// Header.
$head = [];
if ( ! empty( $attributes['headerAlign'] ) ) $head['text-align'] = $attributes['headerAlign'];
if ( ! empty( $attributes['headerTextColor'] ) ) $head['color'] = $attributes['headerTextColor'];
if ( ! empty( $attributes['headerBgColor'] ) ) $head['background-color'] = $attributes['headerBgColor'];
$head = array_merge( $head, $typo( $attributes['headerTypography'] ?? [] ) );
$head_th = array_merge( $dims( $attributes['theadRadius'] ?? [], 'radius' ), $dims( $attributes['theadPadding'] ?? [], 'padding' ) );
if ( ! empty( $attributes['headBorder'] ) ) $head_th = array_merge( $head_th, $H::border_to_css_props( $attributes['headBorder'] ) );
$head_icon = [];
if ( ! empty( $attributes['headerIconColor'] ) ) $head_icon['color'] = $attributes['headerIconColor'];
if ( '' !== $u( 'headerIconSize' ) ) $head_icon['font-size'] = $u( 'headerIconSize' );
$head_icon = array_merge( $head_icon, $dims( $attributes['headerIconMargin'] ?? [], 'margin' ) );
$head_icon_svg = [];
if ( ! empty( $attributes['headerIconColor'] ) ) $head_icon_svg['fill'] = $attributes['headerIconColor'];
if ( '' !== $u( 'headerIconSize' ) ) { $head_icon_svg['width'] = $u( 'headerIconSize' ); $head_icon_svg['height'] = $u( 'headerIconSize' ); }
$head_icon_wrap = ( '' !== $u( 'headerIconYPos' ) ) ? [ 'top' => $u( 'headerIconYPos' ) ] : [];

// Body.
$bd = [];
if ( ! empty( $attributes['bodyAlign'] ) ) $bd['text-align'] = $attributes['bodyAlign'];
if ( ! empty( $attributes['bodyTextColor'] ) ) $bd['color'] = $attributes['bodyTextColor'];
if ( ! empty( $attributes['bodyBgColor'] ) ) $bd['background-color'] = $attributes['bodyBgColor'];
$bd = array_merge( $bd, $typo( $attributes['bodyTypography'] ?? [] ) );
$bd_striped = ( ! empty( $attributes['stripedBg'] ) && ! empty( $attributes['stripedBgColor'] ) ) ? [ 'background-color' => $attributes['stripedBgColor'] ] : [];
$bd_icon = [];
if ( ! empty( $attributes['bodyIconColor'] ) ) $bd_icon['color'] = $attributes['bodyIconColor'];
if ( '' !== $u( 'bodyIconSize' ) ) $bd_icon['font-size'] = $u( 'bodyIconSize' );
$bd_icon = array_merge( $bd_icon, $dims( $attributes['bodyIconGap'] ?? [], 'padding' ) );
$bd_icon_svg = [];
if ( ! empty( $attributes['bodyIconColor'] ) ) $bd_icon_svg['fill'] = $attributes['bodyIconColor'];
if ( '' !== $u( 'bodyIconSize' ) ) { $bd_icon_svg['width'] = $u( 'bodyIconSize' ); $bd_icon_svg['height'] = $u( 'bodyIconSize' ); }
$bd_td = array_merge( $dims( $attributes['tbodyRadius'] ?? [], 'radius' ), $dims( $attributes['tbodyPadding'] ?? [], 'padding' ), $dims( $attributes['tbodyMargin'] ?? [], 'margin' ) );
if ( ! empty( $attributes['bodyBorder'] ) ) $bd_td = array_merge( $bd_td, $H::border_to_css_props( $attributes['bodyBorder'] ) );
$tip_icon = [];
if ( ! empty( $attributes['tooltipIconColor'] ) ) $tip_icon['color'] = $attributes['tooltipIconColor'];
if ( '' !== $u( 'tooltipIconSize' ) ) $tip_icon['font-size'] = $u( 'tooltipIconSize' );
$tip_icon = array_merge( $tip_icon, $dims( $attributes['tooltipIconMargin'] ?? [], 'margin' ) );
$tip_icon_svg = [];
if ( ! empty( $attributes['tooltipIconColor'] ) ) $tip_icon_svg['fill'] = $attributes['tooltipIconColor'];
if ( '' !== $u( 'tooltipIconSize' ) ) { $tip_icon_svg['width'] = $u( 'tooltipIconSize' ); $tip_icon_svg['height'] = $u( 'tooltipIconSize' ); }
$img = ( '' !== $u( 'imgSize' ) ) ? [ 'max-width' => $u( 'imgSize' ), 'height' => $u( 'imgSize' ) ] : [];
$img = array_merge( $img, $dims( $attributes['imgRadius'] ?? [], 'radius' ) );

// Footer.
$ft = [];
if ( ! empty( $attributes['footerAlign'] ) ) $ft['text-align'] = $attributes['footerAlign'];
if ( ! empty( $attributes['footerTextColor'] ) ) $ft['color'] = $attributes['footerTextColor'];
if ( ! empty( $attributes['footerBgColor'] ) ) $ft['background-color'] = $attributes['footerBgColor'];
$ft = array_merge( $ft, $typo( $attributes['footerTypography'] ?? [] ) );
$ft_th = array_merge( $dims( $attributes['tfootRadius'] ?? [], 'radius' ), $dims( $attributes['tfootPadding'] ?? [], 'padding' ) );
if ( ! empty( $attributes['footBorder'] ) ) $ft_th = array_merge( $ft_th, $H::border_to_css_props( $attributes['footBorder'] ) );

$sub = [
	'.shapeblock-table-body td, ' . $selector . ' .shapeblock-table-body th' => $H::get_inline_styles( $valign_cells ),
	'.shapeblock-table'                          => $H::get_inline_styles( $table_box ),
	'.shapeblock-table-header th, ' . $selector . ' .shapeblock-table-body td' => $H::get_inline_styles( $cell_padding ),
	'.shapeblock-table-body'                     => $H::get_inline_styles( array_merge( $tbody_border, $bd ) ),

	'.shapeblock-table-header'                   => $H::get_inline_styles( $head ),
	'.shapeblock-table-header th'                => $H::get_inline_styles( $head_th ),
	'.shapeblock-header-icon'                    => $H::get_inline_styles( $head_icon_wrap ),
	'.shapeblock-header-icon i'                  => $H::get_inline_styles( $head_icon ),
	'.shapeblock-header-icon svg'                => $H::get_inline_styles( $head_icon_svg ),

	'.shapeblock-table-body tr:nth-of-type(2n)'  => $H::get_inline_styles( $bd_striped ),
	'.shapeblock-table-body td i'                => $H::get_inline_styles( $bd_icon ),
	'.shapeblock-table-body td svg'              => $H::get_inline_styles( $bd_icon_svg ),
	'.shapeblock-table-body td'                  => $H::get_inline_styles( $bd_td ),
	'.shapeblock-tbl-tooltip i'                  => $H::get_inline_styles( $tip_icon ),
	'.shapeblock-tbl-tooltip svg'                => $H::get_inline_styles( $tip_icon_svg ),
	'.shapeblock-table-image'                    => $H::get_inline_styles( $img ),

	'.shapeblock-table-footer'                   => $H::get_inline_styles( $ft ),
	'.shapeblock-table-footer th'                => $H::get_inline_styles( $ft_th ),
];

// ---------------------------------------------------------------------------
// Responsive (Tablet / Mobile) overrides. The desktop CSS above is unchanged;
// these rules are emitted only when the matching per-device attribute is set,
// so existing content renders identically.
// ---------------------------------------------------------------------------
$build_dev = function ( $suffix ) use ( $attributes, $typo, $dims, $H, $selector ) {
	$uu = function ( $key ) use ( $attributes, $H ) {
		return ( isset( $attributes[ $key ] ) && '' !== $attributes[ $key ] ) ? $H::ensure_unit( $attributes[ $key ] ) : '';
	};

	// General.
	$valign       = ! empty( $attributes[ 'verticalAlignTable' . $suffix ] ) ? [ 'vertical-align' => $attributes[ 'verticalAlignTable' . $suffix ] ] : [];
	$table_box    = $dims( $attributes[ 'tableMargin' . $suffix ] ?? [], 'margin' );
	$cell_padding = $dims( $attributes[ 'tablePadding' . $suffix ] ?? [], 'padding' );

	// Header.
	$head = [];
	if ( ! empty( $attributes[ 'headerAlign' . $suffix ] ) ) $head['text-align'] = $attributes[ 'headerAlign' . $suffix ];
	$head    = array_merge( $head, $typo( $attributes[ 'headerTypography' . $suffix ] ?? [] ) );
	$head_th = $dims( $attributes[ 'theadPadding' . $suffix ] ?? [], 'padding' );
	$head_icon = [];
	if ( '' !== $uu( 'headerIconSize' . $suffix ) ) $head_icon['font-size'] = $uu( 'headerIconSize' . $suffix );
	$head_icon_svg = [];
	if ( '' !== $uu( 'headerIconSize' . $suffix ) ) { $head_icon_svg['width'] = $uu( 'headerIconSize' . $suffix ); $head_icon_svg['height'] = $uu( 'headerIconSize' . $suffix ); }

	// Body.
	$bd = [];
	if ( ! empty( $attributes[ 'bodyAlign' . $suffix ] ) ) $bd['text-align'] = $attributes[ 'bodyAlign' . $suffix ];
	$bd      = array_merge( $bd, $typo( $attributes[ 'bodyTypography' . $suffix ] ?? [] ) );
	$bd_icon = [];
	if ( '' !== $uu( 'bodyIconSize' . $suffix ) ) $bd_icon['font-size'] = $uu( 'bodyIconSize' . $suffix );
	$bd_icon = array_merge( $bd_icon, $dims( $attributes[ 'bodyIconGap' . $suffix ] ?? [], 'padding' ) );
	$bd_icon_svg = [];
	if ( '' !== $uu( 'bodyIconSize' . $suffix ) ) { $bd_icon_svg['width'] = $uu( 'bodyIconSize' . $suffix ); $bd_icon_svg['height'] = $uu( 'bodyIconSize' . $suffix ); }
	$bd_td = array_merge( $dims( $attributes[ 'tbodyPadding' . $suffix ] ?? [], 'padding' ), $dims( $attributes[ 'tbodyMargin' . $suffix ] ?? [], 'margin' ) );
	$tip_icon = [];
	if ( '' !== $uu( 'tooltipIconSize' . $suffix ) ) $tip_icon['font-size'] = $uu( 'tooltipIconSize' . $suffix );
	$tip_icon_svg = [];
	if ( '' !== $uu( 'tooltipIconSize' . $suffix ) ) { $tip_icon_svg['width'] = $uu( 'tooltipIconSize' . $suffix ); $tip_icon_svg['height'] = $uu( 'tooltipIconSize' . $suffix ); }
	$img = ( '' !== $uu( 'imgSize' . $suffix ) ) ? [ 'max-width' => $uu( 'imgSize' . $suffix ), 'height' => $uu( 'imgSize' . $suffix ) ] : [];

	// Footer.
	$ft = [];
	if ( ! empty( $attributes[ 'footerAlign' . $suffix ] ) ) $ft['text-align'] = $attributes[ 'footerAlign' . $suffix ];
	$ft    = array_merge( $ft, $typo( $attributes[ 'footerTypography' . $suffix ] ?? [] ) );
	$ft_th = $dims( $attributes[ 'tfootPadding' . $suffix ] ?? [], 'padding' );

	return [
		'.shapeblock-table-body td, ' . $selector . ' .shapeblock-table-body th'   => $valign,
		'.shapeblock-table'                                                   => $table_box,
		'.shapeblock-table-header th, ' . $selector . ' .shapeblock-table-body td' => $cell_padding,
		'.shapeblock-table-body'                                              => $bd,
		'.shapeblock-table-header'                                            => $head,
		'.shapeblock-table-header th'                                         => $head_th,
		'.shapeblock-header-icon i'                                           => $head_icon,
		'.shapeblock-header-icon svg'                                         => $head_icon_svg,
		'.shapeblock-table-body td i'                                         => $bd_icon,
		'.shapeblock-table-body td svg'                                       => $bd_icon_svg,
		'.shapeblock-table-body td'                                           => $bd_td,
		'.shapeblock-tbl-tooltip i'                                           => $tip_icon,
		'.shapeblock-tbl-tooltip svg'                                         => $tip_icon_svg,
		'.shapeblock-table-image'                                             => $img,
		'.shapeblock-table-footer'                                            => $ft,
		'.shapeblock-table-footer th'                                         => $ft_th,
	];
};
$dev_data = [ 'Tablet' => $build_dev( 'Tablet' ), 'Mobile' => $build_dev( 'Mobile' ) ];
$resp_css = '';
foreach ( array_keys( $dev_data['Tablet'] ) as $sub_sel ) {
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

// Tooltip placement is a data-placement attribute on the markup, so it cannot
// vary by device on its own. The per-device settings are emitted as the same
// CSS the [data-placement] rules in style.scss produce, which overrides the
// desktop placement at that breakpoint. Every property each variant touches is
// written out so switching placement fully replaces the previous one.
$tip_placement = function ( $align ) {
	switch ( $align ) {
		case 'bottom':
			return [
				'box'  => [ 'bottom' => 'auto', 'top' => '125%', 'left' => '50%', 'right' => 'auto', 'transform' => 'translateX(-50%)' ],
				'show' => [ 'transform' => 'translateX(-50%) translateY(5px)' ],
			];
		case 'left':
			return [
				'box'  => [ 'bottom' => 'auto', 'top' => '50%', 'left' => 'auto', 'right' => '125%', 'transform' => 'translateY(-50%)' ],
				'show' => [ 'transform' => 'translateY(-50%) translateX(-5px)' ],
			];
		case 'right':
			return [
				'box'  => [ 'bottom' => 'auto', 'top' => '50%', 'left' => '125%', 'right' => 'auto', 'transform' => 'translateY(-50%)' ],
				'show' => [ 'transform' => 'translateY(-50%) translateX(5px)' ],
			];
		case 'top':
			return [
				'box'  => [ 'bottom' => '125%', 'top' => 'auto', 'left' => '50%', 'right' => 'auto', 'transform' => 'translateX(-50%)' ],
				'show' => [ 'transform' => 'translateX(-50%) translateY(-5px)' ],
			];
	}
	return [ 'box' => [], 'show' => [] ];
};

$tip_resp = [ 'box' => [], 'show' => [] ];
foreach ( [ 'Tablet' => 'tablet', 'Mobile' => 'mobile' ] as $suffix => $device_key ) {
	$align = isset( $attributes[ 'tooltipAlign' . $suffix ] ) ? $attributes[ 'tooltipAlign' . $suffix ] : '';
	if ( '' === $align ) {
		continue;
	}
	$rules = $tip_placement( $align );
	if ( ! empty( $rules['box'] ) ) {
		$tip_resp['box'][ $device_key ]  = $rules['box'];
		$tip_resp['show'][ $device_key ] = $rules['show'];
	}
}
if ( ! empty( $tip_resp['box'] ) ) {
	$resp_css .= $H::generate_responsive_css( $selector . ' .shapeblock-tbl-tooltip .shapeblock-tbl-tooltip-content', $tip_resp['box'] );
	$resp_css .= $H::generate_responsive_css( $selector . ' .shapeblock-tbl-tooltip.show .shapeblock-tbl-tooltip-content', $tip_resp['show'] );
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $resp_css, $sub );

// ---------------------------------------------------------------------------
// Per-cell helpers.
// ---------------------------------------------------------------------------
$default_tip_icon = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-3.6h-2c0-2 2.5-2.2 2.5-3.9A1.5 1.5 0 0012 8a1.6 1.6 0 00-1.6 1.5H8.4A3.6 3.6 0 0112 6a3.5 3.5 0 013.5 3.5c0 2-2.5 2.3-2.5 3.9z"/></svg>';

$render_icon = function ( $val ) {
	return ( ! empty( $val ) && 'none' !== $val ) ? '<i class="shapeblock-icon ' . esc_attr( $val ) . '" aria-hidden="true"></i>' : '';
};

// Build the per-cell inline style attribute from "advance" settings.
$cell_style = function ( $item ) use ( $H ) {
	$adv = ! empty( $item['advance'] );
	$styles = [];
	if ( $adv ) {
		if ( ! empty( $item['width'] ) ) $styles[] = 'width:' . $item['width'];
		if ( empty( $item['dataFlex'] ) && ! empty( $item['align'] ) ) $styles[] = 'text-align:' . $item['align'];
		if ( ! empty( $item['verticalAlign'] ) ) $styles[] = 'vertical-align:' . $item['verticalAlign'];
		if ( ! empty( $item['decoration'] ) ) $styles[] = 'text-decoration:' . $item['decoration'];
		if ( ! empty( $item['bgColor'] ) ) $styles[] = 'background-color:' . $item['bgColor'];
		if ( ! empty( $item['textColor'] ) ) $styles[] = 'color:' . $item['textColor'];
		if ( ! empty( $item['dataFlex'] ) ) {
			if ( ! empty( $item['flexAlign'] ) ) $styles[] = 'justify-content:' . $item['flexAlign'];
			if ( '' !== ( $item['flexGap'] ?? '' ) ) $styles[] = 'gap:' . $H::ensure_unit( $item['flexGap'] );
		}
	}
	return implode( ';', $styles );
};

$cell_attrs = function ( $item ) {
	$adv  = ! empty( $item['advance'] );
	$out  = '';
	if ( $adv && ! empty( $item['colspan'] ) && '' !== ( $item['colspanNumber'] ?? '' ) ) {
		$out .= ' colspan="' . esc_attr( (int) $item['colspanNumber'] ) . '"';
	}
	if ( $adv && ! empty( $item['rowspan'] ) && '' !== ( $item['rowspanNumber'] ?? '' ) ) {
		$out .= ' rowspan="' . esc_attr( (int) $item['rowspanNumber'] ) . '"';
	}
	return $out;
};

$tooltip_html = function ( $item ) use ( $render_icon, $default_tip_icon, $tooltip_align ) {
	if ( empty( $item['tooltip'] ) || '' === ( $item['tooltipDesc'] ?? '' ) ) {
		return '';
	}
	$icon = $render_icon( $item['tooltipIcon'] ?? '' );
	if ( '' === $icon ) {
		$icon = $default_tip_icon;
	}
	return '<span class="shapeblock-tbl-tooltip" data-placement="' . esc_attr( $tooltip_align ) . '">'
		. $icon // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		. '<span class="shapeblock-tbl-tooltip-content">' . esc_html( $item['tooltipDesc'] ) . '</span>'
		. '</span>';
};
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<?php // A table cannot shrink past its own content, so it gets a box to scroll in. ?>
	<div class="shapeblock-table-scroll">
	<table class="shapeblock-table">
		<?php if ( ! empty( $header ) ) : ?>
			<thead class="shapeblock-table-header">
				<tr>
					<?php
					foreach ( $header as $item ) {
						$style = $cell_style( $item );
						$icon  = ( ! empty( $item['headerIcon'] ) ) ? $render_icon( $item['headIcon'] ?? '' ) : '';
						echo '<th class="shapeblock-th"' . $cell_attrs( $item ) . ( $style ? ' style="' . esc_attr( $style ) . '"' : '' ) . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						if ( '' !== $icon ) {
							echo '<span class="shapeblock-header-icon">' . $icon . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						echo wp_kses_post( $item['text'] ?? '' );
						echo $tooltip_html( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo '</th>';
					}
					?>
				</tr>
			</thead>
		<?php endif; ?>

		<?php if ( ! empty( $body ) ) : ?>
			<tbody class="shapeblock-table-body">
				<tr>
					<?php
					foreach ( $body as $index => $item ) {
						if ( $index > 0 && ! empty( $item['row'] ) ) {
							echo '</tr><tr>';
						}
						$type      = isset( $item['type'] ) ? $item['type'] : 'icon';
						$flex      = ! empty( $item['dataFlex'] ) ? ' shapeblock-data-flex' : '';
						$style     = $cell_style( $item );
						$icon_color = ( ! empty( $item['advance'] ) && ! empty( $item['iconColor'] ) ) ? ' style="color:' . esc_attr( $item['iconColor'] ) . '"' : '';

						echo '<td class="shapeblock-td' . esc_attr( $flex ) . '"' . $cell_attrs( $item ) . ( $style ? ' style="' . esc_attr( $style ) . '"' : '' ) . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

						if ( 'image' === $type && ! empty( $item['image']['url'] ) ) {
							echo '<img src="' . esc_url( $item['image']['url'] ) . '" class="shapeblock-table-image" alt="' . esc_attr( $item['image']['alt'] ?? '' ) . '">';
						} elseif ( 'icon' === $type ) {
							$ic = $render_icon( $item['icon'] ?? '' );
							if ( '' !== $ic ) {
								echo '<span' . $icon_color . '>' . $ic . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							}
						}

						echo wp_kses_post( $item['text'] ?? '' );
						echo $tooltip_html( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo '</td>';
					}
					?>
				</tr>
			</tbody>
		<?php endif; ?>

		<?php if ( ! empty( $footer ) ) : ?>
			<tfoot class="shapeblock-table-footer">
				<tr>
					<?php
					foreach ( $footer as $item ) {
						$style = $cell_style( $item );
						echo '<th class="shapeblock-tf"' . $cell_attrs( $item ) . ( $style ? ' style="' . esc_attr( $style ) . '"' : '' ) . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo wp_kses_post( $item['text'] ?? '' );
						echo $tooltip_html( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo '</th>';
					}
					?>
				</tr>
			</tfoot>
		<?php endif; ?>
	</table>
	</div>
</div>
