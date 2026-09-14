import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import {
    Popover,
    Button,
    TextControl,
    Icon,
    Tooltip
} from '@wordpress/components';

const IconPicker = ({ label, value, onChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [icons, setIcons] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const pluginUrl = window.shapeblockEditor ? window.shapeblockEditor.plugin_url : '/wp-content/plugins/shapeblock/';

        fetch(`${pluginUrl}includes/public/assets/icon/config.json`)
            .then(res => res.json())
            .then(data => {
                if (data && data.glyphs) {
                    setIcons(data.glyphs);
                }
            })
            .catch(err => console.error('Failed to load icons', err));
    }, []);

    const filteredIcons = icons.filter(icon =>
        icon.css.toLowerCase().includes(search.toLowerCase())
    );

    // Blocks store the full CSS class, and the icon font groups the brand marks
    // under a "logo-" family. Neither belongs on screen — show the icon's name
    // alone. No glyph name collides once "logo-" is dropped.
    const iconLabel = (val) => String(val).replace(/^shapeblock-icon-/, '').replace(/^logo-/, '');

    const toggleVisible = () => setIsVisible(!isVisible);

    return (
        <div className="shapeblock-icon-picker-control" style={{ position: 'relative', marginBottom: '15px' }}>
            {label && <div style={{ marginBottom: '8px', fontWeight: '500' }}>{label}</div>}
            <Button
                variant="secondary"
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', height: 'auto', padding: '8px 12px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {value && value !== 'none' ? (
                        <i className={`shapeblock-icon ${value}`} style={{ fontSize: '20px' }}></i>
                    ) : (
                        <div style={{ width: '20px', height: '20px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        </div>
                    )}
                    <span>{value && value !== 'none' ? iconLabel(value) : __('Select Icon', 'shapeblock')}</span>
                </div>
                <Icon icon="edit" />
            </Button>

            {isVisible && (
                <Popover
                    position="bottom center"
                    onFocusOutside={() => setIsVisible(false)}
                    className="shapeblock-icon-picker-popover"
                >
                    <div style={{ padding: '15px', width: '300px' }}>
                        <TextControl
                            placeholder={__('Search icons...', 'shapeblock')}
                            value={search}
                            onChange={setSearch}
                            autoFocus
                        />
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '8px',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            padding: '5px'
                        }}>
                            <Tooltip text={__('None', 'shapeblock')}>
                                <Button
                                    onClick={() => {
                                        onChange('none');
                                        setIsVisible(false);
                                    }}
                                    style={{
                                        padding: '8px',
                                        height: '40px',
                                        width: '40px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        border: (value === 'none' || !value) ? '2px solid #007cba' : '1px solid #ddd'
                                    }}
                                >
                                    <Icon icon="no" />
                                </Button>
                            </Tooltip>
                            {filteredIcons.map(icon => (
                                <Tooltip text={iconLabel(icon.css)} key={icon.uid}>
                                    <Button
                                        onClick={() => {
                                            onChange(`shapeblock-icon-${icon.css}`);
                                            setIsVisible(false);
                                        }}
                                        style={{
                                            padding: '8px',
                                            height: '40px',
                                            width: '40px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            border: value === `shapeblock-icon-${icon.css}` ? '2px solid #007cba' : '1px solid #eee'
                                        }}
                                    >
                                        <i className={`shapeblock-icon shapeblock-icon-${icon.css}`} style={{ fontSize: '18px' }}></i>
                                    </Button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default IconPicker;
