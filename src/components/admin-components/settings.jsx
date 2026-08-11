import { useState } from 'react';
import { Row, Col, Button, InputNumber, notification } from 'antd';

// Guarded: this runs at module-eval time, and the same bundle is also loaded in
// the block editor where the `eelfg` global is not localized.
const LAYOUT_DEFAULTS = (typeof eelfg !== 'undefined' && eelfg.layoutDefaults) || { container_width: '1200px' };

// Strip the unit suffix for the numeric input. Sanitize on save adds "px" back.
const parseContainerWidth = (value) => {
    if (value === '' || value == null) return '';
    const m = String(value).match(/^([0-9]*\.?[0-9]+)/);
    return m ? parseFloat(m[1]) : '';
};

export default function Settings() {
    const [saving, setSaving] = useState(false);

    const initialContainerWidth = parseContainerWidth(
        (eelfg.layout && eelfg.layout.container_width) || LAYOUT_DEFAULTS.container_width
    );
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);

    const applyContainerWidthToRoot = (px) => {
        if (px === '' || px == null) return;
        document.documentElement.style.setProperty('--eelfg-layout-row-max-width', `${px}px`);
    };

    const handleContainerWidthChange = (value) => {
        setContainerWidth(value);
        if (typeof value === 'number') applyContainerWidthToRoot(value);
    };

    const postJson = (path, body) =>
        fetch(eelfg.rest_url + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': eelfg.nonce,
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());

    const handleSave = () => {
        setSaving(true);

        const containerWidthValue = (typeof containerWidth === 'number' && containerWidth > 0)
            ? `${containerWidth}px`
            : LAYOUT_DEFAULTS.container_width;

        postJson('layout', { layout: { container_width: containerWidthValue } })
            .then((res) => {
                const layoutOk = res && res.status === 'success';
                if (layoutOk) {
                    eelfg.layout = res.layout || { container_width: containerWidthValue };
                    notification.success({
                        message: 'Settings Saved',
                        description: 'Container width has been updated.',
                        duration: 2,
                    });
                } else {
                    notification.error({
                        message: 'Save Failed',
                        description: 'Could not save container width. Please try again.',
                        duration: 2,
                    });
                }
            })
            .catch(() => {
                notification.error({ message: 'Save Failed', description: 'Could not save container width. Please try again.', duration: 2 });
            })
            .finally(() => setSaving(false));
    };

    const handleReset = () => {
        const defaultWidth = parseContainerWidth(LAYOUT_DEFAULTS.container_width);
        setContainerWidth(defaultWidth);
        applyContainerWidthToRoot(defaultWidth);
    };

    return (
        <div className="eelfg-options-content">
            <h1 className="eelfg-options-title">Settings</h1>

            <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0 }}>Content Container</h2>
            <p style={{ marginTop: 0, color: '#555' }}>
                Sets the boxed content max-width used by the eelfg Row block. Stored as
                the CSS variable <code>--eelfg-layout-row-max-width</code> on <code>:root</code>.
            </p>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f7f8fb', borderRadius: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                            <strong>Container Width</strong>
                            <InputNumber
                                min={200}
                                max={3000}
                                step={10}
                                addonAfter="px"
                                value={containerWidth}
                                onChange={handleContainerWidthChange}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                <Button type="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
                <Button onClick={handleReset} disabled={saving}>Reset to Defaults</Button>
            </div>
        </div>
    );
}
