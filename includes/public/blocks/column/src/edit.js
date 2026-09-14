import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useCallback } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
    BlockControls,
    ButtonBlockAppender,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import {
    PanelBody,
    __experimentalDivider as Divider,
    SelectControl,
    TextControl,
    ToggleControl,
    BoxControl,
    TabPanel,
    ToolbarGroup,
    ToolbarButton,
    ToolbarDropdownMenu,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
    __experimentalUnitControl as UnitControl,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import { buildColumnEditorCss } from '../../layout-row/src/style-utils';
import {
    iconDirRow, iconDirRowRev, iconDirCol, iconDirColRev,
    iconJustifyStart, iconJustifyCenter, iconJustifyEnd,
    iconJustifyBetween, iconJustifyAround, iconJustifyEvenly,
    iconAlignStretch, iconAlignTop, iconAlignMiddle, iconAlignBottom, iconAlignBaseline,
    iconWrapNo, iconWrap, iconWrapRev,
} from '../../layout-row/src/flexbox-icons';

import './editor.scss';

const getKey = (base, device) =>
    device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        htmlTag,
        widthType,
        verticalAlign,
        customClass,
    } = attributes;

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: 'shapeblock-col-' + Math.random().toString(36).slice(2, 8) });
        }
    }, [blockId, setAttributes]);

    // Current preview device, so the toolbar align dropdown edits the matching
    // per-device alignItems key (alignItems / alignItemsTablet / alignItemsMobile).
    const previewDevice = useSelect((select) => {
        const editor = select('core/editor');
        if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
        const editPost = select('core/edit-post');
        if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
        return 'Desktop';
    }, []);
    const toolbarDevice = previewDevice ? previewDevice.toLowerCase() : 'desktop';
    const alignItemsKey = getKey('alignItems', toolbarDevice);

    const { parentClientId, siblings, indexInParent, isEmpty } = useSelect(
        (select) => {
            const { getBlockParents, getBlocks, getBlockIndex, getBlockOrder } = select(blockEditorStore);
            const parents = getBlockParents(clientId);
            const pId = parents.length ? parents[parents.length - 1] : null;
            return {
                parentClientId: pId,
                siblings: pId ? getBlocks(pId) : [],
                indexInParent: pId ? getBlockIndex(clientId) : 0,
                isEmpty: getBlockOrder(clientId).length === 0,
            };
        },
        [clientId]
    );

    const {
        insertBlocks,
        removeBlock,
        moveBlocksDown,
        moveBlocksUp,
        replaceInnerBlocks,
    } = useDispatch(blockEditorStore);

    const editorCss = useMemo(() => buildColumnEditorCss(attributes), [attributes]);

    const Tag = ['div', 'section', 'article', 'aside'].includes(htmlTag) ? htmlTag : 'div';

    const wrapperClasses = [
        'shapeblock-block',
        'shapeblock-column',
        blockId,
        verticalAlign ? `is-self-${verticalAlign}` : '',
        customClass,
    ]
        .filter(Boolean)
        .join(' ');

    const blockProps = useBlockProps({
        className: `${wrapperClasses}${isEmpty ? ' is-empty' : ''}`,
    });
    const innerBlocksProps = useInnerBlocksProps(
        { className: 'shapeblock-column__inner' },
        {
            templateLock: false,
            renderAppender: isEmpty ? () => (
                <ButtonBlockAppender rootClientId={clientId} className="shapeblock-column__appender" />
            ) : undefined,
        }
    );

    const widthLabel = (() => {
        if (widthType === 'percentage' || widthType === 'custom') {
            return attributes.width || '';
        }
        if (widthType === 'flex') {
            const g = attributes.flexGrow;
            const b = attributes.flexBasis;
            if (b) return b;
            if (g !== '' && g != null) return `flex ${g}`;
        }
        return '';
    })();

    const duplicateSelf = useCallback(() => {
        if (!parentClientId) return;
        const block = createBlock('shapeblock/column', { ...attributes, blockId: '' });
        insertBlocks(block, indexInParent + 1, parentClientId, false);
    }, [parentClientId, attributes, indexInParent, insertBlocks]);

    const addSiblingColumn = useCallback(() => {
        if (!parentClientId) return;
        const block = createBlock('shapeblock/column', {});
        insertBlocks(block, indexInParent + 1, parentClientId, false);
    }, [parentClientId, indexInParent, insertBlocks]);

    const removeSelf = useCallback(() => {
        if (siblings.length <= 1) return;
        removeBlock(clientId);
    }, [clientId, siblings.length, removeBlock]);

    const moveLeft = useCallback(() => {
        if (indexInParent <= 0) return;
        moveBlocksUp([clientId], parentClientId);
    }, [clientId, parentClientId, indexInParent, moveBlocksUp]);

    const moveRight = useCallback(() => {
        if (indexInParent >= siblings.length - 1) return;
        moveBlocksDown([clientId], parentClientId);
    }, [clientId, parentClientId, indexInParent, siblings.length, moveBlocksDown]);

    // --- Tab 1: Settings (content & behavior) ---------------------------------
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
                        { label: 'aside', value: 'aside' },
                    ]}
                    onChange={(v) => setAttributes({ htmlTag: v })}
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

    // --- Tab 2: Layout (structure & spacing) ----------------------------------
    const layoutTab = (
        <>
            <PanelBody title={__('Width', 'shapeblock')} initialOpen={true}>
                <SelectControl
                    label={__('Width Type', 'shapeblock')}
                    value={widthType}
                    options={[
                        { label: __('Percentage', 'shapeblock'), value: 'percentage' },
                        { label: __('Flex', 'shapeblock'), value: 'flex' },
                        { label: __('Custom', 'shapeblock'), value: 'custom' },
                    ]}
                    onChange={(v) => setAttributes({ widthType: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
                {(widthType === 'percentage' || widthType === 'custom') && (
                    <ResponsiveWrapper label={__('Width', 'shapeblock')}>
                        {(device) => (
                            <UnitControl
                                value={attributes[getKey('width', device)]}
                                onChange={(v) => setAttributes({ [getKey('width', device)]: v })}
                                units={[
                                    { value: '%', label: '%' },
                                    { value: 'px', label: 'px' },
                                    { value: 'rem', label: 'rem' },
                                    { value: 'vw', label: 'vw' },
                                ]}
                                __next40pxDefaultSize
                            />
                        )}
                    </ResponsiveWrapper>
                )}
                {widthType === 'flex' && (
                    <>
                        <ResponsiveWrapper label={__('Flex Grow', 'shapeblock')}>
                            {(device) => (
                                <NumberControl
                                    value={attributes[getKey('flexGrow', device)]}
                                    onChange={(v) => setAttributes({ [getKey('flexGrow', device)]: v })}
                                    min={0}
                                    max={20}
                                    step={1}
                                    __next40pxDefaultSize
                                />
                            )}
                        </ResponsiveWrapper>
                        <ResponsiveWrapper label={__('Flex Basis', 'shapeblock')}>
                            {(device) => (
                                <UnitControl
                                    value={attributes[getKey('flexBasis', device)]}
                                    onChange={(v) => setAttributes({ [getKey('flexBasis', device)]: v })}
                                    __next40pxDefaultSize
                                />
                            )}
                        </ResponsiveWrapper>
                    </>
                )}
            </PanelBody>

            <PanelBody title={__('Alignment & Size', 'shapeblock')} initialOpen={false}>
                <SelectControl
                    label={__('Vertical Align (Self)', 'shapeblock')}
                    value={verticalAlign}
                    options={[
                        { label: __('Default', 'shapeblock'), value: '' },
                        { label: __('Top', 'shapeblock'), value: 'flex-start' },
                        { label: __('Middle', 'shapeblock'), value: 'center' },
                        { label: __('Bottom', 'shapeblock'), value: 'flex-end' },
                        { label: __('Stretch', 'shapeblock'), value: 'stretch' },
                    ]}
                    onChange={(v) => setAttributes({ verticalAlign: v })}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Divider />
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

            <PanelBody title={__('Flexbox', 'shapeblock')} initialOpen={false}>
                <ResponsiveWrapper label={__('Direction', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl isBlock isDeselectable value={attributes[getKey('flexDirection', device)]} onChange={(v) => setAttributes({ [getKey('flexDirection', device)]: v ?? '' })} __next40pxDefaultSize __nextHasNoMarginBottom>
                            <ToggleGroupControlOptionIcon value="row"            icon={iconDirRow}    label={__('Row', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="row-reverse"    icon={iconDirRowRev} label={__('Row reverse', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="column"         icon={iconDirCol}    label={__('Column', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="column-reverse" icon={iconDirColRev} label={__('Column reverse', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>
                <ResponsiveWrapper label={__('Justify Content', 'shapeblock')}>
                    {(device) => (
                        <ToggleGroupControl isBlock isDeselectable value={attributes[getKey('justifyContent', device)]} onChange={(v) => setAttributes({ [getKey('justifyContent', device)]: v ?? '' })} __next40pxDefaultSize __nextHasNoMarginBottom>
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
                        <ToggleGroupControl isBlock isDeselectable value={attributes[getKey('alignItems', device)]} onChange={(v) => setAttributes({ [getKey('alignItems', device)]: v ?? '' })} __next40pxDefaultSize __nextHasNoMarginBottom>
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
                        <ToggleGroupControl isBlock isDeselectable value={attributes[getKey('alignContent', device)]} onChange={(v) => setAttributes({ [getKey('alignContent', device)]: v ?? '' })} __next40pxDefaultSize __nextHasNoMarginBottom>
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
                        <ToggleGroupControl isBlock isDeselectable value={attributes[getKey('flexWrap', device)]} onChange={(v) => setAttributes({ [getKey('flexWrap', device)]: v ?? '' })} __next40pxDefaultSize __nextHasNoMarginBottom>
                            <ToggleGroupControlOptionIcon value="nowrap"       icon={iconWrapNo}  label={__('No wrap', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="wrap"         icon={iconWrap}    label={__('Wrap', 'shapeblock')} />
                            <ToggleGroupControlOptionIcon value="wrap-reverse" icon={iconWrapRev} label={__('Wrap reverse', 'shapeblock')} />
                        </ToggleGroupControl>
                    )}
                </ResponsiveWrapper>
                <ResponsiveWrapper label={__('Gap', 'shapeblock')}>
                    {(device) => (
                        <UnitControl
                            value={attributes[getKey('contentGap', device)]}
                            onChange={(v) => setAttributes({ [getKey('contentGap', device)]: v })}
                            __next40pxDefaultSize
                        />
                    )}
                </ResponsiveWrapper>
            </PanelBody>

            <PanelBody title={__('Spacing', 'shapeblock')} initialOpen={false}>
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

        </>
    );

    // --- Tab 3: Style (appearance) --------------------------------------------
    const styleTab = (
        <>
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
                    <ToolbarButton icon="arrow-left-alt2" label={__('Move Left', 'shapeblock')} onClick={moveLeft} disabled={indexInParent <= 0} />
                    <ToolbarButton icon="arrow-right-alt2" label={__('Move Right', 'shapeblock')} onClick={moveRight} disabled={indexInParent >= siblings.length - 1} />
                    <ToolbarButton icon="admin-page" label={__('Duplicate', 'shapeblock')} onClick={duplicateSelf} />
                    <ToolbarButton icon="plus-alt2" label={__('Add Column', 'shapeblock')} onClick={addSiblingColumn} />
                    <ToolbarButton icon="trash" label={__('Remove', 'shapeblock')} onClick={removeSelf} disabled={siblings.length <= 1} />
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarDropdownMenu
                        icon="align-pull-left"
                        label={__('Content Align', 'shapeblock')}
                        controls={[
                            { title: __('Align Left', 'shapeblock'), icon: 'editor-alignleft', isActive: attributes[alignItemsKey] === 'flex-start', onClick: () => setAttributes({ [alignItemsKey]: attributes[alignItemsKey] === 'flex-start' ? '' : 'flex-start' }) },
                            { title: __('Align Center', 'shapeblock'), icon: 'editor-aligncenter', isActive: attributes[alignItemsKey] === 'center', onClick: () => setAttributes({ [alignItemsKey]: attributes[alignItemsKey] === 'center' ? '' : 'center' }) },
                            { title: __('Align Right', 'shapeblock'), icon: 'editor-alignright', isActive: attributes[alignItemsKey] === 'flex-end', onClick: () => setAttributes({ [alignItemsKey]: attributes[alignItemsKey] === 'flex-end' ? '' : 'flex-end' }) },
                            { title: __('Stretch', 'shapeblock'), icon: 'align-full-width', isActive: attributes[alignItemsKey] === 'stretch', onClick: () => setAttributes({ [alignItemsKey]: attributes[alignItemsKey] === 'stretch' ? '' : 'stretch' }) },
                        ]}
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
                    ]}
                >
                    {(tab) => (
                        tab.name === 'settings' ? settingsTab :
                        tab.name === 'layout' ? layoutTab :
                        styleTab
                    )}
                </TabPanel>
            </InspectorControls>

            <Tag {...blockProps}>
                {widthLabel && (
                    <span className="shapeblock-column__width-label" aria-hidden="true">
                        {widthLabel}
                    </span>
                )}
                <div {...innerBlocksProps} />
            </Tag>
        </>
    );
}
