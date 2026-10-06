import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	GradientPicker,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

import './editor.scss';

const ALIGN_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'flex-start' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'flex-end' },
];

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
	{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
];

// Where the button sits in its row (text-align on the block wrapper).
const POSITION_OPTIONS = [
	{ label: __('Default', 'shapeblock'), value: '' },
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

const DEFAULT_BORDER_GRADIENT = 'linear-gradient(90deg, #a53e1b 0%, #173998 100%)';
const BORDER_GRADIENT_PRESETS = [
	{ name: __('Sunset', 'shapeblock'), slug: 'sunset', gradient: 'linear-gradient(90deg, #a53e1b 0%, #173998 100%)' },
	{ name: __('Candy', 'shapeblock'), slug: 'candy', gradient: 'linear-gradient(68.75deg, #4750cc 9.78%, #ef5ce8 58.79%, #efc7ae 92.67%)' },
	{ name: __('Ocean', 'shapeblock'), slug: 'ocean', gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
	{ name: __('Peach', 'shapeblock'), slug: 'peach', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
];

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		buttonText,
		buttonUrl,
		buttonTarget,
		buttonNofollow,
		buttonType,
		buttonIcon,
		iconPosition,
		showGradient,
		borderGradientButton,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-button-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Carry the old fixed three-colour gradient and two-colour border gradient
	// over to the full gradient strings the controls now edit, so a button
	// saved before looks the same and stays editable.
	useEffect(() => {
		const next = {};
		const { gradient1, gradient2, gradient3, bgGradient, bgGradientHover } = attributes;
		if (showGradient && !bgGradient && !bgGradientHover) {
			const stops = `${gradient1 || '#4750cc'} 9.78%, ${gradient2 || '#ef5ce8'} 58.79%, ${gradient3 || '#efc7ae'} 92.67%`;
			next.bgGradient = `linear-gradient(68.75deg, ${stops})`;
			next.bgGradientHover = `linear-gradient(-68.75deg, ${stops})`;
			next.showGradient = false;
		}
		if (borderGradientButton && !attributes.borderGradient) {
			const grad = `linear-gradient(90deg, ${attributes.borderGradientColor1 || '#a53e1b'} 0%, ${attributes.borderGradientColor2 || '#173998'} 100%)`;
			next.borderGradient = grad;
			// The old border style also filled the button with it on hover.
			if (!attributes.bgGradientHover && !next.bgGradientHover && !attributes.bgColorHover) next.bgGradientHover = grad;
			if (!attributes.textColorHover) next.textColorHover = '#ffffff';
		}
		if (Object.keys(next).length) setAttributes(next);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (buttonPosition / buttonPositionTablet / buttonPositionMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	// The toolbar moves the whole button within its row. Content Alignment
	// (buttonAlignment, justify-content inside the button) stays in the sidebar.
	const alignKey = getKey('buttonPosition', dev);

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const typo = (label, key) => (
		<TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />
	);
	// Solid colour or gradient (linear/radial, any angle, any number of stops).
	const background = (label, colorKey, gradKey) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[colorKey]}
			gradientValue={attributes[gradKey]}
			onColorChange={(v) => setAttributes({ [colorKey]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [gradKey]: v || '' })}
		/>
	);
	const border = (label, key) => (
		<BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const shadow = (label, key) => (
		<BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const box = (label, key) => (
		<BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const num = (label, key) => (
		<TextControl
			label={label}
			type="number"
			value={attributes[key]}
			onChange={(v) => setAttributes({ [key]: v })}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
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

	const hasIcon = buttonIcon && buttonIcon !== 'none';

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Button', 'shapeblock')} initialOpen={true}>
			<TextControl
				label={__('Button Text', 'shapeblock')}
				value={buttonText}
				onChange={(v) => setAttributes({ buttonText: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={__('Button URL', 'shapeblock')}
				type="url"
				value={buttonUrl}
				onChange={(v) => setAttributes({ buttonUrl: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={buttonTarget} onChange={(v) => setAttributes({ buttonTarget: v })} __nextHasNoMarginBottom />
			<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={buttonNofollow} onChange={(v) => setAttributes({ buttonNofollow: v })} __nextHasNoMarginBottom />
			<Divider />
			<SelectControl
				label={__('Button Type', 'shapeblock')}
				value={buttonType}
				options={[
					{ label: __('Primary', 'shapeblock'), value: 'primary' },
					{ label: __('Outline', 'shapeblock'), value: 'outline' },
					{ label: __('Icon', 'shapeblock'), value: 'icon_btn' },
				]}
				onChange={(v) => setAttributes({ buttonType: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<IconPicker label={__('Icon', 'shapeblock')} value={buttonIcon} onChange={(v) => setAttributes({ buttonIcon: v })} />
		</PanelBody>
	);

	// --- Tab 2: Layout (structure & spacing) ----------------------------------
	const layoutTab = (
		<PanelBody title={__('Icon Position', 'shapeblock')} initialOpen={true}>
			{hasIcon && (
				<>
					<SelectControl
						label={__('Icon Position', 'shapeblock')}
						value={iconPosition}
						options={[
							{ label: __('Before Text', 'shapeblock'), value: 'before' },
							{ label: __('After Text', 'shapeblock'), value: 'after' },
						]}
						onChange={(v) => setAttributes({ iconPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{respNum(__('Icon Spacing (px)', 'shapeblock'), 'iconSpacing')}
					<Divider />
				</>
			)}
			{respAlign(__('Button Alignment', 'shapeblock'), 'buttonPosition', POSITION_OPTIONS)}
			{respNum(__('Minimum Width (px)', 'shapeblock'), 'minWidth')}
			{respAlign(__('Content Alignment', 'shapeblock'), 'buttonAlignment', ALIGN_OPTIONS)}
			<Divider />
			{respBox(__('Padding', 'shapeblock'), 'buttonPadding')}
			<Divider />
			{respBox(__('Margin', 'shapeblock'), 'buttonMargin')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Button', 'shapeblock')} initialOpen={true}>
				{respTypo(__('Typography', 'shapeblock'), 'buttonTypography')}
				<Divider />
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'textColorHover')}
								{background(__('Background', 'shapeblock'), 'bgColorHover', 'bgGradientHover')}
								{border(__('Border', 'shapeblock'), 'buttonBorderHover')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'textColor')}
								{background(__('Background', 'shapeblock'), 'bgColor', 'bgGradient')}
								{border(__('Border', 'shapeblock'), 'buttonBorder')}
								{shadow(__('Box Shadow', 'shapeblock'), 'buttonBoxShadow')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'buttonBorderRadius')}
			</PanelBody>

			<PanelBody title={__('Border Gradient', 'shapeblock')} initialOpen={false}>
				<p className="components-base-control__help" style={{ marginTop: 0 }}>
					{__('For a gradient fill, pick the Gradient tab in Background (Normal / Hover) above.', 'shapeblock')}
				</p>
				<ToggleControl
					label={__('Gradient Border', 'shapeblock')}
					checked={borderGradientButton}
					onChange={(v) =>
						setAttributes({
							borderGradientButton: v,
							...(v && !attributes.borderGradient ? { borderGradient: DEFAULT_BORDER_GRADIENT } : {}),
						})
					}
					__nextHasNoMarginBottom
				/>
				{borderGradientButton && (
					<>
						<div style={{ marginTop: 16 }}>
							<GradientPicker
								value={attributes.borderGradient || DEFAULT_BORDER_GRADIENT}
								onChange={(v) => setAttributes({ borderGradient: v || '' })}
								gradients={BORDER_GRADIENT_PRESETS}
								clearable={false}
							/>
						</div>
						{num(__('Border Width (px)', 'shapeblock'), 'borderGradientWidth')}
					</>
				)}
			</PanelBody>

			{hasIcon && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{respNum(__('Size (px)', 'shapeblock'), 'iconSize')}
					{respNum(__('Box Width (px)', 'shapeblock'), 'iconBoxWidth')}
					{respNum(__('Box Height (px)', 'shapeblock'), 'iconBoxHeight')}
					{box(__('Box Border Radius', 'shapeblock'), 'iconBoxBorderRadius')}
					<Divider />
					<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATE_TABS}>
						{(tab) =>
							tab.name === 'hover' ? (
								<>
									{color(__('Color', 'shapeblock'), 'iconColorHover')}
									{color(__('Background', 'shapeblock'), 'iconBgHover')}
									{num(__('Rotation (deg)', 'shapeblock'), 'iconRotationHover')}
								</>
							) : (
								<>
									{color(__('Color', 'shapeblock'), 'iconColor')}
									{color(__('Background', 'shapeblock'), 'iconBg')}
									{num(__('Rotation (deg)', 'shapeblock'), 'iconRotation')}
								</>
							)
						}
					</TabPanel>
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey] || undefined}
					onChange={(value) => {
						const next = { [alignKey]: value || '' };
						// A left/right/center block align floats or shrinks the wrapper to
						// the button's width, leaving no room to move the button in.
						if (['left', 'right', 'center'].includes(attributes.align)) {
							next.align = undefined;
						}
						setAttributes(next);
					}}
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

			<ServerSideRender block="shapeblock/button" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
