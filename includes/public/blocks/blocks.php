<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Version for a block asset: the file's own modified time, so an updated
 * stylesheet is never served from a stale browser cache between releases.
 *
 * @param string $file Absolute path to the asset.
 * @return string
 */
function shapeblock_asset_version( $file ) {
	return file_exists( $file ) ? (string) filemtime( $file ) : SHAPEBLOCK_VERSION;
}
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

add_action( 'enqueue_block_editor_assets', 'shapeblock_enqueue_block_styles' );
add_action( 'enqueue_block_assets', 'shapeblock_enqueue_block_styles' );
function shapeblock_enqueue_block_styles() {
	
    // if swier not existing
	wp_enqueue_style( 'swiper', SHAPEBLOCK_PL_URL . 'assets/lib/swiper/swiper-bundle.min.css', array(), SHAPEBLOCK_VERSION, 'all' ); 
	wp_enqueue_script( 'swiper', SHAPEBLOCK_PL_URL . 'assets/lib/swiper/swiper-bundle.min.js', array(),'12.0.3',false ); 

	// enqueue bootstrap grid
	wp_enqueue_style( 'shapeblock-bootstrap-grid', SHAPEBLOCK_PL_URL . 'assets/lib/bootstrap/bootstrap-grid.min.css', array(), SHAPEBLOCK_VERSION, 'all' );

    // register plugin style if not registered	
	if (!wp_style_is('shapeblock-public-style', 'registered')) {
		wp_register_style( 
			'shapeblock-public-style', 
			SHAPEBLOCK_PL_URL . 'includes/public/assets/css/public.css', 
			array(), 
			SHAPEBLOCK_VERSION 
		);
	}
}

/**
 * Full Google Fonts family list. Reuses the Menu block's cached weekly fetch
 * when available; returns an empty array otherwise (the editor then falls back
 * to its bundled web-safe list).
 *
 * @return array
 */
if ( ! function_exists( 'shapeblock_get_google_fonts' ) ) {
	function shapeblock_get_google_fonts() {
		if ( function_exists( 'shapeblock_menu_get_google_fonts' ) ) {
			$fonts = shapeblock_menu_get_google_fonts();
			if ( is_array( $fonts ) && ! empty( $fonts ) ) {
				return $fonts;
			}
		}
		return array();
	}
}

/**
 * Expose the Google Fonts list to the block editor as window.shapeblockFonts so the
 * shared Typography control can populate its Font Family dropdown.
 */
function shapeblock_expose_google_fonts_editor() {
	$fonts = shapeblock_get_google_fonts();
	if ( ! empty( $fonts ) && wp_script_is( 'wp-blocks', 'registered' ) ) {
		wp_add_inline_script(
			'wp-blocks',
			'window.shapeblockFonts = ' . wp_json_encode( array_values( $fonts ) ) . ';',
			'before'
		);
	}

	// The placeholder image the repeater controls show for an item whose image
	// has not been chosen yet, so an empty row looks the same in the sidebar as
	// it does on the canvas.
	if ( wp_script_is( 'wp-blocks', 'registered' ) ) {
		wp_add_inline_script(
			'wp-blocks',
			'window.shapeblockPlaceholder = ' . wp_json_encode( SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png' ) . ';',
			'before'
		);
	}

	// Loads every used font family into the editor canvas on load / block change
	// so the preview always matches the selected font (no need to select the
	// block or open its Typography control).
	wp_enqueue_script(
		'shapeblock-editor-fonts',
		SHAPEBLOCK_PL_URL . 'includes/public/assets/js/editor-fonts.js',
		array( 'wp-data' ),
		SHAPEBLOCK_VERSION,
		true
	);

	// Shared styling for the 3-tab (Settings / Layout / Style) inspector used by
	// every ShapeBlock block, so the tabs sit evenly across the sidebar.
	wp_register_style( 'shapeblock-editor-ui', false, array(), SHAPEBLOCK_VERSION );
	wp_enqueue_style( 'shapeblock-editor-ui' );
	wp_add_inline_style(
		'shapeblock-editor-ui',
		'.shapeblock-inspector-tabs .components-tab-panel__tabs{display:flex}.shapeblock-inspector-tabs .components-tab-panel__tabs-item{flex:1;justify-content:center}'
	);
}
add_action( 'enqueue_block_editor_assets', 'shapeblock_expose_google_fonts_editor' );

/**
 * Enqueue a single Google font family (front end + editor). Web-safe stacks
 * (which contain a comma) are ignored — only a single Google family name is
 * loaded. Safe to call repeatedly.
 *
 * @param string $family e.g. "Poppins".
 */
if ( ! function_exists( 'shapeblock_enqueue_google_font' ) ) {
	function shapeblock_enqueue_google_font( $family ) {
		$family = trim( (string) $family );
		if ( '' === $family || false !== strpos( $family, ',' ) ) {
			return;
		}
		$handle = 'shapeblock-font-' . sanitize_title( $family );
		if ( wp_style_is( $handle, 'enqueued' ) ) {
			return;
		}
		$url = 'https://fonts.googleapis.com/css2?family=' . str_replace( '%20', '+', rawurlencode( $family ) ) . ':wght@100;200;300;400;500;600;700;800;900&display=swap';
		wp_enqueue_style( $handle, $url, array(), SHAPEBLOCK_VERSION );
	}
}

/**
 * Front end: load the Google fonts used in ANY ShapeBlock block's typography
 * without editing each block's render.php — scan the block attributes for any
 * typography object that sets a `fontFamily` and enqueue it.
 *
 * @param string $content Block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function shapeblock_render_block_load_fonts( $content, $block ) {
	if ( empty( $block['blockName'] ) || 0 !== strpos( (string) $block['blockName'], 'shapeblock/' ) ) {
		return $content;
	}
	if ( ! empty( $block['attrs'] ) && is_array( $block['attrs'] ) && function_exists( 'shapeblock_enqueue_google_font' ) ) {
		array_walk_recursive(
			$block['attrs'],
			function ( $value, $key ) {
				if ( 'fontFamily' === $key && is_string( $value ) && '' !== $value ) {
					shapeblock_enqueue_google_font( $value );
				}
			}
		);
	}
	return $content;
}
add_filter( 'render_block', 'shapeblock_render_block_load_fonts', 10, 2 );

$shapeblock_blocks_instance = \ShapeBlock\Admin\Blocks::instance();
$shapeblock_blocks = $shapeblock_blocks_instance->get_blocks();

foreach ($shapeblock_blocks as $shapeblock_block) {
	if ($shapeblock_block['status'] == 'disable') {
		continue;
	}
	$file = __DIR__ . '/' . $shapeblock_block['id'] . '/' . $shapeblock_block['id'] . '.php';
	if (file_exists($file)) {
		require_once $file;
	}
}

/**
 * Reliably load each block's front-end stylesheet in the <head> whenever the current page
 * actually contains that block.
 *
 * Every block registers its own "shapeblock-<id>-style" handle and enqueues it from render.php. On the
 * front end that render-time enqueue can print too late ( footer ) or be skipped by block-asset
 * optimisation, so the front end came out unstyled while the editor — which loads the styles via the
 * editor-style dependency chain — looked correct. Enqueuing here, on wp_enqueue_scripts, guarantees
 * the style is in the <head>. wp_style_is() keeps it safe for any block that does not follow the
 * handle pattern, and has_block() means nothing loads on pages without the block.
 */
add_action( 'wp_enqueue_scripts', function () use ( $shapeblock_blocks ) {
	if ( is_admin() || ! function_exists( 'has_block' ) ) {
		return;
	}

	// Theme Builder header/footer templates are separate posts, so has_block()
	// against the main query never sees their blocks and the header/footer would
	// render unstyled. Collect any active builder template posts for this request
	// and check their content too.
	$shapeblock_extra_posts = array();
	if ( class_exists( '\ShapeBlock\Extension\ThemeBuilder\Builder_Render' ) ) {
		$shapeblock_builder = \ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance();
		foreach ( array( 'header', 'footer' ) as $shapeblock_location ) {
			$shapeblock_tpl_id = $shapeblock_builder->get_location_post( $shapeblock_location );
			if ( $shapeblock_tpl_id ) {
				$shapeblock_extra_posts[] = $shapeblock_tpl_id;
			}
		}
	}

	foreach ( $shapeblock_blocks as $shapeblock_block ) {
		if ( 'disable' === $shapeblock_block['status'] ) {
			continue;
		}
		$block_name = 'shapeblock/' . $shapeblock_block['id'];
		$handle     = 'shapeblock-' . $shapeblock_block['id'] . '-style';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			continue;
		}

		$shapeblock_present = has_block( $block_name );
		if ( ! $shapeblock_present ) {
			foreach ( $shapeblock_extra_posts as $shapeblock_tpl_id ) {
				if ( has_block( $block_name, $shapeblock_tpl_id ) ) {
					$shapeblock_present = true;
					break;
				}
			}
		}

		if ( $shapeblock_present ) {
			wp_enqueue_style( $handle );
		}
	}
} );

/**
 * In the block editor, load every block's front-end stylesheet up-front. The blocks' editor previews
 * ( tabs, accordion, etc. ) rely on the front-end CSS to show/hide state via the ".active" class, so
 * the styles must be present in the editor for those interactions to be visible. Loading them all here
 * guarantees that regardless of the per-block editor-style dependency chain.
 */
add_action( 'enqueue_block_editor_assets', function () use ( $shapeblock_blocks ) {
	foreach ( $shapeblock_blocks as $shapeblock_block ) {
		if ( 'disable' === $shapeblock_block['status'] ) {
			continue;
		}
		$handle = 'shapeblock-' . $shapeblock_block['id'] . '-style';
		if ( wp_style_is( $handle, 'registered' ) ) {
			wp_enqueue_style( $handle );
		}
	}
} );
