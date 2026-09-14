import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="6" y="6" width="40" height="40" rx="6" fill="#a216ff" />
		<rect x="54" y="6" width="40" height="40" rx="6" fill="#a216ff" />
		<rect x="6" y="54" width="40" height="40" rx="6" fill="#a216ff" />
		<rect x="54" y="54" width="40" height="40" rx="6" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
