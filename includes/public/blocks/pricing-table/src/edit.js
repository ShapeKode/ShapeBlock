import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import ServerSideRender from '../../custom-components/ServerRender';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Placeholder,
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';
import { PRICE_BLOCK, PRICE_KEYS } from './price';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

// Text saved as plain text, put into blocks that hold HTML. Entities are read
// first: a site that filters what its editors save stored & as &amp;.
const toHtml = (text) => {
	const el = document.createElement('textarea');
	el.innerHTML = String(text ?? '');
	return el.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const STYLES = [
	{ name: 'default', label: __('Classic', 'shapeblock') },
	{ name: 'centered', label: __('Centered', 'shapeblock') },
	{ name: 'dark', label: __('Dark', 'shapeblock') },
];

const ALIGN_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

/**
 * The card's blocks, from the settings a Pricing Table saved before it was
 * made of blocks (and from the defaults, for a new one): the title, the
 * description, the price, the features and the button.
 *
 * @param {Object} a Block attributes.
 * @return {Array} Blocks.
 */
const cardBlocks = (a) => {
	const blocks = [createBlock('core/heading', { level: 3, content: a.title || '', className: 'shapeblock-price-title' })];
	if (a.description) {
		blocks.push(createBlock('core/paragraph', { content: a.description, className: 'shapeblock-subtitle-price' }));
	}
	blocks.push(createBlock(PRICE_BLOCK, PRICE_KEYS.reduce((out, k) => (undefined === a[k] ? out : { ...out, [k]: a[k] }), {})));

	const button = [];
	if (false !== a.showButton) {
		const rel = [a.buttonTarget ? 'noopener noreferrer' : '', a.buttonNofollow ? 'nofollow' : ''].filter(Boolean).join(' ');
		button.push(
			createBlock('core/buttons', { className: 'shapeblock-btn-part' }, [
				createBlock('core/button', { text: toHtml(a.buttonText), url: a.buttonUrl || '#', linkTarget: a.buttonTarget ? '_blank' : undefined, rel: rel || undefined }),
			])
		);
		if (a.buttonSubtext) {
			button.push(createBlock('core/paragraph', { content: toHtml(a.buttonSubtext), className: 'shapeblock-button-subtext' }));
		}
	}
	if ('in_features' === a.buttonPosition) {
		blocks.push(...button);
	}
	if (a.featuresDescription) {
		blocks.push(createBlock('core/paragraph', { content: a.featuresDescription, className: 'shapeblock-features-description' }));
	}
	const features = Array.isArray(a.features) ? a.features : [];
	blocks.push(createBlock('core/list', { className: 'shapeblock-features' }, features.map((f) => createBlock('core/list-item', { content: toHtml(f.text) }))));
	if ('in_features' !== a.buttonPosition) {
		blocks.push(...button);
	}
	return blocks;
};

// The plans a new pricing table starts with, by how many there are.
const planSets = () => {
	const basic = { title: __('Basic', 'shapeblock'), price: '19', features: [__('1 Website', 'shapeblock'), __('10 GB Storage', 'shapeblock'), __('Free SSL Certificate', 'shapeblock'), __('Email Support', 'shapeblock')] };
	const standard = { title: __('Standard', 'shapeblock'), price: '29', features: [__('3 Websites', 'shapeblock'), __('50 GB Storage', 'shapeblock'), __('Free SSL Certificate', 'shapeblock'), __('Email Support', 'shapeblock')] };
	const pro = { title: __('Pro', 'shapeblock'), price: '49', featured: true, features: [__('10 Websites', 'shapeblock'), __('100 GB Storage', 'shapeblock'), __('Free SSL Certificate', 'shapeblock'), __('Priority Support', 'shapeblock')] };
	const business = { title: __('Business', 'shapeblock'), price: '99', features: [__('Unlimited Websites', 'shapeblock'), __('1 TB Storage', 'shapeblock'), __('Free SSL Certificate', 'shapeblock'), __('24/7 Phone Support', 'shapeblock')] };
	return { 1: [basic], 2: [basic, pro], 3: [basic, pro, business], 4: [basic, standard, pro, business] };
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, featureIconStyle, isFeatured, ribbonStyle } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-pricing-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// The card is made of blocks. A table saved before that, and a new one,
	// gets them once, from its settings.
	const hasBlocks = useSelect((select) => select(blockEditorStore).getBlockCount(clientId) > 0, [clientId]);
	const { replaceInnerBlocks, replaceBlocks, __unstableMarkNextChangeAsNotPersistent } = useDispatch(blockEditorStore);

	// The plan picker: how many plans, and their look. Two or more become cards
	// side by side in a Columns block, the middle one (or the third of four)
	// featured; one stays this card.
	const [pickedStyle, setPickedStyle] = useState('default');
	const createPlans = (count) => {
		const plans = planSets()[count];
		const className = 'default' === pickedStyle ? undefined : `is-style-${pickedStyle}`;
		const content = (plan) => cardBlocks({ ...attributes, title: plan.title, description: '', price: plan.price, onSale: false, features: plan.features.map((text) => ({ icon: '', text })), featuresDescription: '', buttonText: __('Get Started', 'shapeblock'), buttonUrl: '#', buttonSubtext: '', buttonPosition: 'after_features' });
		if (1 === count) {
			setAttributes({ planPicker: false, className });
			replaceInnerBlocks(clientId, content(plans[0]), false);
			return;
		}
		const cards = plans.map((plan) =>
			createBlock('shapeblock/pricing-table', { className, isFeatured: !!plan.featured, featuredText: plan.featured ? __('Most Popular', 'shapeblock') : attributes.featuredText }, content(plan))
		);
		replaceBlocks(clientId, createBlock('core/columns', { align: 'wide' }, cards.map((card) => createBlock('core/column', {}, [card]))));
	};
	useEffect(() => {
		if (hasBlocks || attributes.planPicker) {
			return;
		}
		__unstableMarkNextChangeAsNotPersistent();
		replaceInnerBlocks(clientId, cardBlocks(attributes), false);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (headerAlignment / headerAlignmentTablet / headerAlignmentMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'headerAlignment' : `headerAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	// The block style (Classic, Centered, Dark): the same is-style-* class the
	// editor's Styles tab sets, picked here too where it is easy to find.
	const activeStyle = (/(?:^|\s)is-style-([a-z0-9-]+)/.exec(attributes.className || '') || [])[1] || 'default';
	const setStyle = (name) => {
		const rest = (attributes.className || '').replace(/(?:^|\s)is-style-[a-z0-9-]+/g, '').trim();
		const next = [rest, 'default' === name ? '' : `is-style-${name}`].filter(Boolean).join(' ');
		setAttributes({ className: next || undefined });
	};

	// The design's CSS comes from the server: a hidden preview of the card's
	// settings, not fetched again while the ribbon text is typed.
	const styleOnly = useMemo(() => ({ ...attributes, featuredText: '' }), [JSON.stringify({ ...attributes, featuredText: '' })]); // eslint-disable-line react-hooks/exhaustive-deps

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: (v && typeof v === 'object') ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
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
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, d)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => <BoxControl values={attributes[getKey(base, d)]} onChange={(v) => setAttributes({ [getKey(base, d)]: v })} />}
		</ResponsiveWrapper>
	);
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => {
				const k = getKey(base, d);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(d) => {
				const k = getKey(base, d);
				return <SelectControl value={attributes[k]} options={[{ label: __('Default', 'shapeblock'), value: '' }, ...options]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings ------------------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Style', 'shapeblock')} initialOpen={true}>
				<div className="shapeblock-pricing-style-picker">
					{STYLES.map((s) => (
						<button
							type="button"
							key={s.name}
							className={`shapeblock-pricing-style-option is-${s.name}${activeStyle === s.name ? ' is-active' : ''}`}
							aria-pressed={activeStyle === s.name}
							onClick={() => setStyle(s.name)}
						>
							<span className="shapeblock-pricing-style-thumb" aria-hidden="true">
								<span className="t-title" />
								<span className="t-price" />
								<span className="t-line" />
								<span className="t-line" />
								<span className="t-line" />
								<span className="t-button" />
							</span>
							<span className="shapeblock-pricing-style-label">{s.label}</span>
						</button>
					))}
				</div>
				<p className="components-base-control__help">
					{__('The card is made of blocks: click the title, price, a feature or the button to edit it with its own toolbar and settings. Add any other block with the + inside the card.', 'shapeblock')}
				</p>
			</PanelBody>

			<PanelBody title={__('Featured', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Featured', 'shapeblock')} help={isFeatured ? __('Type the ribbon text in the card.', 'shapeblock') : __('Shows a ribbon on the card.', 'shapeblock')} checked={isFeatured} onChange={(v) => setAttributes({ isFeatured: v })} __nextHasNoMarginBottom />
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (alignment & positioning) ------------------------------
	const layoutTab = (
		<PanelBody title={__('Positioning', 'shapeblock')} initialOpen={true}>
			{respAlign(__('Header Alignment', 'shapeblock'), 'headerAlignment', ALIGN_OPTIONS)}
			<Divider />
			{respAlign(__('Features Alignment', 'shapeblock'), 'featureTextAlignment', ALIGN_OPTIONS)}
			<Divider />
			{respAlign(__('Button Alignment', 'shapeblock'), 'btnAlignment', ALIGN_OPTIONS)}
			{isFeatured && ribbonStyle === 'style2' && (
				<>
					<Divider />
					{respAlign(
						__('Ribbon Alignment', 'shapeblock'),
						'ribbonAlignment',
						[
							{ label: __('Left', 'shapeblock'), value: 'left' },
							{ label: __('Right', 'shapeblock'), value: 'right' },
						]
					)}
				</>
			)}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			{isFeatured && (
				<PanelBody title={__('Ribbon', 'shapeblock')} initialOpen={true}>
					<SelectControl
						label={__('Ribbon Style', 'shapeblock')}
						value={ribbonStyle}
						options={[
							{ label: __('Style 1', 'shapeblock'), value: 'style1' },
							{ label: __('Style 2', 'shapeblock'), value: 'style2' },
						]}
						onChange={(v) => setAttributes({ ribbonStyle: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<Divider />
					{color(__('Text Color', 'shapeblock'), 'ribbonColor')}
					{bg(__('Background', 'shapeblock'), 'ribbonBgColor', 'ribbonBgGradient')}
					{respTypo(__('Typography', 'shapeblock'), 'ribbonTypography')}
					{ribbonStyle === 'style1' && (
						<>
							<Divider />
							{respBox(__('Padding', 'shapeblock'), 'ribbonPadding')}
							<Divider />
							{box(__('Border Radius', 'shapeblock'), 'ribbonBorderRadius')}
						</>
					)}
				</PanelBody>
			)}

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={!isFeatured}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{color(__('Highlight Color (span)', 'shapeblock'), 'titleHighlightColor')}
				{bg(__('Background', 'shapeblock'), 'titleBgColor', 'titleBgGradient')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				<Divider />
				{border(__('Border', 'shapeblock'), 'titleBorder')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'titleBorderRadius')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'titlePadding')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'titleMargin')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descriptionColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descriptionTypography')}
				<Divider />
				{border(__('Border', 'shapeblock'), 'descriptionBorder')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'descriptionPadding')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'descriptionMargin')}
			</PanelBody>

			<PanelBody title={__('Price', 'shapeblock')} initialOpen={false}>
				{color(__('Price Color', 'shapeblock'), 'priceColor')}
				{respTypo(__('Price Typography', 'shapeblock'), 'priceTypography')}
				<Divider />
				{respBox(__('Price Margin', 'shapeblock'), 'priceMargin')}
				<Divider />
				{color(__('Sale Price Color', 'shapeblock'), 'salePriceColor')}
				{respTypo(__('Sale Price Typography', 'shapeblock'), 'salePriceTypography')}
				{color(__('Regular (old) Price Color', 'shapeblock'), 'oldPriceColor')}
			</PanelBody>

			<PanelBody title={__('Period & Currency', 'shapeblock')} initialOpen={false}>
				{color(__('Period Color', 'shapeblock'), 'periodColor')}
				{respTypo(__('Period Typography', 'shapeblock'), 'periodTypography')}
				{respBox(__('Period Margin', 'shapeblock'), 'periodMargin')}
				<Divider />
				{color(__('Currency Color', 'shapeblock'), 'currencyColor')}
				{respTypo(__('Currency Typography', 'shapeblock'), 'currencyTypography')}
				{respBox(__('Currency Margin', 'shapeblock'), 'currencyMargin')}
				{num(__('Currency Vertical Position (px)', 'shapeblock'), 'currencyVerticalPosition')}
			</PanelBody>

			<PanelBody title={__('Features', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'featuresTextColor')}
				{respTypo(__('Text Typography', 'shapeblock'), 'featuresTextTypography')}
				<Divider />
				{border(__('Item Border', 'shapeblock'), 'featuresBorder')}
				<Divider />
				{respBox(__('Item Padding', 'shapeblock'), 'featuresPadding')}
				<Divider />
				{respBox(__('Item Margin', 'shapeblock'), 'featuresMargin')}
				<Divider />
				{respNum(__('Icon Gap (px)', 'shapeblock'), 'featuresIconGap')}
			</PanelBody>

			<PanelBody title={__('Feature Icon', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Icon', 'shapeblock')}
					value={attributes.featureIcon || 'check'}
					options={[
						{ label: __('Check', 'shapeblock'), value: 'check' },
						{ label: __('Check in a Circle', 'shapeblock'), value: 'check-circle' },
						{ label: __('Star', 'shapeblock'), value: 'star' },
						{ label: __('Arrow', 'shapeblock'), value: 'arrow' },
						{ label: __('Dot', 'shapeblock'), value: 'dot' },
						{ label: __('None', 'shapeblock'), value: 'none' },
					]}
					onChange={(v) => setAttributes({ featureIcon: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{'none' !== attributes.featureIcon && (
					<>
						<SelectControl
							label={__('Icon Style', 'shapeblock')}
							value={featureIconStyle}
							options={[
								{ label: __('Icon Only', 'shapeblock'), value: 'icon-only' },
								{ label: __('Icon with Background', 'shapeblock'), value: 'icon-bg' },
								{ label: __('Icon with Border', 'shapeblock'), value: 'icon-border' },
							]}
							onChange={(v) => setAttributes({ featureIconStyle: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<Divider />
						{color(__('Icon Color', 'shapeblock'), 'featuresIconColor')}
						{num(__('Icon Size (px)', 'shapeblock'), 'featureIconSize')}
						{featureIconStyle === 'icon-bg' && bg(__('Background', 'shapeblock'), 'featureIconBgColor', 'featureIconBgGradient')}
						{featureIconStyle === 'icon-border' && border(__('Border', 'shapeblock'), 'featureIconBorder')}
						{(featureIconStyle === 'icon-bg' || featureIconStyle === 'icon-border') && (
							<>
								<Divider />
								{respBox(__('Icon Padding', 'shapeblock'), 'featureIconPadding')}
								<Divider />
								{box(__('Icon Border Radius', 'shapeblock'), 'featureIconBorderRadius')}
							</>
						)}
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Full Width Button', 'shapeblock')} checked={!!attributes.buttonFullWidth} onChange={(v) => setAttributes({ buttonFullWidth: v })} __nextHasNoMarginBottom />
				<Divider />
				{color(__('Text Color', 'shapeblock'), 'buttonTextColor')}
				{bg(__('Background', 'shapeblock'), 'buttonBgColor', 'buttonBgGradient')}
				{respTypo(__('Typography', 'shapeblock'), 'buttonTypography')}
				<Divider />
				{border(__('Border', 'shapeblock'), 'buttonBorder')}
				{shadow(__('Box Shadow', 'shapeblock'), 'buttonBoxShadow')}
				<Divider />
				{color(__('Text Color (Hover)', 'shapeblock'), 'buttonTextColorHover')}
				{bg(__('Background (Hover)', 'shapeblock'), 'buttonBgColorHover', 'buttonBgGradientHover')}
				{border(__('Border (Hover)', 'shapeblock'), 'buttonBorderHover')}
				{shadow(__('Box Shadow (Hover)', 'shapeblock'), 'buttonBoxShadowHover')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'buttonBorderRadius')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'buttonPadding')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'buttonMargin')}
			</PanelBody>

			<PanelBody title={__('Text Under the Button', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'buttonSubtextColor')}
				{respTypo(__('Typography', 'shapeblock'), 'buttonSubtextTypography')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'buttonSubtextMargin')}
			</PanelBody>
		</>
	);

	// ---- The card: its ribbon, then the blocks in it ---------------------------
	const iconStyle = featureIconStyle || 'icon-only';
	const cardClass = [
		'shapeblock-pricing-table',
		isFeatured ? `featured ${ribbonStyle || 'style1'}` : '',
		'has-blocks',
		`has-feature-icon-${attributes.featureIcon || 'check'}`,
		'icon-bg' === iconStyle || 'icon-border' === iconStyle ? `has-feature-icon-box has-feature-${iconStyle}` : '',
		attributes.buttonFullWidth ? 'has-full-button' : '',
	].filter(Boolean).join(' ');
	const { children, ...cardProps } = useInnerBlocksProps({ className: cardClass }, { templateLock: false });

	const blockProps = useBlockProps({ className: `shapeblock-block shapeblock-pricing-table-block-wrap ${blockId}` });

	if (attributes.planPicker) {
		return (
			<div {...blockProps}>
				<Placeholder
					className="shapeblock-pricing-plan-picker"
					label={__('Pricing Table', 'shapeblock')}
					instructions={__('Pick a look, then how many plans. Each plan is a card you can edit like any other blocks.', 'shapeblock')}
				>
					<div className="shapeblock-pricing-style-picker">
						{STYLES.map((st) => (
							<button
								type="button"
								key={st.name}
								className={`shapeblock-pricing-style-option is-${st.name}${pickedStyle === st.name ? ' is-active' : ''}`}
								aria-pressed={pickedStyle === st.name}
								onClick={() => setPickedStyle(st.name)}
							>
								<span className="shapeblock-pricing-style-thumb" aria-hidden="true">
									<span className="t-title" />
									<span className="t-price" />
									<span className="t-line" />
									<span className="t-line" />
									<span className="t-line" />
									<span className="t-button" />
								</span>
								<span className="shapeblock-pricing-style-label">{st.label}</span>
							</button>
						))}
					</div>
					<div className="shapeblock-pricing-count">
						{[1, 2, 3, 4].map((n) => (
							<button type="button" key={n} className="shapeblock-pricing-count-option" onClick={() => createPlans(n)}>
								<span className="shapeblock-pricing-count-thumb" aria-hidden="true">
									{Array.from({ length: n }, (_, i) => <span key={i} />)}
								</span>
								{1 === n ? __('1 Plan', 'shapeblock') : sprintf(/* translators: %d: number of pricing plans. */ __('%d Plans', 'shapeblock'), n)}
							</button>
						))}
					</div>
				</Placeholder>
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || '' })}
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

			<div {...cardProps}>
				{isFeatured && (
					<RichText
						tagName="div"
						className={`shapeblock-ribbon shapeblock-${attributes.ribbonAlignment || 'right'}`}
						value={toHtml(attributes.featuredText)}
						onChange={(v) => setAttributes({ featuredText: v.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') })}
						allowedFormats={[]}
						placeholder={__('Featured', 'shapeblock')}
					/>
				)}
				{children}
			</div>

			<div className="shapeblock-pricing-styles" hidden>
				<ServerSideRender block="shapeblock/pricing-table" attributes={styleOnly} httpMethod="POST" />
			</div>
		</div>
	);
}
