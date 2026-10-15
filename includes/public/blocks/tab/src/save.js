import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Rendered by render.php; the tabs (blocks inside) are saved here.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
