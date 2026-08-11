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
        const pluginUrl = window.eelfgEditor ? window.eelfgEditor.plugin_url : '/wp-content/plugins/easy-elements-for-gutenberg/';

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

    const toggleVisible = () => setIsVisible(!isVisible);

    return (
        <div className="eelfg-icon-picker-control" style={{ position: 'relative', marginBottom: '15px' }}>
            {label && <div style={{ marginBottom: '8px', fontWeight: '500' }}>{label}</div>}
            <Button
                variant="secondary"
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', height: 'auto', padding: '8px 12px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {value && value !== 'none' ? (
                        <i className={`eelfg-icon ${value}`} style={{ fontSize: '20px' }}></i>
                    ) : (
                        <div style={{ width: '20px', height: '20px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        </div>
                    )}
                    <span>{value && value !== 'none' ? value : __('Select Icon', 'easy-elements-for-gutenberg')}</span>
                </div>
                <Icon icon="edit" />
            </Button>

            {isVisible && (
                <Popover
                    position="bottom center"
                    onFocusOutside={() => setIsVisible(false)}
                    className="eelfg-icon-picker-popover"
                >
                    <div style={{ padding: '15px', width: '300px' }}>
                        <TextControl
                            placeholder={__('Search icons...', 'easy-elements-for-gutenberg')}
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
                            <Tooltip text={__('None', 'easy-elements-for-gutenberg')}>
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
                                <Tooltip text={icon.css} key={icon.uid}>
                                    <Button
                                        onClick={() => {
                                            onChange(`eelfg-icon-${icon.css}`);
                                            setIsVisible(false);
                                        }}
                                        style={{
                                            padding: '8px',
                                            height: '40px',
                                            width: '40px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            border: value === icon.css ? '2px solid #007cba' : '1px solid #eee'
                                        }}
                                    >
                                        <i className={`eelfg-icon eelfg-icon-${icon.css}`} style={{ fontSize: '18px' }}></i>
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
