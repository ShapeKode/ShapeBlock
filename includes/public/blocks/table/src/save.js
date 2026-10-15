import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Rendered by render.php; only the cells (blocks inside) are saved.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
