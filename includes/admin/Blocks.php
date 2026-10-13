<?php
namespace ShapeBlock\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Blocks {
    public static function instance() {
        static $instance = null;
        if ( null === $instance ) {
            $instance = new self();
        }
        return $instance;
    }

    public function get_blocks() {
        $blocks = [
            [
                'title'       => __( 'Post Grid', 'shapeblock' ),
                'id'        => 'post-grid',
                'description' => __( 'Posts in a customizable grid.', 'shapeblock' ),
                'iconClass'   => 'shapeblock-icon-post-grid',
            ],
             [
                'title'       => __( 'Row', 'shapeblock' ),
                'id'          => 'layout-row',
                'description' => __( 'Section that holds columns.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-row',
            ],
            [
                'title'       => __( 'Column', 'shapeblock' ),
                'id'          => 'column',
                'description' => __( 'A column inside a Row.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-columns',
            ],
            [
                'title'       => __( 'Simple Gallery', 'shapeblock' ),
                'id'          => 'gallery',
                'description' => __( 'Image gallery with lightbox.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-marquee-logo',
            ],
            [
                'title'       => __( 'Accordion', 'shapeblock' ),
                'id'          => 'faq',
                'description' => __( 'Collapsible FAQ with schema.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-faq-1',
            ],
            [
                'title'       => __( 'Pricing Table', 'shapeblock' ),
                'id'          => 'pricing-table',
                'description' => __( 'Pricing plans with features.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-pricing-table',
            ],
            [
                'title'       => __( 'Button', 'shapeblock' ),
                'id'          => 'button',
                'description' => __( 'Button with icon and styles.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-button',
            ],
            [
                'title'       => __( 'Icon', 'shapeblock' ),
                'id'          => 'icon',
                'description' => __( 'A single icon with a link.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
            ],
            [
                'title'       => __( 'Heading', 'shapeblock' ),
                'id'          => 'heading',
                'description' => __( 'Heading with a sub-heading.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-heading',
            ],
            [
                'title'       => __( 'Team Member', 'shapeblock' ),
                'id'          => 'team-grid',
                'description' => __( 'Team members with socials.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-team-grid',
            ],
            [
                'title'       => __( 'Testimonial', 'shapeblock' ),
                'id'          => 'testimonials-grid',
                'description' => __( 'Client reviews with ratings.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-testimonials-grid',
            ],
            [
                'title'       => __( 'Feature List', 'shapeblock' ),
                'id'          => 'feature-list',
                'description' => __( 'Feature list with icons.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-service-list',
            ],
            [
                'title'       => __( 'Hover Box', 'shapeblock' ),
                'id'          => 'hover-box',
                'description' => __( 'Box that shows text on hover.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
            ],
            [
                'title'       => __( 'Icon Box', 'shapeblock' ),
                'id'          => 'icon-box',
                'description' => __( 'Icon, title and text box.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
            ],
            [
                'title'       => __( 'Icon List', 'shapeblock' ),
                'id'          => 'icon-list',
                'description' => __( 'List of rows with icons.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-service-list',
            ],
            [
                'title'       => __( 'Counter', 'shapeblock' ),
                'id'          => 'counter',
                'description' => __( 'Animated number counter.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-counter',
            ],
            [
                'title'       => __( 'Tabs', 'shapeblock' ),
                'id'          => 'tab',
                'description' => __( 'Content in tabbed panels.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-tab',
            ],
            [
                'title'       => __( 'Countdown', 'shapeblock' ),
                'id'          => 'countdown',
                'description' => __( 'Countdown timer to a date.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-countdown',
            ],
            [
                'title'       => __( 'Table', 'shapeblock' ),
                'id'          => 'table',
                'description' => __( 'Data table with icons.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
            ],
            [
                'title'       => __( 'Social Share', 'shapeblock' ),
                'id'          => 'social-share',
                'description' => __( 'Share buttons for socials.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-social-share',
            ],
            [
                'title'       => __( 'Social Icon', 'shapeblock' ),
                'id'          => 'social-icon',
                'description' => __( 'Linked social media icons.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-social-icons',
            ],
            [
                'title'       => __( 'Progress Bar', 'shapeblock' ),
                'id'          => 'progress',
                'description' => __( 'Progress and skill bars.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-progress-bar',
            ],
            [
                'title'       => __( 'Client Logo', 'shapeblock' ),
                'id'          => 'clients-logo-grid',
                'description' => __( 'A grid of client logos.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
            ],
            [
                'title'       => __( 'Image Comparison', 'shapeblock' ),
                'id'          => 'image-comparison',
                'description' => __( 'Before / after image slider.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-image-carousel',
            ],
            [
                'title'       => __( 'Scroll to Top', 'shapeblock' ),
                'id'          => 'scroll-to-top',
                'description' => __( 'Button back to page top.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-scroll-top',
            ],
            [
                'title'       => __( 'Offcanvas', 'shapeblock' ),
                'id'          => 'offcanvas',
                'description' => __( 'Button that opens a panel.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-canvas',
            ],
            [
                'title'       => __( 'Search', 'shapeblock' ),
                'id'          => 'search',
                'description' => __( 'Search popup or search field.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-search',
            ],
            [
                'title'       => __( 'Breadcrumb', 'shapeblock' ),
                'id'          => 'breadcrumb',
                'description' => __( 'Breadcrumb trail for pages.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-tab',
            ],
            [
                'title'       => __( 'Menu', 'shapeblock' ),
                'id'          => 'menu',
                'description' => __( 'Navigation menu with styles.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-navigation',
            ],
            [
                'title'       => __( 'Slider', 'shapeblock' ),
                'id'          => 'slider',
                'description' => __( 'Full-width image slider.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-slider',
            ],
            [
                'title'       => __( 'Image Carousel', 'shapeblock' ),
                'id'          => 'image-carousel',
                'description' => __( 'Images in a carousel.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-image-horizontal-scroll',
            ],
            [
                'title'       => __( 'Isotope Filter', 'shapeblock' ),
                'id'          => 'isotope',
                'description' => __( 'Filterable grid by category.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-filterable-gallery',
            ],
            [
                'title'       => __( 'Filterable List', 'shapeblock' ),
                'id'          => 'filter-list',
                'description' => __( 'Links with icons, filter buttons and search.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-service-list',
            ],
            [
                'title'       => __( 'Sticky Stack', 'shapeblock' ),
                'id'          => 'sticky-stack',
                'description' => __( 'Cards that stack on scroll.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-process-slider',
            ],
        ];

        // The tab each block is listed under on the dashboard.
        $categories = array(
            'layout-row'        => 'layout',
            'column'            => 'layout',
            'sticky-stack'      => 'layout',
            'heading'           => 'content',
            'button'            => 'content',
            'icon'              => 'content',
            'icon-box'          => 'content',
            'icon-list'         => 'content',
            'feature-list'      => 'content',
            'faq'               => 'content',
            'tab'               => 'content',
            'table'             => 'content',
            'hover-box'         => 'content',
            'slider'            => 'media',
            'image-carousel'    => 'media',
            'gallery'           => 'media',
            'image-comparison'  => 'media',
            'clients-logo-grid' => 'media',
            'team-grid'         => 'showcase',
            'testimonials-grid' => 'showcase',
            'pricing-table'     => 'showcase',
            'counter'           => 'showcase',
            'progress'          => 'showcase',
            'isotope'           => 'showcase',
            'filter-list'       => 'content',
            'countdown'         => 'showcase',
            'menu'              => 'header-footer',
            'search'            => 'header-footer',
            'breadcrumb'        => 'header-footer',
            'offcanvas'         => 'header-footer',
            'scroll-to-top'     => 'header-footer',
            'social-icon'       => 'header-footer',
            'post-grid'         => 'posts',
            'social-share'      => 'posts',
        );

        // Merge status from DB. Every block is enabled until it is switched off.
        // Every block in this plugin is free; the dashboard shows that as a tag.
        foreach ($blocks as &$block) {
            $block['category']  = isset( $categories[ $block['id'] ] ) ? $categories[ $block['id'] ] : '';
            $block['status']    = get_option('shapeblock_block_' . $block['id'], 'enable');
            $block['badge']     = __( 'Free', 'shapeblock' );
            $block['badgeType'] = 'free';
        }
        unset($block);

        $blocks = apply_filters('shapeblock_blocks', $blocks);

        return $blocks;
    }

    /**
     * The tabs of the Blocks page, in order: slug => label. A tab shows only
     * when a block is in it.
     *
     * @return array<string,string>
     */
    public function get_categories() {
        $categories = array(
            'layout'        => __( 'Layout', 'shapeblock' ),
            'content'       => __( 'Content', 'shapeblock' ),
            'media'         => __( 'Media', 'shapeblock' ),
            'header-footer' => __( 'Header Footer', 'shapeblock' ),
            'showcase'      => __( 'Showcase', 'shapeblock' ),
            'posts'         => __( 'Posts & Site', 'shapeblock' ),
            'form'          => __( 'Form', 'shapeblock' ),
            'feed'          => __( 'Feed', 'shapeblock' ),
        );

        /**
         * Filter the tabs of the Blocks page.
         *
         * @param array<string,string> $categories Slug => label.
         */
        return (array) apply_filters( 'shapeblock_block_categories', $categories );
    }
}