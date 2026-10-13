import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="10" width="18" height="10" rx="3" fill="#a216ff" />
		<rect x="30" y="10" width="18" height="10" rx="3" fill="#a216ff" opacity="0.45" />
		<rect x="58" y="10" width="34" height="10" rx="5" fill="none" stroke="#a216ff" strokeWidth="3" />
		<rect x="8" y="34" width="8" height="8" rx="2" fill="#a216ff" />
		<rect x="20" y="35" width="26" height="6" rx="3" fill="#a216ff" opacity="0.55" />
		<rect x="54" y="34" width="8" height="8" rx="2" fill="#a216ff" />
		<rect x="66" y="35" width="26" height="6" rx="3" fill="#a216ff" opacity="0.55" />
		<rect x="8" y="52" width="8" height="8" rx="2" fill="#a216ff" />
		<rect x="20" y="53" width="26" height="6" rx="3" fill="#a216ff" opacity="0.55" />
		<rect x="54" y="52" width="8" height="8" rx="2" fill="#a216ff" />
		<rect x="66" y="53" width="26" height="6" rx="3" fill="#a216ff" opacity="0.55" />
		<rect x="8" y="70" width="8" height="8" rx="2" fill="#a216ff" />
		<rect x="20" y="71" width="26" height="6" rx="3" fill="#a216ff" opacity="0.55" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
});
