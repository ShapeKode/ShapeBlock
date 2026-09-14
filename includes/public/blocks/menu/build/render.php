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

if ( ! function_exists( 'shapeblock_menu_icon_svg' ) ) {
	/**
	 * Return fixed inline SVG markup for a named menu icon ( '' if unknown ).
	 * The markup is a hard-coded constant ( no user input ), so it is safe to echo.
	 *
	 * @param string $key Icon key.
	 * @return string SVG markup.
	 */
	function shapeblock_menu_icon_svg( $key ) {
		$open = '<svg class="shapeblock-menu-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"';
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

if ( ! function_exists( 'shapeblock_menu_len' ) ) {
	/**
	 * Allow only a simple CSS length ( keeps the generated inline CSS safe ). Empty if invalid.
	 *
	 * @param mixed $v Raw value.
	 * @return string Safe length or ''.
	 */
	function shapeblock_menu_len( $v ) {
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

if ( ! function_exists( 'shapeblock_menu_render_items' ) ) {
	/**
	 * Recursively render menu items to <li> markup.
	 *
	 * @param array  $items         Menu items ( label, url, description, newTab, icon, iconSide, children ).
	 * @param string $dropdown_icon Dropdown-indicator choice ( caret|chevron|arrow|plus|none ).
	 * @return string Escaped HTML.
	 */
	function shapeblock_menu_render_items( $items, $dropdown_icon = 'caret' ) {
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
			// If the item points at a page/post ( stored by ID ), resolve the CURRENT permalink so a
			// changed slug is always reflected — instead of the stale URL saved when it was picked.
			$obj_id = isset( $item['objectId'] ) ? absint( $item['objectId'] ) : 0;
			if ( $obj_id ) {
				$perma = get_permalink( $obj_id );
				if ( $perma ) {
					$url = $perma;
				}
			}
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
				$icon_html = '<span class="shapeblock-menu-item-icon shapeblock-menu-item-icon--' . $icon_side . '" aria-hidden="true"><img class="shapeblock-menu-item-img" src="' . esc_url( $icon_url ) . '" alt="" /></span>';
			} elseif ( 'icon' === $icon_type && '' !== $icon_name ) {
				$svg = shapeblock_menu_icon_svg( $icon_name );
				if ( '' !== $svg ) {
					$icon_html = '<span class="shapeblock-menu-item-icon shapeblock-menu-item-icon--' . $icon_side . '" aria-hidden="true">' . $svg . '</span>';
				}
			}

			// Labels may carry inline Bold / Italic formatting from the editor; allow only those tags.
			$label_html = wp_kses(
				(string) $label,
				array(
					'strong' => array(),
					'b'      => array(),
					'em'     => array(),
					'i'      => array(),
				)
			);
			$text  = '<span class="shapeblock-menu-text"><span class="shapeblock-menu-label">' . $label_html . '</span>';
			if ( '' !== trim( $desc ) ) {
				$text .= '<span class="shapeblock-menu-desc">' . esc_html( $desc ) . '</span>';
			}
			$text .= '</span>';

			$html .= '<li class="menu-item' . ( $has_children ? ' menu-item-has-children' : '' ) . '">';
			$html .= '<a href="' . esc_url( $url ) . '"' . $rel . '>';
			$html .= ( 'left' === $icon_side ) ? $icon_html . $text : $text . $icon_html;
			// The dropdown arrow lives INSIDE the link so it sits inline with the label.
			if ( $has_children ) {
				$svg   = ( '' !== $dd_key ) ? shapeblock_menu_icon_svg( $dd_key ) : '';
				$html .= '<span class="shapeblock-menu-sub-toggle shapeblock-menu-sub-toggle--' . sanitize_html_class( $dd_mod ) . '" aria-hidden="true">' . $svg . '</span>';
			}
			$html .= '</a>';

			if ( $has_children ) {
				$html .= '<ul class="sub-menu">' . shapeblock_menu_render_items( $children, $dropdown_icon ) . '</ul>';
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

$list = shapeblock_menu_render_items( $items, $dropdown_icon );

if ( '' === $list ) {
	if ( $is_editor ) {
		echo '<p class="shapeblock-menu-notice">' . esc_html__( 'Add menu items in the block settings.', 'shapeblock' ) . '</p>';
	}
	return;
}

$block_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( $attributes['blockId'] ) : uniqid( 'shapeblock-menu-' );

// Per-instance styles ( gap + colours + responsive ). Every value is escaped before printing.
$css      = '';
$selector = '#' . $block_id;

// Item gap — responsive ( per-device string attributes; itemGap is the desktop value ).
$gap_desk = ( '' !== $item_gap ) ? shapeblock_menu_len( $item_gap ) : '';
if ( '' !== $gap_desk ) {
	$css .= $selector . ' .shapeblock-menu-list{gap:' . $gap_desk . ';}';
}
$gap_tab = isset( $attributes['gapTablet'] ) ? shapeblock_menu_len( $attributes['gapTablet'] ) : '';
if ( '' !== $gap_tab ) {
	$css .= '@media (max-width:1024px){' . $selector . ' .shapeblock-menu-list{gap:' . $gap_tab . ';}}';
}
$gap_mob = isset( $attributes['gapMobile'] ) ? shapeblock_menu_len( $attributes['gapMobile'] ) : '';
if ( '' !== $gap_mob ) {
	$css .= '@media (max-width:767px){' . $selector . ' .shapeblock-menu-list{gap:' . $gap_mob . ';}}';
}
$has_any_gap = ( '' !== $gap_desk || '' !== $gap_tab || '' !== $gap_mob );

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
	// Web-safe font stack.
	$font_css .= 'font-family:' . $font_stacks[ $font_family ] . ';';
} elseif ( '' !== $font_family ) {
	// Google font: sanitize the family name, enqueue it from Google, then apply it.
	$safe_family = trim( preg_replace( '/[^A-Za-z0-9 ]/', '', $font_family ) );
	if ( '' !== $safe_family ) {
		$font_url = 'https://fonts.googleapis.com/css2?family=' . str_replace( '%20', '+', rawurlencode( $safe_family ) ) . ':wght@300;400;500;600;700&display=swap';
		wp_enqueue_style( 'shapeblock-menu-font-' . sanitize_title( $safe_family ), esc_url_raw( $font_url ), array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- External Google Fonts URL is versioned by Google.
		$font_css .= 'font-family:"' . $safe_family . '",sans-serif;';
	}
}
$font_size  = isset( $attributes['fontSize'] ) ? shapeblock_menu_len( $attributes['fontSize'] ) : '';
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
	$css .= $selector . ' .shapeblock-menu-list a{' . $font_css . '}';
}

// Responsive font size ( per-device ). fontSize above is the desktop value; these override it below.
$fs_tab = isset( $attributes['fontSizeTablet'] ) ? shapeblock_menu_len( $attributes['fontSizeTablet'] ) : '';
if ( '' !== $fs_tab ) {
	$css .= '@media (max-width:1024px){' . $selector . ' .shapeblock-menu-list a{font-size:' . $fs_tab . ';}}';
}
$fs_mob = isset( $attributes['fontSizeMobile'] ) ? shapeblock_menu_len( $attributes['fontSizeMobile'] ) : '';
if ( '' !== $fs_mob ) {
	$css .= '@media (max-width:767px){' . $selector . ' .shapeblock-menu-list a{font-size:' . $fs_mob . ';}}';
}

if ( ! empty( $attributes['textColor'] ) ) {
	$css .= $selector . ' .shapeblock-menu-list a{color:' . esc_attr( $attributes['textColor'] ) . ';}';
}
if ( ! empty( $attributes['hoverColor'] ) ) {
	$css .= $selector . ' .shapeblock-menu-list a:hover,' . $selector . ' .shapeblock-menu-list a:focus{color:' . esc_attr( $attributes['hoverColor'] ) . ';}';
}
if ( ! empty( $attributes['activeColor'] ) ) {
	$css .= $selector . ' .shapeblock-menu-list .current-menu-item > a{color:' . esc_attr( $attributes['activeColor'] ) . ';}';
}
if ( ! empty( $attributes['descriptionColor'] ) ) {
	$css .= $selector . ' .shapeblock-menu-desc{color:' . esc_attr( $attributes['descriptionColor'] ) . ';}';
}
// Backgrounds prefer the gradient when set, otherwise the solid colour.
$item_bg_n   = ! empty( $attributes['itemBgGradient'] ) ? $attributes['itemBgGradient'] : ( ! empty( $attributes['itemBgColor'] ) ? $attributes['itemBgColor'] : '' );
$item_bg_h   = ! empty( $attributes['itemBgHoverGradient'] ) ? $attributes['itemBgHoverGradient'] : ( ! empty( $attributes['itemBgHoverColor'] ) ? $attributes['itemBgHoverColor'] : '' );
$item_bg_a   = ! empty( $attributes['itemBgActiveGradient'] ) ? $attributes['itemBgActiveGradient'] : ( ! empty( $attributes['itemBgActiveColor'] ) ? $attributes['itemBgActiveColor'] : '' );
$dd_bg       = ! empty( $attributes['dropdownBgGradient'] ) ? $attributes['dropdownBgGradient'] : ( ! empty( $attributes['dropdownBg'] ) ? $attributes['dropdownBg'] : '' );
$dd_hover_bg = ! empty( $attributes['dropdownHoverBgGradient'] ) ? $attributes['dropdownHoverBgGradient'] : ( ! empty( $attributes['dropdownHoverBg'] ) ? $attributes['dropdownHoverBg'] : '' );
// Item background ( normal / hover / active ). Any background opts items into padded pills.
if ( '' !== $item_bg_n || '' !== $item_bg_h || '' !== $item_bg_a ) {
	$css .= $selector . ' .shapeblock-menu-list > li > a{padding:8px 14px;border-radius:6px;}';
}
if ( '' !== $item_bg_n ) {
	$css .= $selector . ' .shapeblock-menu-list > li > a{background:' . esc_attr( $item_bg_n ) . ';}';
}
if ( '' !== $item_bg_h ) {
	$css .= $selector . ' .shapeblock-menu-list > li > a:hover,' . $selector . ' .shapeblock-menu-list > li > a:focus{background:' . esc_attr( $item_bg_h ) . ';}';
}
if ( '' !== $item_bg_a ) {
	$css .= $selector . ' .shapeblock-menu-list > li.current-menu-item > a{background:' . esc_attr( $item_bg_a ) . ';}';
}
// Dropdown ( sub-menu ) colours.
if ( '' !== $dd_bg ) {
	$css .= $selector . ' .sub-menu{background:' . esc_attr( $dd_bg ) . ';}';
}
if ( ! empty( $attributes['dropdownTextColor'] ) ) {
	$css .= $selector . ' .sub-menu a{color:' . esc_attr( $attributes['dropdownTextColor'] ) . ';}';
}
if ( ! empty( $attributes['dropdownHoverColor'] ) ) {
	$css .= $selector . ' .sub-menu a:hover,' . $selector . ' .sub-menu a:focus{color:' . esc_attr( $attributes['dropdownHoverColor'] ) . ';}';
}
if ( '' !== $dd_hover_bg ) {
	$css .= $selector . ' .sub-menu a:hover,' . $selector . ' .sub-menu a:focus{background:' . esc_attr( $dd_hover_bg ) . ';}';
}
if ( ! empty( $attributes['toggleColor'] ) ) {
	$css .= $selector . ' .shapeblock-menu-toggle{color:' . esc_attr( $attributes['toggleColor'] ) . ';}';
}

// Hamburger button skin. The base stylesheet ships a transparent background and
// `border:1px solid currentColor`, so each option below only overrides what the
// user actually sets — leave them empty and the button looks exactly as before.
$toggle_sel   = $selector . ' .shapeblock-menu-toggle';
$toggle_hover = $toggle_sel . ':hover,' . $toggle_sel . ':focus';

if ( ! empty( $attributes['toggleBg'] ) ) {
	$css .= $toggle_sel . '{background:' . esc_attr( $attributes['toggleBg'] ) . ';}';
}
if ( ! empty( $attributes['toggleBorderColor'] ) ) {
	$css .= $toggle_sel . '{border-color:' . esc_attr( $attributes['toggleBorderColor'] ) . ';}';
}
// Hover: colour drives the bars too, since they are painted with currentColor.
if ( ! empty( $attributes['toggleColorHover'] ) ) {
	$css .= $toggle_hover . '{color:' . esc_attr( $attributes['toggleColorHover'] ) . ';}';
}
if ( ! empty( $attributes['toggleBgHover'] ) ) {
	$css .= $toggle_hover . '{background:' . esc_attr( $attributes['toggleBgHover'] ) . ';}';
}
if ( ! empty( $attributes['toggleBorderColorHover'] ) ) {
	$css .= $toggle_hover . '{border-color:' . esc_attr( $attributes['toggleBorderColorHover'] ) . ';}';
}

// Drawer close button skin. Its icon colour used to be painted by toggleColor, so
// when closeColor is left empty it still follows the hamburger — existing menus
// keep the exact look they had. Every other close option stands on its own.
$close_sel   = $selector . ' .shapeblock-menu-close';
$close_hover = $close_sel . ':hover,' . $close_sel . ':focus';
$close_color = '' !== $attributes['closeColor'] ? $attributes['closeColor'] : $attributes['toggleColor'];

if ( ! empty( $close_color ) ) {
	$css .= $close_sel . '{color:' . esc_attr( $close_color ) . ';}';
}
if ( ! empty( $attributes['closeBg'] ) ) {
	$css .= $close_sel . '{background:' . esc_attr( $attributes['closeBg'] ) . ';}';
}
if ( ! empty( $attributes['closeBorderColor'] ) ) {
	$css .= $close_sel . '{border-color:' . esc_attr( $attributes['closeBorderColor'] ) . ';}';
}
if ( ! empty( $attributes['closeColorHover'] ) ) {
	$css .= $close_hover . '{color:' . esc_attr( $attributes['closeColorHover'] ) . ';}';
}
if ( ! empty( $attributes['closeBgHover'] ) ) {
	$css .= $close_hover . '{background:' . esc_attr( $attributes['closeBgHover'] ) . ';}';
}
if ( ! empty( $attributes['closeBorderColorHover'] ) ) {
	$css .= $close_hover . '{border-color:' . esc_attr( $attributes['closeBorderColorHover'] ) . ';}';
}


// Wrapping: allow menu items to wrap to multiple lines ( default ) or stay on one line.
if ( ! $menu_wrap ) {
	$css .= $selector . ' .shapeblock-menu-list{flex-wrap:nowrap;}';
}

// Overlay: turn the menu into an off-canvas drawer with a hamburger + backdrop.
// "mobile" applies it below the breakpoint; "always" applies it on every screen.
if ( $mobile_on ) {
	$off    = ( 'left' === $drawer_side ) ? '-100%' : '100%';
	$w_css  = esc_attr( $drawer_width ) . 'px';
	$bg_css = esc_attr( $drawer_bg );
	$side   = $drawer_side; // 'left' or 'right', both safe literals.

	// Where the hamburger button sits on the row. `display:flex` makes it a block
	// box so the auto margins can push it; it stays inside $drawer so the rule is
	// scoped exactly like the rest of the overlay CSS ( "always" = every screen,
	// "mobile" = only below the breakpoint ).
	$toggle_align = isset( $attributes['toggleAlign'] ) ? $attributes['toggleAlign'] : 'left';
	if ( 'center' === $toggle_align ) {
		$toggle_margin = 'margin-left:auto;margin-right:auto;';
	} elseif ( 'right' === $toggle_align ) {
		$toggle_margin = 'margin-left:auto;margin-right:0;';
	} else {
		$toggle_margin = 'margin-left:0;margin-right:auto;';
	}

	// The rules that make the menu an off-canvas drawer.
	$drawer  = '';
	$drawer .= $selector . ' .shapeblock-menu-toggle{display:flex;' . $toggle_margin . '}';
	$drawer .= $selector . ' .shapeblock-menu-close{display:flex;}';
	$drawer .= $selector . ' .shapeblock-menu-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;z-index:9998;}';
	$drawer .= $selector . '.is-open .shapeblock-menu-overlay{opacity:1;visibility:visible;}';
	$drawer .= $selector . ' .shapeblock-menu-panel{display:block;position:fixed;top:0;bottom:0;' . $side . ':0;width:' . $w_css . ';max-width:85vw;background:' . $bg_css . ';transform:translateX(' . $off . ');transition:transform 0.3s ease;z-index:9999;overflow-y:auto;padding:56px 22px 28px;}';
	$drawer .= $selector . '.is-open .shapeblock-menu-panel{transform:translateX(0);}';
	$drawer .= $selector . ' .shapeblock-menu-list{flex-direction:column;align-items:stretch;width:100%;' . ( $has_any_gap ? '' : 'gap:6px;' ) . '}';
	$drawer .= $selector . ' .shapeblock-menu-list li{position:relative;width:100%;}';
	// Every item ( link + sub-items ) fills the row, so the label sits left and the arrow far right.
	$drawer .= $selector . ' .shapeblock-menu-list a{display:flex;align-items:center;width:100%;padding:12px 14px;}';
	$drawer .= $selector . ' .shapeblock-menu-list .shapeblock-menu-sub-toggle{flex:0 0 auto;margin-left:auto;}';
	// Sub-menus drop down as an indented accordion inside the drawer ( no side fly-out ).
	$drawer .= $selector . ' .shapeblock-menu-list .sub-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;border-radius:0;min-width:0;width:100%;padding:0 0 0 14px;max-height:0;overflow:hidden;transition:max-height 0.35s ease;}';
	$drawer .= $selector . ' .menu-item-has-children.is-sub-open > .sub-menu{max-height:1200px;}';

	// Mobile-only colours ( override the desktop colours while the drawer is active ).
	$m_bg_n = ! empty( $attributes['mobileBgGradient'] ) ? $attributes['mobileBgGradient'] : ( ! empty( $attributes['mobileBgColor'] ) ? $attributes['mobileBgColor'] : '' );
	$m_bg_h = ! empty( $attributes['mobileBgHoverGradient'] ) ? $attributes['mobileBgHoverGradient'] : ( ! empty( $attributes['mobileBgHoverColor'] ) ? $attributes['mobileBgHoverColor'] : '' );
	$m_bg_a = ! empty( $attributes['mobileBgActiveGradient'] ) ? $attributes['mobileBgActiveGradient'] : ( ! empty( $attributes['mobileBgActiveColor'] ) ? $attributes['mobileBgActiveColor'] : '' );
	if ( ! empty( $attributes['mobileTextColor'] ) ) {
		$drawer .= $selector . ' .shapeblock-menu-list a{color:' . esc_attr( $attributes['mobileTextColor'] ) . ';}';
	}
	if ( ! empty( $attributes['mobileHoverColor'] ) ) {
		$drawer .= $selector . ' .shapeblock-menu-list a:hover,' . $selector . ' .shapeblock-menu-list a:focus{color:' . esc_attr( $attributes['mobileHoverColor'] ) . ';}';
	}
	if ( ! empty( $attributes['mobileActiveColor'] ) ) {
		$drawer .= $selector . ' .shapeblock-menu-list .current-menu-item > a{color:' . esc_attr( $attributes['mobileActiveColor'] ) . ';}';
	}
	if ( '' !== $m_bg_n ) {
		$drawer .= $selector . ' .shapeblock-menu-list > li > a{background:' . esc_attr( $m_bg_n ) . ';border-radius:6px;}';
	}
	if ( '' !== $m_bg_h ) {
		$drawer .= $selector . ' .shapeblock-menu-list > li > a:hover,' . $selector . ' .shapeblock-menu-list > li > a:focus{background:' . esc_attr( $m_bg_h ) . ';}';
	}
	if ( '' !== $m_bg_a ) {
		$drawer .= $selector . ' .shapeblock-menu-list > li.current-menu-item > a{background:' . esc_attr( $m_bg_a ) . ';}';
	}

	if ( 'always' === $mobile_mode ) {
		// Hamburger drawer on every screen size.
		$css .= $drawer;
	} else {
		// Desktop stays a normal menu; the drawer kicks in below the breakpoint.
		$css .= $selector . ' .shapeblock-menu-panel{display:contents;}';
		$css .= $selector . ' .shapeblock-menu-toggle,' . $selector . ' .shapeblock-menu-close{display:none;}';
		$css .= $selector . ' .shapeblock-menu-overlay{display:none;}';
		$css .= '@media (max-width:' . (int) $breakpoint . 'px){' . $drawer . '}';
	}
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'              => $block_id,
		'class'           => 'shapeblock-menu shapeblock-menu--' . $layout . ' shapeblock-menu-align-' . $alignment
			. ( $mobile_on ? ' shapeblock-menu-has-mobile' : '' )
			. ( 'always' === $mobile_mode ? ' shapeblock-menu-overlay-always' : '' )
			. ( $submenu_click ? ' shapeblock-menu-click' : '' ),
		'data-breakpoint' => (string) $breakpoint,
	)
);

$toggle = $mobile_on
	? '<button type="button" class="shapeblock-menu-toggle" aria-expanded="false" aria-label="' . esc_attr__( 'Toggle menu', 'shapeblock' ) . '"><span class="shapeblock-menu-toggle-bar"></span><span class="shapeblock-menu-toggle-bar"></span><span class="shapeblock-menu-toggle-bar"></span></button>'
	: '';

// Overlay backdrop + in-panel close button ( only used on mobile / off-canvas ).
$overlay = $mobile_on ? '<div class="shapeblock-menu-overlay" aria-hidden="true"></div>' : '';
$close   = $mobile_on
	? '<button type="button" class="shapeblock-menu-close" aria-label="' . esc_attr__( 'Close menu', 'shapeblock' ) . '">' . shapeblock_menu_icon_svg( 'close' ) . '</button>'
	: '';

// $wrapper_attributes escaped by core; $toggle/$overlay/$close are fixed strings; $list is escaped
// per item; $css only from esc_attr()'d values above.
printf(
	'%5$s<nav %1$s>%3$s%4$s<div class="shapeblock-menu-panel">%6$s<ul class="shapeblock-menu-list">%2$s</ul></div></nav>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by core.
	$list,               // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped per item above.
	$toggle,             // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup, escaped label.
	$overlay,            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup.
	'' !== $css ? '<style>' . $css . '</style>' : '', // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Values escaped with esc_attr().
	$close               // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed markup, escaped label.
);
