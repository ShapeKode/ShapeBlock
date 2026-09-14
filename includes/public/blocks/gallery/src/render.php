<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template/iteration variables.

/**
 * Server-side render for the Simple Gallery block.
 *
 * Mirrors the markup produced by the Elementor "Simple Gallery" widget
 * (easy-elements/widgets/gallery/gallery.php) so the shared CSS/JS apply
 * identically on the front end.
 *
 * $attributes, $content and $block are provided by register_block_type().
 */

$images = isset( $attributes['galleryImages'] ) && is_array( $attributes['galleryImages'] ) ? $attributes['galleryImages'] : [];

$unique_id = ! empty( $attributes['blockId'] ) ? $attributes['blockId'] : 'shapeblock-gallery-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );

$show_caption     = ! empty( $attributes['showCaption'] );
$caption_source   = isset( $attributes['captionSource'] ) ? $attributes['captionSource'] : 'media';
$show_description = ! empty( $attributes['showDescription'] );
$popup_enabled    = ! empty( $attributes['enablePopup'] );
$order_by         = isset( $attributes['orderBy'] ) ? $attributes['orderBy'] : 'menu_order';
$thumbnail_size   = isset( $attributes['thumbnailSize'] ) ? $attributes['thumbnailSize'] : 'large';
$hover_style      = isset( $attributes['hoverStyle'] ) ? $attributes['hoverStyle'] : 'default';
$hover_text       = isset( $attributes['hoverText'] ) ? $attributes['hoverText'] : '';
$hover_icon       = isset( $attributes['hoverIcon'] ) ? $attributes['hoverIcon'] : '';

$block_wrap_attr = get_block_wrapper_attributes( array(
	'class' => 'shapeblock-block shapeblock-gallery-block-wrap ' . $unique_id,
) );

if ( empty( $block_wrap_attr ) ) {
	$block_wrap_attr = 'class="shapeblock-block shapeblock-gallery-block-wrap ' . esc_attr( $unique_id ) . '"';
}

// ---------------------------------------------------------------------------
// Dynamic / inline styles (scoped to this block instance via $unique_id).
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-gallery-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-gallery-style';
// NOTE: gallery element classes use the plugin's own "shapeblock-" prefix below.

// Grid columns + gap (responsive).
$c_desktop = isset( $attributes['columns'] ) && $attributes['columns'] !== '' ? (int) $attributes['columns'] : 4;
$c_tablet  = isset( $attributes['columnsTablet'] ) && $attributes['columnsTablet'] !== '' ? (int) $attributes['columnsTablet'] : $c_desktop;
$c_mobile  = isset( $attributes['columnsMobile'] ) && $attributes['columnsMobile'] !== '' ? (int) $attributes['columnsMobile'] : 1;

$g_desktop = isset( $attributes['imageGap'] ) && $attributes['imageGap'] !== '' ? \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['imageGap'] ) : '10px';
$g_tablet  = isset( $attributes['imageGapTablet'] ) && $attributes['imageGapTablet'] !== '' ? \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['imageGapTablet'] ) : '';
$g_mobile  = isset( $attributes['imageGapMobile'] ) && $attributes['imageGapMobile'] !== '' ? \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['imageGapMobile'] ) : '';

$grid_responsive = [
	'desktop' => [ 'grid-template-columns' => 'repeat(' . $c_desktop . ', 1fr)', 'gap' => $g_desktop ],
	'tablet'  => [ 'grid-template-columns' => 'repeat(' . $c_tablet . ', 1fr)' ],
	'mobile'  => [ 'grid-template-columns' => 'repeat(' . $c_mobile . ', 1fr)' ],
];
if ( $g_tablet !== '' ) {
	$grid_responsive['tablet']['gap'] = $g_tablet;
}
if ( $g_mobile !== '' ) {
	$grid_responsive['mobile']['gap'] = $g_mobile;
}

$full_responsive_css = \ShapeBlock\Frontend\Helper::generate_responsive_css( $selector . ' .shapeblock-gallery-grid', $grid_responsive );

// Image: height + border radius.
$image_styles = [];
if ( ! empty( $attributes['imageHeight'] ) ) {
	$image_styles['height']     = \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['imageHeight'] );
	$image_styles['object-fit'] = 'cover';
	$image_styles['width']      = '100%';
}

$image_radius_styles = [];
$i_radius            = isset( $attributes['imageBorderRadius'] ) ? $attributes['imageBorderRadius'] : [];
if ( ! empty( $i_radius['top'] ) ) {
	$image_radius_styles['border-top-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_radius['top'] );
}
if ( ! empty( $i_radius['right'] ) ) {
	$image_radius_styles['border-top-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_radius['right'] );
}
if ( ! empty( $i_radius['bottom'] ) ) {
	$image_radius_styles['border-bottom-right-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_radius['bottom'] );
}
if ( ! empty( $i_radius['left'] ) ) {
	$image_radius_styles['border-bottom-left-radius'] = \ShapeBlock\Frontend\Helper::ensure_unit( $i_radius['left'] );
}

// Caption container.
$caption_styles = [];
if ( ! empty( $attributes['captionColor'] ) ) {
	$caption_styles['color'] = $attributes['captionColor'];
}
if ( ! empty( $attributes['captionBgColor'] ) ) {
	$caption_styles['background-color'] = $attributes['captionBgColor'];
}
if ( ! empty( $attributes['captionAlign'] ) ) {
	$caption_styles['text-align'] = $attributes['captionAlign'];
}

$description_styles = [];
if ( ! empty( $attributes['descriptionColor'] ) ) {
	$description_styles['color'] = $attributes['descriptionColor'];
}

// Hover overlay / icon / text.
$overlay_styles = [];
if ( ! empty( $attributes['hoverOverlayColor'] ) ) {
	$overlay_styles['background-color'] = $attributes['hoverOverlayColor'];
}

$hover_icon_styles = [];
if ( ! empty( $attributes['hoverIconColor'] ) ) {
	$hover_icon_styles['color'] = $attributes['hoverIconColor'];
}
if ( ! empty( $attributes['hoverIconSize'] ) ) {
	$hover_icon_styles['font-size'] = \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['hoverIconSize'] );
}

$hover_icon_svg_styles = [];
if ( ! empty( $attributes['hoverIconColor'] ) ) {
	$hover_icon_svg_styles['fill'] = $attributes['hoverIconColor'];
}
if ( ! empty( $attributes['hoverIconSize'] ) ) {
	$hover_icon_svg_styles['width']  = \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['hoverIconSize'] );
	$hover_icon_svg_styles['height'] = \ShapeBlock\Frontend\Helper::ensure_unit( $attributes['hoverIconSize'] );
}

$hover_text_styles = [];
if ( ! empty( $attributes['hoverTextColor'] ) ) {
	$hover_text_styles['color'] = $attributes['hoverTextColor'];
}

wp_enqueue_style( $style_handle );
\ShapeBlock\Frontend\Helper::add_custom_style( $style_handle, $selector, $full_responsive_css, [
	'.shapeblock-gallery-item img'        => \ShapeBlock\Frontend\Helper::get_inline_styles( $image_styles ),
	'.shapeblock-gallery-item img, .shapeblock-gallery-item' => \ShapeBlock\Frontend\Helper::get_inline_styles( $image_radius_styles ),
	'.shapeblock-gallery-caption'         => \ShapeBlock\Frontend\Helper::get_inline_styles( $caption_styles ),
	'.shapeblock-gallery-description'     => \ShapeBlock\Frontend\Helper::get_inline_styles( $description_styles ),
	'.shapeblock-hover-content'           => \ShapeBlock\Frontend\Helper::get_inline_styles( $overlay_styles ),
	'.shapeblock-hover-icon i'            => \ShapeBlock\Frontend\Helper::get_inline_styles( $hover_icon_styles ),
	'.shapeblock-hover-icon svg'          => \ShapeBlock\Frontend\Helper::get_inline_styles( $hover_icon_svg_styles ),
	'.shapeblock-hover-text span'         => \ShapeBlock\Frontend\Helper::get_inline_styles( $hover_text_styles ),
] );

// ---------------------------------------------------------------------------
// Empty state.
// ---------------------------------------------------------------------------
if ( empty( $images ) ) {
	?>
	<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
		<p><?php esc_html_e( 'Please select images to display the gallery.', 'shapeblock' ); ?></p>
	</div>
	<?php
	return;
}

// ---------------------------------------------------------------------------
// Ordering.
// ---------------------------------------------------------------------------
if ( 'rand' === $order_by ) {
	shuffle( $images );
} elseif ( 'menu_order' !== $order_by ) {
	usort( $images, function ( $a, $b ) use ( $order_by ) {
		$a_id = isset( $a['id'] ) ? $a['id'] : 0;
		$b_id = isset( $b['id'] ) ? $b['id'] : 0;
		$a_post = get_post( $a_id );
		$b_post = get_post( $b_id );
		if ( ! $a_post || ! $b_post ) {
			return 0;
		}
		if ( 'id' === $order_by ) {
			return $a_id - $b_id;
		}
		if ( 'date' === $order_by ) {
			return strcmp( $a_post->post_date, $b_post->post_date );
		}
		// title.
		return strcmp( strtolower( $a_post->post_title ), strtolower( $b_post->post_title ) );
	} );
}

$popup_class = $popup_enabled ? 'shapeblock-popup-enabled' : '';
?>
<div <?php echo wp_kses_post( $block_wrap_attr ); ?>>
	<div class="shapeblock-gallery-grid <?php echo esc_attr( $popup_class ); ?>">
		<?php
		foreach ( $images as $index => $image ) :
			$image_id  = isset( $image['id'] ) ? (int) $image['id'] : 0;
			$fallback  = isset( $image['url'] ) ? $image['url'] : '';
			$image_url = $image_id ? wp_get_attachment_image_url( $image_id, $thumbnail_size ) : '';
			if ( ! $image_url ) {
				$image_url = $fallback;
			}
			$full_image = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : $fallback;
			$alt        = $image_id ? get_post_meta( $image_id, '_wp_attachment_image_alt', true ) : '';

			$caption = '';
			if ( $show_caption && $image_id ) {
				if ( 'media' === $caption_source ) {
					$caption = wp_get_attachment_caption( $image_id );
				} elseif ( 'title' === $caption_source ) {
					$caption = get_the_title( $image_id );
				}
			}

			$description = '';
			if ( $show_description && $image_id ) {
				$description = get_post_field( 'post_content', $image_id );
			}
			?>
			<div class="shapeblock-gallery-item">
				<?php if ( $popup_enabled ) : ?>
					<a href="<?php echo esc_url( $full_image ); ?>" class="shapeblock-popup-link" data-index="<?php echo esc_attr( $index ); ?>">
				<?php else : ?>
					<a href="<?php echo esc_url( $fallback ); ?>" target="_blank" rel="noopener">
				<?php endif; ?>

					<div class="shapeblock-gallery-image-wrap">
						<img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $alt ); ?>">

						<?php if ( 'text' === $hover_style && ! empty( $hover_text ) ) : ?>
							<div class="shapeblock-hover-content shapeblock-hover-text">
								<span><?php echo esc_html( $hover_text ); ?></span>
							</div>
						<?php elseif ( 'icon' === $hover_style && ! empty( $hover_icon ) && 'none' !== $hover_icon ) : ?>
							<div class="shapeblock-hover-content shapeblock-hover-icon">
								<i class="shapeblock-icon <?php echo esc_attr( $hover_icon ); ?>" aria-hidden="true"></i>
							</div>
						<?php endif; ?>
					</div>
				</a>

				<?php if ( ! empty( $caption ) || ! empty( $description ) ) : ?>
					<div class="shapeblock-gallery-caption">
						<?php
						if ( ! empty( $caption ) ) {
							echo esc_html( $caption );
						}
						if ( ! empty( $description ) ) {
							echo '<div class="shapeblock-gallery-description">' . wp_kses_post( $description ) . '</div>';
						}
						?>
					</div>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>

	<?php if ( $popup_enabled ) : ?>
		<div class="shapeblock-lightbox-gallery">
			<span class="shapeblock-close">&times;</span>
			<img class="shapeblock-lightbox-image" src="" alt="">
			<button class="shapeblock-prev">&#10094;</button>
			<button class="shapeblock-next">&#10095;</button>
		</div>
	<?php endif; ?>
</div>
