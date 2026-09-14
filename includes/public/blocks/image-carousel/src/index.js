import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="34" y="22" width="32" height="56" rx="6" fill="#a216ff" />
		<rect x="4" y="32" width="24" height="36" rx="6" fill="#a216ff" opacity="0.45" />
		<rect x="72" y="32" width="24" height="36" rx="6" fill="#a216ff" opacity="0.45" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
