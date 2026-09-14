import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    ColorPicker,
    Popover,
    Button,
    Icon
} from '@wordpress/components';

const ColorPopover = ({ label, color, onChange, defaultColor = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    // Popover needs a stable anchor element. Without one it falls back to a
    // placeholder node and floating-ui keeps re-measuring against a moving
    // reference, which makes the panel visibly jitter while it is open.
    const [anchorEl, setAnchorEl] = useState(null);

    const toggleVisible = () => {
        setIsVisible((state) => !state);
    };

    return (
        <div className="shapeblock-color-popover-control" style={{ position: 'relative' }}>
            <Button
                variant="secondary"
                ref={setAnchorEl}
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', marginBottom: '15px', boxShadow: 'none' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: color || 'transparent',
                        border: '1px solid #ccc'
                    }} />
                    {label}
                </div>
                <Icon icon="art" />
            </Button>
            {isVisible && (
                <Popover
                    anchor={anchorEl}
                    placement="left-start"
                    offset={20}
                    shift
                    flip={false}
                    resize={false}
                    onFocusOutside={() => setIsVisible(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <ColorPicker
                            color={color}
                            onChange={onChange}
                            enableAlpha
                        />
                        <Button
                            variant="secondary"
                            isSmall
                            onClick={() => {
                                onChange(defaultColor);
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

export default ColorPopover;
