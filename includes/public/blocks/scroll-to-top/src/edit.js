import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	BoxControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';

import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'eelfg-stt-' + clientId.slice(0, 6) });
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

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Button', 'easy-elements-for-gutenberg')} initialOpen={true}>
					<IconPicker label={__('Icon', 'easy-elements-for-gutenberg')} value={attributes.scrollIcon || ''} onChange={(v) => setAttributes({ scrollIcon: v })} />
					{num(__('Button Size (px)', 'easy-elements-for-gutenberg'), 'buttonSize')}
					{num(__('Icon Size (px)', 'easy-elements-for-gutenberg'), 'iconSize')}
				</PanelBody>

				<PanelBody title={__('Position', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<SelectControl
						label={__('Horizontal Position', 'easy-elements-for-gutenberg')}
						value={attributes.position}
						options={[
							{ label: __('Right', 'easy-elements-for-gutenberg'), value: 'right' },
							{ label: __('Left', 'easy-elements-for-gutenberg'), value: 'left' },
						]}
						onChange={(v) => setAttributes({ position: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{num(__('Horizontal Offset (px)', 'easy-elements-for-gutenberg'), 'offsetX')}
					{num(__('Bottom Offset (px)', 'easy-elements-for-gutenberg'), 'offsetY')}
					<Divider />
					{num(__('Show After Scroll (px)', 'easy-elements-for-gutenberg'), 'showAfter')}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Button', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{color(__('Icon Color', 'easy-elements-for-gutenberg'), 'color')}
					{color(__('Background', 'easy-elements-for-gutenberg'), 'bgColor')}
					{border(__('Border', 'easy-elements-for-gutenberg'), 'sttBorder')}
					{shadow(__('Box Shadow', 'easy-elements-for-gutenberg'), 'sttBoxShadow')}
					<Divider />
					{color(__('Icon Color (Hover)', 'easy-elements-for-gutenberg'), 'colorHover')}
					{color(__('Background (Hover)', 'easy-elements-for-gutenberg'), 'bgColorHover')}
					<Divider />
					{box(__('Border Radius', 'easy-elements-for-gutenberg'), 'sttRadius')}
					{box(__('Padding', 'easy-elements-for-gutenberg'), 'sttPadding')}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/scroll-to-top" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
