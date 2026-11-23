import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import useInlineText from '../../custom-components/useInlineText';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	TextControl,
	TextareaControl,
	SelectControl,
	RangeControl,
	Button,
	TabPanel,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import IconPicker from '../../custom-components/IconPicker';
import SpacingControl from '../../custom-components/SpacingControl';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

import './editor.scss';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. columnsTablet).
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

// Each type links to the app that fits it, and starts with its own icon and label.
const TYPES = [
	{ value: 'phone', label: __('Phone', 'shapeblock'), icon: 'shapeblock-bi-telephone', help: __('Opens the phone app (tel:).', 'shapeblock') },
	{ value: 'email', label: __('Email', 'shapeblock'), icon: 'shapeblock-bi-envelope', help: __('Opens the mail app (mailto:).', 'shapeblock') },
	{ value: 'address', label: __('Address', 'shapeblock'), icon: 'shapeblock-bi-geo-alt', help: __('Opens the address in Google Maps.', 'shapeblock') },
	{ value: 'whatsapp', label: __('WhatsApp', 'shapeblock'), icon: 'shapeblock-bi-whatsapp', help: __('Opens a WhatsApp chat with this number.', 'shapeblock') },
	{ value: 'website', label: __('Website', 'shapeblock'), icon: 'shapeblock-bi-globe', help: __('Opens the website.', 'shapeblock') },
	{ value: 'text', label: __('Text only', 'shapeblock'), icon: 'shapeblock-bi-clock', help: __('No link, unless you add one below. For example opening times.', 'shapeblock') },
];
const typeOf = (v) => TYPES.find((t) => t.value === v) || TYPES[5];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, items, layout, iconView, showLabel, divider } = attributes;
	const rows = Array.isArray(items) ? items : [];
	const view = iconView || 'stacked';
	const [openIndex, setOpenIndex] = useState(null);

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-contact-info-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const updateItem = (i, patch) => setAttributes({ items: rows.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
	const changeType = (i, type) => {
		const old = typeOf(rows[i].type);
		const next = typeOf(type);
		// A row still showing the old type's icon gets the new type's icon.
		updateItem(i, { type, icon: !rows[i].icon || rows[i].icon === old.icon ? next.icon : rows[i].icon });
	};
	const addItem = () => {
		setAttributes({ items: [...rows, { type: 'whatsapp', icon: 'shapeblock-bi-whatsapp', label: __('WhatsApp', 'shapeblock'), value: '+1 555 014 2290', link: '', newTab: true }] });
		setOpenIndex(rows.length);
	};
	const removeItem = (i) => setAttributes({ items: rows.filter((_, idx) => idx !== i) });
	const duplicateItem = (i) => {
		const next = rows.slice();
		next.splice(i + 1, 0, { ...rows[i] });
		setAttributes({ items: next });
		setOpenIndex(i + 1);
	};
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= rows.length) return;
		const next = rows.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ items: next });
		setOpenIndex(t);
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);
	const group = (label, key, options, fallback, hideLabel = false) => (
		<div className="shapeblock-caps-label">
			<ToggleGroupControl label={label} hideLabelFromVision={hideLabel} value={attributes[key] || fallback} onChange={(v) => setAttributes({ [key]: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
				{options.map(([value, title]) => <ToggleGroupControlOption key={value} value={value} label={title} />)}
			</ToggleGroupControl>
		</div>
	);
	const slider = (key, max, min = 0) => (
		<RangeControl
			value={attributes[key] !== '' && attributes[key] != null ? Number(attributes[key]) : undefined}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={min}
			max={max}
			allowReset
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	const num = (label, key, max = 100, min = 0) => <ResponsiveWrapper label={label}>{(device) => slider(getKey(key, device), max, min)}</ResponsiveWrapper>;
	const single = (label, key, max = 100) => (
		<div>
			<p className="components-base-control__label">{label}</p>
			{slider(key, max)}
		</div>
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}</ResponsiveWrapper>
	);

	// --- Tab 1: Settings --------------------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Contact Details', 'shapeblock')} initialOpen={true}>
				{rows.map((item, index) => {
					const type = typeOf(item.type);
					return (
						<div className="shapeblock-ci-repeater-item" key={index}>
							<button type="button" className="shapeblock-ci-repeater-toggle" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
								<i className={`shapeblock-icon ${item.icon || type.icon}`} aria-hidden="true" />
								<strong>{(item.value || '').replace(/<[^>]*>/g, '') || type.label}</strong>
							</button>
							{openIndex === index && (
								<div className="shapeblock-ci-repeater-body">
									<SelectControl label={__('Type', 'shapeblock')} help={type.help} value={type.value} options={TYPES.map((t) => ({ value: t.value, label: t.label }))} onChange={(v) => changeType(index, v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									<TextControl label={__('Label', 'shapeblock')} value={item.label || ''} onChange={(v) => updateItem(index, { label: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
									<TextareaControl label={__('Value', 'shapeblock')} help={__('The number, address or text shown. Press Enter for a new line.', 'shapeblock')} value={item.value || ''} onChange={(v) => updateItem(index, { value: v })} rows={2} __nextHasNoMarginBottom />
									<IconPicker label={__('Icon', 'shapeblock')} value={item.icon} onChange={(v) => updateItem(index, { icon: v })} />
									<TextControl label={__('Custom Link', 'shapeblock')} help={__('Empty: the link the type gives.', 'shapeblock')} value={item.link || ''} onChange={(v) => updateItem(index, { link: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
									<ToggleControl label={__('Open in New Tab', 'shapeblock')} checked={!!item.newTab} onChange={(v) => updateItem(index, { newTab: v })} __nextHasNoMarginBottom />
									<div className="shapeblock-ci-repeater-actions">
										<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
										<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === rows.length - 1} size="small" />
										<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
										<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
									</div>
								</div>
							)}
						</div>
					);
				})}
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Row', 'shapeblock')}</Button>
			</PanelBody>
			<PanelBody title={__('Labels', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show Labels', 'shapeblock')} help={__('The small text above each value, such as "Call us".', 'shapeblock')} checked={showLabel !== false} onChange={(v) => setAttributes({ showLabel: v })} __nextHasNoMarginBottom />
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout ----------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
				{group(__('Arrange', 'shapeblock'), 'layout', [['list', __('List', 'shapeblock')], ['grid', __('Grid', 'shapeblock')], ['inline', __('In a Row', 'shapeblock')]], 'list')}
				{layout === 'grid' && num(__('Columns', 'shapeblock'), 'columns', 6, 1)}
				{group(__('Icon Position', 'shapeblock'), 'iconPosition', [['left', __('Left', 'shapeblock')], ['top', __('Top', 'shapeblock')]], 'left')}
				<ResponsiveWrapper label={__('Alignment', 'shapeblock')}>
					{(device) => group(__('Alignment', 'shapeblock'), getKey('align', device), [['left', __('Left', 'shapeblock')], ['center', __('Center', 'shapeblock')], ['right', __('Right', 'shapeblock')]], device === 'desktop' ? 'left' : '', true)}
				</ResponsiveWrapper>
			</PanelBody>
			<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={false}>
				{num(__('Space Between Rows (px)', 'shapeblock'), 'rowGap', 120)}
				{layout !== 'list' && num(__('Space Between Columns (px)', 'shapeblock'), 'columnGap', 120)}
				{num(__('Space Between Icon and Text (px)', 'shapeblock'), 'iconGap', 80)}
			</PanelBody>
			{layout === 'list' && (
				<PanelBody title={__('Divider', 'shapeblock')} initialOpen={false}>
					<ToggleControl label={__('Line Between Rows', 'shapeblock')} checked={!!divider} onChange={(v) => setAttributes({ divider: v })} __nextHasNoMarginBottom />
					{divider && (
						<>
							<SelectControl label={__('Style', 'shapeblock')} value={attributes.dividerStyle || 'solid'} options={[{ value: 'solid', label: __('Solid', 'shapeblock') }, { value: 'dashed', label: __('Dashed', 'shapeblock') }, { value: 'dotted', label: __('Dotted', 'shapeblock') }]} onChange={(v) => setAttributes({ dividerStyle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
							{color(__('Color', 'shapeblock'), 'dividerColor')}
						</>
					)}
				</PanelBody>
			)}
		</>
	);

	// --- Tab 3: Style -------------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Row Box', 'shapeblock')} initialOpen={true}>
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={[{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' }, { name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' }]}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{color(__('Background', 'shapeblock'), 'itemBgHover')}
								{color(__('Border Color', 'shapeblock'), 'itemBorderHover')}
								<ToggleControl label={__('Lift on Hover', 'shapeblock')} checked={!!attributes.hoverLift} onChange={(v) => setAttributes({ hoverLift: v })} __nextHasNoMarginBottom />
							</>
						) : (
							<>
								{bg(__('Background', 'shapeblock'), 'itemBg', 'itemBgGradient')}
								<BorderControl label={__('Border', 'shapeblock')} value={attributes.itemBorder} onChange={(v) => setAttributes({ itemBorder: v })} />
								{single(__('Border Radius (px)', 'shapeblock'), 'itemRadius', 60)}
								<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.itemShadow} onChange={(v) => setAttributes({ itemShadow: v })} />
							</>
						)
					}
				</TabPanel>
				<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
					{(device) => <SpacingControl values={attributes[getKey('itemPadding', device)]} onChange={(v) => setAttributes({ [getKey('itemPadding', device)]: v })} />}
				</ResponsiveWrapper>
			</PanelBody>
			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{group(__('View', 'shapeblock'), 'iconView', [['default', __('Default', 'shapeblock')], ['stacked', __('Stacked', 'shapeblock')], ['framed', __('Framed', 'shapeblock')]], 'stacked')}
				{color(__('Color', 'shapeblock'), 'iconColor')}
				{color(__('Hover Color', 'shapeblock'), 'iconColorHover')}
				{view === 'stacked' && bg(__('Background', 'shapeblock'), 'iconBg', 'iconBgGradient')}
				{view === 'stacked' && color(__('Hover Background', 'shapeblock'), 'iconBgHover')}
				{view === 'framed' && color(__('Border Color', 'shapeblock'), 'iconBg')}
				{num(__('Icon Size (px)', 'shapeblock'), 'iconSize', 80, 8)}
				{view !== 'default' && num(__('Circle Size (px)', 'shapeblock'), 'iconBoxSize', 140, 16)}
				{view !== 'default' && single(__('Border Radius (px)', 'shapeblock'), 'iconRadius', 70)}
			</PanelBody>
			{showLabel !== false && (
				<PanelBody title={__('Label', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'labelColor')}
					{respTypo(__('Typography', 'shapeblock'), 'labelTypography')}
				</PanelBody>
			)}
			<PanelBody title={__('Value', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'valueColor')}
				{color(__('Link Hover Color', 'shapeblock'), 'valueColorHover')}
				{respTypo(__('Typography', 'shapeblock'), 'valueTypography')}
			</PanelBody>
		</>
	);

	// Labels and values are typed right on the preview; a row's place in the list tells which one it is.
	const rowIndex = (el) => {
		const row = el.closest('li');
		return row ? Array.prototype.indexOf.call(row.parentElement.children, row) : 0;
	};
	const inlineRef = useInlineText([
		{ selector: '.shapeblock-ci__label', getIndex: rowIndex, save: (i, v) => updateItem(i, { label: v }) },
		{ selector: '.shapeblock-ci__value', getIndex: rowIndex, multiline: true, save: (i, v) => updateItem(i, { value: v }) },
	]);
	// Clicking a row's icon opens that row in the sidebar.
	const openRow = (e) => {
		const icon = e.target.closest('.shapeblock-ci__icon');
		if (icon) {
			setOpenIndex(rowIndex(icon));
		}
	};

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
						{ name: 'advanced', title: __('Advanced', 'shapeblock') },
					]}
				>
					{(tab) =>
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						tab.name === 'style' ? styleTab :
						<AdvancedControls attributes={attributes} setAttributes={setAttributes} />
					}
				</TabPanel>
			</InspectorControls>
			<div ref={inlineRef} onClickCapture={openRow}>
				<ServerSideRender block="shapeblock/contact-info" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
