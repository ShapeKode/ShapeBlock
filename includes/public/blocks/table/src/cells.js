/**
 * The Table's own child blocks: a section (thead / tbody / tfoot), a row and a
 * cell. A cell holds its text and the blocks put in it - text, images and
 * icon lists - with its own colours and border; a cell saved before may also
 * have an icon, an image or a tooltip, still shown. They are rendered by the table's
 * render.php, so they have no render of their own.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToggleControl, TextControl, SelectControl, BoxControl } from '@wordpress/components';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import { registerTableToolbar, typeOnClick, borderStyle, ICON_TABLE } from '../../custom-components/TableEditing';
import BorderControl from '../../custom-components/BorderControl';
import IconPicker from '../../custom-components/IconPicker';
import { NAMES, newCellAttrs } from './names';
import TableSidebar from './sidebar';

// What a cell takes: text, images and icon lists.
const CELL_BLOCKS = ['core/paragraph', 'core/heading', 'core/image', 'shapeblock/icon-list'];


// A cell's own style, as render.php writes it from its settings.
const cellStyle = (item) => {
	if (!item.advance) {
		return undefined;
	}
	const s = {};
	if (item.width) s.width = /^[0-9.]+$/.test(String(item.width)) ? `${item.width}px` : item.width;
	if (!item.dataFlex && item.align) s.textAlign = item.align;
	if (item.verticalAlign) s.verticalAlign = item.verticalAlign;
	if (item.decoration) s.textDecoration = item.decoration;
	if (item.bgGradient) s.background = item.bgGradient;
	else if (item.bgColor) s.backgroundColor = item.bgColor;
	if (item.textColor) s.color = item.textColor;
	Object.assign(s, borderStyle(item.border));
	if (item.dataFlex) {
		if (item.flexAlign) s.justifyContent = item.flexAlign;
		if ('' !== (item.flexGap ?? '')) s.gap = /^[0-9.]+$/.test(String(item.flexGap)) ? `${item.flexGap}px` : item.flexGap;
	}
	return s;
};
const span = (item, key) => (item.advance && item[key] && '' !== (item[`${key}Number`] ?? '') ? parseInt(item[`${key}Number`], 10) || undefined : undefined);

const Icon = ({ name }) => (name && 'none' !== name ? <i className={`shapeblock-icon ${name}`} aria-hidden="true" /> : null);

const TOOLTIP_SVG = (
	<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-3.6h-2c0-2 2.5-2.2 2.5-3.9A1.5 1.5 0 0012 8a1.6 1.6 0 00-1.6 1.5H8.4A3.6 3.6 0 0112 6a3.5 3.5 0 013.5 3.5c0 2-2.5 2.3-2.5 3.9z" /></svg>
);

const SECTION_TAGS = { head: ['thead', 'shapeblock-table-header'], body: ['tbody', 'shapeblock-table-body'], foot: ['tfoot', 'shapeblock-table-footer'] };

function SectionEdit({ attributes }) {
	const [Tag, className] = SECTION_TAGS[attributes.type] || SECTION_TAGS.body;
	const props = useInnerBlocksProps(useBlockProps({ className }), { allowedBlocks: [NAMES.row], renderAppender: false, templateLock: false });
	return <Tag {...props} />;
}

function RowEdit() {
	const props = useInnerBlocksProps(useBlockProps(), { allowedBlocks: [NAMES.cell], renderAppender: false, templateLock: false, orientation: 'horizontal' });
	return <tr {...props} />;
}

// The look of the table's tooltips (the same for every cell), shown under a
// cell's Tooltip switch as soon as it is on.
const deviceKey = (base, device) => ('desktop' === device ? base : base + device.charAt(0).toUpperCase() + device.slice(1));
function TooltipStyle({ attributes, setAttributes }) {
	const set = (key) => (v) => setAttributes({ [key]: v });
	return (
		<div className="shapeblock-tbl-tooltip-style">
			<p className="components-base-control__help">{__('The look of every tooltip in this table:', 'shapeblock')}</p>
			<ResponsiveWrapper label={__('Tooltip Position', 'shapeblock')}>
				{(device) => {
					const k = deviceKey('tooltipAlign', device);
					return (
						<SelectControl
							value={attributes[k] || ('desktop' === device ? 'top' : '')}
							options={[
								...('desktop' === device ? [] : [{ label: __('Same as desktop', 'shapeblock'), value: '' }]),
								{ label: __('Top', 'shapeblock'), value: 'top' },
								{ label: __('Bottom', 'shapeblock'), value: 'bottom' },
								{ label: __('Left', 'shapeblock'), value: 'left' },
								{ label: __('Right', 'shapeblock'), value: 'right' },
							]}
							onChange={set(k)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					);
				}}
			</ResponsiveWrapper>
			<ColorPopover label={__('Icon Color', 'shapeblock')} color={attributes.tooltipIconColor || ''} onChange={(v) => setAttributes({ tooltipIconColor: v || '' })} />
			<ResponsiveWrapper label={__('Icon Size (px)', 'shapeblock')}>
				{(device) => {
					const k = deviceKey('tooltipIconSize', device);
					return <TextControl type="number" value={attributes[k] || ''} onChange={set(k)} __next40pxDefaultSize __nextHasNoMarginBottom />;
				}}
			</ResponsiveWrapper>
			<BoxControl label={__('Icon Margin', 'shapeblock')} values={attributes.tooltipIconMargin} onChange={set('tooltipIconMargin')} />
			<ColorPopover label={__('Tooltip Background', 'shapeblock')} color={attributes.tooltipBg || ''} onChange={(v) => setAttributes({ tooltipBg: v || '' })} />
			<ColorPopover label={__('Tooltip Text Color', 'shapeblock')} color={attributes.tooltipTextColor || ''} onChange={(v) => setAttributes({ tooltipTextColor: v || '' })} />
		</div>
	);
}

function CellEdit({ attributes, setAttributes, clientId, context, isSelected }) {
	const section = context['shapeblock/tableSection'] || 'body';
	const item = attributes.cell && 'object' === typeof attributes.cell ? attributes.cell : {};

	// BackgroundControl clears the other field with a second call in the same
	// tick, before this render's attributes update - so edits build on the latest.
	const latest = useRef(item);
	latest.current = item;
	const update = (key, val) => {
		latest.current = { ...latest.current, [key]: val };
		setAttributes({ cell: latest.current });
	};

	const { inCell, hasBlocks, row, col, tableId, tableAttributes } = useSelect(
		(select) => {
			const be = select(blockEditorStore);
			const rowId = be.getBlockRootClientId(clientId);
			const table = be.getBlockParentsByBlockName(clientId, NAMES.table, true)[0] || null;
			return {
				inCell: be.hasSelectedInnerBlock(clientId, true),
				hasBlocks: be.getBlockCount(clientId) > 0,
				row: rowId ? be.getBlockIndex(rowId) : 0,
				col: be.getBlockIndex(clientId),
				tableId: table,
				tableAttributes: table ? be.getBlockAttributes(table) : null,
			};
		},
		[clientId]
	);
	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	const Tag = 'body' === section ? 'td' : 'th';
	const base = 'head' === section ? 'shapeblock-th' : 'foot' === section ? 'shapeblock-tf' : 'shapeblock-td';
	const textRef = useRef();
	const blockProps = useBlockProps({
		onClick: typeOnClick(textRef),
		className: [base, 'body' === section && item.dataFlex ? 'shapeblock-data-flex' : ''].filter(Boolean).join(' '),
		colSpan: span(item, 'colspan'),
		rowSpan: 'body' === section ? span(item, 'rowspan') : undefined,
		style: cellStyle(item),
	});
	// Clicked, a cell shows a + to add a block to it.
	const { children, ...cellProps } = useInnerBlocksProps(blockProps, {
		allowedBlocks: CELL_BLOCKS,
		templateLock: false,
		renderAppender: isSelected || inCell ? InnerBlocks.ButtonBlockAppender : false,
	});

	const label =
		'head' === section
			? sprintf(/* translators: %d: column number. */ __('Header, column %d', 'shapeblock'), col + 1)
			: 'foot' === section
				? sprintf(/* translators: %d: column number. */ __('Footer, column %d', 'shapeblock'), col + 1)
				: sprintf(/* translators: 1: row number, 2: column number. */ __('Row %1$d, column %2$d', 'shapeblock'), row + 1, col + 1);

	// A cell's colours and border. Setting them turns on the cell's own
	// styles (its "advance" settings), which render.php writes on the cell.
	const setStyle = (key, val) => {
		latest.current = { ...latest.current, advance: true, [key]: val };
		setAttributes({ cell: latest.current });
	};

	const iconColor = item.advance && item.iconColor ? { color: item.iconColor } : undefined;

	return (
		<>
			{/* The table's sidebar, its Cell panel for this cell. */}
			{tableId && tableAttributes && (
				<InspectorControls>
					<TableSidebar
						tableId={tableId}
						attributes={tableAttributes}
						setAttributes={(next) => updateBlockAttributes(tableId, next)}
						cellLabel={label}
						cell={
							<>
								<ColorPopover label={__('Text Color', 'shapeblock')} color={item.textColor || ''} onChange={(v) => setStyle('textColor', v || '')} />
								<BackgroundControl
									label={__('Background', 'shapeblock')}
									colorValue={item.bgColor || ''}
									gradientValue={item.bgGradient || ''}
									onColorChange={(v) => setStyle('bgColor', (v && typeof v === 'object' ? v.hex : v) || '')}
									onGradientChange={(v) => setStyle('bgGradient', v || '')}
								/>
								<BorderControl label={__('Border', 'shapeblock')} value={item.border} onChange={(v) => setStyle('border', v)} />
								<ToggleControl label={__('Tooltip', 'shapeblock')} checked={!!item.tooltip} onChange={(v) => update('tooltip', v)} __nextHasNoMarginBottom />
								{item.tooltip && (
									<>
										<TextControl label={__('Tooltip Text', 'shapeblock')} value={item.tooltipDesc || ''} onChange={(v) => update('tooltipDesc', v)} help={__('Shown when the icon after the cell text is hovered.', 'shapeblock')} __next40pxDefaultSize __nextHasNoMarginBottom />
										<IconPicker label={__('Tooltip Icon', 'shapeblock')} value={item.tooltipIcon || ''} onChange={(v) => update('tooltipIcon', v)} />
										<TooltipStyle attributes={tableAttributes} setAttributes={(next) => updateBlockAttributes(tableId, next)} />
									</>
								)}
							</>
						}
					/>
				</InspectorControls>
			)}
			<Tag {...cellProps}>
				{'head' === section && item.headerIcon && item.headIcon && <span className="shapeblock-header-icon"><Icon name={item.headIcon} /></span>}
				{'body' === section && 'image' === item.type && item.image?.url && <img src={item.image.url} className="shapeblock-table-image" alt={item.image.alt || ''} />}
				{'body' === section && 'image' !== item.type && item.icon && 'none' !== item.icon && <span className="shapeblock-table-icon" style={iconColor}><Icon name={item.icon} /></span>}
				{/* The cell's own text line; a cell holding blocks shows it only when it has text. */}
				{(!hasBlocks || item.text) && <RichText
					ref={textRef}
					tagName="span"
					className="shapeblock-tbl-cell-text"
					value={item.text || ''}
					onChange={(v) => update('text', v)}
					placeholder={'head' === section ? __('Header text', 'shapeblock') : 'foot' === section ? __('Footer text', 'shapeblock') : __('Add text here', 'shapeblock')}
				/>}
				{children}
				{item.tooltip && item.tooltipDesc && (
					<span className="shapeblock-tbl-tooltip" data-placement={context['shapeblock/tableTooltipAlign'] || 'top'}>
						{item.tooltipIcon && 'none' !== item.tooltipIcon ? <Icon name={item.tooltipIcon} /> : TOOLTIP_SVG}
						<span className="shapeblock-tbl-tooltip-content">{item.tooltipDesc}</span>
					</span>
				)}
			</Tag>
		</>
	);
}

// Only the blocks inside are saved; the table's render.php draws the rest.
const save = () => <InnerBlocks.Content />;
const common = { apiVersion: 3, category: 'shapeblock', textdomain: 'shapeblock', icon: ICON_TABLE, supports: { inserter: false, html: false, reusable: false, customClassName: false, shapeblockExtensions: false }, save };

registerBlockType(NAMES.section, {
	...common,
	title: __('Table Section', 'shapeblock'),
	// The List View and breadcrumb name each section for what it is.
	__experimentalLabel: ({ type }) => ('head' === type ? __('Header', 'shapeblock') : 'foot' === type ? __('Footer', 'shapeblock') : __('Body', 'shapeblock')),
	parent: [NAMES.table],
	attributes: { type: { type: 'string', default: 'body' } },
	providesContext: { 'shapeblock/tableSection': 'type' },
	edit: SectionEdit,
});

registerBlockType(NAMES.row, {
	...common,
	title: __('Table Row', 'shapeblock'),
	parent: [NAMES.section],
	edit: RowEdit,
});

registerBlockType(NAMES.cell, {
	...common,
	title: __('Table Cell', 'shapeblock'),
	parent: [NAMES.row],
	attributes: { cell: { type: 'object', default: {} } },
	usesContext: ['shapeblock/tableSection', 'shapeblock/tableTooltipAlign'],
	edit: CellEdit,
});

registerTableToolbar({ namespace: 'shapeblock/table-toolbar', names: NAMES, cellAttrs: newCellAttrs });
