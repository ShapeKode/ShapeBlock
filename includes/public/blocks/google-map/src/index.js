import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

const icon = (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M3 6.5l5.5-2 7 2 5.5-2v13l-5.5 2-7-2-5.5 2z" fill="none" stroke="#a216ff" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
		<path d="M12 6.5a3.5 3.5 0 0 0-3.5 3.5c0 2.6 3.5 6 3.5 6s3.5-3.4 3.5-6A3.5 3.5 0 0 0 12 6.5z" fill="#a216ff" />
		<circle cx="12" cy="10" r="1.2" fill="#fff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon,
	edit: Edit,
	save,
});
