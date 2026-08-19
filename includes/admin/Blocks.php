<?php
namespace EELFG\Admin;

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
                'iconClass'   => 'eelfg-icon-post-grid',
                'status'      => 'enable',
                "isPro"       => false,
            ],
             [
                'title'       => 'Row',
                'id'          => 'layout-row',
                'description' => 'Flexible row/section container holding columns.',
                'iconClass'    => 'eelfg-icon-row',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Column',
                'id'          => 'column',
                'description' => 'Child column inside a eelfgst Row.',
                'iconClass'    => 'eelfg-icon-columns',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Simple Gallery',
                'id'          => 'gallery',
                'description' => 'Responsive image gallery with lightbox.',
                'iconClass'    => 'eelfg-icon-marquee-logo',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Accordion',
                'id'          => 'faq',
                'description' => 'FAQ accordion with collapsible icons and schema.',
                'iconClass'    => 'eelfg-icon-faq-1',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Pricing Table',
                'id'          => 'pricing-table',
                'description' => 'Configurable pricing table with features, featured ribbon and CTA.',
                'iconClass'    => 'eelfg-icon-pricing-table',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Button',
                'id'          => 'button',
                'description' => 'A flexible button with icon, gradient and full style controls.',
                'iconClass'    => 'eelfg-icon-button',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Icon',
                'id'          => 'icon',
                'description' => 'A single icon with color, size, background, border, rotation and link.',
                'iconClass'    => 'eelfg-icon-iconbox',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Heading',
                'id'          => 'heading',
                'description' => 'Heading with sub-heading, highlight, separator, gradient text.',
                'iconClass'    => 'eelfg-icon-heading',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Team Member',
                'id'          => 'team-grid',
                'description' => 'Team member card with 5 skins, social icons, contact info and popup.',
                'iconClass'    => 'eelfg-icon-team-grid',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Testimonial',
                'id'          => 'testimonials-grid',
                'description' => 'Grid of testimonials with 6 skins, ratings, quote icons and logos.',
                'iconClass'    => 'eelfg-icon-testimonials-grid',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Features List',
                'id'          => 'feature-list',
                'description' => 'A vertical list of features with icon/number/image, title.',
                'iconClass'    => 'eelfg-icon-service-list',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Icon Box',
                'id'          => 'icon-box',
                'description' => 'Icon boxes with the icon on top, then title and description.',
                'iconClass'    => 'eelfg-icon-iconbox',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Icon List',
                'id'          => 'icon-list',
                'description' => 'A list of icon + text rows with icon position and full styling.',
                'iconClass'    => 'eelfg-icon-service-list',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Counter',
                'id'          => 'counter',
                'description' => 'Animated number counter with prefix/suffix, icon, title and odometer.',
                'iconClass'    => 'eelfg-icon-counter',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Tabs',
                'id'          => 'tab',
                'description' => 'Tabbed content with icon/image titles, content title, description and button.',
                'iconClass'    => 'eelfg-icon-tab',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Countdown',
                'id'          => 'countdown',
                'description' => 'Countdown timer to a target date with custom labels, separators and styling.',
                'iconClass'    => 'eelfg-icon-countdown',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Table',
                'id'          => 'table',
                'description' => 'Data table with header, body and footer cells, icons, images and styling.',
                'iconClass'    => 'eelfg-icon-clients-logo-grid',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Social Share',
                'id'          => 'social-share',
                'description' => 'Social share buttons for the current page sharing.',
                'iconClass'    => 'eelfg-icon-social-share',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Social Icon',
                'id'          => 'social-icon',
                'description' => 'A row of linked social icons with per-icon or global colors and hover states.',
                'iconClass'    => 'eelfg-icon-social-icons',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Progress Bar',
                'id'          => 'progress',
                'description' => 'A progress / skill bar with title and percent, in two layout styles.',
                'iconClass'    => 'eelfg-icon-progress-bar',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Client Logo',
                'id'          => 'clients-logo-grid',
                'description' => 'A responsive grid of client / partner logos with links and effects.',
                'iconClass'    => 'eelfg-icon-clients-logo-grid',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Image Comparison',
                'id'          => 'image-comparison',
                'description' => 'A before / after image comparison slider with a draggable handle.',
                'iconClass'    => 'eelfg-icon-image-carousel',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Scroll Top',
                'id'          => 'scroll-to-top',
                'description' => 'A floating scroll-to-top button that appears after scrolling.',
                'iconClass'    => 'eelfg-icon-scroll-top',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Offcanvas',
                'id'          => 'offcanvas',
                'description' => 'A toggle button that opens an off-canvas template.',
                'iconClass'    => 'eelfg-icon-canvas',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Search',
                'id'          => 'search',
                'description' => 'Site search with a popup lightbox skin or an inline search field skin.',
                'iconClass'    => 'eelfg-icon-search',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Breadcrumb',
                'id'          => 'breadcrumb',
                'description' => 'A dynamic breadcrumb trail for the current page.',
                'iconClass'    => 'eelfg-icon-tab',
                'status'      => 'enable',
                "isPro"       => false,
            ],
            [
                'title'       => 'Menu',
                'id'          => 'menu',
                'description' => 'Display a WordPress navigation menu with layout, alignment and colors.',
                'iconClass'    => 'eelfg-icon-navigation',
                'status'      => 'enable',
                "isPro"       => false,
            ],
        ];

        // Default-enabled IDs: any block we want available without the user toggling it on first.
        $default_enabled = [ 'layout-row', 'column', 'post-grid', 'gallery', 'faq', 'pricing-table', 'button', 'icon', 'heading', 'team-grid', 'testimonials-grid', 'feature-list', 'icon-box', 'icon-list', 'counter', 'tab', 'countdown', 'table', 'social-share', 'social-icon', 'progress', 'clients-logo-grid', 'image-comparison', 'scroll-to-top', 'offcanvas', 'search', 'breadcrumb', 'menu' ];

        // Merge status from DB
        foreach ($blocks as &$block) {
            $default = in_array( $block['id'], $default_enabled, true ) ? 'enable' : 'disable';
            $block['status'] = get_option('eelfg_block_' . $block['id'], $default);
        }
        unset($block);

        $blocks = apply_filters('eelfg_blocks', $blocks);

        return $blocks;
    }
}