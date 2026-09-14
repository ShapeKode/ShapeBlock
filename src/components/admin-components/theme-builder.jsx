import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table, Button, Input, Space, Modal, Form, Select,
    notification, Popconfirm, Tag, Segmented, Tooltip
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined, FilterOutlined, CopyOutlined,
    UndoOutlined
} from '@ant-design/icons';

const { Search } = Input;

import BuilderConditionsModal from './builder-conditions-modal';

/**
 * Theme Builder — manage header/footer (and future) templates.
 *
 * Template types are driven entirely by shapeblock.builderTypes (the PHP registry),
 * so adding a future type server-side surfaces it here with no UI changes.
 *
 * Deleting a template moves it to Trash first; from the Trash view it can be
 * restored or deleted permanently.
 */
export default function ThemeBuilder() {
    const builderTypes = useMemo(
        () => (typeof shapeblock !== 'undefined' && shapeblock.builderTypes) || [],
        []
    );

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(''); // '' = all
    const [statusView, setStatusView] = useState('publish'); // 'publish' = active, 'trash' = trashed
    const [trashCount, setTrashCount] = useState(0);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [addOpen, setAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [conditionsItem, setConditionsItem] = useState(null);

    const isTrashView = statusView === 'trash';

    const fetchItems = useCallback((page = 1, pageSize = 10, searchVal = '', type = '', status = 'publish') => {
        setLoading(true);
        const params = new URLSearchParams({ page, per_page: pageSize, search: searchVal, type, status });
        // rest_url may be the plain-permalink form (index.php?rest_route=/shapeblock/v1/),
        // in which case query args must be appended with "&", not "?".
        const sep = shapeblock.rest_url.includes('?') ? '&' : '?';
        fetch(`${shapeblock.rest_url}builder${sep}${params}`, {
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                setItems(data.items || []);
                setTrashCount(typeof data.trashTotal === 'number' ? data.trashTotal : 0);
                setPagination((prev) => ({
                    ...prev,
                    current: data.page || 1,
                    total: data.total || 0,
                    pageSize: data.per_page || pageSize,
                }));
            })
            .catch(() => notification.error({ message: 'Failed to load templates' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeFilter]);

    const refresh = () => fetchItems(pagination.current, pagination.pageSize, search, typeFilter, statusView);

    const handleTableChange = (pag) => {
        fetchItems(pag.current, pag.pageSize, search, typeFilter, statusView);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setSelectedRowKeys([]);
        fetchItems(1, pagination.pageSize, value, typeFilter, statusView);
    };

    const changeStatusView = (value) => {
        setStatusView(value);
        setSelectedRowKeys([]);
        fetchItems(1, pagination.pageSize, search, typeFilter, value);
    };

    const openAdd = () => {
        form.resetFields();
        // Default the type select to the active filter or the first registered type.
        const defaultType = typeFilter || (builderTypes[0] && builderTypes[0].slug);
        form.setFieldsValue({ type: defaultType });
        setAddOpen(true);
    };

    const handleCreate = () => {
        form.validateFields().then((values) => {
            setSubmitting(true);
            fetch(`${shapeblock.rest_url}builder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': shapeblock.nonce },
                body: JSON.stringify(values),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.id) {
                        notification.success({ message: 'Template created', duration: 2 });
                        setAddOpen(false);
                        form.resetFields();
                        // Jump straight into the block editor for the new template.
                        if (data.editUrl) {
                            window.location.href = data.editUrl;
                            return;
                        }
                        refresh();
                    } else {
                        notification.error({ message: data.message || 'Create failed' });
                    }
                })
                .catch(() => notification.error({ message: 'Request failed' }))
                .finally(() => setSubmitting(false));
        });
    };

    // Move a template to Trash (first delete).
    const handleTrash = (id) => {
        fetch(`${shapeblock.rest_url}builder/${id}`, {
            method: 'DELETE',
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    notification.success({ message: 'Template moved to Trash', duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: 'Delete failed' }));
    };

    // Permanently delete a trashed template.
    const handlePermanentDelete = (id) => {
        const sep = shapeblock.rest_url.includes('?') ? '&' : '?';
        fetch(`${shapeblock.rest_url}builder/${id}${sep}force=1`, {
            method: 'DELETE',
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    notification.success({ message: 'Template permanently deleted', duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: 'Delete failed' }));
    };

    // Restore a trashed template.
    const handleRestore = (id) => {
        fetch(`${shapeblock.rest_url}builder/${id}/restore`, {
            method: 'POST',
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    notification.success({ message: 'Template restored', duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: 'Restore failed' }));
    };

    const handleBulkTrash = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: 'No templates selected' });
            return;
        }
        Modal.confirm({
            title: `Move ${selectedRowKeys.length} template(s) to Trash?`,
            content: 'You can restore them from the Trash later.',
            okText: 'Move to Trash',
            okType: 'danger',
            onOk: () => {
                fetch(`${shapeblock.rest_url}builder/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': shapeblock.nonce },
                    body: JSON.stringify({ ids: selectedRowKeys }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.status === 'success') {
                            notification.success({
                                message: `${data.deleted.length} template(s) moved to Trash`,
                                duration: 2,
                            });
                            setSelectedRowKeys([]);
                            fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                        }
                    })
                    .catch(() => notification.error({ message: 'Bulk delete failed' }));
            },
        });
    };

    const handleBulkPermanentDelete = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: 'No templates selected' });
            return;
        }
        Modal.confirm({
            title: `Permanently delete ${selectedRowKeys.length} template(s)?`,
            content: 'This action cannot be undone.',
            okText: 'Delete Permanently',
            okType: 'danger',
            onOk: () => {
                fetch(`${shapeblock.rest_url}builder/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': shapeblock.nonce },
                    body: JSON.stringify({ ids: selectedRowKeys, force: true }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.status === 'success') {
                            notification.success({
                                message: `${data.deleted.length} template(s) permanently deleted`,
                                duration: 2,
                            });
                            setSelectedRowKeys([]);
                            fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                        }
                    })
                    .catch(() => notification.error({ message: 'Bulk delete failed' }));
            },
        });
    };

    const handleBulkRestore = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: 'No templates selected' });
            return;
        }
        fetch(`${shapeblock.rest_url}builder/bulk-restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': shapeblock.nonce },
            body: JSON.stringify({ ids: selectedRowKeys }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    notification.success({
                        message: `${data.restored.length} template(s) restored`,
                        duration: 2,
                    });
                    setSelectedRowKeys([]);
                    fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                }
            })
            .catch(() => notification.error({ message: 'Bulk restore failed' }));
    };

    const onConditionsSaved = (data) => {
        // Patch the row's summary in place without a full refetch.
        setItems((prev) => prev.map((row) =>
            row.id === (conditionsItem && conditionsItem.id)
                ? { ...row, conditions: data.conditions, conditionsSummary: data.summary }
                : row
        ));
    };

    const typeFilterOptions = useMemo(() => ([
        { label: 'All', value: '' },
        ...builderTypes.map((t) => ({ label: t.plural || t.label, value: t.slug })),
    ]), [builderTypes]);

    // Types flagged as shortcode-only ( e.g. Custom Block ): rendered via [shapeblock_builder id="…"],
    // so we show that copyable shortcode instead of Display Conditions.
    const shortcodeTypes = useMemo(
        () => builderTypes.filter((t) => t.shortcode).map((t) => t.slug),
        [builderTypes]
    );
    const shortcodeFor = (record) => `[shapeblock_builder id="${record.id}"]`;
    const copyShortcode = (record) => {
        const sc = shortcodeFor(record);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sc).then(
                () => notification.success({ message: 'Shortcode copied', duration: 2 }),
                () => notification.info({ message: sc })
            );
        } else {
            notification.info({ message: sc });
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                isTrashView
                    ? <span style={{ fontWeight: 600 }}>{title || '(no title)'}</span>
                    : <a href={record.editUrl} style={{ fontWeight: 600 }}>{title || '(no title)'}</a>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'typeLabel',
            key: 'type',
            width: 120,
            render: (label, record) => <Tag color="purple">{label || record.type}</Tag>,
        },
        {
            title: 'Display Conditions',
            dataIndex: 'conditionsSummary',
            key: 'conditions',
            render: (summary, record) => (
                shortcodeTypes.includes(record.type) ? (
                    // Custom Block: no auto-display — show its shortcode to place anywhere.
                    <Space size={4}>
                        <Tag color="blue" style={{ fontFamily: 'monospace' }}>{shortcodeFor(record)}</Tag>
                        {!isTrashView && (
                            <Tooltip title="Copy shortcode">
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() => copyShortcode(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                ) : (
                    <Space size={4}>
                        <Tag color="default">{summary || 'Entire Site'}</Tag>
                        {!isTrashView && (
                            <Tooltip title="Edit conditions">
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<FilterOutlined />}
                                    onClick={() => setConditionsItem(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                )
            ),
        },
        {
            title: 'Modified',
            dataIndex: 'modified',
            key: 'modified',
            width: 170,
            render: (date) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: isTrashView ? 210 : 160,
            render: (_, record) => (
                isTrashView ? (
                    <Space>
                        <Popconfirm
                            title="Restore this template?"
                            onConfirm={() => handleRestore(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" size="small" icon={<UndoOutlined />}>
                                Restore
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title="Delete permanently? This cannot be undone."
                            onConfirm={() => handlePermanentDelete(record.id)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            cancelText="Cancel"
                        >
                            <Button danger size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Space>
                        <Button type="primary" size="small" icon={<EditOutlined />} href={record.editUrl}>
                            Edit
                        </Button>
                        {shortcodeTypes.includes(record.type) ? (
                            <Tooltip title="Copy shortcode">
                                <Button size="small" icon={<CopyOutlined />} onClick={() => copyShortcode(record)} />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Edit conditions">
                                <Button size="small" icon={<FilterOutlined />} onClick={() => setConditionsItem(record)} />
                            </Tooltip>
                        )}
                        <Popconfirm
                            title="Move this template to Trash?"
                            onConfirm={() => handleTrash(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                )
            ),
        },
    ];

    return (
        <div className="shapeblock-options-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h1 className="shapeblock-options-title" style={{ margin: 0 }}>Theme Builder</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add New</Button>
            </div>

            <p style={{ color: '#666', marginTop: 0, marginBottom: 16 }}>
                Build custom headers and footers and control exactly where they appear.
                More template types are coming soon.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                <Space wrap>
                    <Segmented
                        options={[
                            { label: 'Active', value: 'publish' },
                            {
                                label: trashCount > 0 ? `Trash (${trashCount})` : 'Trash',
                                value: 'trash',
                            },
                        ]}
                        value={statusView}
                        onChange={changeStatusView}
                    />
                    <Segmented
                        options={typeFilterOptions}
                        value={typeFilter}
                        onChange={setTypeFilter}
                    />
                    {isTrashView ? (
                        <>
                            <Button disabled={selectedRowKeys.length === 0} icon={<UndoOutlined />} onClick={handleBulkRestore}>
                                Restore Selected
                            </Button>
                            <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBulkPermanentDelete}>
                                Delete Permanently
                            </Button>
                        </>
                    ) : (
                        <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBulkTrash}>
                            Delete Selected
                        </Button>
                    )}
                    {selectedRowKeys.length > 0 && <Tag>{selectedRowKeys.length} selected</Tag>}
                </Space>
                <Space>
                    <Search
                        placeholder="Search templates..."
                        allowClear
                        className='shapeblock-template-search-box'
                        onSearch={handleSearch}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSearch(v);
                            setSelectedRowKeys([]);
                            clearTimeout(window.__shapeblockTbSearchT);
                            window.__shapeblockTbSearchT = setTimeout(() => fetchItems(1, pagination.pageSize, v, typeFilter, statusView), 300);
                        }}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                    />
                    <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchItems(1, pagination.pageSize, '', typeFilter, statusView); }} />
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={items}
                loading={loading}
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                onChange={handleTableChange}
                size="middle"
            />

            <Modal
                title="Add New Template"
                open={addOpen}
                onOk={handleCreate}
                onCancel={() => { setAddOpen(false); form.resetFields(); }}
                confirmLoading={submitting}
                okText="Create & Edit"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Template Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder="e.g. Main Header" />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Template Type"
                        rules={[{ required: true, message: 'Please choose a type' }]}
                    >
                        <Select
                            placeholder="Select type"
                            options={builderTypes.map((t) => ({
                                value: t.slug,
                                label: t.label,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <BuilderConditionsModal
                open={!!conditionsItem}
                item={conditionsItem}
                onClose={() => setConditionsItem(null)}
                onSaved={onConditionsSaved}
            />
        </div>
    );
}
