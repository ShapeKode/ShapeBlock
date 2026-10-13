import { useState } from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Row, Col, Button, notification, Checkbox, Radio, Upload, Alert, Space, Tag } from 'antd';
import { DownloadOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';

// The three sections an export file can carry. Values match the REST `include` param.
// Labels are built in a function so they are translated after locale data loads.
const getSections = () => [
    { value: 'settings', label: __( 'Settings (colors, container width, block on/off)', 'shapeblock' ) },
    { value: 'templates', label: __( 'Custom Templates', 'shapeblock' ) },
    { value: 'builder', label: __( 'Theme Builder Templates', 'shapeblock' ) },
];

const ALL_SECTIONS = ['settings', 'templates', 'builder'];

// Export files this plugin can read.
const ACCEPTED_FORMATS = ['shapeblock-export'];

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
    if (data.settings) parts.push(__( 'Settings', 'shapeblock' ));
    if (Array.isArray(data.templates)) {
        parts.push(sprintf(
            /* translators: %d: number of custom templates in the export file. */
            _n( '%d Custom Template', '%d Custom Templates', data.templates.length, 'shapeblock' ),
            data.templates.length
        ));
    }
    if (Array.isArray(data.builder_templates)) {
        parts.push(sprintf(
            /* translators: %d: number of theme builder templates in the export file. */
            _n( '%d Theme Builder Template', '%d Theme Builder Templates', data.builder_templates.length, 'shapeblock' ),
            data.builder_templates.length
        ));
    }
    return parts;
};

export default function ExportImport() {
    const SECTIONS = getSections();

    const [exportSections, setExportSections] = useState(ALL_SECTIONS);
    const [exporting, setExporting] = useState(false);
    const [importFile, setImportFile] = useState(null); // { name, data }
    const [importError, setImportError] = useState('');
    const [importSections, setImportSections] = useState(ALL_SECTIONS);
    const [onDuplicate, setOnDuplicate] = useState('create');
    const [importing, setImporting] = useState(false);

    const postJson = (path, body) =>
        fetch(shapeblock.rest_url + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': shapeblock.nonce,
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());

    // --- Export -----------------------------------------------------------

    const handleExport = () => {
        if (!exportSections.length) {
            notification.warning({ message: __( 'Nothing selected', 'shapeblock' ), description: __( 'Choose at least one section to export.', 'shapeblock' ), duration: 2 });
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

                notification.success({ message: __( 'Export ready', 'shapeblock' ), description: __( 'The export file has been downloaded.', 'shapeblock' ), duration: 2 });
            })
            .catch(() => {
                notification.error({ message: __( 'Export failed', 'shapeblock' ), description: __( 'Could not build the export file. Please try again.', 'shapeblock' ), duration: 3 });
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
                setImportError(__( 'That file is not valid JSON.', 'shapeblock' ));
                return;
            }
            if (!parsed || !ACCEPTED_FORMATS.includes(parsed.format)) {
                setImportError(__( 'That file is not a ShapeBlock export file.', 'shapeblock' ));
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
        reader.onerror = () => setImportError(__( 'The file could not be read.', 'shapeblock' ));
        reader.readAsText(file);

        // Returning false keeps antd from uploading the file itself.
        return false;
    };

    const handleImport = () => {
        if (!importFile) return;
        if (!importSections.length) {
            notification.warning({ message: __( 'Nothing selected', 'shapeblock' ), description: __( 'Choose at least one section to import.', 'shapeblock' ), duration: 2 });
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
                        message: __( 'Import failed', 'shapeblock' ),
                        description: (res && res.message) || __( 'The file could not be imported.', 'shapeblock' ),
                        duration: 4,
                    });
                    return;
                }

                // Keep the in-page globals in step with what was just written.
                if (res.blocks && Array.isArray(shapeblock.blocks)) {
                    shapeblock.blocks = shapeblock.blocks.map((block) => (
                        res.blocks[block.id] ? { ...block, status: res.blocks[block.id] } : block
                    ));
                }
                if (res.layout) {
                    shapeblock.layout = res.layout;
                }

                const r = res.imported || {};
                const lines = [];
                if (importSections.includes('settings')) {
                    lines.push(__( 'Settings restored', 'shapeblock' ));
                }
                if (importSections.includes('templates') && r.templates) {
                    lines.push(sprintf(
                        /* translators: 1: number of custom templates imported, 2: number of custom templates skipped. */
                        __( 'Custom Templates: %1$d imported, %2$d skipped', 'shapeblock' ),
                        r.templates.imported,
                        r.templates.skipped
                    ));
                }
                if (importSections.includes('builder') && r.builder_templates) {
                    lines.push(sprintf(
                        /* translators: 1: number of theme builder templates imported, 2: number of theme builder templates skipped. */
                        __( 'Theme Builder: %1$d imported, %2$d skipped', 'shapeblock' ),
                        r.builder_templates.imported,
                        r.builder_templates.skipped
                    ));
                }

                notification.success({
                    message: __( 'Import complete', 'shapeblock' ),
                    description: sprintf(
                        /* translators: %s: summary of what was imported. */
                        __( '%s. Reload the page to see everything.', 'shapeblock' ),
                        lines.join('. ')
                    ),
                    duration: 5,
                });

                setImportFile(null);
                setImportError('');
            })
            .catch(() => {
                notification.error({ message: __( 'Import failed', 'shapeblock' ), description: __( 'The file could not be imported. Please try again.', 'shapeblock' ), duration: 4 });
            })
            .finally(() => setImporting(false));
    };

    const fileSummary = importFile ? describeFile(importFile.data) : [];

    return (
        <div className="shapeblock-options-content">
            <h1 className="shapeblock-options-title">{ __( 'Export & Import', 'shapeblock' ) }</h1>
            <p style={{ marginTop: 0, color: '#555' }}>
                { __( 'Move your ShapeBlock setup between sites. The export file is plain JSON holding your settings, custom templates and theme builder templates.', 'shapeblock' ) }
            </p>

            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <div style={{ padding: 20, background: '#f7f8fb', borderRadius: 8, height: '100%' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>{ __( 'Export', 'shapeblock' ) }</h3>
                        <p style={{ color: '#555', marginTop: 0 }}>{ __( 'Choose what to include, then download the file.', 'shapeblock' ) }</p>

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
                                { __( 'Export', 'shapeblock' ) }
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={12}>
                    <div style={{ padding: 20, background: '#f7f8fb', borderRadius: 8, height: '100%' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>{ __( 'Import', 'shapeblock' ) }</h3>
                        <p style={{ color: '#555', marginTop: 0 }}>{ __( 'Upload a ShapeBlock export file.', 'shapeblock' ) }</p>

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
                            <p className="ant-upload-text">{ __( 'Click or drag a .json file here', 'shapeblock' ) }</p>
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
                                                : <span>{ __( 'This file is empty.', 'shapeblock' ) }</span>}
                                        </Space>
                                    }
                                />

                                <div style={{ marginTop: 16 }}>
                                    <strong style={{ display: 'block', marginBottom: 8 }}>{ __( 'Import', 'shapeblock' ) }</strong>
                                    <Checkbox.Group
                                        value={importSections}
                                        onChange={setImportSections}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                        options={SECTIONS}
                                    />
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <strong style={{ display: 'block', marginBottom: 8 }}>{ __( 'If a template with the same name exists', 'shapeblock' ) }</strong>
                                    <Radio.Group value={onDuplicate} onChange={(e) => setOnDuplicate(e.target.value)}>
                                        <Radio value="create">{ __( 'Import anyway', 'shapeblock' ) }</Radio>
                                        <Radio value="skip">{ __( 'Skip it', 'shapeblock' ) }</Radio>
                                    </Radio.Group>
                                </div>

                                <Alert
                                    type="warning"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                    message={ __( 'Importing settings overwrites your current colors, container width and block on/off states.', 'shapeblock' ) }
                                />

                                <div style={{ marginTop: 16 }}>
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={handleImport}
                                        loading={importing}
                                        disabled={!importSections.length}
                                    >
                                        { __( 'Import', 'shapeblock' ) }
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
