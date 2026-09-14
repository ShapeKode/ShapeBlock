import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
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
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		dayLabel,
		hoursLabel,
		minuteLabel,
		secondsLabel,
		targetDate,
		separator,
		labelUnderNumber,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-cntdwn-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (contentAlign / contentAlignTablet / contentAlignMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'contentAlign' : `contentAlign${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	// Editor preview ticking: the front-end view.js doesn't run inside the
	// ServerSideRender output, so drive the countdown here. The interval reads
	// the target + elements fresh from the DOM each tick, so it survives the
	// SSR markup being replaced on every re-render.
	const previewRef = useRef(null);
	useEffect(() => {
		const tick = () => {
			const root = previewRef.current;
			if (!root) return;
			const cd = root.querySelector('.shapeblock-cntdwn[data-target]');
			if (!cd) return;
			const target = new Date(cd.dataset.target).getTime();
			if (isNaN(target)) return;
			const distance = Math.max(0, target - Date.now());
			const sec = 1000, min = sec * 60, hr = min * 60, day = hr * 24;
			const set = (sel, val) => {
				const el = cd.querySelector(sel);
				if (el) el.textContent = val;
			};
			set('.shapeblock-cntdwn-days', Math.floor(distance / day));
			set('.shapeblock-cntdwn-hours', Math.floor((distance % day) / hr));
			set('.shapeblock-cntdwn-minutes', Math.floor((distance % hr) / min));
			set('.shapeblock-cntdwn-seconds', Math.floor((distance % min) / sec));
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const typo = (label, key) => (
		<TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />
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

	const isSeparator = separator === 'shapeblock-cntdwn-bullets' || separator === 'shapeblock-cntdwn-dash';

	const unitSection = (titleLabel, typoKey, colorKey, labelColorKey, labelTypoKey) => (
		<PanelBody title={titleLabel} initialOpen={false}>
			{respTypo(__('Number Typography', 'shapeblock'), typoKey)}
			{color(__('Number Color', 'shapeblock'), colorKey)}
			<Divider />
			{color(__('Label Color', 'shapeblock'), labelColorKey)}
			{respTypo(__('Label Typography', 'shapeblock'), labelTypoKey)}
		</PanelBody>
	);

	// --- Tab 1: Settings (content/behavior) -----------------------------------
	const settingsTab = (
		<PanelBody title={__('Countdown', 'shapeblock')} initialOpen={true}>
			<TextControl
				label={__('Target Date', 'shapeblock')}
				type="datetime-local"
				value={targetDate}
				onChange={(v) => setAttributes({ targetDate: v })}
				help={__('Leave empty to default to 24 hours from now.', 'shapeblock')}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			<TextControl label={__('Days Label', 'shapeblock')} value={dayLabel} onChange={(v) => setAttributes({ dayLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<TextControl label={__('Hours Label', 'shapeblock')} value={hoursLabel} onChange={(v) => setAttributes({ hoursLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<TextControl label={__('Minutes Label', 'shapeblock')} value={minuteLabel} onChange={(v) => setAttributes({ minuteLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<TextControl label={__('Seconds Label', 'shapeblock')} value={secondsLabel} onChange={(v) => setAttributes({ secondsLabel: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<Divider />
			<SelectControl
				label={__('Separator', 'shapeblock')}
				value={separator}
				options={[
					{ label: __('Space', 'shapeblock'), value: 'shapeblock-cntdwn-space' },
					{ label: __('Bullets', 'shapeblock'), value: 'shapeblock-cntdwn-bullets' },
					{ label: __('Dash', 'shapeblock'), value: 'shapeblock-cntdwn-dash' },
				]}
				onChange={(v) => setAttributes({ separator: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Display Label Under Number', 'shapeblock')}
				checked={labelUnderNumber}
				onChange={(v) => setAttributes({ labelUnderNumber: v })}
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<PanelBody title={__('Countdown', 'shapeblock')} initialOpen={true}>
			{labelUnderNumber && respAlign(
				__('Content Alignment', 'shapeblock'),
				'contentAlign',
				[
					{ label: __('Left', 'shapeblock'), value: 'left' },
					{ label: __('Center', 'shapeblock'), value: 'center' },
					{ label: __('Right', 'shapeblock'), value: 'right' },
				]
			)}
			{respNum(__('Mid Gap (px)', 'shapeblock'), 'midGap')}
			{isSeparator && num(__('Separator Position X (px)', 'shapeblock'), 'separatorPositionX')}
			{respBox(__('Item Padding', 'shapeblock'), 'itemPadding')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Countdown', 'shapeblock')} initialOpen={true}>
				{isSeparator && color(__('Separator Color', 'shapeblock'), 'separatorColor')}
				{color(__('Item Background', 'shapeblock'), 'itemBgColor')}
				<BorderControl label={__('Item Border', 'shapeblock')} value={attributes.itemBorder} onChange={(v) => setAttributes({ itemBorder: v })} />
				<BoxShadowControls label={__('Item Box Shadow', 'shapeblock')} value={attributes.itemBoxShadow} onChange={(v) => setAttributes({ itemBoxShadow: v })} />
				{box(__('Item Border Radius', 'shapeblock'), 'itemBorderRadius')}
			</PanelBody>

			{unitSection(__('Days', 'shapeblock'), 'daysTypography', 'daysColor', 'daysLabelColor', 'daysLabelTypography')}
			{unitSection(__('Hours', 'shapeblock'), 'hoursTypography', 'hoursColor', 'hoursLabelColor', 'hoursLabelTypography')}
			{unitSection(__('Minutes', 'shapeblock'), 'minutesTypography', 'minutesColor', 'minutesLabelColor', 'minutesLabelTypography')}
			{unitSection(__('Seconds', 'shapeblock'), 'secondsTypography', 'secondsColor', 'secondsLabelColor', 'secondsLabelTypography')}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || (dev === 'desktop' ? 'center' : '') })}
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/countdown" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
