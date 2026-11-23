import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import useInlineText from '../../custom-components/useInlineText';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	RangeControl,
	TabPanel,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import IconPicker from '../../custom-components/IconPicker';
import SpacingControl from '../../custom-components/SpacingControl';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

import './editor.scss';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. weightTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

// A small drawing of each line style, for the style picker.
const sample = (children) => (
	<svg className="shapeblock-divider-styles__sample" viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
		{children}
	</svg>
);
const STYLES = [
	{ value: 'solid', label: __('Solid', 'shapeblock'), svg: sample(<line x1="0" y1="5" x2="120" y2="5" stroke="currentColor" strokeWidth="2" />) },
	{ value: 'double', label: __('Double', 'shapeblock'), svg: sample(<><line x1="0" y1="3" x2="120" y2="3" stroke="currentColor" strokeWidth="1.5" /><line x1="0" y1="7" x2="120" y2="7" stroke="currentColor" strokeWidth="1.5" /></>) },
	{ value: 'dashed', label: __('Dashed', 'shapeblock'), svg: sample(<line x1="0" y1="5" x2="120" y2="5" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" />) },
	{ value: 'dotted', label: __('Dotted', 'shapeblock'), svg: sample(<line x1="1" y1="5" x2="120" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray="0 6" strokeLinecap="round" />) },
	{ value: 'wave', label: __('Wave', 'shapeblock'), svg: sample(<path d="M0 5 Q7.5 0 15 5 T30 5 T45 5 T60 5 T75 5 T90 5 T105 5 T120 5" fill="none" stroke="currentColor" strokeWidth="1.5" />) },
	{ value: 'zigzag', label: __('Zigzag', 'shapeblock'), svg: sample(<polyline points="0,8 7.5,2 15,8 22.5,2 30,8 37.5,2 45,8 52.5,2 60,8 67.5,2 75,8 82.5,2 90,8 97.5,2 105,8 112.5,2 120,8" fill="none" stroke="currentColor" strokeWidth="1.5" />) },
	{ value: 'slashes', label: __('Slashes', 'shapeblock'), svg: sample(<path d="M2 9L6 1M12 9L16 1M22 9L26 1M32 9L36 1M42 9L46 1M52 9L56 1M62 9L66 1M72 9L76 1M82 9L86 1M92 9L96 1M102 9L106 1M112 9L116 1" stroke="currentColor" strokeWidth="1.5" />) },
];
const PATTERNED = ['dashed', 'dotted', 'wave', 'zigzag', 'slashes'];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, dividerStyle, elementType, iconView } = attributes;
	const lineStyle = dividerStyle || 'solid';
	const element = elementType || 'none';
	const view = iconView || 'default';

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-divider-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);
	const group = (label, key, options, fallback, hideLabel = false) => (
		<div className="shapeblock-caps-label">
			<ToggleGroupControl label={label} hideLabelFromVision={hideLabel} value={attributes[key] || fallback} onChange={(v) => setAttributes({ [key]: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
				{options.map(([value, title]) => <ToggleGroupControlOption key={value} value={value} label={title} />)}
			</ToggleGroupControl>
		</div>
	);
	const slider = (key, max, min = 0) => (
		<RangeControl
			value={attributes[key] !== '' && attributes[key] != null ? Number(attributes[key]) : undefined}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={min}
			max={max}
			allowReset
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	// Responsive slider, stored as a string per device so render.php can tell "not set" from 0.
	const num = (label, key, max = 100, min = 0) => (
		<ResponsiveWrapper label={label}>{(device) => slider(getKey(key, device), max, min)}</ResponsiveWrapper>
	);
	const single = (label, key, max = 100) => (
		<div>
			<p className="components-base-control__label">{label}</p>
			{slider(key, max)}
		</div>
	);

	// --- Tab 1: Settings --------------------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Line', 'shapeblock')} initialOpen={true}>
				<div className="shapeblock-divider-styles" role="radiogroup" aria-label={__('Style', 'shapeblock')}>
					{STYLES.map((s) => (
						<button type="button" key={s.value} role="radio" aria-checked={lineStyle === s.value} className={lineStyle === s.value ? 'is-active' : ''} onClick={() => setAttributes({ dividerStyle: s.value })}>
							{s.svg}
							<span>{s.label}</span>
						</button>
					))}
				</div>
			</PanelBody>
			<PanelBody title={__('Text or Icon', 'shapeblock')} initialOpen={true}>
				{group(__('In the Line', 'shapeblock'), 'elementType', [['none', __('None', 'shapeblock')], ['text', __('Text', 'shapeblock')], ['icon', __('Icon', 'shapeblock')]], 'none')}
				{element === 'text' && (
					<>
						<TextControl label={__('Text', 'shapeblock')} help={__('You can also type it right on the divider.', 'shapeblock')} value={attributes.text || ''} onChange={(v) => setAttributes({ text: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<SelectControl label={__('HTML Tag', 'shapeblock')} value={attributes.textTag || 'span'} options={['span', 'p', 'div', 'h2', 'h3', 'h4', 'h5', 'h6'].map((t) => ({ value: t, label: t.toUpperCase() }))} onChange={(v) => setAttributes({ textTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					</>
				)}
				{element === 'icon' && <IconPicker label={__('Icon', 'shapeblock')} value={attributes.icon} onChange={(v) => setAttributes({ icon: v })} />}
				{element !== 'none' && group(__('Position', 'shapeblock'), 'elementPosition', [['start', __('Start', 'shapeblock')], ['center', __('Center', 'shapeblock')], ['end', __('End', 'shapeblock')]], 'center')}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout ----------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Size', 'shapeblock')} initialOpen={true}>
				{num(__('Width (%)', 'shapeblock'), 'width', 100, 1)}
				<ResponsiveWrapper label={__('Alignment', 'shapeblock')}>
					{(device) => group(__('Alignment', 'shapeblock'), getKey('align', device), [['left', __('Left', 'shapeblock')], ['center', __('Center', 'shapeblock')], ['right', __('Right', 'shapeblock')]], device === 'desktop' ? 'center' : '', true)}
				</ResponsiveWrapper>
				{num(__('Weight (px)', 'shapeblock'), 'weight', 20, 1)}
				{PATTERNED.includes(lineStyle) && num(lineStyle === 'dashed' || lineStyle === 'dotted' ? __('Pattern Length (px)', 'shapeblock') : __('Pattern Width (px)', 'shapeblock'), 'patternSize', 80, 4)}
			</PanelBody>
			<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={false}>
				{num(__('Space Above and Below (px)', 'shapeblock'), 'gap', 200)}
				{element !== 'none' && num(__('Space Around Text or Icon (px)', 'shapeblock'), 'elementGap', 100)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style -------------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Line', 'shapeblock')} initialOpen={true}>
				{bg(__('Color', 'shapeblock'), 'lineColor', 'lineGradient')}
			</PanelBody>
			{element === 'text' && (
				<PanelBody title={__('Text', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'textColor')}
					<ResponsiveWrapper label={__('Typography', 'shapeblock')}>
						{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey('textTypography', device)} />}
					</ResponsiveWrapper>
					{bg(__('Background', 'shapeblock'), 'textBg', 'textBgGradient')}
					<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
						{(device) => <SpacingControl values={attributes[getKey('textPadding', device)]} onChange={(v) => setAttributes({ [getKey('textPadding', device)]: v })} />}
					</ResponsiveWrapper>
					{single(__('Border Radius (px)', 'shapeblock'), 'textRadius', 100)}
				</PanelBody>
			)}
			{element === 'icon' && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{group(__('View', 'shapeblock'), 'iconView', [['default', __('Default', 'shapeblock')], ['stacked', __('Stacked', 'shapeblock')], ['framed', __('Framed', 'shapeblock')]], 'default')}
					{color(__('Color', 'shapeblock'), 'iconColor')}
					{num(__('Size (px)', 'shapeblock'), 'iconSize', 120, 6)}
					{view === 'stacked' && bg(__('Background', 'shapeblock'), 'iconBg', 'iconBgGradient')}
					{view === 'framed' && (
						<>
							{color(__('Border Color', 'shapeblock'), 'iconBorderColor')}
							{single(__('Border Width (px)', 'shapeblock'), 'iconBorderWidth', 10)}
						</>
					)}
					{view !== 'default' && (
						<>
							{single(__('Padding (px)', 'shapeblock'), 'iconPadding', 60)}
							{single(__('Border Radius (px)', 'shapeblock'), 'iconRadius', 100)}
						</>
					)}
				</PanelBody>
			)}
		</>
	);

	// The text in the line is typed right on the preview.
	const inlineRef = useInlineText([{ selector: '.shapeblock-divider__text', save: (i, v) => setAttributes({ text: v }) }]);

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
					{(tab) =>
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						tab.name === 'style' ? styleTab :
						<AdvancedControls attributes={attributes} setAttributes={setAttributes} />
					}
				</TabPanel>
			</InspectorControls>
			<div ref={inlineRef}>
				<ServerSideRender block="shapeblock/divider" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
