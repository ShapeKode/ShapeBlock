import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { Row, Col, Button, InputNumber, notification, Checkbox } from 'antd';

// Guarded: this runs at module-eval time, and the same bundle is also loaded in
// the block editor where the `shapeblock` global is not localized.
const LAYOUT_DEFAULTS = (typeof shapeblock !== 'undefined' && shapeblock.layoutDefaults) || { container_width: '1200px', google_fonts: 0 };


// Strip the unit suffix for the numeric input. Sanitize on save adds "px" back.
const parseContainerWidth = (value) => {
    if (value === '' || value == null) return '';
    const m = String(value).match(/^([0-9]*\.?[0-9]+)/);
    return m ? parseFloat(m[1]) : '';
};


export default function Settings() {
    const [saving, setSaving] = useState(false);

    const initialContainerWidth = parseContainerWidth(
        (shapeblock.layout && shapeblock.layout.container_width) || LAYOUT_DEFAULTS.container_width
    );
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);

    // Google Fonts is an external connection, so it stays off until it is
    // switched on here.
    const [googleFonts, setGoogleFonts] = useState(
        !!(shapeblock.layout && shapeblock.layout.google_fonts)
    );

    // Last saved values: the Save button stays faded until something changes.
    const [saved, setSaved] = useState({ containerWidth: initialContainerWidth, googleFonts: !!(shapeblock.layout && shapeblock.layout.google_fonts) });
    const dirty = saved.containerWidth !== containerWidth || saved.googleFonts !== googleFonts;


    const applyContainerWidthToRoot = (px) => {
        if (px === '' || px == null) return;
        document.documentElement.style.setProperty('--shapeblock-layout-row-max-width', `${px}px`);
    };

    const handleContainerWidthChange = (value) => {
        setContainerWidth(value);
        if (typeof value === 'number') applyContainerWidthToRoot(value);
    };

    const postJson = (path, body) =>
        fetch(shapeblock.rest_url + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': shapeblock.nonce,
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());

    const handleSave = () => {
        setSaving(true);

        const containerWidthValue = (typeof containerWidth === 'number' && containerWidth > 0)
            ? `${containerWidth}px`
            : LAYOUT_DEFAULTS.container_width;

        postJson('layout', { layout: { container_width: containerWidthValue, google_fonts: googleFonts ? 1 : 0 } })
            .then((res) => {
                const layoutOk = res && res.status === 'success';
                if (layoutOk) {
                    shapeblock.layout = res.layout || { container_width: containerWidthValue, google_fonts: googleFonts ? 1 : 0 };
                    setSaved({ containerWidth, googleFonts });
                    notification.success({
                        message: __( 'Settings saved', 'shapeblock' ),
                        description: __( 'Your settings have been updated.', 'shapeblock' ),
                        duration: 2,
                    });
                } else {
                    notification.error({
                        message: __( 'Save failed', 'shapeblock' ),
                        description: __( 'Could not save container width. Please try again.', 'shapeblock' ),
                        duration: 2,
                    });
                }
            })
            .catch(() => {
                notification.error({ message: __( 'Save failed', 'shapeblock' ), description: __( 'Could not save container width. Please try again.', 'shapeblock' ), duration: 2 });
            })
            .finally(() => setSaving(false));
    };

    const handleReset = () => {
        const defaultWidth = parseContainerWidth(LAYOUT_DEFAULTS.container_width);
        setContainerWidth(defaultWidth);
        applyContainerWidthToRoot(defaultWidth);
        setGoogleFonts(false);
    };


    // The site-wide Content Container and Google Fonts settings.
    const settingsPanel = (
        <>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0 }}>{ __( 'Content Container', 'shapeblock' ) }</h2>
                    <p style={{ marginTop: 0, color: '#555' }}>
                        { createInterpolateElement(
                            __( 'Sets the boxed content max-width used by the shapeblock Row block. Stored as the CSS variable <varcode /> on <rootcode />.', 'shapeblock' ),
                            {
                                varcode: <code>--shapeblock-layout-row-max-width</code>,
                                rootcode: <code>:root</code>,
                            }
                        ) }
                    </p>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f7f8fb', borderRadius: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                    <strong>{ __( 'Container Width', 'shapeblock' ) }</strong>
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

                    <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>{ __( 'Google Fonts', 'shapeblock' ) }</h2>
                    <p style={{ marginTop: 0, color: '#555' }}>
                        { __( 'Off by default. While this is off ShapeBlock never contacts Google: the font pickers offer only the fonts already available on the visitor’s device, and no request is made to fonts.google.com or fonts.googleapis.com.', 'shapeblock' ) }
                    </p>
                    <p style={{ marginTop: 0, color: '#555' }}>
                        { createInterpolateElement(
                            __( 'Turning it on lets the editor download the Google Fonts list and lets the front end load the font files you choose from Google’s servers. Your visitors’ IP addresses are then sent to Google — see Google’s <termsLink>terms of service</termsLink> and <privacyLink>privacy policy</privacyLink>.', 'shapeblock' ),
                            {
                                termsLink: <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer noopener" />,
                                privacyLink: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener" />,
                            }
                        ) }
                    </p>

                    <Checkbox checked={googleFonts} onChange={(e) => setGoogleFonts(e.target.checked)}>
                        { __( 'Allow ShapeBlock to connect to Google Fonts', 'shapeblock' ) }
                    </Checkbox>

                    <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Button type="primary" onClick={handleSave} loading={saving} disabled={!dirty && !saving}>{ dirty || saving ? __( 'Save Changes', 'shapeblock' ) : __( 'Saved', 'shapeblock' ) }</Button>
                        <Button onClick={handleReset} disabled={saving}>{ __( 'Reset to Defaults', 'shapeblock' ) }</Button>
                    </div>
        </>
    );

    return (
        <div className="shapeblock-options-content">
            <h1 className="shapeblock-options-title">{ __( 'General', 'shapeblock' ) }</h1>
            {settingsPanel}
        </div>
    );
}
