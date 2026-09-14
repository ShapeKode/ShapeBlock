import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockRowIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="9" height="14" rx="1.5" fill="#A216FF" />
        <rect x="13" y="5" width="9" height="14" rx="1.5" fill="#A216FF" opacity="0.55" />
    </svg>
);

registerBlockType(metadata.name, {
    icon: shapeblockRowIcon,
    edit: Edit,
    save,
});
