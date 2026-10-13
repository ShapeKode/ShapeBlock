import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	CheckboxControl,
	RangeControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalUnitControl as UnitControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
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
	const { blockId, showFilters, showAll, showSearch, showIcon, showSeparator } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-fl-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const filters = Array.isArray(attributes.filters) ? attributes.filters : [];
	const items = Array.isArray(attributes.items) ? attributes.items : [];
	const [openItem, setOpenItem] = useState(null);

	const filterName = (f, i) => f.name || `${__('Filter', 'shapeblock')} ${i + 1}`;
	const countOf = (id) => items.filter((it) => Array.isArray(it.filters) && it.filters.includes(id)).length;

	// --- Filters -------------------------------------------------------------
	const newFilterId = () => {
		let id;
		do {
			id = 'f' + Math.random().toString(36).slice(2, 8);
		} while (filters.some((f) => f.id === id));
		return id;
	};
	const updateFilter = (i, patch) => setAttributes({ filters: filters.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
	const addFilter = () => setAttributes({ filters: [...filters, { id: newFilterId(), name: __('New Filter', 'shapeblock') }] });
	// A removed filter also leaves every item, and stops being the one shown first.
	const removeFilter = (i) => {
		const id = filters[i].id;
		setAttributes({
			filters: filters.filter((_, j) => j !== i),
			items: items.map((it) => (Array.isArray(it.filters) && it.filters.includes(id) ? { ...it, filters: it.filters.filter((x) => x !== id) } : it)),
			...(attributes.defaultFilter === id ? { defaultFilter: 'all' } : {}),
		});
	};

	// --- Items ---------------------------------------------------------------
	const setItems = (next) => setAttributes({ items: next });
	const updateItem = (i, patch) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
	// BackgroundControl clears the other field with a second call in the same
	// tick, before this render's items update - so each call builds on the
	// latest list rather than the one this render started with.
	const latestItems = useRef(items);
	latestItems.current = items;
	const updateItemLatest = (i, patch) => {
		const next = latestItems.current.map((it, j) => (j === i ? { ...it, ...patch } : it));
		latestItems.current = next;
		setAttributes({ items: next });
	};
	const toggleItemFilter = (i, id, on) => {
		const own = Array.isArray(items[i].filters) ? items[i].filters : [];
		updateItem(i, { filters: on ? [...own.filter((x) => x !== id), id] : own.filter((x) => x !== id) });
	};
	const addItem = () => {
		setItems([...items, { icon: '', title: __('New Item', 'shapeblock'), filters: [] }]);
		setOpenItem(items.length);
	};
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, clone(items[i]));
		setItems(next);
	};
	const removeItem = (i) => {
		setItems(items.filter((_, j) => j !== i));
		setOpenItem(null);
	};

	// --- Control helpers -----------------------------------------------------
	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v || '' })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
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
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<SpacingControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />
			)}
		</ResponsiveWrapper>
	);
	const typo = (base) => <TypographyControls label={__('Typography', 'shapeblock')} attributes={attributes} setAttributes={setAttributes} attributeKey={base} />;
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	// Sliders store a string so render.php's ensure_unit() adds the px.
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
						allowReset
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);
	const single = (label, key, max = 100, min = 0) => (
		<RangeControl
			label={label}
			value={attributes[key] !== '' && attributes[key] != null ? Number(attributes[key]) : undefined}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={min}
			max={max}
			allowReset
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	const repeaterActions = (i, list, onMove, onCopy, onRemove) => (
		<div className="shapeblock-fl-repeater-actions">
			<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => onMove(moved(list, i, -1))} disabled={i === 0} size="small" />
			<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => onMove(moved(list, i, 1))} disabled={i === list.length - 1} size="small" />
			{onCopy && <Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={onCopy} size="small" />}
			<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={onRemove} isDestructive size="small" />
		</div>
	);

	// --- Tab 1: Settings (content and behaviour) -----------------------------
	const renderItem = (item, i) => {
		const open = openItem === i;
		const own = Array.isArray(item.filters) ? item.filters : [];
		return (
			<div className="shapeblock-fl-repeater-item" key={i}>
				<button type="button" className="shapeblock-fl-repeater-toggle" onClick={() => setOpenItem(open ? null : i)} aria-expanded={open}>
					<strong>{item.title || `#${i + 1}`}</strong>
					{item.badge && <span className="shapeblock-fl-repeater-tag">{item.badge}</span>}
					<span className="shapeblock-fl-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
				</button>
				{open && (
					<div className="shapeblock-fl-repeater-body">
						{showIcon !== false && <IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(i, { icon: v })} />}
						<TextControl label={__('Title', 'shapeblock')} value={item.title || ''} onChange={(v) => updateItem(i, { title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Link', 'shapeblock')} help={__('Leave empty for plain text.', 'shapeblock')} value={item.link || ''} onChange={(v) => updateItem(i, { link: v })} placeholder="https://" type="url" __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl
							label={__('Open in New Tab', 'shapeblock')}
							help={attributes.linksNewTab ? __('On for every link (Settings > Content).', 'shapeblock') : undefined}
							checked={!!item.linkNewTab || !!attributes.linksNewTab}
							disabled={!!attributes.linksNewTab}
							onChange={(v) => updateItem(i, { linkNewTab: v })}
							__nextHasNoMarginBottom
						/>
						<ToggleControl label={__('Add Nofollow', 'shapeblock')} checked={!!item.linkNofollow} onChange={(v) => updateItem(i, { linkNofollow: v })} __nextHasNoMarginBottom />
						<div className="shapeblock-fl-subhead">{__('Shown under these filters', 'shapeblock')}</div>
						{filters.length ? (
							filters.map((f, fi) => (
								<CheckboxControl key={f.id} label={filterName(f, fi)} checked={own.includes(f.id)} onChange={(on) => toggleItemFilter(i, f.id, on)} __nextHasNoMarginBottom />
							))
						) : (
							<p className="components-base-control__help">{__('Add filters under Settings > Filters first.', 'shapeblock')}</p>
						)}
						<TextControl label={__('Badge', 'shapeblock')} help={__('A short label after the title, such as New or Upcoming. Leave empty for none.', 'shapeblock')} value={item.badge || ''} onChange={(v) => updateItem(i, { badge: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						{item.badge && (
							<>
								<BackgroundControl
									label={__('Badge Background (this item)', 'shapeblock')}
									colorValue={item.badgeBg || ''}
									gradientValue={item.badgeBgGradient || ''}
									onColorChange={(v) => updateItemLatest(i, { badgeBg: (v && typeof v === 'object' ? v.hex : v) || '' })}
									onGradientChange={(v) => updateItemLatest(i, { badgeBgGradient: v || '' })}
								/>
								<ColorPopover label={__('Badge Text Color (this item)', 'shapeblock')} color={item.badgeColor || ''} onChange={(v) => updateItem(i, { badgeColor: v || '' })} />
							</>
						)}
						<TextControl label={__('Extra Search Words', 'shapeblock')} help={__('Other words that should find this item, separated by spaces. Visitors do not see them.', 'shapeblock')} value={item.keywords || ''} onChange={(v) => updateItem(i, { keywords: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						{repeaterActions(i, items, setItems, () => duplicateItem(i), () => removeItem(i))}
					</div>
				)}
			</div>
		);
	};

	const settingsTab = (
		<>
			{/* Filters first: the categories are made before the items that go in them. */}
			<PanelBody title={__('Filters', 'shapeblock')} initialOpen={true}>
				<ToggleControl label={__('Show filter buttons', 'shapeblock')} checked={showFilters !== false} onChange={(v) => setAttributes({ showFilters: v })} __nextHasNoMarginBottom />
				<div className="shapeblock-fl-repeater">
					{filters.map((f, i) => (
						<div className="shapeblock-fl-repeater-item shapeblock-fl-filter-row" key={f.id || i}>
							<TextControl label={`${__('Filter', 'shapeblock')} ${i + 1}`} value={f.name || ''} onChange={(v) => updateFilter(i, { name: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
							<div className="shapeblock-fl-filter-row-meta">
								<span className="shapeblock-fl-repeater-count">
									{sprintf(
										/* translators: %d: number of items under this filter. */
										_n('%d item', '%d items', countOf(f.id), 'shapeblock'),
										countOf(f.id)
									)}
								</span>
								{repeaterActions(i, filters, (next) => setAttributes({ filters: next }), null, () => removeFilter(i))}
							</div>
						</div>
					))}
				</div>
				<Button variant="secondary" onClick={addFilter} icon={ICON_ADD}>{__('Add Filter', 'shapeblock')}</Button>
				<p className="components-base-control__help">{__('Then choose which filters each item belongs to, under Items below.', 'shapeblock')}</p>
				{showFilters !== false && (
					<>
						<Divider />
						<ToggleControl label={__('Show "All" button', 'shapeblock')} checked={showAll !== false} onChange={(v) => setAttributes({ showAll: v })} __nextHasNoMarginBottom />
						{showAll !== false && (
							<TextControl label={__('"All" Label', 'shapeblock')} placeholder={__('All', 'shapeblock')} value={attributes.allLabel || ''} onChange={(v) => setAttributes({ allLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						)}
						<ToggleControl label={__('Show the number of items', 'shapeblock')} checked={attributes.showCount !== false} onChange={(v) => setAttributes({ showCount: v })} __nextHasNoMarginBottom />
						<SelectControl
							label={__('Show First', 'shapeblock')}
							value={attributes.defaultFilter || 'all'}
							options={[
								...(showAll !== false ? [{ label: attributes.allLabel || __('All', 'shapeblock'), value: 'all' }] : []),
								...filters.map((f, i) => ({ label: filterName(f, i), value: f.id })),
							]}
							onChange={(v) => setAttributes({ defaultFilter: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Items', 'shapeblock')} initialOpen={true}>
				<div className="shapeblock-fl-repeater">{items.map(renderItem)}</div>
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Item', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Search', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show search box', 'shapeblock')}
					help={__('Visitors type to find an item by its title, badge or extra search words.', 'shapeblock')}
					checked={showSearch !== false}
					onChange={(v) => setAttributes({ showSearch: v })}
					__nextHasNoMarginBottom
				/>
				{showSearch !== false && (
					<TextControl label={__('Placeholder', 'shapeblock')} placeholder={__('Search…', 'shapeblock')} value={attributes.searchPlaceholder || ''} onChange={(v) => setAttributes({ searchPlaceholder: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
				<TextControl
					label={__('No Results Text', 'shapeblock')}
					help={__('Shown when no item matches the search or the filter.', 'shapeblock')}
					placeholder={__('Nothing found. Try another word.', 'shapeblock')}
					value={attributes.noResultsText || ''}
					onChange={(v) => setAttributes({ noResultsText: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Content', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show icons', 'shapeblock')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
				<ToggleControl
					label={__('Open every link in a new tab', 'shapeblock')}
					help={__('Off: each item decides for itself (Settings > Items).', 'shapeblock')}
					checked={!!attributes.linksNewTab}
					onChange={(v) => setAttributes({ linksNewTab: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout --------------------------------------------------------
	const hasHeader = showFilters !== false || showSearch !== false;
	const layoutTab = (
		<>
			<PanelBody title={__('List', 'shapeblock')} initialOpen={true}>
				<SelectControl
					label={__('Order', 'shapeblock')}
					value={attributes.listFlow || 'columns'}
					options={[
						{ label: __('Down the columns', 'shapeblock'), value: 'columns' },
						{ label: __('Across the rows', 'shapeblock'), value: 'rows' },
					]}
					onChange={(v) => setAttributes({ listFlow: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<ResponsiveWrapper label={__('Columns', 'shapeblock')}>
					{(device) => {
						const k = getKey('columns', device);
						return (
							<ToggleGroupControl value={String(attributes[k] || '')} onChange={(v) => setAttributes({ [k]: v || '' })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
								{['1', '2', '3', '4', '5', '6'].map((n) => (
									<ToggleGroupControlOption key={n} value={n} label={n} />
								))}
							</ToggleGroupControl>
						);
					}}
				</ResponsiveWrapper>
				{num(__('Space Between Rows (px)', 'shapeblock'), 'rowGap', 60)}
				{num(__('Space Between Columns (px)', 'shapeblock'), 'columnGap', 120)}
			</PanelBody>

			{hasHeader && (
				<PanelBody title={__('Filters & Search', 'shapeblock')} initialOpen={false}>
					{showFilters !== false && showSearch !== false && (
						<SelectControl
							label={__('Arrangement', 'shapeblock')}
							value={attributes.headerLayout || 'split'}
							options={[
								{ label: __('Filters left, search right', 'shapeblock'), value: 'split' },
								{ label: __('Search above filters', 'shapeblock'), value: 'stacked' },
							]}
							onChange={(v) => setAttributes({ headerLayout: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
					{showFilters !== false && (
						<>
							<ResponsiveWrapper label={__('Filter Alignment', 'shapeblock')}>
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
							{single(__('Space Between Buttons (px)', 'shapeblock'), 'filterGap', 40)}
						</>
					)}
					{showSearch !== false && (
						<ResponsiveWrapper label={__('Search Box Width', 'shapeblock')}>
							{(device) => {
								const k = getKey('searchWidth', device);
								return <UnitControl value={attributes[k] || ''} onChange={(v) => setAttributes({ [k]: v || '' })} placeholder="300px" __next40pxDefaultSize />;
							}}
						</ResponsiveWrapper>
					)}
				</PanelBody>
			)}
		</>
	);

	// --- Tab 3: Style ---------------------------------------------------------
	const styleTab = (
		<>
			{showFilters !== false && (
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
									{attributes.showCount !== false && color(__('Number Color', 'shapeblock'), 'countColorActive')}
								</>
							) : (
								<>
									{color(__('Text Color', 'shapeblock'), 'filterColor')}
									{bg(__('Background', 'shapeblock'), 'filterBg', 'filterBgGradient')}
									{border(__('Border', 'shapeblock'), 'filterBorder')}
									{attributes.showCount !== false && color(__('Number Color', 'shapeblock'), 'countColor')}
								</>
							)
						}
					</TabPanel>
					<Divider />
					{box(__('Border Radius', 'shapeblock'), 'filterRadius')}
					{respBox(__('Padding', 'shapeblock'), 'filterPadding')}
				</PanelBody>
			)}

			{showSearch !== false && (
				<PanelBody title={__('Search Box', 'shapeblock')} initialOpen={showFilters === false}>
					{typo('searchTypography')}
					{color(__('Text Color', 'shapeblock'), 'searchColor')}
					{color(__('Placeholder Color', 'shapeblock'), 'searchPlaceholderColor')}
					{color(__('Icon Color', 'shapeblock'), 'searchIconColor')}
					{bg(__('Background', 'shapeblock'), 'searchBg', 'searchBgGradient')}
					{border(__('Border', 'shapeblock'), 'searchBorder')}
					{color(__('Border Color (Focus)', 'shapeblock'), 'searchBorderColorFocus')}
					{box(__('Border Radius', 'shapeblock'), 'searchRadius')}
					{single(__('Height (px)', 'shapeblock'), 'searchHeight', 80, 24)}
				</PanelBody>
			)}

			{hasHeader && (
				<PanelBody title={__('Line Below Filters', 'shapeblock')} initialOpen={false}>
					<ToggleControl label={__('Show a line', 'shapeblock')} checked={showSeparator !== false} onChange={(v) => setAttributes({ showSeparator: v })} __nextHasNoMarginBottom />
					{showSeparator !== false && (
						<>
							<SelectControl
								label={__('Line Style', 'shapeblock')}
								value={attributes.separatorStyle || 'dashed'}
								options={[
									{ label: __('Dashed', 'shapeblock'), value: 'dashed' },
									{ label: __('Solid', 'shapeblock'), value: 'solid' },
									{ label: __('Dotted', 'shapeblock'), value: 'dotted' },
									{ label: __('Double', 'shapeblock'), value: 'double' },
								]}
								onChange={(v) => setAttributes({ separatorStyle: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							{color(__('Line Color', 'shapeblock'), 'separatorColor')}
							{single(__('Line Width (px)', 'shapeblock'), 'separatorWidth', 10, 1)}
						</>
					)}
					{num(__('Space Below Filters (px)', 'shapeblock'), 'headerSpace', 120)}
				</PanelBody>
			)}

			<PanelBody title={__('Item', 'shapeblock')} initialOpen={!hasHeader}>
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{bg(__('Background', 'shapeblock'), 'itemBgHover', 'itemBgGradientHover')}
								{color(__('Border Color', 'shapeblock'), 'itemBorderColorHover')}
							</>
						) : (
							<>
								{bg(__('Background', 'shapeblock'), 'itemBg', 'itemBgGradient')}
								{border(__('Border', 'shapeblock'), 'itemBorder')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'itemRadius')}
				{respBox(__('Padding', 'shapeblock'), 'itemPadding')}
			</PanelBody>

			{showIcon !== false && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'iconColor')}
					{color(__('Color (Hover)', 'shapeblock'), 'iconColorHover')}
					{single(__('Size (px)', 'shapeblock'), 'iconSize', 64, 8)}
					{single(__('Space Between Icon and Title (px)', 'shapeblock'), 'iconSpace', 40)}
				</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{color(__('Color (Hover)', 'shapeblock'), 'titleColorHover')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Badge', 'shapeblock')} initialOpen={false}>
				<p className="components-base-control__help">{__('Add a badge to an item under Settings > Items.', 'shapeblock')}</p>
				{color(__('Text Color', 'shapeblock'), 'badgeColor')}
				{bg(__('Background', 'shapeblock'), 'badgeBg', 'badgeBgGradient')}
				{typo('badgeTypography')}
				{box(__('Padding', 'shapeblock'), 'badgePadding')}
				{box(__('Border Radius', 'shapeblock'), 'badgeRadius')}
			</PanelBody>

			<PanelBody title={__('No Results Text', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'noResultsColor')}
				{typo('noResultsTypography')}
			</PanelBody>
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
						{ name: 'advanced', title: __('Advanced', 'shapeblock') },
					]}
				>
					{(tab) =>
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						tab.name === 'advanced' ? <AdvancedControls attributes={attributes} setAttributes={setAttributes} /> :
						styleTab
					}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/filter-list" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
