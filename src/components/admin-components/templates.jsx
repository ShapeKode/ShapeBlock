import React, { useState, useEffect, useCallback } from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
    Table, Button, Input, Space, Modal, Form,
    notification, Popconfirm, Tag, Select, Segmented
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined, CopyOutlined,
    UndoOutlined
} from '@ant-design/icons';

const { Search } = Input;

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [search, setSearch] = useState('');
    const [sorter, setSorter] = useState({ field: 'date', order: 'descend' });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [templateCount, setTemplateCount] = useState(Number(shapeblock.templateCount) || 0);
    const [trashCount, setTrashCount] = useState(0);
    const [viewStatus, setViewStatus] = useState('publish');

    const isTrashView = viewStatus === 'trash';

    const orderParam = () => (sorter.order === 'ascend' ? 'ASC' : 'DESC');

    const fetchTemplates = useCallback((page = 1, pageSize = 10, searchVal = '', orderby = 'date', order = 'DESC', status = 'publish') => {
        setLoading(true);
        const params = new URLSearchParams({
            page,
            per_page: pageSize,
            search: searchVal,
            orderby,
            order,
            status,
        });

        // rest_url may be the plain-permalink form (index.php?rest_route=/shapeblock/v1/),
        // so query args must be appended with "&", not "?".
        const sep = shapeblock.rest_url.includes('?') ? '&' : '?';
        fetch(`${shapeblock.rest_url}templates${sep}${params}`, {
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then(res => res.json())
            .then(data => {
                setTemplates(data.templates || []);
                setTemplateCount(data.active_count || 0);
                setTrashCount(data.trash_count || 0);
                setPagination(prev => ({
                    ...prev,
                    current: data.page,
                    total: data.total,
                    pageSize: data.per_page,
                }));
            })
            .catch(() => {
                notification.error({ message: __( 'Failed to load templates', 'shapeblock' ) });
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleViewChange = (val) => {
        setViewStatus(val);
        setSelectedRowKeys([]);
        setSearch('');
        fetchTemplates(1, pagination.pageSize, '', sorter.field, orderParam(), val);
    };

    const handleTableChange = (pag, _filters, sort) => {
        const orderby = sort.field || 'date';
        const order = sort.order === 'ascend' ? 'ASC' : 'DESC';
        setSorter({ field: orderby, order: sort.order || 'descend' });
        fetchTemplates(pag.current, pag.pageSize, search, orderby, order, viewStatus);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setSelectedRowKeys([]);
        fetchTemplates(1, pagination.pageSize, value, sorter.field, orderParam(), viewStatus);
    };

    const refetch = (page = pagination.current) => {
        fetchTemplates(page, pagination.pageSize, search, sorter.field, orderParam(), viewStatus);
    };

    const openAddModal = () => {
        form.resetFields();
        setModalOpen(true);
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            setSubmitting(true);

            fetch(`${shapeblock.rest_url}templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': shapeblock.nonce,
                },
                body: JSON.stringify(values),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        notification.success({
                            message: __( 'Template created. Opening editor…', 'shapeblock' ),
                            duration: 2,
                        });
                        setModalOpen(false);
                        form.resetFields();
                        // Open the new template in the editor right away.
                        if (data.editUrl) {
                            window.location.href = data.editUrl;
                        } else {
                            refetch();
                        }
                    } else {
                        notification.error({ message: data.message || __( 'Operation failed', 'shapeblock' ) });
                    }
                })
                .catch(() => {
                    notification.error({ message: __( 'Request failed', 'shapeblock' ) });
                })
                .finally(() => setSubmitting(false));
        });
    };

    // force = true permanently deletes (from Trash); otherwise moves to Trash.
    const handleDelete = (id, force = false) => {
        const sep = force ? (`${shapeblock.rest_url}templates/${id}`.includes('?') ? '&force=true' : '?force=true') : '';
        fetch(`${shapeblock.rest_url}templates/${id}${sep}`, {
            method: 'DELETE',
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.success({
                        message: force ? __( 'Template permanently deleted', 'shapeblock' ) : __( 'Template moved to Trash', 'shapeblock' ),
                        duration: 2,
                    });
                    setSelectedRowKeys(prev => prev.filter(k => k !== id));
                    refetch();
                }
            })
            .catch(() => {
                notification.error({ message: __( 'Delete failed', 'shapeblock' ) });
            });
    };

    const handleRestore = (id) => {
        fetch(`${shapeblock.rest_url}templates/${id}/restore`, {
            method: 'POST',
            headers: { 'X-WP-Nonce': shapeblock.nonce },
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.success({ message: __( 'Template restored', 'shapeblock' ), duration: 2 });
                    setSelectedRowKeys(prev => prev.filter(k => k !== id));
                    refetch();
                }
            })
            .catch(() => {
                notification.error({ message: __( 'Restore failed', 'shapeblock' ) });
            });
    };

    const runBulk = (action) => {
        fetch(`${shapeblock.rest_url}templates/bulk-delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': shapeblock.nonce,
            },
            body: JSON.stringify({ ids: selectedRowKeys, action }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    const count = data.deleted.length;
                    let message;
                    if (action === 'trash') {
                        message = sprintf(
                            /* translators: %d: number of templates. */
                            _n( '%d template moved to Trash', '%d templates moved to Trash', count, 'shapeblock' ),
                            count
                        );
                    } else if (action === 'restore') {
                        message = sprintf(
                            /* translators: %d: number of templates. */
                            _n( '%d template restored', '%d templates restored', count, 'shapeblock' ),
                            count
                        );
                    } else if (action === 'delete') {
                        message = sprintf(
                            /* translators: %d: number of templates. */
                            _n( '%d template permanently deleted', '%d templates permanently deleted', count, 'shapeblock' ),
                            count
                        );
                    } else {
                        message = sprintf(
                            /* translators: %d: number of templates. */
                            _n( '%d template updated', '%d templates updated', count, 'shapeblock' ),
                            count
                        );
                    }
                    notification.success({
                        message,
                        duration: 2,
                    });
                    setSelectedRowKeys([]);
                    fetchTemplates(1, pagination.pageSize, search, sorter.field, orderParam(), viewStatus);
                }
            })
            .catch(() => {
                notification.error({ message: __( 'Bulk action failed', 'shapeblock' ) });
            });
    };

    const handleBulkAction = (action) => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: __( 'No templates selected', 'shapeblock' ) });
            return;
        }

        if (action === 'trash') {
            runBulk('trash');
        } else if (action === 'restore') {
            runBulk('restore');
        } else if (action === 'delete') {
            Modal.confirm({
                title: sprintf(
                    /* translators: %d: number of templates. */
                    _n( 'Permanently delete %d template?', 'Permanently delete %d templates?', selectedRowKeys.length, 'shapeblock' ),
                    selectedRowKeys.length
                ),
                content: __( 'This action cannot be undone.', 'shapeblock' ),
                okText: __( 'Delete Permanently', 'shapeblock' ),
                okType: 'danger',
                onOk: () => runBulk('delete'),
            });
        }
    };

    const baseColumns = [
        {
            title: __( 'Title', 'shapeblock' ),
            dataIndex: 'title',
            key: 'title',
            sorter: true,
            sortOrder: sorter.field === 'title' ? sorter.order : null,
        },
        {
            title: __( 'Author', 'shapeblock' ),
            dataIndex: 'author',
            key: 'author',
            width: 150,
        },
    ];

    const shortcodeColumn = {
        title: __( 'Shortcode', 'shapeblock' ),
        key: 'shortcode',
        width: 280,
        render: (_, record) => {
            const shortcode = `[shapeblock_template id="${record.id}"]`;
            return (
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        value={shortcode}
                        readOnly
                        size="small"
                        style={{ fontFamily: 'monospace', fontSize: 12 }}
                    />
                    <Button
                        size="medium"
                        icon={<CopyOutlined />}
                        aria-label={ __( 'Copy shortcode', 'shapeblock' ) }
                        onClick={() => {
                            const textarea = document.createElement('textarea');
                            textarea.value = shortcode;
                            textarea.style.position = 'fixed';
                            textarea.style.opacity = '0';
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                            notification.success({ message: __( 'Shortcode copied', 'shapeblock' ), duration: 1.5 });
                        }}
                    />
                </Space.Compact>
            );
        },
    };

    const dateColumn = {
        title: __( 'Date', 'shapeblock' ),
        dataIndex: 'date',
        key: 'date',
        sorter: true,
        sortOrder: sorter.field === 'date' ? sorter.order : null,
        width: 200,
        render: (date) => new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }),
    };

    const activeActionsColumn = {
        title: __( 'Actions', 'shapeblock' ),
        key: 'actions',
        width: 150,
        render: (_, record) => (
            <Space>
                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    href={record.editUrl}
                >
                    { __( 'Edit', 'shapeblock' ) }
                </Button>
                <Popconfirm
                    title={ __( 'Move this template to Trash?', 'shapeblock' ) }
                    onConfirm={() => handleDelete(record.id, false)}
                    okText={ __( 'Yes', 'shapeblock' ) }
                    cancelText={ __( 'No', 'shapeblock' ) }
                >
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        aria-label={ __( 'Move to Trash', 'shapeblock' ) }
                    />
                </Popconfirm>
            </Space>
        ),
    };

    const trashActionsColumn = {
        title: __( 'Actions', 'shapeblock' ),
        key: 'actions',
        width: 200,
        render: (_, record) => (
            <Space>
                <Button
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => handleRestore(record.id)}
                >
                    { __( 'Restore', 'shapeblock' ) }
                </Button>
                <Popconfirm
                    title={ __( 'Permanently delete this template? This cannot be undone.', 'shapeblock' ) }
                    onConfirm={() => handleDelete(record.id, true)}
                    okText={ __( 'Delete', 'shapeblock' ) }
                    okButtonProps={{ danger: true }}
                    cancelText={ __( 'No', 'shapeblock' ) }
                >
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                    >
                        { __( 'Delete', 'shapeblock' ) }
                    </Button>
                </Popconfirm>
            </Space>
        ),
    };

    const columns = isTrashView
        ? [...baseColumns, dateColumn, trashActionsColumn]
        : [...baseColumns, shortcodeColumn, dateColumn, activeActionsColumn];

    const bulkOptions = isTrashView
        ? [
            { value: '', label: __( 'Bulk Actions', 'shapeblock' ) },
            { value: 'restore', label: __( 'Restore', 'shapeblock' ) },
            { value: 'delete', label: __( 'Delete Permanently', 'shapeblock' ) },
        ]
        : [
            { value: '', label: __( 'Bulk Actions', 'shapeblock' ) },
            { value: 'trash', label: __( 'Move to Trash', 'shapeblock' ) },
        ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <div className="shapeblock-options-content">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 className="shapeblock-options-title" style={{ margin: 0 }}>{ __( 'Templates', 'shapeblock' ) }</h1>
                </div>
                {!isTrashView && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                    >
                        { __( 'Add New', 'shapeblock' ) }
                    </Button>
                )}
            </div>

            <div style={{ marginBottom: 16 }}>
                <Segmented
                    value={viewStatus}
                    onChange={handleViewChange}
                    options={[
                        { value: 'publish', label: __( 'Active', 'shapeblock' ) },
                        {
                            value: 'trash',
                            label: trashCount
                                ? sprintf(
                                    /* translators: %d: number of trashed templates. */
                                    __( 'Trash (%d)', 'shapeblock' ),
                                    trashCount
                                )
                                : __( 'Trash', 'shapeblock' ),
                        },
                    ]}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                gap: 12,
            }}>
                <Space>
                    <Select
                        style={{ width: 180 }}
                        options={bulkOptions}
                        onChange={(val) => val && handleBulkAction(val)}
                        value=""
                    />
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
                        value={search}
                        onSearch={handleSearch}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSearch(v);
                            setSelectedRowKeys([]);
                            clearTimeout(window.__shapeblockTplSearchT);
                            window.__shapeblockTplSearchT = setTimeout(
                                () => fetchTemplates(1, pagination.pageSize, v, sorter.field, orderParam(), viewStatus),
                                300
                            );
                        }}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                        className='shapeblock-template-search-box'
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        aria-label={ __( 'Reload', 'shapeblock' ) }
                        onClick={() => {
                            setSearch('');
                            fetchTemplates(1, pagination.pageSize, '', sorter.field, orderParam(), viewStatus);
                        }}
                    />
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={templates}
                loading={loading}
                rowSelection={rowSelection}
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
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                confirmLoading={submitting}
                okText={ __( 'Create', 'shapeblock' ) }
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label={ __( 'Template Name', 'shapeblock' ) }
                        rules={[{ required: true, message: __( 'Please enter a template name', 'shapeblock' ) }]}
                    >
                        <Input placeholder={ __( 'Enter template name', 'shapeblock' ) } />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
