import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="18" width="84" height="64" rx="6" fill="#a216ff" opacity="0.18" />
		<rect x="8" y="18" width="84" height="18" rx="6" fill="#a216ff" />
		<rect x="38" y="40" width="2" height="42" fill="#a216ff" opacity="0.5" />
		<rect x="64" y="40" width="2" height="42" fill="#a216ff" opacity="0.5" />
		<rect x="12" y="56" width="76" height="2" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
