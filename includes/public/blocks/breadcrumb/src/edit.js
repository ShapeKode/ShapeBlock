import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import ServerSideRender from '../../custom-components/ServerRender';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	TextControl,
	SelectControl,
	BoxControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const ALIGN_OPTIONS = [
	{ label: __('Default', 'shapeblock'), value: '' },
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];


export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, showHomeIcon, showSeparatorIcon } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-bc-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (bcAlign / bcAlignTablet / bcAlignMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const alignKey = getKey('bcAlign', device ? device.toLowerCase() : 'desktop');

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key, help) => <TextControl label={label} help={help} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Solid colour or gradient.
	const background = (label, colorKey, gradKey) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[colorKey]}
			gradientValue={attributes[gradKey]}
			onColorChange={(v) => setAttributes({ [colorKey]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [gradKey]: v || '' })}
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
	// Normal / Hover switch inside a panel.
	const states = (normal, hover) => (
		<TabPanel
			className="shapeblock-state-tabs"
			activeClass="is-active"
			tabs={[
				{ name: 'normal', title: __('Normal', 'shapeblock') },
				{ name: 'hover', title: __('Hover', 'shapeblock') },
			]}
		>
			{(t) => (t.name === 'normal' ? normal : hover)}
		</TabPanel>
	);

	// --- Tab 1: Settings (content) --------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Content', 'shapeblock')} initialOpen={true}>
				<ToggleControl label={__('Show Category Path', 'shapeblock')} help={__('On a post, show its category (and parent categories) before the title.', 'shapeblock')} checked={attributes.showCategoryPath} onChange={(v) => setAttributes({ showCategoryPath: v })} __nextHasNoMarginBottom />
				<ToggleControl label={__('Show Current Page', 'shapeblock')} help={__('The last item: the title of the page being viewed.', 'shapeblock')} checked={attributes.showCurrent !== false} onChange={(v) => setAttributes({ showCurrent: v })} __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Home', 'shapeblock')} initialOpen={true}>
				<ToggleControl label={__('Show Home Icon', 'shapeblock')} checked={showHomeIcon} onChange={(v) => setAttributes({ showHomeIcon: v })} __nextHasNoMarginBottom />
				{showHomeIcon && <IconPicker label={__('Home Icon', 'shapeblock')} value={attributes.homeIcon || ''} onChange={(v) => setAttributes({ homeIcon: v })} />}
				<ToggleControl label={__('Show Home Text', 'shapeblock')} checked={attributes.showHomeText !== false} onChange={(v) => setAttributes({ showHomeText: v })} __nextHasNoMarginBottom />
				{attributes.showHomeText !== false && (
					<TextControl label={__('Home Text', 'shapeblock')} value={attributes.homeTitle} onChange={(v) => setAttributes({ homeTitle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
			</PanelBody>

			<PanelBody title={__('Separator Symbol', 'shapeblock')} initialOpen={true}>
				<SelectControl
					label={__('Separator Type', 'shapeblock')}
					value={showSeparatorIcon ? 'icon' : 'text'}
					options={[
						{ label: __('Text / character', 'shapeblock'), value: 'text' },
						{ label: __('Icon', 'shapeblock'), value: 'icon' },
					]}
					onChange={(v) => setAttributes({ showSeparatorIcon: v === 'icon' })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{showSeparatorIcon ? (
					<IconPicker label={__('Separator Icon', 'shapeblock')} value={attributes.separatorIcon || ''} onChange={(v) => setAttributes({ separatorIcon: v })} />
				) : (
					<TextControl
						label={__('Separator Text', 'shapeblock')}
						help={__('For example / or » or › or -', 'shapeblock')}
						value={attributes.separatorText ?? '/'}
						onChange={(v) => setAttributes({ separatorText: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (alignment) --------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Alignment', 'shapeblock')} initialOpen={true}>
			<ResponsiveWrapper label={__('Alignment', 'shapeblock')}>
				{(d) => {
					const k = getKey('bcAlign', d);
					return <SelectControl value={attributes[k]} options={ALIGN_OPTIONS} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
				}}
			</ResponsiveWrapper>
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Container', 'shapeblock')} initialOpen={true}>
				{background(__('Background', 'shapeblock'), 'bcBg', 'bcBgGradient')}
				<Divider />
				<BorderControl label={__('Border', 'shapeblock')} value={attributes.bcBorder} onChange={(v) => setAttributes({ bcBorder: v })} />
				{box(__('Border Radius', 'shapeblock'), 'bcRadius')}
				{respBox(__('Padding', 'shapeblock'), 'bcPadding')}
			</PanelBody>

			{showHomeIcon && (
				<PanelBody title={__('Home Icon', 'shapeblock')} initialOpen={false}>
					{states(
						<>
							{color(__('Icon Color', 'shapeblock'), 'homeIconColor')}
							{background(__('Background', 'shapeblock'), 'homeIconBg', 'homeIconBgGradient')}
						</>,
						<>
							{color(__('Icon Color', 'shapeblock'), 'homeIconHoverColor')}
						</>
					)}
					{box(__('Border Radius', 'shapeblock'), 'homeIconRadius')}
					{num(__('Size (px)', 'shapeblock'), 'homeIconSize')}
					{num(__('Space Between Icon and Text (px)', 'shapeblock'), 'homeIconGap')}
					{respBox(__('Padding', 'shapeblock'), 'homeIconPadding')}
					{num(__('Vertical Offset (px)', 'shapeblock'), 'homeIconPosY')}
					{num(__('Horizontal Offset (px)', 'shapeblock'), 'homeIconPosX')}
				</PanelBody>
			)}

			<PanelBody title={__('Text', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'textTypography')}
				{states(
					<>
						{color(__('Link Color', 'shapeblock'), 'textColor')}
						{background(__('Link Background', 'shapeblock'), 'textBgColor', 'textBgGradient')}
					</>,
					<>
						{color(__('Link Color', 'shapeblock'), 'linkHoverColor')}
						{background(__('Link Background', 'shapeblock'), 'textBgColorHover', 'textBgGradientHover')}
					</>
				)}
				{box(__('Link Border Radius', 'shapeblock'), 'textRadius')}
				{respBox(__('Padding (Links)', 'shapeblock'), 'textPadding')}
			</PanelBody>

			<PanelBody title={__('Separator', 'shapeblock')} initialOpen={false}>
				{color(__('Separator / Icon Color', 'shapeblock'), 'separatorColor')}
				{background(__('Background', 'shapeblock'), 'separatorBg', 'separatorBgGradient')}
				{box(__('Border Radius', 'shapeblock'), 'separatorRadius')}
				{num(__('Size (px)', 'shapeblock'), 'separatorSize')}
				{respBox(__('Space Around (Margin)', 'shapeblock'), 'separatorGap')}
				{respBox(__('Padding', 'shapeblock'), 'separatorPadding')}
				{num(__('Vertical Offset (px)', 'shapeblock'), 'separatorPosY')}
				{num(__('Horizontal Offset (px)', 'shapeblock'), 'separatorPosX')}
			</PanelBody>

			<PanelBody title={__('Current Page', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'activeColor')}
				{background(__('Background', 'shapeblock'), 'textBgColorActive', 'textBgGradientActive')}
				{box(__('Border Radius', 'shapeblock'), 'textRadiusActive')}
				{respBox(__('Padding (Current Page)', 'shapeblock'), 'textPaddingActive')}
			</PanelBody>
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
						// the trail's width, leaving no room to move the trail in.
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

			<ServerSideRender block="shapeblock/breadcrumb" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
