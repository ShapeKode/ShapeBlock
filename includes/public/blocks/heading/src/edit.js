import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	RichText,
	RichTextToolbarButton,
} from '@wordpress/block-editor';
import { registerFormatType, toggleFormat } from '@wordpress/rich-text';

// "Highlight" inline format: select a word in the title and click Highlight
// (in the B/I/link toolbar) instead of typing {{ }}. It wraps the selection in
// <span class="shapeblock-highlight"> — matched by the block's highlight styling
// (.shapeblock-title span) on the front end. No {{ }} brackets show in the editor.
if ( typeof window !== 'undefined' && ! window.__shapeblockHighlightFormat ) {
	window.__shapeblockHighlightFormat = true;
	registerFormatType( 'shapeblock/highlight', {
		title: __( 'Highlight', 'shapeblock' ),
		tagName: 'span',
		className: 'shapeblock-highlight',
		edit: ( { isActive, value, onChange } ) => (
			<RichTextToolbarButton
				icon="admin-customizer"
				title={ __( 'Highlight', 'shapeblock' ) }
				onClick={ () => onChange( toggleFormat( value, { type: 'shapeblock/highlight' } ) ) }
				isActive={ isActive }
			/>
		),
	} );
}
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	ToolbarDropdownMenu,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
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

// ---------------------------------------------------------------------------
// Editor-preview style helpers. These mirror the inline styles that render.php
// generates on the front end (see includes/public/Helper.php) so the client
// preview visually matches the saved output. Desktop values only — the
// per-device (Tablet/Mobile) overrides are emitted server-side and are not
// replicated here since the editor canvas is a desktop view.
// ---------------------------------------------------------------------------
const ensureUnit = (v) => {
	if (v === '' || v === null || v === undefined) return undefined;
	const n = Number(v);
	if (!isNaN(n) && String(v).trim() !== '' && n !== 0) return `${v}px`;
	return v;
};
const has = (v) => v !== '' && v !== null && v !== undefined;

const typoStyles = (obj) => {
	const o = {};
	if (!obj || typeof obj !== 'object') return o;
	if (obj.fontFamily) o.fontFamily = obj.fontFamily;
	if (obj.fontSize) o.fontSize = ensureUnit(obj.fontSize);
	if (obj.fontWeight) o.fontWeight = obj.fontWeight;
	if (obj.fontStyle) o.fontStyle = obj.fontStyle;
	if (obj.textTransform) o.textTransform = obj.textTransform;
	if (obj.lineHeight) o.lineHeight = obj.lineHeight;
	if (obj.letterSpacing) o.letterSpacing = ensureUnit(obj.letterSpacing);
	return o;
};
const dimStyles = (obj, type) => {
	const o = {};
	if (!obj || typeof obj !== 'object') return o;
	let map;
	if (type === 'padding') {
		map = { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' };
	} else if (type === 'margin') {
		map = { top: 'marginTop', right: 'marginRight', bottom: 'marginBottom', left: 'marginLeft' };
	} else {
		map = { top: 'borderTopLeftRadius', right: 'borderTopRightRadius', bottom: 'borderBottomRightRadius', left: 'borderBottomLeftRadius' };
	}
	Object.keys(map).forEach((side) => {
		if (has(obj[side])) o[map[side]] = ensureUnit(obj[side]);
	});
	return o;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		titleTag,
		linkUrl,
		linkTarget,
		linkNofollow,
		blockId,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-heading-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Load the block's Google fonts into the editor canvas. This edit component
	// renders INSIDE the canvas iframe, so `document` here is the iframe's
	// document — appending the font <link> here makes the preview show the font
	// whether or not the block is selected (the sidebar control isn't required).
	useEffect(() => {
		if (typeof document === 'undefined') return;
		const fams = [attributes.titleTypography, attributes.highlightTypography]
			.map((t) => (t && t.fontFamily) || '')
			.filter((f) => f && f.indexOf(',') === -1);
		fams.forEach((fam) => {
			const id = 'shapeblock-font-' + fam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			if (document.getElementById(id)) return;
			const link = document.createElement('link');
			link.id = id;
			link.rel = 'stylesheet';
			link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@100;200;300;400;500;600;700;800;900&display=swap';
			document.head.appendChild(link);
		});
	}, [attributes.titleTypography, attributes.highlightTypography]);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, colorKey, gradKey) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[colorKey]}
			gradientValue={attributes[gradKey]}
			onColorChange={(v) => setAttributes({ [colorKey]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [gradKey]: v || '' })}
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
	// -----------------------------------------------------------------------
	// Preview: state + inline styles mirroring render.php.
	// -----------------------------------------------------------------------
	const tag = titleTag || 'h2';

	// Heading wrapper alignment.
	const headingStyle = {};
	if (attributes.align) headingStyle.textAlign = attributes.align;

	// Title.
	const titleStyle = { ...typoStyles(attributes.titleTypography) };
	if (attributes.titleColor) titleStyle.color = attributes.titleColor;
	Object.assign(titleStyle, dimStyles(attributes.titleMargin, 'margin'), dimStyles(attributes.titlePadding, 'padding'));

	// Highlight: mirror the front-end highlight styling in the editor so the
	// highlighted word (the "Highlight" inline format span) shows styled.
	const hlStyle = { ...typoStyles(attributes.highlightTypography) };
	if (attributes.highlightColor) hlStyle.color = attributes.highlightColor;
	const hlBg = attributes.highlightBgGradient || attributes.highlightBgColor;
	if (hlBg) hlStyle.background = hlBg;
	Object.assign(hlStyle, dimStyles(attributes.highlightPadding, 'padding'), dimStyles(attributes.highlightMargin, 'margin'));
	// Tablet / Mobile preview, mirroring the media queries render.php prints.
	// The desktop values are applied as inline styles on the elements below, and
	// an inline style beats a stylesheet — hence !important here. This only ever
	// runs in the editor; the front-end CSS needs no such thing.
	const responsiveCss = ['Tablet', 'Mobile']
		.map((suffix) => {
			const query = 'Tablet' === suffix ? '@media (max-width: 1024px)' : '@media (max-width: 767px)';
			const rules = [
				[
					`.${blockId} .shapeblock-heading .shapeblock-title`,
					{
						...typoStyles(attributes[`titleTypography${suffix}`]),
						...dimStyles(attributes[`titleMargin${suffix}`], 'margin'),
						...dimStyles(attributes[`titlePadding${suffix}`], 'padding'),
					},
				],
				[
					`.${blockId} .shapeblock-heading .shapeblock-title span`,
					{
						...typoStyles(attributes[`highlightTypography${suffix}`]),
						...dimStyles(attributes[`highlightPadding${suffix}`], 'padding'),
						...dimStyles(attributes[`highlightMargin${suffix}`], 'margin'),
					},
				],
			]
				.map(([selector, styleObj]) => {
					const decls = Object.entries(styleObj)
						.filter(([, v]) => v !== '' && v != null)
						.map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v} !important;`)
						.join('');
					return decls ? `${selector}{${decls}}` : '';
				})
				.filter(Boolean)
				.join('');

			return rules ? `${query}{${rules}}` : '';
		})
		.filter(Boolean)
		.join('');

	const hlCss = Object.entries(hlStyle)
		.map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
		.join(';');

	return (
		<div {...useBlockProps({ className: `shapeblock-block shapeblock-heading-block-wrap ${blockId || ''}`.trim() })}>
			<BlockControls>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(titleTag || 'h2').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'].map((t) => ({
						title: t.toUpperCase(),
						isActive: titleTag === t,
						onClick: () => setAttributes({ titleTag: t }),
					}))}
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
							<PanelBody title={__('Heading', 'shapeblock')} initialOpen={true}>
								<SelectControl
									label={__('HTML Tag', 'shapeblock')}
									value={titleTag}
									options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))}
									onChange={(v) => setAttributes({ titleTag: v })}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<Divider />
								<TextControl label={__('Link URL', 'shapeblock')} type="url" value={linkUrl} onChange={(v) => setAttributes({ linkUrl: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
								{linkUrl !== '' && (
									<>
										<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={linkTarget} onChange={(v) => setAttributes({ linkTarget: v })} __nextHasNoMarginBottom />
										<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={linkNofollow} onChange={(v) => setAttributes({ linkNofollow: v })} __nextHasNoMarginBottom />
									</>
								)}
							</PanelBody>
						) : tab.name === 'layout' ? (
							<PanelBody title={__('Heading', 'shapeblock')} initialOpen={true}>
								<ToggleGroupControl label={__('Alignment', 'shapeblock')} value={attributes.align || ''} onChange={(v) => setAttributes({ align: v ?? '' })} isBlock isDeselectable __next40pxDefaultSize __nextHasNoMarginBottom>
									<ToggleGroupControlOptionIcon value="left" icon="editor-alignleft" label={__('Left', 'shapeblock')} />
									<ToggleGroupControlOptionIcon value="center" icon="editor-aligncenter" label={__('Center', 'shapeblock')} />
									<ToggleGroupControlOptionIcon value="right" icon="editor-alignright" label={__('Right', 'shapeblock')} />
									<ToggleGroupControlOptionIcon value="justify" icon="editor-justify" label={__('Justify', 'shapeblock')} />
								</ToggleGroupControl>
								{respBox(__('Title Margin', 'shapeblock'), 'titleMargin')}
								{respBox(__('Title Padding', 'shapeblock'), 'titlePadding')}
								{respBox(__('Highlight Margin', 'shapeblock'), 'highlightMargin')}
								{respBox(__('Highlight Padding', 'shapeblock'), 'highlightPadding')}
							</PanelBody>
						) : (
							<>
								<PanelBody title={__('Heading', 'shapeblock')} initialOpen={true}>
									{color(__('Color', 'shapeblock'), 'titleColor')}
									{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
								</PanelBody>

								<PanelBody title={__('Highlight', 'shapeblock')} initialOpen={false}>
									<p style={{ margin: '0 0 12px', padding: '8px 10px', background: '#f0f6fc', border: '1px solid #c5d9ed', borderRadius: '4px', fontSize: '12px', lineHeight: '1.5' }}>
										{__('How to highlight: in the title, select the word(s) you want, then click the Highlight (marker) button in the toolbar — or wrap them in double braces, e.g. {{word}}. The styles below apply to the highlighted text.', 'shapeblock')}
									</p>
									{color(__('Color', 'shapeblock'), 'highlightColor')}
									{bg(__('Background', 'shapeblock'), 'highlightBgColor', 'highlightBgGradient')}
									{respTypo(__('Typography', 'shapeblock'), 'highlightTypography')}
								</PanelBody>
							</>
						)
					)}
				</TabPanel>
			</InspectorControls>

			{hlCss && blockId && (
				<style>{`.${blockId} .shapeblock-title .shapeblock-highlight, .${blockId} .shapeblock-title span { ${hlCss} }`}</style>
			)}
			{responsiveCss && blockId && <style>{responsiveCss}</style>}
			<div className="shapeblock-heading" style={headingStyle}>
				<RichText
					tagName={tag}
					className="shapeblock-title"
					value={(attributes.title || '').replace(/\{\{(.*?)\}\}/g, '<span class="shapeblock-highlight">$1</span>')}
					onChange={(v) => setAttributes({ title: v.replace(/\{\{(.*?)\}\}/g, '<span class="shapeblock-highlight">$1</span>') })}
					allowedFormats={['core/bold', 'core/italic', 'core/link', 'shapeblock/highlight']}
					placeholder={__('Add heading…', 'shapeblock')}
					style={titleStyle}
				/>
			</div>
		</div>
	);
}
