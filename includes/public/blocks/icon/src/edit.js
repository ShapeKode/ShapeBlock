import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';

import './editor.scss';

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
			setAttributes({ blockId: 'eelfg-icon-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

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

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Icon', 'easy-elements-for-gutenberg')} initialOpen={true}>
					<IconPicker label={__('Icon', 'easy-elements-for-gutenberg')} value={icon} onChange={(v) => setAttributes({ icon: v })} />
					<SelectControl
						label={__('View', 'easy-elements-for-gutenberg')}
						value={view}
						options={[
							{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'default' },
							{ label: __('Stacked', 'easy-elements-for-gutenberg'), value: 'stacked' },
							{ label: __('Framed', 'easy-elements-for-gutenberg'), value: 'framed' },
						]}
						onChange={(v) => setAttributes({ view: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{view !== 'default' && (
						<SelectControl
							label={__('Shape', 'easy-elements-for-gutenberg')}
							value={attributes.shape}
							options={[
								{ label: __('Circle', 'easy-elements-for-gutenberg'), value: 'circle' },
								{ label: __('Rounded', 'easy-elements-for-gutenberg'), value: 'rounded' },
								{ label: __('Square', 'easy-elements-for-gutenberg'), value: 'square' },
							]}
							onChange={(v) => setAttributes({ shape: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
					<Divider />
					<TextControl
						label={__('Link URL', 'easy-elements-for-gutenberg')}
						type="url"
						value={iconUrl}
						onChange={(v) => setAttributes({ iconUrl: v })}
						placeholder="https://"
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{iconUrl && (
						<>
							<ToggleControl label={__('Open in new tab', 'easy-elements-for-gutenberg')} checked={iconTarget} onChange={(v) => setAttributes({ iconTarget: v })} __nextHasNoMarginBottom />
							<ToggleControl label={__('Add nofollow', 'easy-elements-for-gutenberg')} checked={iconNofollow} onChange={(v) => setAttributes({ iconNofollow: v })} __nextHasNoMarginBottom />
						</>
					)}
					<Divider />
					<ToggleGroupControl
						label={__('Alignment', 'easy-elements-for-gutenberg')}
						value={attributes.alignment}
						onChange={(v) => setAttributes({ alignment: v })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOptionIcon value="flex-start" icon={iconAlignLeft} label={__('Left', 'easy-elements-for-gutenberg')} />
						<ToggleGroupControlOptionIcon value="center" icon={iconAlignCenter} label={__('Center', 'easy-elements-for-gutenberg')} />
						<ToggleGroupControlOptionIcon value="flex-end" icon={iconAlignRight} label={__('Right', 'easy-elements-for-gutenberg')} />
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Icon', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Color', 'easy-elements-for-gutenberg'), 'iconColor')}
					{color(__('Background', 'easy-elements-for-gutenberg'), 'iconBg')}
					{num(__('Size (px)', 'easy-elements-for-gutenberg'), 'iconSize')}
					{num(__('Rotation (deg)', 'easy-elements-for-gutenberg'), 'iconRotation')}
					{border(__('Border', 'easy-elements-for-gutenberg'), 'iconBorder')}
					{shadow(__('Box Shadow', 'easy-elements-for-gutenberg'), 'iconBoxShadow')}
					<Divider />
					{box(__('Padding', 'easy-elements-for-gutenberg'), 'iconPadding')}
					{box(__('Border Radius', 'easy-elements-for-gutenberg'), 'iconBorderRadius')}
					<Divider />
					{color(__('Color (Hover)', 'easy-elements-for-gutenberg'), 'iconColorHover')}
					{color(__('Background (Hover)', 'easy-elements-for-gutenberg'), 'iconBgHover')}
					{border(__('Border (Hover)', 'easy-elements-for-gutenberg'), 'iconBorderHover')}
					{num(__('Rotation Hover (deg)', 'easy-elements-for-gutenberg'), 'iconRotationHover')}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/icon" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
