import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    RangeControl,
    ColorPicker,
    BaseControl,
    Popover,
    Button,
    Icon,
    ToggleControl
} from '@wordpress/components';

const BoxShadowControls = ({ label, value, onChange }) => {

    const shadowValue = {
        x: value?.x ?? 0,
        y: value?.y ?? 0,
        b: value?.b ?? 0,
        s: value?.s ?? 0,
        c: value?.c || 'rgba(0,0,0,0)',
        inset: !!value?.inset,
    };

    // Construct preview string
    const { x, y, b, s, c, inset } = shadowValue;
    const shadowString = `${inset ? 'inset ' : ''}${x}px ${y}px ${b}px ${s}px ${c}`;

    const [isVisible, setIsVisible] = useState(false);

    const toggleVisible = () => {
        setIsVisible((hidden) => !hidden);
    };

    const updateShadow = (newPart) => {
        const nextValue = { ...shadowValue, ...newPart };
        onChange(nextValue);
    };

    const handleColorChange = (color) => {
        const hex = (color && typeof color === 'object') ? (color.hex || color.color) : color;
        updateShadow({ c: hex });
    };

    return (
        <div className="shapeblock-box-shadow-control" style={{ position: 'relative' }}>
            <Button
                variant="secondary"
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', marginBottom: '15px', boxShadow: 'none' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        boxShadow: shadowString,
                        border: '1px solid #ddd',
                        background: '#fff',
                        marginRight: '5px'
                    }} />
                    {label || __('Box Shadow', 'shapeblock')}
                </div>
                <Icon icon="plus" />
            </Button>
            {isVisible && (
                <Popover
                    position="bottom center"
                    onFocusOutside={() => setIsVisible(false)}
                >
                    <div style={{ padding: '16px', width: '280px' }}>
                        <RangeControl
                            label={__('Horizontal Offset (X)', 'shapeblock')}
                            value={x}
                            onChange={(val) => updateShadow({ x: val })}
                            min={-50} max={50}
                        />
                        <RangeControl
                            label={__('Vertical Offset (Y)', 'shapeblock')}
                            value={y}
                            onChange={(val) => updateShadow({ y: val })}
                            min={-50} max={50}
                        />
                        <RangeControl
                            label={__('Blur', 'shapeblock')}
                            value={b}
                            onChange={(val) => updateShadow({ b: val })}
                            min={0} max={100}
                        />
                        <RangeControl
                            label={__('Spread', 'shapeblock')}
                            value={s}
                            onChange={(val) => updateShadow({ s: val })}
                            min={-50} max={50}
                        />
                        <ToggleControl
                            label={__('Inset', 'shapeblock')}
                            help={__('Draw the shadow inside the element instead of outside.', 'shapeblock')}
                            checked={inset}
                            onChange={(val) => updateShadow({ inset: val })}
                            __nextHasNoMarginBottom={true}
                        />
                        <BaseControl label={__('Shadow Color', 'shapeblock')} __nextHasNoMarginBottom={true}>
                            <ColorPicker
                                color={c}
                                onChange={handleColorChange}
                                enableAlpha
                            />
                        </BaseControl>
                        <Button
                            variant="secondary"
                            isSmall
                            onClick={() => {
                                onChange({ x: 0, y: 0, b: 0, s: 0, c: 'rgba(0,0,0,0)', inset: false });
                                setIsVisible(false);
                            }}
                            style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                        >
                            {__('Reset', 'shapeblock')}
                        </Button>
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default BoxShadowControls;