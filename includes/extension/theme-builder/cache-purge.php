<?php
/**
 * Page cache plugins and the Theme Builder.
 *
 * A header, footer, archive, single, mega menu or popup template shows on many
 * pages, but a page cache plugin only empties the cached copy of the post that
 * was saved. When a published template changes (saved, published, unpublished,
 * deleted, or its display conditions changed), the whole page cache is
 * emptied once, at the end of the request, so visitors see the new template.
 *
 * Loaded from Main::includes() only while one of these plugins is active:
 * WP Super Cache, W3 Total Cache, LiteSpeed Cache, WP Fastest Cache and
 * WP-Optimize.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Empty the page cache of each supported plugin that is active.
 *
 * @return void
 */
function shapeblock_cache_purge_all() {
	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
	}
	if ( function_exists( 'w3tc_flush_all' ) ) {
		w3tc_flush_all();
	}
	if ( defined( 'LSCWP_V' ) && is_callable( array( '\LiteSpeed\Purge', 'purge_all' ) ) ) {
		\LiteSpeed\Purge::purge_all();
	}
	if ( function_exists( 'wpfc_clear_all_cache' ) ) {
		wpfc_clear_all_cache();
	}
	if ( function_exists( 'WP_Optimize' ) ) {
		WP_Optimize()->get_page_cache()->purge();
	}
}

/**
 * Empty the page caches once, after everything in this request is saved.
 *
 * @return void
 */
function shapeblock_cache_purge_later() {
	if ( ! has_action( 'shutdown', 'shapeblock_cache_purge_all' ) ) {
		add_action( 'shutdown', 'shapeblock_cache_purge_all' );
	}
}

/**
 * Is this a Theme Builder template that visitors can see (or could, before
 * this change)?
 *
 * @param WP_Post|null $post        The template now.
 * @param WP_Post|null $post_before The template before the change, when known.
 * @return bool
 */
function shapeblock_cache_is_live_template( $post, $post_before = null ) {
	if ( ! $post instanceof WP_Post || \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::POST_TYPE !== $post->post_type ) {
		return false;
	}
	return 'publish' === $post->post_status || ( $post_before instanceof WP_Post && 'publish' === $post_before->post_status );
}

/**
 * A template saved, published, unpublished or moved to the trash.
 *
 * @param int          $post_id     Post ID.
 * @param WP_Post      $post        The post now.
 * @param bool         $update      Whether an existing post was updated.
 * @param WP_Post|null $post_before The post before the update.
 * @return void
 */
function shapeblock_cache_on_template_saved( $post_id, $post, $update, $post_before ) {
	if ( shapeblock_cache_is_live_template( $post, $post_before ) ) {
		shapeblock_cache_purge_later();
	}
}
add_action( 'wp_after_insert_post', 'shapeblock_cache_on_template_saved', 10, 4 );

/**
 * A published template deleted for good.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    The deleted post.
 * @return void
 */
function shapeblock_cache_on_template_deleted( $post_id, $post ) {
	if ( shapeblock_cache_is_live_template( $post ) ) {
		shapeblock_cache_purge_later();
	}
}
add_action( 'after_delete_post', 'shapeblock_cache_on_template_deleted', 10, 2 );

/**
 * A published template's display conditions changed (Theme Builder screen).
 *
 * @param int    $meta_id   Meta ID.
 * @param int    $object_id Post ID.
 * @param string $meta_key  Meta key.
 * @return void
 */
function shapeblock_cache_on_template_conditions( $meta_id, $object_id, $meta_key ) {
	if ( \ShapeBlock\Extension\ThemeBuilder\Theme_Builder::META_CONDITIONS === $meta_key && shapeblock_cache_is_live_template( get_post( $object_id ) ) ) {
		shapeblock_cache_purge_later();
	}
}
add_action( 'added_post_meta', 'shapeblock_cache_on_template_conditions', 10, 3 );
add_action( 'updated_post_meta', 'shapeblock_cache_on_template_conditions', 10, 3 );
add_action( 'deleted_post_meta', 'shapeblock_cache_on_template_conditions', 10, 3 );
