import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="42" width="22" height="16" rx="4" fill="#a216ff" />
		<path d="M36 50h10M52 50h10" stroke="#a216ff" strokeWidth="4" strokeLinecap="round" />
		<rect x="40" y="42" width="22" height="16" rx="4" fill="#a216ff" opacity="0.5" />
		<rect x="72" y="42" width="22" height="16" rx="4" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
