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
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
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
const COLS = ['1', '2', '3', '4', '5', '6'].map((v) => ({ label: `${v} ${v === '1' ? __('Column', 'shapeblock') : __('Columns', 'shapeblock')}`, value: v }));
const RATINGS = ['1', '2', '3', '4', '5'].map((v) => ({ label: '★'.repeat(Number(v)) + '☆'.repeat(5 - Number(v)), value: v }));
const AUTHOR_ALIGN = [
	{ label: __('Start', 'shapeblock'), value: 'flex-start' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('End', 'shapeblock'), value: 'flex-end' },
];

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, testimonialsSkin, testimonials, showImage, showRating } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-tstml-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (testimonialsAlignment / ...Tablet / ...Mobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'testimonialsAlignment' : `testimonialsAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	const items = Array.isArray(testimonials) ? testimonials : [];
	const updateItem = (i, key, val) => setAttributes({ testimonials: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addItem = () => setAttributes({ testimonials: [...items, { image: {}, name: __('New Name', 'shapeblock'), designation: '', description: '', quoteIcon: '', rating: '5', logo: {} }] });
	const removeItem = (i) => setAttributes({ testimonials: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's image/logo objects are not shared with the original.
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ testimonials: next });
	};
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ testimonials: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <BoxControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <SelectControl value={attributes[k]} options={options} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);
	const mediaField = (label, item, index, key) => (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={(media) => updateItem(index, key, { id: media.id, url: media.url, alt: media.alt })}
				allowedTypes={['image']}
				value={item[key]?.id}
				render={({ open }) => (
					<div style={{ marginBottom: '8px' }}>
						<span style={{ display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>{label}</span>
						{item[key]?.url && <img src={item[key].url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
						<Button variant="secondary" size="small" onClick={open}>{item[key]?.url ? __('Replace', 'shapeblock') : __('Select', 'shapeblock')}</Button>
					</div>
				)}
			/>
		</MediaUploadCheck>
	);

	const noColumns = testimonialsSkin === 'default';

	// --- Tab 1: Settings (what to show) ---------------------------------------
	const settingsTab = (
		<PanelBody title={__('Testimonials', 'shapeblock')} initialOpen={true}>
			{items.map((item, index) => (
				<div className="shapeblock-tstml-repeater-item" key={index}>
					<div className="shapeblock-tstml-repeater-head">
						<strong>{item.name || `#${index + 1}`}</strong>
						<div>
							<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
						</div>
					</div>
					{mediaField(__('Picture', 'shapeblock'), item, index, 'image')}
					<TextControl label={__('Name', 'shapeblock')} value={item.name || ''} onChange={(v) => updateItem(index, 'name', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextControl label={__('Designation', 'shapeblock')} value={item.designation || ''} onChange={(v) => updateItem(index, 'designation', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextareaControl label={__('Description', 'shapeblock')} value={item.description || ''} onChange={(v) => updateItem(index, 'description', v)} __nextHasNoMarginBottom />
					<SelectControl label={__('Rating', 'shapeblock')} value={item.rating || '5'} options={RATINGS} onChange={(v) => updateItem(index, 'rating', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<IconPicker label={__('Quote Icon', 'shapeblock')} value={item.quoteIcon || ''} onChange={(v) => updateItem(index, 'quoteIcon', v)} />
					{mediaField(__('Logo', 'shapeblock'), item, index, 'logo')}
				</div>
			))}
			<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Testimonial', 'shapeblock')}</Button>
			<Divider />
			<ToggleControl label={__('Show Image', 'shapeblock')} checked={showImage} onChange={(v) => setAttributes({ showImage: v })} __nextHasNoMarginBottom />
			<ToggleControl label={__('Show Rating', 'shapeblock')} checked={showRating} onChange={(v) => setAttributes({ showRating: v })} __nextHasNoMarginBottom />
		</PanelBody>
	);

	// --- Tab 2: Layout --------------------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Preset & Columns', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Style', 'shapeblock')}
				value={testimonialsSkin}
				options={[
					{ label: __('Style 1', 'shapeblock'), value: 'default' },
					{ label: __('Style 2', 'shapeblock'), value: 'skin3' },
					{ label: __('Style 3', 'shapeblock'), value: 'skin6' },
				]}
				onChange={(v) => setAttributes({ testimonialsSkin: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{!noColumns && (
				<>
					<SelectControl label={__('Columns', 'shapeblock')} value={attributes.columns} options={COLS} onChange={(v) => setAttributes({ columns: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					<SelectControl label={__('Columns (Tablet)', 'shapeblock')} value={attributes.columnsTablet} options={COLS} onChange={(v) => setAttributes({ columnsTablet: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					<SelectControl label={__('Columns (Mobile)', 'shapeblock')} value={attributes.columnsMobile} options={COLS} onChange={(v) => setAttributes({ columnsMobile: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				</>
			)}
			{respAlign(__('Alignment', 'shapeblock'), 'testimonialsAlignment', [{ label: __('Default', 'shapeblock'), value: '' }, ...ALIGN])}
			{respBox(__('Item Padding', 'shapeblock'), 'itemPadding')}
			{testimonialsSkin !== 'default' && respNum(__('Logo Height (px)', 'shapeblock'), 'logoHeight')}
		</PanelBody>
	);

	// --- Tab 3: Style ---------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Item', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'bgColor', 'bgGradient')}
				{border(__('Border', 'shapeblock'), 'itemBorder')}
				{box(__('Border Radius', 'shapeblock'), 'itemBorderRadius')}
				{shadow(__('Box Shadow', 'shapeblock'), 'itemBoxShadow')}
				{respBox(__('Padding', 'shapeblock'), 'itemInnerPadding')}
				{testimonialsSkin === 'default' && respNum(__('Gap (px)', 'shapeblock'), 'wrapperGap')}
			</PanelBody>

			<PanelBody title={__('Name', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'nameColor')}
				{respTypo(__('Typography', 'shapeblock'), 'nameTypography')}
				{respBox(__('Margin', 'shapeblock'), 'nameMargin')}
			</PanelBody>

			<PanelBody title={__('Designation', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'designationColor')}
				{respTypo(__('Typography', 'shapeblock'), 'designationTypography')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descriptionColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descriptionTypography')}
				{respBox(__('Margin', 'shapeblock'), 'descriptionMargin')}
				{respNum(__('Min Height (px)', 'shapeblock'), 'minHeight')}
				{respNum(__('Max Width (px)', 'shapeblock'), 'maxWidth')}
			</PanelBody>

			{showImage && (
				<PanelBody title={__('Author Image', 'shapeblock')} initialOpen={false}>
					{respAlign(__('Author Info Alignment', 'shapeblock'), 'authorMetaAlignment', AUTHOR_ALIGN)}
					{respBox(__('Author Info Gap (margin)', 'shapeblock'), 'authorMetaGap')}
					{num(__('Image Size (px)', 'shapeblock'), 'authorImageSize')}
					{box(__('Image Border Radius', 'shapeblock'), 'authorImageBorderRadius')}
				</PanelBody>
			)}

			{showRating && (
				<PanelBody title={__('Rating', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'ratingColor')}
					{num(__('Size (px)', 'shapeblock'), 'ratingSize')}
				</PanelBody>
			)}

			{testimonialsSkin === 'default' && (
				<PanelBody title={__('Quote Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'quoteIconColor')}
					{num(__('Size (px)', 'shapeblock'), 'quoteIconSize')}
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || '' })}
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

			<ServerSideRender block="shapeblock/testimonials-grid" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
