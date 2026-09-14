import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="20" width="84" height="60" rx="6" fill="#a216ff" opacity="0.25" />
		<rect x="8" y="20" width="42" height="60" rx="6" fill="#a216ff" />
		<rect x="47" y="14" width="6" height="72" rx="3" fill="#fff" stroke="#a216ff" strokeWidth="2" />
		<circle cx="50" cy="50" r="11" fill="#fff" stroke="#a216ff" strokeWidth="3" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
