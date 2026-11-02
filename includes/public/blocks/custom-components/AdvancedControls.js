import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    PanelBody,
    BoxControl,
    SelectControl,
    TextControl,
    RangeControl,
    __experimentalUnitControl as UnitControl,
    Button,
    __experimentalDivider as Divider,
} from '@wordpress/components';

import ResponsiveWrapper from './ResponsiveWrapper';
import BackgroundControl from './BackgroundControl';

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

// Slider range per unit, [ min, max ]: a side can go negative (outside the
// parent), a width can't.
const SIDE_RANGE = { px: [ -500, 500 ], '%': [ -100, 100 ], vw: [ -100, 100 ], vh: [ -100, 100 ] };
const WIDTH_RANGE = { px: [ 0, 1200 ], '%': [ 0, 100 ], vw: [ 0, 100 ], vh: [ 0, 100 ] };

// "24px" -> [ 24, 'px' ]; empty or unreadable -> [ undefined, '' ].
const splitLength = ( value ) => {
    const m = String( value || '' ).trim().match( /^(-?\d*\.?\d+)(px|%|vw|vh)?$/ );
    return m ? [ parseFloat( m[ 1 ] ), m[ 2 ] || 'px' ] : [ undefined, '' ];
};

/**
 * One compact line per side: its name, a slider and the exact value with its
 * unit (px, %, vw, vh). Emptying the value leaves that side unset.
 */
const SideRow = ( { label, value, onChange, ranges } ) => {
    const [ number, storedUnit ] = splitLength( value );
    const [ pickedUnit, setPickedUnit ] = useState( storedUnit || 'px' );
    const unit = storedUnit || pickedUnit;
    const [ min, max ] = ranges[ unit ];
    return (
        <div className="shapeblock-position-row" style={ { display: 'grid', gridTemplateColumns: '48px 1fr 96px', alignItems: 'center', gap: 8, marginBottom: 6 } }>
            <span style={ { fontSize: 12 } }>{ label }</span>
            <RangeControl
                label={ label }
                hideLabelFromVision
                value={ number }
                min={ min }
                max={ max }
                step={ 1 }
                withInputField={ false }
                onChange={ ( n ) => onChange( n === undefined || n === null || Number.isNaN( n ) ? '' : n + unit ) }
                __nextHasNoMarginBottom
            />
            <UnitControl
                label={ label }
                hideLabelFromVision
                value={ value || '' }
                unit={ unit }
                units={ Object.keys( ranges ).map( ( u ) => ( { value: u, label: u } ) ) }
                min={ min }
                max={ max }
                size="small"
                onChange={ ( v ) => onChange( splitLength( v )[ 0 ] === undefined ? '' : v ) }
                onUnitChange={ ( u ) => setPickedUnit( u ) }
            />
        </div>
    );
};

/**
 * Position, as Elementor's Advanced tab has it: Default, Absolute or Fixed.
 * A positioned block picks the edge it sticks to (horizontal and vertical
 * alignment; the middle options center it), and the sliders move it from
 * there: one per side and one for its width, per device, each left unset
 * when empty. Z-Index for every block, except the Row, which has its own
 * beside its Sticky setting.
 */
const PositionControls = ( { attributes, setAttributes, hideZIndex } ) => {
    const positioned = attributes.advPosition === 'absolute' || attributes.advPosition === 'fixed';
    // Three bordered buttons with their names; the chosen one is filled, and
    // clicking it again clears it.
    const align = ( key, label, options ) => (
        <div style={ { marginBottom: 12 } }>
            <div className="components-base-control__label" style={ { marginBottom: 6, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' } }>
                { label }
            </div>
            <div role="group" aria-label={ label } style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 } }>
                { options.map( ( [ value, text ] ) => {
                    const chosen = attributes[ key ] === value;
                    return (
                        <Button
                            key={ value }
                            variant={ chosen ? 'primary' : 'secondary' }
                            isPressed={ chosen }
                            onClick={ () => setAttributes( { [ key ]: chosen ? '' : value } ) }
                            style={ { justifyContent: 'center' } }
                            __next40pxDefaultSize
                        >
                            { text }
                        </Button>
                    );
                } ) }
            </div>
        </div>
    );

    return (
        <PanelBody title={ __( 'Position', 'shapeblock' ) } initialOpen={ false }>
            <SelectControl
                label={ __( 'Position', 'shapeblock' ) }
                value={ attributes.advPosition }
                options={ [
                    { label: __( 'Default', 'shapeblock' ), value: '' },
                    { label: __( 'Absolute', 'shapeblock' ), value: 'absolute' },
                    { label: __( 'Fixed', 'shapeblock' ), value: 'fixed' },
                ] }
                help={ positioned
                    ? ( attributes.advPosition === 'fixed'
                        ? __( 'Placed in the browser window; stays there on scroll.', 'shapeblock' )
                        : __( 'Placed in the nearest Row or Column.', 'shapeblock' ) )
                    : undefined }
                onChange={ ( v ) => setAttributes( { advPosition: v } ) }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            { positioned && (
                <>
                    <div style={ { marginTop: 16 } }>
                        { align( 'advHAlign', __( 'Horizontal Align', 'shapeblock' ), [
                            [ 'left', __( 'Left', 'shapeblock' ) ],
                            [ 'center', __( 'Center', 'shapeblock' ) ],
                            [ 'right', __( 'Right', 'shapeblock' ) ],
                        ] ) }
                        { align( 'advVAlign', __( 'Vertical Align', 'shapeblock' ), [
                            [ 'top', __( 'Top', 'shapeblock' ) ],
                            [ 'middle', __( 'Middle', 'shapeblock' ) ],
                            [ 'bottom', __( 'Bottom', 'shapeblock' ) ],
                        ] ) }
                    </div>
                    <ResponsiveWrapper label={ __( 'Offset & Width', 'shapeblock' ) }>
                        { ( device ) => (
                            <>
                                { [
                                    [ 'advTop', __( 'Top', 'shapeblock' ), SIDE_RANGE ],
                                    [ 'advRight', __( 'Right', 'shapeblock' ), SIDE_RANGE ],
                                    [ 'advBottom', __( 'Bottom', 'shapeblock' ), SIDE_RANGE ],
                                    [ 'advLeft', __( 'Left', 'shapeblock' ), SIDE_RANGE ],
                                    [ 'advWidth', __( 'Width', 'shapeblock' ), WIDTH_RANGE ],
                                ].map( ( [ base, label, ranges ] ) => (
                                    <SideRow
                                        key={ base + device }
                                        label={ label }
                                        value={ attributes[ advKey( base, device ) ] }
                                        onChange={ ( v ) => setAttributes( { [ advKey( base, device ) ]: v } ) }
                                        ranges={ ranges }
                                    />
                                ) ) }
                            </>
                        ) }
                    </ResponsiveWrapper>
                </>
            ) }

            { ! hideZIndex && (
                <TextControl
                    label={ __( 'Z-Index', 'shapeblock' ) }
                    type="number"
                    value={ attributes.advZIndex }
                    onChange={ ( v ) => setAttributes( { advZIndex: v } ) }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            ) }
        </PanelBody>
    );
};

const AdvancedControls = ( { attributes, setAttributes, hideZIndex = false } ) => (
    <>
        <PanelBody title={ __( 'Spacing', 'shapeblock' ) } initialOpen={ true }>
            <ResponsiveWrapper label={ __( 'Padding', 'shapeblock' ) }>
                { ( device ) => (
                    <BoxControl label=""
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
                    <BoxControl label=""
                        values={ attributes[ advKey( 'advMargin', device ) ] }
                        // Margins may be negative, e.g. -50px to overlap the block above.
                        inputProps={ { min: -1000, max: 1000 } }
                        onChange={ ( v ) =>
                            setAttributes( { [ advKey( 'advMargin', device ) ]: v } )
                        }
                    />
                ) }
            </ResponsiveWrapper>
        </PanelBody>

        <PositionControls attributes={ attributes } setAttributes={ setAttributes } hideZIndex={ hideZIndex } />

        <PanelBody title={ __( 'Background', 'shapeblock' ) } initialOpen={ false }>
            <BackgroundControl
                label={ __( 'Background', 'shapeblock' ) }
                colorValue={ attributes.advBgColor }
                gradientValue={ attributes.advBgGradient }
                onColorChange={ ( v ) => setAttributes( { advBgColor: v && typeof v === 'object' ? v.hex : v || '' } ) }
                onGradientChange={ ( v ) => setAttributes( { advBgGradient: v || '' } ) }
            />
        </PanelBody>
    </>
);

export default AdvancedControls;
