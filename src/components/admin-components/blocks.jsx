import React, { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import BlockItem from './blockItem';
import { Row, Space, Button, notification, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function Blocks() {
    const [blocks, setBlocks] = useState(shapeblock.blocks);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default'); // 'default' | 'az' | 'za' | 'active' | 'inactive'

    // update by ajax
    const updateBlockStatus = (blockId, currentStatus) => { // Accept currentStatus to calculate new one locally
        const newStatus = currentStatus === 'enable' ? 'disable' : 'enable';

        // Optimistic Update
        setBlocks(prevBlocks => prevBlocks.map(block =>
            block.id === blockId ? { ...block, status: newStatus } : block
        ));

        const data = {
            action: 'shapeblock_update_block_status',
            blockId: blockId,
            status: newStatus,
            nonce: shapeblock.nonce
        };

        fetch(shapeblock.rest_url + 'update-block-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': shapeblock.nonce
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                // API returns { status: 'success', saved_status: '...' }
                if (data.status === 'success') {
                    // Update global variable to keep in sync if needed (optional but good for consistency if mixed usage)
                    // shapeblock.blocks reference doesn't automatically update, but we can update if we strongly need to.
                    // For now, rely on local state.

                    // Verify server state matches optimistic state (optional double check)
                    if (data.saved_status !== newStatus) {
                        setBlocks(prevBlocks => prevBlocks.map(block =>
                            block.id === blockId ? { ...block, status: data.saved_status } : block
                        ));
                    }
                    notification.success({
                        message: __( 'Block status updated', 'shapeblock' ),
                        description: __( 'Block status has been updated successfully.', 'shapeblock' ),
                        duration: 2,
                    });
                } else {
                    // Revert on API failure signal
                    console.error('API Error:', data);
                    setBlocks(prevBlocks => prevBlocks.map(block =>
                        block.id === blockId ? { ...block, status: currentStatus } : block
                    ));
                    notification.error({
                        message: __( 'Block status update failed', 'shapeblock' ),
                        description: __( 'Block status update failed. Please try again.', 'shapeblock' ),
                        duration: 2,
                    });
                }
            })
            .catch((error) => {
                console.error('Network Error:', error);
                // Revert on Network Error
                setBlocks(prevBlocks => prevBlocks.map(block =>
                    block.id === blockId ? { ...block, status: currentStatus } : block
                ));
            });

    }

    // Activate / deactivate all blocks at once
    const updateAllBlockStatus = (newStatus) => {
        // Keep a snapshot of the current blocks so we can revert on failure
        const previousBlocks = blocks;
        const blockIds = blocks.map(block => block.id);

        // Optimistic Update — flip every block to the new status
        setBlocks(prevBlocks => prevBlocks.map(block => ({ ...block, status: newStatus })));
        setBulkLoading(true);

        const data = {
            action: 'shapeblock_update_all_block_status',
            blockIds: blockIds,
            status: newStatus,
            nonce: shapeblock.nonce
        };

        fetch(shapeblock.rest_url + 'update-all-block-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': shapeblock.nonce
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.success({
                        message: newStatus === 'enable' ? __( 'All blocks activated', 'shapeblock' ) : __( 'All blocks deactivated', 'shapeblock' ),
                        description: __( 'Block statuses have been updated successfully.', 'shapeblock' ),
                        duration: 2,
                    });
                } else {
                    console.error('API Error:', data);
                    // Revert on API failure signal
                    setBlocks(previousBlocks);
                    notification.error({
                        message: __( 'Bulk update failed', 'shapeblock' ),
                        description: __( 'Updating all blocks failed. Please try again.', 'shapeblock' ),
                        duration: 2,
                    });
                }
            })
            .catch((error) => {
                console.error('Network Error:', error);
                // Revert on Network Error
                setBlocks(previousBlocks);
                notification.error({
                    message: __( 'Bulk update failed', 'shapeblock' ),
                    description: __( 'Updating all blocks failed. Please try again.', 'shapeblock' ),
                    duration: 2,
                });
            })
            .finally(() => {
                setBulkLoading(false);
            });
    }

    // Apply the search term (title + description).
    const term = search.trim().toLowerCase();
    const filteredBlocks = blocks.filter(block => {
        if (term) {
            const haystack = `${block.title || ''} ${block.description || ''}`.toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        return true;
    });

    // Apply the active sort option (non-mutating copy).
    const sortedBlocks = [...filteredBlocks];
    if (sort === 'az') {
        sortedBlocks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sort === 'za') {
        sortedBlocks.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sort === 'active') {
        sortedBlocks.sort((a, b) => (b.status === 'enable') - (a.status === 'enable'));
    } else if (sort === 'inactive') {
        sortedBlocks.sort((a, b) => (a.status === 'enable') - (b.status === 'enable'));
    }

    return (
        <div className='shapeblock-options-content'>
            <div className="shapeblock-options-content-header">
                <h1 className='shapeblock-options-title'>{ __( 'Blocks', 'shapeblock' ) }</h1>
                <div
                    className="shapeblock-blocks-toolbar"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 16,
                    }}
                >
                    {/* search + sort — left side */}
                    <Space className="shapeblock-blocks-filters">
                        <Input
                            placeholder={ __( 'Search blocks...', 'shapeblock' ) }
                            allowClear
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 240 }}
                        />
                        <Select
                            value={sort}
                            onChange={(v) => setSort(v)}
                            style={{ width: 170 }}
                            options={[
                                { value: 'default', label: __( 'Sort: Default', 'shapeblock' ) },
                                { value: 'az', label: __( 'Name (A–Z)', 'shapeblock' ) },
                                { value: 'za', label: __( 'Name (Z–A)', 'shapeblock' ) },
                                { value: 'active', label: __( 'Active first', 'shapeblock' ) },
                                { value: 'inactive', label: __( 'Inactive first', 'shapeblock' ) },
                            ]}
                        />
                    </Space>
                    {/* activate / deactivate all — right side */}
                    <Space className="shapeblock-blocks-actions">
                        <Button
                            type="primary"
                            loading={bulkLoading}
                            disabled={blocks.every(block => block.status === 'enable')}
                            onClick={() => updateAllBlockStatus('enable')}
                        >
                            { __( 'Activate All', 'shapeblock' ) }
                        </Button>
                        <Button
                            danger
                            loading={bulkLoading}
                            disabled={blocks.every(block => block.status === 'disable')}
                            onClick={() => updateAllBlockStatus('disable')}
                        >
                            { __( 'Deactivate All', 'shapeblock' ) }
                        </Button>
                    </Space>
                </div>
            </div>
            {sortedBlocks.length === 0 && (
                <p style={{ padding: '24px 4px', color: '#888' }}>
                    { term
                        ? sprintf(
                            /* translators: %s: search term entered by the user. */
                            __( 'No blocks found for “%s”.', 'shapeblock' ),
                            search.trim()
                        )
                        : __( 'No blocks found.', 'shapeblock' ) }
                </p>
            )}
            <Row gutter={[16, 16]} justify="flex-start">
                {sortedBlocks.map((block) => (

                    <BlockItem
                        key={block.id}
                        title={block.title}
                        id={block.id}
                        description={block.description}
                        icon={block.iconClass}
                        onChangeHandler={() => updateBlockStatus(block.id, block.status)}
                        status={block.status}
                    />

                ))
                }
            </Row>
        </div>
    );
}