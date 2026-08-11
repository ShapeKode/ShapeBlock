import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Input, Space, Modal, Form,
    notification, Popconfirm, Tag, Select
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined, CopyOutlined,
    CrownOutlined
} from '@ant-design/icons';

const { Search } = Input;

const FREE_TEMPLATE_LIMIT = 3;

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
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [templateCount, setTemplateCount] = useState(Number(eelfg.templateCount) || 0);

    const isPro = Boolean(eelfg.isProActive);
    const isLimitReached = !isPro && templateCount >= FREE_TEMPLATE_LIMIT;

    const fetchTemplates = useCallback((page = 1, pageSize = 10, searchVal = '', orderby = 'date', order = 'DESC') => {
        setLoading(true);
        const params = new URLSearchParams({
            page,
            per_page: pageSize,
            search: searchVal,
            orderby,
            order,
        });

        // rest_url may be the plain-permalink form (index.php?rest_route=/easy-elements-for-gutenberg/v1/),
        // so query args must be appended with "&", not "?".
        const sep = eelfg.rest_url.includes('?') ? '&' : '?';
        fetch(`${eelfg.rest_url}templates${sep}${params}`, {
            headers: { 'X-WP-Nonce': eelfg.nonce },
        })
            .then(res => res.json())
            .then(data => {
                setTemplates(data.templates || []);
                setTemplateCount(data.total || 0);
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

    const handleTableChange = (pag, _filters, sort) => {
        const orderby = sort.field || 'date';
        const order = sort.order === 'ascend' ? 'ASC' : 'DESC';
        setSorter({ field: orderby, order: sort.order || 'descend' });
        fetchTemplates(pag.current, pag.pageSize, search, orderby, order);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setSelectedRowKeys([]);
        fetchTemplates(1, pagination.pageSize, value, sorter.field, sorter.order === 'ascend' ? 'ASC' : 'DESC');
    };

    const openAddModal = () => {
        if (isLimitReached) {
            setUpgradeModalOpen(true);
            return;
        }
        form.resetFields();
        setModalOpen(true);
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            setSubmitting(true);

            fetch(`${eelfg.rest_url}templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': eelfg.nonce,
                },
                body: JSON.stringify(values),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        notification.success({
                            message: 'Template Created',
                            duration: 2,
                        });
                        setModalOpen(false);
                        form.resetFields();
                        fetchTemplates(
                            pagination.current, pagination.pageSize, search,
                            sorter.field, sorter.order === 'ascend' ? 'ASC' : 'DESC'
                        );
                    } else if (data.code === 'template_limit') {
                        setModalOpen(false);
                        setUpgradeModalOpen(true);
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

    const handleDelete = (id) => {
        fetch(`${eelfg.rest_url}templates/${id}`, {
            method: 'DELETE',
            headers: { 'X-WP-Nonce': eelfg.nonce },
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.success({ message: 'Template Deleted', duration: 2 });
                    setSelectedRowKeys(prev => prev.filter(k => k !== id));
                    fetchTemplates(
                        pagination.current, pagination.pageSize, search,
                        sorter.field, sorter.order === 'ascend' ? 'ASC' : 'DESC'
                    );
                }
            })
            .catch(() => {
                notification.error({ message: 'Delete failed' });
            });
    };

    const handleBulkAction = (action) => {
        if (selectedRowKeys.length === 0) {
            notification.warning({ message: 'No templates selected' });
            return;
        }

        if (action === 'delete') {
            Modal.confirm({
                title: `Delete ${selectedRowKeys.length} template(s)?`,
                content: 'This action cannot be undone.',
                okText: 'Delete',
                okType: 'danger',
                onOk: () => {
                    fetch(`${eelfg.rest_url}templates/bulk-delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-WP-Nonce': eelfg.nonce,
                        },
                        body: JSON.stringify({ ids: selectedRowKeys }),
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                notification.success({
                                    message: `${data.deleted.length} template(s) deleted`,
                                    duration: 2,
                                });
                                setSelectedRowKeys([]);
                                fetchTemplates(
                                    1, pagination.pageSize, search,
                                    sorter.field, sorter.order === 'ascend' ? 'ASC' : 'DESC'
                                );
                            }
                        })
                        .catch(() => {
                            notification.error({ message: 'Bulk delete failed' });
                        });
                },
            });
        }
    };

    const columns = [
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
        {
            title: 'Shortcode',
            key: 'shortcode',
            width: 280,
            render: (_, record) => {
                const shortcode = `[eelfg_template id="${record.id}"]`;
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
        },
        {
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
        },
        {
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
                        title="Delete this template?"
                        onConfirm={() => handleDelete(record.id)}
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
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <div className="eelfg-options-content">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 className="eelfg-options-title" style={{ margin: 0 }}>Templates</h1>
                    {!isPro && (
                        <Tag color="orange">{templateCount}/{FREE_TEMPLATE_LIMIT}</Tag>
                    )}
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddModal}
                >
                    Add New
                </Button>
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
                        defaultValue=""
                        style={{ width: 160 }}
                        options={[
                            { value: '', label: 'Bulk Actions' },
                            { value: 'delete', label: 'Delete' },
                        ]}
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
                        onSearch={handleSearch}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSearch(v);
                            setSelectedRowKeys([]);
                            clearTimeout(window.__eelfgTplSearchT);
                            window.__eelfgTplSearchT = setTimeout(
                                () => fetchTemplates(1, pagination.pageSize, v, sorter.field, sorter.order === 'ascend' ? 'ASC' : 'DESC'),
                                300
                            );
                        }}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                        className='bolpo-template-search-box'
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            setSearch('');
                            fetchTemplates();
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

            <Modal
                open={upgradeModalOpen}
                onCancel={() => setUpgradeModalOpen(false)}
                footer={null}
                centered
                width={480}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CrownOutlined style={{ fontSize: 48, color: '#a216ff', marginBottom: 16 }} />
                    <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Upgrade to Pro</h2>
                    <p style={{ color: '#666', fontSize: 15, margin: '0 0 20px' }}>
                        You've reached the free limit of <strong>{FREE_TEMPLATE_LIMIT} templates</strong>.<br />
                        Upgrade to eelfg Pro for unlimited templates and premium features.
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CrownOutlined />}
                        href={eelfg.proUrl}
                        target="_blank"
                        style={{ background: '#a216ff', borderColor: '#a216ff' }}
                    >
                        Get eelfg Pro
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
