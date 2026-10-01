<?php
/**
 * Uninstall routine — runs once when the plugin is deleted from the Plugins screen.
 *
 * Removes every option and transient ShapeBlock creates:
 * - shapeblock_version
 * - shapeblock_colors
 * - shapeblock_layout
 * - shapeblock_menu_last_items
 * - every shapeblock_block_<id> option (one per block; deleted by pattern so
 *   future blocks are cleaned up too, not just the ones that exist today)
 * - the shapeblock_menu_google_fonts transient
 *
 * Deliberately NOT removed: content in the `shapeblock-template` and
 * `shapeblock-builder` post types. Those are the site owner's authored work
 * (custom templates, Theme Builder headers/footers), not plugin
 * configuration, and deleting it silently on uninstall would destroy content
 * the owner may still want, e.g. to reuse after reinstalling. See readme.txt.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Delete every option/transient ShapeBlock created on a single site.
 */
function shapeblock_uninstall_cleanup_site() {
	delete_option( 'shapeblock_version' );
	delete_option( 'shapeblock_colors' );
	delete_option( 'shapeblock_layout' );
	delete_option( 'shapeblock_menu_last_items' );
	delete_transient( 'shapeblock_menu_google_fonts' );

	/*
	 * One `shapeblock_block_<id>` option per block (~30 today). There is no
	 * options API call that deletes by pattern, but the names can be found
	 * without a query: wp_load_alloptions() reads the options cache WordPress
	 * has already populated, so no direct SQL is needed here.
	 */
	foreach ( array_keys( wp_load_alloptions() ) as $option_name ) {
		if ( 0 === strpos( $option_name, 'shapeblock_block_' ) ) {
			delete_option( $option_name );
		}
	}
}

if ( is_multisite() ) {
	$shapeblock_site_ids = get_sites( array( 'fields' => 'ids' ) );
	foreach ( $shapeblock_site_ids as $shapeblock_site_id ) {
		switch_to_blog( $shapeblock_site_id );
		shapeblock_uninstall_cleanup_site();
		restore_current_blog();
	}
} else {
	shapeblock_uninstall_cleanup_site();
}
