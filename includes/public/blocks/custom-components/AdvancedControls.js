import { __ } from '@wordpress/i18n';
import {
    PanelBody,
    BoxControl,
    __experimentalDivider as Divider,
} from '@wordpress/components';

import ResponsiveWrapper from './ResponsiveWrapper';
import ColorPopover from './ColorPopover';

/**
 * The "Advanced" inspector tab shared by every ShapeBlock block.
 *
 * Every block already owns its Settings / Layout / Style tabs; this is the one
 * set of controls that means the same thing everywhere — outer spacing and a
 * background behind the whole block. Keeping it in one component is what lets
 * all blocks stay in step: a fix here reaches every block at once, and none of
 * them has to grow its own slightly different copy.
 *
 * The attributes are prefixed `adv` on purpose. `column` and `layout-row`
 * already ship `padding` / `margin` attributes of their own, and reusing those
 * names would silently merge two different controls into one stored value.
 *
 * The matching CSS is produced server side by shapeblock_advanced_block_css()
 * in blocks.php, which targets the block's own `blockId` class, so no block's
 * render.php has to know this tab exists.
 */

// Desktop keeps the bare attribute name; other devices get a suffixed twin.
// This mirrors the getKey() helper the blocks already use for responsive values.
const advKey = ( base, device ) =>
    device === 'desktop' ? base : base + device.charAt( 0 ).toUpperCase() + device.slice( 1 );

/**
 * The attribute definitions every block.json must declare for this tab to work.
 * Exported so the shape is documented in exactly one place; block.json files
 * cannot import, so they carry a literal copy of the same seven entries.
 */
export const ADVANCED_ATTRIBUTE_KEYS = [
    'advPadding', 'advPaddingTablet', 'advPaddingMobile',
    'advMargin', 'advMarginTablet', 'advMarginMobile',
    'advBgColor',
];

const AdvancedControls = ( { attributes, setAttributes } ) => (
    <>
        <PanelBody title={ __( 'Spacing', 'shapeblock' ) } initialOpen={ true }>
            <ResponsiveWrapper label={ __( 'Padding', 'shapeblock' ) }>
                { ( device ) => (
                    <BoxControl
                        values={ attributes[ advKey( 'advPadding', device ) ] }
                        onChange={ ( v ) =>
                            setAttributes( { [ advKey( 'advPadding', device ) ]: v } )
                        }
                    />
                ) }
            </ResponsiveWrapper>

            <Divider />

            <ResponsiveWrapper label={ __( 'Margin', 'shapeblock' ) }>
                { ( device ) => (
                    <BoxControl
                        values={ attributes[ advKey( 'advMargin', device ) ] }
                        onChange={ ( v ) =>
                            setAttributes( { [ advKey( 'advMargin', device ) ]: v } )
                        }
                    />
                ) }
            </ResponsiveWrapper>
        </PanelBody>

        <PanelBody title={ __( 'Background', 'shapeblock' ) } initialOpen={ false }>
            <ColorPopover
                label={ __( 'Background Color', 'shapeblock' ) }
                color={ attributes.advBgColor }
                onChange={ ( v ) => setAttributes( { advBgColor: v } ) }
            />
        </PanelBody>
    </>
);

export default AdvancedControls;
