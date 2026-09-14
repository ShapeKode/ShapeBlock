import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	RangeControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import TypographyControls from '../../custom-components/TypographyControls';
import BackgroundControl from '../../custom-components/BackgroundControl';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, selectStyle, title, percent } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-pb-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: the front-end view.js doesn't run inside ServerSideRender,
	// so animate the fill here too. A MutationObserver re-runs the animation each
	// time the SSR markup is replaced (e.g. when percent/style changes).
	const previewRef = useRef(null);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;
		let timer;
		let raf;
		const animate = () => {
			const fill = root.querySelector('.shapeblock-progress-fill');
			if (!fill) return;
			const target = (fill.getAttribute('data-width') || '0') + '%';
			fill.style.transition = 'none';
			fill.style.width = '0%';
			void fill.offsetWidth; // force reflow
			fill.style.transition = 'width 1.5s ease';
			raf = window.requestAnimationFrame(() => {
				fill.style.width = target;
			});
		};
		const schedule = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(animate, 60);
		};
		const mo = new MutationObserver(schedule);
		mo.observe(root, { childList: true, subtree: true });
		schedule();
		return () => {
			mo.disconnect();
			window.clearTimeout(timer);
			window.cancelAnimationFrame(raf);
		};
	}, []);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
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

	// --- Tab 1: Settings (content) --------------------------------------------
	const settingsTab = (
		<PanelBody title={__('Progress Bar', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Select Style', 'shapeblock')}
				value={selectStyle}
				options={[
					{ label: __('Style 1', 'shapeblock'), value: 'style1' },
					{ label: __('Style 2', 'shapeblock'), value: 'style2' },
				]}
				onChange={(v) => setAttributes({ selectStyle: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={__('Title', 'shapeblock')}
				value={title}
				onChange={(v) => setAttributes({ title: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<RangeControl
				label={__('Percent', 'shapeblock')}
				value={percent}
				onChange={(v) => setAttributes({ percent: v })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<PanelBody title={__('Progress', 'shapeblock')} initialOpen={true}>
			{respNum(__('Height (px)', 'shapeblock'), 'progressHeight')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Progress', 'shapeblock')} initialOpen={true}>
				{selectStyle === 'style1' && (
					<>
						{color(__('Progress Color (track)', 'shapeblock'), 'progressColor')}
						{color(__('Progress Bar Color (fill)', 'shapeblock'), 'progressBarColor')}
					</>
				)}
				{selectStyle === 'style2' && (
					<BackgroundControl
						label={__('Background', 'shapeblock')}
						colorValue={attributes.style2BgColor}
						gradientValue={attributes.style2BgGradient}
						onColorChange={(v) => setAttributes({ style2BgColor: v && typeof v === 'object' ? v.hex : v || '' })}
						onGradientChange={(v) => setAttributes({ style2BgGradient: v || '' })}
					/>
				)}
				<Divider />
				{num(__('Border Radius (px)', 'shapeblock'), 'progressRadius')}
			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Percent', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'percentColor')}
				{respTypo(__('Typography', 'shapeblock'), 'percentTypography')}
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/progress" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
