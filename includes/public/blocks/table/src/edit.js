import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import ServerSideRender from '../../custom-components/ServerRender';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import { TablePlaceholder, tableBlocks, emptyRows } from '../../custom-components/TableEditing';
import { NAMES, newCellAttrs } from './names';
import TableSidebar from './sidebar';

import './editor.scss';

// Tables saved before cells were blocks keep their cells in attributes: the
// body as one list where a cell with `row` starts a new row.
const rowsOf = (body) => {
	const rows = [];
	(Array.isArray(body) ? body : []).forEach((cell, i) => {
		if (0 === i || cell.row) {
			rows.push([]);
		}
		const { row, ...rest } = cell;
		rows[rows.length - 1].push({ cell: rest });
	});
	return rows;
};

export default function Edit({ attributes, setAttributes, clientId, isSelected }) {
	const { blockId } = attributes;

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

	// ---- The table: sections of rows of cells, each cell a block -------------
	const hasSections = useSelect((select) => select(blockEditorStore).getBlockCount(clientId) > 0, [clientId]);
	const { replaceInnerBlocks, __unstableMarkNextChangeAsNotPersistent } = useDispatch(blockEditorStore);
	const legacyHead = Array.isArray(attributes.tableHeader) ? attributes.tableHeader : [];
	const legacyFoot = Array.isArray(attributes.tableFooter) ? attributes.tableFooter : [];
	const legacyBody = Array.isArray(attributes.tableBody) ? attributes.tableBody : [];
	const hasLegacy = legacyHead.length > 0 || legacyBody.length > 0 || legacyFoot.length > 0;
	const isEmpty = !hasSections && !hasLegacy;

	// A table saved with its cells in attributes gets them as blocks, once.
	useEffect(() => {
		if (hasSections || !hasLegacy) {
			return;
		}
		__unstableMarkNextChangeAsNotPersistent();
		replaceInnerBlocks(
			clientId,
			tableBlocks(NAMES, [
				{ type: 'head', rows: legacyHead.length ? [legacyHead.map((cell) => ({ cell }))] : [] },
				{ type: 'body', rows: rowsOf(legacyBody) },
				{ type: 'foot', rows: legacyFoot.length ? [legacyFoot.map((cell) => ({ cell }))] : [] },
			]),
			false
		);
		__unstableMarkNextChangeAsNotPersistent();
		setAttributes({ tableHeader: [], tableBody: [], tableFooter: [] });
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// A new table has columns of equal width, so a column does not grow and
	// push the others while it is typed in.
	const createTable = (columns, count) => {
		replaceInnerBlocks(clientId, tableBlocks(NAMES, [{ type: 'body', rows: emptyRows(columns, count, newCellAttrs) }]), false);
		setAttributes({ fixedLayout: true });
	};

	// The table's own styles come from the server (colors, typography,
	// borders ...): a preview of one cell, hidden, supplies them. It does not
	// change while the text is typed, so it is not fetched again for that.
	const styleOnly = useMemo(() => {
		const { tableHeader, tableBody, tableFooter, caption, ...rest } = attributes;
		return { ...rest, tableHeader: [{ text: '' }], tableBody: [{ text: '' }], tableFooter: [{ text: '' }] };
	}, [JSON.stringify({ ...attributes, tableHeader: 0, tableBody: 0, tableFooter: 0, caption: 0 })]); // eslint-disable-line react-hooks/exhaustive-deps

	const tableProps = useInnerBlocksProps(
		{ className: attributes.fixedLayout ? 'shapeblock-table is-fixed-layout' : 'shapeblock-table' },
		{ allowedBlocks: [NAMES.section], renderAppender: false, templateLock: false }
	);

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
		// Again once a table is created in an empty block.
	}, [isEmpty]);

	const wrapClass = ['shapeblock-block', 'shapeblock-table-block-wrap', blockId].filter(Boolean).join(' ');

	return (
		<div {...useBlockProps()}>
			{!isEmpty && (
				<BlockControls>
					<AlignmentControl
						value={attributes[alignKey]}
						onChange={(value) => setAttributes({ [alignKey]: value || '' })}
					/>
				</BlockControls>
			)}
			<InspectorControls>
				<TableSidebar tableId={clientId} attributes={attributes} setAttributes={setAttributes} />
			</InspectorControls>

			{isEmpty ? (
				<TablePlaceholder onCreate={createTable} />
			) : (
				<>
					<div className={wrapClass} ref={previewRef}>
						<div className="shapeblock-table-scroll">
							<table {...tableProps} />
						</div>
						{(isSelected || !!attributes.caption) && (
							<RichText
								tagName="div"
								className="shapeblock-table-caption"
								value={attributes.caption || ''}
								onChange={(v) => setAttributes({ caption: v })}
								placeholder={__('Add caption', 'shapeblock')}
							/>
						)}
					</div>
					<div className="shapeblock-table-styles" hidden>
						<ServerSideRender block="shapeblock/table" attributes={styleOnly} httpMethod="POST" />
					</div>
				</>
			)}
		</div>
	);
}
