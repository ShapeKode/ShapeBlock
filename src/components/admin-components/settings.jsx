import { useState } from 'react';
import { Row, Col, Button, InputNumber, notification, Checkbox, Radio, Upload, Alert, Divider, Space, Tag } from 'antd';
import { DownloadOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';

// Guarded: this runs at module-eval time, and the same bundle is also loaded in
// the block editor where the `shapeblock` global is not localized.
const LAYOUT_DEFAULTS = (typeof shapeblock !== 'undefined' && shapeblock.layoutDefaults) || { container_width: '1200px' };

// The three sections an export file can carry. Values match the REST `include` param.
const SECTIONS = [
    { value: 'settings', label: 'Settings (colors, container width, block on/off)' },
    { value: 'templates', label: 'Custom Templates' },
    { value: 'builder', label: 'Theme Builder Templates' },
];

const ALL_SECTIONS = SECTIONS.map((s) => s.value);

// Export files this plugin can read. Easy Elements For Gutenberg is the former
// name of this plugin and ships the same blocks, so its files import here after
// a block-namespace rewrite handled server side.
const ACCEPTED_FORMATS = ['shapeblock-export', 'easy-elements-for-gutenberg-export'];

// Strip the unit suffix for the numeric input. Sanitize on save adds "px" back.
const parseContainerWidth = (value) => {
    if (value === '' || value == null) return '';
    const m = String(value).match(/^([0-9]*\.?[0-9]+)/);
    return m ? parseFloat(m[1]) : '';
};

// yyyy-mm-dd for the export filename.
const todayStamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Count what an already-parsed export file contains, for the preview line.
const describeFile = (data) => {
    if (!data || typeof data !== 'object') return [];
    const parts = [];
    if (data.settings) parts.push('Settings');
    if (Array.isArray(data.templates)) parts.push(`${data.templates.length} Custom Template${data.templates.length === 1 ? '' : 's'}`);
    if (Array.isArray(data.builder_templates)) parts.push(`${data.builder_templates.length} Theme Builder Template${data.builder_templates.length === 1 ? '' : 's'}`);
    return parts;
};

export default function Settings() {
    const [saving, setSaving] = useState(false);

    const initialContainerWidth = parseContainerWidth(
        (shapeblock.layout && shapeblock.layout.container_width) || LAYOUT_DEFAULTS.container_width
    );
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);

    // Export / Import state
    const [exportSections, setExportSections] = useState(ALL_SECTIONS);
    const [exporting, setExporting] = useState(false);
    const [importFile, setImportFile] = useState(null); // { name, data }
    const [importError, setImportError] = useState('');
    const [importSections, setImportSections] = useState(ALL_SECTIONS);
    const [onDuplicate, setOnDuplicate] = useState('create');
    const [importing, setImporting] = useState(false);

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

        postJson('layout', { layout: { container_width: containerWidthValue } })
            .then((res) => {
                const layoutOk = res && res.status === 'success';
                if (layoutOk) {
                    shapeblock.layout = res.layout || { container_width: containerWidthValue };
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

    // --- Export -----------------------------------------------------------

    const handleExport = () => {
        if (!exportSections.length) {
            notification.warning({ message: 'Nothing Selected', description: 'Choose at least one section to export.', duration: 2 });
            return;
        }

        setExporting(true);

        fetch(`${shapeblock.rest_url}export?include=${encodeURIComponent(exportSections.join(','))}`, {
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `shapeblock-export-${todayStamp()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                notification.success({ message: 'Export Ready', description: 'The export file has been downloaded.', duration: 2 });
            })
            .catch(() => {
                notification.error({ message: 'Export Failed', description: 'Could not build the export file. Please try again.', duration: 3 });
            })
            .finally(() => setExporting(false));
    };

    // --- Import -----------------------------------------------------------

    // Read the chosen file locally and validate it before anything is sent.
    const readImportFile = (file) => {
        setImportError('');
        setImportFile(null);

        const reader = new FileReader();
        reader.onload = () => {
            let parsed;
            try {
                parsed = JSON.parse(reader.result);
            } catch (e) {
                setImportError('That file is not valid JSON.');
                return;
            }
            if (!parsed || !ACCEPTED_FORMATS.includes(parsed.format)) {
                setImportError('That file is not a ShapeBlock or Easy Elements export file.');
                return;
            }
            setImportFile({ name: file.name, data: parsed });
            // Preselect only the sections the file actually contains.
            setImportSections(ALL_SECTIONS.filter((s) => {
                if (s === 'settings') return !!parsed.settings;
                if (s === 'templates') return Array.isArray(parsed.templates) && parsed.templates.length > 0;
                return Array.isArray(parsed.builder_templates) && parsed.builder_templates.length > 0;
            }));
        };
        reader.onerror = () => setImportError('The file could not be read.');
        reader.readAsText(file);

        // Returning false keeps antd from uploading the file itself.
        return false;
    };

    const handleImport = () => {
        if (!importFile) return;
        if (!importSections.length) {
            notification.warning({ message: 'Nothing Selected', description: 'Choose at least one section to import.', duration: 2 });
            return;
        }

        setImporting(true);

        postJson('import', {
            data: importFile.data,
            include: importSections,
            on_duplicate: onDuplicate,
        })
            .then((res) => {
                if (!res || res.status !== 'success') {
                    notification.error({
                        message: 'Import Failed',
                        description: (res && res.message) || 'The file could not be imported.',
                        duration: 4,
                    });
                    return;
                }

                // Keep the in-page globals in step with what was just written.
                if (res.colors) shapeblock.colors = res.colors;
                if (res.blocks && Array.isArray(shapeblock.blocks)) {
                    shapeblock.blocks = shapeblock.blocks.map((block) => (
                        res.blocks[block.id] ? { ...block, status: res.blocks[block.id] } : block
                    ));
                }
                if (res.layout) {
                    shapeblock.layout = res.layout;
                    const width = parseContainerWidth(res.layout.container_width);
                    setContainerWidth(width);
                    applyContainerWidthToRoot(width);
                }

                const r = res.imported || {};
                const lines = [];
                if (res.migrated) {
                    lines.push('Blocks retargeted from Easy Elements to ShapeBlock');
                }
                if (importSections.includes('settings')) {
                    lines.push('Settings restored');
                }
                if (importSections.includes('templates') && r.templates) {
                    lines.push(`Custom Templates: ${r.templates.imported} imported, ${r.templates.skipped} skipped`);
                }
                if (importSections.includes('builder') && r.builder_templates) {
                    lines.push(`Theme Builder: ${r.builder_templates.imported} imported, ${r.builder_templates.skipped} skipped`);
                }

                notification.success({
                    message: 'Import Complete',
                    description: `${lines.join('. ')}. Reload the page to see everything.`,
                    duration: 5,
                });

                setImportFile(null);
                setImportError('');
            })
            .catch(() => {
                notification.error({ message: 'Import Failed', description: 'The file could not be imported. Please try again.', duration: 4 });
            })
            .finally(() => setImporting(false));
    };

    const fileSummary = importFile ? describeFile(importFile.data) : [];

    return (
        <div className="shapeblock-options-content">
            <h1 className="shapeblock-options-title">Settings</h1>

            <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0 }}>Content Container</h2>
            <p style={{ marginTop: 0, color: '#555' }}>
                Sets the boxed content max-width used by the shapeblock Row block. Stored as
                the CSS variable <code>--shapeblock-layout-row-max-width</code> on <code>:root</code>.
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

            <Divider style={{ margin: '32px 0 24px' }} />

            <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0 }}>Export &amp; Import</h2>
            <p style={{ marginTop: 0, color: '#555' }}>
                Move your ShapeBlock setup between sites. The export file is plain JSON holding your
                settings, custom templates and theme builder templates.
            </p>

            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <div style={{ padding: 20, background: '#f7f8fb', borderRadius: 8, height: '100%' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>Export</h3>
                        <p style={{ color: '#555', marginTop: 0 }}>Choose what to include, then download the file.</p>

                        <Checkbox.Group
                            value={exportSections}
                            onChange={setExportSections}
                            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                            options={SECTIONS}
                        />

                        <div style={{ marginTop: 20 }}>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                loading={exporting}
                                disabled={!exportSections.length}
                            >
                                Export
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={12}>
                    <div style={{ padding: 20, background: '#f7f8fb', borderRadius: 8, height: '100%' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>Import</h3>
                        <p style={{ color: '#555', marginTop: 0 }}>Upload a ShapeBlock or Easy Elements For Gutenberg export file.</p>

                        <Upload.Dragger
                            accept=".json,application/json"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={readImportFile}
                            style={{ background: '#fff' }}
                        >
                            <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag a .json file here</p>
                        </Upload.Dragger>

                        {importError && (
                            <Alert type="error" showIcon message={importError} style={{ marginTop: 12 }} />
                        )}

                        {importFile && (
                            <div style={{ marginTop: 12 }}>
                                <Alert
                                    type="success"
                                    showIcon
                                    message={importFile.name}
                                    description={
                                        <Space size={[4, 4]} wrap>
                                            {fileSummary.length
                                                ? fileSummary.map((part) => <Tag key={part}>{part}</Tag>)
                                                : <span>This file is empty.</span>}
                                        </Space>
                                    }
                                />

                                <div style={{ marginTop: 16 }}>
                                    <strong style={{ display: 'block', marginBottom: 8 }}>Import</strong>
                                    <Checkbox.Group
                                        value={importSections}
                                        onChange={setImportSections}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                        options={SECTIONS}
                                    />
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <strong style={{ display: 'block', marginBottom: 8 }}>If a template with the same name exists</strong>
                                    <Radio.Group value={onDuplicate} onChange={(e) => setOnDuplicate(e.target.value)}>
                                        <Radio value="create">Import anyway</Radio>
                                        <Radio value="skip">Skip it</Radio>
                                    </Radio.Group>
                                </div>

                                <Alert
                                    type="warning"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                    message="Importing settings overwrites your current colors, container width and block on/off states."
                                />

                                <div style={{ marginTop: 16 }}>
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={handleImport}
                                        loading={importing}
                                        disabled={!importSections.length}
                                    >
                                        Import
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}
