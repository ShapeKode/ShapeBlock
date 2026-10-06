import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
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
            .catch(() => notification.error({ message: __( 'Failed to load templates', 'shapeblock' ) }))
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
                        notification.success({ message: __( 'Template created', 'shapeblock' ), duration: 2 });
                        setAddOpen(false);
                        form.resetFields();
                        // Jump straight into the block editor for the new template.
                        if (data.editUrl) {
                            window.location.href = data.editUrl;
                            return;
                        }
                        refresh();
                    } else {
                        notification.error({ message: data.message || __( 'Create failed', 'shapeblock' ) });
                    }
                })
                .catch(() => notification.error({ message: __( 'Request failed', 'shapeblock' ) }))
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
                    notification.success({ message: __( 'Template moved to Trash', 'shapeblock' ), duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: __( 'Delete failed', 'shapeblock' ) }));
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
                    notification.success({ message: __( 'Template permanently deleted', 'shapeblock' ), duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: __( 'Delete failed', 'shapeblock' ) }));
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
                    notification.success({ message: __( 'Template restored', 'shapeblock' ), duration: 2 });
                    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
                    refresh();
                }
            })
            .catch(() => notification.error({ message: __( 'Restore failed', 'shapeblock' ) }));
    };

    const handleBulkTrash = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: __( 'No templates selected', 'shapeblock' ) });
            return;
        }
        Modal.confirm({
            title: sprintf(
                /* translators: %d: number of templates. */
                _n( 'Move %d template to Trash?', 'Move %d templates to Trash?', selectedRowKeys.length, 'shapeblock' ),
                selectedRowKeys.length
            ),
            content: __( 'You can restore them from the Trash later.', 'shapeblock' ),
            okText: __( 'Move to Trash', 'shapeblock' ),
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
                                message: sprintf(
                                    /* translators: %d: number of templates. */
                                    _n( '%d template moved to Trash', '%d templates moved to Trash', data.deleted.length, 'shapeblock' ),
                                    data.deleted.length
                                ),
                                duration: 2,
                            });
                            setSelectedRowKeys([]);
                            fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                        }
                    })
                    .catch(() => notification.error({ message: __( 'Bulk delete failed', 'shapeblock' ) }));
            },
        });
    };

    const handleBulkPermanentDelete = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: __( 'No templates selected', 'shapeblock' ) });
            return;
        }
        Modal.confirm({
            title: sprintf(
                /* translators: %d: number of templates. */
                _n( 'Permanently delete %d template?', 'Permanently delete %d templates?', selectedRowKeys.length, 'shapeblock' ),
                selectedRowKeys.length
            ),
            content: __( 'This action cannot be undone.', 'shapeblock' ),
            okText: __( 'Delete Permanently', 'shapeblock' ),
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
                                message: sprintf(
                                    /* translators: %d: number of templates. */
                                    _n( '%d template permanently deleted', '%d templates permanently deleted', data.deleted.length, 'shapeblock' ),
                                    data.deleted.length
                                ),
                                duration: 2,
                            });
                            setSelectedRowKeys([]);
                            fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                        }
                    })
                    .catch(() => notification.error({ message: __( 'Bulk delete failed', 'shapeblock' ) }));
            },
        });
    };

    const handleBulkRestore = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: __( 'No templates selected', 'shapeblock' ) });
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
                        message: sprintf(
                                /* translators: %d: number of templates. */
                                _n( '%d template restored', '%d templates restored', data.restored.length, 'shapeblock' ),
                                data.restored.length
                            ),
                        duration: 2,
                    });
                    setSelectedRowKeys([]);
                    fetchItems(1, pagination.pageSize, search, typeFilter, statusView);
                }
            })
            .catch(() => notification.error({ message: __( 'Bulk restore failed', 'shapeblock' ) }));
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
        { label: __( 'All', 'shapeblock' ), value: '' },
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
                () => notification.success({ message: __( 'Shortcode copied', 'shapeblock' ), duration: 2 }),
                () => notification.info({ message: sc })
            );
        } else {
            notification.info({ message: sc });
        }
    };

    const columns = [
        {
            title: __( 'Title', 'shapeblock' ),
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                isTrashView
                    ? <span style={{ fontWeight: 600 }}>{title || __( '(no title)', 'shapeblock' )}</span>
                    : <a href={record.editUrl} style={{ fontWeight: 600 }}>{title || __( '(no title)', 'shapeblock' )}</a>
            ),
        },
        {
            title: __( 'Type', 'shapeblock' ),
            dataIndex: 'typeLabel',
            key: 'type',
            width: 120,
            render: (label, record) => <Tag color="purple">{label || record.type}</Tag>,
        },
        {
            title: __( 'Display Conditions', 'shapeblock' ),
            dataIndex: 'conditionsSummary',
            key: 'conditions',
            render: (summary, record) => (
                shortcodeTypes.includes(record.type) ? (
                    // Custom Block: no auto-display — show its shortcode to place anywhere.
                    <Space size={4}>
                        <Tag color="blue" style={{ fontFamily: 'monospace' }}>{shortcodeFor(record)}</Tag>
                        {!isTrashView && (
                            <Tooltip title={ __( 'Copy shortcode', 'shapeblock' ) }>
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<CopyOutlined />}
                                    aria-label={ __( 'Copy shortcode', 'shapeblock' ) }
                                    onClick={() => copyShortcode(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                ) : (
                    <Space size={4}>
                        <Tag color="default">{summary || __( 'Entire Site', 'shapeblock' )}</Tag>
                        {!isTrashView && (
                            <Tooltip title={ __( 'Edit conditions', 'shapeblock' ) }>
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<FilterOutlined />}
                                    aria-label={ __( 'Edit conditions', 'shapeblock' ) }
                                    onClick={() => setConditionsItem(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                )
            ),
        },
        {
            title: __( 'Modified', 'shapeblock' ),
            dataIndex: 'modified',
            key: 'modified',
            width: 170,
            render: (date) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }),
        },
        {
            title: __( 'Actions', 'shapeblock' ),
            key: 'actions',
            width: isTrashView ? 210 : 160,
            render: (_, record) => (
                isTrashView ? (
                    <Space>
                        <Popconfirm
                            title={ __( 'Restore this template?', 'shapeblock' ) }
                            onConfirm={() => handleRestore(record.id)}
                            okText={ __( 'Yes', 'shapeblock' ) }
                            cancelText={ __( 'No', 'shapeblock' ) }
                        >
                            <Button type="primary" size="small" icon={<UndoOutlined />}>
                                { __( 'Restore', 'shapeblock' ) }
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title={ __( 'Delete permanently? This cannot be undone.', 'shapeblock' ) }
                            onConfirm={() => handlePermanentDelete(record.id)}
                            okText={ __( 'Delete', 'shapeblock' ) }
                            okButtonProps={{ danger: true }}
                            cancelText={ __( 'Cancel', 'shapeblock' ) }
                        >
                            <Button danger size="small" icon={<DeleteOutlined />}>
                                { __( 'Delete', 'shapeblock' ) }
                            </Button>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Space>
                        <Button type="primary" size="small" icon={<EditOutlined />} href={record.editUrl}>
                            { __( 'Edit', 'shapeblock' ) }
                        </Button>
                        {shortcodeTypes.includes(record.type) ? (
                            <Tooltip title={ __( 'Copy shortcode', 'shapeblock' ) }>
                                <Button size="small" icon={<CopyOutlined />} aria-label={ __( 'Copy shortcode', 'shapeblock' ) } onClick={() => copyShortcode(record)} />
                            </Tooltip>
                        ) : (
                            <Tooltip title={ __( 'Edit conditions', 'shapeblock' ) }>
                                <Button size="small" icon={<FilterOutlined />} aria-label={ __( 'Edit conditions', 'shapeblock' ) } onClick={() => setConditionsItem(record)} />
                            </Tooltip>
                        )}
                        <Popconfirm
                            title={ __( 'Move this template to Trash?', 'shapeblock' ) }
                            onConfirm={() => handleTrash(record.id)}
                            okText={ __( 'Yes', 'shapeblock' ) }
                            cancelText={ __( 'No', 'shapeblock' ) }
                        >
                            <Button danger size="small" icon={<DeleteOutlined />} aria-label={ __( 'Move to Trash', 'shapeblock' ) } />
                        </Popconfirm>
                    </Space>
                )
            ),
        },
    ];

    return (
        <div className="shapeblock-options-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h1 className="shapeblock-options-title" style={{ margin: 0 }}>{ __( 'Theme Builder', 'shapeblock' ) }</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>{ __( 'Add New', 'shapeblock' ) }</Button>
            </div>

            <p style={{ color: '#666', marginTop: 0, marginBottom: 16 }}>
                { __( 'Build custom headers and footers and control exactly where they appear.', 'shapeblock' ) }
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                <Space wrap>
                    <Segmented
                        options={[
                            { label: __( 'Active', 'shapeblock' ), value: 'publish' },
                            {
                                label: trashCount > 0
                                    ? sprintf(
                                        /* translators: %d: number of trashed templates. */
                                        __( 'Trash (%d)', 'shapeblock' ),
                                        trashCount
                                    )
                                    : __( 'Trash', 'shapeblock' ),
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
                                { __( 'Restore Selected', 'shapeblock' ) }
                            </Button>
                            <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBulkPermanentDelete}>
                                { __( 'Delete Permanently', 'shapeblock' ) }
                            </Button>
                        </>
                    ) : (
                        <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBulkTrash}>
                            { __( 'Delete Selected', 'shapeblock' ) }
                        </Button>
                    )}
                    {selectedRowKeys.length > 0 && (
                        <Tag>
                            {sprintf(
                                /* translators: %d: number of selected templates. */
                                __( '%d selected', 'shapeblock' ),
                                selectedRowKeys.length
                            )}
                        </Tag>
                    )}
                </Space>
                <Space>
                    <Search
                        placeholder={ __( 'Search templates...', 'shapeblock' ) }
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
                    <Button icon={<ReloadOutlined />} aria-label={ __( 'Reload', 'shapeblock' ) } onClick={() => { setSearch(''); fetchItems(1, pagination.pageSize, '', typeFilter, statusView); }} />
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
                    showTotal: (total, range) => sprintf(
                        /* translators: 1: first item number on the page, 2: last item number on the page, 3: total number of items. */
                        __( '%1$d-%2$d of %3$d items', 'shapeblock' ),
                        range[0],
                        range[1],
                        total
                    ),
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                onChange={handleTableChange}
                size="middle"
            />

            <Modal
                title={ __( 'Add New Template', 'shapeblock' ) }
                open={addOpen}
                onOk={handleCreate}
                onCancel={() => { setAddOpen(false); form.resetFields(); }}
                confirmLoading={submitting}
                okText={ __( 'Create & Edit', 'shapeblock' ) }
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label={ __( 'Template Name', 'shapeblock' ) }
                        rules={[{ required: true, message: __( 'Please enter a name', 'shapeblock' ) }]}
                    >
                        <Input placeholder={ __( 'e.g. Main Header', 'shapeblock' ) } />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label={ __( 'Template Type', 'shapeblock' ) }
                        rules={[{ required: true, message: __( 'Please choose a type', 'shapeblock' ) }]}
                    >
                        <Select
                            placeholder={ __( 'Select type', 'shapeblock' ) }
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
