import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	RangeControl,
	BoxControl,
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import SpacingControl from '../../custom-components/SpacingControl';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. titlePaddingTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

import './editor.scss';

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_CARET = SVG('M7 10l5 5 5-5z');

const MSVG = ({ children }) => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{children}</svg>
);
// Icon direction - icon box before / after the text.
const ICON_DIR_LEFT = <MSVG><rect x="3" y="7" width="9" height="9" rx="1.5" /><rect x="14" y="8.5" width="7" height="2" /><rect x="14" y="13" width="5" height="2" /></MSVG>;
const ICON_DIR_RIGHT = <MSVG><rect x="12" y="7" width="9" height="9" rx="1.5" /><rect x="3" y="8.5" width="7" height="2" /><rect x="5" y="13" width="5" height="2" /></MSVG>;
// Vertical alignment of the icon against the text block.
const ICON_VALIGN_TOP = <MSVG><rect x="3" y="4" width="18" height="2" /><rect x="8" y="8" width="8" height="11" rx="1.5" /></MSVG>;
const ICON_VALIGN_MID = <MSVG><rect x="3" y="11" width="18" height="2" /><rect x="8" y="5" width="8" height="14" rx="1.5" /></MSVG>;
const ICON_VALIGN_BOTTOM = <MSVG><rect x="3" y="18" width="18" height="2" /><rect x="8" y="5" width="8" height="11" rx="1.5" /></MSVG>;
// Layout - stacked list (default) vs inline dots (side by side).
const ICON_LAYOUT_DEFAULT = <MSVG><circle cx="5" cy="7" r="1.6" /><rect x="9" y="6" width="10" height="2" rx="1" /><circle cx="5" cy="12" r="1.6" /><rect x="9" y="11" width="10" height="2" rx="1" /><circle cx="5" cy="17" r="1.6" /><rect x="9" y="16" width="10" height="2" rx="1" /></MSVG>;
const ICON_LAYOUT_INLINE = <MSVG><circle cx="6" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18" cy="12" r="1.8" /></MSVG>;
// List / icon alignment.
const ICON_ALIGN_LEFT = <MSVG><rect x="3" y="5" width="18" height="2" /><rect x="3" y="11" width="12" height="2" /><rect x="3" y="17" width="16" height="2" /></MSVG>;
const ICON_ALIGN_CENTER = <MSVG><rect x="3" y="5" width="18" height="2" /><rect x="6" y="11" width="12" height="2" /><rect x="4" y="17" width="16" height="2" /></MSVG>;
const ICON_ALIGN_RIGHT = <MSVG><rect x="3" y="5" width="18" height="2" /><rect x="9" y="11" width="12" height="2" /><rect x="5" y="17" width="16" height="2" /></MSVG>;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, features, feaDir, iconView, feaConnector, layout, listAlign, divider, feaVerticalAlign, iconHAlign, showIcon } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'eelfg-icon-list-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(features) ? features : [];
	// Which repeater item is expanded (accordion). null = all collapsed.
	const [openIndex, setOpenIndex] = useState(null);
	const updateItem = (i, key, val) => setAttributes({ features: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addItem = () => {
		setAttributes({ features: [...items, { icon: 'eelfg-icon-favorite', title: __('List item', 'easy-elements-for-gutenberg') }] });
		setOpenIndex(items.length);
	};
	const removeItem = (i) => setAttributes({ features: items.filter((_, idx) => idx !== i) });
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ features: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	// Responsive spacing (padding / margin) - clean 4-side control per device.
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<SpacingControl
					values={attributes[getKey(base, device)]}
					onChange={(v) => setAttributes({ [getKey(base, device)]: v })}
				/>
			)}
		</ResponsiveWrapper>
	);
	// Responsive typography - one typography object per device.
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />
			)}
		</ResponsiveWrapper>
	);
	// Responsive slider. Stored as a string per device so render.php's ensure_unit() keeps working.
	const num = (label, key, max = 100, min = 0) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(key, device);
				return (
					<RangeControl
						value={attributes[k] !== '' && attributes[k] != null ? Number(attributes[k]) : undefined}
						onChange={(v) => setAttributes({ [k]: v == null ? '' : String(v) })}
						min={min}
						max={max}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('List Settings', 'easy-elements-for-gutenberg')} initialOpen={true}>
					{items.map((item, index) => (
						<div className="eelfg-icon-list-repeater-item" key={index}>
							<div className="eelfg-icon-list-repeater-head">
									<button
										type="button"
										className="eelfg-icon-list-repeater-toggle"
										onClick={() => setOpenIndex(openIndex === index ? null : index)}
										aria-expanded={openIndex === index}
									>
										<strong>{item.title || `#${index + 1}`}</strong>
										<span className="eelfg-icon-list-caret" style={{ transform: openIndex === index ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
									</button>
								</div>
							{openIndex === index && (
							<div className="eelfg-icon-list-repeater-body">
							{showIcon !== false && (
							<IconPicker label={__('Icon', 'easy-elements-for-gutenberg')} value={item.icon || ''} onChange={(v) => updateItem(index, 'icon', v)} />
							)}
							<TextControl label={__('Text', 'easy-elements-for-gutenberg')} value={item.title || ''} onChange={(v) => updateItem(index, 'title', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<div className="eelfg-icon-list-repeater-actions">
									<Button icon={ICON_UP} label={__('Move up', 'easy-elements-for-gutenberg')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
									<Button icon={ICON_DOWN} label={__('Move down', 'easy-elements-for-gutenberg')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
									<Button icon={ICON_TRASH} label={__('Remove', 'easy-elements-for-gutenberg')} onClick={() => removeItem(index)} isDestructive size="small" />
								</div>
							</div>
							)}
						</div>
					))}
					<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Item', 'easy-elements-for-gutenberg')}</Button>
					<Divider />
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Layout', 'easy-elements-for-gutenberg')} value={layout || 'default'} onChange={(v) => setAttributes({ layout: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="default" icon={ICON_LAYOUT_DEFAULT} label={__('Default', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="inline" icon={ICON_LAYOUT_INLINE} label={__('Inline', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
					<ToggleControl label={__('Icon', 'easy-elements-for-gutenberg')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
					{showIcon !== false && (
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Icon Position', 'easy-elements-for-gutenberg')} value={feaDir} onChange={(v) => setAttributes({ feaDir: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="left" icon={ICON_DIR_LEFT} label={__('Left', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="right" icon={ICON_DIR_RIGHT} label={__('Right', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
					)}
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Alignment', 'easy-elements-for-gutenberg')} value={listAlign || 'left'} onChange={(v) => setAttributes({ listAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Left', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Center', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Right', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('List', 'easy-elements-for-gutenberg')} initialOpen={true}>
					{num(__('Space Between (px)', 'easy-elements-for-gutenberg'), 'feaItemGap')}
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Alignment', 'easy-elements-for-gutenberg')} value={listAlign || 'left'} onChange={(v) => setAttributes({ listAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Left', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Center', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Right', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
					<Divider />
					<ToggleControl label={__('Divider', 'easy-elements-for-gutenberg')} checked={!!divider} onChange={(v) => setAttributes({ divider: v })} __nextHasNoMarginBottom />
					{divider && color(__('Divider Color', 'easy-elements-for-gutenberg'), 'dividerColor')}
				</PanelBody>

				{showIcon !== false && (
				<PanelBody title={__('Icon', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'iconColor')}
					{color(__('Hover Color', 'easy-elements-for-gutenberg'), 'iconColorHover')}
					{num(__('Size (px)', 'easy-elements-for-gutenberg'), 'iconSize', 200)}
					{num(__('Gap (px)', 'easy-elements-for-gutenberg'), 'feaMiddleGap')}
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Horizontal Alignment', 'easy-elements-for-gutenberg')} value={iconHAlign || 'left'} onChange={(v) => setAttributes({ iconHAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Left', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Center', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Right', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
					<div className="eelfg-caps-label">
						<ToggleGroupControl label={__('Vertical Alignment', 'easy-elements-for-gutenberg')} value={feaVerticalAlign || 'center'} onChange={(v) => setAttributes({ feaVerticalAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="flex-start" icon={ICON_VALIGN_TOP} label={__('Top', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="center" icon={ICON_VALIGN_MID} label={__('Middle', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="flex-end" icon={ICON_VALIGN_BOTTOM} label={__('Bottom', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					</div>
					{num(__('Adjust Vertical Position (px)', 'easy-elements-for-gutenberg'), 'iconOffsetY', 100, -100)}
				</PanelBody>
				)}

				<PanelBody title={__('Text', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'titleColor')}
					{respTypo(__('Typography', 'easy-elements-for-gutenberg'), 'titleTypography')}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/icon-list" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
