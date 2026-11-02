import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
    Button,
    TextControl,
    SelectControl,
    FocalPointPicker,
    __experimentalDivider as Divider,
} from '@wordpress/components';

/**
 * A background image for the Row and Column: pick or paste one, then its
 * size, repeat, position (focal point) and attachment. The attributes are
 * the same in both blocks, and Helper::background_to_css_props() writes them.
 */

// Background position as the focal point picker reads it (0-1 on each axis),
// from a saved "x% y%" or the keyword pairs older Rows were saved with.
const AXIS = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
const toFocalPoint = ( position ) => {
    const [ a, b = 'center' ] = String( position || 'center center' ).trim().split( /\s+/ );
    const read = ( part ) => {
        if ( part in AXIS ) return AXIS[ part ];
        const n = parseFloat( part );
        return Number.isNaN( n ) ? 0.5 : Math.min( 1, Math.max( 0, n / 100 ) );
    };
    // A keyword pair can name the vertical side first ("top left").
    const vertical = ( p ) => p === 'top' || p === 'bottom';
    const horizontal = ( p ) => p === 'left' || p === 'right';
    return vertical( a ) || horizontal( b ) ? { x: read( b ), y: read( a ) } : { x: read( a ), y: read( b ) };
};
const fromFocalPoint = ( { x, y } ) => `${ Math.round( x * 100 ) }% ${ Math.round( y * 100 ) }%`;

const BackgroundImageControls = ( { attributes, setAttributes } ) => {
    const url = attributes.backgroundImage?.url || '';
    return (
        <>
            <MediaUploadCheck>
                <MediaUpload
                    onSelect={ ( media ) => setAttributes( { backgroundImage: { url: media.url, id: media.id } } ) }
                    allowedTypes={ [ 'image' ] }
                    value={ attributes.backgroundImage?.id }
                    render={ ( { open } ) => (
                        <div style={ { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 } }>
                            <Button variant="secondary" onClick={ open }>
                                { url ? __( 'Replace Image', 'shapeblock' ) : __( 'Choose Background Image', 'shapeblock' ) }
                            </Button>
                            { url && (
                                <Button variant="tertiary" isDestructive onClick={ () => setAttributes( { backgroundImage: { url: '', id: 0 } } ) }>
                                    { __( 'Remove', 'shapeblock' ) }
                                </Button>
                            ) }
                        </div>
                    ) }
                />
            </MediaUploadCheck>
            <TextControl
                label={ __( 'Or Image URL', 'shapeblock' ) }
                value={ url }
                onChange={ ( v ) => setAttributes( { backgroundImage: { url: v, id: 0 } } ) }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            { url && (
                <>
                    <Divider />
                    <SelectControl
                        label={ __( 'Size', 'shapeblock' ) }
                        value={ attributes.backgroundSize }
                        options={ [
                            { label: __( 'Auto', 'shapeblock' ), value: 'auto' },
                            { label: __( 'Cover', 'shapeblock' ), value: 'cover' },
                            { label: __( 'Contain', 'shapeblock' ), value: 'contain' },
                        ] }
                        onChange={ ( v ) => setAttributes( { backgroundSize: v } ) }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Repeat', 'shapeblock' ) }
                        value={ attributes.backgroundRepeat }
                        options={ [
                            { label: __( 'No Repeat', 'shapeblock' ), value: 'no-repeat' },
                            { label: __( 'Repeat', 'shapeblock' ), value: 'repeat' },
                            { label: __( 'Repeat Horizontally', 'shapeblock' ), value: 'repeat-x' },
                            { label: __( 'Repeat Vertically', 'shapeblock' ), value: 'repeat-y' },
                        ] }
                        onChange={ ( v ) => setAttributes( { backgroundRepeat: v } ) }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <FocalPointPicker
                        label={ __( 'Position', 'shapeblock' ) }
                        url={ url }
                        value={ toFocalPoint( attributes.backgroundPosition ) }
                        onChange={ ( v ) => setAttributes( { backgroundPosition: fromFocalPoint( v ) } ) }
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Attachment', 'shapeblock' ) }
                        value={ attributes.backgroundAttachment }
                        options={ [
                            { label: __( 'Scroll', 'shapeblock' ), value: 'scroll' },
                            { label: __( 'Fixed', 'shapeblock' ), value: 'fixed' },
                        ] }
                        onChange={ ( v ) => setAttributes( { backgroundAttachment: v } ) }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </>
            ) }
        </>
    );
};

export default BackgroundImageControls;
