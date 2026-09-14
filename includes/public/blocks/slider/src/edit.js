import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import TypographyControls from '../../custom-components/TypographyControls';
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

const ALIGN = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

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

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute rather than always the desktop one.
	const device = useSelect((select) => {
		const editor = select('core/edit-post') || select('core/editor');
		if (!editor) return 'Desktop';
		if (editor.getDeviceType) return editor.getDeviceType();
		if (editor.__experimentalGetPreviewDeviceType) return editor.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';

	const items = Array.isArray(slides) ? slides : [];
	const update = (i, key, val) => setAttributes({ slides: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () => setAttributes({
		slides: [...items, { image: {}, title: __('New slide', 'shapeblock'), description: '', buttonText: '', buttonUrl: '', buttonNewTab: false }],
	});
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
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => <BoxControl values={attributes[getKey(base, d)]} onChange={(v) => setAttributes({ [getKey(base, d)]: v })} />}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => {
				const k = getKey(base, d);
				return <SelectControl value={attributes[k]} options={ALIGN} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, d)} />}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content & behaviour) --------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Slides', 'shapeblock')} initialOpen={true}>
				{items.map((item, index) => (
					<div className="shapeblock-slider-repeater-item" key={index}>
						<div className="shapeblock-slider-repeater-head">
							<strong>{item.title || `${__('Slide', 'shapeblock')} #${index + 1}`}</strong>
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
									<div style={{ marginBottom: '8px' }}>
										{item.image?.url && <img src={item.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
										<Button variant="secondary" size="small" onClick={open}>
											{item.image?.url ? __('Replace Image', 'shapeblock') : __('Select Image', 'shapeblock')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>

						<TextControl label={__('Title', 'shapeblock')} value={item.title || ''} onChange={(v) => update(index, 'title', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextareaControl label={__('Description', 'shapeblock')} value={item.description || ''} onChange={(v) => update(index, 'description', v)} __nextHasNoMarginBottom />
						<TextControl label={__('Button Text', 'shapeblock')} value={item.buttonText || ''} onChange={(v) => update(index, 'buttonText', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
						{item.buttonText && (
							<>
								<TextControl label={__('Button URL', 'shapeblock')} value={item.buttonUrl || ''} onChange={(v) => update(index, 'buttonUrl', v)} placeholder="https://" __next40pxDefaultSize __nextHasNoMarginBottom />
								<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={!!item.buttonNewTab} onChange={(v) => update(index, 'buttonNewTab', v)} __nextHasNoMarginBottom />
							</>
						)}
					</div>
				))}
				<Button variant="primary" onClick={add} icon={ICON_ADD}>{__('Add Slide', 'shapeblock')}</Button>
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
			{respAlign(__('Content Alignment', 'shapeblock'), 'contentAlign')}
			{respNum(__('Content Max Width (px)', 'shapeblock'), 'contentWidth')}
			{respBox(__('Content Padding', 'shapeblock'), 'contentPadding')}
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

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				{respBox(__('Margin', 'shapeblock'), 'titleMargin')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
				{respBox(__('Margin', 'shapeblock'), 'descMargin')}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<TabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock') },
						{ name: 'hover', title: __('Hover', 'shapeblock') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'buttonColor')}
								{color(__('Background', 'shapeblock'), 'buttonBgColor')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'buttonHoverColor')}
								{color(__('Background', 'shapeblock'), 'buttonHoverBgColor')}
							</>
						)
					}
				</TabPanel>
				{respTypo(__('Typography', 'shapeblock'), 'buttonTypography')}
				{respBox(__('Padding', 'shapeblock'), 'buttonPadding')}
				{box(__('Border Radius', 'shapeblock'), 'buttonRadius')}
				<BorderControl label={__('Border', 'shapeblock')} value={attributes.buttonBorder} onChange={(v) => setAttributes({ buttonBorder: v })} />
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
			<BlockControls>
				<AlignmentControl
					value={attributes[getKey('contentAlign', dev)]}
					onChange={(v) => setAttributes({ [getKey('contentAlign', dev)]: v || '' })}
				/>
			</BlockControls>

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
