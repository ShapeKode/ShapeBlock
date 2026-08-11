import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Modal, Button, Select, Space, Empty, notification, Spin, Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Flatten eelfg.builderRules ({ group: { slug: def } }) into:
 *  - grouped options for the rule <Select>
 *  - a slug => def lookup (label, needsObject, objectType)
 */
function useRuleCatalog() {
    return useMemo(() => {
        const rules = (typeof eelfg !== 'undefined' && eelfg.builderRules) || {};
        const groupLabels = { general: 'General', specific: 'Specific' };
        const groupedOptions = [];
        const defs = {};

        Object.keys(rules).forEach((groupKey) => {
            const group = rules[groupKey] || {};
            const options = Object.keys(group).map((slug) => {
                defs[slug] = { ...group[slug], slug };
                return { value: slug, label: group[slug].label };
            });
            if (options.length) {
                groupedOptions.push({
                    label: groupLabels[groupKey] || groupKey,
                    options,
                });
            }
        });

        return { groupedOptions, defs };
    }, []);
}

let rowSeq = 0;
const nextKey = () => `row-${++rowSeq}`;

export default function BuilderConditionsModal({ open, item, onClose, onSaved }) {
    const { groupedOptions, defs } = useRuleCatalog();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Cache of selectable objects per objectType: { page: [...], post: [...] }
    const [objectCache, setObjectCache] = useState({});
    const [objectLoading, setObjectLoading] = useState({});

    const loadObjects = useCallback((objectType) => {
        if (!objectType || objectCache[objectType] || objectLoading[objectType]) {
            return;
        }
        setObjectLoading((prev) => ({ ...prev, [objectType]: true }));
        const sep = eelfg.rest_url.includes('?') ? '&' : '?';
        fetch(`${eelfg.rest_url}builder/objects${sep}objectType=${encodeURIComponent(objectType)}`, {
            headers: { 'X-WP-Nonce': eelfg.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                setObjectCache((prev) => ({ ...prev, [objectType]: data.objects || [] }));
            })
            .catch(() => {
                notification.error({ message: 'Failed to load items' });
            })
            .finally(() => {
                setObjectLoading((prev) => ({ ...prev, [objectType]: false }));
            });
    }, [objectCache, objectLoading]);

    // Load existing conditions when the modal opens for an item.
    useEffect(() => {
        if (!open || !item) {
            return;
        }
        setLoading(true);
        fetch(`${eelfg.rest_url}builder/${item.id}/conditions`, {
            headers: { 'X-WP-Nonce': eelfg.nonce },
        })
            .then((res) => res.json())
            .then((data) => {
                const loaded = (data.conditions || []).map((c) => ({
                    key: nextKey(),
                    type: c.type || 'include',
                    rule: c.rule || '',
                    ids: c.ids || [],
                }));
                setRows(loaded.length ? loaded : [{ key: nextKey(), type: 'include', rule: 'entire_site', ids: [] }]);

                // Preload object lists referenced by existing object-bound rows.
                loaded.forEach((row) => {
                    const def = defs[row.rule];
                    if (def && def.needsObject) {
                        loadObjects(def.objectType);
                    }
                });
            })
            .catch(() => {
                notification.error({ message: 'Failed to load conditions' });
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item]);

    const addRow = () => {
        setRows((prev) => [...prev, { key: nextKey(), type: 'include', rule: 'entire_site', ids: [] }]);
    };

    const removeRow = (key) => {
        setRows((prev) => prev.filter((r) => r.key !== key));
    };

    const updateRow = (key, patch) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    };

    const onRuleChange = (key, rule) => {
        const def = defs[rule];
        // Reset selected ids when switching rules; preload objects if needed.
        updateRow(key, { rule, ids: [] });
        if (def && def.needsObject) {
            loadObjects(def.objectType);
        }
    };

    const handleSave = () => {
        // Drop incomplete object-bound rows (rule needs objects but none chosen).
        const payload = rows
            .filter((r) => r.rule)
            .filter((r) => {
                const def = defs[r.rule];
                return !(def && def.needsObject) || (r.ids && r.ids.length);
            })
            .map((r) => ({ type: r.type, rule: r.rule, ids: r.ids || [] }));

        setSaving(true);
        fetch(`${eelfg.rest_url}builder/${item.id}/conditions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': eelfg.nonce,
            },
            body: JSON.stringify({ conditions: payload }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    notification.success({ message: 'Conditions saved', duration: 2 });
                    onSaved && onSaved(data);
                    onClose();
                } else {
                    notification.error({ message: data.message || 'Save failed' });
                }
            })
            .catch(() => notification.error({ message: 'Save failed' }))
            .finally(() => setSaving(false));
    };

    return (
        <Modal
            title={item ? `Display Conditions — ${item.title}` : 'Display Conditions'}
            open={open}
            onCancel={onClose}
            onOk={handleSave}
            confirmLoading={saving}
            okText="Save Conditions"
            width={680}
            destroyOnHidden
        >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Choose where this template should appear. Include rules add locations;
                exclude rules remove them (exclude always wins).
            </Text>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {rows.length === 0 && (
                        <Empty description="No conditions — this template will not display" />
                    )}

                    {rows.map((row) => {
                        const def = defs[row.rule];
                        const needsObject = def && def.needsObject;
                        const objectType = def && def.objectType;
                        return (
                            <div
                                key={row.key}
                                style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexWrap: 'nowrap' }}
                            >
                                <Select
                                    style={{ flex: '0 0 120px' }}
                                    value={row.type}
                                    onChange={(val) => updateRow(row.key, { type: val })}
                                    options={[
                                        { value: 'include', label: 'Include' },
                                        { value: 'exclude', label: 'Exclude' },
                                    ]}
                                />
                                <Select
                                    style={{ flex: '0 0 190px' }}
                                    value={row.rule || undefined}
                                    placeholder="Select rule"
                                    onChange={(val) => onRuleChange(row.key, val)}
                                    options={groupedOptions}
                                />
                                {needsObject ? (
                                    <Select
                                        mode="multiple"
                                        style={{ flex: '1 1 auto', minWidth: 0 }}
                                        value={row.ids}
                                        placeholder="Select items"
                                        onChange={(val) => updateRow(row.key, { ids: val })}
                                        loading={!!objectLoading[objectType]}
                                        options={objectCache[objectType] || []}
                                        showSearch
                                        optionFilterProp="label"
                                        maxTagCount="responsive"
                                    />
                                ) : (
                                    <span style={{ flex: '1 1 auto' }} />
                                )}
                                <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeRow(row.key)}
                                    style={{ flex: '0 0 auto' }}
                                />
                            </div>
                        );
                    })}

                    <Button type="dashed" icon={<PlusOutlined />} onClick={addRow} block>
                        Add Condition
                    </Button>
                </Space>
            )}
        </Modal>
    );
}
