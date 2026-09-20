<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

$shapeblock_allowed_metas = isset($attributes['allowedMetas']) ? $attributes['allowedMetas'] : [];
$shapeblock_meta_html = '';

if ( in_array( 'category', $shapeblock_allowed_metas ) ) {
    $shapeblock_categories = get_the_category();
    if ( ! empty($shapeblock_categories) ) {
        $shapeblock_cat_links = '';
        foreach ($shapeblock_categories as $shapeblock_category) {
            if ( $shapeblock_category->slug === 'uncategorized' ) {
                continue;
            }
            $shapeblock_cat_color = get_term_meta($shapeblock_category->term_id, 'category_color', true);
            $shapeblock_dot_style = $shapeblock_cat_color ? 'background-color: ' . esc_attr( $shapeblock_cat_color ) : '';
            $shapeblock_cat_links = '<span class="shapeblock-cat-dot" style="' . $shapeblock_dot_style . '"></span><a href="' . esc_url(get_category_link($shapeblock_category->term_id)) . '">' . esc_html( $shapeblock_category->name ) . '</a>';

            if ( ! empty( $shapeblock_cat_links ) ) {
                $shapeblock_meta_html .= '<span class="bldpost-meta">';
                $shapeblock_meta_html .= $shapeblock_cat_links;
                $shapeblock_meta_html .= '</span>';
            }
        }

    }
}
?>
<div class="shapeblock-post-categories shapeblock-post-categories-style-<?php echo esc_attr( $cat_style ); ?>">
    <?php
    echo wp_kses_post( $shapeblock_meta_html );
    ?>
</div>