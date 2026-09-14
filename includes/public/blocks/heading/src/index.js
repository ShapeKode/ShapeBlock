import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="14" y="24" width="46" height="10" rx="3" fill="#a216ff" />
		<rect x="14" y="44" width="72" height="8" rx="3" fill="#a216ff" />
		<rect x="14" y="60" width="60" height="6" rx="3" fill="#a216ff" opacity="0.5" />
		<rect x="14" y="72" width="40" height="6" rx="3" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
