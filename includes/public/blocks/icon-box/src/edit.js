import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
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
	TabPanel,
	ToolbarDropdownMenu,
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
			setAttributes({ blockId: 'shapeblock-icon-box-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const type = iconType || 'icon';

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	// Responsive spacing (padding / margin) — clean 4-side control per device.
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
	// Responsive typography — one typography object per device.
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

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Content', 'shapeblock')} initialOpen={true}>
			<ToggleControl label={__('Icon', 'shapeblock')} checked={showIcon !== false} onChange={(v) => setAttributes({ showIcon: v })} __nextHasNoMarginBottom />
			{showIcon !== false && (
			<SelectControl
				label={__('Type', 'shapeblock')}
				value={type}
				options={[
					{ label: __('Icon', 'shapeblock'), value: 'icon' },
					{ label: __('Number', 'shapeblock'), value: 'number' },
					{ label: __('Image', 'shapeblock'), value: 'image' },
				]}
				onChange={(v) => setAttributes({ iconType: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			)}
			{showIcon !== false && type === 'icon' && <IconPicker label={__('Icon', 'shapeblock')} value={icon || ''} onChange={(v) => setAttributes({ icon: v })} />}
			{showIcon !== false && type === 'number' && <TextControl label={__('Number', 'shapeblock')} value={number || ''} onChange={(v) => setAttributes({ number: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
			{showIcon !== false && type === 'image' && (
				<MediaUploadCheck>
					<MediaUpload
						onSelect={(media) => setAttributes({ image: { id: media.id, url: media.url, alt: media.alt } })}
						allowedTypes={['image']}
						value={image?.id}
						render={({ open }) => (
							<div style={{ marginBottom: '8px' }}>
								{image?.url && <img src={image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
								<Button variant="secondary" size="small" onClick={open}>{image?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}</Button>
							</div>
						)}
					/>
				</MediaUploadCheck>
			)}
			<TextControl label={__('Title', 'shapeblock')} value={title || ''} onChange={(v) => setAttributes({ title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<TextareaControl label={__('Description', 'shapeblock')} value={desc || ''} onChange={(v) => setAttributes({ desc: v })} __nextHasNoMarginBottom />
			<Divider />
			{showIcon !== false && <SelectControl label={__('Icon View', 'shapeblock')} value={iconView} options={[{ label: __('Default', 'shapeblock'), value: 'default' }, { label: __('Frame', 'shapeblock'), value: 'frame' }, { label: __('Stacked', 'shapeblock'), value: 'stracked' }]} onChange={(v) => setAttributes({ iconView: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
			{showIcon !== false && (iconView === 'frame' || iconView === 'stracked') && (
				<SelectControl label={__('Shape', 'shapeblock')} value={attributes.iconShape} options={[{ label: __('Rounded', 'shapeblock'), value: 'rounded' }, { label: __('Square', 'shapeblock'), value: 'square' }, { label: __('Circle', 'shapeblock'), value: 'circle' }, { label: __('Square Rotate', 'shapeblock'), value: 'sq_rotate' }]} onChange={(v) => setAttributes({ iconShape: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			)}
			<SelectControl label={__('Title HTML Tag', 'shapeblock')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
		</PanelBody>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Icon Box', 'shapeblock')} initialOpen={true}>
				{showIcon !== false && (
				<ToggleGroupControl label={__('Alignment', 'shapeblock')} value={attributes.boxAlign} onChange={(v) => setAttributes({ boxAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
					<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Icon Left', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Icon Top', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Icon Right', 'shapeblock')} />
				</ToggleGroupControl>
				)}
				{showIcon !== false && (attributes.boxAlign === 'left' || attributes.boxAlign === 'right') && (
					<ToggleGroupControl label={__('Vertical Alignment', 'shapeblock')} value={attributes.boxVAlign} onChange={(v) => setAttributes({ boxVAlign: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
						<ToggleGroupControlOptionIcon value="flex-start" icon={ICON_VTOP} label={__('Top', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="center" icon={ICON_VMID} label={__('Middle', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="flex-end" icon={ICON_VBOT} label={__('Bottom', 'shapeblock')} />
					</ToggleGroupControl>
				)}
				{num(__('Gap (px)', 'shapeblock'), 'feaMiddleGap')}
				{num(__('Space Between (px)', 'shapeblock'), 'feaItemGap')}
				{respBox(__('Padding', 'shapeblock'), 'feaListPadding')}
				{respBox(__('Margin', 'shapeblock'), 'feaBlockMargin')}
			</PanelBody>

			{showIcon !== false && (
			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{num(__('Size (px)', 'shapeblock'), 'iconSize', 200)}
				{num(__('Box Size (px)', 'shapeblock'), 'iconBoxSize', 200)}
			</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'titlePadding')}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Icon Box', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'listBgColor', 'listBgGradient')}
				{border(__('Border', 'shapeblock'), 'feaListBorder')}
				{box(__('Border Radius', 'shapeblock'), 'feaListBorderRadius')}
			</PanelBody>

			{showIcon !== false && (
			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'iconColor')}
				{bg(__('Background', 'shapeblock'), 'iconBgColor', 'iconBgGradient')}
				{shadow(__('Box Shadow', 'shapeblock'), 'iconShadow')}
				{border(__('Border', 'shapeblock'), 'iconBorder')}
				{box(__('Border Radius', 'shapeblock'), 'iconRadius')}
			</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes.boxAlign}
					onChange={(value) => setAttributes({ boxAlign: value || 'center' })}
				/>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h3').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({
						title: t.toUpperCase(),
						isActive: attributes.titleTag === t,
						onClick: () => setAttributes({ titleTag: t }),
					}))}
				/>
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

			<ServerSideRender block="shapeblock/icon-box" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
