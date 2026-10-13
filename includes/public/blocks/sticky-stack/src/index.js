import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="18" y="8" width="64" height="20" rx="6" fill="#a216ff" opacity="0.25" />
		<rect x="13" y="20" width="74" height="24" rx="6" fill="#a216ff" opacity="0.5" />
		<rect x="8" y="34" width="84" height="32" rx="7" fill="#a216ff" />
		<rect x="18" y="44" width="30" height="5" rx="2.5" fill="#fff" />
		<rect x="18" y="54" width="46" height="4" rx="2" fill="#fff" opacity="0.7" />
		<rect x="8" y="74" width="84" height="18" rx="6" fill="#a216ff" opacity="0.35" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
