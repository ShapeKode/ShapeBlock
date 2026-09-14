import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';
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
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

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
const ICON_COLLAPSE = SVG('M5 11h14v2H5z'); // minus (shown when expanded — click to collapse)
const ICON_EXPAND = SVG('M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z'); // plus (shown when collapsed — click to expand)

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock') },
	{ name: 'hover', title: __('Hover', 'shapeblock') },
];

const POSITION_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Top', 'shapeblock'), value: 'top' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, tabs, iconPosition, layoutDirection } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-tab-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (descriptionAlignment / ...Tablet / ...Mobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'descriptionAlignment' : `descriptionAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	const items = Array.isArray(tabs) ? tabs : [];

	// Editor-only: track which repeater items are collapsed (by index).
	// First item starts expanded, all others collapsed.
	const [collapsed, setCollapsed] = useState(() => {
		const init = {};
		items.forEach((_, i) => {
			if (i !== 0) init[i] = true;
		});
		return init;
	});
	const toggleCollapsed = (i) => setCollapsed((cur) => ({ ...cur, [i]: !cur[i] }));

	// Editor preview interactivity: the front-end view.js doesn't run inside the
	// ServerSideRender output, so wire up tab switching here. We delegate clicks
	// on a persistent wrapper (the SSR markup is replaced on every re-render).
	const previewRef = useRef(null);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) {
			return undefined;
		}
		const onClick = (e) => {
			const li = e.target.closest('.shapeblock-tab-titles li');
			if (!li || !root.contains(li)) {
				return;
			}
			const wrapper = li.closest('.shapeblock-tabs-wrapper');
			if (!wrapper) {
				return;
			}
			const tabId = li.getAttribute('data-tab');
			wrapper.querySelectorAll('.shapeblock-tab-titles li').forEach((t) => t.classList.remove('active'));
			li.classList.add('active');
			// Toggle the `active` class only and strip any inline styles so the
			// stylesheet is the single source of truth (avoids a stale inline
			// `display:block` keeping a previously-shown panel visible).
			wrapper.querySelectorAll('.shapeblock-tab-content').forEach((c) => {
				c.classList.toggle('active', c.id === tabId);
				c.style.removeProperty('display');
				c.style.removeProperty('opacity');
				c.style.removeProperty('transform');
			});
		};
		root.addEventListener('click', onClick);
		return () => root.removeEventListener('click', onClick);
	}, []);

	const updateItem = (i, key, val) =>
		setAttributes({ tabs: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });

	const addItem = () =>
		setAttributes({
			tabs: [
				...items,
				{
					tabTitle: __('New Tab', 'shapeblock'),
					iconType: 'icon',
					icon: '',
					image: {},
					contentTitle: '',
					contentDescription: '',
					readMoreText: '',
					readMoreUrl: '#',
					readMoreNewTab: false,
				},
			],
		});

	const removeItem = (i) => setAttributes({ tabs: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's nested objects are not shared with the original.
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ tabs: next });
	};

	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ tabs: next });
	};

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const typo = (label, key) => (
		<TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />
	);
	const border = (label, key) => (
		<BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const box = (label, key) => (
		<BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const num = (label, key) => (
		<TextControl
			label={label}
			type="number"
			value={attributes[key]}
			onChange={(v) => setAttributes({ [key]: v })}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
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
	const respSelect = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <SelectControl value={attributes[k]} options={options} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content) --------------------------------------------
	const settingsTab = (
		<PanelBody title={__('Tabs', 'shapeblock')} initialOpen={true}>
			{items.map((item, index) => { const isCollapsed = !!collapsed[index]; return (
				<div className="shapeblock-tab-repeater-item" key={index}>
					<div className="shapeblock-tab-repeater-head">
						<strong>{item.tabTitle || `#${index + 1}`}</strong>
						<div>
							<Button icon={isCollapsed ? ICON_EXPAND : ICON_COLLAPSE} label={isCollapsed ? __('Expand', 'shapeblock') : __('Collapse', 'shapeblock')} onClick={() => toggleCollapsed(index)} size="small" />
								<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
						</div>
					</div>
					{!isCollapsed && (<>
						<TextControl
						label={__('Tab Title', 'shapeblock')}
						value={item.tabTitle || ''}
						onChange={(v) => updateItem(index, 'tabTitle', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Icon / Image', 'shapeblock')}
						value={item.iconType || 'icon'}
						options={[
							{ label: __('None', 'shapeblock'), value: 'none' },
							{ label: __('Icon', 'shapeblock'), value: 'icon' },
							{ label: __('Image', 'shapeblock'), value: 'image' },
						]}
						onChange={(v) => updateItem(index, 'iconType', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{(item.iconType || 'icon') === 'icon' && (
						<IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(index, 'icon', v)} />
					)}
					{item.iconType === 'image' && (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => updateItem(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
								allowedTypes={['image']}
								value={item.image?.id}
								render={({ open }) => (
									<div style={{ marginBottom: '8px' }}>
										{item.image?.url && <img src={item.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
										<Button variant="secondary" size="small" onClick={open}>
											{item.image?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
					)}
					<TextControl
						label={__('Content Title', 'shapeblock')}
						value={item.contentTitle || ''}
						onChange={(v) => updateItem(index, 'contentTitle', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextareaControl
						label={__('Description', 'shapeblock')}
						value={item.contentDescription || ''}
						onChange={(v) => updateItem(index, 'contentDescription', v)}
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Button Text', 'shapeblock')}
						value={item.readMoreText || ''}
						onChange={(v) => updateItem(index, 'readMoreText', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Button URL', 'shapeblock')}
						value={item.readMoreUrl || ''}
						onChange={(v) => updateItem(index, 'readMoreUrl', v)}
						placeholder="https://your-link.com"
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Open in new tab', 'shapeblock')}
						checked={!!item.readMoreNewTab}
						onChange={(v) => updateItem(index, 'readMoreNewTab', v)}
						__nextHasNoMarginBottom
					/>
						</>
						)}
				</div>
			)})}
			<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Tab', 'shapeblock')}</Button>
		</PanelBody>
	);

	// --- Tab 2: Layout (orientation & position) -------------------------------
	const layoutTab = (
		<PanelBody title={__('Tab Title Settings', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Icon Position', 'shapeblock')}
				value={iconPosition}
				options={POSITION_OPTIONS}
				onChange={(v) => setAttributes({ iconPosition: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('Layout', 'shapeblock')}
				value={layoutDirection}
				options={POSITION_OPTIONS}
				onChange={(v) => setAttributes({ layoutDirection: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Tab Nav', 'shapeblock')} initialOpen={true}>
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				<TabPanel tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'titleColor')}
								{color(__('Background Color', 'shapeblock'), 'titleBgColor')}
								{border(__('Border', 'shapeblock'), 'titleBorder')}
								{box(__('Border Radius', 'shapeblock'), 'titleBorderRadius')}
								{respBox(__('Padding', 'shapeblock'), 'titlePadding')}
								{respBox(__('Margin', 'shapeblock'), 'titleMargin')}
								{color(__('Icon Color', 'shapeblock'), 'tabIconColor')}
								{color(__('Icon / Image Bg Color', 'shapeblock'), 'tabIconBgColor')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'titleActiveColor')}
								{color(__('Background Color', 'shapeblock'), 'titleActiveBgColor')}
								{color(__('Border Color', 'shapeblock'), 'titleActiveBorderColor')}
							</>
						)
					}
				</TabPanel>
			</PanelBody>

			<PanelBody title={__('Tab Nav Border & Spacing', 'shapeblock')} initialOpen={false}>
				{respNum(__('Bottom Spacing (px)', 'shapeblock'), 'titleBottomSpacing')}
				{border(__('Bottom Border (top layout)', 'shapeblock'), 'navBorder')}
			</PanelBody>

			<PanelBody title={__('Tab Content Area', 'shapeblock')} initialOpen={false}>
				{color(__('Background Color', 'shapeblock'), 'contentBgColor')}
				{border(__('Border', 'shapeblock'), 'contentBorder')}
				{box(__('Border Radius', 'shapeblock'), 'contentBorderRadius')}
				{respBox(__('Padding', 'shapeblock'), 'contentPadding')}
				{respBox(__('Margin', 'shapeblock'), 'contentMargin')}
				{respSelect(__('Alignment', 'shapeblock'), 'descriptionAlignment', [
					{ label: __('Left', 'shapeblock'), value: 'left' },
					{ label: __('Center', 'shapeblock'), value: 'center' },
					{ label: __('Right', 'shapeblock'), value: 'right' },
					{ label: __('Justify', 'shapeblock'), value: 'justify' },
				])}
			</PanelBody>

			<PanelBody title={__('Content Title', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'contentTitleTypography')}
				{color(__('Color', 'shapeblock'), 'contentTitleColor')}
				{respBox(__('Margin', 'shapeblock'), 'contentTitleMargin')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respBox(__('Margin', 'shapeblock'), 'descMargin')}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'btnTypography')}
				<TabPanel tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'btnColor')}
								{color(__('Background Color', 'shapeblock'), 'btnBgColor')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'btnHoverColor')}
								{color(__('Background Color', 'shapeblock'), 'btnHoverBgColor')}
								{color(__('Border Color', 'shapeblock'), 'btnHoverBorderColor')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{border(__('Border', 'shapeblock'), 'btnBorder')}
				{box(__('Border Radius', 'shapeblock'), 'btnBorderRadius')}
				{respBox(__('Padding', 'shapeblock'), 'btnPadding')}
				{respBox(__('Margin', 'shapeblock'), 'btnMargin')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || (dev === 'desktop' ? 'center' : '') })}
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/tab" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
