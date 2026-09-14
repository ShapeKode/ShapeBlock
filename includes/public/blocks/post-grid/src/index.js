/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

const shapeblockIcon = (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M36.3861 6H16.1764C10.5652 6 6 10.5652 6 16.1764V36.3861C6 41.9973 10.5652 46.5625 16.1764 46.5625H36.3861C41.9973 46.5625 46.5625 41.9973 46.5625 36.3861V16.1764C46.5625 10.5652 41.9973 6 36.3861 6ZM39.6875 36.3861C39.6875 38.2065 38.2065 39.6875 36.3861 39.6875H16.1764C14.356 39.6875 12.875 38.2065 12.875 36.3861V16.1764C12.875 14.356 14.356 12.875 16.1764 12.875H36.3861C38.2065 12.875 39.6875 14.356 39.6875 16.1764V36.3861Z" fill="#a216ffff" />
		<path d="M83.6875 6H63.75C58.0637 6 53.4375 10.6262 53.4375 16.3125V36.25C53.4375 41.9363 58.0637 46.5625 63.75 46.5625H83.6875C89.3738 46.5625 94 41.9363 94 36.25V16.3125C94 10.6262 89.3738 6 83.6875 6ZM87.125 36.25C87.125 38.1454 85.5829 39.6875 83.6875 39.6875H63.75C61.8546 39.6875 60.3125 38.1454 60.3125 36.25V16.3125C60.3125 14.4171 61.8546 12.875 63.75 12.875H83.6875C85.5829 12.875 87.125 14.4171 87.125 16.3125V36.25Z" fill="#a216ffff" />
		<path d="M36.3861 53.4375H16.1764C10.5652 53.4375 6 58.0027 6 63.6139V83.8236C6 89.4348 10.5652 94 16.1764 94H36.3861C41.9973 94 46.5625 89.4348 46.5625 83.8236V63.6139C46.5625 58.0027 41.9973 53.4375 36.3861 53.4375ZM39.6875 83.8236C39.6875 85.644 38.2065 87.125 36.3861 87.125H16.1764C14.356 87.125 12.875 85.644 12.875 83.8236V63.6139C12.875 61.7935 14.356 60.3125 16.1764 60.3125H36.3861C38.2065 60.3125 39.6875 61.7935 39.6875 63.6139V83.8236Z" fill="#a216ffff" />
		<path d="M83.6875 53.4375H63.75C58.0637 53.4375 53.4375 58.0637 53.4375 63.75V83.6875C53.4375 89.3738 58.0637 94 63.75 94H83.6875C89.3738 94 94 89.3738 94 83.6875V63.75C94 58.0637 89.3738 53.4375 83.6875 53.4375ZM87.125 83.6875C87.125 85.5829 85.5829 87.125 83.6875 87.125H63.75C61.8546 87.125 60.3125 85.5829 60.3125 83.6875V63.75C60.3125 61.8546 61.8546 60.3125 63.75 60.3125H83.6875C85.5829 60.3125 87.125 61.8546 87.125 63.75V83.6875Z" fill="#a216ffff" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: shapeblockIcon,
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
});
