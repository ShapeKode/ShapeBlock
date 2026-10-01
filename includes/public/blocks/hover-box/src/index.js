import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50" cy="50" r="34" fill="#a216ff" opacity="0.18" />
		<path d="M50 16a34 34 0 0 1 0 68z" fill="#a216ff" />
		<rect x="38" y="44" width="24" height="5" rx="2.5" fill="#ffffff" />
		<rect x="42" y="54" width="16" height="4" rx="2" fill="#ffffff" opacity="0.8" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
