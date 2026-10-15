/**
 * One tab of the Tabs block: its title and icon (shown in the tab bar, typed
 * there), and its content - any blocks. The Tabs block's render.php draws it.
 */
import { __ } from '@wordpress/i18n';
import { createContext, useContext } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { useBlockProps, useInnerBlocksProps, InnerBlocks, store as blockEditorStore } from '@wordpress/block-editor';

export const TAB_ITEM = 'shapeblock/tab-item';

// The tab shown in the editor, set by the Tabs block's tab bar.
export const ActiveTab = createContext(0);

function TabItemEdit({ clientId, isSelected }) {
	const active = useContext(ActiveTab);
	const { index, inTab } = useSelect(
		(select) => {
			const be = select(blockEditorStore);
			return { index: be.getBlockIndex(clientId), inTab: be.hasSelectedInnerBlock(clientId, true) };
		},
		[clientId]
	);
	const isActive = index === active;
	const props = useInnerBlocksProps(useBlockProps({ className: `shapeblock-tab-content${isActive ? ' active' : ''}` }), {
		templateLock: false,
		template: [['core/paragraph', { placeholder: __('Write the tab content, or add any block with +', 'shapeblock') }]],
		renderAppender: isSelected || inTab ? InnerBlocks.ButtonBlockAppender : false,
	});
	return <div {...props} />;
}

registerBlockType(TAB_ITEM, {
	apiVersion: 3,
	title: __('Tab', 'shapeblock'),
	category: 'shapeblock',
	parent: ['shapeblock/tab'],
	icon: (
		<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path fill="currentColor" d="M3 5h8v4h10v10H3V5zm2 2v10h14v-6H9V7H5z" />
		</svg>
	),
	supports: { inserter: false, html: false, reusable: false, customClassName: false, shapeblockExtensions: false },
	attributes: {
		tabTitle: { type: 'string', default: '' },
		iconType: { type: 'string', default: 'icon' },
		icon: { type: 'string', default: '' },
		image: { type: 'object', default: {} },
	},
	edit: TabItemEdit,
	save: () => <InnerBlocks.Content />,
});
