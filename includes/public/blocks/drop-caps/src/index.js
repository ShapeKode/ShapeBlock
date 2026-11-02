import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="14" width="34" height="38" rx="6" fill="#a216ff" />
		<path d="M18 44V22h7c5 0 8 4 8 11s-3 11-8 11z" fill="#fff" />
		<rect x="50" y="16" width="42" height="6" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="50" y="30" width="42" height="6" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="50" y="44" width="42" height="6" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="8" y="60" width="84" height="6" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="8" y="74" width="64" height="6" rx="3" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
