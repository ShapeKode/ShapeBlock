import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Rendered by render.php around the blocks of the card, which are saved here.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
