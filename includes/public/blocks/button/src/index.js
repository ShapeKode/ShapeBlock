import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="34" width="80" height="32" rx="10" fill="#a216ff" />
		<rect x="26" y="47" width="34" height="6" rx="3" fill="#fff" />
		<circle cx="72" cy="50" r="5" fill="#fff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
