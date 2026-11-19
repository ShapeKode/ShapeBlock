import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="34" cy="34" r="22" stroke="#a216ff" strokeWidth="6" />
		<path d="M34 22v13l8 6" stroke="#a216ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
		<rect x="64" y="22" width="26" height="6" rx="3" fill="#a216ff" />
		<rect x="64" y="38" width="20" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
		<rect x="12" y="66" width="78" height="6" rx="3" fill="#a216ff" />
		<rect x="12" y="80" width="56" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
