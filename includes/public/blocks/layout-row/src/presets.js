import { __ } from '@wordpress/i18n';

/**
 * Layout presets define column counts and width distribution (in %).
 * Each id is stored as the Row's `preset` attribute.
 */
export const LAYOUT_PRESETS = [
    { id: '1',        label: '1', columns: [100] },
    { id: '2-50-50',  label: '50 / 50', columns: [50, 50] },
    { id: '3-33',     label: '33 / 33 / 33', columns: [33.33, 33.33, 33.34] },
    { id: '4-25',     label: '25 / 25 / 25 / 25', columns: [25, 25, 25, 25] },
    { id: '30-70',    label: '30 / 70', columns: [30, 70] },
    { id: '70-30',    label: '70 / 30', columns: [70, 30] },
    { id: '25-75',    label: '25 / 75', columns: [25, 75] },
    { id: '75-25',    label: '75 / 25', columns: [75, 25] },
    { id: '20-80',    label: '20 / 80', columns: [20, 80] },
    { id: '80-20',    label: '80 / 20', columns: [80, 20] },
];

export const getPresetById = (id) =>
    LAYOUT_PRESETS.find((p) => p.id === id) || LAYOUT_PRESETS[1];

export const presetTemplate = (id) => {
    const preset = getPresetById(id);
    return preset.columns.map((w) => [
        'shapeblock/column',
        { width: `${parseFloat(w).toFixed(2)}%` },
    ]);
};

export const presetOptions = () =>
    LAYOUT_PRESETS.map((p) => ({ label: p.label, value: p.id }));
