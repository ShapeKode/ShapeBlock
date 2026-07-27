<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Menu block.
 *
 * The menu is stored in the block's own "items" attribute (self-contained), so it works
 * with any theme. $attributes, $content and $block come from register_block_type().
 */

if ( ! function_exists( 'eelfg_menu_icon_svg' ) ) {
	/**
	 * Return fixed inline SVG markup for a named menu icon ( '' if unknown ).
	 * The markup is a hard-coded constant ( no user input ), so it is safe to echo.
	 *
	 * @param string $key Icon key.
	 * @return string SVG markup.
	 */
	function eelfg_menu_icon_svg( $key ) {
		$open = '<svg class="eelfg-menu-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"';
		$line = ' fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
		switch ( $key ) {
			case 'caret':
				return $open . ' fill="currentColor"><path d="M8 11 3.6 6.2h8.8z"/></svg>';
			case 'chevron-down':
				return $open . $line . '><path d="m4 6 4 4 4-4"/></svg>';
			case 'arrow-down':
				return $open . $line . '><path d="M8 3.5v9"/><path d="m4.5 9 3.5 3.5L11.5 9"/></svg>';
			case 'plus':
				return $open . $line . '><path d="M8 3.5v9"/><path d="M3.5 8h9"/></svg>';
			case 'arrow-right':
				return $open . $line . '><path d="M3.5 8h9"/><path d="M9 4.5 12.5 8 9 11.5"/></svg>';
			case 'chevron-right':
				return $open . $line . '><path d="m6 4 4 4-4 4"/></svg>';
			case 'external':
				return $open . $line . '><path d="M6.5 3.5H3.5v9h9v-3"/><path d="M9.5 3.5h3v3"/><path d="M12.5 3.5 7.5 8.5"/></svg>';
			case 'star':
				return $open . $line . '><path d="M8 2.5 9.7 6l3.8.5-2.8 2.7.7 3.8L8 11.7 4.6 13l.7-3.8L2.5 6.5 6.3 6z"/></svg>';
			case 'heart':
				return $open . $line . '><path d="M8 13.3S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.3 8 13.3z"/></svg>';
			case 'check':
				return $open . $line . '><path d="m3.5 8.5 3 3 6-7"/></svg>';
			case 'home':
				return $open . $line . '><path d="M3 8l5-4.5L13 8"/><path d="M4.5 7v6h7V7"/></svg>';
			case 'user':
				return $open . $line . '><circle cx="8" cy="6" r="2.5"/><path d="M3.5 13c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4"/></svg>';
			case 'cart':
				return $open . $line . '><path d="M2.5 3h1.5l1.1 7h6.2l1.2-5H4.6"/><circle cx="6.5" cy="12.5" r="0.9"/><circle cx="11" cy="12.5" r="0.9"/></svg>';
			case 'search':
				return $open . $line . '><circle cx="7" cy="7" r="3.5"/><path d="m12.5 12.5-2.8-2.8"/></svg>';
			case 'phone':
				return $open . $line . '><path d="M4 3h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5l1-1.5 3 1v2c0 .6-.5 1.1-1.1 1A9.4 9.4 0 0 1 3 4.1C2.9 3.5 3.4 3 4 3z"/></svg>';
			case 'envelope':
				return $open . $line . '><rect x="2.5" y="4" width="11" height="8" rx="1"/><path d="m3 4.5 5 4 5-4"/></svg>';
			case 'close':
				return $open . $line . '><path d="m4 4 8 8"/><path d="m12 4-8 8"/></svg>';
		}
		return '';
	}
}

if ( ! function_exists( 'eelfg_menu_len' ) ) {
	/**
	 * Allow only a simple CSS length ( keeps the generated inline CSS safe ). Empty if invalid.
	 *
	 * @param mixed $v Raw value.
	 * @return string Safe length or ''.
	 */
	function eelfg_menu_len( $v ) {
		$v = trim( (string) $v );
		if ( '' === $v ) {
			return '';
		}
		// A bare number becomes px so it actually applies as CSS.
		if ( preg_match( '/^-?\d+(\.\d+)?$/', $v ) ) {
			return $v . 'px';
		}
		return preg_match( '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/', $v ) ? $v : '';
	}
}

if ( ! function_exists( 'eelfg_menu_render_items' ) ) {
	/**
	 * Recursively render menu items to <li> markup.
	 *
	 * @param array  $items         Menu items ( label, url, description, newTab, icon, iconSide, children ).
	 * @param string $dropdown_icon Dropdown-indicator choice ( caret|chevron|arrow|plus|none ).
	 * @return string Escaped HTML.
	 */
	function eelfg_menu_render_items( $items, $dropdown_icon = 'caret' ) {
		if ( empty( $items ) || ! is_array( $items ) ) {
			return '';
		}

		// Resolve the dropdown-indicator SVG key ( '' means "no indicator" ).
		$dd_map = array(
			'chevron' => 'chevron-down',
			'arrow'   => 'arrow-down',
			'plus'    => 'plus',
			'caret'   => 'caret',
		);
		$dd_key = ( 'none' === $dropdown_icon ) ? '' : ( isset( $dd_map[ $dropdown_icon ] ) ? $dd_map[ $dropdown_icon ] : 'caret' );
		$dd_mod = ( 'none' === $dropdown_icon ) ? 'none' : ( isset( $dd_map[ $dropdown_icon ] ) ? $dropdown_icon : 'caret' );

		$html = '';

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$label     = isset( $item['label'] ) ? (string) $item['label'] : '';
			$url       = ! empty( $item['url'] ) ? $item['url'] : '#';
			$desc      = isset( $item['description'] ) ? (string) $item['description'] : '';
			$new_tab   = ! empty( $item['newTab'] );
			$icon_url  = isset( $item['iconUrl'] ) ? (string) $item['iconUrl'] : '';
			$icon_name = isset( $item['iconName'] ) ? sanitize_key( $item['iconName'] ) : '';
			$icon_side = ( isset( $item['iconSide'] ) && 'left' === $item['iconSide'] ) ? 'left' : 'right';
			$children  = ( isset( $item['children'] ) && is_array( $item['children'] ) ) ? $item['children'] : array();

			// Effective icon type ( supports older image-only data ).
			$icon_type = isset( $item['iconType'] ) ? (string) $item['iconType'] : '';
			if ( '' === $icon_type ) {
				$icon_type = ( '' !== $icon_url ) ? 'image' : ( ( '' !== $icon_name ) ? 'icon' : 'none' );
			}

			if ( '' === trim( $label ) && '#' === $url && '' === trim( $desc ) && empty( $children ) ) {
				continue;
			}

			$has_children = ! empty( $children );
			$rel          = $new_tab ? ' target="_blank" rel="noopener noreferrer"' : '';

			// Per-item icon markup: a built-in SVG icon or the user's uploaded image.
			$icon_html = '';
			if ( 'image' === $icon_type && '' !== $icon_url ) {
				$icon_html = '<span class="eelfg-menu-item-icon eelfg-menu-item-icon--' . $icon_side . '" aria-hidden="true"><img class="eelfg-menu-item-img" src="' . esc_url( $icon_url ) . '" alt="" /></span>';
			} elseif ( 'icon' === $icon_type && '' !== $icon_name ) {
				$svg = eelfg_menu_icon_svg( $icon_name );
				if ( '' !== $svg ) {
					$icon_html = '<span class="eelfg-menu-item-icon eelfg-menu-item-icon--' . $icon_side . '" aria-hidden="true">' . $svg . '</span>';
				}
			}

			$text  = '<span class="eelfg-menu-text"><span class="eelfg-menu-label">' . esc_html( $label ) . '</span>';
			if ( '' !== trim( $desc ) ) {
				$text .= '<span class="eelfg-menu-desc">' . esc_html( $desc ) . '</span>';
			}
			$text .= '</span>';

			$html .= '<li class="menu-item' . ( $has_children ? ' menu-item-has-children' : '' ) . '">';
			$html .= '<a href="' . esc_url( $url ) . '"' . $rel . '>';
			$html .= ( 'left' === $icon_side ) ? $icon_html . $text : $text . $icon_html;
			$html .= '</a>';

			if ( $has_children ) {
				$svg   = ( '' !== $dd_key ) ? eelfg_menu_icon_svg( $dd_key ) : '';
				$html .= '<span class="eelfg-menu-sub-toggle eelfg-menu-sub-toggle--' . sanitize_html_class( $dd_mod ) . '" aria-hidden="true">' . $svg . '</span>';
				$html .= '<ul class="sub-menu">' . eelfg_menu_render_items( $children, $dropdown_icon ) . '</ul>';
			}

			$html .= '</li>';
		}

		return $html;
	}
}

$items         = ( isset( $attributes['items'] ) && is_array( $attributes['items'] ) ) ? $attributes['items'] : array();
$dropdown_icon = isset( $attributes['dropdownIcon'] ) ? sanitize_key( $attributes['dropdownIcon'] ) : 'caret';
if ( ! in_array( $dropdown_icon, array( 'caret', 'chevron', 'arrow', 'plus', 'none' ), true ) ) {
	$dropdown_icon = 'caret';
}
$layout      = ( isset( $attributes['layout'] ) && 'vertical' === $attributes['layout'] ) ? 'vertical' : 'horizontal';
$alignment   = isset( $attributes['alignment'] ) ? sanitize_html_class( $attributes['alignment'] ) : 'left';
$item_gap    = isset( $attributes['itemGap'] ) ? trim( (string) $attributes['itemGap'] ) : '';
// Overlay mode: off | mobile | always ( falls back to the old mobileEnable boolean ).
$mobile_mode = isset( $attributes['mobileMode'] ) ? (string) $attributes['mobileMode'] : '';
if ( ! in_array( $mobile_mode, array( 'off', 'mobile', 'always' ), true ) ) {
	$mobile_mode = ( isset( $attributes['mobileEnable'] ) && empty( $attributes['mobileEnable'] ) ) ? 'off' : 'mobile';
}
$mobile_on   = ( 'off' !== $mobile_mode );
$submenu_click = ( isset( $attributes['submenuTrigger'] ) && 'click' === $attributes['submenuTrigger'] );
$menu_wrap   = ! isset( $attributes['menuWrap'] ) || ! empty( $attributes['menuWrap'] );
$breakpoint  = isset( $attributes['mobileBreakpoint'] ) ? absint( $attributes['mobileBreakpoint'] ) : 782;
if ( $breakpoint < 320 || $breakpoint > 2000 ) {
	$breakpoint = 782;
}

// Off-canvas drawer settings ( mobile ).
$drawer_side  = ( isset( $attributes['drawerSide'] ) && 'left' === $attributes['drawerSide'] ) ? 'left' : 'right';
$drawer_width = isset( $attributes['drawerWidth'] ) ? absint( $attributes['drawerWidth'] ) : 320;
if ( $drawer_width < 200 || $drawer_width > 600 ) {
	$drawer_width = 320;
}
$drawer_bg = ! empty( $attributes['drawerBg'] ) ? $attributes['drawerBg'] : '#ffffff';

$is_editor = ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin();

$list = eelfg_menu_render_items( $items, $dropdown_icon );

if ( '' === $list ) {
	if ( $is_editor ) {
		echo '<p class="eelfg-menu-notice">' . esc_html__( 'Add menu items in the block settings.', 'easy-elements-for-gutenberg' ) . '</p>';
	}
	return;
}

$block_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( $attributes['blockId'] ) : uniqid( 'eelfg-menu-' );

// Per-instance styles ( gap + colours + responsive ). Every value is escaped before printing.
$css      = '';
$selector = '#' . $block_id;

// Item gap — responsive ( per-device string attributes; itemGap is the desktop value ).
$gap_desk = ( '' !== $item_gap ) ? eelfg_menu_len( $item_gap ) : '';
if ( '' !== $gap_desk ) {
	$css .= $selector . ' > .eelfg-menu-list{gap:' . $gap_desk . ';}';
}
$gap_tab = isset( $attributes['gapTablet'] ) ? eelfg_menu_len( $attributes['gapTablet'] ) : '';
if ( '' !== $gap_tab ) {
	$css .= '@media (max-width:1024px){' . $selector . ' > .eelfg-menu-list{gap:' . $gap_tab . ';}}';
}
$gap_mob = isset( $attributes['gapMobile'] ) ? eelfg_menu_len( $attributes['gapMobile'] ) : '';
if ( '' !== $gap_mob ) {
	$css .= '@media (max-width:767px){' . $selector . ' > .eelfg-menu-list{gap:' . $gap_mob . ';}}';
}

// Typography ( font family / size / weight / transform ), validated to safe values.
$font_css   = '';
$font_stacks = array(
	'system'    => '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
	'arial'     => 'Arial,Helvetica,sans-serif',
	'helvetica' => '"Helvetica Neue",Helvetica,Arial,sans-serif',
	'georgia'   => 'Georgia,"Times New Roman",serif',
	'times'     => '"Times New Roman",Times,serif',
	'courier'   => '"Courier New",Courier,monospace',
	'verdana'   => 'Verdana,Geneva,sans-serif',
	'tahoma'    => 'Tahoma,Geneva,sans-serif',
);
$font_family = isset( $attributes['fontFamily'] ) ? (string) $attributes['fontFamily'] : '';
if ( isset( $font_stacks[ $font_family ] ) ) {
	$font_css .= 'font-family:' . $font_stacks[ $font_family ] . ';';
}
$font_size  = isset( $attributes['fontSize'] ) ? eelfg_menu_len( $attributes['fontSize'] ) : '';
if ( '' !== $font_size ) {
	$font_css .= 'font-size:' . $font_size . ';';
}
$font_weight = isset( $attributes['fontWeight'] ) ? preg_replace( '/[^0-9]/', '', (string) $attributes['fontWeight'] ) : '';
if ( '' !== $font_weight ) {
	$font_css .= 'font-weight:' . $font_weight . ';';
}
$text_transform = isset( $attributes['textTransform'] ) ? (string) $attributes['textTransform'] : '';
if ( in_array( $text_transform, array( 'none', 'uppercase', 'lowercase', 'capitalize' ), true ) ) {
	$font_css .= 'text-transform:' . $text_transform . ';';
}
if ( '' !== $font_css ) {
	$css .= $selector . ' .eelfg-menu-list a{' . $font_css . '}';
}

if ( ! empty( $attributes['textColor'] ) ) {
	$css .= $selector . ' .eelfg-menu-list a{color:' . esc_attr( $attributes['textColor'] ) . ';}';
}
if ( ! empty( $attributes['hoverColor'] ) ) {
	$css .= $selector . ' .eelfg-menu-list a:hover,' . $selector . ' .eelfg-menu-list a:focus{color:' . esc_attr( $attributes['hoverColor'] ) . ';}';
}
if ( ! empty( $attributes['activeColor'] ) ) {
	$css .= $selector . ' .eelfg-menu-list .current-menu-item > a{color:' . esc_attr( $attributes['activeColor'] ) . ';}';
}
if ( ! empty( $attributes['descriptionColor'] ) ) {
	$css .= $selector . ' .eelfg-menu-desc{color:' . esc_attr( $attributes['descriptionColor'] ) . ';}';
}
if ( ! empty( $attributes['toggleColor'] ) ) {
	$css .= $selector . ' .eelfg-menu-toggle,' . $selector . ' .eelfg-menu-close{color:' . esc_attr( $attributes['toggleColor'] ) . ';}';
}


// Wrapping: allow menu items to wrap to multiple lines ( default ) or stay on one line.
if ( ! $menu_wrap ) {
	$css .= $selector . ' > .eelfg-menu-list{flex-wrap:nowrap;}';
}

// Overlay: turn the menu into an off-canvas drawer with a hamburger + backdrop.
// "mobile" applies it below the breakpoint; "always" applies it on every screen.
if ( $mobile_on ) {
	$off    = ( 'left' === $drawer_side ) ? '-100%' : '100%';
	$w_css  = esc_attr( $drawer_width ) . 'px';
	$bg_css = esc_attr( $drawer_bg );
	$side   = $drawer_side; // 'left' or 'right', both safe literals.

	// The rules that make the menu an off-canvas drawer.
	$drawer  = '';
	$drawer .= $selector . ' .eelfg-menu-toggle{display:inline-flex;}';
	$drawer .= $selector . ' .eelfg-menu-close{display:flex;}';
	$drawer .= $selector . ' .eelfg-menu-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;z-index:9998;}';
	$drawer .= $selector . '.is-open .eelfg-menu-overlay{opacity:1;visibility:visible;}';
	$drawer .= $selector . ' .eelfg-menu-panel{display:block;position:fixed;top:0;bottom:0;' . $side . ':0;width:' . $w_css . ';max-width:85vw;background:' . $bg_css . ';transform:translateX(' . $off . ');transition:transform 0.3s ease;z-index:9999;overflow-y:auto;padding:56px 22px 28px;}';
	$drawer .= $selector . '.is-open .eelfg-menu-panel{transform:translateX(0);}';
	$drawer .= $selector . ' .eelfg-menu-list{flex-direction:column;align-items:stretch;width:100%;gap:0;}';
	$drawer .= $selector . ' .eelfg-menu-list li{position:relative;}';
	$drawer .= $selector . ' .eelfg-menu-list a{padding:10px 0;}';
	$drawer .= $selector . ' .eelfg-menu-list .sub-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;border-radius:0;min-width:0;padding-left:16px;max-height:0;overflow:hidden;transition:max-height 0.3s ease;}';
	$drawer .= $selector . ' .menu-item-has-children.is-sub-open > .sub-menu{max-height:1000px;}';

	if ( 'always' === $mobile_mode ) {
		// Hamburger drawer on every screen size.
		$css .= $drawer;
	} else {
		// Desktop stays a normal menu; the drawer kicks in below the breakpoint.
		$css .= $selector . ' .eelfg-menu-panel{display:contents;}';
		$css .= $selector . ' .eelfg-menu-toggle,' . $selector . ' .eelfg-menu-close{display:none;}';
		$css .= $selector . ' .eelfg-menu-overlay{display:none;}';
		$css .= '@media (max-width:' . (int) $breakpoint . 'px){' . $drawer . '}';
	}
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'              => $block_id,
		'class'           => 'eelfg-menu eelfg-menu--' . $layout . ' eelfg-menu-align-' . $alignment
			. ( $mobile_on ? ' eelfg-menu-has-mobile' : '' )
			. ( 'always' === $mobile_mode ? ' eelfg-menu-overlay-always' : '' )
			. ( $submenu_click ? ' eelfg-menu-click' : '' ),
		'data-breakpoint' => (string) $breakpoint,
	)
);

$toggle = $mobile_on
	? '<button type="button" class="eelfg-menu-toggle" aria-expanded="false" aria-label="' . esc_attr__( 'Toggle menu', 'easy-elements-for-gutenberg' ) . '"><span class="eelfg-menu-toggle-bar"></span><span class="eelfg-menu-toggle-bar"></span><span class="eelfg-menu-toggle-bar"></span></button>'
	: '';

// Overlay backdrop + in-panel close button ( only used on mobile / off-canvas ).
$overlay = $mobile_on ? '<div class="eelfg-menu-overlay" aria-hidden="true"></div>' : '';
$close   = $mobile_on
	? '<button type="button" class="eelfg-menu-close" aria-label="' . esc_attr__( 'Close menu', 'easy-elements-for-gutenberg' ) . '">' . eelfg_menu_icon_svg( 'close' ) . '</button>'
	: '';

// $wrapper_attributes escaped by core; $toggle/$overlay/$close are fixed strings; $list is escaped
// per item; $css only from esc_attr()'d values above.
printf(
	'%5$s<nav %1$s>%3$s%4$s<div class="eelfg-menu-panel">%6$s<ul class="eelfg-menu-list">%2$s</ul></div></nav>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by core.
	$list,               // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped per item above.
	$toggle,             // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup, escaped label.
	$overlay,            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup.
	'' !== $css ? '<style>' . $css . '</style>' : '', // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Values escaped with esc_attr().
	$close               // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup, escaped label.
);
