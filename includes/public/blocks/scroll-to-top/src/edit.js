import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	BoxControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-stt-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Shared control helpers (same pattern as the Button block).
	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
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

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Button', 'shapeblock')} initialOpen={true}>
			<IconPicker label={__('Icon', 'shapeblock')} value={attributes.scrollIcon || ''} onChange={(v) => setAttributes({ scrollIcon: v })} />
			<SelectControl
				label={__('Horizontal Position', 'shapeblock')}
				value={attributes.position}
				options={[
					{ label: __('Right', 'shapeblock'), value: 'right' },
					{ label: __('Left', 'shapeblock'), value: 'left' },
				]}
				onChange={(v) => setAttributes({ position: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			{num(__('Show After Scroll (px)', 'shapeblock'), 'showAfter')}
		</PanelBody>
	);

	// --- Tab 2: Layout (size, spacing & position) -----------------------------
	const layoutTab = (
		<PanelBody title={__('Button', 'shapeblock')} initialOpen={true}>
			{respNum(__('Button Size (px)', 'shapeblock'), 'buttonSize')}
			{respNum(__('Icon Size (px)', 'shapeblock'), 'iconSize')}
			{respBox(__('Padding', 'shapeblock'), 'sttPadding')}
			<Divider />
			{num(__('Horizontal Offset (px)', 'shapeblock'), 'offsetX')}
			{num(__('Bottom Offset (px)', 'shapeblock'), 'offsetY')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<PanelBody title={__('Button', 'shapeblock')} initialOpen={true}>
			{color(__('Icon Color', 'shapeblock'), 'color')}
			{color(__('Background', 'shapeblock'), 'bgColor')}
			{border(__('Border', 'shapeblock'), 'sttBorder')}
			{shadow(__('Box Shadow', 'shapeblock'), 'sttBoxShadow')}
			<Divider />
			{color(__('Icon Color (Hover)', 'shapeblock'), 'colorHover')}
			{color(__('Background (Hover)', 'shapeblock'), 'bgColorHover')}
			<Divider />
			{box(__('Border Radius', 'shapeblock'), 'sttRadius')}
		</PanelBody>
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

			<ServerSideRender block="shapeblock/scroll-to-top" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
