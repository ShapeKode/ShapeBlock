import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl, RichText } from '@wordpress/block-editor';
import { PanelBody, BoxControl, TabPanel } from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import TypographyControls from '../../custom-components/TypographyControls';
import BackgroundControl from '../../custom-components/BackgroundControl';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

// The Highlight button (shapeblock/highlight) is registered by the Heading block's script,
// which the editor always loads with ShapeBlock; it wraps words in <span class="shapeblock-highlight">.

const getKey = (base, device) => (device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`);

// The same CSS render.php prints, so the editor shows exactly what the site shows.
const unit = (v) => {
	if (v === '' || v === null || v === undefined) return '';
	const n = Number(v);
	return !isNaN(n) && String(v).trim() !== '' && n !== 0 ? `${v}px` : String(v);
};
// A value the page stylesheet leaves out (empty, or "0" as PHP empty() sees it) is left out here too.
const set = (v) => !!v && v !== '0';
const typo = (o) => {
	const out = {};
	if (!o || typeof o !== 'object') return out;
	if (set(o.fontFamily)) out['font-family'] = o.fontFamily;
	if (set(o.fontSize)) out['font-size'] = unit(o.fontSize);
	if (set(o.fontWeight)) out['font-weight'] = o.fontWeight;
	if (set(o.fontStyle)) out['font-style'] = o.fontStyle;
	if (set(o.textTransform)) out['text-transform'] = o.textTransform;
	if (set(o.lineHeight)) out['line-height'] = o.lineHeight;
	if (set(o.letterSpacing)) out['letter-spacing'] = unit(o.letterSpacing);
	if (set(o.textDecoration)) out['text-decoration'] = o.textDecoration;
	return out;
};
const dims = (o, type) => {
	const out = {};
	if (!o || typeof o !== 'object') return out;
	const map = type === 'radius'
		? { top: 'border-top-left-radius', right: 'border-top-right-radius', bottom: 'border-bottom-right-radius', left: 'border-bottom-left-radius' }
		: { top: `${type}-top`, right: `${type}-right`, bottom: `${type}-bottom`, left: `${type}-left` };
	Object.keys(map).forEach((side) => {
		if (o[side] !== '' && o[side] !== undefined && o[side] !== null) out[map[side]] = unit(o[side]);
	});
	return out;
};
const rule = (sel, decls) => {
	const body = Object.entries(decls).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}:${v};`).join('');
	return body ? `${sel}{${body}}` : '';
};
const buildCss = (a) => {
	const sel = `.shapeblock-block.shapeblock-paragraph.${a.blockId}.${a.blockId}`;
	const text = { ...typo(a.typography) };
	if (['left', 'center', 'right', 'justify'].includes(a.align)) text['text-align'] = a.align;
	if (a.textColor) text.color = a.textColor;
	const hl = { ...typo(a.highlightTypography) };
	if (a.highlightColor) hl.color = a.highlightColor;
	if (a.highlightBgGradient || a.highlightBgColor) hl.background = a.highlightBgGradient || a.highlightBgColor;
	Object.assign(hl, dims(a.highlightPadding, 'padding'), dims(a.highlightMargin, 'margin'), dims(a.highlightBorderRadius, 'radius'));
	let css = rule(sel, text) + rule(`${sel} span`, hl);
	if (a.linkColor) css += rule(`${sel} a`, { color: a.linkColor });
	if (a.linkColorHover) css += rule(`${sel} a:hover`, { color: a.linkColorHover });
	[['Tablet', '@media (max-width: 1024px)'], ['Mobile', '@media (max-width: 767px)']].forEach(([s, q]) => {
		const inner = rule(sel, typo(a[`typography${s}`])) + rule(`${sel} span`, { ...typo(a[`highlightTypography${s}`]), ...dims(a[`highlightPadding${s}`], 'padding'), ...dims(a[`highlightMargin${s}`], 'margin') });
		if (inner) css += `${q}{${inner}}`;
	});
	return css;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, content, align } = attributes;
	const ref = useRef();

	useEffect(() => {
		if (!blockId) setAttributes({ blockId: 'shapeblock-paragraph-' + clientId.slice(0, 6) });
	}, [blockId, clientId, setAttributes]);

	// The block's CSS goes into the canvas document's head, as the site gets it in the page stylesheet.
	const css = blockId ? buildCss(attributes) : '';
	useEffect(() => {
		const doc = ref.current && ref.current.ownerDocument;
		if (!doc || !blockId) return undefined;
		const id = 'shapeblock-paragraph-css-' + blockId;
		let tag = doc.getElementById(id);
		if (!tag) {
			tag = doc.createElement('style');
			tag.id = id;
			doc.head.appendChild(tag);
		}
		tag.textContent = css;
		return () => tag.remove();
	}, [css, blockId]);

	// Google fonts chosen in the block, in the canvas too (an opt-in connection, ShapeBlock > Settings).
	useEffect(() => {
		const doc = ref.current && ref.current.ownerDocument;
		if (!doc || !window.shapeblockGoogleFonts) return;
		[attributes.typography, attributes.highlightTypography]
			.map((t) => (t && t.fontFamily) || '')
			.filter((f) => f && f.indexOf(',') === -1)
			.forEach((fam) => {
				const id = 'shapeblock-font-' + fam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
				if (doc.getElementById(id)) return;
				const link = doc.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@100;200;300;400;500;600;700;800;900&display=swap';
				doc.head.appendChild(link);
			});
	}, [attributes.typography, attributes.highlightTypography]);

	const blockProps = useBlockProps({ ref, className: `shapeblock-block shapeblock-paragraph ${blockId || ''}`.trim() });
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <BoxControl label="" values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const value = (content || '').replace(/\{\{(.*?)\}\}/g, '<span class="shapeblock-highlight">$1</span>').replace(/<span>/g, '<span class="shapeblock-highlight">');

	return (
		<>
			<BlockControls group="block">
				<AlignmentControl value={align} onChange={(v) => setAttributes({ align: v || '' })} alignmentControls={[
					{ icon: 'editor-alignleft', title: __('Left', 'shapeblock'), align: 'left' },
					{ icon: 'editor-aligncenter', title: __('Center', 'shapeblock'), align: 'center' },
					{ icon: 'editor-alignright', title: __('Right', 'shapeblock'), align: 'right' },
					{ icon: 'editor-justify', title: __('Justify', 'shapeblock'), align: 'justify' },
				]} />
			</BlockControls>
			<InspectorControls>
				<TabPanel
					className="shapeblock-inspector-tabs"
					activeClass="is-active"
					tabs={[
						{ name: 'style', title: __('Style', 'shapeblock') },
						{ name: 'advanced', title: __('Advanced', 'shapeblock') },
					]}
				>
					{(tab) => (tab.name === 'advanced' ? (
						<AdvancedControls attributes={attributes} setAttributes={setAttributes} />
					) : (
						<>
							<PanelBody title={__('Text', 'shapeblock')} initialOpen={true}>
								<ColorPopover label={__('Color', 'shapeblock')} color={attributes.textColor} onChange={(v) => setAttributes({ textColor: v })} />
								{respTypo(__('Typography', 'shapeblock'), 'typography')}
								<ColorPopover label={__('Link Color', 'shapeblock')} color={attributes.linkColor} onChange={(v) => setAttributes({ linkColor: v })} />
								<ColorPopover label={__('Link Hover Color', 'shapeblock')} color={attributes.linkColorHover} onChange={(v) => setAttributes({ linkColorHover: v })} />
							</PanelBody>
							<PanelBody title={__('Highlight', 'shapeblock')} initialOpen={false}>
								<p className="components-base-control__help">{__('Select words in the text and click the Highlight button in the toolbar, or wrap them in double braces, e.g. {{word}}. These styles apply to the highlighted words.', 'shapeblock')}</p>
								<ColorPopover label={__('Color', 'shapeblock')} color={attributes.highlightColor} onChange={(v) => setAttributes({ highlightColor: v })} />
								<BackgroundControl
									label={__('Background', 'shapeblock')}
									colorValue={attributes.highlightBgColor}
									gradientValue={attributes.highlightBgGradient}
									onColorChange={(v) => setAttributes({ highlightBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
									onGradientChange={(v) => setAttributes({ highlightBgGradient: v || '' })}
								/>
								{respTypo(__('Typography', 'shapeblock'), 'highlightTypography')}
								{respBox(__('Margin', 'shapeblock'), 'highlightMargin')}
								{respBox(__('Padding', 'shapeblock'), 'highlightPadding')}
								<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.highlightBorderRadius} onChange={(v) => setAttributes({ highlightBorderRadius: v })} />
							</PanelBody>
						</>
					))}
				</TabPanel>
			</InspectorControls>
			<RichText
				{...blockProps}
				identifier="content"
				tagName="p"
				value={value}
				onChange={(v) => setAttributes({ content: v.replace(/\{\{(.*?)\}\}/g, '<span class="shapeblock-highlight">$1</span>') })}
				allowedFormats={['core/bold', 'core/italic', 'core/link', 'shapeblock/highlight']}
				placeholder={__('Write a paragraph…', 'shapeblock')}
			/>
		</>
	);
}
