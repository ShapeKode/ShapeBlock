import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="12" y="26" width="50" height="6" rx="3" fill="#a216ff" />
		<rect x="12" y="47" width="50" height="6" rx="3" fill="#a216ff" />
		<rect x="12" y="68" width="50" height="6" rx="3" fill="#a216ff" />
		<rect x="70" y="14" width="22" height="72" rx="4" fill="#a216ff" opacity="0.4" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
