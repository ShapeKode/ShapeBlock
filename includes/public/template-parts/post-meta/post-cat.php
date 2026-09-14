<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Vars below are local to this included template, not true globals.

$shapeblock_allowed_metas = isset($attributes['allowedMetas']) ? $attributes['allowedMetas'] : [];
$shapeblock_meta_html = '';

if ( in_array( 'category', $shapeblock_allowed_metas ) ) {
    $shapeblock_categories = get_the_category();
    if ( ! empty($shapeblock_categories) ) {
        $cat_links = '';
        foreach ($shapeblock_categories as $shapeblock_category) {
            if ( $shapeblock_category->slug === 'uncategorized' ) {
                continue;
            }
            $cat_color = get_term_meta($shapeblock_category->term_id, 'category_color', true);
            $dot_style = $cat_color ? 'background-color: ' . esc_attr( $cat_color ) : '';
            $cat_links = '<span class="shapeblock-cat-dot" style="' . $dot_style . '"></span><a href="' . esc_url(get_category_link($shapeblock_category->term_id)) . '">' . esc_html( $shapeblock_category->name ) . '</a>';
            
            if ( ! empty( $cat_links ) ) {
                $shapeblock_meta_html .= '<span class="bldpost-meta">';
                $shapeblock_meta_html .= $cat_links;
                $shapeblock_meta_html .= '</span>';
            }
        }

    }
}
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
?>
<div class="shapeblock-post-categories shapeblock-post-categories-style-<?php echo esc_attr( $cat_style ); ?>">
    <?php 
    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is escaped during generation
    echo wp_kses_post( $shapeblock_meta_html ); 
    ?>
</div>