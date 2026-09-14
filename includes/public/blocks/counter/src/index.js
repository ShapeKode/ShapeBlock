import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="14" y="30" width="72" height="40" rx="8" fill="#a216ff" opacity="0.14" />
		<text x="50" y="60" textAnchor="middle" fontSize="28" fontWeight="700" fill="#a216ff">99</text>
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
