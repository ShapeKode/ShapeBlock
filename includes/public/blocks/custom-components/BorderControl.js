import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    BoxControl,
    ColorPicker,
    BaseControl,
    Popover,
    Button,
    Icon,
    SelectControl
} from '@wordpress/components';

const toUnit = (v) => {
    if (!v && v !== 0) return '0px';
    return typeof v === 'number' ? `${v}px` : v;
};

const normalizeWidth = (width) => {
    if (!width && width !== 0) {
        return { top: '0px', right: '0px', bottom: '0px', left: '0px' };
    }
    if (typeof width === 'object') {
        return {
            top:    toUnit(width.top    ?? 0),
            right:  toUnit(width.right  ?? 0),
            bottom: toUnit(width.bottom ?? 0),
            left:   toUnit(width.left   ?? 0),
        };
    }
    // Legacy single number — apply to all sides
    const px = toUnit(width);
    return { top: px, right: px, bottom: px, left: px };
};

const BorderControl = ({ label, value, onChange }) => {

    const currentWidth = normalizeWidth(value?.width);

    const borderValue = {
        width: currentWidth,
        style: value?.style ?? 'solid',
        color: value?.color ?? '',
    };

    const { width, style, color } = borderValue;

    // Use top value for the preview square
    const previewTopPx = parseInt(width.top) || 0;
    const previewStyle = {
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        borderTopWidth:    (parseInt(width.top)    || 0) + 'px',
        borderRightWidth:  (parseInt(width.right)  || 0) + 'px',
        borderBottomWidth: (parseInt(width.bottom) || 0) + 'px',
        borderLeftWidth:   (parseInt(width.left)   || 0) + 'px',
        borderStyle: previewTopPx > 0 ? style : 'solid',
        borderColor: color || '#ddd',
        backgroundColor: '#fff',
    };

    const [isVisible, setIsVisible] = useState(false);
    const toggleVisible = () => setIsVisible(!isVisible);

    const updateBorder = (newPart) => {
        onChange({ ...borderValue, ...newPart });
    };

    const handleColorChange = (newColor) => {
        const hex = (newColor && typeof newColor === 'object') ? (newColor.hex || newColor.color) : newColor;
        updateBorder({ color: hex });
    };

    return (
        <div className="shapeblock-border-control" style={{ position: 'relative' }}>
            <Button
                variant="secondary"
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', marginBottom: '15px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '5px'
                    }}>
                        <div style={previewStyle} />
                    </div>
                    {label || __('Border', 'shapeblock')}
                </div>
                <Icon icon="plus" />
            </Button>
            {isVisible && (
                <Popover position="bottom center" onFocusOutside={() => setIsVisible(false)}>
                    <div style={{ padding: '16px', width: '280px' }}>
                        <BoxControl
                            label={__('Width', 'shapeblock')}
                            values={width}
                            onChange={(val) => updateBorder({ width: val })}
                            units={[{ value: 'px', label: 'px', default: 0 }]}
                            __nextHasNoMarginBottom={true}
                        />
                        <SelectControl
                            label={__('Style', 'shapeblock')}
                            value={style}
                            options={[
                                { label: 'Solid',  value: 'solid' },
                                { label: 'Dashed', value: 'dashed' },
                                { label: 'Dotted', value: 'dotted' },
                                { label: 'Double', value: 'double' },
                                { label: 'Groove', value: 'groove' },
                                { label: 'Ridge',  value: 'ridge' },
                                { label: 'Inset',  value: 'inset' },
                                { label: 'Outset', value: 'outset' },
                                { label: 'None',   value: 'none' },
                            ]}
                            onChange={(val) => updateBorder({ style: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <BaseControl label={__('Color', 'shapeblock')} style={{ marginTop: '15px' }} __nextHasNoMarginBottom={true}>
                            <ColorPicker
                                color={color}
                                onChange={handleColorChange}
                                enableAlpha
                            />
                        </BaseControl>
                        <Button
                            variant="secondary"
                            isSmall
                            onClick={() => {
                                onChange({
                                    width: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                                    style: 'solid',
                                    color: '',
                                });
                                setIsVisible(false);
                            }}
                            style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }}
                        >
                            {__('Reset', 'shapeblock')}
                        </Button>
                    </div>
                </Popover>
            )}
        </div>
    );
};
export default BorderControl;
