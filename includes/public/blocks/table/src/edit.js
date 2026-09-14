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
const ICON_MINUS = SVG('M5 11h14v2H5z');
const ICON_PLUS = SVG('M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z');

const ALIGN_OPTIONS = [
	{ label: __('Default', 'shapeblock'), value: '' },
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
	{ label: __('Justify', 'shapeblock'), value: 'justify' },
];
const VALIGN_OPTIONS = [
	{ label: __('Default', 'shapeblock'), value: '' },
	{ label: __('Top', 'shapeblock'), value: 'top' },
	{ label: __('Middle', 'shapeblock'), value: 'middle' },
	{ label: __('Bottom', 'shapeblock'), value: 'bottom' },
];
const DECORATION_OPTIONS = [
	{ label: __('Default', 'shapeblock'), value: '' },
	{ label: __('Underline', 'shapeblock'), value: 'underline' },
	{ label: __('Overline', 'shapeblock'), value: 'overline' },
	{ label: __('Line Through', 'shapeblock'), value: 'line-through' },
	{ label: __('None', 'shapeblock'), value: 'none' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, tableHeader, tableBody, tableFooter } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-table-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (bodyAlign / bodyAlignTablet / bodyAlignMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'bodyAlign' : `bodyAlign${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	// Editor preview tooltip interactivity (front-end view.js doesn't run in SSR).
	const previewRef = useRef(null);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;
		const over = (e) => {
			const tip = e.target.closest('.shapeblock-tbl-tooltip');
			if (tip && root.contains(tip)) tip.classList.add('show');
		};
		const out = (e) => {
			const tip = e.target.closest('.shapeblock-tbl-tooltip');
			if (tip) tip.classList.remove('show');
		};
		root.addEventListener('mouseover', over);
		root.addEventListener('mouseout', out);
		return () => {
			root.removeEventListener('mouseover', over);
			root.removeEventListener('mouseout', out);
		};
	}, []);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
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

	// ---- Generic repeater management -------------------------------------------
	const makeRepeater = (attrKey, newItem) => {
		const items = Array.isArray(attributes[attrKey]) ? attributes[attrKey] : [];
		const update = (i, key, val) => setAttributes({ [attrKey]: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
		const add = () => setAttributes({ [attrKey]: [...items, { ...newItem }] });
		const remove = (i) => setAttributes({ [attrKey]: items.filter((_, idx) => idx !== i) });
		// Deep copy, so the clone's nested values are not shared with the original.
		const duplicate = (i) => {
			const next = items.slice();
			next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
			setAttributes({ [attrKey]: next });
		};
		const move = (i, dir) => {
			const t = i + dir;
			if (t < 0 || t >= items.length) return;
			const next = items.slice();
			const [m] = next.splice(i, 1);
			next.splice(t, 0, m);
			setAttributes({ [attrKey]: next });
		};
		return { items, update, add, remove, duplicate, move };
	};

	const [collapsed, setCollapsed] = useState({});
	const cKey = (section, i) => `${section}-${i}`;
	const isCollapsed = (section, i) => !!collapsed[cKey(section, i)];
	const toggleCollapsed = (section, i) => setCollapsed((cur) => ({ ...cur, [cKey(section, i)]: !cur[cKey(section, i)] }));

	const ItemHead = ({ section, index, label, rep }) => (
		<div className="shapeblock-tbl-repeater-head">
			<strong>{label || `#${index + 1}`}</strong>
			<div>
				<Button icon={isCollapsed(section, index) ? ICON_PLUS : ICON_MINUS} label={isCollapsed(section, index) ? __('Expand', 'shapeblock') : __('Collapse', 'shapeblock')} onClick={() => toggleCollapsed(section, index)} size="small" />
				<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => rep.move(index, -1)} disabled={index === 0} size="small" />
				<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => rep.move(index, 1)} disabled={index === rep.items.length - 1} size="small" />
				<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => rep.duplicate(index)} size="small" />
				<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => rep.remove(index)} isDestructive size="small" />
			</div>
		</div>
	);

	const cellAdvanced = (item, index, update, opts = {}) => (
		<>
			<ToggleControl label={__('Advance Settings', 'shapeblock')} checked={!!item.advance} onChange={(v) => update(index, 'advance', v)} __nextHasNoMarginBottom />
			{item.advance && (
				<>
					<ToggleControl label={__('colSpan', 'shapeblock')} checked={!!item.colspan} onChange={(v) => update(index, 'colspan', v)} __nextHasNoMarginBottom />
					{item.colspan && <TextControl label={__('colSpan Number', 'shapeblock')} type="number" value={item.colspanNumber || ''} onChange={(v) => update(index, 'colspanNumber', v)} __next40pxDefaultSize __nextHasNoMarginBottom />}
					{opts.rowspan && (
						<>
							<ToggleControl label={__('rowSpan', 'shapeblock')} checked={!!item.rowspan} onChange={(v) => update(index, 'rowspan', v)} __nextHasNoMarginBottom />
							{item.rowspan && <TextControl label={__('rowSpan Number', 'shapeblock')} type="number" value={item.rowspanNumber || ''} onChange={(v) => update(index, 'rowspanNumber', v)} __next40pxDefaultSize __nextHasNoMarginBottom />}
						</>
					)}
					{opts.flex && (
						<>
							<ToggleControl label={__('Data Flex', 'shapeblock')} checked={!!item.dataFlex} onChange={(v) => update(index, 'dataFlex', v)} __nextHasNoMarginBottom />
							{item.dataFlex && (
								<>
									<SelectControl label={__('Flex Alignment', 'shapeblock')} value={item.flexAlign || ''} options={[{ label: __('Left', 'shapeblock'), value: 'start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('Right', 'shapeblock'), value: 'end' }, { label: __('Justify', 'shapeblock'), value: 'space-between' }]} onChange={(v) => update(index, 'flexAlign', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									<TextControl label={__('Middle Gap (px)', 'shapeblock')} type="number" value={item.flexGap || ''} onChange={(v) => update(index, 'flexGap', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								</>
							)}
						</>
					)}
					{!(opts.flex && item.dataFlex) && <SelectControl label={__('Alignment', 'shapeblock')} value={item.align || ''} options={ALIGN_OPTIONS} onChange={(v) => update(index, 'align', v)} __next40pxDefaultSize __nextHasNoMarginBottom />}
					<SelectControl label={__('Vertical Alignment', 'shapeblock')} value={item.verticalAlign || ''} options={VALIGN_OPTIONS} onChange={(v) => update(index, 'verticalAlign', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextControl label={__('Custom Width (e.g. 30% or 200px)', 'shapeblock')} value={item.width || ''} onChange={(v) => update(index, 'width', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<SelectControl label={__('Decoration', 'shapeblock')} value={item.decoration || ''} options={DECORATION_OPTIONS} onChange={(v) => update(index, 'decoration', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					{opts.colors && (
						<>
							<ColorPopover label={__('Background Color', 'shapeblock')} color={item.bgColor || ''} onChange={(v) => update(index, 'bgColor', v)} />
							<ColorPopover label={__('Text Color', 'shapeblock')} color={item.textColor || ''} onChange={(v) => update(index, 'textColor', v)} />
							<ColorPopover label={__('Icon Color', 'shapeblock')} color={item.iconColor || ''} onChange={(v) => update(index, 'iconColor', v)} />
						</>
					)}
				</>
			)}
		</>
	);

	const cellTooltip = (item, index, update) => (
		<>
			<ToggleControl label={__('Tooltip', 'shapeblock')} checked={!!item.tooltip} onChange={(v) => update(index, 'tooltip', v)} __nextHasNoMarginBottom />
			{item.tooltip && (
				<>
					<IconPicker label={__('Tooltip Icon', 'shapeblock')} value={item.tooltipIcon || ''} onChange={(v) => update(index, 'tooltipIcon', v)} />
					<TextareaControl label={__('Tooltip Description', 'shapeblock')} value={item.tooltipDesc || ''} onChange={(v) => update(index, 'tooltipDesc', v)} __nextHasNoMarginBottom />
				</>
			)}
		</>
	);

	const headerRep = makeRepeater('tableHeader', { text: __('Table Header', 'shapeblock') });
	const bodyRep = makeRepeater('tableBody', { text: __('Table Data', 'shapeblock'), type: 'icon' });
	const footerRep = makeRepeater('tableFooter', { text: __('Table Footer', 'shapeblock') });

	// --- Tab 1: Settings (content / data) -------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Table Header', 'shapeblock')} initialOpen={true}>
				{headerRep.items.map((item, index) => (
					<div className="shapeblock-tbl-repeater-item" key={index}>
						<ItemHead section="header" index={index} label={item.text} rep={headerRep} />
						{!isCollapsed('header', index) && (
							<>
								<TextControl label={__('Text', 'shapeblock')} value={item.text || ''} onChange={(v) => headerRep.update(index, 'text', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<ToggleControl label={__('Icon', 'shapeblock')} checked={!!item.headerIcon} onChange={(v) => headerRep.update(index, 'headerIcon', v)} __nextHasNoMarginBottom />
								{item.headerIcon && <IconPicker label={__('Icon', 'shapeblock')} value={item.headIcon || ''} onChange={(v) => headerRep.update(index, 'headIcon', v)} />}
								{cellAdvanced(item, index, headerRep.update)}
								{cellTooltip(item, index, headerRep.update)}
							</>
						)}
					</div>
				))}
				<Button variant="primary" onClick={headerRep.add} icon={ICON_ADD}>{__('Add Header Cell', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Table Body', 'shapeblock')} initialOpen={false}>
				{bodyRep.items.map((item, index) => (
					<div className="shapeblock-tbl-repeater-item" key={index}>
						<ItemHead section="body" index={index} label={item.text} rep={bodyRep} />
						{!isCollapsed('body', index) && (
							<>
								<ToggleControl label={__('New Row (start a new row at this cell)', 'shapeblock')} checked={!!item.row} onChange={(v) => bodyRep.update(index, 'row', v)} __nextHasNoMarginBottom />
								<SelectControl label={__('Select Type', 'shapeblock')} value={item.type || 'icon'} options={[{ label: __('Icon', 'shapeblock'), value: 'icon' }, { label: __('Image', 'shapeblock'), value: 'image' }]} onChange={(v) => bodyRep.update(index, 'type', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								{(item.type || 'icon') === 'icon' && <IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => bodyRep.update(index, 'icon', v)} />}
								{item.type === 'image' && (
									<MediaUploadCheck>
										<MediaUpload
											onSelect={(media) => bodyRep.update(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
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
								<TextareaControl label={__('Text', 'shapeblock')} value={item.text || ''} onChange={(v) => bodyRep.update(index, 'text', v)} __nextHasNoMarginBottom />
								{cellAdvanced(item, index, bodyRep.update, { rowspan: true, flex: true, colors: true })}
								{cellTooltip(item, index, bodyRep.update)}
							</>
						)}
					</div>
				))}
				<Button variant="primary" onClick={bodyRep.add} icon={ICON_ADD}>{__('Add Body Cell', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Table Footer', 'shapeblock')} initialOpen={false}>
				{footerRep.items.map((item, index) => (
					<div className="shapeblock-tbl-repeater-item" key={index}>
						<ItemHead section="footer" index={index} label={item.text} rep={footerRep} />
						{!isCollapsed('footer', index) && (
							<>
								<TextControl label={__('Text', 'shapeblock')} value={item.text || ''} onChange={(v) => footerRep.update(index, 'text', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								{cellAdvanced(item, index, footerRep.update)}
								{cellTooltip(item, index, footerRep.update)}
							</>
						)}
					</div>
				))}
				<Button variant="primary" onClick={footerRep.add} icon={ICON_ADD}>{__('Add Footer Cell', 'shapeblock')}</Button>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (alignment, spacing, sizes) ----------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('General', 'shapeblock')} initialOpen={true}>
				{respAlign(__('Vertical Alignment', 'shapeblock'), 'verticalAlignTable', VALIGN_OPTIONS)}
				{respBox(__('Table Margin', 'shapeblock'), 'tableMargin')}
				{respBox(__('Cell Padding', 'shapeblock'), 'tablePadding')}
			</PanelBody>

			<PanelBody title={__('Table Header', 'shapeblock')} initialOpen={false}>
				{respAlign(__('Alignment', 'shapeblock'), 'headerAlign', ALIGN_OPTIONS)}
				{respBox(__('Padding', 'shapeblock'), 'theadPadding')}
				<Divider />
				{respNum(__('Icon Size (px)', 'shapeblock'), 'headerIconSize')}
				{num(__('Icon Vertical Position (px)', 'shapeblock'), 'headerIconYPos')}
				{box(__('Icon Margin', 'shapeblock'), 'headerIconMargin')}
			</PanelBody>

			<PanelBody title={__('Table Body', 'shapeblock')} initialOpen={false}>
				{respAlign(__('Alignment', 'shapeblock'), 'bodyAlign', ALIGN_OPTIONS)}
				{respNum(__('Icon Size (px)', 'shapeblock'), 'bodyIconSize')}
				{respBox(__('Icon Margin', 'shapeblock'), 'bodyIconGap')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'tbodyPadding')}
				{respBox(__('Margin', 'shapeblock'), 'tbodyMargin')}
				<Divider />
				{respNum(__('Tooltip Icon Size (px)', 'shapeblock'), 'tooltipIconSize')}
				{box(__('Tooltip Icon Margin', 'shapeblock'), 'tooltipIconMargin')}
				{respAlign(__('Tooltip Align', 'shapeblock'), 'tooltipAlign', [{ label: __('Left', 'shapeblock'), value: 'left' }, { label: __('Top', 'shapeblock'), value: 'top' }, { label: __('Right', 'shapeblock'), value: 'right' }, { label: __('Bottom', 'shapeblock'), value: 'bottom' }])}
				<Divider />
				{respNum(__('Image Size (px)', 'shapeblock'), 'imgSize')}
			</PanelBody>

			<PanelBody title={__('Table Footer', 'shapeblock')} initialOpen={false}>
				{respAlign(__('Alignment', 'shapeblock'), 'footerAlign', ALIGN_OPTIONS)}
				{respBox(__('Padding', 'shapeblock'), 'tfootPadding')}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (colors, typography, border, background, radius) --------
	const styleTab = (
		<>
			<PanelBody title={__('General', 'shapeblock')} initialOpen={true}>
				{border(__('Table Border', 'shapeblock'), 'tableBorder')}
				{box(__('Table Border Radius', 'shapeblock'), 'tableRadius')}
			</PanelBody>

			<PanelBody title={__('Table Header', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'headerTextColor')}
				{respTypo(__('Typography', 'shapeblock'), 'headerTypography')}
				{color(__('Background Color', 'shapeblock'), 'headerBgColor')}
				{border(__('Border', 'shapeblock'), 'headBorder')}
				{box(__('Border Radius', 'shapeblock'), 'theadRadius')}
				<Divider />
				{color(__('Icon Color', 'shapeblock'), 'headerIconColor')}
			</PanelBody>

			<PanelBody title={__('Table Body', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'bodyTextColor')}
				{respTypo(__('Typography', 'shapeblock'), 'bodyTypography')}
				{color(__('Background Color', 'shapeblock'), 'bodyBgColor')}
				<ToggleControl label={__('Striped Background', 'shapeblock')} checked={attributes.stripedBg} onChange={(v) => setAttributes({ stripedBg: v })} __nextHasNoMarginBottom />
				{attributes.stripedBg && color(__('Secondary Background Color', 'shapeblock'), 'stripedBgColor')}
				<Divider />
				{color(__('Icon Color', 'shapeblock'), 'bodyIconColor')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'tbodyRadius')}
				{border(__('Border', 'shapeblock'), 'bodyBorder')}
				<Divider />
				{color(__('Tooltip Icon Color', 'shapeblock'), 'tooltipIconColor')}
				<Divider />
				{box(__('Image Border Radius', 'shapeblock'), 'imgRadius')}
			</PanelBody>

			<PanelBody title={__('Table Footer', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'footerTextColor')}
				{respTypo(__('Typography', 'shapeblock'), 'footerTypography')}
				{color(__('Background Color', 'shapeblock'), 'footerBgColor')}
				{box(__('Border Radius', 'shapeblock'), 'tfootRadius')}
				{border(__('Border', 'shapeblock'), 'footBorder')}
			</PanelBody>
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/table" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
