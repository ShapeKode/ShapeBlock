import React, { useState, useEffect, useCallback } from 'react';
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
                notification.error({ message: 'Failed to load templates' });
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
                            message: 'Template Created — opening editor…',
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
                        notification.error({ message: data.message || 'Operation failed' });
                    }
                })
                .catch(() => {
                    notification.error({ message: 'Request failed' });
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
                        message: force ? 'Template Permanently Deleted' : 'Template Moved to Trash',
                        duration: 2,
                    });
                    setSelectedRowKeys(prev => prev.filter(k => k !== id));
                    refetch();
                }
            })
            .catch(() => {
                notification.error({ message: 'Delete failed' });
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
                    notification.success({ message: 'Template Restored', duration: 2 });
                    setSelectedRowKeys(prev => prev.filter(k => k !== id));
                    refetch();
                }
            })
            .catch(() => {
                notification.error({ message: 'Restore failed' });
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
                    const labels = {
                        trash: 'moved to trash',
                        restore: 'restored',
                        delete: 'permanently deleted',
                    };
                    notification.success({
                        message: `${data.deleted.length} template(s) ${labels[action] || 'updated'}`,
                        duration: 2,
                    });
                    setSelectedRowKeys([]);
                    fetchTemplates(1, pagination.pageSize, search, sorter.field, orderParam(), viewStatus);
                }
            })
            .catch(() => {
                notification.error({ message: 'Bulk action failed' });
            });
    };

    const handleBulkAction = (action) => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: 'No templates selected' });
            return;
        }

        if (action === 'trash') {
            runBulk('trash');
        } else if (action === 'restore') {
            runBulk('restore');
        } else if (action === 'delete') {
            Modal.confirm({
                title: `Permanently delete ${selectedRowKeys.length} template(s)?`,
                content: 'This action cannot be undone.',
                okText: 'Delete Permanently',
                okType: 'danger',
                onOk: () => runBulk('delete'),
            });
        }
    };

    const baseColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: true,
            sortOrder: sorter.field === 'title' ? sorter.order : null,
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
            width: 150,
        },
    ];

    const shortcodeColumn = {
        title: 'Shortcode',
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
                        onClick={() => {
                            const textarea = document.createElement('textarea');
                            textarea.value = shortcode;
                            textarea.style.position = 'fixed';
                            textarea.style.opacity = '0';
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                            notification.success({ message: 'Shortcode copied!', duration: 1.5 });
                        }}
                    />
                </Space.Compact>
            );
        },
    };

    const dateColumn = {
        title: 'Date',
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
        title: 'Actions',
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
                    Edit
                </Button>
                <Popconfirm
                    title="Move this template to Trash?"
                    onConfirm={() => handleDelete(record.id, false)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                    />
                </Popconfirm>
            </Space>
        ),
    };

    const trashActionsColumn = {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
            <Space>
                <Button
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => handleRestore(record.id)}
                >
                    Restore
                </Button>
                <Popconfirm
                    title="Permanently delete this template? This cannot be undone."
                    onConfirm={() => handleDelete(record.id, true)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="No"
                >
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                    >
                        Delete
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
            { value: '', label: 'Bulk Actions' },
            { value: 'restore', label: 'Restore' },
            { value: 'delete', label: 'Delete Permanently' },
        ]
        : [
            { value: '', label: 'Bulk Actions' },
            { value: 'trash', label: 'Move to Trash' },
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
                    <h1 className="shapeblock-options-title" style={{ margin: 0 }}>Templates</h1>
                </div>
                {!isTrashView && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                    >
                        Add New
                    </Button>
                )}
            </div>

            <div style={{ marginBottom: 16 }}>
                <Segmented
                    value={viewStatus}
                    onChange={handleViewChange}
                    options={[
                        { value: 'publish', label: 'Active' },
                        { value: 'trash', label: `Trash${trashCount ? ` (${trashCount})` : ''}` },
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
                        <Tag>{selectedRowKeys.length} selected</Tag>
                    )}
                </Space>
                <Space>
                    <Search
                        placeholder="Search templates..."
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                onChange={handleTableChange}
                size="middle"
            />

            <Modal
                title="Add New Template"
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                confirmLoading={submitting}
                okText="Create"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Template Name"
                        rules={[{ required: true, message: 'Please enter a template name' }]}
                    >
                        <Input placeholder="Enter template name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
