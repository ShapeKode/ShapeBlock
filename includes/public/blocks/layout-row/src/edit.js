import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useCallback, useRef } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
    BlockControls,
    MediaUpload,
    MediaUploadCheck,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import {
    PanelBody,
    __experimentalDivider as Divider,
    SelectControl,
    ToggleControl,
    RangeControl,
    TextControl,
    BoxControl,
    ToolbarGroup,
    ToolbarButton,
    Button,
    TabPanel,
    FocalPointPicker,
    __experimentalUnitControl as UnitControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';

import {
    iconDirRow, iconDirRowRev, iconDirCol, iconDirColRev,
    iconJustifyStart, iconJustifyCenter, iconJustifyEnd,
    iconJustifyBetween, iconJustifyAround, iconJustifyEvenly,
    iconAlignStretch, iconAlignTop, iconAlignMiddle, iconAlignBottom, iconAlignBaseline,
    iconWrapNo, iconWrap, iconWrapRev,
} from './flexbox-icons';

import BackgroundControl from '../../custom-components/BackgroundControl';
import ColorPopover from '../../custom-components/ColorPopover';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

import { LAYOUT_PRESETS, presetTemplate, getPresetById } from './presets';
import { buildRowEditorCss } from './style-utils';
import { observeStickyRow } from './sticky-release';

import './editor.scss';

const ALLOWED_BLOCKS = ['shapeblock/column'];

const getKey = (base, device) =>
    device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

// Background position as the focal point picker reads it (0-1 on each axis),
// from a saved "x% y%" or the keyword pairs older Rows were saved with.
const AXIS = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
const toFocalPoint = (position) => {
    const [a, b = 'center'] = String(position || 'center center').trim().split(/\s+/);
    const read = (part) => {
        if (part in AXIS) return AXIS[part];
        const n = parseFloat(part);
        return Number.isNaN(n) ? 0.5 : Math.min(1, Math.max(0, n / 100));
    };
    // A keyword pair can name the vertical side first ("top left").
    const vertical = (p) => p === 'top' || p === 'bottom';
    const horizontal = (p) => p === 'left' || p === 'right';
    return vertical(a) || horizontal(b) ? { x: read(b), y: read(a) } : { x: read(a), y: read(b) };
};
const fromFocalPoint = ({ x, y }) => `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;

const presetIcon = (preset) => {
    const total = preset.columns.reduce((a, b) => a + b, 0);
    return (
        <span className="shapeblock-preset-icon" aria-hidden="true">
            {preset.columns.map((w, i) => (
                <span
                    key={i}
                    className="shapeblock-preset-icon__col"
                    style={{ flex: `${(w / total) * 100} 0 0` }}
                />
            ))}
        </span>
    );
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        htmlTag,
        preset,
        contentWidth,
        customClass,
        verticalAlign,
        equalHeight,
        stretchColumns,
    } = attributes;

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: 'shapeblock-layout-row-' + Math.random().toString(36).slice(2, 8) });
        }
    }, [blockId, setAttributes]);

    const { innerBlocks, hasChildren } = useSelect(
        (select) => {
            const blocks = select(blockEditorStore).getBlocks(clientId);
            return { innerBlocks: blocks, hasChildren: blocks.length > 0 };
        },
        [clientId]
    );

    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(blockEditorStore);

    const Tag = ['div', 'section', 'article', 'main', 'header', 'footer', 'aside'].includes(htmlTag)
        ? htmlTag
        : 'div';

    const editorCss = useMemo(
        () => buildRowEditorCss(attributes, innerBlocks),
        [attributes, innerBlocks]
    );

    const wrapperClasses = [
        'shapeblock-block',
        'shapeblock-layout-row',
        blockId,
        `is-content-${contentWidth}`,
        verticalAlign ? `is-valign-${verticalAlign}` : '',
        equalHeight ? 'is-equal-height' : '',
        stretchColumns ? 'is-stretch' : '',
        attributes.isSticky ? 'is-sticky' : '',
        attributes.overlayColor || attributes.overlayGradient ? 'has-overlay' : '',
        parseInt(attributes.columnsTablet, 10) > 0 ? 'has-tablet-columns' : '',
        parseInt(attributes.columnsMobile, 10) > 0 ? 'has-mobile-columns' : '',
        customClass,
    ]
        .filter(Boolean)
        .join(' ');

    const rowRef = useRef(null);
    const blockProps = useBlockProps({ className: wrapperClasses, ref: rowRef });

    // Preview the front-end release behaviour inside the editor canvas.
    useEffect(() => {
        if (!attributes.isSticky || !rowRef.current) {
            return undefined;
        }
        return observeStickyRow(rowRef.current);
    }, [attributes.isSticky, attributes.stickyTop]);

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'shapeblock-layout-row__inner' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            orientation: 'horizontal',
            template: presetTemplate(preset),
            templateLock: false,
            renderAppender: false,
        }
    );

    const applyPreset = useCallback(
        (newPresetId) => {
            const next = getPresetById(newPresetId);
            const widths = next.columns;
            const existing = innerBlocks || [];

            const merged = widths.map((w, idx) => {
                const widthStr = `${parseFloat(w).toFixed(2)}%`;
                if (existing[idx]) {
                    const reused = existing[idx];
                    return {
                        ...reused,
                        attributes: { ...reused.attributes, width: widthStr },
                    };
                }
                return createBlock('shapeblock/column', { width: widthStr });
            });

            replaceInnerBlocks(clientId, merged, false);
            setAttributes({ preset: newPresetId });
        },
        [clientId, innerBlocks, replaceInnerBlocks, setAttributes]
    );

    const addColumn = useCallback(() => {
        const count = (innerBlocks || []).length + 1;
        const evenWidth = `${(100 / count).toFixed(2)}%`;
        (innerBlocks || []).forEach((b) => updateBlockAttributes(b.clientId, { width: evenWidth }));
        const next = [
            ...(innerBlocks || []),
            createBlock('shapeblock/column', { width: evenWidth }),
        ];
        replaceInnerBlocks(clientId, next, false);
        setAttributes({ preset: '' });
    }, [clientId, innerBlocks, replaceInnerBlocks, updateBlockAttributes, setAttributes]);

    const removeLastColumn = useCallback(() => {
        if ((innerBlocks || []).length <= 1) return;
        const remaining = innerBlocks.slice(0, -1);
        const evenWidth = `${(100 / remaining.length).toFixed(2)}%`;
        remaining.forEach((b) => updateBlockAttributes(b.clientId, { width: evenWidth }));
        replaceInnerBlocks(clientId, remaining, false);
        setAttributes({ preset: '' });
    }, [clientId, innerBlocks, replaceInnerBlocks, updateBlockAttributes, setAttributes]);

    // --- Tab 1: Settings (content / behavior) ---------------------------------
    const settingsTab = (
        <>
            <PanelBody title={__('General', 'shapeblock')} initialOpen={true}>
                <SelectControl
                    label={__('HTML Tag', 'shapeblock')}
                    value={htmlTag}
                    options={[
                        { label: 'div', value: 'div' },
                        { label: 'section', value: 'section' },
                        { label: 'article', value: 'article' },
                        { label: 'main', value: 'main' },
                        { label: 'header', value: 'header' },
                        { label: 'footer', value: 'footer' },
                        { label: 'aside', value: 'aside' },
                    ]}
                    onChange={(value) => setAttributes({ htmlTag: value })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
                <TextControl
                    label={__('Custom CSS Class', 'shapeblock')}
                    value={customClass}
                    onChange={(v) => setAttributes({ customClass: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
                <TextControl
                    label={__('ARIA Label', 'shapeblock')}
                    help={__('A name screen readers announce for this section, for example “Our services”.', 'shapeblock')}
                    value={attributes.ariaLabel}
                    onChange={(v) => setAttributes({ ariaLabel: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </PanelBody>

            <PanelBody title={__('Sticky', 'shapeblock')} initialOpen={false}>
                <ToggleControl
                    label={__('Make Sticky', 'shapeblock')}
                    checked={attributes.isSticky}
                    onChange={(v) => setAttributes({ isSticky: v })}
                    __nextHasNoMarginBottom
                />

                {attributes.isSticky && (
                    <>
                        <Divider />
                        <UnitControl
                            label={__('Sticky Top Offset', 'shapeblock')}
                            value={attributes.stickyTop}
                            onChange={(v) => setAttributes({ stickyTop: v })}
                        />
                    </>
                )}
            </PanelBody>

            <PanelBody title={__('Responsive', 'shapeblock')} initialOpen={false}>
                <ToggleControl
                    label={__('Hide on Desktop', 'shapeblock')}
                    checked={!!attributes.hideDesktop}
                    onChange={(v) => setAttributes({ hideDesktop: v })}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={__('Hide on Tablet', 'shapeblock')}
                    checked={!!attributes.hideTablet}
                    onChange={(v) => setAttributes({ hideTablet: v })}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={__('Hide on Mobile', 'shapeblock')}
                    checked={!!attributes.hideMobile}
                    onChange={(v) => setAttributes({ hideMobile: v })}
                    __nextHasNoMarginBottom
                />
            </PanelBody>
        </>
    );

    // --- Tab 2: Layout (structure / spacing) ----------------------------------
    const layoutTab = (
        <>
            <PanelBody title={__('Container', 'shapeblock')} initialOpen={true}>
                <div className="shapeblock-preset-grid">
                    {LAYOUT_PRESETS.map((p) => (
                        <Button
                            key={p.id}
                            className={`shapeblock-preset-btn ${preset === p.id ? 'is-active' : ''}`}
                            onClick={() => applyPreset(p.id)}
                            label={p.label}
                        >
                            {presetIcon(p)}
                            <span className="shapeblock-preset-btn__label">{p.label}</span>
                        </Button>
                    ))}
                </div>
                <Divider />
                <RangeControl
                    label={__('Columns per row (Desktop)', 'shapeblock')}
                    help={__('0 keeps each column’s own width. A number makes a grid: the columns share the line equally and wrap onto the next.', 'shapeblock')}
                    value={parseInt(attributes.columnsDesktop, 10) || 0}
                    onChange={(v) => setAttributes({ columnsDesktop: v || 0, ...(v ? { flexWrap: 'wrap' } : {}) })}
                    min={0}
                    max={6}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <RangeControl
                    label={__('Columns per row (Tablet)', 'shapeblock')}
                    help={__('0 keeps the desktop layout.', 'shapeblock')}
                    value={parseInt(attributes.columnsTablet, 10) || 0}
                    onChange={(v) => setAttributes({ columnsTablet: v || 0 })}
                    min={0}
                    max={6}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <RangeControl
                    label={__('Columns per row (Mobile)', 'shapeblock')}
                    help={__('0 stacks the columns, one per row.', 'shapeblock')}
                    value={parseInt(attributes.columnsMobile, 10) || 0}
                    onChange={(v) => setAttributes({ columnsMobile: v || 0 })}
                    min={0}
                    max={4}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />

                <SelectControl
                    label={__('Content Width', 'shapeblock')}
                    value={contentWidth}
                    options={[
                        { label: __('Boxed', 'shapeblock'), value: 'boxed' },
                        { label: __('Full Width', 'shapeblock'), value: 'full' },
                        { label: __('Custom', 'shapeblock'), value: 'custom' },
                    ]}
                    help={
                        contentWidth === 'custom'
                            ? __('The whole row - its background too - gets the width below, centered. In the page it stays within the site’s wide width; set the row’s alignment to Full to go wider.', 'shapeblock')
                            : contentWidth === 'full'
                                ? __('The content fills the whole row.', 'shapeblock')
                                : __('The background fills the row; the content stays within the Max Width.', 'shapeblock')
                    }
                    onChange={(value) => setAttributes({ contentWidth: value })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {contentWidth === 'custom' && (
                    <ResponsiveWrapper label={__('Width', 'shapeblock')}>
                        {(device) => (
                            <UnitControl
                                value={attributes[getKey('customWidth', device)]}
                                onChange={(v) => setAttributes({ [getKey('customWidth', device)]: v })}
                                placeholder="800px"
                                units={[
                                    { value: 'px', label: 'px', default: 800 },
                                    { value: '%', label: '%', default: 80 },
                                    { value: 'vw', label: 'vw', default: 80 },
                                    { value: 'rem', label: 'rem', default: 50 },
                                ]}
                                __next40pxDefaultSize
                            />
                        )}
                    </ResponsiveWrapper>
                )}

                {contentWidth === 'boxed' && (
                    <ResponsiveWrapper label={__('Max Width', 'shapeblock')}>
                        {(device) => (
                            <UnitControl
                                value={attributes[getKey('maxWidth', device)]}
                                onChange={(v) => setAttributes({ [getKey('maxWidth', device)]: v })}
                                __next40pxDefaultSize
                            />
                        )}
                    </ResponsiveWrapper>
                )}

                <ResponsiveWrapper label={__('Min Height', 'shapeblock')}>
                    {(device) => (
                        <UnitControl
                            value={attributes[getKey('minHeight', device)]}
                            onChange={(v) => setAttributes({ [getKey('minHeight', device)]: v })}
                            __next40pxDefaultSize
                        />
                    )}
                </ResponsiveWrapper>
            </PanelBody>

            <PanelBody title={__('Position & Z-Index', 'shapeblock')} initialOpen={false}>
                <SelectControl
                    label={__('Position', 'shapeblock')}
                    value={attributes.position}
                    options={[
                        { label: __('Default', 'shapeblock'), value: '' },
                        { label: 'static', value: 'static' },
                        { label: 'relative', value: 'relative' },
                        { label: 'absolute', value: 'absolute' },
                        { label: 'fixed', value: 'fixed' },
                    ]}
                    onChange={(v) => setAttributes({ position: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <Divider />
                <SelectControl
                    label={__('Overflow', 'shapeblock')}
                    value={attributes.overflow}
                    options={[
                        { label: __('Default', 'shapeblock'), value: '' },
                        { label: 'visible', value: 'visible' },
                        { label: 'hidden', value: 'hidden' },
                        { label: 'auto', value: 'auto' },
                        { label: 'scroll', value: 'scroll' },
                    ]}
                    onChange={(v) => setAttributes({ overflow: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
                <TextControl
                    label={__('Z-Index', 'shapeblock')}
                    value={attributes.zIndex}
                    onChange={(v) => setAttributes({ zIndex: v })}
                    type="number"
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </PanelBody>

            <PanelBody title={__('Flexbox', 'shapeblock')} initialOpen={false}>
                <ResponsiveWrapper label={__('Direction', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl
                            isBlock
                            isDeselectable
                            value={attributes[getKey('flexDirection', device)]}
                            onChange={(v) => setAttributes({ [getKey('flexDirection', device)]: v ?? '' })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOptionIcon value="row"            icon={iconDirRow}    label={__('Row', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="row-reverse"    icon={iconDirRowRev} label={__('Row reverse', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="column"         icon={iconDirCol}    label={__('Column', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="column-reverse" icon={iconDirColRev} label={__('Column reverse', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Justify Content', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl
                            isBlock
                            isDeselectable
                            value={attributes[getKey('justifyContent', device)]}
                            onChange={(v) => setAttributes({ [getKey('justifyContent', device)]: v ?? '' })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOptionIcon value="flex-start"    icon={iconJustifyStart}   label={__('Start', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="center"        icon={iconJustifyCenter}  label={__('Center', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="flex-end"      icon={iconJustifyEnd}     label={__('End', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="space-between" icon={iconJustifyBetween} label={__('Space between', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="space-around"  icon={iconJustifyAround}  label={__('Space around', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="space-evenly"  icon={iconJustifyEvenly}  label={__('Space evenly', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Align Items', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl
                            isBlock
                            isDeselectable
                            value={attributes[getKey('alignItems', device)]}
                            onChange={(v) => setAttributes({ [getKey('alignItems', device)]: v ?? '' })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOptionIcon value="stretch"    icon={iconAlignStretch}  label={__('Stretch', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="flex-start" icon={iconAlignTop}      label={__('Top', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="center"     icon={iconAlignMiddle}   label={__('Middle', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="flex-end"   icon={iconAlignBottom}   label={__('Bottom', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="baseline"   icon={iconAlignBaseline} label={__('Baseline', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Align Content', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl
                            isBlock
                            isDeselectable
                            value={attributes[getKey('alignContent', device)]}
                            onChange={(v) => setAttributes({ [getKey('alignContent', device)]: v ?? '' })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOptionIcon value="stretch"       icon={iconAlignStretch}   label={__('Stretch', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="flex-start"    icon={iconAlignTop}       label={__('Top', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="center"        icon={iconAlignMiddle}    label={__('Middle', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="flex-end"      icon={iconAlignBottom}    label={__('Bottom', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="space-between" icon={iconJustifyBetween} label={__('Space between', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="space-around"  icon={iconJustifyAround}  label={__('Space around', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Wrap', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl
                            isBlock
                            isDeselectable
                            value={attributes[getKey('flexWrap', device)]}
                            onChange={(v) => setAttributes({ [getKey('flexWrap', device)]: v ?? '' })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOptionIcon value="nowrap"       icon={iconWrapNo}  label={__('No wrap', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="wrap"         icon={iconWrap}    label={__('Wrap', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="wrap-reverse" icon={iconWrapRev} label={__('Wrap reverse', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Gap', 'shapeblock')}>
                    {(device) => (
                        <UnitControl
                            value={attributes[getKey('gap', device)]}
                            onChange={(v) => setAttributes({ [getKey('gap', device)]: v })}
                            __next40pxDefaultSize
                        />
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Row Gap', 'shapeblock')}>
                    {(device) => (
                        <UnitControl
                            value={attributes[getKey('rowGap', device)]}
                            onChange={(v) => setAttributes({ [getKey('rowGap', device)]: v })}
                            __next40pxDefaultSize
                        />
                    )}
                </ResponsiveWrapper>

                <ResponsiveWrapper label={__('Column Gap', 'shapeblock')}>
                    {(device) => (
                        <UnitControl
                            value={attributes[getKey('columnGap', device)]}
                            onChange={(v) => setAttributes({ [getKey('columnGap', device)]: v })}
                            __next40pxDefaultSize
                        />
                    )}
                </ResponsiveWrapper>
            </PanelBody>

            <PanelBody title={__('Advanced Layout', 'shapeblock')} initialOpen={false}>
                <SelectControl
                    label={__('Vertical Align', 'shapeblock')}
                    value={verticalAlign}
                    options={[
                        { label: __('Default', 'shapeblock'), value: '' },
                        { label: __('Top', 'shapeblock'), value: 'top' },
                        { label: __('Middle', 'shapeblock'), value: 'middle' },
                        { label: __('Bottom', 'shapeblock'), value: 'bottom' },
                    ]}
                    onChange={(v) => setAttributes({ verticalAlign: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
                <ToggleControl
                    label={__('Equal Height Columns', 'shapeblock')}
                    checked={equalHeight}
                    onChange={(v) => setAttributes({ equalHeight: v })}
                    __nextHasNoMarginBottom
                />
                <Divider />
                <ToggleControl
                    label={__('Stretch Columns', 'shapeblock')}
                    checked={stretchColumns}
                    onChange={(v) => setAttributes({ stretchColumns: v })}
                    __nextHasNoMarginBottom
                />
            </PanelBody>
        </>
    );

    // --- Tab 3: Style (visual) ------------------------------------------------
    const styleTab = (
        <>
            <PanelBody title={__('Spacing', 'shapeblock')} initialOpen={true}>
                <ResponsiveWrapper label={__('Padding', 'shapeblock')}>
                    {(device) => (
                        <BoxControl
                            values={attributes[getKey('padding', device)]}
                            onChange={(v) => setAttributes({ [getKey('padding', device)]: v })}
                        />
                    )}
                </ResponsiveWrapper>
                <Divider />
                <ResponsiveWrapper label={__('Margin', 'shapeblock')}>
                    {(device) => (
                        <BoxControl
                            values={attributes[getKey('margin', device)]}
                            onChange={(v) => setAttributes({ [getKey('margin', device)]: v })}
                        />
                    )}
                </ResponsiveWrapper>
            </PanelBody>

            <PanelBody title={__('Background', 'shapeblock')} initialOpen={false}>
                <BackgroundControl
                    label={__('Background', 'shapeblock')}
                    colorValue={attributes.background}
                    gradientValue={attributes.backgroundGradient}
                    onColorChange={(v) => {
                        const hex = v && typeof v === 'object' ? v.hex : v;
                        setAttributes({ background: hex || '' });
                    }}
                    onGradientChange={(v) => setAttributes({ backgroundGradient: v || '' })}
                />
                <Divider />
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={(media) => setAttributes({ backgroundImage: { url: media.url, id: media.id } })}
                        allowedTypes={['image']}
                        value={attributes.backgroundImage?.id}
                        render={({ open }) => (
                            <div className="shapeblock-row-bg-image">
                                <Button variant="secondary" onClick={open}>
                                    {attributes.backgroundImage?.url ? __('Replace Image', 'shapeblock') : __('Choose Background Image', 'shapeblock')}
                                </Button>
                                {attributes.backgroundImage?.url && (
                                    <Button variant="tertiary" isDestructive onClick={() => setAttributes({ backgroundImage: { url: '', id: 0 } })}>
                                        {__('Remove', 'shapeblock')}
                                    </Button>
                                )}
                            </div>
                        )}
                    />
                </MediaUploadCheck>
                <TextControl
                    label={__('Or Image URL', 'shapeblock')}
                    value={attributes.backgroundImage?.url || ''}
                    onChange={(v) => setAttributes({ backgroundImage: { url: v, id: 0 } })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                {attributes.backgroundImage?.url && (
                    <>
                        <Divider />
                        <SelectControl
                            label={__('Size', 'shapeblock')}
                            value={attributes.backgroundSize}
                            options={[
                                { label: 'auto', value: 'auto' },
                                { label: 'cover', value: 'cover' },
                                { label: 'contain', value: 'contain' },
                            ]}
                            onChange={(v) => setAttributes({ backgroundSize: v })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <SelectControl
                            label={__('Repeat', 'shapeblock')}
                            value={attributes.backgroundRepeat}
                            options={[
                                { label: 'no-repeat', value: 'no-repeat' },
                                { label: 'repeat', value: 'repeat' },
                                { label: 'repeat-x', value: 'repeat-x' },
                                { label: 'repeat-y', value: 'repeat-y' },
                            ]}
                            onChange={(v) => setAttributes({ backgroundRepeat: v })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <FocalPointPicker
                            label={__('Position', 'shapeblock')}
                            url={attributes.backgroundImage.url}
                            value={toFocalPoint(attributes.backgroundPosition)}
                            onChange={(v) => setAttributes({ backgroundPosition: fromFocalPoint(v) })}
                            __nextHasNoMarginBottom
                        />
                        <SelectControl
                            label={__('Attachment', 'shapeblock')}
                            value={attributes.backgroundAttachment}
                            options={[
                                { label: 'scroll', value: 'scroll' },
                                { label: 'fixed', value: 'fixed' },
                            ]}
                            onChange={(v) => setAttributes({ backgroundAttachment: v })}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </>
                )}
            </PanelBody>

            <PanelBody title={__('Background Overlay', 'shapeblock')} initialOpen={false}>
                <BackgroundControl
                    label={__('Overlay', 'shapeblock')}
                    colorValue={attributes.overlayColor}
                    gradientValue={attributes.overlayGradient}
                    onColorChange={(v) => {
                        const hex = v && typeof v === 'object' ? v.hex : v;
                        setAttributes({ overlayColor: hex || '' });
                    }}
                    onGradientChange={(v) => setAttributes({ overlayGradient: v || '' })}
                />
                {(attributes.overlayColor || attributes.overlayGradient) && (
                    <RangeControl
                        label={__('Overlay Opacity (%)', 'shapeblock')}
                        value={attributes.overlayOpacity}
                        onChange={(v) => setAttributes({ overlayOpacity: v ?? 50 })}
                        min={0}
                        max={100}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}
            </PanelBody>

            <PanelBody title={__('Colors', 'shapeblock')} initialOpen={false}>
                <ColorPopover label={__('Text', 'shapeblock')} color={attributes.textColor} onChange={(v) => setAttributes({ textColor: v || '' })} />
                <ColorPopover label={__('Link', 'shapeblock')} color={attributes.linkColor} onChange={(v) => setAttributes({ linkColor: v || '' })} />
                <ColorPopover label={__('Link Hover', 'shapeblock')} color={attributes.linkHoverColor} onChange={(v) => setAttributes({ linkHoverColor: v || '' })} />
                <ColorPopover label={__('Heading', 'shapeblock')} color={attributes.headingColor} onChange={(v) => setAttributes({ headingColor: v || '' })} />
            </PanelBody>

            <PanelBody title={__('Typography', 'shapeblock')} initialOpen={false}>
                <ResponsiveWrapper label={__('Typography', 'shapeblock')}>
                    {(device) => (
                        <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey('typography', device)} />
                    )}
                </ResponsiveWrapper>
            </PanelBody>

            <PanelBody title={__('Border', 'shapeblock')} initialOpen={false}>
                <BorderControl
                    label={__('Border', 'shapeblock')}
                    value={attributes.border}
                    onChange={(v) => setAttributes({ border: v })}
                />
                <Divider />
                <BoxControl
                    label={__('Border Radius', 'shapeblock')}
                    values={attributes.borderRadius}
                    onChange={(v) => setAttributes({ borderRadius: v })}
                />
                <Divider />
                <BoxShadowControls
                    label={__('Box Shadow', 'shapeblock')}
                    value={attributes.boxShadow}
                    onChange={(v) => setAttributes({ boxShadow: v })}
                />
            </PanelBody>
        </>
    );

    return (
        <>
            <style>{editorCss}</style>

            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton icon="plus-alt2" label={__('Add Column', 'shapeblock')} onClick={addColumn} />
                    <ToolbarButton
                        icon="minus"
                        label={__('Remove Column', 'shapeblock')}
                        onClick={removeLastColumn}
                        disabled={(innerBlocks || []).length <= 1}
                    />
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <TabPanel
                    className="shapeblock-inspector-tabs"
                    activeClass="is-active"
                    tabs={[
                        { name: 'settings', title: __('Settings', 'shapeblock') },
                        { name: 'layout', title: __('Layout', 'shapeblock') },
                        { name: 'style', title: __('Style', 'shapeblock') },
                        { name: 'advanced', title: __('Advanced', 'shapeblock') },
                    ]}
                >
                    {(tab) => (
                        tab.name === 'settings' ? settingsTab :
                        tab.name === 'advanced' ? <AdvancedControls attributes={attributes} setAttributes={setAttributes} /> :
                        tab.name === 'layout' ? layoutTab :
                        styleTab
                    )}
                </TabPanel>
            </InspectorControls>

            <Tag {...blockProps}>
                {hasChildren ? (
                    <div {...innerBlocksProps} />
                ) : (
                    <div className="shapeblock-layout-row__layout-picker">
                        <div className="shapeblock-layout-row__layout-picker__title">
                            {__('Chose a Layout', 'shapeblock')}
                        </div>
                        <div className="shapeblock-layout-row__layout-picker__grid">
                            {LAYOUT_PRESETS.map((p) => (
                                <button
                                    type="button"
                                    key={p.id}
                                    className="shapeblock-layout-row__layout-picker__item"
                                    onClick={() => applyPreset(p.id)}
                                    aria-label={p.label}
                                    title={p.label}
                                >
                                    {presetIcon(p)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Tag>
        </>
    );
}
