<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Vars below are local to this included template, not true globals.

$shapeblock_allowed_metas = isset($attributes['allowedMetas']) ? $attributes['allowedMetas'] : [];
$shapeblock_meta_html = '';
// $shapeblock_meta_position = isset($attributes['metaPosition']) ? $attributes['metaPosition'] : 'up_title';

if(empty($shapeblock_allowed_metas)) {
    return;
}

if ( in_array( 'author', $shapeblock_allowed_metas ) ) {
        $author_icon = '<i class="shapeblock-meta-icon shapeblock-icon-user-avatar"></i>';
        if($meta_style == '1') {
            $author_icon = '';
        }else if($meta_style == '2' || $meta_style == '3') {
            $author_id = get_the_author_meta('ID');
            $avatar_url = get_avatar_url($author_id, array(
                'size' => 150
            ));

            $author_icon = '<img src="'. esc_url( $avatar_url )  .'">';
        }
        $shapeblock_meta_html .= '<span class="bldpost-meta">' . $author_icon . '<a href="' . esc_url(get_author_posts_url(get_the_author_meta('ID'))) . '">' . esc_html( $attributes['authorPrefix'] ) . ' ' . esc_html( get_the_author() ) . '</a></span>';
}

$shapeblock_date_html = '';
if ( in_array( 'date', $shapeblock_allowed_metas ) && empty($attributes['showDateOnTop'])) {
    $date_icon = '<i class="shapeblock-meta-icon shapeblock-icon-calendar-two"></i>';
    $date = get_the_date();
    if(in_array($meta_style, ['1', '2'])) {
        $date_icon = '';
    }
    if(in_array($meta_style, ['2', '3'])) {
        $date = \ShapeBlock\Frontend\Helper::shapeblock_time_ago();
    }
    if(isset($modified_date) && $modified_date == false) {
        $date = get_the_date();
    }
    $shapeblock_date_html = '<span class="bldpost-meta">' . $date_icon . esc_html( $date ) . '</span>';
}

$shapeblock_category_html = '';
if ( in_array( 'category', $shapeblock_allowed_metas ) ) {
    $shapeblock_categories = get_the_category();
    if ( ! empty($shapeblock_categories) ) {
        $cat_links = [];
        foreach ($shapeblock_categories as $shapeblock_category) {
            if ( $shapeblock_category->slug === 'uncategorized' ) {
                continue;
            }
            $cat_links[] = '<a href="' . esc_url(get_category_link($shapeblock_category->term_id)) . '" class="shapeblock-meta-cat">' . esc_html( $shapeblock_category->name ) . '</a>';
        }
        if ( ! empty( $cat_links ) ) {
            $shapeblock_category_html  = '<span class="bldpost-meta"><i class="shapeblock-meta-icon shapeblock-icon-notification-status"></i>';
            $shapeblock_category_html .= implode( ', ', $cat_links );
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
        $tag_links = [];
        foreach ($shapeblock_tags as $shapeblock_tag) {
            $tag_links[] = '<a href="' . esc_url(get_tag_link($shapeblock_tag->term_id)) . '">' . esc_html( $shapeblock_tag->name ) . '</a>';
        }
        $shapeblock_meta_html .= implode( ',&nbsp;', $tag_links );
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
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
?>
<div class="shapeblock-post-metas shapeblock-post-metas-style-<?php echo esc_attr( $meta_style ); ?> shapeblock-post-meta-position-<?php echo esc_attr( $meta_position ); ?>">
    <?php
    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is escaped during generation
    echo wp_kses_post( $shapeblock_meta_html );
    ?>
</div>