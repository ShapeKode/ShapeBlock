/**
 * The Table's sidebar, the same whether the table or one of its cells is
 * selected, as the core Table's: Settings, Layout (Default or Stripes), Style
 * (Global for the whole table, the Header's and Footer's colours, Cell for the
 * selected cell) and Advanced.
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';
import { tableBlocks, emptyRows, tableColumns } from '../../custom-components/TableEditing';
import { NAMES, newCellAttrs } from './names';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const TABLE_STYLES = [
	{ name: 'default', label: __('Default', 'shapeblock') },
	{ name: 'stripes', label: __('Stripes', 'shapeblock') },
];

/**
 * @param {Object}   props               Props.
 * @param {string}   props.tableId       The table block.
 * @param {Object}   props.attributes    The table's attributes.
 * @param {Function} props.setAttributes Sets the table's attributes.
 * @param {*}        [props.cell]        The selected cell's controls, with
 * @param {string}   [props.cellLabel]   its name ("Row 1, column 2").
 */
export default function TableSidebar({ tableId, attributes, setAttributes, cell = null, cellLabel = '' }) {
	const sections = useSelect((select) => select(blockEditorStore).getBlocks(tableId), [tableId]);
	const { insertBlock, removeBlock } = useDispatch(blockEditorStore);
	const sectionOf = (type) => sections.find((s) => (s.attributes.type || 'body') === type);

	// The header goes first, the footer last; each one row as wide as the table.
	const toggleSection = (type, on) => {
		const existing = sectionOf(type);
		if (!on) {
			if (existing) removeBlock(existing.clientId, false);
			return;
		}
		if (existing) return;
		const [section] = tableBlocks(NAMES, [{ type, rows: emptyRows(Math.max(1, tableColumns(tableId)), 1, newCellAttrs) }]);
		insertBlock(section, 'head' === type ? 0 : sections.length, tableId, false);
	};

	// Cells saved before cells held blocks can have an icon, an image or a
	// tooltip; their settings show only for a table that has them.
	const cellItems = sections.flatMap((sec) => sec.innerBlocks.flatMap((row) => row.innerBlocks.map((c) => ({ section: sec.attributes.type || 'body', item: c.attributes.cell || {} }))));
	const uses = {
		headIcons: cellItems.some(({ section, item }) => 'head' === section && item.headerIcon && item.headIcon && 'none' !== item.headIcon),
		bodyIcons: cellItems.some(({ section, item }) => 'body' === section && 'image' !== item.type && item.icon && 'none' !== item.icon),
		images: cellItems.some(({ section, item }) => 'body' === section && 'image' === item.type && item.image && item.image.url),
		tooltips: cellItems.some(({ item }) => item.tooltip && item.tooltipDesc),
	};

	// The block style (Default, Stripes): the same is-style-* class the
	// editor's Styles tab sets.
	const activeStyle = (/(?:^|\s)is-style-([a-z0-9-]+)/.exec(attributes.className || '') || [])[1] || 'default';
	const setStyle = (name) => {
		const rest = (attributes.className || '').replace(/(?:^|\s)is-style-[a-z0-9-]+/g, '').trim();
		const next = [rest, 'default' === name ? '' : `is-style-${name}`].filter(Boolean).join(' ');
		setAttributes({ className: next || undefined });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
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

	// --- Settings ---------------------------------------------------------------
	const settingsTab = (
		<PanelBody title={__('Table', 'shapeblock')} initialOpen={true}>
			<ToggleControl label={__('Header section', 'shapeblock')} checked={!!sectionOf('head')} onChange={(on) => toggleSection('head', on)} __nextHasNoMarginBottom />
			<ToggleControl label={__('Footer section', 'shapeblock')} checked={!!sectionOf('foot')} onChange={(on) => toggleSection('foot', on)} __nextHasNoMarginBottom />
			<ToggleControl label={__('Fixed width table cells', 'shapeblock')} checked={!!attributes.fixedLayout} onChange={(v) => setAttributes({ fixedLayout: v })} __nextHasNoMarginBottom />
			<p className="components-base-control__help">
				{__('Click a cell to type in it, or click its + to add text, an image or an icon list. Rows and columns are added and removed from the Edit table button in the toolbar.', 'shapeblock')}
			</p>
		</PanelBody>
	);

	// --- Layout: Default or Stripes ------------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
			<div className="shapeblock-table-style-picker">
				{TABLE_STYLES.map((st) => (
					<button
						type="button"
						key={st.name}
						className={`shapeblock-table-style-option is-${st.name}${activeStyle === st.name ? ' is-active' : ''}`}
						aria-pressed={activeStyle === st.name}
						onClick={() => setStyle(st.name)}
					>
						<span className="shapeblock-table-style-thumb" aria-hidden="true">
							<span />
							<span />
							<span />
							<span />
						</span>
						<span className="shapeblock-table-style-label">{st.label}</span>
					</button>
				))}
			</div>
			{'stripes' === activeStyle && bg(__('Stripe Color', 'shapeblock'), 'stripedBgColor', 'stripedBgColorGradient')}
			{/* Stripes on a table saved before the Stripes layout. */}
			{'stripes' !== activeStyle && attributes.stripedBg && (
				<>
					<ToggleControl label={__('Striped Background', 'shapeblock')} checked={attributes.stripedBg} onChange={(v) => setAttributes({ stripedBg: v })} __nextHasNoMarginBottom />
					{bg(__('Stripe Color', 'shapeblock'), 'stripedBgColor', 'stripedBgColorGradient')}
				</>
			)}
		</PanelBody>
	);

	// --- Style: the whole table, then the selected cell ------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Global', 'shapeblock')} initialOpen={true}>
				<p className="components-base-control__help">
					{__('For every cell of the table. A cell can have its own: click it and use Cell below.', 'shapeblock')}
				</p>
				{color(__('Text Color', 'shapeblock'), 'textColor')}
				{bg(__('Background', 'shapeblock'), 'bgColor', 'bgGradient')}
				{border(__('Cell Border', 'shapeblock'), 'cellBorder')}
				{/* A border round the body, set on tables before Cell Border. */}
				{!!(attributes.tableBorder && parseInt(attributes.tableBorder.width, 10)) && border(__('Body Outline', 'shapeblock'), 'tableBorder')}
				{respTypo(__('Typography', 'shapeblock'), 'tableTypography')}
				{respBox(__('Cell Padding', 'shapeblock'), 'tablePadding')}
				{box(__('Border Radius', 'shapeblock'), 'tableRadius')}
				{/* Margin is in Advanced; a table saved with its own margin keeps it here. */}
				{['', 'Tablet', 'Mobile'].some((d) => Object.values(attributes['tableMargin' + d] || {}).some((v) => '' !== v && undefined !== v)) && respBox(__('Margin', 'shapeblock'), 'tableMargin')}
				{/* Icons, images and tooltips of cells saved before cells held blocks. */}
				{uses.headIcons && (
					<>
						<Divider />
						{color(__('Header Icon Color', 'shapeblock'), 'headerIconColor')}
						{respNum(__('Header Icon Size (px)', 'shapeblock'), 'headerIconSize')}
						{num(__('Header Icon Vertical Position (px)', 'shapeblock'), 'headerIconYPos')}
						{box(__('Header Icon Margin', 'shapeblock'), 'headerIconMargin')}
					</>
				)}
				{uses.bodyIcons && (
					<>
						<Divider />
						{color(__('Icon Color', 'shapeblock'), 'bodyIconColor')}
						{respNum(__('Icon Size (px)', 'shapeblock'), 'bodyIconSize')}
						{respBox(__('Icon Margin', 'shapeblock'), 'bodyIconGap')}
					</>
				)}
				{uses.tooltips && (
					<>
						<Divider />
						{respAlign(__('Tooltip Align', 'shapeblock'), 'tooltipAlign', [{ label: __('Left', 'shapeblock'), value: 'left' }, { label: __('Top', 'shapeblock'), value: 'top' }, { label: __('Right', 'shapeblock'), value: 'right' }, { label: __('Bottom', 'shapeblock'), value: 'bottom' }])}
						{color(__('Tooltip Icon Color', 'shapeblock'), 'tooltipIconColor')}
						{respNum(__('Tooltip Icon Size (px)', 'shapeblock'), 'tooltipIconSize')}
						{box(__('Tooltip Icon Margin', 'shapeblock'), 'tooltipIconMargin')}
					</>
				)}
				{uses.images && (
					<>
						<Divider />
						{respNum(__('Image Size (px)', 'shapeblock'), 'imgSize')}
						{box(__('Image Border Radius', 'shapeblock'), 'imgRadius')}
					</>
				)}
			</PanelBody>

			{sectionOf('head') && (
				<PanelBody title={__('Header', 'shapeblock')} initialOpen={false}>
					{color(__('Text Color', 'shapeblock'), 'headerTextColor')}
					{bg(__('Background', 'shapeblock'), 'headerBgColor', 'headerBgColorGradient')}
				</PanelBody>
			)}

			{sectionOf('foot') && (
				<PanelBody title={__('Footer', 'shapeblock')} initialOpen={false}>
					{color(__('Text Color', 'shapeblock'), 'footerTextColor')}
					{bg(__('Background', 'shapeblock'), 'footerBgColor', 'footerBgColorGradient')}
				</PanelBody>
			)}

			<PanelBody title={cell ? `${__('Cell', 'shapeblock')}: ${cellLabel}` : __('Cell', 'shapeblock')} initialOpen={true}>
				{cell || <p className="components-base-control__help">{__('Click a cell in the table to give it its own text colour, background and border.', 'shapeblock')}</p>}
			</PanelBody>

		</>
	);

	return (
		<TabPanel
			className="shapeblock-inspector-tabs"
			activeClass="is-active"
			// A clicked cell opens on its style.
			initialTabName={cell ? 'style' : 'settings'}
			tabs={[
				{ name: 'settings', title: __('Settings', 'shapeblock') },
				{ name: 'layout', title: __('Layout', 'shapeblock') },
				{ name: 'style', title: __('Style', 'shapeblock') },
				{ name: 'advanced', title: __('Advanced', 'shapeblock') },
			]}
		>
			{(tab) => (
				tab.name === 'settings' ? settingsTab :
				tab.name === 'layout' ? layoutTab :
				tab.name === 'advanced' ? <AdvancedControls attributes={attributes} setAttributes={setAttributes} /> :
				styleTab
			)}
		</TabPanel>
	);
}
