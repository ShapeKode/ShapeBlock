import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="14" y="14" width="72" height="72" rx="14" fill="#a216ff" opacity="0.14" />
		<path d="M50 28l6.8 13.8 15.2 2.2-11 10.7 2.6 15.1L50 62.6 37.4 69.8 40 54.7l-11-10.7 15.2-2.2z" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
