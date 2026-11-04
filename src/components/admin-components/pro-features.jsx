import { __ } from '@wordpress/i18n';
import { Button } from 'antd';
import { RocketOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const DEMO = 'https://shapekode.com/product/shapeblock/';

// What ShapeBlock Pro adds: names, a line of text and a demo link, nothing to switch on.
// Built in a function so it is translated after locale data loads.
const getGroups = () => [
    {
        title: __( 'In Free and Pro', 'shapeblock' ),
        free: true,
        items: [
            { name: __( '36 Free Blocks', 'shapeblock' ), text: __( 'Layouts, content, media, navigation and marketing.', 'shapeblock' ) },
            { name: __( 'Header & Footer Builder', 'shapeblock' ), text: __( 'With Include and Exclude display conditions.', 'shapeblock' ) },
            { name: __( 'Custom Templates', 'shapeblock' ), text: __( 'Build a layout once and reuse it with a shortcode.', 'shapeblock' ) },
            { name: __( 'Per-Device Controls', 'shapeblock' ), text: __( 'Separate desktop, tablet and mobile values.', 'shapeblock' ) },
            { name: __( 'Full Design Control', 'shapeblock' ), text: __( 'Typography, gradients, borders, shadows and spacing.', 'shapeblock' ) },
            { name: __( 'Export & Import', 'shapeblock' ), text: __( 'Move your ShapeBlock setup between sites.', 'shapeblock' ) },
        ],
    },
    {
        title: __( 'Builders & Extensions', 'shapeblock' ),
        items: [
            { name: __( 'Theme Builder', 'shapeblock' ), text: __( 'Single Post, Page, Archive, Search and 404 templates.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Popup Builder', 'shapeblock' ), text: __( 'Popups built with blocks, on load, scroll, exit or click.', 'shapeblock' ), page: 'popup-builder' },
            { name: __( 'Motion Effects', 'shapeblock' ), text: __( 'Entrance, scroll and mouse animations for any block.', 'shapeblock' ), page: 'motion-effects' },
            { name: __( 'Display Conditions', 'shapeblock' ), text: __( 'Show or hide blocks by user, date, page or device.', 'shapeblock' ), page: 'display-conditions' },
            { name: __( 'Parallax Background', 'shapeblock' ), text: __( 'A row background that moves slower than the page.', 'shapeblock' ), page: 'parallax-background' },
            { name: __( 'Copy Style', 'shapeblock' ), text: __( 'Copy one block\'s look and paste it on others.', 'shapeblock' ), page: 'copy-style' },
            { name: __( 'Preloader', 'shapeblock' ), text: __( 'A loading screen, with your own logo.', 'shapeblock' ), page: 'preloader' },
            { name: __( 'Scroll to Top', 'shapeblock' ), text: __( 'A back-to-top button on every page.', 'shapeblock' ), page: 'scroll-to-top-button' },
            { name: __( 'Smooth Scrolling', 'shapeblock' ), text: __( 'Gliding scroll and a styled scrollbar.', 'shapeblock' ), page: 'smooth-scrolling' },
            { name: __( 'Custom Cursor', 'shapeblock' ), text: __( 'A dot and ring that follow the mouse.', 'shapeblock' ), page: 'custom-cursor' },
            { name: __( 'Post Grid Filter', 'shapeblock' ), text: __( 'Category tabs, Load More and infinite scroll for the free Post Grid.', 'shapeblock' ), page: 'post-grid-filter' },
        ],
    },
    {
        title: __( 'Pro Blocks', 'shapeblock' ),
        items: [
            { name: __( 'Advanced Accordion', 'shapeblock' ), text: __( 'Sections that hold any blocks.', 'shapeblock' ), page: 'advanced-accordion' },
            { name: __( 'Advanced Button', 'shapeblock' ), text: __( 'Buttons with eight hover animations.', 'shapeblock' ), page: 'advanced-button' },
            { name: __( 'Advanced Data Table', 'shapeblock' ), text: __( 'Sort, search and page through a table.', 'shapeblock' ), page: 'advanced-data-table' },
            { name: __( 'Clients Logo Slider', 'shapeblock' ), text: __( 'Logos in a carousel or endless marquee.', 'shapeblock' ), page: 'clients-logo-slider' },
            { name: __( 'Comparison Table', 'shapeblock' ), text: __( 'Plans side by side with ticks and prices.', 'shapeblock' ), page: 'comparison-table' },
            { name: __( 'Flip Box', 'shapeblock' ), text: __( 'A box that turns over on hover.', 'shapeblock' ), page: 'flip-box' },
            { name: __( 'Hero Slider', 'shapeblock' ), text: __( 'Full-width slides with heading and buttons.', 'shapeblock' ), page: 'hero-slider' },
            { name: __( 'Image Hotspot', 'shapeblock' ), text: __( 'Markers on an image that open popups.', 'shapeblock' ), page: 'image-hotspot' },
            { name: __( 'Masonry Gallery', 'shapeblock' ), text: __( 'Photos packed into tight columns.', 'shapeblock' ), page: 'masonry-gallery' },
            { name: __( 'Mega Menu', 'shapeblock' ), text: __( 'Wide dropdown panels built from blocks.', 'shapeblock' ), page: 'mega-menu' },
            { name: __( 'Post Carousel', 'shapeblock' ), text: __( 'Posts as cards in a slider.', 'shapeblock' ), page: 'post-carousel' },
            { name: __( 'Price Menu', 'shapeblock' ), text: __( 'Names, prices and short descriptions.', 'shapeblock' ), page: 'price-menu' },
            { name: __( 'Rating', 'shapeblock' ), text: __( 'Stars, a score and a short note.', 'shapeblock' ), page: 'rating' },
            { name: __( 'Team Member Carousel', 'shapeblock' ), text: __( 'Your team in a sliding row.', 'shapeblock' ), page: 'team-carousel' },
            { name: __( 'Timeline', 'shapeblock' ), text: __( 'A story step by step along a line.', 'shapeblock' ), page: 'timeline' },
            { name: __( 'Video Player', 'shapeblock' ), text: __( 'YouTube, Vimeo or your own video, inline or popup.', 'shapeblock' ), page: 'video-player' },
        ],
    },
    {
        title: __( 'Animation Blocks', 'shapeblock' ),
        items: [
            { name: __( 'Animation Title', 'shapeblock' ), text: __( 'Rotating words, drawn highlights and entrance effects.', 'shapeblock' ), page: 'animation-title' },
            { name: __( 'Animation Text', 'shapeblock' ), text: __( 'Text that comes in letter by letter.', 'shapeblock' ), page: 'animation-text' },
            { name: __( 'Typewriter Effect', 'shapeblock' ), text: __( 'Words that type themselves.', 'shapeblock' ), page: 'typewriter-effect' },
            { name: __( 'Rotating Text', 'shapeblock' ), text: __( 'Text turning in a circle.', 'shapeblock' ), page: 'rotating-text' },
            { name: __( 'Scroll Text', 'shapeblock' ), text: __( 'Big text that slides as you scroll.', 'shapeblock' ), page: 'scroll-text' },
            { name: __( 'Image Reveal Effect', 'shapeblock' ), text: __( 'An image uncovered by a curtain.', 'shapeblock' ), page: 'image-reveal-effect' },
            { name: __( 'Image Scroll Trigger', 'shapeblock' ), text: __( 'An image that zooms or moves on scroll.', 'shapeblock' ), page: 'image-scroll-trigger' },
            { name: __( 'Horizontal Scroll', 'shapeblock' ), text: __( 'A row that moves sideways on scroll.', 'shapeblock' ), page: 'horizontal-scroll' },
        ],
    },
    {
        title: __( 'Theme Builder Blocks', 'shapeblock' ),
        items: [
            { name: __( 'Post Title', 'shapeblock' ), text: __( 'The title of every post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Featured Image', 'shapeblock' ), text: __( 'The featured image of every post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Content', 'shapeblock' ), text: __( 'The text and blocks of every post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Excerpt', 'shapeblock' ), text: __( 'A short summary of every post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Meta', 'shapeblock' ), text: __( 'Author, date, categories and comments.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Categories / Tags', 'shapeblock' ), text: __( 'The terms of every post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Author Box', 'shapeblock' ), text: __( 'The author with photo and bio.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Pagination', 'shapeblock' ), text: __( 'Links to the previous and next post.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Post Comments', 'shapeblock' ), text: __( 'Comments and the comment form.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Related Posts', 'shapeblock' ), text: __( 'More posts from the same category.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Archive Title', 'shapeblock' ), text: __( 'The title of blog and category pages.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Archive Description', 'shapeblock' ), text: __( 'The description of a category or tag.', 'shapeblock' ), page: 'theme-builder' },
            { name: __( 'Archive Posts', 'shapeblock' ), text: __( 'The posts of a blog, category or search page.', 'shapeblock' ), page: 'theme-builder' },
        ],
    },
    {
        title: __( 'WooCommerce Blocks', 'shapeblock' ),
        note: __( 'These need WooCommerce.', 'shapeblock' ),
        items: [
            { name: __( 'Product Grid', 'shapeblock' ), text: __( 'Your products in a grid.', 'shapeblock' ), page: 'product-grid' },
            { name: __( 'Product Carousel', 'shapeblock' ), text: __( 'Your products in a slider.', 'shapeblock' ), page: 'product-carousel' },
            { name: __( 'WooCommerce Builder', 'shapeblock' ), text: __( 'Product, shop, cart and checkout pages from 15 blocks.', 'shapeblock' ), page: 'woocommerce-builder' },
        ],
    },
];

const UpgradeButton = () => (
    <Button type="primary" icon={<RocketOutlined />} href={shapeblock.upgradeUrl} target="_blank" rel="noopener noreferrer">
        { __( 'Upgrade', 'shapeblock' ) }
    </Button>
);

const Mark = ({ included }) => (included
    ? <span className="shapeblock-pro-table__yes" role="img" aria-label={ __( 'Included', 'shapeblock' ) }><CheckOutlined aria-hidden="true" /></span>
    : <span className="shapeblock-pro-table__no" role="img" aria-label={ __( 'Not included', 'shapeblock' ) }><CloseOutlined aria-hidden="true" /></span>);

export default function ProFeatures() {
    return (
        <div className="shapeblock-options-content shapeblock-pro-features">
            <div className="shapeblock-pro-features__side">
                <h1 className="shapeblock-options-title">{ __( 'Pro Features', 'shapeblock' ) }</h1>
                <p className="shapeblock-pro-features__intro">{ __( 'ShapeBlock Pro is a separate add-on that works on top of this plugin. Everything you have here stays free. Open any name to see it on our demo site.', 'shapeblock' ) }</p>
            </div>
            <table className="shapeblock-pro-table">
                <thead>
                    <tr>
                        <th scope="col"><span className="screen-reader-text">{ __( 'Feature', 'shapeblock' ) }</span></th>
                        <th scope="col">{ __( 'Free', 'shapeblock' ) }</th>
                        <th scope="col" className="is-pro">
                            <span className="shapeblock-pro-table__name">{ __( 'Pro', 'shapeblock' ) }</span>
                            <UpgradeButton />
                        </th>
                    </tr>
                </thead>
                {getGroups().map((group) => (
                    <tbody key={group.title}>
                        <tr className="shapeblock-pro-table__group">
                            <th scope="colgroup">
                                {group.title}
                                {group.note && <small>{group.note}</small>}
                            </th>
                            <td></td>
                            <td className="is-pro"></td>
                        </tr>
                        {group.items.map((item) => (
                            <tr key={item.name}>
                                <th scope="row">
                                    {item.page
                                        ? <a href={`${DEMO}${item.page}/`} target="_blank" rel="noopener noreferrer">{item.name}</a>
                                        : <strong>{item.name}</strong>}
                                    <p>{item.text}</p>
                                </th>
                                <td><Mark included={!!group.free} /></td>
                                <td className="is-pro"><Mark included /></td>
                            </tr>
                        ))}
                    </tbody>
                ))}
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                        <td className="is-pro"><UpgradeButton /></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
