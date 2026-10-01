=== ShapeBlock ===
Contributors: shapekode22
Tags: blocks, gutenberg, block editor, carousel, slider
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A library of 31 Gutenberg blocks - sliders, carousels, grids, tabs, counters and more - with full styling and per-device controls.

== Description ==

ShapeBlock is a block library for the WordPress block editor. It adds 31 blocks for the things a page usually needs - sliders and carousels, post and team grids, tabs and accordions, pricing tables, counters and countdowns, navigation, search and more.

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
10. Hover Box - An image or icon in a circle or square that reveals a title and description on hover.
11. Icon - A single icon with colour, size and link.
12. Icon Box - An icon, heading and text together, with several layouts.
13. Icon List - A list of items, each with its own icon.
14. Image Carousel - Several images at once, with centred slides and continuous scrolling.
15. Image Comparison - A before / after image slider with a draggable handle.
16. Menu - Display a WordPress navigation menu with layout, alignment and colours.
17. Offcanvas - Slide-in panels for menus, sidebars or extra content.
18. Post Grid - Show posts in grid layouts, with pagination and optional video.
19. Pricing Table - Pricing plans with features, badges and a call to action.
20. Progress Bar - Animated progress and skill bars.
21. Row - A responsive row that holds Column blocks.
22. Scroll Top - A back-to-top button.
23. Search - A site search field you can place anywhere.
24. Simple Gallery - An image gallery with spacing and column controls.
25. Slider - A full-width image slider with arrows, dots and autoplay.
26. Social Icon - A row of linked social icons with global or per-icon colours.
27. Social Share - Share buttons for the current page.
28. Table - Build a table with styled headers, rows and cells.
29. Tabs - Tabbed content with icons and several tab styles.
30. Team Member - Present team members with photo, role and social links.
31. Testimonial - Client feedback with photo, rating and company logo.

= No external connections by default =

ShapeBlock works entirely on your own site. Google Fonts is optional and switched
off until you enable it in ShapeBlock > Settings, so nothing is requested from
Google unless you ask for it.

= Turn off what you do not use =

Every block can be switched off from the ShapeBlock settings screen, so only the blocks you actually use are registered and only their assets load.

= Templates and theme areas =

ShapeBlock includes a template post type and a builder for site areas such as the header and footer. Saved templates can also be placed with the `[shapeblock_template]` shortcode, and builder areas with `[shapeblock_builder]`.

= Built for the block editor =

The blocks are native block-editor blocks with live previews in the canvas, no page-builder layer and no shortcode required for normal use. Styles are printed per block instance and scoped to that block, so two copies of the same block on one page never affect each other.

== External services ==

ShapeBlock works without any external service. The two connections below are the
only ones it can make, and each one is described with exactly what is sent and
when.

= Google Fonts (optional, off by default) =

ShapeBlock can use Google Fonts for the Font Family pickers in the block
settings and for loading the chosen font on the front end.

This connection is **off by default**. While it is off the plugin never contacts
Google at all: the font list is not downloaded, the font pickers offer only the
locally available font stacks, and no stylesheet is requested from Google on the
front end. To turn it on, go to **ShapeBlock > Settings > Google Fonts** and tick
"Allow ShapeBlock to connect to Google Fonts".

Once it is switched on:

* In the WordPress admin, the plugin requests the font catalogue from
  `https://fonts.google.com/metadata/fonts` the first time a font list is needed,
  and caches the result for one week. Only the request itself is sent; no site
  data, post data or user data is included.
* In the block editor, the browser requests a font stylesheet from
  `https://fonts.googleapis.com/css2?family=...` so the picker and the canvas can
  preview a font.
* On the front end, a visitor's browser requests the chosen font stylesheet from
  `https://fonts.googleapis.com` and the font files from `https://fonts.gstatic.com`.
  As with any browser request, the visitor's IP address, user agent and the
  referring page reach Google.

Service provided by Google LLC. Terms of service: https://policies.google.com/terms
Privacy policy: https://policies.google.com/privacy

= Video embeds (only for a video URL you enter yourself) =

If you enter a video URL in the Post Grid block, WordPress' own oEmbed handling
contacts that provider to build the embed, and the player is then loaded from the
provider when the page is viewed. Only the URL you entered is sent from the
server; when a visitor views the page their browser contacts the provider
directly, so their IP address, user agent and the referring page reach it. No
request is made unless you enter a URL.

YouTube (Google LLC) - terms of service: https://www.youtube.com/t/terms
Privacy policy: https://policies.google.com/privacy

Vimeo, Inc. - terms of service: https://vimeo.com/terms
Privacy policy: https://vimeo.com/privacy

= Social Share links =

The Social Share block does not contact anything. It builds an ordinary link to
each network's own sharing page, and nothing at all is sent until a visitor
clicks one. When a visitor does click, their browser opens that network's page
and the network receives the current page's URL and title (plus, where noted, the
excerpt or featured image URL) as part of the address, together with the normal
information any browser sends, such as their IP address and user agent.

The links each enabled network produces:

* Facebook - `https://www.facebook.com/sharer/sharer.php?u=` + page URL.
  Terms: https://www.facebook.com/terms.php - Privacy: https://www.facebook.com/privacy/policy/
* X (Twitter) - `https://twitter.com/intent/tweet?url=` + page URL + `&text=` + page title.
  Terms: https://x.com/en/tos - Privacy: https://x.com/en/privacy
* LinkedIn - `https://www.linkedin.com/sharing/share-offsite/?url=` + page URL.
  Terms: https://www.linkedin.com/legal/user-agreement - Privacy: https://www.linkedin.com/legal/privacy-policy
* Pinterest - `https://pinterest.com/pin/create/button/?url=` + page URL + `&description=` + page title + optional `&media=` + featured image URL.
  Terms: https://policy.pinterest.com/en/terms-of-service - Privacy: https://policy.pinterest.com/en/privacy-policy
* WhatsApp - `https://api.whatsapp.com/send?text=` + page title + page URL.
  Terms: https://www.whatsapp.com/legal/terms-of-service - Privacy: https://www.whatsapp.com/legal/privacy-policy
* Telegram - `https://t.me/share/url?url=` + page URL + `&text=` + page title.
  Terms: https://telegram.org/tos - Privacy: https://telegram.org/privacy
* Reddit - `https://www.reddit.com/submit?url=` + page URL + `&title=` + page title.
  Terms: https://www.redditinc.com/policies/user-agreement - Privacy: https://www.reddit.com/policies/privacy-policy

The Instagram, YouTube, TikTok, Snapchat, Discord and Spotify buttons are plain
links to those sites' home pages and carry no page data:
`https://www.instagram.com/`, `https://www.youtube.com/`, `https://www.tiktok.com/`,
`https://www.snapchat.com/`, `https://discord.com/`, `https://open.spotify.com/`.

* Instagram - Terms: https://help.instagram.com/581066165581870 - Privacy: https://privacycenter.instagram.com/policy
* YouTube - Terms: https://www.youtube.com/t/terms - Privacy: https://policies.google.com/privacy
* TikTok - Terms: https://www.tiktok.com/legal/page/row/terms-of-service/en - Privacy: https://www.tiktok.com/legal/page/row/privacy-policy/en
* Snapchat - Terms: https://snap.com/en-US/terms - Privacy: https://snap.com/en-US/privacy/privacy-policy
* Discord - Terms: https://discord.com/terms - Privacy: https://discord.com/privacy
* Spotify - Terms: https://www.spotify.com/legal/end-user-agreement/ - Privacy: https://www.spotify.com/legal/privacy-policy/

The Email button is a `mailto:` link and opens the visitor's own mail program;
no service is contacted. The Copy Link button copies the page URL locally.

The Social Icon block only outputs the links you type into it yourself, so it
contacts nothing on its own.

== Source code and build process ==

Every compiled or minified file in this plugin is generated from readable source
that ships inside the plugin, next to the file it produces. Nothing is obfuscated
and no build output is included without its source.

Where the source is:

* Block editor and front-end scripts: `includes/public/blocks/<block>/src/`
  (`index.js`, `edit.js`, `save.js`, `view.js`, `style.scss`, `editor.scss`,
  `render.php`). Each one compiles to the `build/` folder beside it.
* The settings and template screens: `src/` at the plugin root, which compiles
  to `build/` at the plugin root.
* The admin stylesheet: `assets/css/style.scss`, which compiles to
  `assets/css/style.css`.
* The shared front-end stylesheet: `includes/public/assets/css/public.scss`
  (with the `_animate.scss` and `_shapeblock-icon.scss` partials beside it),
  which compiles to `includes/public/assets/css/public.css`.
* The icon font in `includes/admin/assets/icons/font/` is generated from
  `includes/public/assets/icon/config.json`, which is the Fontello project file
  for it - open it at https://fontello.com to rebuild or change the glyph set.
* The prefixed Bootstrap grid: `assets/lib/bootstrap/bootstrap-grid.scss`, which
  compiles to `bootstrap-grid.css` and `bootstrap-grid.min.css` in the same
  folder.
* The Menu block's `includes/public/blocks/menu/build/index.js` and `view.js` are
  written by hand against the `wp.*` globals and are not generated by any build
  step, which is why that block has no `src/` folder. The files in it are the
  source.

Build tools:

* [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) 32.4
  (webpack + Babel) builds the blocks and the admin screens.
* [Dart Sass](https://sass-lang.com/dart-sass/) 1.105 compiles the two
  stylesheets above.
* [Bootstrap](https://getbootstrap.com/) 5.3 supplies the grid SCSS that
  `bootstrap-grid.scss` imports and re-prefixes.

All three are declared in `package.json`. To rebuild everything from source:

1. `npm install`
2. `npm run build` - the plugin-root bundle (`build/`).
3. `npm run build:<block>` - one block, for example `npm run build:heading` or
   `npm run build:teamGrid`. The full list of block script names is in
   `package.json`.
4. `npm run build:css` - `assets/css/style.css`.
5. `npm run build:public` - `includes/public/assets/css/public.css`.
6. `npm run build:grid` - the prefixed Bootstrap grid CSS.

Each block's own `style.scss` and `editor.scss` are compiled by that block's
`npm run build:<block>` into its `build/` folder; they are not built separately.

`npm run start` and `npm run start:<block>` are the same builds in watch mode.

== Credits ==

ShapeBlock's own code is GPLv2-or-later, as stated above. It bundles two
third-party front-end libraries, each under its own MIT license, with the
upstream license text shipped alongside the library files:

* Swiper 12.0.3 (https://swiperjs.com, https://github.com/nolimits4web/swiper),
  Copyright (c) 2014-2025 Vladimir Kharlampidi - `assets/lib/swiper/LICENSE`.
  `assets/lib/swiper/swiper-bundle.min.js` and `swiper-bundle.min.css` are the
  unmodified `dist` files from the upstream 12.0.3 release, and each carries the
  library name, version and homepage in its own header comment. They are used as
  published; this plugin does not build them.
* Bootstrap 5.3 grid component (https://getbootstrap.com,
  https://github.com/twbs/bootstrap), Copyright (c) 2011-2025 The Bootstrap
  Authors - `assets/lib/bootstrap/LICENSE`. Only the grid and flex utilities are
  used, recompiled with a `shapeblock-` class/variable prefix and a 345px `sm`
  breakpoint by `assets/lib/bootstrap/bootstrap-grid.scss` - see "Source code and
  build process" above.

Both licenses are compatible with the GPLv2-or-later this plugin is
distributed under.

The bundled icon font (`includes/public/assets/icon/`) is built with Fontello
from 81 glyphs original to this plugin, plus 3 glyphs from other icon sets,
each under the SIL Open Font License 1.1 (GPL-compatible):

* `map-o` and `h-sigh` — Font Awesome 4.7 (https://fontawesome.com/v4/license/).
* `move` — Elusive Icons (https://github.com/aristath/elusive-iconfont).

== Installation ==

1. Upload the `shapeblock` folder to the `/wp-content/plugins/` directory, or install the plugin through the Plugins screen in WordPress.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Edit any post or page and add a ShapeBlock block from the block inserter.
4. Adjust the block in the Settings, Layout and Style tabs, then publish.

== Frequently Asked Questions ==

= Is ShapeBlock compatible with my theme? =

Yes. ShapeBlock is designed to work with any properly coded WordPress theme, block themes included. The blocks inherit your theme's typography and can be restyled from the block settings.

= Do I have to use all 31 blocks? =

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
