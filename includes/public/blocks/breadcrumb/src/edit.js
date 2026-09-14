import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, showHomeIcon, showSeparatorIcon } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-bc-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
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

	// --- Tab 1: Settings (content) --------------------------------------------
	const settingsTab = (
		<PanelBody title={__('Content', 'shapeblock')} initialOpen={true}>
			<ToggleControl label={__('Show Home Icon', 'shapeblock')} checked={showHomeIcon} onChange={(v) => setAttributes({ showHomeIcon: v })} __nextHasNoMarginBottom />
			{showHomeIcon && <IconPicker label={__('Home Icon', 'shapeblock')} value={attributes.homeIcon || ''} onChange={(v) => setAttributes({ homeIcon: v })} />}
			<TextControl label={__('Home Page Title', 'shapeblock')} value={attributes.homeTitle} onChange={(v) => setAttributes({ homeTitle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<ToggleControl label={__('Show Category Path', 'shapeblock')} checked={attributes.showCategoryPath} onChange={(v) => setAttributes({ showCategoryPath: v })} __nextHasNoMarginBottom />
			<ToggleControl label={__('Show Separator Icon', 'shapeblock')} checked={showSeparatorIcon} onChange={(v) => setAttributes({ showSeparatorIcon: v })} __nextHasNoMarginBottom />
			{showSeparatorIcon && <IconPicker label={__('Separator Icon', 'shapeblock')} value={attributes.separatorIcon || ''} onChange={(v) => setAttributes({ separatorIcon: v })} />}
		</PanelBody>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Breadcrumb', 'shapeblock')} initialOpen={true}>
				{respBox(__('Padding (Normal)', 'shapeblock'), 'textPadding')}
				{respBox(__('Padding (Active)', 'shapeblock'), 'textPaddingActive')}
			</PanelBody>

			{showHomeIcon && (
				<PanelBody title={__('Home Icon', 'shapeblock')} initialOpen={false}>
					{num(__('Size (px)', 'shapeblock'), 'homeIconSize')}
					{respBox(__('Padding', 'shapeblock'), 'homeIconPadding')}
					{num(__('Vertical Position (px)', 'shapeblock'), 'homeIconPosY')}
					{num(__('Horizontal Position (px)', 'shapeblock'), 'homeIconPosX')}
				</PanelBody>
			)}

			<PanelBody title={__('Separator', 'shapeblock')} initialOpen={false}>
				{num(__('Size (px)', 'shapeblock'), 'separatorSize')}
				{respBox(__('Padding', 'shapeblock'), 'separatorPadding')}
				{respBox(__('Gap (Margin)', 'shapeblock'), 'separatorGap')}
				{num(__('Vertical Position (px)', 'shapeblock'), 'separatorPosY')}
				{num(__('Horizontal Position (px)', 'shapeblock'), 'separatorPosX')}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Breadcrumb', 'shapeblock')} initialOpen={true}>
				{respTypo(__('Typography', 'shapeblock'), 'textTypography')}
				{color(__('Text Color', 'shapeblock'), 'textColor')}
				{color(__('Active Color', 'shapeblock'), 'activeColor')}
				<Divider />
				{color(__('Background (Normal)', 'shapeblock'), 'textBgColor')}
				{box(__('Border Radius (Normal)', 'shapeblock'), 'textRadius')}
				<Divider />
				{color(__('Background (Active)', 'shapeblock'), 'textBgColorActive')}
				{box(__('Border Radius (Active)', 'shapeblock'), 'textRadiusActive')}
			</PanelBody>

			{showHomeIcon && (
				<PanelBody title={__('Home Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'homeIconColor')}
					{color(__('Background Color', 'shapeblock'), 'homeIconBg')}
					{box(__('Border Radius', 'shapeblock'), 'homeIconRadius')}
				</PanelBody>
			)}

			<PanelBody title={__('Separator', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'separatorColor')}
				{color(__('Background Color', 'shapeblock'), 'separatorBg')}
				{box(__('Border Radius', 'shapeblock'), 'separatorRadius')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
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

			<ServerSideRender block="shapeblock/breadcrumb" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
