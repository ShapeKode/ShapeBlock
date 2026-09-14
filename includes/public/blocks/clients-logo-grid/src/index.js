import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="18" width="38" height="28" rx="5" fill="#a216ff" />
		<rect x="54" y="18" width="38" height="28" rx="5" fill="#a216ff" opacity="0.55" />
		<rect x="8" y="54" width="38" height="28" rx="5" fill="#a216ff" opacity="0.55" />
		<rect x="54" y="54" width="38" height="28" rx="5" fill="#a216ff" opacity="0.55" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
