import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import useInlineText from '../../custom-components/useInlineText';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl, RangeControl, TabPanel } from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. linesTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, capStyle, columnRule } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-dc-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// The paragraph is typed right on the preview.
	const inlineRef = useInlineText([{ selector: '.shapeblock-dc__text', multiline: true, save: (i, v) => setAttributes({ text: v }) }]);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	// A whole number per device; 0 on tablet / mobile follows the larger screen.
	const respCount = (label, base, min, max, help) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <RangeControl value={attributes[k] || undefined} min={min} max={max} allowReset={device !== 'desktop'} help={help} onChange={(v) => setAttributes({ [k]: v || 0 })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const text = (label, key, placeholder, help) => <TextControl label={label} value={attributes[key] || ''} placeholder={placeholder} help={help} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	const boxed = capStyle === 'filled' || capStyle === 'outline';

	// --- Tab 1: Settings (content / behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Drop Cap', 'shapeblock')} initialOpen={true}>
			<p className="components-base-control__help">{__('Type the paragraph right on the block. Its first letter becomes the drop cap.', 'shapeblock')}</p>
			<SelectControl label={__('Style', 'shapeblock')} value={capStyle} options={[{ label: __('Plain Letter', 'shapeblock'), value: 'plain' }, { label: __('Letter in a Box', 'shapeblock'), value: 'filled' }, { label: __('Letter in an Outline', 'shapeblock'), value: 'outline' }, { label: __('Outlined Letter', 'shapeblock'), value: 'stroke' }]} onChange={(v) => setAttributes({ capStyle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			{respCount(__('Lines Tall', 'shapeblock'), 'lines', 2, 8, __('How many lines of text the letter spans.', 'shapeblock'))}
		</PanelBody>
	);

	// --- Tab 2: Layout (columns) ----------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Columns', 'shapeblock')} initialOpen={true}>
			{respCount(__('Text Columns', 'shapeblock'), 'columns', 1, 4, __('Newspaper columns. Phones show one unless set.', 'shapeblock'))}
			{text(__('Column Gap', 'shapeblock'), 'columnGap', '40px')}
			<ToggleControl label={__('Line Between Columns', 'shapeblock')} checked={!!columnRule} onChange={(v) => setAttributes({ columnRule: v })} __nextHasNoMarginBottom />
			{columnRule && color(__('Line Color', 'shapeblock'), 'columnRuleColor')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Drop Cap', 'shapeblock')} initialOpen={true}>
				{color(capStyle === 'stroke' ? __('Outline Color', 'shapeblock') : __('Letter Color', 'shapeblock'), 'capColor')}
				{(boxed || capStyle === 'stroke') && color(capStyle === 'filled' ? __('Box Color', 'shapeblock') : capStyle === 'outline' ? __('Box Outline Color', 'shapeblock') : __('Inside Color', 'shapeblock'), 'capBg')}
				{boxed && text(__('Box Radius', 'shapeblock'), 'capRadius', '6px', __('A box is a little wider than tall, so a large radius such as 50% makes an oval.', 'shapeblock'))}
				{text(__('Font Family', 'shapeblock'), 'capFontFamily', __('e.g. Georgia, serif', 'shapeblock'), __('Empty: the paragraph font. A serif face gives a classic book look.', 'shapeblock'))}
				<SelectControl label={__('Font Weight', 'shapeblock')} value={attributes.capFontWeight} options={[{ label: __('Default (700)', 'shapeblock'), value: '' }, ...['300', '400', '500', '600', '700', '800', '900'].map((w) => ({ label: w, value: w }))]} onChange={(v) => setAttributes({ capFontWeight: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{text(__('Space to the Text', 'shapeblock'), 'capGap', boxed ? '0.22em' : '0.1em')}
			</PanelBody>
			<PanelBody title={__('Text', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'textColor')}
				<ResponsiveWrapper label={__('Typography', 'shapeblock')}>
					{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey('textTypography', device)} />}
				</ResponsiveWrapper>
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

			<div ref={inlineRef}>
				<ServerSideRender block="shapeblock/drop-caps" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
