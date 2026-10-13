/**
 * Builds the ShapeBlock icon library from Bootstrap Icons (MIT).
 *
 *   npm run build:icons
 *
 * Reads the SVGs of the icons listed below from the bootstrap-icons package,
 * and ShapeBlock's own block icons (the ones on the dashboard's block list)
 * from icon/blocks/, and writes:
 *   includes/public/assets/font/shapeblock-bi.woff2 and .woff  - the icon font
 *   includes/public/assets/css/shapeblock-icons.css           - one class per icon
 *   includes/public/assets/icon/library.json                  - the picker's list
 *
 * Code points are given in list order from U+F101, across all categories. To
 * keep icons that are already in use pointing at the same glyph, add new icons
 * only at the end of the last category (or in a new category after it), and
 * never remove or reorder one.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import svgtofont from 'svgtofont';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const ASSETS = path.join(ROOT, 'includes/public/assets');
const SRC = path.join(ROOT, 'node_modules/bootstrap-icons/icons');
// ShapeBlock's own block icons, drawn for the plugin (same licence as the plugin).
const BLOCKS = path.join(ASSETS, 'icon/blocks');
// Their order fixes their code points: add new ones at the end only.
const BLOCK_ICONS = `button canvas clients-logo-grid columns countdown counter faq-1 filterable-gallery heading iconbox
	image-carousel image-horizontal-scroll marquee-logo navigation post-grid pricing-table process-slider progress-bar row
	scroll-top search service-list slider social-icons social-share tab team-grid testimonials-grid`;
const BLOCK_KEYWORDS = {
	button: 'button cta link', canvas: 'offcanvas panel drawer presentation', 'clients-logo-grid': 'grid table clients logos', columns: 'columns layout split',
	countdown: 'clock timer time', counter: 'stopwatch timer number count', 'faq-1': 'accordion faq info question', 'filterable-gallery': 'isotope gallery image filter',
	heading: 'heading title text font', iconbox: 'icon box grid apps', 'image-carousel': 'carousel image picture', 'image-horizontal-scroll': 'scroll slider phone',
	'marquee-logo': 'gallery image picture heart', navigation: 'menu navigation list', 'post-grid': 'posts grid rows', 'pricing-table': 'pricing chart bars',
	'process-slider': 'slider slides', 'progress-bar': 'progress bar', row: 'row square box section', 'scroll-top': 'scroll top up arrow',
	search: 'search magnifier find', 'service-list': 'list check checklist icon list', slider: 'slider columns', 'social-icons': 'social icons circles',
	'social-share': 'share external link', tab: 'tabs card', 'team-grid': 'team grid layout', 'testimonials-grid': 'testimonials grid layout',
};
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/bootstrap-icons/package.json'), 'utf8')).version;

const C = {
	'Arrows': `arrow-up arrow-down arrow-left arrow-right arrow-up-right arrow-up-left arrow-down-right arrow-down-left arrow-up-short arrow-down-short arrow-left-short arrow-right-short
		arrow-up-circle arrow-down-circle arrow-left-circle arrow-right-circle arrow-up-circle-fill arrow-down-circle-fill arrow-left-circle-fill arrow-right-circle-fill
		arrow-up-square arrow-down-square arrow-left-square arrow-right-square arrow-up-right-circle arrow-up-right-square
		arrow-90deg-up arrow-90deg-down arrow-90deg-left arrow-90deg-right arrow-bar-up arrow-bar-down arrow-bar-left arrow-bar-right
		arrow-clockwise arrow-counterclockwise arrow-repeat arrow-return-left arrow-return-right arrow-left-right arrow-down-up arrows-move arrows-expand arrows-collapse arrows-fullscreen arrows-angle-expand arrows-angle-contract
		chevron-up chevron-down chevron-left chevron-right chevron-double-up chevron-double-down chevron-double-left chevron-double-right chevron-compact-up chevron-compact-down chevron-compact-left chevron-compact-right chevron-expand chevron-contract
		caret-up caret-down caret-left caret-right caret-up-fill caret-down-fill caret-left-fill caret-right-fill
		box-arrow-up-right box-arrow-in-right box-arrow-right box-arrow-left box-arrow-in-down box-arrow-up shuffle repeat reply reply-all forward`,
	'Interface': `check check-lg check2 check2-all check-circle check-circle-fill check-square check-square-fill check2-circle
		x x-lg x-circle x-circle-fill x-square x-square-fill plus plus-lg plus-circle plus-circle-fill plus-square plus-square-fill dash dash-lg dash-circle dash-circle-fill
		info info-circle info-circle-fill exclamation exclamation-circle exclamation-circle-fill exclamation-triangle exclamation-triangle-fill question question-circle question-circle-fill
		list list-ul list-ol list-check list-task grid grid-fill grid-3x3-gap grid-3x3-gap-fill three-dots three-dots-vertical grip-horizontal grip-vertical
		search zoom-in zoom-out filter funnel funnel-fill sliders sliders2 gear gear-fill gear-wide-connected toggle-on toggle-off toggles
		house house-fill house-door house-door-fill house-heart door-open door-closed
		lock lock-fill unlock unlock-fill key key-fill shield shield-check shield-fill-check shield-lock shield-lock-fill fingerprint
		eye eye-fill eye-slash bell bell-fill bell-slash bookmark bookmark-fill bookmark-star bookmark-heart bookmarks
		star star-fill star-half stars heart heart-fill heart-half heartbreak hand-thumbs-up hand-thumbs-up-fill hand-thumbs-down hand-index hand-index-thumb
		trash trash-fill trash3 pencil pencil-fill pencil-square pen copy clipboard clipboard-check link link-45deg paperclip pin pin-fill pin-angle
		share share-fill upload download box-arrow-up cloud-upload cloud-download save floppy printer
		power fullscreen fullscreen-exit window window-stack layout-sidebar layout-three-columns columns layers layers-fill
		circle circle-fill square square-fill triangle triangle-fill diamond diamond-fill hexagon hexagon-fill octagon dot slash-circle ban
		hourglass hourglass-split clock clock-fill clock-history alarm alarm-fill stopwatch calendar calendar-fill calendar-check calendar-event calendar-date calendar3 calendar-week
		tag tag-fill tags tags-fill flag flag-fill bullseye compass compass-fill magic lightning lightning-fill lightning-charge lightning-charge-fill infinity asterisk hash at percent`,
	'Social & brands': `facebook instagram twitter-x twitter threads bluesky linkedin youtube tiktok pinterest snapchat whatsapp telegram messenger discord reddit tumblr
		github gitlab dribbble behance medium substack wordpress google google-play apple android android2 microsoft windows amazon paypal stripe spotify twitch vimeo skype slack
		mastodon wechat line quora yelp stack-overflow dropbox trello steam xbox playstation nintendo-switch rss rss-fill`,
	'Communication': `envelope envelope-fill envelope-open envelope-open-fill envelope-at envelope-paper envelope-heart envelope-check
		telephone telephone-fill telephone-forward telephone-inbound telephone-outbound phone phone-fill phone-vibrate
		chat chat-fill chat-dots chat-dots-fill chat-left chat-left-text chat-left-text-fill chat-right-text chat-square-text chat-quote chat-quote-fill chat-heart
		send send-fill inbox inbox-fill mailbox megaphone megaphone-fill broadcast broadcast-pin reception-4 wifi signal at translate quote headset voicemail mic mic-fill mic-mute`,
	'Business & shop': `cart cart-fill cart2 cart3 cart-plus cart-check bag bag-fill bag-check bag-plus bag-heart basket basket-fill handbag shop shop-window
		credit-card credit-card-fill credit-card-2-front wallet wallet-fill wallet2 cash cash-coin cash-stack coin piggy-bank piggy-bank-fill bank bank2 safe receipt receipt-cutoff
		currency-dollar currency-euro currency-pound currency-rupee currency-yen currency-bitcoin currency-exchange
		gift gift-fill trophy trophy-fill award award-fill gem patch-check patch-check-fill ticket ticket-perforated
		briefcase briefcase-fill building building-fill buildings buildings-fill shop
		graph-up graph-up-arrow graph-down bar-chart bar-chart-fill bar-chart-line pie-chart pie-chart-fill activity speedometer speedometer2 kanban diagram-3 clipboard-data
		box box-seam box-seam-fill boxes truck truck-front upc-scan qr-code qr-code-scan calculator percent`,
	'Media': `play play-fill play-circle play-circle-fill play-btn play-btn-fill pause pause-fill pause-circle pause-circle-fill stop stop-fill stop-circle record-circle record-fill
		skip-forward skip-forward-fill skip-backward skip-backward-fill skip-end skip-start fast-forward rewind
		volume-up volume-up-fill volume-down volume-mute volume-off music-note music-note-beamed music-note-list music-player headphones speaker boombox vinyl soundwave
		camera camera-fill camera2 camera-video camera-video-fill camera-reels film image image-fill images card-image collection-play youtube
		tv display easel easel-fill mic broadcast cast badge-hd badge-4k projector`,
	'Files & text': `file file-fill file-earmark file-earmark-fill file-text file-earmark-text file-earmark-pdf file-earmark-word file-earmark-excel file-earmark-ppt file-earmark-zip file-earmark-image file-earmark-music file-earmark-play file-earmark-code file-earmark-arrow-down file-earmark-plus
		files folder folder-fill folder2-open folder-plus folder-check archive archive-fill journal journal-text journal-bookmark book book-fill book-half bookshelf newspaper card-text card-list card-checklist sticky
		type type-bold type-italic type-underline type-strikethrough type-h1 type-h2 type-h3 text-left text-center text-right justify paragraph fonts blockquote-left list-nested indent spellcheck highlighter markdown code code-slash code-square terminal braces`,
	'Devices & tech': `laptop laptop-fill pc-display display phone tablet smartwatch watch keyboard mouse printer router modem hdd server database database-fill cpu memory usb-drive sd-card
		battery battery-full battery-half battery-charging plug plug-fill power lightbulb lightbulb-fill wifi bluetooth broadcast cloud cloud-fill cloud-check cloud-arrow-up
		app app-indicator window-desktop browser-chrome browser-firefox browser-safari globe globe2 robot bug bug-fill gpu-card motherboard joystick controller headset-vr`,
	'People & health': `person person-fill person-circle person-check person-plus person-badge person-vcard person-workspace person-video3 person-heart person-standing person-standing-dress person-walking person-wheelchair person-arms-up person-raised-hand
		people people-fill gender-male gender-female emoji-smile emoji-smile-fill emoji-laughing emoji-heart-eyes emoji-wink emoji-sunglasses emoji-frown emoji-neutral
		heart-pulse heart-pulse-fill hospital hospital-fill capsule capsule-pill prescription2 bandaid clipboard-pulse thermometer lungs virus universal-access mortarboard mortarboard-fill backpack`,
	'Travel & places': `geo-alt geo-alt-fill geo geo-fill pin-map pin-map-fill map map-fill compass signpost signpost-split globe-americas globe-europe-africa globe-asia-australia
		airplane airplane-fill airplane-engines car-front car-front-fill bus-front taxi-front train-front truck bicycle scooter fuel-pump ev-station luggage suitcase suitcase-lg passport ticket-detailed
		house-door building hospital shop bank cup-hot cup-hot-fill cup-straw egg-fried fork-knife cake cake2 balloon balloon-heart`,
	'Nature & weather': `sun sun-fill moon moon-fill moon-stars cloud-sun cloud-moon cloud-rain cloud-rain-heavy cloud-lightning cloud-lightning-rain cloud-snow clouds snow snow2 wind tornado hurricane rainbow thermometer-sun thermometer-snow umbrella umbrella-fill
		droplet droplet-fill droplet-half water fire tree tree-fill flower1 flower2 flower3 leaf feather recycle globe-central-south-asia sunrise sunset stars`,
	'Tools & misc': `tools wrench wrench-adjustable hammer screwdriver scissors brush brush-fill palette palette-fill paint-bucket eyedropper vector-pen bezier rulers crop
		rocket rocket-fill rocket-takeoff puzzle puzzle-fill lightning dice-5 suit-heart suit-spade suit-club suit-diamond yin-yang peace flask beaker magnet binoculars eyeglasses sunglasses
		cone-striped stoplights sign-stop life-preserver radioactive incognito mask hypnotize nut gear-wide plugin`,
	// Added after the first release - new icons go here, at the very end.
	'More': `x-octagon x-octagon-fill x-diamond x-diamond-fill slash-lg slash-square plus-slash-minus check2-square check-all
		dash-square dash-square-fill question-square question-square-fill info-square info-square-fill exclamation-square exclamation-square-fill exclamation-octagon exclamation-octagon-fill`,
};

// Extra search words, so an icon can be found by what people call it rather
// than only by its Bootstrap name ("cross" finds the x icons).
const KEYWORDS = {
	x: 'cross close cancel times remove delete multiply',
	'x-lg': 'cross close cancel times remove delete multiply',
	'x-circle': 'cross close cancel remove delete error',
	'x-circle-fill': 'cross close cancel remove delete error',
	'x-square': 'cross close cancel remove delete',
	'x-square-fill': 'cross close cancel remove delete',
	'x-octagon': 'cross close cancel stop error',
	'x-octagon-fill': 'cross close cancel stop error',
	'x-diamond': 'cross close cancel',
	'x-diamond-fill': 'cross close cancel',
	plus: 'add new cross',
	'plus-lg': 'add new cross',
	'plus-circle': 'add new',
	'plus-circle-fill': 'add new',
	dash: 'minus remove subtract',
	'dash-lg': 'minus remove subtract',
	'dash-circle': 'minus remove subtract',
	check: 'tick done ok yes correct',
	'check-lg': 'tick done ok yes correct',
	check2: 'tick done ok yes correct',
	'check-circle': 'tick done ok yes success',
	'check-circle-fill': 'tick done ok yes success',
	'check-square': 'tick checkbox',
	'check-square-fill': 'tick checkbox',
	list: 'menu hamburger bars navigation',
	'three-dots': 'more ellipsis menu',
	'three-dots-vertical': 'more ellipsis menu kebab',
	house: 'home',
	'house-fill': 'home',
	'house-door': 'home',
	'house-door-fill': 'home',
	envelope: 'email mail message',
	'envelope-fill': 'email mail message',
	telephone: 'phone call contact',
	'telephone-fill': 'phone call contact',
	'geo-alt': 'location map marker pin address',
	'geo-alt-fill': 'location map marker pin address',
	search: 'magnifier find look',
	trash: 'delete remove bin',
	'trash-fill': 'delete remove bin',
	trash3: 'delete remove bin',
	pencil: 'edit write',
	'pencil-fill': 'edit write',
	gear: 'settings cog options',
	'gear-fill': 'settings cog options',
	person: 'user account profile',
	'person-fill': 'user account profile',
	'person-circle': 'user account profile avatar',
	people: 'users team group',
	'people-fill': 'users team group',
	heart: 'love like favorite',
	'heart-fill': 'love like favorite',
	star: 'rating favorite',
	'star-fill': 'rating favorite',
	cart: 'shop basket buy',
	'cart-fill': 'shop basket buy',
	'box-arrow-up-right': 'external link open new',
	'arrow-clockwise': 'refresh reload redo',
	'arrow-counterclockwise': 'undo back reset',
	'arrow-repeat': 'refresh sync loop',
	download: 'save get',
	upload: 'send put',
	'exclamation-triangle': 'warning alert caution',
	'exclamation-triangle-fill': 'warning alert caution',
	'info-circle': 'information help about',
	'question-circle': 'help faq support',
	clock: 'time hours',
	calendar: 'date event schedule',
	'calendar-event': 'date event schedule',
	'chat-dots': 'message comment talk',
	'chat-dots-fill': 'message comment talk',
	'twitter-x': 'x twitter',
	whatsapp: 'chat message',
	'credit-card': 'payment card visa',
	'currency-dollar': 'money price usd',
	'lock-fill': 'secure password private',
	lock: 'secure password private',
	eye: 'view show visible',
	'eye-slash': 'hide hidden invisible',
	'chevron-right': 'next forward angle',
	'chevron-left': 'previous back angle',
	'chevron-down': 'expand dropdown angle',
	'chevron-up': 'collapse angle',
	'caret-down-fill': 'dropdown triangle',
	'caret-right-fill': 'play triangle',
	'arrow-right': 'next forward',
	'arrow-left': 'previous back',
	'play-fill': 'start video',
	'play-circle-fill': 'start video',
	'geo-fill': 'location pin',
	'pin-map-fill': 'location marker',
	award: 'badge prize medal',
	trophy: 'winner prize cup',
	'lightning-fill': 'fast power bolt flash',
	'shield-check': 'secure safe protected',
	globe: 'world web internet language',
	'cloud-arrow-up': 'upload',
	share: 'send social',
	'share-fill': 'send social',
};

const have = new Set(fs.readdirSync(SRC).map((f) => f.replace(/\.svg$/, '')));
const icons = [];
const seen = new Set();
for (const [cat, list] of Object.entries(C)) {
	for (const name of list.split(/\s+/).filter(Boolean)) {
		if (!have.has(name) || seen.has(name)) continue;
		seen.add(name);
		icons.push({ name, cat, code: 0xf101 + icons.length });
	}
}
// The block icons, after everything else (prefixed so no name meets a Bootstrap one).
for (const file of BLOCK_ICONS.split(/\s+/).filter(Boolean)) {
	if (!fs.existsSync(path.join(BLOCKS, file + '.svg'))) continue;
	const name = 'block-' + file;
	KEYWORDS[name] = BLOCK_KEYWORDS[file] || '';
	icons.push({ name, cat: 'Block icons', code: 0xf101 + icons.length, src: path.join(BLOCKS, file + '.svg') });
}

// Font.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shapeblock-icons-'));
fs.mkdirSync(path.join(tmp, 'svg'));
for (const i of icons) fs.copyFileSync(i.src || path.join(SRC, i.name + '.svg'), path.join(tmp, 'svg', i.name + '.svg'));
const code = Object.fromEntries(icons.map((i) => [i.name, i.code]));
await svgtofont({
	src: path.join(tmp, 'svg'),
	dist: path.join(tmp, 'dist'),
	fontName: 'shapeblock-bi',
	css: false,
	emptyDist: true,
	excludeFormat: ['eot', 'svg', 'symbol.svg', 'ttf'],
	svgicons2svgfont: { fontHeight: 1000, normalize: true },
	getIconUnicode: (name) => [String.fromCodePoint(code[name]), code[name] + 1],
	log: false,
});
for (const ext of ['woff2', 'woff']) fs.copyFileSync(path.join(tmp, 'dist', 'shapeblock-bi.' + ext), path.join(ASSETS, 'font', 'shapeblock-bi.' + ext));
fs.copyFileSync(path.join(ROOT, 'node_modules/bootstrap-icons/LICENSE'), path.join(ASSETS, 'font', 'bootstrap-icons-LICENSE.txt'));
fs.rmSync(tmp, { recursive: true, force: true });

// Stylesheet.
let css = `/**
 * ShapeBlock icon library.
 *
 * ${icons.length} icons: Bootstrap Icons v${VERSION} (https://icons.getbootstrap.com/),
 * MIT licensed - see ../font/bootstrap-icons-LICENSE.txt - and ShapeBlock's own
 * block icons ("block-" names, from icon/blocks/). Markup:
 * <i class="shapeblock-bi-NAME"></i>. This file is loaded only on pages that
 * show one of these icons, and in the block editor.
 */
@font-face {
	font-family: "shapeblock-bi";
	src: url("../font/shapeblock-bi.woff2?v=${VERSION}-${icons.length}") format("woff2"),
		url("../font/shapeblock-bi.woff?v=${VERSION}-${icons.length}") format("woff");
	font-weight: normal;
	font-style: normal;
	font-display: swap;
}

[class^="shapeblock-bi-"]::before,
[class*=" shapeblock-bi-"]::before {
	display: inline-block;
	font-family: "shapeblock-bi" !important;
	font-style: normal;
	font-weight: normal !important;
	font-variant: normal;
	text-transform: none;
	line-height: 1;
	vertical-align: -0.125em;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

`;
for (const i of icons) {
	css += `.shapeblock-bi-${i.name}::before { content: "\\${i.code.toString(16)}"; }\n`;
}
fs.writeFileSync(path.join(ASSETS, 'css/shapeblock-icons.css'), css);

// Picker list.
const cats = [...new Set(icons.map((i) => i.cat))];
fs.writeFileSync(path.join(ASSETS, 'icon/library.json'), JSON.stringify({
	source: `Bootstrap Icons ${VERSION} (MIT)`,
	prefix: 'shapeblock-bi-',
	categories: cats,
	icons: icons.map((i) => (KEYWORDS[i.name] ? [i.name, cats.indexOf(i.cat), KEYWORDS[i.name]] : [i.name, cats.indexOf(i.cat)])),
}));
process.stdout.write(`${icons.length} icons in ${cats.length} categories
`);
