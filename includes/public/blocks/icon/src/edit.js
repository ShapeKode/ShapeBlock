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
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
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

/* Compact alignment icons for the ToggleGroupControl. */
const AlignSVG = ({ children }) => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{children}</svg>
);
const iconAlignLeft = <AlignSVG><rect x="3" y="6" width="18" height="2" /><rect x="3" y="11" width="12" height="2" /><rect x="3" y="16" width="15" height="2" /></AlignSVG>;
const iconAlignCenter = <AlignSVG><rect x="3" y="6" width="18" height="2" /><rect x="6" y="11" width="12" height="2" /><rect x="4.5" y="16" width="15" height="2" /></AlignSVG>;
const iconAlignRight = <AlignSVG><rect x="3" y="6" width="18" height="2" /><rect x="9" y="11" width="12" height="2" /><rect x="6" y="16" width="15" height="2" /></AlignSVG>;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, icon, view, iconUrl, iconTarget, iconNofollow } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-icon-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (alignment / alignmentTablet / alignmentMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'alignment' : `alignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;
	// The block stores CSS justify-content values; map to/from AlignmentControl's left/center/right.
	const toToolbarAlign = (v) => (v === 'flex-start' ? 'left' : v === 'flex-end' ? 'right' : v === 'center' ? 'center' : undefined);
	const fromToolbarAlign = (v) => (v === 'left' ? 'flex-start' : v === 'right' ? 'flex-end' : v === 'center' ? 'center' : '');

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
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <BoxControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return (
					<ToggleGroupControl
						value={attributes[k]}
						onChange={(v) => setAttributes({ [k]: v })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOptionIcon value="flex-start" icon={iconAlignLeft} label={__('Left', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="center" icon={iconAlignCenter} label={__('Center', 'shapeblock')} />
						<ToggleGroupControlOptionIcon value="flex-end" icon={iconAlignRight} label={__('Right', 'shapeblock')} />
					</ToggleGroupControl>
				);
			}}
		</ResponsiveWrapper>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={toToolbarAlign(attributes[alignKey])}
					onChange={(value) => setAttributes({ [alignKey]: value ? fromToolbarAlign(value) : (dev === 'desktop' ? 'center' : '') })}
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
						tab.name === 'settings' ? (
							<PanelBody title={__('Icon', 'shapeblock')} initialOpen={true}>
								<IconPicker label={__('Icon', 'shapeblock')} value={icon} onChange={(v) => setAttributes({ icon: v })} />
								<SelectControl
									label={__('View', 'shapeblock')}
									value={view}
									options={[
										{ label: __('Default', 'shapeblock'), value: 'default' },
										{ label: __('Stacked', 'shapeblock'), value: 'stacked' },
										{ label: __('Framed', 'shapeblock'), value: 'framed' },
									]}
									onChange={(v) => setAttributes({ view: v })}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								{view !== 'default' && (
									<SelectControl
										label={__('Shape', 'shapeblock')}
										value={attributes.shape}
										options={[
											{ label: __('Circle', 'shapeblock'), value: 'circle' },
											{ label: __('Rounded', 'shapeblock'), value: 'rounded' },
											{ label: __('Square', 'shapeblock'), value: 'square' },
										]}
										onChange={(v) => setAttributes({ shape: v })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								)}
								<Divider />
								<TextControl
									label={__('Link URL', 'shapeblock')}
									type="url"
									value={iconUrl}
									onChange={(v) => setAttributes({ iconUrl: v })}
									placeholder="https://"
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								{iconUrl && (
									<>
										<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={iconTarget} onChange={(v) => setAttributes({ iconTarget: v })} __nextHasNoMarginBottom />
										<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={iconNofollow} onChange={(v) => setAttributes({ iconNofollow: v })} __nextHasNoMarginBottom />
									</>
								)}
							</PanelBody>
						) : tab.name === 'layout' ? (
							<PanelBody title={__('Icon', 'shapeblock')} initialOpen={true}>
								{respAlign(__('Alignment', 'shapeblock'), 'alignment')}
								{respNum(__('Size (px)', 'shapeblock'), 'iconSize')}
								{respBox(__('Padding', 'shapeblock'), 'iconPadding')}
							</PanelBody>
						) : (
							<PanelBody title={__('Icon', 'shapeblock')} initialOpen={true}>
								{color(__('Color', 'shapeblock'), 'iconColor')}
								{color(__('Background', 'shapeblock'), 'iconBg')}
								{num(__('Rotation (deg)', 'shapeblock'), 'iconRotation')}
								{border(__('Border', 'shapeblock'), 'iconBorder')}
								{shadow(__('Box Shadow', 'shapeblock'), 'iconBoxShadow')}
								{box(__('Border Radius', 'shapeblock'), 'iconBorderRadius')}
								<Divider />
								{color(__('Color (Hover)', 'shapeblock'), 'iconColorHover')}
								{color(__('Background (Hover)', 'shapeblock'), 'iconBgHover')}
								{border(__('Border (Hover)', 'shapeblock'), 'iconBorderHover')}
								{num(__('Rotation Hover (deg)', 'shapeblock'), 'iconRotationHover')}
							</PanelBody>
						)
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/icon" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
