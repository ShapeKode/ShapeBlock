import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="6" y="12" width="88" height="22" rx="6" fill="#a216ff" />
		<rect x="6" y="42" width="88" height="22" rx="6" fill="#a216ff" opacity="0.6" />
		<rect x="6" y="72" width="88" height="22" rx="6" fill="#a216ff" opacity="0.6" />
		<path d="M82 19h6v8h-6zM81 22h8v2h-8z" fill="#fff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
