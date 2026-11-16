<?php
/**
 * Brings the ShapeForms forms a library template uses along with it.
 *
 * Template content refers to a form by its ID on the template server
 * (<!-- wp:shapeforms/form {"formId":12} /-->). The server sends those forms
 * with the content; this creates them in the site's ShapeForms (or reuses an
 * identical form an earlier import created) and points the blocks at the new
 * IDs. Runs only while ShapeForms is active; without it the content is left
 * as it is.
 *
 * @package ShapeBlock
 */

namespace ShapeBlock\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Importer {

	/** Option: fingerprint of an imported form => local form ID. */
	const OPTION = 'shapeblock_imported_forms';

	/**
	 * @return bool ShapeForms is active and has what the import needs.
	 */
	public static function available() {
		return class_exists( '\ShapeForms_Lite' ) && defined( 'SHAPEFORMS_LITE_PATH' )
			&& method_exists( '\ShapeForms_Lite', 'get_instance' )
			&& method_exists( \ShapeForms_Lite::get_instance(), 'get_forms_table_name' );
	}

	/**
	 * @param string $content Block markup.
	 * @return bool The content has a ShapeForms block.
	 */
	public static function has_forms( $content ) {
		return false !== strpos( (string) $content, '<!-- wp:shapeforms/form' );
	}

	/**
	 * Creates the given forms (or finds the copies an earlier import made).
	 *
	 * @param array $forms Forms from the template server: id, title, fields_json, settings_json.
	 * @return array<int,int> Server form ID => local form ID.
	 */
	public static function import( array $forms ) {
		if ( ! $forms || ! self::available() || ! current_user_can( 'manage_options' ) ) {
			return array();
		}
		if ( ! class_exists( '\ShapeForms_Lite_Ajax_Save' ) && is_readable( SHAPEFORMS_LITE_PATH . 'admin/ajax-save.php' ) ) {
			require_once SHAPEFORMS_LITE_PATH . 'admin/ajax-save.php';
		}
		$sanitizer = '\ShapeForms_Lite_Ajax_Save';
		if ( ! method_exists( $sanitizer, 'prepare_rows' ) || ! method_exists( $sanitizer, 'normalize_form_settings' ) ) {
			return array();
		}

		global $wpdb;
		$table = esc_sql( \ShapeForms_Lite::get_instance()->get_forms_table_name() );
		$known = get_option( self::OPTION, array() );
		$known = is_array( $known ) ? $known : array();
		$map   = array();

		foreach ( $forms as $form ) {
			if ( ! is_array( $form ) || empty( $form['id'] ) ) {
				continue;
			}
			$old_id   = (int) $form['id'];
			$title    = isset( $form['title'] ) ? sanitize_text_field( (string) $form['title'] ) : '';
			$fields   = json_decode( isset( $form['fields_json'] ) ? (string) $form['fields_json'] : '', true );
			$settings = json_decode( isset( $form['settings_json'] ) ? (string) $form['settings_json'] : '', true );
			if ( ! is_array( $fields ) ) {
				continue;
			}

			// The same sanitizers the ShapeForms builder saves with.
			$fields_json   = wp_json_encode( array( 'rows' => $sanitizer::prepare_rows( $fields ) ) );
			$settings_json = wp_json_encode( $sanitizer::normalize_form_settings( is_array( $settings ) ? $settings : array() ) );
			$key           = md5( $title . '|' . $fields_json . '|' . $settings_json );

			if ( ! empty( $known[ $key ] ) ) {
				$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM `{$table}` WHERE id = %d AND status != 'trash'", (int) $known[ $key ] ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				if ( $exists ) {
					$map[ $old_id ] = (int) $exists;
					continue;
				}
			}

			$inserted = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$table,
				array(
					'title'         => '' !== $title ? $title : __( 'Imported form', 'shapeblock' ),
					'status'        => 'publish',
					'fields_json'   => $fields_json,
					'settings_json' => $settings_json,
					'created_by'    => get_current_user_id(),
				),
				array( '%s', '%s', '%s', '%s', '%d' )
			);
			if ( $inserted ) {
				$map[ $old_id ] = (int) $wpdb->insert_id;
				$known[ $key ]  = (int) $wpdb->insert_id;
			}
		}

		update_option( self::OPTION, $known, false );
		return $map;
	}

	/**
	 * Points the ShapeForms blocks in the content at the imported forms.
	 *
	 * @param string $content Block markup.
	 * @param array  $map     Server form ID => local form ID.
	 * @return string
	 */
	public static function remap( $content, array $map ) {
		if ( ! $map || ! self::has_forms( $content ) ) {
			return $content;
		}
		return preg_replace_callback(
			'#(<!-- wp:shapeforms/form \{[^}]*"formId":)(\d+)#',
			static function ( $m ) use ( $map ) {
				$id = (int) $m[2];
				return $m[1] . ( isset( $map[ $id ] ) ? $map[ $id ] : $id );
			},
			$content
		);
	}

	/**
	 * Imports the forms and points every given post at them.
	 *
	 * @param array $forms    Forms from the template server.
	 * @param int[] $post_ids Imported posts.
	 * @return int Number of forms the site now has from this import.
	 */
	public static function import_for_posts( array $forms, array $post_ids ) {
		$map = self::import( $forms );
		if ( ! $map ) {
			return 0;
		}
		foreach ( array_unique( array_map( 'absint', $post_ids ) ) as $post_id ) {
			$post = $post_id ? get_post( $post_id ) : null;
			if ( ! $post || ! self::has_forms( $post->post_content ) ) {
				continue;
			}
			$content = self::remap( $post->post_content, $map );
			if ( $content !== $post->post_content ) {
				wp_update_post(
					wp_slash(
						array(
							'ID'           => $post->ID,
							'post_content' => $content,
						)
					)
				);
			}
		}
		return count( $map );
	}
}
