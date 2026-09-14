import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="34" width="18" height="26" rx="4" fill="#a216ff" />
		<rect x="30" y="34" width="18" height="26" rx="4" fill="#a216ff" opacity="0.6" />
		<rect x="52" y="34" width="18" height="26" rx="4" fill="#a216ff" opacity="0.6" />
		<rect x="74" y="34" width="18" height="26" rx="4" fill="#a216ff" opacity="0.6" />
		<rect x="14" y="68" width="72" height="6" rx="3" fill="#a216ff" opacity="0.35" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
