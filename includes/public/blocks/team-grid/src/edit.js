import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import ServerSideRender from '../../custom-components/ServerRender';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	BoxControl,
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
import AdvancedControls from '../../custom-components/AdvancedControls';
import TeamCard from './card';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const ALIGN = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

// The skins, each with a small drawing of its card.
const SKINS = [
	{ value: 'default', label: __('Default', 'shapeblock') },
	{ value: 'skin1', label: __('Side by Side', 'shapeblock') },
	{ value: 'skin2', label: __('Color Back', 'shapeblock') },
	{ value: 'skin3', label: __('Caption', 'shapeblock') },
	{ value: 'skin4', label: __('Hover Overlay', 'shapeblock') },
	{ value: 'skin5', label: __('Hover Details', 'shapeblock') },
];

export default function Edit({ attributes, setAttributes, clientId, isSelected }) {
	const {
		blockId,
		teamSkin,
		actionType,
		showSocialIcon,
		socialIconPosition,
		socialIconShow,
		socialHoverIcon,
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

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
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
			{(device) => <BoxControl label="" values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
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

	const isContentSkin = !teamSkin || teamSkin === 'default' || teamSkin === 'skin2';

	// The block's CSS (colours, sizes, per device ...) comes from the server: a
	// hidden preview, not fetched again while the text is typed.
	const TEXT = ['name', 'designation', 'details', 'teamEmail', 'teamPhone', 'socialLinks', 'image', 'linkUrl'];
	const styleKey = JSON.stringify(TEXT.reduce((a, k) => ({ ...a, [k]: 0 }), { ...attributes }));
	const styleOnly = useMemo(() => ({ ...attributes, name: '', designation: '', details: '', teamEmail: '', teamPhone: '', socialLinks: [], image: {}, linkUrl: '' }), [styleKey]); // eslint-disable-line react-hooks/exhaustive-deps
	const socialOn = showSocialIcon;
	// Skin 04's round overlay always keeps the icons in its circle.
	const roundOverlay = teamSkin === 'skin4' && attributes.skin4HoverOverlay === 'overlay2';
	const iconPos = roundOverlay ? 'default' : socialIconPosition;

	// --- Settings: what the card says and does -------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Content', 'shapeblock')} initialOpen={true}>
				<p className="components-base-control__help">
					{__('Type in the card itself, or here. Click the photo in the card to change it.', 'shapeblock')}
				</p>
				<TextControl label={__('Name', 'shapeblock')} value={attributes.name || ''} onChange={(v) => setAttributes({ name: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Designation', 'shapeblock')} value={attributes.designation || ''} onChange={(v) => setAttributes({ designation: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{teamSkin !== 'skin4' && (
					<TextareaControl
						label={__('Bio', 'shapeblock')}
						value={String(attributes.details || '').replace(/<br\s*\/?>/gi, '\n')}
						onChange={(v) => setAttributes({ details: v })}
						__nextHasNoMarginBottom
					/>
				)}
				{/* Skin 04 shows no bio on the card: it is the popup's text. */}
				{teamSkin === 'skin4' && actionType === 'popup' && <TextareaControl label={__('Popup Text', 'shapeblock')} value={attributes.details} onChange={(v) => setAttributes({ details: v })} __nextHasNoMarginBottom />}
				<SelectControl label={__('Name HTML Tag', 'shapeblock')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Email & Phone', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show Email & Phone', 'shapeblock')} checked={showContactInfo} onChange={(v) => setAttributes({ showContactInfo: v })} help={teamSkin === 'skin5' ? __('Shown when the card is hovered.', 'shapeblock') : __('Each opens the email app or the phone dialer.', 'shapeblock')} __nextHasNoMarginBottom />
				{showContactInfo && (
					<>
						<TextControl label={__('Email', 'shapeblock')} type="email" value={attributes.teamEmail || ''} onChange={(v) => setAttributes({ teamEmail: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Phone', 'shapeblock')} type="tel" value={attributes.teamPhone || ''} onChange={(v) => setAttributes({ teamPhone: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<IconPicker label={__('Email Icon', 'shapeblock')} value={attributes.teamEmailIcon} onChange={(v) => setAttributes({ teamEmailIcon: v })} />
						<IconPicker label={__('Phone Icon', 'shapeblock')} value={attributes.teamPhoneIcon} onChange={(v) => setAttributes({ teamPhoneIcon: v })} />
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Social Icons', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show Social Icons', 'shapeblock')} checked={showSocialIcon} onChange={(v) => setAttributes({ showSocialIcon: v })} help={__('Click an icon in the card to change its link or icon; the + adds one.', 'shapeblock')} __nextHasNoMarginBottom />
				{socialOn && !roundOverlay && (
					<SelectControl
						label={__('Position', 'shapeblock')}
						value={socialIconPosition}
						options={[
							{ label: __('Under the text', 'shapeblock'), value: 'default' },
							{ label: __('Photo corner: top left', 'shapeblock'), value: 'posi_left' },
							{ label: __('Photo corner: top right', 'shapeblock'), value: 'posi_right' },
							{ label: __('Photo corner: bottom left', 'shapeblock'), value: 'posi_botttom_left' },
							{ label: __('Photo corner: bottom right', 'shapeblock'), value: 'posi_botttom_right' },
						]}
						onChange={(v) => setAttributes({ socialIconPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				{socialOn && iconPos === 'default' && respAlign(__('Alignment', 'shapeblock'), 'teamSocialIconAlignment', [{ label: __('Like the text', 'shapeblock'), value: '' }, { label: __('Left', 'shapeblock'), value: 'flex-start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('Right', 'shapeblock'), value: 'flex-end' }])}
				{socialOn && iconPos !== 'default' && (
					<>
						{(iconPos === 'posi_left' || iconPos === 'posi_right') && num(__('From the Top (px)', 'shapeblock'), 'sIconPosiTop')}
						{(iconPos === 'posi_botttom_left' || iconPos === 'posi_botttom_right') && num(__('From the Bottom (px)', 'shapeblock'), 'sIconPosiBottom')}
						{(iconPos === 'posi_left' || iconPos === 'posi_botttom_left') && num(__('From the Left (px)', 'shapeblock'), 'sIconPosiLeft')}
						{(iconPos === 'posi_right' || iconPos === 'posi_botttom_right') && num(__('From the Right (px)', 'shapeblock'), 'sIconPosiRight')}
						<SelectControl
							label={__('Show', 'shapeblock')}
							value={socialIconShow}
							options={[
								{ label: __('Always', 'shapeblock'), value: 'dafault_show' },
								{ label: __('When one icon is hovered', 'shapeblock'), value: 'hover_show' },
							]}
							onChange={(v) => setAttributes({ socialIconShow: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						{socialIconShow === 'hover_show' && <IconPicker label={__('That Icon', 'shapeblock')} value={socialHoverIcon} onChange={(v) => setAttributes({ socialHoverIcon: v })} />}
					</>
				)}
			</PanelBody>

			<PanelBody title={__('When Clicked', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('A click on the photo', 'shapeblock')}
					value={actionType}
					options={[
						{ label: __('Opens a link', 'shapeblock'), value: 'link' },
						{ label: __('Opens a popup with the bio', 'shapeblock'), value: 'popup' },
					]}
					onChange={(v) => setAttributes({ actionType: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{actionType === 'link' && (
					<>
						<TextControl label={__('Link', 'shapeblock')} type="url" placeholder="https://" help={__('Empty: the photo is not a link.', 'shapeblock')} value={attributes.linkUrl} onChange={(v) => setAttributes({ linkUrl: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={attributes.linkTarget} onChange={(v) => setAttributes({ linkTarget: v })} __nextHasNoMarginBottom />
						<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={attributes.linkNofollow} onChange={(v) => setAttributes({ linkNofollow: v })} __nextHasNoMarginBottom />
					</>
				)}
			</PanelBody>
		</>
	);

	// --- Layout: the skin, alignment and photo size --------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Skin', 'shapeblock')} initialOpen={true}>
				<div className="shapeblock-team-skin-picker" role="radiogroup" aria-label={__('Skin', 'shapeblock')}>
					{SKINS.map((sk) => (
						<button
							type="button"
							key={sk.value}
							role="radio"
							aria-checked={(teamSkin || 'default') === sk.value}
							className={`shapeblock-team-skin-option is-${sk.value}${(teamSkin || 'default') === sk.value ? ' is-active' : ''}`}
							onClick={() => setAttributes({ teamSkin: sk.value })}
						>
							<span className="shapeblock-team-skin-thumb" aria-hidden="true">
								<span className="t-photo" />
								<span className="t-text" />
							</span>
							<span className="shapeblock-team-skin-label">{sk.label}</span>
						</button>
					))}
				</div>
				{isContentSkin && (
					<SelectControl
						label={__('Text Position', 'shapeblock')}
						value={contentShow}
						options={[
							{ label: __('On the photo', 'shapeblock'), value: 'inside' },
							{ label: __('Under the photo', 'shapeblock'), value: 'normal' },
						]}
						onChange={(v) => setAttributes({ contentShow: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				{teamSkin === 'skin4' && (
					<SelectControl
						label={__('Overlay Shape', 'shapeblock')}
						value={attributes.skin4HoverOverlay}
						options={[
							{ label: __('A bar at the bottom', 'shapeblock'), value: 'overlay1' },
							{ label: __('A circle in the middle', 'shapeblock'), value: 'overlay2' },
						]}
						onChange={(v) => setAttributes({ skin4HoverOverlay: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
			</PanelBody>

			<PanelBody title={__('Alignment', 'shapeblock')} initialOpen={true}>
				{respAlign(__('Text Alignment', 'shapeblock'), 'teamContentAlignment', [{ label: __('Default', 'shapeblock'), value: '' }, ...ALIGN])}
			</PanelBody>

			<PanelBody title={__('Photo Size', 'shapeblock')} initialOpen={false}>
				{respNum(__('Width (px)', 'shapeblock'), 'imageWidth')}
				{respNum(__('Height (px)', 'shapeblock'), 'imageHeightStyle')}
			</PanelBody>
		</>
	);

	// --- Style: from the card inwards ------------------------------------------------
	const isRichBio = teamSkin === 'skin3' || teamSkin === 'skin5';
	const styleTab = (
		<>
			<PanelBody title={__('Card', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'cardBgColor', 'cardBgGradient')}
				{border(__('Border', 'shapeblock'), 'teamBorder')}
				{color(__('Border Color on Hover', 'shapeblock'), 'teamHoverBorderColor')}
				{box(__('Border Radius', 'shapeblock'), 'itemBorderRadius')}
				{shadow(__('Shadow', 'shapeblock'), 'teamBoxShadow')}
				{respBox(__('Padding', 'shapeblock'), 'itemPadding')}
			</PanelBody>

			<PanelBody title={__('Photo', 'shapeblock')} initialOpen={false}>
				{bg(__('Color Over the Photo', 'shapeblock'), 'imageOverlayColor', 'imageOverlayGradient')}
				{box(__('Border Radius', 'shapeblock'), 'imageStyleRadius')}
				{respBox(__('Padding', 'shapeblock'), 'imagePadding')}
				<Divider />
				<p className="components-base-control__help">{__('A shape behind the photo:', 'shapeblock')}</p>
				{bg(__('Shape Color', 'shapeblock'), 'imageBelowBg', 'imageBelowBgGradient')}
				{respNum(__('Shape Height (%)', 'shapeblock'), 'imageBelowHeight')}
				<SelectControl label={__('Shape Position', 'shapeblock')} value={attributes.imageBelowPosition} options={[{ label: __('Top', 'shapeblock'), value: 'top' }, { label: __('Bottom', 'shapeblock'), value: 'bottom' }]} onChange={(v) => setAttributes({ imageBelowPosition: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{box(__('Shape Border Radius', 'shapeblock'), 'imageBelowRadius')}
			</PanelBody>

			<PanelBody title={__('Text Area', 'shapeblock')} initialOpen={false}>
				<p className="components-base-control__help">{__('The box holding the name, designation and bio.', 'shapeblock')}</p>
				{bg(__('Background', 'shapeblock'), 'areaBgColor', 'areaBgGradient')}
				{box(__('Border Radius', 'shapeblock'), 'areaBorderRadius')}
				{respBox(__('Padding', 'shapeblock'), 'wrapPadding')}
				{respBox(__('Margin', 'shapeblock'), 'wrapMargin')}
			</PanelBody>

			{teamSkin === 'skin4' && (
				<PanelBody title={__('Hover Overlay', 'shapeblock')} initialOpen={false}>
					{bg(__('Background', 'shapeblock'), 'skin4OverlayColor', 'skin4OverlayGradient')}
					{color(__('Text Color', 'shapeblock'), 'skin4OverlayTextColor')}
					{num(__('Background Blur (px)', 'shapeblock'), 'skin4OverlayBlur')}
					{attributes.skin4HoverOverlay === 'overlay2' && num(__('Circle Size (px)', 'shapeblock'), 'skin4Overlay2CircleSize')}
					{box(__('Padding', 'shapeblock'), 'skin4OverlayPadding')}
					{box(__('Border Radius', 'shapeblock'), 'skin4OverlayBorderRadius')}
					{num(__('Fade Time (s)', 'shapeblock'), 'skin4OverlayTransition')}
				</PanelBody>
			)}

			<PanelBody title={__('Name', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'nameColor')}
				{respTypo(__('Typography', 'shapeblock'), 'nameTypography')}
				{box(__('Padding', 'shapeblock'), 'namePadding')}
			</PanelBody>

			<PanelBody title={__('Designation', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'designationColor')}
				{respTypo(__('Typography', 'shapeblock'), 'designationTypography')}
			</PanelBody>

			{teamSkin !== 'skin4' && (
				<PanelBody title={__('Bio', 'shapeblock')} initialOpen={false}>
					{isRichBio ? (
						<>
							{color(__('Color', 'shapeblock'), 'descColor')}
							{bg(__('Background', 'shapeblock'), 'descBgColor', 'descBgGradient')}
							{color(__('Color on Hover', 'shapeblock'), 'descColorHover')}
							{bg(__('Background on Hover', 'shapeblock'), 'descBgHoverColor', 'descBgHoverGradient')}
							<TextControl label={__('Hover Background Opacity (0-1)', 'shapeblock')} type="number" step="0.1" value={attributes.descBgHoverOpacity} onChange={(v) => setAttributes({ descBgHoverOpacity: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
							{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
							{box(__('Padding', 'shapeblock'), 'descPadding')}
						</>
					) : (
						<>
							{color(__('Color', 'shapeblock'), 'teamDescriptionColor')}
							{respTypo(__('Typography', 'shapeblock'), 'teamDescriptionTypography')}
							{box(__('Margin', 'shapeblock'), 'teamDescriptionMargin')}
							{box(__('Padding', 'shapeblock'), 'teamDescriptionPadding')}
						</>
					)}
				</PanelBody>
			)}

			{showContactInfo && (
				<PanelBody title={__('Email & Phone', 'shapeblock')} initialOpen={false}>
					{color(__('Text Color', 'shapeblock'), 'contactTextColor')}
					{color(__('Text Color on Hover', 'shapeblock'), 'contactTextHoverColor')}
					{bg(__('Background', 'shapeblock'), 'contactItemBgColor', 'contactItemBgGradient')}
					{bg(__('Background on Hover', 'shapeblock'), 'contactItemBgHoverColor', 'contactItemBgHoverGradient')}
					{respTypo(__('Typography', 'shapeblock'), 'contactTypography')}
					{respNum(__('Space Between (px)', 'shapeblock'), 'contactGap')}
					{box(__('Border Radius', 'shapeblock'), 'contactItemRadius')}
					{box(__('Padding', 'shapeblock'), 'contactItemPadding')}
					<Divider />
					{color(__('Icon Color', 'shapeblock'), 'contactIconColor')}
					{bg(__('Icon Background', 'shapeblock'), 'contactIconBgColor', 'contactIconBgGradient')}
					{respNum(__('Icon Size (px)', 'shapeblock'), 'contactIconSize')}
					{respNum(__('Icon Box Size (px)', 'shapeblock'), 'contactIconBoxSize')}
					{box(__('Icon Border Radius', 'shapeblock'), 'contactIconRadius')}
				</PanelBody>
			)}

			{socialOn && (
				<PanelBody title={__('Social Icons', 'shapeblock')} initialOpen={false}>
					{color(__('Icon Color', 'shapeblock'), 'sIconColor')}
					{color(__('Icon Color on Hover', 'shapeblock'), 'sIconHoverColor')}
					{bg(__('Background', 'shapeblock'), 'sIconBgColor', 'sIconBgGradient')}
					{bg(__('Background on Hover', 'shapeblock'), 'sIconHoverBgColor', 'sIconHoverBgGradient')}
					{respNum(__('Icon Size (px)', 'shapeblock'), 'sIconSize')}
					{respNum(__('Button Size (px)', 'shapeblock'), 'sIconButtonSize')}
					{respNum(__('Space Between (px)', 'shapeblock'), 'sIconGap')}
					{/* Only for a block that already used it: the Icon Size above replaces it. */}
					{['', 'Tablet', 'Mobile'].some((d) => Object.values(attributes['sIconTypography' + d] || {}).some(Boolean)) && respTypo(__('Typography', 'shapeblock'), 'sIconTypography')}
					{box(__('Border Radius', 'shapeblock'), 'sIconRadius')}
					{shadow(__('Shadow', 'shapeblock'), 'socialBoxShadow')}
					<Divider />
					{iconPos === 'default' && border(__('Line Above the Icons', 'shapeblock'), 'socialItemBorder')}
					{respBox(__('Padding Round the Icons', 'shapeblock'), 'sIconAreaPadding')}
				</PanelBody>
			)}

			{actionType === 'popup' && (
				<PanelBody title={__('Popup', 'shapeblock')} initialOpen={false}>
					{bg(__('Background', 'shapeblock'), 'popupBgColor', 'popupBgGradient')}
					{color(__('Name Color', 'shapeblock'), 'popupNameColor')}
					{respTypo(__('Name Typography', 'shapeblock'), 'popupNameTypography')}
					{color(__('Designation Color', 'shapeblock'), 'popupDesignationColor')}
					{respTypo(__('Designation Typography', 'shapeblock'), 'popupDesignationTypography')}
					{color(__('Text Color', 'shapeblock'), 'popupDetailsColor')}
					{respTypo(__('Text Typography', 'shapeblock'), 'popupDetailsTypography')}
					{color(__('Close Button Color', 'shapeblock'), 'popupCloseColor')}
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

			<TeamCard attributes={attributes} setAttributes={setAttributes} isSelected={isSelected} />
			<div className="shapeblock-team-styles" hidden>
				<ServerSideRender block="shapeblock/team-grid" attributes={styleOnly} httpMethod="POST" />
			</div>
		</div>
	);
}
