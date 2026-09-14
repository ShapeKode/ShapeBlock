<?php 
	if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<div class="shapeblock-grid-item <?php echo esc_attr( $item_class ); ?>">
    <div class="shapeblock-grid-item-inner">
        
        <div class="shapeblock-blog-img <?php echo esc_attr( $thumb_anim ); ?> <?php echo esc_attr( $anim_style ); ?>">
            <a href="<?php the_permalink(); ?>">
                <?php if( $show_meta && in_array('date', $allowed_metas) && $show_date_on_top === 'yes' ): ?>
                    <div class="shapeblock-blog-date-top">
                        <h4><?php echo esc_html( get_the_time('d') ); ?></h4>
                        <span><?php echo esc_html( get_the_time('M') ); ?></span>
                    </div>
                <?php endif; ?>
                <?php if(empty($video_url)){ ?>
                    <a href="<?php the_permalink(); ?>">
                    <?php
                        if ( has_post_thumbnail() ) {
                            // Simple size for now
                            the_post_thumbnail( $thumbnail_size );
                        }
                    ?>
                    </a>
                <?php } ?>
                
                <div class="shapeblock-overlay-all"></div>
            
                <?php if ( ! empty($embed_video) ) { ?>
                    <div class="shapeblock-video-wrapper">
                        <?php echo $embed_video; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Trusted markup from \ShapeBlock\Frontend\Helper::shapeblock_get_video_embed(), built from esc_attr/esc_url and wp_oembed_get. ?>
                        <span class="play-icon"></span>
                    </div>
                <?php } ?>
            </a>
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
    </div>
</div>