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
                'description' => __( 'Display posts in a customizable grid.', 'shapeblock' ),
                'iconClass'   => 'shapeblock-icon-post-grid',
                'status'      => 'enable',
            ],
             [
                'title'       => __( 'Row', 'shapeblock' ),
                'id'          => 'layout-row',
                'description' => __( 'Flexible row/section container holding columns.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-row',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Column', 'shapeblock' ),
                'id'          => 'column',
                'description' => __( 'Child column inside a ShapeBlock Row.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-columns',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Simple Gallery', 'shapeblock' ),
                'id'          => 'gallery',
                'description' => __( 'Responsive image gallery with lightbox.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-marquee-logo',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Accordion', 'shapeblock' ),
                'id'          => 'faq',
                'description' => __( 'FAQ accordion with collapsible icons and schema.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-faq-1',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Pricing Table', 'shapeblock' ),
                'id'          => 'pricing-table',
                'description' => __( 'Configurable pricing table with features, featured ribbon and CTA.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-pricing-table',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Button', 'shapeblock' ),
                'id'          => 'button',
                'description' => __( 'A flexible button with icon, gradient and full style controls.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-button',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Icon', 'shapeblock' ),
                'id'          => 'icon',
                'description' => __( 'A single icon with color, size, background, border, rotation and link.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Heading', 'shapeblock' ),
                'id'          => 'heading',
                'description' => __( 'Heading with sub-heading, highlight, separator, gradient text.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-heading',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Team Member', 'shapeblock' ),
                'id'          => 'team-grid',
                'description' => __( 'Team member card with 5 skins, social icons, contact info and popup.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-team-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Testimonial', 'shapeblock' ),
                'id'          => 'testimonials-grid',
                'description' => __( 'Grid of testimonials with 6 skins, ratings, quote icons and logos.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-testimonials-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Feature List', 'shapeblock' ),
                'id'          => 'feature-list',
                'description' => __( 'A vertical list of features, each with an icon, number or image and a title.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-service-list',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Hover Box', 'shapeblock' ),
                'id'          => 'hover-box',
                'description' => __( 'An image or icon in a circle or square that reveals a title and description on hover.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Icon Box', 'shapeblock' ),
                'id'          => 'icon-box',
                'description' => __( 'Icon boxes with the icon on top, then title and description.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-iconbox',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Icon List', 'shapeblock' ),
                'id'          => 'icon-list',
                'description' => __( 'A list of icon + text rows with icon position and full styling.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-service-list',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Counter', 'shapeblock' ),
                'id'          => 'counter',
                'description' => __( 'Animated number counter with prefix/suffix, icon, title and odometer.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-counter',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Tabs', 'shapeblock' ),
                'id'          => 'tab',
                'description' => __( 'Tabbed content with icon or image tab titles, plus a title, description and button for each panel.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-tab',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Countdown', 'shapeblock' ),
                'id'          => 'countdown',
                'description' => __( 'Countdown timer to a target date with custom labels, separators and styling.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-countdown',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Table', 'shapeblock' ),
                'id'          => 'table',
                'description' => __( 'Data table with header, body and footer cells, icons, images and styling.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Social Share', 'shapeblock' ),
                'id'          => 'social-share',
                'description' => __( 'Buttons for sharing the current page on social networks.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-social-share',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Social Icon', 'shapeblock' ),
                'id'          => 'social-icon',
                'description' => __( 'A row of linked social icons with per-icon or global colors and hover states.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-social-icons',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Progress Bar', 'shapeblock' ),
                'id'          => 'progress',
                'description' => __( 'A progress / skill bar with title and percent, in two layout styles.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-progress-bar',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Client Logo', 'shapeblock' ),
                'id'          => 'clients-logo-grid',
                'description' => __( 'A responsive grid of client / partner logos with links and effects.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Image Comparison', 'shapeblock' ),
                'id'          => 'image-comparison',
                'description' => __( 'A before / after image comparison slider with a draggable handle.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-image-carousel',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Scroll to Top', 'shapeblock' ),
                'id'          => 'scroll-to-top',
                'description' => __( 'A floating scroll-to-top button that appears after scrolling.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-scroll-top',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Offcanvas', 'shapeblock' ),
                'id'          => 'offcanvas',
                'description' => __( 'A toggle button that opens an off-canvas template.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-canvas',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Search', 'shapeblock' ),
                'id'          => 'search',
                'description' => __( 'Site search with a popup lightbox skin or an inline search field skin.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-search',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Breadcrumb', 'shapeblock' ),
                'id'          => 'breadcrumb',
                'description' => __( 'A dynamic breadcrumb trail for the current page.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-tab',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Menu', 'shapeblock' ),
                'id'          => 'menu',
                'description' => __( 'Display a WordPress navigation menu with layout, alignment and colors.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-navigation',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Slider', 'shapeblock' ),
                'id'          => 'slider',
                'description' => __( 'A full-width image slider with arrows, dots and autoplay.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-slider',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Image Carousel', 'shapeblock' ),
                'id'          => 'image-carousel',
                'description' => __( 'Show several images at once with centered slides and continuous scrolling.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-image-horizontal-scroll',
                'status'      => 'enable',
            ],
            [
                'title'       => __( 'Isotope Filter', 'shapeblock' ),
                'id'          => 'isotope',
                'description' => __( 'Filterable grid: category buttons with icon, title and description items.', 'shapeblock' ),
                'iconClass'    => 'shapeblock-icon-filterable-gallery',
                'status'      => 'enable',
            ],
        ];

        // Default-enabled IDs: any block we want available without the user toggling it on first.
        $default_enabled = [ 'layout-row', 'column', 'post-grid', 'gallery', 'faq', 'pricing-table', 'button', 'icon', 'heading', 'hover-box', 'team-grid', 'testimonials-grid', 'feature-list', 'icon-box', 'icon-list', 'counter', 'tab', 'countdown', 'table', 'social-share', 'social-icon', 'progress', 'clients-logo-grid', 'image-comparison', 'scroll-to-top', 'offcanvas', 'search', 'breadcrumb', 'menu', 'slider', 'image-carousel', 'isotope' ];

        // Merge status from DB
        foreach ($blocks as &$block) {
            $default = in_array( $block['id'], $default_enabled, true ) ? 'enable' : 'disable';
            $block['status'] = get_option('shapeblock_block_' . $block['id'], $default);
        }
        unset($block);

        $blocks = apply_filters('shapeblock_blocks', $blocks);

        return $blocks;
    }
}