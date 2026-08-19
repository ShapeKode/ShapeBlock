import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Tooltip } from '@wordpress/components';

const ResponsiveWrapper = ({ children, label }) => {

    // Get the current preview device. Prefer the modern core/editor API
    // (getDeviceType, WP 6.5+); fall back to the deprecated core/edit-post
    // experimental API on older WordPress.
    const deviceType = useSelect((select) => {
        const editor = select('core/editor');
        if (editor && typeof editor.getDeviceType === 'function') {
            return editor.getDeviceType();
        }
        const editPost = select('core/edit-post');
        if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') {
            return editPost.__experimentalGetPreviewDeviceType();
        }
        return 'Desktop';
    }, []);

    const device = deviceType ? deviceType.toLowerCase() : 'desktop';

    // Get dispatchers for both APIs; prefer the modern one when available.
    const editorDispatch = useDispatch('core/editor');
    const editPostDispatch = useDispatch('core/edit-post');

    const setDeviceAndPreview = (deviceName) => {
        const wpDevice = deviceName.charAt(0).toUpperCase() + deviceName.slice(1);
        if (editorDispatch && typeof editorDispatch.setDeviceType === 'function') {
            editorDispatch.setDeviceType(wpDevice);
        } else if (editPostDispatch && typeof editPostDispatch.__experimentalSetPreviewDeviceType === 'function') {
            editPostDispatch.__experimentalSetPreviewDeviceType(wpDevice);
        }
    };

    const devices = [
        { name: 'desktop', icon: 'desktop', label: __('Desktop', 'easy-elements-for-gutenberg') },
        { name: 'tablet', icon: 'tablet', label: __('Tablet', 'easy-elements-for-gutenberg') },
        { name: 'mobile', icon: 'smartphone', label: __('Mobile', 'easy-elements-for-gutenberg') },
    ];

    return (
        <div className="eshb-responsive-wrapper" style={{ marginBottom: '20px' }}>
            <div className="eshb-responsive-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                {label && <label className="components-base-control__label">{label}</label>}
                <div className="eshb-responsive-icons">
                    {devices.map((d) => (
                        <Tooltip key={d.name} text={d.label}>
                            <Button
                                isSmall
                                variant={device === d.name ? 'primary' : 'tertiary'}
                                icon={d.icon}
                                onClick={() => setDeviceAndPreview(d.name)}
                                style={{ marginLeft: '5px' }}
                            />
                        </Tooltip>
                    ))}
                </div>
            </div>
            <div className="eshb-responsive-content">
                {children(device)}
            </div>
        </div>
    );
};

export default ResponsiveWrapper;
