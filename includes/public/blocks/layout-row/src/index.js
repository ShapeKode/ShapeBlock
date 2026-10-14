import { __ } from '@wordpress/i18n';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockRowIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="9" height="14" rx="1.5" fill="#A216FF" />
        <rect x="13" y="5" width="9" height="14" rx="1.5" fill="#A216FF" opacity="0.55" />
    </svg>
);

const svg = (children) => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{children}</svg>
);

// The layout switch at the top of the sidebar, as the core Group block has
// (Row / Stack / Grid). Each is just a setting of this block, so a Row can be
// switched back and forth at any time and nothing else about it changes.
const isStack = (a) => String(a.flexDirection || '').indexOf('column') === 0;
const variations = [
    {
        name: 'row',
        title: __('Row', 'shapeblock'),
        description: __('Columns side by side.', 'shapeblock'),
        icon: svg(<path d="M4 6h6.5v12H4V6Zm9.5 0H20v12h-6.5V6Z" fill="none" stroke="currentColor" strokeWidth="1.5" />),
        attributes: { flexDirection: 'row', columnsDesktop: 0 },
        isActive: (a) => !isStack(a) && !(a.columnsDesktop > 0),
        scope: ['transform'],
    },
    {
        name: 'stack',
        title: __('Stack', 'shapeblock'),
        description: __('Columns one under another.', 'shapeblock'),
        icon: svg(<path d="M5 4h14v6.5H5V4Zm0 9.5h14V20H5v-6.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />),
        attributes: { flexDirection: 'column', columnsDesktop: 0 },
        isActive: (a) => isStack(a),
        scope: ['transform'],
    },
    {
        name: 'grid',
        title: __('Grid', 'shapeblock'),
        description: __('Columns in equal cells that wrap onto new lines (3 to a line; change it under Layout).', 'shapeblock'),
        icon: svg(<path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="none" stroke="currentColor" strokeWidth="1.5" />),
        attributes: { flexDirection: 'row', flexWrap: 'wrap', columnsDesktop: 3 },
        isActive: (a) => !isStack(a) && a.columnsDesktop > 0,
        scope: ['transform'],
    },
];

// Copies of blocks, with their own inner blocks, for a new parent.
const copy = (blocks) => blocks.map((b) => createBlock(b.name, b.attributes, copy(b.innerBlocks || [])));

// One full-width column holding the given blocks.
const rowOf = (blocks) => createBlock(metadata.name, {}, [createBlock('shapeblock/column', { width: '100%' }, blocks)]);

registerBlockType(metadata.name, {
    icon: shapeblockRowIcon,
    edit: Edit,
    save,
    variations,
    // As the core Group block: put selected blocks into a Row, turn a Group or
    // Columns block into one, and Ungroup a Row back into its blocks.
    transforms: {
        from: [
            {
                type: 'block',
                blocks: ['core/group'],
                transform: (attributes, innerBlocks) => rowOf(copy(innerBlocks)),
            },
            {
                type: 'block',
                blocks: ['core/columns'],
                transform: (attributes, innerBlocks) =>
                    createBlock(
                        metadata.name,
                        {},
                        innerBlocks.map((col) =>
                            createBlock(
                                'shapeblock/column',
                                { width: col.attributes.width || `${(100 / innerBlocks.length).toFixed(2)}%` },
                                copy(col.innerBlocks || [])
                            )
                        )
                    ),
            },
            // Last, so a Group or Columns block uses its own transform above.
            {
                type: 'block',
                isMultiBlock: true,
                blocks: ['*'],
                __experimentalConvert: (blocks) => rowOf(copy(blocks)),
            },
        ],
        ungroup: (attributes, innerBlocks) => innerBlocks.flatMap((col) => col.innerBlocks || []),
    },
});
