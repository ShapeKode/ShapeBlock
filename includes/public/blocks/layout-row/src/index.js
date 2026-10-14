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

// Copies of blocks, with their own inner blocks, for a new parent.
const copy = (blocks) => blocks.map((b) => createBlock(b.name, b.attributes, copy(b.innerBlocks || [])));

// A Row with each block in a column of its own, sharing the line equally - as
// the core Group's Row puts its blocks side by side.
const rowOf = (blocks) => {
    const width = `${(100 / Math.max(1, blocks.length)).toFixed(2)}%`;
    return createBlock(metadata.name, {}, blocks.map((b) => createBlock('shapeblock/column', { width }, [b])));
};

registerBlockType(metadata.name, {
    icon: shapeblockRowIcon,
    edit: Edit,
    save,
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
