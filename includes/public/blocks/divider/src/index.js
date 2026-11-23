import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="22" width="80" height="8" rx="4" fill="#a216ff" opacity="0.5" />
		<rect x="10" y="46" width="26" height="8" rx="4" fill="#a216ff" />
		<path d="M50 40l3.5 7 7.5 1-5.5 5.2 1.3 7.6L50 57.2l-6.8 3.6 1.3-7.6L39 48l7.5-1z" fill="#a216ff" />
		<rect x="64" y="46" width="26" height="8" rx="4" fill="#a216ff" />
		<rect x="10" y="70" width="80" height="8" rx="4" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
