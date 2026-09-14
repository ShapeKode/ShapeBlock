import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="22" cy="50" r="13" fill="#a216ff" />
		<circle cx="50" cy="50" r="13" fill="#a216ff" opacity="0.6" />
		<circle cx="78" cy="50" r="13" fill="#a216ff" opacity="0.6" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
