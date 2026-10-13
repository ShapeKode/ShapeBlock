import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	TextControl,
	BoxControl,
	Button,
	TabPanel,
	ToggleControl,
} from '@wordpress/components';

import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';
import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import TypographyControls from '../../custom-components/TypographyControls';

import { initComparison } from './comparison';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, orientation, offset, showLabels } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-cmp-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: the front-end view.js doesn't run inside ServerSideRender,
	// so initialise the slider here. A MutationObserver re-inits whenever the SSR
	// markup is replaced (e.g. when images / offset / orientation change).
	const previewRef = useRef(null);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;
		let timer;
		const run = () => {
			const c = root.querySelector('.shapeblock-comparison-container');
			// A new preview is new markup; one already set up is left alone.
			if (c) {
				initComparison(c);
			}
		};
		const schedule = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(run, 80);
		};
		const mo = new MutationObserver(schedule);
		mo.observe(root, { childList: true, subtree: true });
		schedule();
		return () => {
			mo.disconnect();
			window.clearTimeout(timer);
		};
	}, []);

	const imageControl = (label, key) => (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={(media) => setAttributes({ [key]: { id: media.id, url: media.url, alt: media.alt } })}
				allowedTypes={['image']}
				value={attributes[key]?.id}
				render={({ open }) => (
					<div style={{ marginBottom: '12px' }}>
						<div style={{ marginBottom: '6px', fontWeight: 500 }}>{label}</div>
						{attributes[key]?.url && <img src={attributes[key].url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
						<Button variant="secondary" size="small" onClick={open}>{attributes[key]?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}</Button>
					</div>
				)}
			/>
		</MediaUploadCheck>
	);

	// Responsive number control — a device switcher above the control, editing
	// the matching per-device attribute (base / baseTablet / baseMobile).
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
		<>
		<PanelBody title={__('Images', 'shapeblock')} initialOpen={true}>
			{imageControl(__('Before Image', 'shapeblock'), 'beforeImage')}
			{imageControl(__('After Image', 'shapeblock'), 'afterImage')}
			<RangeControl
				label={__('Default Offset (%)', 'shapeblock')}
				value={offset}
				onChange={(v) => setAttributes({ offset: v })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
		<PanelBody title={__('Labels', 'shapeblock')} initialOpen={false}>
			<ToggleControl label={__('Show Before / After labels', 'shapeblock')} checked={!!showLabels} onChange={(v) => setAttributes({ showLabels: v })} __nextHasNoMarginBottom />
			{showLabels && (
				<>
					<TextControl label={__('Before Label', 'shapeblock')} value={attributes.beforeLabel || ''} onChange={(v) => setAttributes({ beforeLabel: v })} help={__('Leave empty to hide this label.', 'shapeblock')} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextControl label={__('After Label', 'shapeblock')} value={attributes.afterLabel || ''} onChange={(v) => setAttributes({ afterLabel: v })} help={__('Leave empty to hide this label.', 'shapeblock')} __next40pxDefaultSize __nextHasNoMarginBottom />
					<ToggleControl label={__('Show labels only on hover', 'shapeblock')} checked={!!attributes.labelsOnHover} onChange={(v) => setAttributes({ labelsOnHover: v })} __nextHasNoMarginBottom />
				</>
			)}
		</PanelBody>
		</>
	);

	// --- Tab 2: Layout (size) -------------------------------------------------
	const layoutTab = (
		<>
		<PanelBody title={__('Size & Direction', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Layout', 'shapeblock')}
				value={orientation}
				options={[
					{ label: __('Horizontal', 'shapeblock'), value: 'horizontal' },
					{ label: __('Vertical', 'shapeblock'), value: 'vertical' },
					{ label: __('Diagonal', 'shapeblock'), value: 'diagonal' },
				]}
				onChange={(v) => setAttributes({ orientation: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{respNum(__('Height (px)', 'shapeblock'), 'height')}
		</PanelBody>
		{showLabels && orientation !== 'diagonal' && (
			<PanelBody title={__('Label Position', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={orientation === 'vertical' ? __('Across the Image', 'shapeblock') : __('Up and Down', 'shapeblock')}
					help={orientation === 'vertical' ? __('Before sits at the top, After at the bottom.', 'shapeblock') : __('Before sits on the left, After on the right.', 'shapeblock')}
					value={attributes.labelPosition || 'center'}
					options={
						orientation === 'vertical'
							? [
									{ label: __('Left', 'shapeblock'), value: 'start' },
									{ label: __('Center', 'shapeblock'), value: 'center' },
									{ label: __('Right', 'shapeblock'), value: 'end' },
							  ]
							: [
									{ label: __('Top', 'shapeblock'), value: 'start' },
									{ label: __('Middle', 'shapeblock'), value: 'center' },
									{ label: __('Bottom', 'shapeblock'), value: 'end' },
							  ]
					}
					onChange={(v) => setAttributes({ labelPosition: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={__('Distance from the Edge (px)', 'shapeblock')}
					type="number"
					min={0}
					placeholder="16"
					value={attributes.labelOffset || ''}
					onChange={(v) => setAttributes({ labelOffset: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		)}
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const handleStyle = attributes.handleStyle || 'circle';
	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v || '' })} />
	);
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	const px = (label, key, placeholder) => (
		<TextControl
			label={label}
			type="number"
			min={0}
			value={attributes[key] || ''}
			placeholder={placeholder}
			onChange={(v) => setAttributes({ [key]: v })}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	const styleTab = (
		<>
			<PanelBody title={__('Image Box', 'shapeblock')} initialOpen={true}>
				<BorderControl label={__('Border', 'shapeblock')} value={attributes.containerBorder} onChange={(v) => setAttributes({ containerBorder: v })} />
				<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.containerRadius} onChange={(v) => setAttributes({ containerRadius: v })} />
				<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.containerShadow} onChange={(v) => setAttributes({ containerShadow: v })} />
			</PanelBody>
			<PanelBody title={__('Handle', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Style', 'shapeblock')}
					value={handleStyle}
					options={[
						{ label: __('Circle (outline)', 'shapeblock'), value: 'circle' },
						{ label: __('Circle (filled)', 'shapeblock'), value: 'filled' },
						{ label: __('Rounded Square', 'shapeblock'), value: 'square' },
						{ label: __('Pill', 'shapeblock'), value: 'pill' },
						{ label: __('Glass', 'shapeblock'), value: 'glass' },
						{ label: __('Line Only', 'shapeblock'), value: 'line' },
					]}
					onChange={(v) => setAttributes({ handleStyle: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{handleStyle !== 'line' && (
					<SelectControl
						label={__('Icon', 'shapeblock')}
						value={attributes.handleIcon || 'triangles'}
						options={[
							{ label: __('Triangles', 'shapeblock'), value: 'triangles' },
							{ label: __('Chevrons', 'shapeblock'), value: 'chevrons' },
							{ label: __('Double Arrow', 'shapeblock'), value: 'arrows' },
							{ label: __('None', 'shapeblock'), value: 'none' },
						]}
						onChange={(v) => setAttributes({ handleIcon: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				{color(__('Line & Border Color', 'shapeblock'), 'handleColor')}
				{bg(handleStyle === 'line' ? __('Grip Color', 'shapeblock') : __('Knob Fill', 'shapeblock'), 'handleBg', 'handleBgGradient')}
				{handleStyle !== 'line' && color(__('Icon Color', 'shapeblock'), 'handleIconColor')}
				{px(handleStyle === 'line' ? __('Grip Length (px)', 'shapeblock') : __('Knob Size (px)', 'shapeblock'), 'handleSize', '44')}
				{px(__('Line Width (px)', 'shapeblock'), 'handleLine', '3')}
				<ToggleControl
					label={__('Shadow', 'shapeblock')}
					checked={attributes.handleShadow !== false}
					onChange={(v) => setAttributes({ handleShadow: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>
			{showLabels && (
				<PanelBody title={__('Labels', 'shapeblock')} initialOpen={false}>
					{color(__('Text Color', 'shapeblock'), 'labelColor')}
					{bg(__('Background', 'shapeblock'), 'labelBg', 'labelBgGradient')}
					<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey="labelTypography" />
					<BoxControl label={__('Padding', 'shapeblock')} values={attributes.labelPadding} onChange={(v) => setAttributes({ labelPadding: v })} />
					<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.labelRadius} onChange={(v) => setAttributes({ labelRadius: v })} />
				</PanelBody>
			)}
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/image-comparison" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
