import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	RangeControl,
	BoxControl,
	Button,
	TabPanel,
	ToolbarDropdownMenu,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import SpacingControl from '../../custom-components/SpacingControl';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. titlePaddingTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

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
const ICON_CARET = SVG('M7 10l5 5 5-5z');

const MSVG = ({ children }) => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{children}</svg>
);
// Icon direction - icon box before / after the text.
const ICON_DIR_LEFT = <MSVG><rect x="3" y="7" width="9" height="9" rx="1.5" /><rect x="14" y="8.5" width="7" height="2" /><rect x="14" y="13" width="5" height="2" /></MSVG>;
const ICON_DIR_RIGHT = <MSVG><rect x="12" y="7" width="9" height="9" rx="1.5" /><rect x="3" y="8.5" width="7" height="2" /><rect x="5" y="13" width="5" height="2" /></MSVG>;
// Vertical alignment of the icon against the text block.
const ICON_VALIGN_TOP = <MSVG><rect x="3" y="4" width="18" height="2" /><rect x="8" y="8" width="8" height="11" rx="1.5" /></MSVG>;
const ICON_VALIGN_MID = <MSVG><rect x="3" y="11" width="18" height="2" /><rect x="8" y="5" width="8" height="14" rx="1.5" /></MSVG>;
const ICON_VALIGN_BOTTOM = <MSVG><rect x="3" y="18" width="18" height="2" /><rect x="8" y="5" width="8" height="11" rx="1.5" /></MSVG>;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, features, feaDir, iconView, feaConnector, showIcon } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-fea-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(features) ? features : [];
	// Which repeater item is expanded (accordion). null = all collapsed.
	const [openIndex, setOpenIndex] = useState(null);
	const updateItem = (i, key, val) => setAttributes({ features: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addItem = () => {
		setAttributes({ features: [...items, { iconType: 'icon', icon: '', number: '', image: {}, title: __('New Item', 'shapeblock'), desc: '' }] });
		setOpenIndex(items.length);
	};
	const removeItem = (i) => setAttributes({ features: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's nested objects are not shared with the original.
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ features: next });
	};
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ features: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	// Responsive spacing (padding / margin) - clean 4-side control per device.
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<SpacingControl
					values={attributes[getKey(base, device)]}
					onChange={(v) => setAttributes({ [getKey(base, device)]: v })}
				/>
			)}
		</ResponsiveWrapper>
	);
	// Responsive typography - one typography object per device.
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />
			)}
		</ResponsiveWrapper>
	);
	// Responsive slider. Stored as a string per device so render.php's ensure_unit() keeps working.
	const num = (label, key, max = 100, min = 0) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(key, device);
				return (
					<RangeControl
						value={attributes[k] !== '' && attributes[k] != null ? Number(attributes[k]) : undefined}
						onChange={(v) => setAttributes({ [k]: v == null ? '' : String(v) })}
						min={min}
						max={max}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);

	// --- Tab 1: Settings (content / behavior) ---------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('List Settings', 'shapeblock')} initialOpen={true}>
				{items.map((item, index) => (
					<div className="shapeblock-fea-list-repeater-item" key={index}>
						<div className="shapeblock-fea-list-repeater-head">
								<button
									type="button"
									className="shapeblock-fea-list-repeater-toggle"
									onClick={() => setOpenIndex(openIndex === index ? null : index)}
									aria-expanded={openIndex === index}
								>
									<strong>{item.title || `#${index + 1}`}</strong>
									<span className="shapeblock-fea-list-caret" style={{ transform: openIndex === index ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
								</button>
							</div>
						{openIndex === index && (
						<div className="shapeblock-fea-list-repeater-body">
						{showIcon !== false && (
						<SelectControl
							label={__('Type', 'shapeblock')}
							value={item.iconType || 'icon'}
							options={[
								{ label: __('Icon', 'shapeblock'), value: 'icon' },
								{ label: __('Number', 'shapeblock'), value: 'number' },
								{ label: __('Image', 'shapeblock'), value: 'image' },
							]}
							onChange={(v) => updateItem(index, 'iconType', v)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						)}
						{showIcon !== false && (item.iconType || 'icon') === 'icon' && <IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(index, 'icon', v)} />}
						{showIcon !== false && item.iconType === 'number' && <TextControl label={__('Number', 'shapeblock')} value={item.number || ''} onChange={(v) => updateItem(index, 'number', v)} __next40pxDefaultSize __nextHasNoMarginBottom />}
						{showIcon !== false && item.iconType === 'image' && (
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => updateItem(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
									allowedTypes={['image']}
									value={item.image?.id}
									render={({ open }) => (
										<div style={{ marginBottom: '8px' }}>
											{item.image?.url && <img src={item.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
											<Button variant="secondary" size="small" onClick={open}>{item.image?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}</Button>
										</div>
									)}
								/>
							</MediaUploadCheck>
						)}
						<TextControl label={__('Title', 'shapeblock')} value={item.title || ''} onChange={(v) => updateItem(index, 'title', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextareaControl label={__('Description', 'shapeblock')} value={item.desc || ''} onChange={(v) => updateItem(index, 'desc', v)} __nextHasNoMarginBottom />
							<div className="shapeblock-fea-list-repeater-actions">
								<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
								<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
								<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
								<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
							</div>
						</div>
						)}
					</div>
				))}
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Item', 'shapeblock')}</Button>
				<Divider />
				<ToggleControl label={__('Icon', 'shapeblock')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
				{showIcon !== false && <SelectControl label={__('Icon View', 'shapeblock')} value={iconView} options={[{ label: __('Default', 'shapeblock'), value: 'default' }, { label: __('Frame', 'shapeblock'), value: 'frame' }, { label: __('Stacked', 'shapeblock'), value: 'stracked' }]} onChange={(v) => setAttributes({ iconView: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
				{showIcon !== false && (iconView === 'frame' || iconView === 'stracked') && (
					<SelectControl label={__('Shape', 'shapeblock')} value={attributes.iconShape} options={[{ label: __('Rounded', 'shapeblock'), value: 'rounded' }, { label: __('Square', 'shapeblock'), value: 'square' }, { label: __('Circle', 'shapeblock'), value: 'circle' }, { label: __('Square Rotate', 'shapeblock'), value: 'sq_rotate' }]} onChange={(v) => setAttributes({ iconShape: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
				<SelectControl label={__('Title HTML Tag', 'shapeblock')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Connector', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Connector', 'shapeblock')} checked={feaConnector} onChange={(v) => setAttributes({ feaConnector: v })} __nextHasNoMarginBottom />
				{feaConnector && (
					<>
						<ToggleControl label={__('Left Connector', 'shapeblock')} checked={attributes.feaConnectorLeft} onChange={(v) => setAttributes({ feaConnectorLeft: v })} __nextHasNoMarginBottom />
						<SelectControl label={__('Type', 'shapeblock')} value={attributes.feaConnectorType} options={['solid', 'dotted', 'dashed', 'double'].map((v) => ({ label: v, value: v }))} onChange={(v) => setAttributes({ feaConnectorType: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						{num(__('Connector Width (px)', 'shapeblock'), 'feaConnectorWidth', 50)}
						{feaDir === 'left' && num(__('Position Horizontal (px)', 'shapeblock'), 'feaConnectorPositionX', 100, -100)}
						{feaDir === 'right' && num(__('Position Horizontal (px)', 'shapeblock'), 'feaConnectorRightPositionX', 100, -100)}
						{color(__('Color', 'shapeblock'), 'feaConnectorColor')}
					</>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<>
			{showIcon !== false && (
			<PanelBody title={__('Alignment', 'shapeblock')} initialOpen={true}>
				<div className="shapeblock-caps-label">
					<ToggleGroupControl label={__('Icon Direction', 'shapeblock')} value={feaDir} onChange={(v) => setAttributes({ feaDir: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
						<ToggleGroupControlOptionIcon value="left" icon={ICON_DIR_LEFT} label={__('Left', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="right" icon={ICON_DIR_RIGHT} label={__('Right', 'shapeblock')} />
					</ToggleGroupControl>
				</div>
				<div className="shapeblock-caps-label">
					<ToggleGroupControl label={__('Vertical Alignment', 'shapeblock')} value={attributes.feaVerticalAlign} onChange={(v) => setAttributes({ feaVerticalAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
						<ToggleGroupControlOptionIcon value="flex-start" icon={ICON_VALIGN_TOP} label={__('Top', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="center" icon={ICON_VALIGN_MID} label={__('Middle', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="flex-end" icon={ICON_VALIGN_BOTTOM} label={__('Bottom', 'shapeblock')} />
					</ToggleGroupControl>
				</div>
			</PanelBody>
			)}

			<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={showIcon === false}>
				{respBox(__('Padding', 'shapeblock'), 'feaListPadding')}
				{respBox(__('Margin', 'shapeblock'), 'feaBlockMargin')}
				{num(__('Item Gap (px)', 'shapeblock'), 'feaItemGap')}
				{num(__('Middle Gap (px)', 'shapeblock'), 'feaMiddleGap')}
			</PanelBody>

			{showIcon !== false && (
			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{num(__('Size (px)', 'shapeblock'), 'iconSize', 200)}
				{num(__('Box Size (px)', 'shapeblock'), 'iconBoxSize', 200)}
				<SelectControl label={__('Alignment', 'shapeblock')} value={attributes.iconAlignment} options={[{ label: __('Left', 'shapeblock'), value: 'start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('Right', 'shapeblock'), value: 'end' }]} onChange={(v) => setAttributes({ iconAlignment: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'titlePadding')}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Features List', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'listBgColor', 'listBgGradient')}
				{border(__('Border', 'shapeblock'), 'feaListBorder')}
				{box(__('Border Radius', 'shapeblock'), 'feaListBorderRadius')}
			</PanelBody>

			{showIcon !== false && (
			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'iconColor')}
				{bg(__('Background', 'shapeblock'), 'iconBgColor', 'iconBgGradient')}
				{shadow(__('Box Shadow', 'shapeblock'), 'iconShadow')}
				{border(__('Border', 'shapeblock'), 'iconBorder')}
				{box(__('Border Radius', 'shapeblock'), 'iconRadius')}
			</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h3').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({
						title: t.toUpperCase(),
						isActive: attributes.titleTag === t,
						onClick: () => setAttributes({ titleTag: t }),
					}))}
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

			<ServerSideRender block="shapeblock/feature-list" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
