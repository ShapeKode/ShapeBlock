import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="12" y="8" width="76" height="84" rx="8" fill="#a216ff" opacity="0.15" />
		<rect x="12" y="8" width="76" height="26" rx="8" fill="#a216ff" />
		<rect x="26" y="46" width="48" height="6" rx="3" fill="#a216ff" />
		<rect x="26" y="60" width="48" height="6" rx="3" fill="#a216ff" opacity="0.6" />
		<rect x="32" y="74" width="36" height="10" rx="5" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
