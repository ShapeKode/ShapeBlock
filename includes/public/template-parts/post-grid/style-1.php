<?php
	if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
	// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Local template variables.
?>
<div class="shapeblock-grid-item <?php echo esc_attr( $item_class ); ?>">
    <div class="shapeblock-grid-item-inner">
        
        <div class="shapeblock-blog-img <?php echo esc_attr( $thumb_anim ); ?> <?php echo esc_attr( $anim_style ); ?>">
            <a href="<?php the_permalink(); ?>">
            <?php
                if ( has_post_thumbnail() ) {
                    // Simple size for now
                    the_post_thumbnail( $thumbnail_size );
                } else {
                    echo '<img src="' . esc_url( SHAPEBLOCK_PL_URL . 'includes/public/assets/img/placeholder.png' ) . '" alt="' . esc_attr__( 'Placeholder', 'shapeblock' ) . '">';
                }
            ?>
            <?php if ( '1' == $style ) { ?>
                <div class="shapeblock-overlay-all"></div>
            <?php } ?>
            </a>
            <?php //if ( $show_meta ) include SHAPEBLOCK_PL_PATH . 'includes/public/template-parts/post-meta/post-cat.php'; ?>
            <?php
            // Strip 'category' from meta row (post-cat.php handles it above)
            $_saved_metas = $attributes['allowedMetas'];
            //$attributes['allowedMetas'] = array_values( array_diff( $attributes['allowedMetas'], ['category'] ) );
            ?>
        </div>

        <div class="shapeblock-blog-content">
            <?php if ( $show_meta && 'up_title' === $meta_position ) include SHAPEBLOCK_PL_PATH . 'includes/public/template-parts/post-meta/post-meta.php'; ?>
            
            <<?php echo esc_attr( $title_tag ); ?> class="shapeblock-blog-title">
                <a href="<?php the_permalink(); ?>"><?php echo esc_html( $trimmed_title ); ?></a>
            </<?php echo esc_attr( $title_tag ); ?>>

            <?php if ( $show_meta && 'below_title' === $meta_position ) include SHAPEBLOCK_PL_PATH . 'includes/public/template-parts/post-meta/post-meta.php'; ?>
            
            <?php if ( $show_excerpt === 'yes' ) : ?>
            <div class="shapeblock-blog-excerpt">
                <?php echo esc_html( $trimmed_excerpt ); ?>
            </div>
            <?php endif; ?>
            
            <?php if ( $show_meta && 'below_content' === $meta_position ) include SHAPEBLOCK_PL_PATH . 'includes/public/template-parts/post-meta/post-meta.php'; ?>
            <?php if ( $show_read_more === 'yes' && ! empty( $read_more_text ) ) : ?>
                <div class="shapeblock-read-more">
                    <a href="<?php the_permalink(); ?>" class="shapeblock-read-more-link">
                        <?php if ( $read_more_icon_pos === 'before' && $read_more_icon !== 'none') echo '<i class="' . esc_attr( $read_more_icon ) . ' shapeblock-read-more-icon before"></i>'; ?>
                        <?php echo esc_html( $read_more_text ); ?>
                        <?php if ( $read_more_icon_pos === 'after' && $read_more_icon !== 'none') echo '<i class="' . esc_attr( $read_more_icon ) . ' shapeblock-read-more-icon after"></i>'; ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
        
        <?php if($show_meta && in_array('date', $allowed_metas) && $show_date_on_top === 'yes' ): ?>
            <div class="shapeblock-blog-date-top">
                <h4><?php echo esc_html( get_the_time('d') ); ?></h4>
                <span><?php echo esc_html( get_the_time('M') ); ?></span>
            </div>
        <?php endif; ?>
        <?php $attributes['allowedMetas'] = $_saved_metas; ?>
    </div>
</div>