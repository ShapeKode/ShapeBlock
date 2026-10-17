/**
 * Editing a table in the canvas, as the core Table block does: a form to
 * create one, and a toolbar menu to insert and delete rows and columns around
 * the cell being edited.
 *
 * A table is a tree of blocks: table > section (thead / tbody / tfoot) > row
 * > cell, and a cell holds the blocks put in it. Used by the Table block, with its
 * own block names.
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { BlockControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarDropdownMenu, Placeholder, TextControl, Button } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useSelect, select, dispatch } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';

const svg = (d) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={d} fill="currentColor" />
	</svg>
);

export const ICON_TABLE = svg('M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 1.5V10h6.25V6.5H5zm7.75 0V10H19V6.5h-6.25zM5 11.5V17.5h6.25v-6H5zm7.75 0v6H19v-6h-6.25z');
const ICON_ROW_BEFORE = svg('M4 13h16v6H4v-6zm1.5 1.5v3h13v-3h-13zM11.25 4h1.5v2.25H15v1.5h-2.25V10h-1.5V7.75H9v-1.5h2.25V4z');
const ICON_ROW_AFTER = svg('M4 5h16v6H4V5zm1.5 1.5v3h13v-3h-13zM11.25 14h1.5v2.25H15v1.5h-2.25V20h-1.5v-2.25H9v-1.5h2.25V14z');
const ICON_ROW_DELETE = svg('M4 6h16v6H4V6zm1.5 1.5v3h13v-3h-13zM8 16h8v1.5H8z');
const ICON_COL_BEFORE = svg('M13 4h6v16h-6V4zm1.5 1.5v13h3v-13h-3zM4 11.25h2.25V9h1.5v2.25H10v1.5H7.75V15h-1.5v-2.25H4v-1.5z');
const ICON_COL_AFTER = svg('M5 4h6v16H5V4zm1.5 1.5v13h3v-13h-3zM14 11.25h2.25V9h1.5v2.25H20v1.5h-2.25V15h-1.5v-2.25H14v-1.5z');
const ICON_COL_DELETE = svg('M11 4h6v16h-6V4zm1.5 1.5v13h3v-13h-3zM4 11.25h5v1.5H4z');

/**
 * The form an empty table starts with: how many columns and rows.
 *
 * @param {Object}   props          Props.
 * @param {Function} props.onCreate ( columns, rows ) => void.
 * @param {*}        [props.extra]  More, under the form (an import button).
 */
export function TablePlaceholder({ onCreate, extra = null }) {
	const [columns, setColumns] = useState(2);
	const [rows, setRows] = useState(2);
	const clamp = (v) => Math.max(1, Math.min(30, parseInt(v, 10) || 1));
	return (
		<Placeholder icon={ICON_TABLE} label={__('Table', 'shapeblock')} instructions={__('Insert a table for sharing data.', 'shapeblock')}>
			<form
				className="shapeblock-table-placeholder"
				onSubmit={(e) => {
					e.preventDefault();
					onCreate(clamp(columns), clamp(rows));
				}}
			>
				<TextControl type="number" label={__('Column count', 'shapeblock')} value={columns} min={1} max={30} onChange={setColumns} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl type="number" label={__('Row count', 'shapeblock')} value={rows} min={1} max={30} onChange={setRows} __next40pxDefaultSize __nextHasNoMarginBottom />
				<Button variant="primary" type="submit" __next40pxDefaultSize>
					{__('Create Table', 'shapeblock')}
				</Button>
			</form>
			{extra}
		</Placeholder>
	);
}

// A border setting as CSS, as Helper::border_to_css_props() writes it.
const unit = (v) => (/^-?[0-9.]+$/.test(String(v ?? 0)) ? `${v || 0}px` : v);
// A table border with no colour picked is a light grey (as render.php draws it).
export const BORDER_GREY = '#dcdcde';
export const borderStyle = (b) => {
	if (!b || 'object' !== typeof b) return {};
	const style = b.style || 'solid';
	const color = b.color || BORDER_GREY;
	if (b.width && 'object' === typeof b.width) {
		const w = ['top', 'right', 'bottom', 'left'].map((k) => unit(b.width[k]));
		return w.every((v) => 0 === parseInt(v, 10)) ? {} : { borderStyle: style, borderColor: color, borderWidth: w.join(' ') };
	}
	return parseInt(b.width, 10) ? { border: `${unit(b.width)} ${style} ${color}` } : {};
};

/**
 * A click anywhere in a cell - not only on its text - puts the cursor at the
 * end of the text, so typing starts there.
 *
 * @param {Object} ref The text element's ref.
 * @return {Function} The cell's click handler.
 */
export const typeOnClick = (ref) => (e) => {
	const el = ref.current;
	if (!el || e.target !== e.currentTarget) {
		return;
	}
	el.focus();
	const range = el.ownerDocument.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	const selection = el.ownerDocument.defaultView.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
};

// ---------------------------------------------------------------------------
// The block tree.
// ---------------------------------------------------------------------------

/**
 * Blocks for a table: sections of rows of cells.
 *
 * @param {Object}   names        { section, row, cell } block names.
 * @param {Array}    sections     [ { type, rows: [ [ cellAttributes, ... ], ... ] } ].
 * @return {Array} Section blocks.
 */
export const tableBlocks = (names, sections) =>
	sections
		.filter((s) => s.rows.length)
		.map((s) => createBlock(names.section, { type: s.type }, s.rows.map((row) => createBlock(names.row, {}, row.map((attrs) => createBlock(names.cell, attrs))))));

/**
 * An empty grid of new cells, as rows of cell attributes.
 *
 * @param {number}   columns   Columns.
 * @param {number}   count     Rows.
 * @param {Function} cellAttrs () => a new cell's attributes.
 */
export const emptyRows = (columns, count, cellAttrs) => Array.from({ length: count }, () => Array.from({ length: columns }, () => cellAttrs()));

// The widest row of a table, in cells.
export const tableColumns = (tableId) => {
	const be = select(blockEditorStore);
	let most = 0;
	be.getBlockOrder(tableId).forEach((sectionId) => be.getBlockOrder(sectionId).forEach((rowId) => (most = Math.max(most, be.getBlockCount(rowId)))));
	return most;
};

// Where a cell sits: its row, section, table, column and row index.
const locate = (cellId) => {
	const be = select(blockEditorStore);
	const rowId = be.getBlockRootClientId(cellId);
	const sectionId = rowId ? be.getBlockRootClientId(rowId) : null;
	const tableId = sectionId ? be.getBlockRootClientId(sectionId) : null;
	return {
		rowId,
		sectionId,
		tableId,
		type: sectionId ? be.getBlockAttributes(sectionId)?.type || 'body' : 'body',
		col: be.getBlockIndex(cellId),
		row: rowId ? be.getBlockIndex(rowId) : 0,
	};
};

/**
 * The "Edit table" menu, shown in the toolbar of a cell and of every block in
 * a cell - so it is there while typing in a table, as in core.
 *
 * @param {Object}   config            Config.
 * @param {string}   config.namespace  Filter namespace.
 * @param {Object}   config.names      { section, row, cell } block names.
 * @param {Function} config.cellAttrs  ( sectionType ) => a new cell's attributes.
 * @param {Function} [config.onColumn] ( tableId, at, added ) => void, after a column is added or removed.
 */
export function registerTableToolbar({ namespace, names, cellAttrs, onColumn }) {
	const newCell = (type) => createBlock(names.cell, cellAttrs(type));

	const insertRow = (cellId, offset) => {
		const be = select(blockEditorStore);
		const { insertBlock, selectBlock } = dispatch(blockEditorStore);
		const at = locate(cellId);
		const cells = Math.max(1, be.getBlockCount(at.rowId));
		const row = createBlock(names.row, {}, Array.from({ length: cells }, () => newCell('body')));
		if ('body' === at.type) {
			insertBlock(row, at.row + offset, at.sectionId, false);
		} else {
			// From the header a row goes first in the body, from the footer last.
			const bodyId = be.getBlockOrder(at.tableId).find((id) => 'body' === (be.getBlockAttributes(id)?.type || 'body'));
			if (bodyId) {
				insertBlock(row, 'head' === at.type ? 0 : be.getBlockCount(bodyId), bodyId, false);
			} else {
				const sectionIndex = be.getBlockIndex(at.sectionId);
				insertBlock(createBlock(names.section, { type: 'body' }, [row]), 'head' === at.type ? sectionIndex + 1 : sectionIndex, at.tableId, false);
			}
		}
		selectBlock(row.innerBlocks[Math.min(at.col, cells - 1)].clientId);
	};

	const deleteRow = (cellId) => {
		const be = select(blockEditorStore);
		const { removeBlock, selectBlock } = dispatch(blockEditorStore);
		const at = locate(cellId);
		const rows = be.getBlockOrder(at.sectionId);
		// The row that takes its place is selected, or the table.
		const nextRow = rows.length > 1 ? rows[at.row + 1 < rows.length ? at.row + 1 : at.row - 1] : null;
		const nextCells = nextRow ? be.getBlockOrder(nextRow) : [];
		removeBlock(rows.length > 1 ? at.rowId : at.sectionId, false);
		selectBlock(nextCells.length ? nextCells[Math.min(at.col, nextCells.length - 1)] : at.tableId);
	};

	const insertColumn = (cellId, offset) => {
		const be = select(blockEditorStore);
		const { insertBlock, selectBlock } = dispatch(blockEditorStore);
		const at = locate(cellId);
		const col = at.col + offset;
		let mine = null;
		be.getBlockOrder(at.tableId).forEach((sectionId) => {
			const type = be.getBlockAttributes(sectionId)?.type || 'body';
			be.getBlockOrder(sectionId).forEach((rowId) => {
				const cell = newCell(type);
				insertBlock(cell, Math.min(col, be.getBlockCount(rowId)), rowId, false);
				if (rowId === at.rowId) {
					mine = cell.clientId;
				}
			});
		});
		if (onColumn) {
			onColumn(at.tableId, col, true);
		}
		if (mine) {
			selectBlock(mine);
		}
	};

	const deleteColumn = (cellId) => {
		const be = select(blockEditorStore);
		const { removeBlocks, selectBlock } = dispatch(blockEditorStore);
		const at = locate(cellId);
		const gone = [];
		be.getBlockOrder(at.tableId).forEach((sectionId) => {
			const rows = be.getBlockOrder(sectionId);
			// A row left with no cell goes too, and a section with no row.
			const emptied = rows.filter((rowId) => {
				const cells = be.getBlockOrder(rowId);
				return cells.length <= 1 && at.col < cells.length;
			});
			if (rows.length && emptied.length === rows.length) {
				gone.push(sectionId);
				return;
			}
			rows.forEach((rowId) => {
				const cells = be.getBlockOrder(rowId);
				if (emptied.includes(rowId)) {
					gone.push(rowId);
				} else if (cells[at.col]) {
					gone.push(cells[at.col]);
				}
			});
		});
		const cells = be.getBlockOrder(at.rowId);
		const next = cells.length > 1 ? cells[at.col + 1 < cells.length ? at.col + 1 : at.col - 1] : null;
		removeBlocks(gone, false);
		if (onColumn) {
			onColumn(at.tableId, at.col, false);
		}
		selectBlock(next || at.tableId);
	};

	const CellToolbar = ({ clientId, name }) => {
		const cellId = useSelect(
			(s) => (name === names.cell ? clientId : s(blockEditorStore).getBlockParentsByBlockName(clientId, names.cell, true)[0] || null),
			[clientId, name]
		);
		const canAddRowBefore = useSelect((s) => {
			if (!cellId) return false;
			const rowId = s(blockEditorStore).getBlockRootClientId(cellId);
			const sectionId = rowId ? s(blockEditorStore).getBlockRootClientId(rowId) : null;
			// A row cannot go above the header.
			return 'head' !== (sectionId ? s(blockEditorStore).getBlockAttributes(sectionId)?.type : '');
		}, [cellId]);
		if (!cellId) {
			return null;
		}
		return (
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon={ICON_TABLE}
						label={__('Edit table', 'shapeblock')}
						controls={[
							{ icon: ICON_ROW_BEFORE, title: __('Insert row before', 'shapeblock'), isDisabled: !canAddRowBefore, onClick: () => insertRow(cellId, 0) },
							{ icon: ICON_ROW_AFTER, title: __('Insert row after', 'shapeblock'), onClick: () => insertRow(cellId, 1) },
							{ icon: ICON_ROW_DELETE, title: __('Delete row', 'shapeblock'), onClick: () => deleteRow(cellId) },
							{ icon: ICON_COL_BEFORE, title: __('Insert column before', 'shapeblock'), onClick: () => insertColumn(cellId, 0) },
							{ icon: ICON_COL_AFTER, title: __('Insert column after', 'shapeblock'), onClick: () => insertColumn(cellId, 1) },
							{ icon: ICON_COL_DELETE, title: __('Delete column', 'shapeblock'), onClick: () => deleteColumn(cellId) },
						]}
					/>
				</ToolbarGroup>
			</BlockControls>
		);
	};

	addFilter(
		'editor.BlockEdit',
		namespace,
		createHigherOrderComponent(
			(BlockEdit) => (props) => (
				<>
					<BlockEdit {...props} />
					{props.isSelected && <CellToolbar clientId={props.clientId} name={props.name} />}
				</>
			),
			'withTableToolbar'
		)
	);
}
