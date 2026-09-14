=== ShapeBlock ===
Contributors: shapekode22
Tags: blocks, gutenberg, block editor, carousel, slider
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A library of 30 Gutenberg blocks - sliders, carousels, grids, tabs, counters and more - with full styling and per-device controls.

== Description ==

ShapeBlock is a block library for the WordPress block editor. It adds 30 blocks for the things a page usually needs - sliders and carousels, post and team grids, tabs and accordions, pricing tables, counters and countdowns, navigation, search and more.

Every block is built the same way: a Settings tab for content, a Layout tab for structure, and a Style tab for colours, typography, borders, spacing and shadows. Sizes, spacing and layout values can be set separately for desktop, tablet and mobile.

= Blocks included =

1. Accordion - Collapsible question and answer sections.
2. Breadcrumb - Show visitors where they are in the site.
3. Button - Buttons with icons, sizes and hover styles.
4. Client Logo - A grid of client or partner logos with links, grayscale and hover-swap.
5. Column - A column inside a Row, with its own width per device.
6. Countdown - A countdown timer to a date and time.
7. Counter - Animated number counters.
8. Features List - Icon-based feature lists.
9. Heading - Headings with typography, gradient and highlight options.
10. Icon - A single icon with colour, size and link.
11. Icon Box - An icon, heading and text together, with several layouts.
12. Icon List - A list of items, each with its own icon.
13. Image Carousel - Several images at once, with centred slides and continuous scrolling.
14. Image Comparison - A before / after image slider with a draggable handle.
15. Menu - Display a WordPress navigation menu with layout, alignment and colours.
16. Offcanvas - Slide-in panels for menus, sidebars or extra content.
17. Post Grid - Show posts in grid layouts, with pagination and optional video.
18. Pricing Table - Pricing plans with features, badges and a call to action.
19. Progress Bar - Animated progress and skill bars.
20. Row - A responsive row that holds Column blocks.
21. Scroll Top - A back-to-top button.
22. Search - A site search field you can place anywhere.
23. Simple Gallery - An image gallery with spacing and column controls.
24. Slider - A full-width image slider with arrows, dots and autoplay.
25. Social Icon - A row of linked social icons with global or per-icon colours.
26. Social Share - Share buttons for the current page.
27. Table - Build a table with styled headers, rows and cells.
28. Tabs - Tabbed content with icons and several tab styles.
29. Team Member - Present team members with photo, role and social links.
30. Testimonial - Client feedback with photo, rating and company logo.

= Turn off what you do not use =

Every block can be switched off from the ShapeBlock settings screen, so only the blocks you actually use are registered and only their assets load.

= Templates and theme areas =

ShapeBlock includes a template post type and a builder for site areas such as the header and footer. Saved templates can also be placed with the `[shapeblock_template]` shortcode, and builder areas with `[shapeblock_builder]`.

= Built for the block editor =

The blocks are native block-editor blocks with live previews in the canvas, no page-builder layer and no shortcode required for normal use. Styles are printed per block instance and scoped to that block, so two copies of the same block on one page never affect each other.

== External services ==

**Google Fonts**

This plugin connects to the Google Fonts API to fetch the list of available font families, so the font pickers in the block settings can show up-to-date choices.

It requests `https://fonts.google.com/metadata/fonts` when a font list is first needed in the editor, and caches the result. Only that request is made - no site data, personal data or user data is sent, and the request happens in the admin only.

Selected font families are then loaded on the front end from `https://fonts.googleapis.com` and `https://fonts.gstatic.com`, which is what renders the font you picked. Again, only the font request itself is sent.

This service is provided by Google: [terms of service](https://policies.google.com/terms), [privacy policy](https://policies.google.com/privacy).

**Video embeds (only if you add a video URL)**

If you enter a video URL in the Post Grid block, WordPress' own oEmbed handling contacts that video provider to build the embed - for example YouTube or Vimeo - and the resulting player is loaded from the provider when the page is viewed. This happens only for a URL you enter yourself; no request is made otherwise, and no site or user data is sent beyond the URL itself.

YouTube: [terms of service](https://www.youtube.com/t/terms), [privacy policy](https://policies.google.com/privacy).
Vimeo: [terms of service](https://vimeo.com/terms), [privacy policy](https://vimeo.com/privacy).

The Social Share block only builds ordinary links to the sharing pages of the networks you enable. Nothing is requested or sent until a visitor clicks one.

== Installation ==

1. Upload the `shapeblock` folder to the `/wp-content/plugins/` directory, or install the plugin through the Plugins screen in WordPress.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Edit any post or page and add a ShapeBlock block from the block inserter.
4. Adjust the block in the Settings, Layout and Style tabs, then publish.

== Frequently Asked Questions ==

= Is ShapeBlock compatible with my theme? =

Yes. ShapeBlock is designed to work with any properly coded WordPress theme, block themes included. The blocks inherit your theme's typography and can be restyled from the block settings.

= Do I have to use all 30 blocks? =

No. Open the ShapeBlock settings screen and switch off any block you do not need. A block that is off is not registered and its assets are not loaded.

= Can I set different values for mobile and tablet? =

Yes. Sizes, spacing, column counts and similar settings have a device switcher, so desktop, tablet and mobile can each hold their own value.

= Can I customize the block styles? =

Yes. Each block has a Style tab with colours, typography, spacing, borders, radius, shadows and hover states.

= Does it work with custom post types? =

The Post Grid block is built around standard WordPress posts. Custom post type support may be added in a future version.

= Is the plugin translation ready? =

Yes. ShapeBlock follows WordPress internationalization standards and ships with a `.pot` file in the `languages` folder.

= Does ShapeBlock work with page builders? =

ShapeBlock works natively inside the WordPress block editor. It does not add widgets to third-party page builders.

== Changelog ==

= 1.0.0 =
* Initial release.
