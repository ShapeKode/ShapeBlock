import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="18" y="14" width="64" height="72" rx="10" fill="#a216ff" opacity="0.12" />
		<circle cx="50" cy="40" r="14" fill="#a216ff" />
		<path d="M28 78c0-12 10-20 22-20s22 8 22 20z" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
