import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="6" y="16" width="26" height="14" rx="3" fill="#a216ff" />
		<rect x="37" y="16" width="26" height="14" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="68" y="16" width="26" height="14" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="6" y="38" width="88" height="46" rx="6" fill="#a216ff" opacity="0.18" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
