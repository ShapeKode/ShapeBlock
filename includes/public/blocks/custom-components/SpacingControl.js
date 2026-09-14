import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import {
    BaseControl,
    Button,
    Tooltip,
    SelectControl,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import './SpacingControl.scss';

/**
 * 4-sided spacing control (top/right/bottom/left) supporting negative values.
 *
 * Layout: one shared unit selector + link/unlink toggle in the header, four bare
 * number inputs below. The unit applies to all sides simultaneously.
 *
 * Drop-in compatible with `@wordpress/components` `BoxControl`:
 *   values   { top, right, bottom, left } — each stored as e.g. "10px"
 *   onChange (next) => void
 *   min/max  numbers forwarded to each NumberControl (BoxControl ignores `min`)
 *   units    [{ value, label }] — units offered in the shared selector
 *   sides    which sides to render (default all four)
 */

const DEFAULT_UNITS = [
    { value: 'px',  label: 'px' },
    { value: '%',   label: '%' },
    { value: 'em',  label: 'em' },
    { value: 'rem', label: 'rem' },
    { value: 'vh',  label: 'vh' },
    { value: 'vw',  label: 'vw' },
];

const ALL_SIDES = ['top', 'right', 'bottom', 'left'];

const sideShortLabel = (s) => ({ top: 'T', right: 'R', bottom: 'B', left: 'L' }[s]);
const sideFullLabel = (s) => ({
    top:    __('Top', 'shapeblock'),
    right:  __('Right', 'shapeblock'),
    bottom: __('Bottom', 'shapeblock'),
    left:   __('Left', 'shapeblock'),
}[s]);

// Split "10px" / "-2.5em" / "" into { num, unit }.
const parseValue = (v) => {
    if (v === '' || v == null) return { num: '', unit: '' };
    const m = String(v).match(/^(-?\d*\.?\d*)([a-z%]*)$/i);
    return m ? { num: m[1] ?? '', unit: m[2] ?? '' } : { num: '', unit: '' };
};

const SpacingControl = ({
    values = {},
    onChange,
    label,
    min,
    max,
    units = DEFAULT_UNITS,
    sides = ALL_SIDES,
}) => {
    const [linked, setLinked] = useState(true);

    const safeValues = useMemo(() => ({
        top:    values?.top    ?? '',
        right:  values?.right  ?? '',
        bottom: values?.bottom ?? '',
        left:   values?.left   ?? '',
    }), [values]);

    // Derive the current unit from any non-empty side; default to first unit option.
    const detectedUnit = useMemo(() => {
        for (const s of sides) {
            const { unit } = parseValue(safeValues[s]);
            if (unit) return unit;
        }
        return units[0]?.value || 'px';
    }, [safeValues, sides, units]);

    const [unit, setUnit] = useState(detectedUnit);

    // Keep local unit in sync if external value changes set a different unit.
    if (detectedUnit && detectedUnit !== unit) {
        // setState inside render is fine here — React schedules an immediate update.
        setUnit(detectedUnit);
    }

    const updateSide = (side, num) => {
        const next = { ...safeValues };
        const formatted = (num === '' || num == null) ? '' : `${num}${unit}`;
        if (linked) {
            sides.forEach((s) => { next[s] = formatted; });
        } else {
            next[side] = formatted;
        }
        onChange?.(next);
    };

    const updateUnit = (newUnit) => {
        setUnit(newUnit);
        const next = { ...safeValues };
        sides.forEach((s) => {
            const { num } = parseValue(safeValues[s]);
            if (num !== '' && num != null) next[s] = `${num}${newUnit}`;
        });
        onChange?.(next);
    };

    return (
        <BaseControl
            __nextHasNoMarginBottom
            label={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <SelectControl
                            value={unit}
                            options={units}
                            onChange={updateUnit}
                            size="compact"
                            hideLabelFromVision
                            label={__('Unit', 'shapeblock')}
                            __nextHasNoMarginBottom
                        />
                        <Tooltip text={linked ? __('Unlink sides', 'shapeblock') : __('Link sides', 'shapeblock')}>
                            <Button
                                size="small"
                                variant="tertiary"
                                icon={linked ? 'admin-links' : 'editor-unlink'}
                                onClick={() => setLinked((v) => !v)}
                                aria-label={linked ? __('Unlink sides', 'shapeblock') : __('Link sides', 'shapeblock')}
                            />
                        </Tooltip>
                    </div>
                </div>
            }
        >
            <div
                className="shapeblock-spacing-control"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    marginTop: 4,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: '#fff',
                }}
            >
                {sides.map((side, idx) => {
                    const { num } = parseValue(safeValues[side]);
                    return (
                        <Tooltip key={side} text={sideFullLabel(side)}>
                            <div
                                style={{
                                    borderLeft: idx === 0 ? 'none' : '1px solid #eee',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <NumberControl
                                    label={sideShortLabel(side)}
                                    hideLabelFromVision
                                    value={num}
                                    onChange={(v) => updateSide(side, v)}
                                    min={min}
                                    max={max}
                                    placeholder={sideShortLabel(side)}
                                    size="compact"
                                    __next40pxDefaultSize={false}
                                    className="shapeblock-spacing-control__input"
                                />
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </BaseControl>
    );
};

export default SpacingControl;
