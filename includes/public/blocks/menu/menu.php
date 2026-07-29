<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function eelfg_create_block_menu_block_init() {
	// Shared style handle (front-end + editor) so render.php styling stays consistent.
	// Version follows the CSS file's modified time so style updates always bust the browser cache.
	$style_file = __DIR__ . '/build/style-index.css';
	$style_ver  = file_exists( $style_file ) ? filemtime( $style_file ) : EELFG_VERSION;
	wp_register_style(
		'eelfg-menu-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'eelfg-public-style' ),
		$style_ver
	);

	register_block_type(
		__DIR__ . '/build',
		array(
			'style'        => 'eelfg-menu-style',
			'editor_style' => 'eelfg-menu-style',
		)
	);
}
add_action( 'init', 'eelfg_create_block_menu_block_init' );

/**
 * Fetch the full Google Fonts family list from the Google Fonts API.
 *
 * The result is cached for a week to avoid a remote request on every editor load.
 * Returns an empty array on failure; the editor then falls back to a bundled list.
 *
 * @return array List of Google font family names.
 */
function eelfg_menu_get_google_fonts() {
	$cached = get_transient( 'eelfg_menu_google_fonts' );
	if ( is_array( $cached ) && ! empty( $cached ) ) {
		return $cached;
	}

	$fonts    = array();
	$response = wp_remote_get(
		'https://fonts.google.com/metadata/fonts',
		array( 'timeout' => 10 )
	);

	if ( ! is_wp_error( $response ) && 200 === (int) wp_remote_retrieve_response_code( $response ) ) {
		$body = wp_remote_retrieve_body( $response );
		// The endpoint prefixes its JSON with an anti-hijacking token; strip it before decoding.
		$body = preg_replace( '/^\)\]\}\'?/', '', ltrim( (string) $body ) );
		$data = json_decode( $body, true );
		if ( isset( $data['familyMetadataList'] ) && is_array( $data['familyMetadataList'] ) ) {
			foreach ( $data['familyMetadataList'] as $item ) {
				if ( ! empty( $item['family'] ) ) {
					$fonts[] = sanitize_text_field( $item['family'] );
				}
			}
		}
	}

	if ( ! empty( $fonts ) ) {
		set_transient( 'eelfg_menu_google_fonts', $fonts, WEEK_IN_SECONDS );
	}

	return $fonts;
}

/**
 * Expose the fetched Google Fonts list to the Menu block editor script.
 */
function eelfg_menu_enqueue_google_fonts_list() {
	$fonts  = eelfg_menu_get_google_fonts();
	$handle = 'easy-elements-for-gutenberg-menu-editor-script';
	if ( ! empty( $fonts ) && wp_script_is( $handle, 'registered' ) ) {
		wp_add_inline_script(
			$handle,
			'window.eelfgMenuFonts = ' . wp_json_encode( array_values( $fonts ) ) . ';',
			'before'
		);
	}
}
add_action( 'enqueue_block_editor_assets', 'eelfg_menu_enqueue_google_fonts_list' );

/**
 * Recursively sanitize a saved menu tree ( bounded depth / count ) before it is stored.
 *
 * @param mixed $items Raw items array.
 * @param int   $depth Current recursion depth.
 * @return array Clean items.
 */
function eelfg_menu_sanitize_items( $items, $depth = 0 ) {
	$out = array();
	if ( ! is_array( $items ) || $depth > 10 ) {
		return $out;
	}
	$count = 0;
	foreach ( $items as $item ) {
		if ( ! is_array( $item ) ) {
			continue;
		}
		if ( ++$count > 200 ) {
			break;
		}
		$node = array();
		if ( isset( $item['label'] ) ) {
			$node['label'] = wp_kses( (string) $item['label'], array( 'strong' => array(), 'b' => array(), 'em' => array(), 'i' => array() ) );
		}
		if ( isset( $item['url'] ) ) {
			$node['url'] = esc_url_raw( (string) $item['url'] );
		}
		if ( isset( $item['description'] ) ) {
			$node['description'] = sanitize_text_field( (string) $item['description'] );
		}
		if ( isset( $item['newTab'] ) ) {
			$node['newTab'] = (bool) $item['newTab'];
		}
		if ( isset( $item['objectId'] ) ) {
			$node['objectId'] = absint( $item['objectId'] );
		}
		if ( isset( $item['objectType'] ) ) {
			$node['objectType'] = sanitize_key( $item['objectType'] );
		}
		if ( isset( $item['iconType'] ) ) {
			$node['iconType'] = sanitize_key( $item['iconType'] );
		}
		if ( isset( $item['iconName'] ) ) {
			$node['iconName'] = sanitize_key( $item['iconName'] );
		}
		if ( isset( $item['iconUrl'] ) ) {
			$node['iconUrl'] = esc_url_raw( (string) $item['iconUrl'] );
		}
		if ( isset( $item['iconId'] ) ) {
			$node['iconId'] = absint( $item['iconId'] );
		}
		if ( isset( $item['iconSide'] ) ) {
			$node['iconSide'] = sanitize_key( $item['iconSide'] );
		}
		$node['children'] = ( isset( $item['children'] ) && is_array( $item['children'] ) ) ? eelfg_menu_sanitize_items( $item['children'], $depth + 1 ) : array();
		$out[] = $node;
	}
	return $out;
}

/**
 * REST: remember the most recently edited menu, and hand it back so a freshly inserted
 * block can auto-restore it ( the way a brand-new menu comes pre-filled by default ).
 */
function eelfg_menu_register_last_route() {
	register_rest_route(
		'easy-elements/v1',
		'/menu-last',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'eelfg_menu_get_last',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'eelfg_menu_save_last',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			),
		)
	);
}
add_action( 'rest_api_init', 'eelfg_menu_register_last_route' );

/**
 * REST GET: return the last saved menu items.
 *
 * @return WP_REST_Response
 */
function eelfg_menu_get_last() {
	$items = get_option( 'eelfg_menu_last_items', array() );
	if ( ! is_array( $items ) ) {
		$items = array();
	}
	return rest_ensure_response( array( 'items' => $items ) );
}

/**
 * REST POST: store the current menu items as the last used menu.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function eelfg_menu_save_last( WP_REST_Request $request ) {
	$items = eelfg_menu_sanitize_items( $request->get_param( 'items' ) );
	update_option( 'eelfg_menu_last_items', $items, false );
	return rest_ensure_response( array( 'saved' => true ) );
}
