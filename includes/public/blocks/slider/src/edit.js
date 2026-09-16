import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');

const FIT = [
	{ label: __('Cover', 'shapeblock'), value: 'cover' },
	{ label: __('Contain', 'shapeblock'), value: 'contain' },
	{ label: __('Fill', 'shapeblock'), value: 'fill' },
];

/**
 * Thumbnail preview for one slide.
 *
 * The URL is resolved from the attachment id on every render instead of being
 * saved into the block, so it always matches the image the slide currently
 * points at. A slide with no image yet shows the same placeholder the canvas
 * does, so the row never looks blank while it waits to be filled in.
 */
function ItemThumb({ image, onClick }) {
	const id = image?.id;
	const thumb = useSelect(
		(select) => {
			if (!id) {
				return '';
			}
			const media = select('core').getMedia(id);
			return media?.media_details?.sizes?.thumbnail?.source_url || '';
		},
		[id]
	);

	const src = thumb || image?.url || window.shapeblockPlaceholder;
	if (!src) {
		return null;
	}
	const isPlaceholder = !thumb && !image?.url;
	const img = (
		<img
			src={src}
			alt=""
			style={{
				display: 'block',
				maxWidth: '100%',
				...(isPlaceholder ? { border: '1px solid #e0e0e0', borderRadius: '2px' } : {}),
			}}
		/>
	);

	// The preview is the obvious thing to click, so it opens the media library
	// itself rather than only labelling the button underneath it.
	if (!onClick) {
		return <div style={{ marginBottom: '6px' }}>{img}</div>;
	}
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={isPlaceholder ? __('Select image', 'shapeblock') : __('Replace image', 'shapeblock')}
			style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'none', cursor: 'pointer', marginBottom: '6px' }}
		>
			{img}
		</button>
	);
}

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, slides, autoplay, showArrows, showDots } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-slider-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(slides) ? slides : [];
	const update = (i, key, val) => setAttributes({ slides: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () => setAttributes({ slides: [...items, { image: {} }] });
	const remove = (i) => setAttributes({ slides: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's image object is not shared with the original.
	const duplicate = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ slides: next });
	};
	const move = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ slides: next });
	};

	// Adding several images at once is the usual way to build an image slider.
	const addFromLibrary = (media) => {
		const picked = (Array.isArray(media) ? media : [media])
			.filter((m) => m && m.url)
			.map((m) => ({ image: { id: m.id, url: m.url, alt: m.alt || '' } }));
		if (picked.length) {
			setAttributes({ slides: [...items, ...picked] });
		}
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key, help) => (
		<TextControl label={label} help={help} type="number" value={attributes[key]}
			onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
	);

	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => {
				const k = getKey(base, d);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content & behaviour) --------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Images', 'shapeblock')} initialOpen={true}>
				{items.map((item, index) => (
					<div className="shapeblock-slider-repeater-item" key={index}>
						<div className="shapeblock-slider-repeater-head">
							<strong>{__('Image', 'shapeblock')} #{index + 1}</strong>
							<div>
								<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => move(index, -1)} disabled={index === 0} size="small" />
								<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => move(index, 1)} disabled={index === items.length - 1} size="small" />
								<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicate(index)} size="small" />
								<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => remove(index)} isDestructive size="small" />
							</div>
						</div>

						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => update(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
								allowedTypes={['image']}
								value={item.image?.id}
								render={({ open }) => (
									<div>
										<ItemThumb image={item.image} onClick={open} />
										<Button variant="secondary" size="small" onClick={open}>
											{item.image?.url ? __('Replace Image', 'shapeblock') : __('Select Image', 'shapeblock')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
					</div>
				))}

				<MediaUploadCheck>
					<MediaUpload
						multiple
						gallery={false}
						allowedTypes={['image']}
						onSelect={addFromLibrary}
						render={({ open }) => (
							<Button variant="primary" onClick={open} icon={ICON_ADD}>{__('Add Images', 'shapeblock')}</Button>
						)}
					/>
				</MediaUploadCheck>
				<Button variant="secondary" onClick={add} style={{ marginLeft: '8px' }}>{__('Add Empty Slide', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Playback', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Loop', 'shapeblock')} checked={attributes.loop} onChange={(v) => setAttributes({ loop: v })} __nextHasNoMarginBottom />
				<ToggleControl label={__('Autoplay', 'shapeblock')} checked={autoplay} onChange={(v) => setAttributes({ autoplay: v })} __nextHasNoMarginBottom />
				{autoplay && (
					<>
						{num(__('Autoplay Delay (ms)', 'shapeblock'), 'autoplayDelay')}
						<ToggleControl label={__('Pause on hover', 'shapeblock')} checked={attributes.pauseOnHover} onChange={(v) => setAttributes({ pauseOnHover: v })} __nextHasNoMarginBottom />
					</>
				)}
				{num(__('Transition Speed (ms)', 'shapeblock'), 'speed')}
			</PanelBody>

			<PanelBody title={__('Navigation', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show Arrows', 'shapeblock')} checked={showArrows} onChange={(v) => setAttributes({ showArrows: v })} __nextHasNoMarginBottom />
				<ToggleControl label={__('Show Dots', 'shapeblock')} checked={showDots} onChange={(v) => setAttributes({ showDots: v })} __nextHasNoMarginBottom />
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout --------------------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
			{respNum(__('Slides Per View', 'shapeblock'), 'slidesPerView')}
			{respNum(__('Space Between (px)', 'shapeblock'), 'spaceBetween')}
			<Divider />
			{respNum(__('Slide Height (px)', 'shapeblock'), 'slideHeight')}
			<SelectControl
				label={__('Image Fit', 'shapeblock')}
				value={attributes.imageFit}
				options={FIT}
				help={__('Cover fills the slide and crops; Contain shows the whole image.', 'shapeblock')}
				onChange={(v) => setAttributes({ imageFit: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 3: Style ---------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Slide', 'shapeblock')} initialOpen={true}>
				<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.slideRadius} onChange={(v) => setAttributes({ slideRadius: v })} />
				<BackgroundControl
					label={__('Image Overlay', 'shapeblock')}
					colorValue={attributes.overlayColor}
					gradientValue={attributes.overlayGradient}
					onColorChange={(v) => setAttributes({ overlayColor: v && typeof v === 'object' ? v.hex : v || '' })}
					onGradientChange={(v) => setAttributes({ overlayGradient: v || '' })}
				/>
			</PanelBody>

			{showArrows && (
				<PanelBody title={__('Arrows', 'shapeblock')} initialOpen={false}>
					{color(__('Icon Color', 'shapeblock'), 'arrowColor')}
					{color(__('Background', 'shapeblock'), 'arrowBgColor')}
					{respNum(__('Size (px)', 'shapeblock'), 'arrowSize')}
					{box(__('Border Radius', 'shapeblock'), 'arrowRadius')}
				</PanelBody>
			)}

			{showDots && (
				<PanelBody title={__('Dots', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'dotColor')}
					{color(__('Active Color', 'shapeblock'), 'dotActiveColor')}
					{num(__('Size (px)', 'shapeblock'), 'dotSize')}
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<TabPanel
					className="shapeblock-inspector-tabs"
					activeClass="is-active"
					tabs={[
						{ name: 'settings', title: __('Settings', 'shapeblock') },
						{ name: 'layout', title: __('Layout', 'shapeblock') },
						{ name: 'style', title: __('Style', 'shapeblock') },
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/slider" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
