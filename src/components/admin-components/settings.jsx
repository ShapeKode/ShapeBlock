import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { Row, Col, Button, InputNumber, notification, Switch, Radio } from 'antd';
import { ColumnWidthOutlined, FontSizeOutlined } from '@ant-design/icons';

// Guarded: this runs at module-eval time, and the same bundle is also loaded in
// the block editor where the `shapeblock` global is not localized.
const LAYOUT_DEFAULTS = (typeof shapeblock !== 'undefined' && shapeblock.layoutDefaults) || { container_width: '', apply_to: 'row', google_fonts: 0 };


// Strip the unit suffix for the numeric input. Sanitize on save adds "px" back.
const parseContainerWidth = (value) => {
    if (value === '' || value == null) return '';
    const m = String(value).match(/^([0-9]*\.?[0-9]+)/);
    return m ? parseFloat(m[1]) : '';
};


export default function Settings() {
    const [saving, setSaving] = useState(false);

    // Empty means the theme's own width.
    const initialContainerWidth = parseContainerWidth(
        shapeblock.layout ? shapeblock.layout.container_width : LAYOUT_DEFAULTS.container_width
    );
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);

    // Where the width applies: the ShapeBlock Row only, or the theme's layout too.
    const initialApplyTo = (shapeblock.layout && shapeblock.layout.apply_to) || LAYOUT_DEFAULTS.apply_to;
    const [applyTo, setApplyTo] = useState(initialApplyTo);

    // Google Fonts is an external connection, so it stays off until it is
    // switched on here.
    const [googleFonts, setGoogleFonts] = useState(
        !!(shapeblock.layout && shapeblock.layout.google_fonts)
    );

    // Last saved values: the Save button stays faded until something changes.
    const [saved, setSaved] = useState({ containerWidth: initialContainerWidth, applyTo: initialApplyTo, googleFonts: !!(shapeblock.layout && shapeblock.layout.google_fonts) });
    const dirty = saved.containerWidth !== containerWidth || saved.applyTo !== applyTo || saved.googleFonts !== googleFonts;


    const applyContainerWidthToRoot = (px) => {
        if (px === '' || px == null) {
            document.documentElement.style.removeProperty('--shapeblock-layout-row-max-width');
            return;
        }
        document.documentElement.style.setProperty('--shapeblock-layout-row-max-width', `${px}px`);
    };

    const handleContainerWidthChange = (value) => {
        // A cleared field is null; keep it as empty, the theme's width.
        const width = typeof value === 'number' ? value : '';
        setContainerWidth(width);
        applyContainerWidthToRoot(width);
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
            : '';

        const layout = { container_width: containerWidthValue, apply_to: applyTo, google_fonts: googleFonts ? 1 : 0 };
        postJson('layout', { layout })
            .then((res) => {
                const layoutOk = res && res.status === 'success';
                if (layoutOk) {
                    shapeblock.layout = res.layout || layout;
                    setSaved({ containerWidth, applyTo, googleFonts });
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
        setApplyTo(LAYOUT_DEFAULTS.apply_to);
        setGoogleFonts(false);
    };


    // The site-wide settings, one card each, side by side on a wide screen.
    const settingsPanel = (
        <>
            <Row gutter={[20, 20]} align="stretch">
                <Col xs={24} lg={12}>
                    <div className="shapeblock-settings-card">
                        <div className="shapeblock-settings-card__head">
                            <span className="shapeblock-settings-card__icon"><ColumnWidthOutlined /></span>
                            <div>
                                <h2>{ __( 'Content Container', 'shapeblock' ) }</h2>
                                <p>
                                    { createInterpolateElement(
                                        __( 'The boxed content width of the ShapeBlock Row block, saved as the CSS variable <varcode />. Leave it empty to use your theme’s width.', 'shapeblock' ),
                                        { varcode: <code>--shapeblock-layout-row-max-width</code> }
                                    ) }
                                </p>
                            </div>
                        </div>
                        <div className="shapeblock-settings-card__body">
                            <strong>{ __( 'Container Width', 'shapeblock' ) }</strong>
                            <InputNumber
                                min={200}
                                max={3000}
                                step={10}
                                addonAfter="px"
                                value={containerWidth === '' ? null : containerWidth}
                                onChange={handleContainerWidthChange}
                                placeholder={ __( 'Theme default', 'shapeblock' ) }
                                style={{ width: '100%' }}
                            />
                            <strong className="shapeblock-settings-card__label">{ __( 'Apply To', 'shapeblock' ) }</strong>
                            <Radio.Group
                                className="shapeblock-settings-card__choices"
                                value={applyTo}
                                onChange={(e) => setApplyTo(e.target.value)}
                                disabled={containerWidth === ''}
                            >
                                <Radio value="row">{ __( 'ShapeBlock Row only', 'shapeblock' ) }</Radio>
                                <Radio value="wide">{ __( 'Row and wide blocks (the theme’s wide width)', 'shapeblock' ) }</Radio>
                                <Radio value="all">{ __( 'Whole site (the theme’s content and wide width)', 'shapeblock' ) }</Radio>
                            </Radio.Group>
                            <p className="shapeblock-settings-card__note">
                                { __( 'The last two also set the width for core blocks such as Group and Columns, your page content and the theme’s own layout, in the editor as well. Widths saved in the Site Editor’s Styles still take precedence.', 'shapeblock' ) }
                            </p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <div className="shapeblock-settings-card">
                        <div className="shapeblock-settings-card__head">
                            <span className="shapeblock-settings-card__icon"><FontSizeOutlined /></span>
                            <div>
                                <h2>{ __( 'Google Fonts', 'shapeblock' ) }</h2>
                                <p>{ __( 'Off by default. While this is off ShapeBlock never contacts Google: the font pickers offer only the fonts already available on the visitor’s device, and no request is made to fonts.google.com or fonts.googleapis.com.', 'shapeblock' ) }</p>
                            </div>
                        </div>
                        <div className="shapeblock-settings-card__body">
                            <label className="shapeblock-settings-card__switch">
                                <Switch checked={googleFonts} onChange={setGoogleFonts} />
                                <span>{ __( 'Allow ShapeBlock to connect to Google Fonts', 'shapeblock' ) }</span>
                            </label>
                            <p className="shapeblock-settings-card__note">
                                { createInterpolateElement(
                                    __( 'Turning it on lets the editor download the Google Fonts list and lets the front end load the font files you choose from Google’s servers. Your visitors’ IP addresses are then sent to Google — see Google’s <termsLink>terms of service</termsLink> and <privacyLink>privacy policy</privacyLink>.', 'shapeblock' ),
                                    {
                                        termsLink: <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer noopener" />,
                                        privacyLink: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener" />,
                                    }
                                ) }
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="shapeblock-settings-actions">
                <Button type="primary" onClick={handleSave} loading={saving} disabled={!dirty && !saving}>{ dirty || saving ? __( 'Save Changes', 'shapeblock' ) : __( 'Saved', 'shapeblock' ) }</Button>
                <Button onClick={handleReset} disabled={saving}>{ __( 'Reset to Defaults', 'shapeblock' ) }</Button>
            </div>
        </>
    );

    return (
        <div className="shapeblock-options-content">
            <h1 className="shapeblock-options-title">{ __( 'General', 'shapeblock' ) }</h1>
            <p className="shapeblock-settings-intro">{ __( 'Site-wide settings for every ShapeBlock block.', 'shapeblock' ) }</p>
            {settingsPanel}
        </div>
    );
}
