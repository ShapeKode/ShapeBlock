import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

const shapeblockColumnIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="3" width="8" height="18" rx="1.5" fill="#A216FF" />
    </svg>
);

registerBlockType(metadata.name, {
    icon: shapeblockColumnIcon,
    edit: Edit,
    save,
});
