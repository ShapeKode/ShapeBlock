import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="14" y="26" width="72" height="7" rx="3" fill="#a216ff" />
		<rect x="14" y="41" width="72" height="7" rx="3" fill="#a216ff" />
		<rect x="14" y="56" width="72" height="7" rx="3" fill="#a216ff" />
		<rect x="14" y="71" width="44" height="7" rx="3" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
