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
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

const ALIGN_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'flex-start' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'flex-end' },
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

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (buttonAlignment / buttonAlignmentTablet / buttonAlignmentMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'buttonAlignment' : `buttonAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	// buttonAlignment stores CSS flex values (used as justify-content in render.php).
	// AlignmentControl works in left/center/right, so map both directions.
	const FLEX_TO_ALIGN = { 'flex-start': 'left', center: 'center', 'flex-end': 'right' };
	const ALIGN_TO_FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' };

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const typo = (label, key) => (
		<TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />
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
				{color(__('Text Color', 'shapeblock'), 'textColor')}
				{color(__('Background', 'shapeblock'), 'bgColor')}
				{border(__('Border', 'shapeblock'), 'buttonBorder')}
				{shadow(__('Box Shadow', 'shapeblock'), 'buttonBoxShadow')}
				<Divider />
				{color(__('Text Color (Hover)', 'shapeblock'), 'textColorHover')}
				{color(__('Background (Hover)', 'shapeblock'), 'bgColorHover')}
				{border(__('Border (Hover)', 'shapeblock'), 'buttonBorderHover')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'buttonBorderRadius')}
			</PanelBody>

			<PanelBody title={__('Gradient', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Gradient Button', 'shapeblock')} checked={showGradient} onChange={(v) => setAttributes({ showGradient: v })} __nextHasNoMarginBottom />
				{showGradient && (
					<>
						{color(__('Gradient 1', 'shapeblock'), 'gradient1')}
						{color(__('Gradient 2', 'shapeblock'), 'gradient2')}
						{color(__('Gradient 3', 'shapeblock'), 'gradient3')}
					</>
				)}
				<Divider />
				<ToggleControl label={__('Border Gradient Button', 'shapeblock')} checked={borderGradientButton} onChange={(v) => setAttributes({ borderGradientButton: v })} __nextHasNoMarginBottom />
				{borderGradientButton && (
					<>
						{color(__('Border Gradient 1', 'shapeblock'), 'borderGradientColor1')}
						{color(__('Border Gradient 2', 'shapeblock'), 'borderGradientColor2')}
					</>
				)}
			</PanelBody>

			{hasIcon && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'iconColor')}
					{color(__('Background', 'shapeblock'), 'iconBg')}
					{respNum(__('Size (px)', 'shapeblock'), 'iconSize')}
					{respNum(__('Box Width (px)', 'shapeblock'), 'iconBoxWidth')}
					{respNum(__('Box Height (px)', 'shapeblock'), 'iconBoxHeight')}
					{box(__('Box Border Radius', 'shapeblock'), 'iconBoxBorderRadius')}
					{num(__('Rotation (deg)', 'shapeblock'), 'iconRotation')}
					<Divider />
					{color(__('Color (Hover)', 'shapeblock'), 'iconColorHover')}
					{color(__('Background (Hover)', 'shapeblock'), 'iconBgHover')}
					{num(__('Rotation Hover (deg)', 'shapeblock'), 'iconRotationHover')}
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={FLEX_TO_ALIGN[attributes[alignKey]]}
					onChange={(value) =>
						setAttributes({ [alignKey]: value ? ALIGN_TO_FLEX[value] : (dev === 'desktop' ? 'center' : '') })
					}
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

			<ServerSideRender block="shapeblock/button" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
