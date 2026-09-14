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
                'title'       => 'Post Grid',
                'id'        => 'post-grid',
                'description' => 'Post Grid Block',
                'iconClass'   => 'shapeblock-icon-post-grid',
                'status'      => 'enable',
            ],
             [
                'title'       => 'Row',
                'id'          => 'layout-row',
                'description' => 'Flexible row/section container holding columns.',
                'iconClass'    => 'shapeblock-icon-row',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Column',
                'id'          => 'column',
                'description' => 'Child column inside a ShapeBlock Row.',
                'iconClass'    => 'shapeblock-icon-columns',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Simple Gallery',
                'id'          => 'gallery',
                'description' => 'Responsive image gallery with lightbox.',
                'iconClass'    => 'shapeblock-icon-marquee-logo',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Accordion',
                'id'          => 'faq',
                'description' => 'FAQ accordion with collapsible icons and schema.',
                'iconClass'    => 'shapeblock-icon-faq-1',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Pricing Table',
                'id'          => 'pricing-table',
                'description' => 'Configurable pricing table with features, featured ribbon and CTA.',
                'iconClass'    => 'shapeblock-icon-pricing-table',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Button',
                'id'          => 'button',
                'description' => 'A flexible button with icon, gradient and full style controls.',
                'iconClass'    => 'shapeblock-icon-button',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Icon',
                'id'          => 'icon',
                'description' => 'A single icon with color, size, background, border, rotation and link.',
                'iconClass'    => 'shapeblock-icon-iconbox',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Heading',
                'id'          => 'heading',
                'description' => 'Heading with sub-heading, highlight, separator, gradient text.',
                'iconClass'    => 'shapeblock-icon-heading',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Team Member',
                'id'          => 'team-grid',
                'description' => 'Team member card with 5 skins, social icons, contact info and popup.',
                'iconClass'    => 'shapeblock-icon-team-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Testimonial',
                'id'          => 'testimonials-grid',
                'description' => 'Grid of testimonials with 6 skins, ratings, quote icons and logos.',
                'iconClass'    => 'shapeblock-icon-testimonials-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Features List',
                'id'          => 'feature-list',
                'description' => 'A vertical list of features with icon/number/image, title.',
                'iconClass'    => 'shapeblock-icon-service-list',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Icon Box',
                'id'          => 'icon-box',
                'description' => 'Icon boxes with the icon on top, then title and description.',
                'iconClass'    => 'shapeblock-icon-iconbox',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Icon List',
                'id'          => 'icon-list',
                'description' => 'A list of icon + text rows with icon position and full styling.',
                'iconClass'    => 'shapeblock-icon-service-list',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Counter',
                'id'          => 'counter',
                'description' => 'Animated number counter with prefix/suffix, icon, title and odometer.',
                'iconClass'    => 'shapeblock-icon-counter',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Tabs',
                'id'          => 'tab',
                'description' => 'Tabbed content with icon/image titles, content title, description and button.',
                'iconClass'    => 'shapeblock-icon-tab',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Countdown',
                'id'          => 'countdown',
                'description' => 'Countdown timer to a target date with custom labels, separators and styling.',
                'iconClass'    => 'shapeblock-icon-countdown',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Table',
                'id'          => 'table',
                'description' => 'Data table with header, body and footer cells, icons, images and styling.',
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Social Share',
                'id'          => 'social-share',
                'description' => 'Social share buttons for the current page sharing.',
                'iconClass'    => 'shapeblock-icon-social-share',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Social Icon',
                'id'          => 'social-icon',
                'description' => 'A row of linked social icons with per-icon or global colors and hover states.',
                'iconClass'    => 'shapeblock-icon-social-icons',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Progress Bar',
                'id'          => 'progress',
                'description' => 'A progress / skill bar with title and percent, in two layout styles.',
                'iconClass'    => 'shapeblock-icon-progress-bar',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Client Logo',
                'id'          => 'clients-logo-grid',
                'description' => 'A responsive grid of client / partner logos with links and effects.',
                'iconClass'    => 'shapeblock-icon-clients-logo-grid',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Image Comparison',
                'id'          => 'image-comparison',
                'description' => 'A before / after image comparison slider with a draggable handle.',
                'iconClass'    => 'shapeblock-icon-image-carousel',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Scroll Top',
                'id'          => 'scroll-to-top',
                'description' => 'A floating scroll-to-top button that appears after scrolling.',
                'iconClass'    => 'shapeblock-icon-scroll-top',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Offcanvas',
                'id'          => 'offcanvas',
                'description' => 'A toggle button that opens an off-canvas template.',
                'iconClass'    => 'shapeblock-icon-canvas',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Search',
                'id'          => 'search',
                'description' => 'Site search with a popup lightbox skin or an inline search field skin.',
                'iconClass'    => 'shapeblock-icon-search',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Breadcrumb',
                'id'          => 'breadcrumb',
                'description' => 'A dynamic breadcrumb trail for the current page.',
                'iconClass'    => 'shapeblock-icon-tab',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Menu',
                'id'          => 'menu',
                'description' => 'Display a WordPress navigation menu with layout, alignment and colors.',
                'iconClass'    => 'shapeblock-icon-navigation',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Slider',
                'id'          => 'slider',
                'description' => 'A full-width image slider with arrows, dots and autoplay.',
                'iconClass'    => 'shapeblock-icon-slider',
                'status'      => 'enable',
            ],
            [
                'title'       => 'Image Carousel',
                'id'          => 'image-carousel',
                'description' => 'Show several images at once with centered slides and continuous scrolling.',
                'iconClass'    => 'shapeblock-icon-image-horizontal-scroll',
                'status'      => 'enable',
            ],
        ];

        // Default-enabled IDs: any block we want available without the user toggling it on first.
        $default_enabled = [ 'layout-row', 'column', 'post-grid', 'gallery', 'faq', 'pricing-table', 'button', 'icon', 'heading', 'team-grid', 'testimonials-grid', 'feature-list', 'icon-box', 'icon-list', 'counter', 'tab', 'countdown', 'table', 'social-share', 'social-icon', 'progress', 'clients-logo-grid', 'image-comparison', 'scroll-to-top', 'offcanvas', 'search', 'breadcrumb', 'menu', 'slider', 'image-carousel' ];

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