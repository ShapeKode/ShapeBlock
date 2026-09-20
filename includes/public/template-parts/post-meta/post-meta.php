<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

$shapeblock_allowed_metas = isset($attributes['allowedMetas']) ? $attributes['allowedMetas'] : [];
$shapeblock_meta_html = '';
// $shapeblock_meta_position = isset($attributes['metaPosition']) ? $attributes['metaPosition'] : 'up_title';

if(empty($shapeblock_allowed_metas)) {
    return;
}

if ( in_array( 'author', $shapeblock_allowed_metas ) ) {
        $shapeblock_author_icon = '<i class="shapeblock-meta-icon shapeblock-icon-user-avatar"></i>';
        if($meta_style == '1') {
            $shapeblock_author_icon = '';
        }else if($meta_style == '2' || $meta_style == '3') {
            $shapeblock_author_id = get_the_author_meta('ID');
            $shapeblock_avatar_url = get_avatar_url($shapeblock_author_id, array(
                'size' => 150
            ));

            $shapeblock_author_icon = '<img src="'. esc_url( $shapeblock_avatar_url )  .'">';
        }
        $shapeblock_meta_html .= '<span class="bldpost-meta">' . $shapeblock_author_icon . '<a href="' . esc_url(get_author_posts_url(get_the_author_meta('ID'))) . '">' . esc_html( $attributes['authorPrefix'] ) . ' ' . esc_html( get_the_author() ) . '</a></span>';
}

$shapeblock_date_html = '';
if ( in_array( 'date', $shapeblock_allowed_metas ) && empty($attributes['showDateOnTop'])) {
    $shapeblock_date_icon = '<i class="shapeblock-meta-icon shapeblock-icon-calendar-two"></i>';
    $shapeblock_date = get_the_date();
    if(in_array($meta_style, ['1', '2'])) {
        $shapeblock_date_icon = '';
    }
    if(in_array($meta_style, ['2', '3'])) {
        $shapeblock_date = \ShapeBlock\Frontend\Helper::shapeblock_time_ago();
    }
    if(isset($modified_date) && $modified_date == false) {
        $shapeblock_date = get_the_date();
    }
    $shapeblock_date_html = '<span class="bldpost-meta">' . $shapeblock_date_icon . esc_html( $shapeblock_date ) . '</span>';
}

$shapeblock_category_html = '';
if ( in_array( 'category', $shapeblock_allowed_metas ) ) {
    $shapeblock_categories = get_the_category();
    if ( ! empty($shapeblock_categories) ) {
        $shapeblock_cat_links = [];
        foreach ($shapeblock_categories as $shapeblock_category) {
            if ( $shapeblock_category->slug === 'uncategorized' ) {
                continue;
            }
            $shapeblock_cat_links[] = '<a href="' . esc_url(get_category_link($shapeblock_category->term_id)) . '" class="shapeblock-meta-cat">' . esc_html( $shapeblock_category->name ) . '</a>';
        }
        if ( ! empty( $shapeblock_cat_links ) ) {
            $shapeblock_category_html  = '<span class="bldpost-meta"><i class="shapeblock-meta-icon shapeblock-icon-notification-status"></i>';
            $shapeblock_category_html .= implode( ', ', $shapeblock_cat_links );
            $shapeblock_category_html .= '</span>';
        }
    }
}

if ( $meta_style == '3' ) {
    $shapeblock_meta_html .= $shapeblock_category_html . $shapeblock_date_html;
} else {
    $shapeblock_meta_html .= $shapeblock_date_html . $shapeblock_category_html;
}
if ( in_array( 'tag', $shapeblock_allowed_metas ) ) {
    $shapeblock_tags = get_the_tags();
    if ( $shapeblock_tags ) {
        $shapeblock_meta_html .= '<span class="bldpost-meta"><i class="shapeblock-meta-icon shapeblock-icon-tags"></i>';
        $shapeblock_tag_links = [];
        foreach ($shapeblock_tags as $shapeblock_tag) {
            $shapeblock_tag_links[] = '<a href="' . esc_url(get_tag_link($shapeblock_tag->term_id)) . '">' . esc_html( $shapeblock_tag->name ) . '</a>';
        }
        $shapeblock_meta_html .= implode( ',&nbsp;', $shapeblock_tag_links );
        $shapeblock_meta_html .= '</span>';
    }
}

if ( in_array( 'comments_count', $shapeblock_allowed_metas ) ) {
    $shapeblock_meta_html .= '<span class="bldpost-meta"><i class="shapeblock-meta-icon shapeblock-icon-chat"></i>';
    $shapeblock_meta_html .= get_comments_number();
    $shapeblock_meta_html .= '</span>';
}

// Allowed meta types may still produce no output for this post (e.g. tag/category have no terms,
// or only 'date' is allowed but showDateOnTop is on). Skip the wrapper so we don't ship empty markup.
if ( '' === trim( $shapeblock_meta_html ) ) {
    return;
}
?>
<div class="shapeblock-post-metas shapeblock-post-metas-style-<?php echo esc_attr( $meta_style ); ?> shapeblock-post-meta-position-<?php echo esc_attr( $meta_position ); ?>">
    <?php
    echo wp_kses_post( $shapeblock_meta_html );
    ?>
</div>