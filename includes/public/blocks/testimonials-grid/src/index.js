import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="22" width="80" height="40" rx="8" fill="#a216ff" opacity="0.14" />
		<path d="M30 40h12v10H30zM58 40h12v10H58z" fill="#a216ff" />
		<circle cx="34" cy="74" r="6" fill="#a216ff" />
		<rect x="44" y="71" width="30" height="6" rx="3" fill="#a216ff" opacity="0.6" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
