import React, { useState } from 'react';
import BlockItem from './blockItem';
import { Row, Space, Button, notification } from 'antd';

export default function Blocks() {
    const [blocks, setBlocks] = useState(eelfg.blocks);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'free' | 'pro'

    // update by ajax
    const updateBlockStatus = (blockId, currentStatus) => { // Accept currentStatus to calculate new one locally
        const newStatus = currentStatus === 'enable' ? 'disable' : 'enable';

        // Optimistic Update
        setBlocks(prevBlocks => prevBlocks.map(block =>
            block.id === blockId ? { ...block, status: newStatus } : block
        ));

        const data = {
            action: 'eelfg_update_block_status',
            blockId: blockId,
            status: newStatus,
            nonce: eelfg.nonce
        };

        fetch(eelfg.rest_url + 'update-block-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': eelfg.nonce
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                // API returns { status: 'success', saved_status: '...' }
                if (data.status === 'success') {
                    // Update global variable to keep in sync if needed (optional but good for consistency if mixed usage)
                    // eelfg.blocks reference doesn't automatically update, but we can update if we strongly need to.
                    // For now, rely on local state.

                    // Verify server state matches optimistic state (optional double check)
                    if (data.saved_status !== newStatus) {
                        setBlocks(prevBlocks => prevBlocks.map(block =>
                            block.id === blockId ? { ...block, status: data.saved_status } : block
                        ));
                    }
                    notification.success({
                        message: 'Block Status Updated',
                        description: 'Block status has been updated successfully.',
                        duration: 2,
                    });
                } else {
                    // Revert on API failure signal
                    console.error('API Error:', data);
                    setBlocks(prevBlocks => prevBlocks.map(block =>
                        block.id === blockId ? { ...block, status: currentStatus } : block
                    ));
                    notification.error({
                        message: 'Block Status Update Failed',
                        description: 'Block status update failed. Please try again.',
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
            action: 'eelfg_update_all_block_status',
            blockIds: blockIds,
            status: newStatus,
            nonce: eelfg.nonce
        };

        fetch(eelfg.rest_url + 'update-all-block-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': eelfg.nonce
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.success({
                        message: newStatus === 'enable' ? 'All Blocks Activated' : 'All Blocks Deactivated',
                        description: 'Block statuses have been updated successfully.',
                        duration: 2,
                    });
                } else {
                    console.error('API Error:', data);
                    // Revert on API failure signal
                    setBlocks(previousBlocks);
                    notification.error({
                        message: 'Bulk Update Failed',
                        description: 'Updating all blocks failed. Please try again.',
                        duration: 2,
                    });
                }
            })
            .catch((error) => {
                console.error('Network Error:', error);
                // Revert on Network Error
                setBlocks(previousBlocks);
                notification.error({
                    message: 'Bulk Update Failed',
                    description: 'Updating all blocks failed. Please try again.',
                    duration: 2,
                });
            })
            .finally(() => {
                setBulkLoading(false);
            });
    }

    // Apply the active Pro/Free filter
    const filteredBlocks = blocks.filter(block => {
        if (filter === 'free') return !block.isPro;
        if (filter === 'pro') return block.isPro;
        return true;
    });

    return (
        <div className='eelfg-options-content'>
            <div className="eelfg-options-content-header">
                <h1 className='eelfg-options-title'>Blocks</h1>
                <div
                    className="eelfg-blocks-toolbar"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 16,
                    }}
                >
                    {/* pro / free filters — left side */}
                    <Space className="eelfg-blocks-filters">
                        <Button
                            type={filter === 'all' ? 'primary' : 'default'}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                    </Space>
                    {/* activate / deactivate all — right side */}
                    <Space className="eelfg-blocks-actions">
                        <Button
                            type="primary"
                            loading={bulkLoading}
                            disabled={blocks.every(block => block.status === 'enable')}
                            onClick={() => updateAllBlockStatus('enable')}
                        >
                            Activate All
                        </Button>
                        <Button
                            danger
                            loading={bulkLoading}
                            disabled={blocks.every(block => block.status === 'disable')}
                            onClick={() => updateAllBlockStatus('disable')}
                        >
                            Deactivate All
                        </Button>
                    </Space>
                </div>
            </div>
            <Row gutter={[16, 16]} justify="flex-start">
                {filteredBlocks.map((block, index) => (

                    <BlockItem
                        key={index}
                        title={block.title}
                        id={block.id}
                        description={block.description}
                        icon={block.iconClass}
                        onChangeHandler={() => updateBlockStatus(block.id, block.status)}
                        status={block.status}
                        isPro={block.isPro}
                    />

                ))
                }
            </Row>
        </div>
    );
}