<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<div class="shapeblock-pagination-container">
    <?php
    // phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- $pagination_html is local to this included template, not a true global.
    if($pagination == true && $query->max_num_pages > 1) {
        $pagination_html = '';
        
        if ($pagination_type === 'numeric') {
            $pagination_html = paginate_links( array(
                'base'      => is_archive() ? str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ) : str_replace( '999999999', '%#%', add_query_arg( $page_key, '999999999' ) ),
                'format'    => is_archive() ? '?paged=%#%' : '',
                'current'   => $paged,
                'total'     => $query->max_num_pages,
                'prev_text' => '<i class="shapeblock-icon-chevron-left"></i>',
                'next_text' => '<i class="shapeblock-icon-chevron-right"></i>',
            ) );

            if ($pagination_html) {
                $pagination_html = '<div class="shapeblock-pagination">' . $pagination_html . '</div>';
            }
        }

        echo wp_kses_post( apply_filters( 'shapeblock_pagination_html', $pagination_html, $query, $attributes, $paged, $page_key ) );
    }
    // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
    ?>
</div>