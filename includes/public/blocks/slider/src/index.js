import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="22" y="20" width="56" height="48" rx="6" fill="#a216ff" />
		<rect x="6" y="30" width="10" height="28" rx="4" fill="#a216ff" opacity="0.45" />
		<rect x="84" y="30" width="10" height="28" rx="4" fill="#a216ff" opacity="0.45" />
		<circle cx="38" cy="82" r="5" fill="#a216ff" opacity="0.45" />
		<circle cx="50" cy="82" r="5" fill="#a216ff" />
		<circle cx="62" cy="82" r="5" fill="#a216ff" opacity="0.45" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
