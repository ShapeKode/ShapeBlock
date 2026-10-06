import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
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
const ICON_CARET = SVG('M7 10l5 5 5-5z');
const ICON_ALIGN_LEFT = SVG('M4 19h16v-2H4v2zm0-6h10v-2H4v2zm0-8v2h16V5H4z');
const ICON_ALIGN_CENTER = SVG('M4 19h16v-2H4v2zm3-6h10v-2H7v2zM4 5v2h16V5H4z');
const ICON_ALIGN_RIGHT = SVG('M4 19h16v-2H4v2zm6-6h10v-2H10v2zM4 5v2h16V5H4z');

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
	{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
];
const FILTER_TABS = [
	...STATE_TABS,
	{ name: 'active', title: __('Active', 'shapeblock'), className: 'shapeblock-tab-active' },
];

const ALIGN3 = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

const blankItem = () => ({ icon: '', title: __('New Item', 'shapeblock'), desc: '' });
const clone = (v) => JSON.parse(JSON.stringify(v));

// Move an element of an array one place; returns a new array.
const moved = (arr, i, dir) => {
	const t = i + dir;
	if (t < 0 || t >= arr.length) return arr;
	const next = arr.slice();
	const [m] = next.splice(i, 1);
	next.splice(t, 0, m);
	return next;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, categories, showIcon, showAll, defaultFilter } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-iso-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// The editor's preview device, so the toolbar edits the matching per-device value.
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = getKey('cardAlign', dev);

	const cats = Array.isArray(categories) ? categories : [];
	// Which category / item is expanded in the sidebar (accordion). null = none.
	const [openCat, setOpenCat] = useState(0);
	const [openItem, setOpenItem] = useState(null); // 'catIndex-itemIndex'

	const setCats = (next, extra = {}) => setAttributes({ categories: next, ...extra });

	// defaultFilter holds a category's position, so it has to follow structural changes.
	const remapDefault = (fn) => {
		if (defaultFilter === 'all' || defaultFilter === undefined || defaultFilter === '') return {};
		const next = fn(parseInt(defaultFilter, 10));
		return { defaultFilter: next == null ? 'all' : String(next) };
	};

	const updateCat = (ci, patch) => setCats(cats.map((c, i) => (i === ci ? { ...c, ...patch } : c)));
	const addCat = () => {
		setCats([...cats, { name: __('New Category', 'shapeblock'), items: [blankItem()] }]);
		setOpenCat(cats.length);
		setOpenItem(null);
	};
	const removeCat = (ci) => setCats(cats.filter((_, i) => i !== ci), remapDefault((d) => (d === ci ? null : d > ci ? d - 1 : d)));
	const duplicateCat = (ci) => {
		const next = cats.slice();
		next.splice(ci + 1, 0, clone(cats[ci]));
		setCats(next, remapDefault((d) => (d > ci ? d + 1 : d)));
	};
	const moveCat = (ci, dir) => {
		const t = ci + dir;
		if (t < 0 || t >= cats.length) return;
		setCats(moved(cats, ci, dir), remapDefault((d) => (d === ci ? t : d === t ? ci : d)));
		setOpenCat(t);
	};

	const itemsOf = (ci) => (Array.isArray(cats[ci]?.items) ? cats[ci].items : []);
	const setItems = (ci, items) => updateCat(ci, { items });
	const updateItem = (ci, ii, patch) => setItems(ci, itemsOf(ci).map((it, i) => (i === ii ? { ...it, ...patch } : it)));
	const addItem = (ci) => {
		setItems(ci, [...itemsOf(ci), blankItem()]);
		setOpenItem(`${ci}-${itemsOf(ci).length}`);
	};
	const removeItem = (ci, ii) => setItems(ci, itemsOf(ci).filter((_, i) => i !== ii));
	const duplicateItem = (ci, ii) => {
		const next = itemsOf(ci).slice();
		next.splice(ii + 1, 0, clone(itemsOf(ci)[ii]));
		setItems(ci, next);
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	// Responsive spacing (padding) - clean 4-side control per device.
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
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />
			)}
		</ResponsiveWrapper>
	);
	// Responsive slider, stored as a string per device so render.php's ensure_unit() keeps working.
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
	// Plain (not per-device) slider.
	const single = (label, key, max = 100, min = 0) => (
		<RangeControl
			label={label}
			value={attributes[key] !== '' && attributes[key] != null ? Number(attributes[key]) : undefined}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={min}
			max={max}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);

	// --- Tab 1: Settings (content / behaviour) --------------------------------
	const renderItem = (ci, item, ii) => {
		const key = `${ci}-${ii}`;
		const open = openItem === key;
		const list = itemsOf(ci);
		return (
			<div className="shapeblock-iso-repeater-item shapeblock-iso-repeater-item--child" key={ii}>
				<button
					type="button"
					className="shapeblock-iso-repeater-toggle"
					onClick={() => setOpenItem(open ? null : key)}
					aria-expanded={open}
				>
					<strong>{item.title || `#${ii + 1}`}</strong>
					<span className="shapeblock-iso-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
				</button>
				{open && (
					<div className="shapeblock-iso-repeater-body">
						{showIcon !== false && (
							<IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(ci, ii, { icon: v })} />
						)}
						<TextControl label={__('Title', 'shapeblock')} value={item.title || ''} onChange={(v) => updateItem(ci, ii, { title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextareaControl label={__('Description', 'shapeblock')} value={item.desc || ''} onChange={(v) => updateItem(ci, ii, { desc: v })} __nextHasNoMarginBottom />
						<div className="shapeblock-iso-repeater-actions">
							<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => setItems(ci, moved(list, ii, -1))} disabled={ii === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => setItems(ci, moved(list, ii, 1))} disabled={ii === list.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(ci, ii)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(ci, ii)} isDestructive size="small" />
						</div>
					</div>
				)}
			</div>
		);
	};

	const settingsTab = (
		<>
			<PanelBody title={__('Categories', 'shapeblock')} initialOpen={true}>
				{cats.map((cat, ci) => {
					const open = openCat === ci;
					const list = itemsOf(ci);
					return (
						<div className="shapeblock-iso-repeater-item" key={ci}>
							<button
								type="button"
								className="shapeblock-iso-repeater-toggle"
								onClick={() => setOpenCat(open ? null : ci)}
								aria-expanded={open}
							>
								<strong>{cat.name || `${__('Category', 'shapeblock')} ${ci + 1}`}</strong>
								<span className="shapeblock-iso-count">{list.length}</span>
								<span className="shapeblock-iso-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
							</button>
							{open && (
								<div className="shapeblock-iso-repeater-body">
									<TextControl
										label={__('Category Name', 'shapeblock')}
										value={cat.name || ''}
										onChange={(v) => updateCat(ci, { name: v })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
									<div className="shapeblock-iso-subhead">{__('Items', 'shapeblock')}</div>
									<div className="shapeblock-iso-repeater-children">
										{list.map((item, ii) => renderItem(ci, item, ii))}
									</div>
									<Button variant="secondary" onClick={() => addItem(ci)} icon={ICON_ADD}>{__('Add Item', 'shapeblock')}</Button>
									<Divider />
									<div className="shapeblock-iso-repeater-actions">
										<Button icon={ICON_UP} label={__('Move category up', 'shapeblock')} onClick={() => moveCat(ci, -1)} disabled={ci === 0} size="small" />
										<Button icon={ICON_DOWN} label={__('Move category down', 'shapeblock')} onClick={() => moveCat(ci, 1)} disabled={ci === cats.length - 1} size="small" />
										<Button icon={ICON_COPY} label={__('Duplicate category', 'shapeblock')} onClick={() => duplicateCat(ci)} size="small" />
										<Button icon={ICON_TRASH} label={__('Remove category', 'shapeblock')} onClick={() => removeCat(ci)} isDestructive size="small" />
									</div>
								</div>
							)}
						</div>
					);
				})}
				<Button variant="primary" onClick={addCat} icon={ICON_ADD}>{__('Add Category', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Filter Bar', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show "All" button', 'shapeblock')} checked={showAll !== false} onChange={(v) => setAttributes({ showAll: v })} __nextHasNoMarginBottom />
				{showAll !== false && (
					<TextControl label={__('"All" Label', 'shapeblock')} value={attributes.allLabel || ''} onChange={(v) => setAttributes({ allLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
				<SelectControl
					label={__('Show First', 'shapeblock')}
					value={defaultFilter || 'all'}
					options={[
						...(showAll !== false ? [{ label: attributes.allLabel || __('All', 'shapeblock'), value: 'all' }] : []),
						...cats.map((c, i) => ({ label: c.name || `${__('Category', 'shapeblock')} ${i + 1}`, value: String(i) })),
					]}
					onChange={(v) => setAttributes({ defaultFilter: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Content', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show icons', 'shapeblock')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
				<SelectControl
					label={__('Title HTML Tag', 'shapeblock')}
					value={attributes.titleTag}
					options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))}
					onChange={(v) => setAttributes({ titleTag: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout ----------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Card Alignment', 'shapeblock')} initialOpen={true}>
				<ResponsiveWrapper label={__('Content Alignment', 'shapeblock')}>
					{(d) => {
						const k = getKey('cardAlign', d);
						return (
							<ToggleGroupControl
								value={attributes[k] || (d === 'desktop' ? 'left' : undefined)}
								onChange={(v) => setAttributes({ [k]: v || '' })}
								isBlock
								isDeselectable={d !== 'desktop'}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Left', 'shapeblock')} />
								<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Center', 'shapeblock')} />
								<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Right', 'shapeblock')} />
							</ToggleGroupControl>
						);
					}}
				</ResponsiveWrapper>
				<SelectControl
					label={__('Icon Position', 'shapeblock')}
					value={attributes.iconPosition}
					options={[{ label: __('Top', 'shapeblock'), value: 'top' }, { label: __('Left', 'shapeblock'), value: 'left' }]}
					onChange={(v) => setAttributes({ iconPosition: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Grid', 'shapeblock')} initialOpen={false}>
				{num(__('Columns', 'shapeblock'), 'columns', 6, 1)}
				{num(__('Gap (px)', 'shapeblock'), 'gap', 80)}
				<ToggleControl label={__('Equal height cards', 'shapeblock')} checked={attributes.equalHeight !== false} onChange={(v) => setAttributes({ equalHeight: v })} __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Filter Bar', 'shapeblock')} initialOpen={false}>
				<ResponsiveWrapper label={__('Alignment', 'shapeblock')}>
					{(device) => {
						const k = getKey('filterAlign', device);
						return (
							<SelectControl
								value={attributes[k]}
								options={[...(device === 'desktop' ? [] : [{ label: __('Default', 'shapeblock'), value: '' }]), ...ALIGN3]}
								onChange={(v) => setAttributes({ [k]: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						);
					}}
				</ResponsiveWrapper>
				{num(__('Button Gap (px)', 'shapeblock'), 'filterGap', 60)}
				{num(__('Space Below (px)', 'shapeblock'), 'filterSpace', 120)}
				{respBox(__('Button Padding', 'shapeblock'), 'filterPadding')}
			</PanelBody>

			<PanelBody title={__('Card', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'cardPadding')}
				{single(__('Icon Gap (px)', 'shapeblock'), 'iconSpace', 60)}
				{single(__('Title / Description Gap (px)', 'shapeblock'), 'textGap', 40)}
			</PanelBody>

			<PanelBody title={__('Animation', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Effect', 'shapeblock')}
					value={attributes.animationType}
					options={[
						{ label: __('Fade + Scale', 'shapeblock'), value: 'scale' },
						{ label: __('Fade', 'shapeblock'), value: 'fade' },
						{ label: __('None', 'shapeblock'), value: 'none' },
					]}
					onChange={(v) => setAttributes({ animationType: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{attributes.animationType !== 'none' && (
					<RangeControl
						label={__('Duration (ms)', 'shapeblock')}
						value={Number(attributes.animationDuration) || 0}
						onChange={(v) => setAttributes({ animationDuration: String(v == null ? 0 : v) })}
						min={0}
						max={1500}
						step={50}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style -----------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Filter Buttons', 'shapeblock')} initialOpen={true}>
				{respTypo(__('Typography', 'shapeblock'), 'filterTypography')}
				<Divider />
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={FILTER_TABS}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'filterColorHover')}
								{bg(__('Background', 'shapeblock'), 'filterBgHover', 'filterBgGradientHover')}
								{color(__('Border Color', 'shapeblock'), 'filterBorderColorHover')}
							</>
						) : tab.name === 'active' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'filterColorActive')}
								{bg(__('Background', 'shapeblock'), 'filterBgActive', 'filterBgGradientActive')}
								{color(__('Border Color', 'shapeblock'), 'filterBorderColorActive')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'filterColor')}
								{bg(__('Background', 'shapeblock'), 'filterBg', 'filterBgGradient')}
								{border(__('Border', 'shapeblock'), 'filterBorder')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'filterRadius')}
			</PanelBody>

			<PanelBody title={__('Card', 'shapeblock')} initialOpen={false}>
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{bg(__('Background', 'shapeblock'), 'cardBgHover', 'cardBgGradientHover')}
								{color(__('Border Color', 'shapeblock'), 'cardBorderColorHover')}
								{shadow(__('Box Shadow', 'shapeblock'), 'cardShadowHover')}
							</>
						) : (
							<>
								{bg(__('Background', 'shapeblock'), 'cardBg', 'cardBgGradient')}
								{border(__('Border', 'shapeblock'), 'cardBorder')}
								{shadow(__('Box Shadow', 'shapeblock'), 'cardShadow')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'cardRadius')}
			</PanelBody>

			{showIcon !== false && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'iconColor')}
					{bg(__('Background', 'shapeblock'), 'iconBg', 'iconBgGradient')}
					{num(__('Icon Size (px)', 'shapeblock'), 'iconSize', 120)}
					{num(__('Box Size (px)', 'shapeblock'), 'iconBoxSize', 200)}
					{box(__('Border Radius', 'shapeblock'), 'iconRadius')}
				</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{color(__('Color (Card Hover)', 'shapeblock'), 'titleColorHover')}
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
				<AlignmentControl
					value={attributes[alignKey] || (dev === 'desktop' ? 'left' : undefined)}
					onChange={(v) => setAttributes({ [alignKey]: v || (dev === 'desktop' ? 'left' : '') })}
				/>
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
						{ name: 'advanced', title: __('Advanced', 'shapeblock') },
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'advanced' ? <AdvancedControls attributes={attributes} setAttributes={setAttributes} /> :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/isotope" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
