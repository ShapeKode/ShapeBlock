import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
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
	BoxControl,
	Button,
	ToolbarDropdownMenu,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');

const ALIGN = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		teamSkin,
		actionType,
		showSocialIcon,
		socialIconPosition,
		socialIconShow,
		socialHoverIcon,
		socialLinks,
		showContactInfo,
		contentShow,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-team-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (teamContentAlignment / ...Tablet / ...Mobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'teamContentAlignment' : `teamContentAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	const items = Array.isArray(socialLinks) ? socialLinks : [];
	const updateItem = (i, key, val) => setAttributes({ socialLinks: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addItem = () => setAttributes({ socialLinks: [...items, { url: '#', icon: '' }] });
	const removeItem = (i) => setAttributes({ socialLinks: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's nested objects are not shared with the original.
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ socialLinks: next });
	};
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ socialLinks: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <BoxControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <SelectControl value={attributes[k]} options={options} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	const isContentSkin = teamSkin === 'default' || teamSkin === 'skin2';

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Team Settings', 'shapeblock')} initialOpen={true}>
				<SelectControl
					label={__('Skin Type', 'shapeblock')}
					value={teamSkin}
					options={[
						{ label: __('Default', 'shapeblock'), value: 'default' },
						{ label: __('Skin 01', 'shapeblock'), value: 'skin1' },
						{ label: __('Skin 02', 'shapeblock'), value: 'skin2' },
						{ label: __('Skin 03', 'shapeblock'), value: 'skin3' },
						{ label: __('Skin 04 (Hover Overlay)', 'shapeblock'), value: 'skin4' },
						{ label: __('Skin 05', 'shapeblock'), value: 'skin5' },
					]}
					onChange={(v) => setAttributes({ teamSkin: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{teamSkin === 'skin4' && (
					<SelectControl
						label={__('Hover Overlay Style', 'shapeblock')}
						value={attributes.skin4HoverOverlay}
						options={[
							{ label: __('Hover Overlay 1', 'shapeblock'), value: 'overlay1' },
							{ label: __('Hover Overlay 2', 'shapeblock'), value: 'overlay2' },
						]}
						onChange={(v) => setAttributes({ skin4HoverOverlay: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				<MediaUploadCheck>
					<MediaUpload
						onSelect={(media) => setAttributes({ image: { id: media.id, url: media.url, alt: media.alt } })}
						allowedTypes={['image']}
						value={attributes.image?.id}
						render={({ open }) => (
							<div style={{ margin: '8px 0' }}>
								{attributes.image?.url && <img src={attributes.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '8px' }} />}
								<Button variant="secondary" onClick={open} style={{ width: '100%', justifyContent: 'center' }}>{attributes.image?.url ? __('Replace Image', 'shapeblock') : __('Select Image', 'shapeblock')}</Button>
							</div>
						)}
					/>
				</MediaUploadCheck>
				<TextControl label={__('Name', 'shapeblock')} value={attributes.name} onChange={(v) => setAttributes({ name: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl label={__('Title HTML Tag', 'shapeblock')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Designation', 'shapeblock')} value={attributes.designation} onChange={(v) => setAttributes({ designation: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextareaControl label={__('Description', 'shapeblock')} value={attributes.details} onChange={(v) => setAttributes({ details: v })} __nextHasNoMarginBottom />
				{isContentSkin && (
					<SelectControl
						label={__('Content Show', 'shapeblock')}
						value={contentShow}
						options={[
							{ label: __('Inside Image', 'shapeblock'), value: 'inside' },
							{ label: __('Normal', 'shapeblock'), value: 'normal' },
						]}
						onChange={(v) => setAttributes({ contentShow: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				<Divider />
				{bg(__('Image Overlay', 'shapeblock'), 'imageOverlayColor', 'imageOverlayGradient')}
				<ToggleControl label={__('Show Social Icon', 'shapeblock')} checked={showSocialIcon} onChange={(v) => setAttributes({ showSocialIcon: v })} __nextHasNoMarginBottom />
			</PanelBody>

			{teamSkin === 'skin5' && (
				<PanelBody title={__('Contact Info', 'shapeblock')} initialOpen={false}>
					<ToggleControl label={__('Show Contact Info', 'shapeblock')} checked={showContactInfo} onChange={(v) => setAttributes({ showContactInfo: v })} __nextHasNoMarginBottom />
					{showContactInfo && (
						<>
							<TextControl label={__('Email', 'shapeblock')} value={attributes.teamEmail} onChange={(v) => setAttributes({ teamEmail: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
							<TextControl label={__('Phone', 'shapeblock')} value={attributes.teamPhone} onChange={(v) => setAttributes({ teamPhone: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
							<IconPicker label={__('Email Icon', 'shapeblock')} value={attributes.teamEmailIcon} onChange={(v) => setAttributes({ teamEmailIcon: v })} />
							<IconPicker label={__('Phone Icon', 'shapeblock')} value={attributes.teamPhoneIcon} onChange={(v) => setAttributes({ teamPhoneIcon: v })} />
						</>
					)}
				</PanelBody>
			)}

			<PanelBody title={__('Action', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Action Type', 'shapeblock')}
					value={actionType}
					options={[
						{ label: __('Link', 'shapeblock'), value: 'link' },
						{ label: __('Popup', 'shapeblock'), value: 'popup' },
					]}
					onChange={(v) => setAttributes({ actionType: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{actionType === 'link' && (
					<>
						<TextControl label={__('Link URL', 'shapeblock')} type="url" value={attributes.linkUrl} onChange={(v) => setAttributes({ linkUrl: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={attributes.linkTarget} onChange={(v) => setAttributes({ linkTarget: v })} __nextHasNoMarginBottom />
						<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={attributes.linkNofollow} onChange={(v) => setAttributes({ linkNofollow: v })} __nextHasNoMarginBottom />
					</>
				)}
			</PanelBody>

			{showSocialIcon && (
				<PanelBody title={__('Social Settings', 'shapeblock')} initialOpen={false}>
					<SelectControl
						label={__('Icon Position', 'shapeblock')}
						value={socialIconPosition}
						options={[
							{ label: __('Default', 'shapeblock'), value: 'default' },
							{ label: __('Top Left', 'shapeblock'), value: 'posi_left' },
							{ label: __('Top Right', 'shapeblock'), value: 'posi_right' },
							{ label: __('Bottom Left', 'shapeblock'), value: 'posi_botttom_left' },
							{ label: __('Bottom Right', 'shapeblock'), value: 'posi_botttom_right' },
						]}
						onChange={(v) => setAttributes({ socialIconPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{socialIconPosition !== 'default' && (
						<>
							<SelectControl
								label={__('Icon Show', 'shapeblock')}
								value={socialIconShow}
								options={[
									{ label: __('Default Show', 'shapeblock'), value: 'dafault_show' },
									{ label: __('Icon Hover Show', 'shapeblock'), value: 'hover_show' },
								]}
								onChange={(v) => setAttributes({ socialIconShow: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							{socialIconShow === 'hover_show' && <IconPicker label={__('Hover Icon', 'shapeblock')} value={socialHoverIcon} onChange={(v) => setAttributes({ socialHoverIcon: v })} />}
							{(socialIconPosition === 'posi_left' || socialIconPosition === 'posi_right') && num(__('Top Position (px)', 'shapeblock'), 'sIconPosiTop')}
							{(socialIconPosition === 'posi_botttom_left' || socialIconPosition === 'posi_botttom_right') && num(__('Bottom Position (px)', 'shapeblock'), 'sIconPosiBottom')}
							{(socialIconPosition === 'posi_left' || socialIconPosition === 'posi_botttom_left') && num(__('Left Position (px)', 'shapeblock'), 'sIconPosiLeft')}
							{(socialIconPosition === 'posi_right' || socialIconPosition === 'posi_botttom_right') && num(__('Right Position (px)', 'shapeblock'), 'sIconPosiRight')}
						</>
					)}
					<Divider />
					{items.map((item, index) => (
						<div className="shapeblock-team-grid-repeater-item" key={index}>
							<div className="shapeblock-team-grid-repeater-head">
								<strong>#{index + 1}</strong>
								<div>
									<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
									<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
									<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
									<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
								</div>
							</div>
							<TextControl label={__('Link URL', 'shapeblock')} value={item.url || ''} onChange={(v) => updateItem(index, 'url', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
							<IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(index, 'icon', v)} />
						</div>
					))}
					<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Social Link', 'shapeblock')}</Button>
				</PanelBody>
			)}
		</>
	);

	// --- Tab 2: Layout (arrangement & dimensions) -----------------------------
	const layoutTab = (
		<PanelBody title={__('Spacing & Sizing', 'shapeblock')} initialOpen={true}>
			{respAlign(__('Content Alignment', 'shapeblock'), 'teamContentAlignment', [{ label: __('Default', 'shapeblock'), value: '' }, ...ALIGN])}
			{respBox(__('Team Item Padding', 'shapeblock'), 'itemPadding')}
			{respBox(__('Content Area Padding', 'shapeblock'), 'wrapPadding')}
			{respBox(__('Content Area Margin', 'shapeblock'), 'wrapMargin')}
			{box(__('Name Padding', 'shapeblock'), 'namePadding')}
			<Divider />
			{respNum(__('Image Width (px)', 'shapeblock'), 'imageWidth')}
			{respNum(__('Image Height (px)', 'shapeblock'), 'imageHeightStyle')}
			{respBox(__('Image Padding', 'shapeblock'), 'imagePadding')}
			{showSocialIcon && (
				<>
					<Divider />
					{respNum(__('Social Icon Gap (px)', 'shapeblock'), 'sIconGap')}
					{respNum(__('Social Button Size (px)', 'shapeblock'), 'sIconButtonSize')}
					{respBox(__('Social Icon Area Padding', 'shapeblock'), 'sIconAreaPadding')}
					{socialIconPosition === 'default' && respAlign(__('Social Icon Alignment', 'shapeblock'), 'teamSocialIconAlignment', [{ label: __('Default', 'shapeblock'), value: '' }, { label: __('Left', 'shapeblock'), value: 'flex-start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('Right', 'shapeblock'), value: 'flex-end' }])}
				</>
			)}
		</PanelBody>
	);

	// --- Tab 3: Style (colors, typography, borders) ---------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Team Item', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'cardBgColor', 'cardBgGradient')}
				{box(__('Border Radius', 'shapeblock'), 'itemBorderRadius')}
				{border(__('Border', 'shapeblock'), 'teamBorder')}
				{color(__('Hover Border Color', 'shapeblock'), 'teamHoverBorderColor')}
				{shadow(__('Box Shadow', 'shapeblock'), 'teamBoxShadow')}
			</PanelBody>

			<PanelBody title={__('Image', 'shapeblock')} initialOpen={false}>
				{box(__('Border Radius', 'shapeblock'), 'imageStyleRadius')}
				<Divider />
				{color(__('Below Background Color', 'shapeblock'), 'imageBelowBg')}
				{respNum(__('Below BG Height (%)', 'shapeblock'), 'imageBelowHeight')}
				<SelectControl label={__('Below BG Position', 'shapeblock')} value={attributes.imageBelowPosition} options={[{ label: __('Top', 'shapeblock'), value: 'top' }, { label: __('Bottom', 'shapeblock'), value: 'bottom' }]} onChange={(v) => setAttributes({ imageBelowPosition: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{box(__('Below BG Border Radius', 'shapeblock'), 'imageBelowRadius')}
			</PanelBody>

			<PanelBody title={__('Name & Designation Area', 'shapeblock')} initialOpen={false}>
				{color(__('Background Color', 'shapeblock'), 'areaBgColor')}
				{box(__('Border Radius', 'shapeblock'), 'areaBorderRadius')}
			</PanelBody>

			{teamSkin === 'skin4' && (
				<PanelBody title={__('Hover Overlay', 'shapeblock')} initialOpen={false}>
					{bg(__('Background', 'shapeblock'), 'skin4OverlayColor', 'skin4OverlayGradient')}
					{num(__('Backdrop Blur (px)', 'shapeblock'), 'skin4OverlayBlur')}
					{color(__('Text Color', 'shapeblock'), 'skin4OverlayTextColor')}
					{attributes.skin4HoverOverlay === 'overlay2' && num(__('Overlay 2 Circle Size (px)', 'shapeblock'), 'skin4Overlay2CircleSize')}
					{box(__('Padding', 'shapeblock'), 'skin4OverlayPadding')}
					{box(__('Border Radius', 'shapeblock'), 'skin4OverlayBorderRadius')}
					{num(__('Transition Duration (s)', 'shapeblock'), 'skin4OverlayTransition')}
				</PanelBody>
			)}

			<PanelBody title={__('Name', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'nameColor')}
				{respTypo(__('Typography', 'shapeblock'), 'nameTypography')}
			</PanelBody>

			<PanelBody title={__('Designation', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'designationColor')}
				{respTypo(__('Typography', 'shapeblock'), 'designationTypography')}
			</PanelBody>

			{teamSkin === 'skin5' && showContactInfo && (
				<PanelBody title={__('Contact Info', 'shapeblock')} initialOpen={false}>
					{respNum(__('Items Gap (px)', 'shapeblock'), 'contactGap')}
					<Divider />
					{color(__('Text Color', 'shapeblock'), 'contactTextColor')}
					{bg(__('Item Background', 'shapeblock'), 'contactItemBgColor', 'contactItemBgGradient')}
					{color(__('Text Color (Hover)', 'shapeblock'), 'contactTextHoverColor')}
					{bg(__('Item Background (Hover)', 'shapeblock'), 'contactItemBgHoverColor', 'contactItemBgHoverGradient')}
					{respTypo(__('Typography', 'shapeblock'), 'contactTypography')}
					{box(__('Item Border Radius', 'shapeblock'), 'contactItemRadius')}
					{box(__('Item Padding', 'shapeblock'), 'contactItemPadding')}
					<Divider />
					{color(__('Icon Color', 'shapeblock'), 'contactIconColor')}
					{bg(__('Icon Background', 'shapeblock'), 'contactIconBgColor', 'contactIconBgGradient')}
					{respNum(__('Icon Size (px)', 'shapeblock'), 'contactIconSize')}
					{respNum(__('Icon Box Size (px)', 'shapeblock'), 'contactIconBoxSize')}
					{box(__('Icon Border Radius', 'shapeblock'), 'contactIconRadius')}
				</PanelBody>
			)}

			{(teamSkin === 'default' || teamSkin === 'skin1' || teamSkin === 'skin2') && (
				<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'teamDescriptionColor')}
					{respTypo(__('Typography', 'shapeblock'), 'teamDescriptionTypography')}
					{box(__('Margin', 'shapeblock'), 'teamDescriptionMargin')}
					{box(__('Padding', 'shapeblock'), 'teamDescriptionPadding')}
				</PanelBody>
			)}

			{teamSkin === 'skin3' && (
				<PanelBody title={__('Description (Overlay)', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'descColor')}
					{bg(__('Background', 'shapeblock'), 'descBgColor', 'descBgGradient')}
					{color(__('Color (Hover)', 'shapeblock'), 'descColorHover')}
					{bg(__('Hover Background', 'shapeblock'), 'descBgHoverColor', 'descBgHoverGradient')}
					<TextControl label={__('Hover BG Opacity (0-1)', 'shapeblock')} type="number" step="0.1" value={attributes.descBgHoverOpacity} onChange={(v) => setAttributes({ descBgHoverOpacity: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
					{box(__('Padding', 'shapeblock'), 'descPadding')}
				</PanelBody>
			)}

			{showSocialIcon && (
				<PanelBody title={__('Social Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'sIconColor')}
					{color(__('Background', 'shapeblock'), 'sIconBgColor')}
					{color(__('Color (Hover)', 'shapeblock'), 'sIconHoverColor')}
					{color(__('Background (Hover)', 'shapeblock'), 'sIconHoverBgColor')}
					{respTypo(__('Typography', 'shapeblock'), 'sIconTypography')}
					{box(__('Border Radius', 'shapeblock'), 'sIconRadius')}
					{socialIconPosition === 'default' && border(__('Area Border', 'shapeblock'), 'socialItemBorder')}
					{shadow(__('Box Shadow', 'shapeblock'), 'socialBoxShadow')}
				</PanelBody>
			)}

			{actionType === 'popup' && (
				<PanelBody title={__('Popup Style', 'shapeblock')} initialOpen={false}>
					{color(__('Background Color', 'shapeblock'), 'popupBgColor')}
					{color(__('Name Color', 'shapeblock'), 'popupNameColor')}
					{respTypo(__('Name Typography', 'shapeblock'), 'popupNameTypography')}
					{color(__('Designation Color', 'shapeblock'), 'popupDesignationColor')}
					{respTypo(__('Designation Typography', 'shapeblock'), 'popupDesignationTypography')}
					{color(__('Details Color', 'shapeblock'), 'popupDetailsColor')}
					{respTypo(__('Details Typography', 'shapeblock'), 'popupDetailsTypography')}
					{color(__('Close Icon Color', 'shapeblock'), 'popupCloseColor')}
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || '' })}
				/>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h4').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].map((t) => ({
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

			<ServerSideRender block="shapeblock/team-grid" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
