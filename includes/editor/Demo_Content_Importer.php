<?php
/**
 * Imports a WordPress export (WXR) file shipped with a template demo: blog
 * posts, media, custom post types, terms and menus. A small, self-contained
 * importer so a demo can be installed without any other plugin.
 *
 * Rules:
 *  - Content that already exists (same post type + slug) is not duplicated;
 *    its ID is remembered so menus, parents and thumbnails still link to it.
 *    This is how pages already created from the demo's library items are kept.
 *  - Post types this site doesn't register are skipped, as are revisions,
 *    trash and auto-drafts, and ShapeBlock Theme Builder posts (headers and
 *    footers come from the library).
 *  - Media is downloaded only when asked; URLs to the demo site and its
 *    uploads are rewritten to this site.
 *  - Serialized meta is read without allowing PHP objects.
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Demo_Content_Importer {

	/** Largest export file accepted, in bytes. */
	const MAX_BYTES = 31457280; // 30 MB.

	/** Post types never imported from a demo file. */
	const SKIP_TYPES = array( 'revision', 'customize_changeset', 'oembed_cache', 'user_request', 'wp_global_styles', 'wp_template', 'wp_template_part', 'wp_font_family', 'wp_font_face', 'shapeblock-builder', 'custom_css', 'wp_navigation' );

	private $media;
	private $base_urls = array();
	private $post_map  = array(); // old post ID => new post ID.
	private $term_map  = array(); // old term ID => new term ID.
	private $url_map   = array(); // old URL => new URL (attachments).
	private $created   = array(); // new post IDs created by this run.
	private $thumbs    = array(); // new post ID => old attachment ID.
	private $parents   = array(); // new post ID => old parent ID.
	private $menu_items = array();
	private $menus     = array(); // menu term IDs that got items.
	private $stats     = array(
		'posts'       => 0,
		'pages'       => 0,
		'attachments' => 0,
		'terms'       => 0,
		'menu_items'  => 0,
		'skipped'     => 0,
		'errors'      => array(),
	);

	/**
	 * @param bool $media Download attachments.
	 */
	public function __construct( $media ) {
		$this->media = (bool) $media;
	}

	/**
	 * Downloads and imports an export file.
	 *
	 * @param string $url Export file URL.
	 * @return array|\WP_Error Stats plus 'menus' (menu term IDs).
	 */
	public function import_url( $url ) {
		self::load_admin_files();

		$file = download_url( $url, 120 );
		if ( is_wp_error( $file ) ) {
			return new \WP_Error( 'shapeblock_xml_download', __( 'The demo content file could not be downloaded.', 'shapeblock' ), array( 'status' => 502, 'detail' => $file->get_error_message() ) );
		}

		$result = $this->import_file( $file );
		wp_delete_file( $file );
		return $result;
	}

	/**
	 * @param string $file Local path of the export file.
	 * @return array|\WP_Error
	 */
	public function import_file( $file ) {
		self::load_admin_files();
		if ( ! is_readable( $file ) || filesize( $file ) > self::MAX_BYTES ) {
			return new \WP_Error( 'shapeblock_xml_size', __( 'The demo content file is missing or too large.', 'shapeblock' ), array( 'status' => 400 ) );
		}

		$previous = libxml_use_internal_errors( true );
		// LIBXML_NONET: never fetch anything the file refers to.
		$xml = simplexml_load_file( $file, 'SimpleXMLElement', LIBXML_NONET | LIBXML_NOCDATA | LIBXML_COMPACT );
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $xml || ! isset( $xml->channel ) ) {
			return new \WP_Error( 'shapeblock_xml_invalid', __( 'The demo content file is not a valid WordPress export.', 'shapeblock' ), array( 'status' => 400 ) );
		}
		$ns = $xml->getNamespaces( true );
		if ( empty( $ns['wp'] ) ) {
			return new \WP_Error( 'shapeblock_xml_invalid', __( 'The demo content file is not a valid WordPress export.', 'shapeblock' ), array( 'status' => 400 ) );
		}
		wp_defer_term_counting( true );
		wp_suspend_cache_invalidation( true );

		$channel = $xml->channel;
		$wp      = $channel->children( $ns['wp'] );
		foreach ( array( (string) $wp->base_site_url, (string) $wp->base_blog_url, (string) $channel->link ) as $base ) {
			$base = untrailingslashit( esc_url_raw( $base ) );
			if ( '' !== $base && untrailingslashit( home_url() ) !== $base ) {
				$this->base_urls[ $base ] = true;
			}
		}

		$this->import_terms( $wp, $ns );

		$items = array();
		foreach ( $channel->item as $item ) {
			$items[] = $this->read_item( $item, $ns );
		}
		// Attachments first, so their new URLs are known when content is saved.
		usort(
			$items,
			static function ( $a, $b ) {
				return ( 'attachment' === $b['post_type'] ) <=> ( 'attachment' === $a['post_type'] );
			}
		);
		foreach ( $items as $item ) {
			$this->import_item( $item );
		}

		$this->fix_parents_and_thumbnails();
		$this->import_menu_items();
		$this->rewrite_urls();

		wp_suspend_cache_invalidation( false );
		wp_defer_term_counting( false );

		$stats          = $this->stats;
		$stats['menus'] = array_values( array_unique( $this->menus ) );
		$stats['errors'] = array_slice( $stats['errors'], 0, 5 );
		return $stats;
	}

	private static function load_admin_files() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/post.php';
	}

	/* --------------------------------------------------------------------- */
	/* Terms                                                                 */
	/* --------------------------------------------------------------------- */

	/**
	 * @param \SimpleXMLElement $wp wp: children of <channel>.
	 * @param array             $ns Namespaces.
	 */
	private function import_terms( $wp, array $ns ) {
		$rows = array();
		foreach ( $wp->category as $c ) {
			$rows[] = array( 'id' => (int) $c->term_id, 'taxonomy' => 'category', 'slug' => (string) $c->category_nicename, 'name' => (string) $c->cat_name, 'parent' => (string) $c->category_parent, 'description' => (string) $c->category_description );
		}
		foreach ( $wp->tag as $t ) {
			$rows[] = array( 'id' => (int) $t->term_id, 'taxonomy' => 'post_tag', 'slug' => (string) $t->tag_slug, 'name' => (string) $t->tag_name, 'parent' => '', 'description' => (string) $t->tag_description );
		}
		foreach ( $wp->term as $t ) {
			$rows[] = array( 'id' => (int) $t->term_id, 'taxonomy' => (string) $t->term_taxonomy, 'slug' => (string) $t->term_slug, 'name' => (string) $t->term_name, 'parent' => (string) $t->term_parent, 'description' => (string) $t->term_description );
		}

		foreach ( $rows as $row ) {
			$taxonomy = sanitize_key( $row['taxonomy'] );
			$slug     = sanitize_title( $row['slug'] );
			if ( '' === $slug || ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}
			$existing = get_term_by( 'slug', $slug, $taxonomy );
			if ( $existing ) {
				$this->term_map[ $row['id'] ] = (int) $existing->term_id;
				continue;
			}
			$parent = 0;
			if ( '' !== $row['parent'] ) {
				$p      = get_term_by( 'slug', sanitize_title( $row['parent'] ), $taxonomy );
				$parent = $p ? (int) $p->term_id : 0;
			}
			$created = wp_insert_term(
				sanitize_text_field( '' !== $row['name'] ? $row['name'] : $slug ),
				$taxonomy,
				array(
					'slug'        => $slug,
					'parent'      => $parent,
					'description' => wp_kses_post( $row['description'] ),
				)
			);
			if ( ! is_wp_error( $created ) ) {
				$this->term_map[ $row['id'] ] = (int) $created['term_id'];
				++$this->stats['terms'];
			}
		}
	}

	/* --------------------------------------------------------------------- */
	/* Posts                                                                 */
	/* --------------------------------------------------------------------- */

	/**
	 * @param \SimpleXMLElement $item <item>.
	 * @param array             $ns   Namespaces.
	 * @return array
	 */
	private function read_item( $item, array $ns ) {
		$wp      = $item->children( $ns['wp'] );
		$content = isset( $ns['content'] ) ? (string) $item->children( $ns['content'] )->encoded : '';
		$excerpt = isset( $ns['excerpt'] ) ? (string) $item->children( $ns['excerpt'] )->encoded : '';

		$terms = array();
		foreach ( $item->category as $c ) {
			$attr = $c->attributes();
			if ( isset( $attr['domain'], $attr['nicename'] ) ) {
				$terms[] = array( 'taxonomy' => (string) $attr['domain'], 'slug' => (string) $attr['nicename'], 'name' => (string) $c );
			}
		}

		$meta = array();
		foreach ( $wp->postmeta as $m ) {
			$meta[] = array( 'key' => (string) $m->meta_key, 'value' => (string) $m->meta_value );
		}

		return array(
			'id'             => (int) $wp->post_id,
			'title'          => (string) $item->title,
			'content'        => $content,
			'excerpt'        => $excerpt,
			'date'           => (string) $wp->post_date,
			'name'           => (string) $wp->post_name,
			'status'         => (string) $wp->status,
			'parent'         => (int) $wp->post_parent,
			'menu_order'     => (int) $wp->menu_order,
			'post_type'      => (string) $wp->post_type,
			'sticky'         => (int) $wp->is_sticky,
			'attachment_url' => (string) $wp->attachment_url,
			'terms'          => $terms,
			'meta'           => $meta,
		);
	}

	/**
	 * @param array $item Parsed item.
	 */
	private function import_item( array $item ) {
		$type = sanitize_key( $item['post_type'] );

		if ( 'nav_menu_item' === $type ) {
			$this->menu_items[] = $item;
			return;
		}
		if ( in_array( $type, self::SKIP_TYPES, true ) || ! post_type_exists( $type ) || in_array( $item['status'], array( 'auto-draft', 'trash' ), true ) ) {
			++$this->stats['skipped'];
			return;
		}

		// Already here (e.g. a page created from the library): reuse it.
		$slug = sanitize_title( $item['name'] );
		if ( '' !== $slug ) {
			$existing = get_posts(
				array(
					'post_type'      => $type,
					'name'           => $slug,
					'post_status'    => 'any',
					'posts_per_page' => 1,
					'fields'         => 'ids',
					'no_found_rows'  => true,
				)
			);
			if ( $existing ) {
				$this->post_map[ $item['id'] ] = (int) $existing[0];
				if ( 'attachment' === $type && '' !== $item['attachment_url'] ) {
					$current = wp_get_attachment_url( $existing[0] );
					if ( $current ) {
						$this->url_map[ esc_url_raw( $item['attachment_url'] ) ] = $current;
					}
				}
				++$this->stats['skipped'];
				return;
			}
		}

		if ( 'attachment' === $type ) {
			$this->import_attachment( $item );
			return;
		}

		$status = in_array( $item['status'], array( 'publish', 'draft', 'pending', 'private', 'future' ), true ) ? $item['status'] : 'draft';
		$post_id = wp_insert_post(
			wp_slash(
				array(
					'post_type'    => $type,
					'post_title'   => $item['title'],
					'post_name'    => $slug,
					'post_content' => $item['content'],
					'post_excerpt' => $item['excerpt'],
					'post_status'  => $status,
					'post_date'    => $item['date'],
					'menu_order'   => $item['menu_order'],
					'post_author'  => get_current_user_id(),
				)
			),
			true
		);
		if ( is_wp_error( $post_id ) ) {
			$this->stats['errors'][] = $item['title'] . ': ' . $post_id->get_error_message();
			return;
		}

		$this->post_map[ $item['id'] ] = $post_id;
		$this->created[]               = $post_id;
		if ( $item['parent'] ) {
			$this->parents[ $post_id ] = $item['parent'];
		}
		if ( $item['sticky'] && 'post' === $type ) {
			stick_post( $post_id );
		}
		++$this->stats[ 'page' === $type ? 'pages' : 'posts' ];

		$this->assign_terms( $post_id, $item['terms'] );
		$this->import_meta( $post_id, $item['meta'] );

		// The blocks this post uses are switched on, as for a library import.
		Template_Library::enable_blocks_used( $item['content'] );
	}

	/**
	 * @param array $item Attachment item.
	 */
	private function import_attachment( array $item ) {
		$url = esc_url_raw( $item['attachment_url'] );
		if ( ! $this->media || '' === $url ) {
			++$this->stats['skipped'];
			return;
		}
		// Files are downloaded only from the template server.
		$host = wp_parse_url( Template_Library::api_url(), PHP_URL_HOST );
		if ( ! $host || strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) ) !== strtolower( $host ) ) {
			++$this->stats['skipped'];
			return;
		}

		$tmp = download_url( $url, 60 );
		if ( is_wp_error( $tmp ) ) {
			$this->stats['errors'][] = basename( $url ) . ': ' . $tmp->get_error_message();
			return;
		}
		$id = media_handle_sideload(
			array(
				'name'     => wp_basename( wp_parse_url( $url, PHP_URL_PATH ) ),
				'tmp_name' => $tmp,
			),
			0,
			$item['title'],
			array(
				'post_content' => $item['content'],
				'post_excerpt' => $item['excerpt'],
				'post_date'    => $item['date'],
			)
		);
		if ( is_wp_error( $id ) ) {
			wp_delete_file( $tmp );
			$this->stats['errors'][] = basename( $url ) . ': ' . $id->get_error_message();
			return;
		}

		$this->post_map[ $item['id'] ] = $id;
		$this->created[]               = $id;
		++$this->stats['attachments'];
		if ( $item['parent'] ) {
			$this->parents[ $id ] = $item['parent'];
		}
		foreach ( $item['meta'] as $m ) {
			if ( '_wp_attachment_image_alt' === $m['key'] ) {
				update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $m['value'] ) );
			}
		}

		// Full URL, and the URL stub so resized copies (photo-300x200.jpg) map too.
		$new = wp_get_attachment_url( $id );
		if ( $new ) {
			$this->url_map[ $url ] = $new;
			$old_parts             = pathinfo( $url );
			$new_parts             = pathinfo( $new );
			if ( ! empty( $old_parts['filename'] ) && ! empty( $new_parts['filename'] ) ) {
				$this->url_map[ $old_parts['dirname'] . '/' . $old_parts['filename'] ] = $new_parts['dirname'] . '/' . $new_parts['filename'];
			}
		}
	}

	/**
	 * @param int   $post_id Post ID.
	 * @param array $terms   [ {taxonomy, slug, name} ].
	 */
	private function assign_terms( $post_id, array $terms ) {
		$by_tax = array();
		foreach ( $terms as $t ) {
			$taxonomy = sanitize_key( $t['taxonomy'] );
			if ( ! taxonomy_exists( $taxonomy ) || 'nav_menu' === $taxonomy ) {
				continue;
			}
			$term = get_term_by( 'slug', sanitize_title( $t['slug'] ), $taxonomy );
			if ( ! $term ) {
				$created = wp_insert_term( sanitize_text_field( $t['name'] ), $taxonomy, array( 'slug' => sanitize_title( $t['slug'] ) ) );
				if ( is_wp_error( $created ) ) {
					continue;
				}
				++$this->stats['terms'];
				$term_id = (int) $created['term_id'];
			} else {
				$term_id = (int) $term->term_id;
			}
			$by_tax[ $taxonomy ][] = $term_id;
		}
		foreach ( $by_tax as $taxonomy => $ids ) {
			wp_set_object_terms( $post_id, $ids, $taxonomy );
		}
	}

	/**
	 * @param int   $post_id Post ID.
	 * @param array $meta    [ {key, value} ].
	 */
	private function import_meta( $post_id, array $meta ) {
		foreach ( $meta as $m ) {
			$key = (string) $m['key'];
			// Plain key names only; WordPress's own file and attachment keys are never taken from the file.
			if ( '' === $key || ! preg_match( '/^[A-Za-z0-9_\-]{1,191}$/', $key ) || in_array( $key, array( '_edit_lock', '_edit_last', '_wp_old_slug', '_wp_old_date', '_wp_trash_meta_status', '_wp_trash_meta_time', '_pingme', '_encloseme', '_wp_attached_file', '_wp_attachment_metadata', '_wp_attachment_backup_sizes', '_wp_desired_post_slug' ), true ) ) {
				continue;
			}
			// A page template is a file name: no folders above it.
			if ( '_wp_page_template' === $key && ( ! is_string( $m['value'] ) || ! preg_match( '/^[A-Za-z0-9_\-\.\/]+$/', $m['value'] ) || false !== strpos( $m['value'], '..' ) ) ) {
				continue;
			}
			if ( '_thumbnail_id' === $key ) {
				$this->thumbs[ $post_id ] = (int) $m['value'];
				continue;
			}
			$value = $m['value'];
			if ( is_serialized( $value ) ) {
				// Never instantiate objects from a downloaded file.
				$value = unserialize( trim( $value ), array( 'allowed_classes' => false ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize -- WXR meta is serialized; objects are refused.
				// Objects come back as __PHP_Incomplete_Class; such meta is dropped.
				if ( false === $value || self::has_object( $value ) ) {
					++$this->stats['skipped'];
					continue;
				}
			}
			add_post_meta( $post_id, wp_slash( $key ), wp_slash( $value ) );
		}
	}

	/**
	 * @param mixed $value Unserialized value.
	 * @return bool Whether it is or contains an object.
	 */
	private static function has_object( $value ) {
		if ( is_object( $value ) ) {
			return true;
		}
		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				if ( self::has_object( $item ) ) {
					return true;
				}
			}
		}
		return false;
	}

	private function fix_parents_and_thumbnails() {
		foreach ( $this->parents as $post_id => $old_parent ) {
			if ( isset( $this->post_map[ $old_parent ] ) ) {
				wp_update_post( array( 'ID' => $post_id, 'post_parent' => $this->post_map[ $old_parent ] ) );
			}
		}
		foreach ( $this->thumbs as $post_id => $old_attachment ) {
			if ( isset( $this->post_map[ $old_attachment ] ) && 'attachment' === get_post_type( $this->post_map[ $old_attachment ] ) ) {
				set_post_thumbnail( $post_id, $this->post_map[ $old_attachment ] );
			}
		}
	}

	/* --------------------------------------------------------------------- */
	/* Menus                                                                 */
	/* --------------------------------------------------------------------- */

	private function import_menu_items() {
		$item_map = array(); // old menu item ID => new.
		$pending  = $this->menu_items;

		// Parents can come after children in the file; a few passes settle it.
		for ( $pass = 0; $pass < 5 && $pending; $pass++ ) {
			$next = array();
			foreach ( $pending as $item ) {
				$meta = array();
				foreach ( $item['meta'] as $m ) {
					$meta[ $m['key'] ] = $m['value'];
				}
				$old_parent = isset( $meta['_menu_item_menu_item_parent'] ) ? (int) $meta['_menu_item_menu_item_parent'] : 0;
				if ( $old_parent && ! isset( $item_map[ $old_parent ] ) ) {
					$next[] = $item;
					continue;
				}

				$menu_id = 0;
				foreach ( $item['terms'] as $t ) {
					if ( 'nav_menu' === $t['taxonomy'] ) {
						$menu = wp_get_nav_menu_object( sanitize_title( $t['slug'] ) );
						if ( ! $menu ) {
							$created = wp_create_nav_menu( sanitize_text_field( $t['name'] ) );
							$menu    = is_wp_error( $created ) ? null : wp_get_nav_menu_object( $created );
						}
						$menu_id = $menu ? (int) $menu->term_id : 0;
					}
				}
				if ( ! $menu_id ) {
					continue;
				}

				$type   = isset( $meta['_menu_item_type'] ) ? $meta['_menu_item_type'] : 'custom';
				$object = isset( $meta['_menu_item_object'] ) ? $meta['_menu_item_object'] : '';
				$old_id = isset( $meta['_menu_item_object_id'] ) ? (int) $meta['_menu_item_object_id'] : 0;
				$args   = array(
					'menu-item-title'     => $item['title'],
					'menu-item-type'      => $type,
					'menu-item-object'    => $object,
					'menu-item-parent-id' => $old_parent ? $item_map[ $old_parent ] : 0,
					'menu-item-position'  => $item['menu_order'],
					'menu-item-target'    => isset( $meta['_menu_item_target'] ) ? $meta['_menu_item_target'] : '',
					'menu-item-status'    => 'publish',
				);
				if ( 'post_type' === $type ) {
					if ( ! isset( $this->post_map[ $old_id ] ) ) {
						continue;
					}
					$args['menu-item-object-id'] = $this->post_map[ $old_id ];
				} elseif ( 'taxonomy' === $type ) {
					if ( ! isset( $this->term_map[ $old_id ] ) ) {
						continue;
					}
					$args['menu-item-object-id'] = $this->term_map[ $old_id ];
				} else {
					$args['menu-item-url'] = $this->local_url( isset( $meta['_menu_item_url'] ) ? $meta['_menu_item_url'] : '' );
				}

				$new = wp_update_nav_menu_item( $menu_id, 0, $args );
				if ( ! is_wp_error( $new ) ) {
					$item_map[ $item['id'] ] = $new;
					$this->menus[]           = $menu_id;
					++$this->stats['menu_items'];
				}
			}
			$pending = $next;
		}
	}

	/* --------------------------------------------------------------------- */
	/* URLs                                                                  */
	/* --------------------------------------------------------------------- */

	/**
	 * @param string $url URL from the demo site.
	 * @return string
	 */
	private function local_url( $url ) {
		return esc_url_raw( strtr( (string) $url, $this->replacements() ) );
	}

	/**
	 * Attachment URLs (longest first), then the demo site's address.
	 *
	 * @return array
	 */
	private function replacements() {
		$map = $this->url_map;
		foreach ( array_keys( $this->base_urls ) as $base ) {
			$map[ $base ] = untrailingslashit( home_url() );
		}
		return $map; // strtr() matches the longest key first.
	}

	/**
	 * Old attachment ID => new, for every attachment this run brought in.
	 *
	 * @return array<int,int>
	 */
	private function attachment_ids() {
		$ids = array();
		foreach ( $this->post_map as $old => $new ) {
			if ( 'attachment' === get_post_type( $new ) ) {
				$ids[ (int) $old ] = (int) $new;
			}
		}
		return $ids;
	}

	/**
	 * Points image blocks at the new attachments: "id"/"mediaId"/"ids" in
	 * the block comment and the wp-image-{id} class.
	 *
	 * @param string $content Post content.
	 * @param array  $ids     Old attachment ID => new.
	 * @return string
	 */
	private static function remap_attachment_ids( $content, array $ids ) {
		if ( ! $ids ) {
			return $content;
		}
		$content = preg_replace_callback(
			'#<!-- wp:([a-z0-9/-]+) (\{.*?\}) (/?)-->#s',
			static function ( $m ) use ( $ids ) {
				$attrs = json_decode( $m[2], true );
				if ( ! is_array( $attrs ) ) {
					return $m[0];
				}
				$changed = false;
				foreach ( array( 'id', 'mediaId' ) as $key ) {
					if ( isset( $attrs[ $key ] ) && is_int( $attrs[ $key ] ) && isset( $ids[ $attrs[ $key ] ] ) ) {
						$attrs[ $key ] = $ids[ $attrs[ $key ] ];
						$changed       = true;
					}
				}
				if ( isset( $attrs['ids'] ) && is_array( $attrs['ids'] ) ) {
					foreach ( $attrs['ids'] as $i => $id ) {
						if ( isset( $ids[ (int) $id ] ) ) {
							$attrs['ids'][ $i ] = $ids[ (int) $id ];
							$changed            = true;
						}
					}
				}
				return $changed ? '<!-- wp:' . $m[1] . ' ' . serialize_block_attributes( $attrs ) . ' ' . $m[3] . '-->' : $m[0];
			},
			$content
		);
		return preg_replace_callback(
			'/\bwp-image-(\d+)\b/',
			static function ( $m ) use ( $ids ) {
				return isset( $ids[ (int) $m[1] ] ) ? 'wp-image-' . $ids[ (int) $m[1] ] : $m[0];
			},
			$content
		);
	}

	private function rewrite_urls() {
		$map = $this->replacements();
		$ids = $this->attachment_ids();
		if ( ! $map && ! $ids ) {
			return;
		}
		foreach ( $this->created as $post_id ) {
			if ( 'attachment' === get_post_type( $post_id ) ) {
				continue;
			}
			$content = (string) get_post_field( 'post_content', $post_id, 'raw' );
			$updated = self::remap_attachment_ids( $map ? strtr( $content, $map ) : $content, $ids );
			if ( $updated !== $content ) {
				wp_update_post( wp_slash( array( 'ID' => $post_id, 'post_content' => $updated ) ) );
			}
		}
	}
}
