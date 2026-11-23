import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="22" cy="24" r="12" fill="#a216ff" />
		<rect x="42" y="18" width="46" height="6" rx="3" fill="#a216ff" />
		<rect x="42" y="28" width="30" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
		<circle cx="22" cy="54" r="12" fill="#a216ff" />
		<rect x="42" y="48" width="46" height="6" rx="3" fill="#a216ff" />
		<rect x="42" y="58" width="30" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
		<circle cx="22" cy="84" r="12" fill="#a216ff" opacity="0.5" />
		<rect x="42" y="78" width="46" height="6" rx="3" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
