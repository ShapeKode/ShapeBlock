import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="44" width="84" height="14" rx="7" fill="#a216ff" opacity="0.25" />
		<rect x="8" y="44" width="52" height="14" rx="7" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
