import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import './cells';
import save from './save';
import metadata from './block.json';

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="18" width="84" height="64" rx="6" fill="#a216ff" opacity="0.18" />
		<rect x="8" y="18" width="84" height="18" rx="6" fill="#a216ff" />
		<rect x="38" y="40" width="2" height="42" fill="#a216ff" opacity="0.5" />
		<rect x="64" y="40" width="2" height="42" fill="#a216ff" opacity="0.5" />
		<rect x="12" y="56" width="76" height="2" fill="#a216ff" opacity="0.5" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	edit: Edit,
	save,
	// Added from the inserter, a table starts empty and asks for its column and
	// row count, as the core Table block does. The block's own defaults stay
	// as they were, so tables saved with them keep their cells.
	variations: [
		{
			name: 'new-table',
			title: metadata.title,
			description: metadata.description,
			icon: shapeblockIcon,
			isDefault: true,
			scope: ['inserter'],
			attributes: { tableHeader: [], tableBody: [], tableFooter: [] },
		},
	],
});
