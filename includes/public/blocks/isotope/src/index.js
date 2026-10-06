import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="10" width="22" height="9" rx="4.5" fill="#a216ff" />
		<rect x="34" y="10" width="22" height="9" rx="4.5" fill="#a216ff" opacity="0.45" />
		<rect x="60" y="10" width="22" height="9" rx="4.5" fill="#a216ff" opacity="0.45" />
		<rect x="8" y="30" width="26" height="26" rx="4" fill="#a216ff" />
		<rect x="38" y="30" width="26" height="26" rx="4" fill="#a216ff" opacity="0.55" />
		<rect x="68" y="30" width="26" height="26" rx="4" fill="#a216ff" opacity="0.3" />
		<rect x="8" y="62" width="26" height="26" rx="4" fill="#a216ff" opacity="0.55" />
		<rect x="38" y="62" width="26" height="26" rx="4" fill="#a216ff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
