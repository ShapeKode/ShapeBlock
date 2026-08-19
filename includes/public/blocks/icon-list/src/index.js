import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const eelfgIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="24" cy="28" r="10" fill="#a216ff" />
		<rect x="42" y="22" width="44" height="6" rx="3" fill="#a216ff" />
		<rect x="42" y="32" width="34" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
		<circle cx="24" cy="64" r="10" fill="#a216ff" />
		<rect x="42" y="58" width="44" height="6" rx="3" fill="#a216ff" />
		<rect x="42" y="68" width="34" height="5" rx="2.5" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: eelfgIcon,
	edit: Edit,
	save,
});
