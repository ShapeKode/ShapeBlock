import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="26" cy="50" r="12" fill="#a216ff" />
		<circle cx="72" cy="28" r="12" fill="#a216ff" opacity="0.6" />
		<circle cx="72" cy="72" r="12" fill="#a216ff" opacity="0.6" />
		<path d="M36 45l26-13M36 55l26 13" stroke="#a216ff" strokeWidth="4" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
