<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;

}
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

add_action( 'enqueue_block_editor_assets', 'eelfg_enqueue_block_styles' );
add_action( 'enqueue_block_assets', 'eelfg_enqueue_block_styles' );
function eelfg_enqueue_block_styles() {
	
    // if swier not existing
	wp_enqueue_style( 'swiper', EELFG_PL_URL . 'assets/lib/swiper/swiper-bundle.min.css', array(), EELFG_VERSION, 'all' ); 
	wp_enqueue_script( 'swiper', EELFG_PL_URL . 'assets/lib/swiper/swiper-bundle.min.js', array(),'12.0.3',false ); 

	// enqueue bootstrap grid
	wp_enqueue_style( 'eelfg-bootstrap-grid', EELFG_PL_URL . 'assets/lib/bootstrap/bootstrap-grid.min.css', array(), EELFG_VERSION, 'all' );

    // register plugin style if not registered	
	if (!wp_style_is('eelfg-public-style', 'registered')) {
		wp_register_style( 
			'eelfg-public-style', 
			EELFG_PL_URL . 'includes/public/assets/css/public.css', 
			array(), 
			EELFG_VERSION 
		);
	}
}

$eelfg_blocks_instance = \EELFG\Admin\Blocks::instance();
$eelfg_blocks = $eelfg_blocks_instance->get_blocks();

foreach ($eelfg_blocks as $eelfg_block) {
	if ($eelfg_block['status'] == 'disable') {
		continue;
	}
	if ($eelfg_block['isPro'] == true) {
		continue;
	}
	$file = __DIR__ . '/' . $eelfg_block['id'] . '/' . $eelfg_block['id'] . '.php';
	if (file_exists($file)) {
		require_once $file;
	}
}

/**
 * Reliably load each block's front-end stylesheet in the <head> whenever the current page
 * actually contains that block.
 *
 * Every block registers its own "eelfg-<id>-style" handle and enqueues it from render.php. On the
 * front end that render-time enqueue can print too late ( footer ) or be skipped by block-asset
 * optimisation, so the front end came out unstyled while the editor — which loads the styles via the
 * editor-style dependency chain — looked correct. Enqueuing here, on wp_enqueue_scripts, guarantees
 * the style is in the <head>. wp_style_is() keeps it safe for any block that does not follow the
 * handle pattern, and has_block() means nothing loads on pages without the block.
 */
add_action( 'wp_enqueue_scripts', function () use ( $eelfg_blocks ) {
	if ( is_admin() || ! function_exists( 'has_block' ) ) {
		return;
	}

	// Theme Builder header/footer templates are separate posts, so has_block()
	// against the main query never sees their blocks and the header/footer would
	// render unstyled. Collect any active builder template posts for this request
	// and check their content too.
	$eelfg_extra_posts = array();
	if ( class_exists( '\EELFG\Extension\ThemeBuilder\Builder_Render' ) ) {
		$eelfg_builder = \EELFG\Extension\ThemeBuilder\Builder_Render::instance();
		foreach ( array( 'header', 'footer' ) as $eelfg_location ) {
			$eelfg_tpl_id = $eelfg_builder->get_location_post( $eelfg_location );
			if ( $eelfg_tpl_id ) {
				$eelfg_extra_posts[] = $eelfg_tpl_id;
			}
		}
	}

	foreach ( $eelfg_blocks as $eelfg_block ) {
		if ( 'disable' === $eelfg_block['status'] || true === $eelfg_block['isPro'] ) {
			continue;
		}
		$block_name = 'easy-elements-for-gutenberg/' . $eelfg_block['id'];
		$handle     = 'eelfg-' . $eelfg_block['id'] . '-style';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			continue;
		}

		$eelfg_present = has_block( $block_name );
		if ( ! $eelfg_present ) {
			foreach ( $eelfg_extra_posts as $eelfg_tpl_id ) {
				if ( has_block( $block_name, $eelfg_tpl_id ) ) {
					$eelfg_present = true;
					break;
				}
			}
		}

		if ( $eelfg_present ) {
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
add_action( 'enqueue_block_editor_assets', function () use ( $eelfg_blocks ) {
	foreach ( $eelfg_blocks as $eelfg_block ) {
		if ( 'disable' === $eelfg_block['status'] || true === $eelfg_block['isPro'] ) {
			continue;
		}
		$handle = 'eelfg-' . $eelfg_block['id'] . '-style';
		if ( wp_style_is( $handle, 'registered' ) ) {
			wp_enqueue_style( $handle );
		}
	}
} );
