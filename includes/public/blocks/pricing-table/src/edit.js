import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_ARROW_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_ARROW_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');

const ALIGN_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		skinStyle,
		title,
		description,
		onSale,
		regularPrice,
		salePrice,
		price,
		currency,
		currencyPlacement,
		period,
		separator,
		featuresDescription,
		features,
		featureIconStyle,
		isFeatured,
		ribbonStyle,
		featuredText,
		showButton,
		buttonText,
		buttonSubtext,
		buttonUrl,
		buttonTarget,
		buttonNofollow,
		buttonIcon,
		buttonIconPosition,
		buttonPosition,
		buttonFullWidth,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-pricing-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

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

	const items = Array.isArray(features) ? features : [];

	const updateFeature = (index, key, value) => {
		setAttributes({ features: items.map((it, i) => (i === index ? { ...it, [key]: value } : it)) });
	};
	const addFeature = () => {
		setAttributes({ features: [...items, { icon: '', text: __('New feature', 'shapeblock') }] });
	};
	const removeFeature = (index) => {
		setAttributes({ features: items.filter((_, i) => i !== index) });
	};
	// Deep copy, so the clone's nested values are not shared with the original.
	const duplicateFeature = (index) => {
		const next = items.slice();
		next.splice(index + 1, 0, JSON.parse(JSON.stringify(items[index])));
		setAttributes({ features: next });
	};
	const moveFeature = (index, dir) => {
		const target = index + dir;
		if (target < 0 || target >= items.length) return;
		const next = items.slice();
		const [moved] = next.splice(index, 1);
		next.splice(target, 0, moved);
		setAttributes({ features: next });
	};

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const typo = (label, key) => (
		<TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />
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

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('General', 'shapeblock')} initialOpen={true}>
				<SelectControl
					label={__('Skin', 'shapeblock')}
					value={skinStyle}
					options={[
						{ label: __('Skin 01', 'shapeblock'), value: 'skin1' },
					]}
					onChange={(v) => setAttributes({ skinStyle: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Title & Price', 'shapeblock')} initialOpen={false}>
				<TextControl label={__('Title', 'shapeblock')} value={title} onChange={(v) => setAttributes({ title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Description', 'shapeblock')} value={description} onChange={(v) => setAttributes({ description: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<Divider />
				<ToggleControl label={__('On Sale?', 'shapeblock')} checked={onSale} onChange={(v) => setAttributes({ onSale: v })} __nextHasNoMarginBottom />
				{onSale ? (
					<>
						<TextControl label={__('Regular Price', 'shapeblock')} value={regularPrice} onChange={(v) => setAttributes({ regularPrice: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Sale Price', 'shapeblock')} value={salePrice} onChange={(v) => setAttributes({ salePrice: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					</>
				) : (
					<TextControl label={__('Price', 'shapeblock')} value={price} onChange={(v) => setAttributes({ price: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
				<Divider />
				<TextControl label={__('Currency', 'shapeblock')} value={currency} onChange={(v) => setAttributes({ currency: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl
					label={__('Currency Position', 'shapeblock')}
					value={currencyPlacement}
					options={[
						{ label: __('Left', 'shapeblock'), value: 'left' },
						{ label: __('Right', 'shapeblock'), value: 'right' },
					]}
					onChange={(v) => setAttributes({ currencyPlacement: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<TextControl label={__('Period', 'shapeblock')} value={period} onChange={(v) => setAttributes({ period: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Separator', 'shapeblock')} value={separator} onChange={(v) => setAttributes({ separator: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Features', 'shapeblock')} initialOpen={false}>
				<TextareaControl
					label={__('Features Description (top)', 'shapeblock')}
					value={featuresDescription}
					onChange={(v) => setAttributes({ featuresDescription: v })}
					__nextHasNoMarginBottom
				/>
				<Divider />
				{items.map((item, index) => (
					<div className="shapeblock-pricing-repeater-item" key={index}>
						<div className="shapeblock-pricing-repeater-head">
							<strong>#{index + 1}</strong>
							<div>
								<Button icon={ICON_ARROW_UP} label={__('Move up', 'shapeblock')} onClick={() => moveFeature(index, -1)} disabled={index === 0} size="small" />
								<Button icon={ICON_ARROW_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveFeature(index, 1)} disabled={index === items.length - 1} size="small" />
								<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateFeature(index)} size="small" />
								<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeFeature(index)} isDestructive size="small" />
							</div>
						</div>
						<TextControl
							label={__('Text', 'shapeblock')}
							value={item.text || ''}
							onChange={(v) => updateFeature(index, 'text', v)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<IconPicker
							label={__('Icon', 'shapeblock')}
							value={item.icon || ''}
							onChange={(v) => updateFeature(index, 'icon', v)}
						/>
					</div>
				))}
				<Button variant="primary" onClick={addFeature} icon={ICON_ADD}>
					{__('Add Feature', 'shapeblock')}
				</Button>
				<Divider />
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
			</PanelBody>

			<PanelBody title={__('Featured', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Featured', 'shapeblock')} checked={isFeatured} onChange={(v) => setAttributes({ isFeatured: v })} __nextHasNoMarginBottom />
				{isFeatured && (
					<>
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
						<TextControl label={__('Featured Text', 'shapeblock')} value={featuredText} onChange={(v) => setAttributes({ featuredText: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Show Button', 'shapeblock')} checked={showButton} onChange={(v) => setAttributes({ showButton: v })} __nextHasNoMarginBottom />
				{showButton && (
					<>
						<TextControl label={__('Text', 'shapeblock')} value={buttonText} onChange={(v) => setAttributes({ buttonText: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Bottom Text', 'shapeblock')} value={buttonSubtext} onChange={(v) => setAttributes({ buttonSubtext: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Link URL', 'shapeblock')} type="url" value={buttonUrl} onChange={(v) => setAttributes({ buttonUrl: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={buttonTarget} onChange={(v) => setAttributes({ buttonTarget: v })} __nextHasNoMarginBottom />
						<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={buttonNofollow} onChange={(v) => setAttributes({ buttonNofollow: v })} __nextHasNoMarginBottom />
						<Divider />
						<IconPicker label={__('Icon', 'shapeblock')} value={buttonIcon} onChange={(v) => setAttributes({ buttonIcon: v })} />
					</>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (alignment & positioning) ------------------------------
	const layoutTab = (
		<PanelBody title={__('Positioning', 'shapeblock')} initialOpen={true}>
			{respAlign(__('Header Alignment', 'shapeblock'), 'headerAlignment', ALIGN_OPTIONS)}
			<Divider />
			{respAlign(__('Features Alignment', 'shapeblock'), 'featureTextAlignment', ALIGN_OPTIONS)}
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
			{showButton && (
				<>
					<Divider />
					<SelectControl
						label={__('Button Position', 'shapeblock')}
						value={buttonPosition}
						options={[
							{ label: __('After Features', 'shapeblock'), value: 'after_features' },
							{ label: __('Before Features', 'shapeblock'), value: 'in_features' },
						]}
						onChange={(v) => setAttributes({ buttonPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Icon Position', 'shapeblock')}
						value={buttonIconPosition}
						options={[
							{ label: __('Before', 'shapeblock'), value: 'before' },
							{ label: __('After', 'shapeblock'), value: 'after' },
						]}
						onChange={(v) => setAttributes({ buttonIconPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{respAlign(__('Button Alignment', 'shapeblock'), 'btnAlignment', ALIGN_OPTIONS)}
					<ToggleControl label={__('Full Width Button', 'shapeblock')} checked={buttonFullWidth} onChange={(v) => setAttributes({ buttonFullWidth: v })} __nextHasNoMarginBottom />
				</>
			)}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Title', 'shapeblock')} initialOpen={true}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{color(__('Highlight Color (span)', 'shapeblock'), 'titleHighlightColor')}
				{color(__('Background', 'shapeblock'), 'titleBgColor')}
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
				{onSale && (
					<>
						<Divider />
						{color(__('Sale Price Color', 'shapeblock'), 'salePriceColor')}
						{respTypo(__('Sale Price Typography', 'shapeblock'), 'salePriceTypography')}
						{color(__('Regular (old) Price Color', 'shapeblock'), 'oldPriceColor')}
					</>
				)}
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

			<PanelBody title={__('Features Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'featuresDescriptionColor')}
				{respTypo(__('Typography', 'shapeblock'), 'featuresDescriptionTypography')}
				<Divider />
				{border(__('Border', 'shapeblock'), 'featuresDescriptionBorder')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'featuresDescriptionPadding')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'featuresDescriptionMargin')}
			</PanelBody>

			<PanelBody title={__('Features', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'featuresTextColor')}
				{color(__('Icon Color', 'shapeblock'), 'featuresIconColor')}
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
				{num(__('Icon Size (px)', 'shapeblock'), 'featureIconSize')}
				{featureIconStyle === 'icon-bg' && color(__('Background', 'shapeblock'), 'featureIconBgColor')}
				{featureIconStyle === 'icon-border' && border(__('Border', 'shapeblock'), 'featureIconBorder')}
				{(featureIconStyle === 'icon-bg' || featureIconStyle === 'icon-border') && (
					<>
						<Divider />
						{respBox(__('Icon Padding', 'shapeblock'), 'featureIconPadding')}
						<Divider />
						{box(__('Icon Border Radius', 'shapeblock'), 'featureIconBorderRadius')}
					</>
				)}
			</PanelBody>

			{isFeatured && (
				<PanelBody title={__('Ribbon', 'shapeblock')} initialOpen={false}>
					{color(__('Text Color', 'shapeblock'), 'ribbonColor')}
					{color(__('Background Color', 'shapeblock'), 'ribbonBgColor')}
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

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'buttonTextColor')}
				{color(__('Icon Color', 'shapeblock'), 'buttonIconColor')}
				{color(__('Background', 'shapeblock'), 'buttonBgColor')}
				{respTypo(__('Typography', 'shapeblock'), 'buttonTypography')}
				<Divider />
				{border(__('Border', 'shapeblock'), 'buttonBorder')}
				{shadow(__('Box Shadow', 'shapeblock'), 'buttonBoxShadow')}
				<Divider />
				{color(__('Text Color (Hover)', 'shapeblock'), 'buttonTextColorHover')}
				{color(__('Background (Hover)', 'shapeblock'), 'buttonBgColorHover')}
				{border(__('Border (Hover)', 'shapeblock'), 'buttonBorderHover')}
				{shadow(__('Box Shadow (Hover)', 'shapeblock'), 'buttonBoxShadowHover')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'buttonBorderRadius')}
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'buttonPadding')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'buttonMargin')}
				<Divider />
				{respNum(__('Icon Spacing (px)', 'shapeblock'), 'buttonIconSpacing')}
			</PanelBody>

			<PanelBody title={__('Button Subtext', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'buttonSubtextColor')}
				{respTypo(__('Typography', 'shapeblock'), 'buttonSubtextTypography')}
				<Divider />
				{respBox(__('Margin', 'shapeblock'), 'buttonSubtextMargin')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || (dev === 'desktop' ? 'left' : '') })}
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

			<ServerSideRender block="shapeblock/pricing-table" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
