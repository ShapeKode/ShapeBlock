<?php
/**
 * Category colour.
 *
 * Each category can have its own colour (Posts > Categories). Blocks that show
 * a category as a badge or pill use it as the background, so every topic gets
 * its own colour; a category without one keeps the block's own badge colour.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the colour as category meta (also readable and writable over REST).
 */
function shapeblock_register_term_color() {
	register_term_meta(
		'category',
		'shapeblock_color',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'sanitize_callback' => 'shapeblock_sanitize_term_color',
			'show_in_rest'      => true,
			'auth_callback'     => static function () {
				return current_user_can( 'manage_categories' );
			},
		)
	);
}
add_action( 'init', 'shapeblock_register_term_color' );

/**
 * A hex colour, or an empty string.
 *
 * @param mixed $value Raw value.
 * @return string
 */
function shapeblock_sanitize_term_color( $value ) {
	$color = sanitize_hex_color( (string) $value );
	return $color ? $color : '';
}

/**
 * The colour set for a category, or an empty string.
 *
 * @param int $term_id Category ID.
 * @return string
 */
function shapeblock_term_color( $term_id ) {
	return shapeblock_sanitize_term_color( get_term_meta( (int) $term_id, 'shapeblock_color', true ) );
}

/**
 * A style attribute that hands the category colour to the badge CSS, or an
 * empty string when the category has none.
 *
 * @param int $term_id Category ID.
 * @return string
 */
function shapeblock_term_color_attr( $term_id ) {
	$color = shapeblock_term_color( $term_id );
	return '' !== $color ? ' style="' . esc_attr( '--sb-term-color:' . $color ) . '"' : '';
}

/**
 * The colour field on the Add Category form.
 */
function shapeblock_term_color_add_field() {
	wp_nonce_field( 'shapeblock_term_color', 'shapeblock_term_color_nonce' );
	?>
	<div class="form-field">
		<label for="shapeblock-term-color"><?php esc_html_e( 'Color', 'shapeblock' ); ?></label>
		<input type="text" name="shapeblock_color" id="shapeblock-term-color" value="" class="shapeblock-term-color" />
		<p><?php esc_html_e( 'Background of this category\'s badge in ShapeBlock post blocks.', 'shapeblock' ); ?></p>
	</div>
	<?php
}
add_action( 'category_add_form_fields', 'shapeblock_term_color_add_field' );

/**
 * The colour field on the Edit Category form.
 *
 * @param WP_Term $term Category being edited.
 */
function shapeblock_term_color_edit_field( $term ) {
	?>
	<tr class="form-field">
		<th scope="row"><label for="shapeblock-term-color"><?php esc_html_e( 'Color', 'shapeblock' ); ?></label></th>
		<td>
			<?php wp_nonce_field( 'shapeblock_term_color', 'shapeblock_term_color_nonce' ); ?>
			<input type="text" name="shapeblock_color" id="shapeblock-term-color" value="<?php echo esc_attr( shapeblock_term_color( $term->term_id ) ); ?>" class="shapeblock-term-color" />
			<p class="description"><?php esc_html_e( 'Background of this category\'s badge in ShapeBlock post blocks.', 'shapeblock' ); ?></p>
		</td>
	</tr>
	<?php
}
add_action( 'category_edit_form_fields', 'shapeblock_term_color_edit_field' );

/**
 * Save the colour from either form.
 *
 * @param int $term_id Category ID.
 */
function shapeblock_term_color_save( $term_id ) {
	if ( ! isset( $_POST['shapeblock_term_color_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['shapeblock_term_color_nonce'] ) ), 'shapeblock_term_color' ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_categories' ) ) {
		return;
	}
	$color = isset( $_POST['shapeblock_color'] ) ? shapeblock_sanitize_term_color( sanitize_text_field( wp_unslash( $_POST['shapeblock_color'] ) ) ) : '';
	if ( '' === $color ) {
		delete_term_meta( $term_id, 'shapeblock_color' );
	} else {
		update_term_meta( $term_id, 'shapeblock_color', $color );
	}
}
add_action( 'created_category', 'shapeblock_term_color_save' );
add_action( 'edited_category', 'shapeblock_term_color_save' );

/**
 * WordPress's colour picker on the category screens only.
 *
 * @param string $hook Admin page.
 */
function shapeblock_term_color_assets( $hook ) {
	if ( ! in_array( $hook, array( 'edit-tags.php', 'term.php' ), true ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( ! $screen || 'category' !== $screen->taxonomy ) {
		return;
	}
	wp_enqueue_style( 'wp-color-picker' );
	wp_enqueue_script( 'wp-color-picker' );
	wp_add_inline_script( 'wp-color-picker', 'jQuery(function($){$(".shapeblock-term-color").wpColorPicker();});' );
}
add_action( 'admin_enqueue_scripts', 'shapeblock_term_color_assets' );
