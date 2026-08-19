import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
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

import './editor.scss';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. titlePaddingTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

// Alignment icons: left = icon left of text, center = icon on top, right = icon right.
const ASVG = ({ children }) => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{children}</svg>
);
const ICON_ALIGN_LEFT = <ASVG><rect x="3" y="7" width="8" height="8" rx="1.5" /><rect x="13" y="8" width="8" height="2" /><rect x="13" y="12" width="6" height="2" /></ASVG>;
const ICON_ALIGN_CENTER = <ASVG><rect x="8" y="3" width="8" height="8" rx="1.5" /><rect x="5" y="14" width="14" height="2" /><rect x="7" y="18" width="10" height="2" /></ASVG>;
const ICON_ALIGN_RIGHT = <ASVG><rect x="13" y="7" width="8" height="8" rx="1.5" /><rect x="3" y="8" width="8" height="2" /><rect x="5" y="12" width="6" height="2" /></ASVG>;
// Vertical alignment (used when icon is on the left / right of the text).
const ICON_VTOP = <ASVG><rect x="3" y="4" width="18" height="2" /><rect x="8" y="8" width="8" height="11" rx="1.5" /></ASVG>;
const ICON_VMID = <ASVG><rect x="3" y="11" width="18" height="2" /><rect x="8" y="5" width="8" height="14" rx="1.5" /></ASVG>;
const ICON_VBOT = <ASVG><rect x="3" y="18" width="18" height="2" /><rect x="8" y="5" width="8" height="11" rx="1.5" /></ASVG>;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, iconType, icon, number, image, title, desc, iconView, showIcon } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'eelfg-icon-box-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const type = iconType || 'icon';

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	// Responsive spacing (padding / margin) â€” clean 4-side control per device.
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
	// Responsive typography â€” one typography object per device.
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
				<PanelBody title={__('Content', 'easy-elements-for-gutenberg')} initialOpen={true}>
					<ToggleControl label={__('Icon', 'easy-elements-for-gutenberg')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
					{showIcon !== false && (
					<SelectControl
						label={__('Type', 'easy-elements-for-gutenberg')}
						value={type}
						options={[
							{ label: __('Icon', 'easy-elements-for-gutenberg'), value: 'icon' },
							{ label: __('Number', 'easy-elements-for-gutenberg'), value: 'number' },
							{ label: __('Image', 'easy-elements-for-gutenberg'), value: 'image' },
						]}
						onChange={(v) => setAttributes({ iconType: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					)}
					{showIcon !== false && type === 'icon' && <IconPicker label={__('Icon', 'easy-elements-for-gutenberg')} value={icon || ''} onChange={(v) => setAttributes({ icon: v })} />}
					{showIcon !== false && type === 'number' && <TextControl label={__('Number', 'easy-elements-for-gutenberg')} value={number || ''} onChange={(v) => setAttributes({ number: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
					{showIcon !== false && type === 'image' && (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => setAttributes({ image: { id: media.id, url: media.url, alt: media.alt } })}
								allowedTypes={['image']}
								value={image?.id}
								render={({ open }) => (
									<div style={{ marginBottom: '8px' }}>
										{image?.url && <img src={image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
										<Button variant="secondary" size="small" onClick={open}>{image?.url ? __('Replace', 'easy-elements-for-gutenberg') : __('Select Image', 'easy-elements-for-gutenberg')}</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
					)}
					<TextControl label={__('Title', 'easy-elements-for-gutenberg')} value={title || ''} onChange={(v) => setAttributes({ title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextareaControl label={__('Description', 'easy-elements-for-gutenberg')} value={desc || ''} onChange={(v) => setAttributes({ desc: v })} __nextHasNoMarginBottom />
					<Divider />
					{showIcon !== false && (
					<ToggleGroupControl label={__('Alignment', 'easy-elements-for-gutenberg')} value={attributes.boxAlign} onChange={(v) => setAttributes({ boxAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
						<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Icon Left', 'easy-elements-for-gutenberg')} />
						<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Icon Top', 'easy-elements-for-gutenberg')} />
						<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Icon Right', 'easy-elements-for-gutenberg')} />
					</ToggleGroupControl>
					)}
					{showIcon !== false && (attributes.boxAlign === 'left' || attributes.boxAlign === 'right') && (
						<ToggleGroupControl label={__('Vertical Alignment', 'easy-elements-for-gutenberg')} value={attributes.boxVAlign} onChange={(v) => setAttributes({ boxVAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
							<ToggleGroupControlOptionIcon value="flex-start" icon={ICON_VTOP} label={__('Top', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="center" icon={ICON_VMID} label={__('Middle', 'easy-elements-for-gutenberg')} />
							<ToggleGroupControlOptionIcon value="flex-end" icon={ICON_VBOT} label={__('Bottom', 'easy-elements-for-gutenberg')} />
						</ToggleGroupControl>
					)}
					<Divider />
					{showIcon !== false && <SelectControl label={__('Icon View', 'easy-elements-for-gutenberg')} value={iconView} options={[{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'default' }, { label: __('Frame', 'easy-elements-for-gutenberg'), value: 'frame' }, { label: __('Stacked', 'easy-elements-for-gutenberg'), value: 'stracked' }]} onChange={(v) => setAttributes({ iconView: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
					{showIcon !== false && (iconView === 'frame' || iconView === 'stracked') && (
						<SelectControl label={__('Shape', 'easy-elements-for-gutenberg')} value={attributes.iconShape} options={[{ label: __('Rounded', 'easy-elements-for-gutenberg'), value: 'rounded' }, { label: __('Square', 'easy-elements-for-gutenberg'), value: 'square' }, { label: __('Circle', 'easy-elements-for-gutenberg'), value: 'circle' }, { label: __('Square Rotate', 'easy-elements-for-gutenberg'), value: 'sq_rotate' }]} onChange={(v) => setAttributes({ iconShape: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					)}
					<SelectControl label={__('Title HTML Tag', 'easy-elements-for-gutenberg')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Icon Box', 'easy-elements-for-gutenberg')} initialOpen={true}>
					{bg(__('Background', 'easy-elements-for-gutenberg'), 'listBgColor', 'listBgGradient')}
					{num(__('Gap (px)', 'easy-elements-for-gutenberg'), 'feaMiddleGap')}
					{border(__('Border', 'easy-elements-for-gutenberg'), 'feaListBorder')}
					{box(__('Border Radius', 'easy-elements-for-gutenberg'), 'feaListBorderRadius')}
					{respBox(__('Padding', 'easy-elements-for-gutenberg'), 'feaListPadding')}
					{respBox(__('Margin', 'easy-elements-for-gutenberg'), 'feaBlockMargin')}
				</PanelBody>

{showIcon !== false && (
				<PanelBody title={__('Icon', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'iconColor')}
					{bg(__('Background', 'easy-elements-for-gutenberg'), 'iconBgColor', 'iconBgGradient')}
					{num(__('Size (px)', 'easy-elements-for-gutenberg'), 'iconSize', 200)}
					{num(__('Box Size (px)', 'easy-elements-for-gutenberg'), 'iconBoxSize', 200)}
					{shadow(__('Box Shadow', 'easy-elements-for-gutenberg'), 'iconShadow')}
					{border(__('Border', 'easy-elements-for-gutenberg'), 'iconBorder')}
					{box(__('Border Radius', 'easy-elements-for-gutenberg'), 'iconRadius')}
				</PanelBody>
				)}

				<PanelBody title={__('Title', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'titleColor')}
					{respTypo(__('Typography', 'easy-elements-for-gutenberg'), 'titleTypography')}
					{respBox(__('Padding', 'easy-elements-for-gutenberg'), 'titlePadding')}
				</PanelBody>

				<PanelBody title={__('Description', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'descColor')}
					{respTypo(__('Typography', 'easy-elements-for-gutenberg'), 'descTypography')}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/icon-box" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
