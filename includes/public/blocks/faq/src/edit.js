import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls, BlockControls, RichText } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	Button,
	TabPanel,
	ToolbarDropdownMenu,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import { buildFaqEditorCss } from './style-utils';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock') },
	{ name: 'hover', title: __('Hover', 'shapeblock') },
	{ name: 'active', title: __('Active', 'shapeblock') },
];

const ICON_MINUS = (
	<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 11h14v2H5z" />
	</svg>
);
const ICON_PLUS = (
	<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
	</svg>
);

// Inline SVG icons for the editor item controls (avoids depending on the
// dashicons font, which is not loaded inside the editor iframe canvas).
const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_ARROW_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_ARROW_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_EYE = SVG('M12 6c-4.4 0-7.6 3.4-9 6 1.4 2.6 4.6 6 9 6s7.6-3.4 9-6c-1.4-2.6-4.6-6-9-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6.2c-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2-1-2.2-2.2-2.2z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');

const renderIcon = (iconClass, fallback) =>
	iconClass && iconClass !== 'none' ? (
		<i className={`shapeblock-icon ${iconClass}`} aria-hidden="true" />
	) : (
		fallback
	);

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		faqItems,
		titleTag,
		iconOpen,
		iconClose,
		iconPosition,
		openAll,
		enableSticky,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-faq-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(faqItems) ? faqItems : [];

	// Editor-side accordion state (single-open, mirrors the front end). Seeded
	// from whichever item is "active by default".
	const [openIndex, setOpenIndex] = useState(() => {
		const idx = (Array.isArray(faqItems) ? faqItems : []).findIndex((i) => i && i.active);
		return idx >= 0 ? idx : null;
	});

	const toggleOpen = (index) => setOpenIndex((cur) => (cur === index ? null : index));

	const updateItem = (index, key, value) => {
		setAttributes({
			faqItems: items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
		});
	};

	const addItem = () => {
		setAttributes({
			faqItems: [...items, { title: __('New question', 'shapeblock'), description: '', active: false }],
		});
	};

	const removeItem = (index) => {
		setAttributes({ faqItems: items.filter((_, i) => i !== index) });
	};
	// Deep copy, so the clone's nested objects are not shared with the original.
	const duplicateItem = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ faqItems: next });
	};

	const moveItem = (index, dir) => {
		const target = index + dir;
		if (target < 0 || target >= items.length) {
			return;
		}
		const next = items.slice();
		const [moved] = next.splice(index, 1);
		next.splice(target, 0, moved);
		setAttributes({ faqItems: next });
	};

	const TitleTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].includes(titleTag)
		? titleTag
		: 'h4';

	const editorCss = buildFaqEditorCss(attributes);

	const wrapperClass = [
		'shapeblock-block',
		'shapeblock-faq-block-wrap',
		blockId,
		openAll ? 'is-open-all' : '',
	]
		.filter(Boolean)
		.join(' ');

	const blockProps = useBlockProps({ className: wrapperClass });

	// Small reusable color row for the tabbed style panels.
	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
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

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('General', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Title HTML Tag', 'shapeblock')}
				value={titleTag}
				options={[
					{ label: 'H1', value: 'h1' },
					{ label: 'H2', value: 'h2' },
					{ label: 'H3', value: 'h3' },
					{ label: 'H4', value: 'h4' },
					{ label: 'H5', value: 'h5' },
					{ label: 'H6', value: 'h6' },
					{ label: 'div', value: 'div' },
					{ label: 'span', value: 'span' },
					{ label: 'p', value: 'p' },
				]}
				onChange={(v) => setAttributes({ titleTag: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			<IconPicker
				label={__('Open Icon (expanded)', 'shapeblock')}
				value={iconOpen}
				onChange={(v) => setAttributes({ iconOpen: v })}
			/>
			<IconPicker
				label={__('Close Icon (collapsed)', 'shapeblock')}
				value={iconClose}
				onChange={(v) => setAttributes({ iconClose: v })}
			/>
			<SelectControl
				label={__('Icon Position', 'shapeblock')}
				value={iconPosition}
				options={[
					{ label: __('Right', 'shapeblock'), value: 'row' },
					{ label: __('Left', 'shapeblock'), value: 'row-reverse' },
				]}
				onChange={(v) => setAttributes({ iconPosition: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			<ToggleControl
				label={__('Open All FAQs by Default', 'shapeblock')}
				checked={openAll}
				onChange={(v) => setAttributes({ openAll: v })}
				__nextHasNoMarginBottom
			/>
			{openAll && (
				<ToggleControl
					label={__('Enable Sticky', 'shapeblock')}
					checked={enableSticky}
					onChange={(v) => setAttributes({ enableSticky: v })}
					__nextHasNoMarginBottom
				/>
			)}
		</PanelBody>
	);

	// --- Tab 2: Layout (spacing) ----------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={true}>
			{respNum(__('Items Space (gap px)', 'shapeblock'), 'itemsGap')}
			<Divider />
			{respBox(__('Item Padding', 'shapeblock'), 'itemPadding')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Items', 'shapeblock')} initialOpen={true}>
				<TabPanel tabs={STATE_TABS}>
					{(tab) => (
						<>
							{tab.name === 'normal' && color(__('Background', 'shapeblock'), 'itemBackgroundColor')}
							{tab.name === 'hover' && color(__('Background', 'shapeblock'), 'itemBackgroundColorHover')}
							{tab.name === 'active' && color(__('Background', 'shapeblock'), 'itemBackgroundColorActive')}

							<BorderControl
								label={__('Border', 'shapeblock')}
								value={attributes[`itemBorder${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]}
								onChange={(v) =>
									setAttributes({
										[`itemBorder${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]: v,
									})
								}
							/>
							<Divider />
							<BoxShadowControls
								label={__('Box Shadow', 'shapeblock')}
								value={attributes[`itemBoxShadow${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]}
								onChange={(v) =>
									setAttributes({
										[`itemBoxShadow${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]: v,
									})
								}
							/>
						</>
					)}
				</TabPanel>
				<Divider />
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.itemBorderRadius}
					onChange={(v) => setAttributes({ itemBorderRadius: v })}
				/>
			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				<TabPanel tabs={STATE_TABS}>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{color(__('Color', 'shapeblock'), 'titleColor')}
									{color(__('Question Background', 'shapeblock'), 'titleBgColor')}
									<BorderControl
										label={__('Question Border', 'shapeblock')}
										value={attributes.titleBorder}
										onChange={(v) => setAttributes({ titleBorder: v })}
									/>
									<Divider />
									<BoxShadowControls
										label={__('Question Box Shadow', 'shapeblock')}
										value={attributes.titleBoxShadow}
										onChange={(v) => setAttributes({ titleBoxShadow: v })}
									/>
								</>
							)}
							{tab.name === 'hover' && (
								<>
									{color(__('Color', 'shapeblock'), 'titleColorHover')}
									{color(__('Question Background', 'shapeblock'), 'titleBgColorHover')}
									{color(__('Question Border Color', 'shapeblock'), 'titleBorderColorHover')}
									<BoxShadowControls
										label={__('Question Box Shadow', 'shapeblock')}
										value={attributes.titleBoxShadowHover}
										onChange={(v) => setAttributes({ titleBoxShadowHover: v })}
									/>
								</>
							)}
							{tab.name === 'active' && (
								<>
									{color(__('Color', 'shapeblock'), 'titleColorActive')}
									{color(__('Question Background', 'shapeblock'), 'titleBgColorActive')}
									{color(__('Question Border Color', 'shapeblock'), 'titleBorderColorActive')}
									<BoxShadowControls
										label={__('Question Box Shadow', 'shapeblock')}
										value={attributes.titleBoxShadowActive}
										onChange={(v) => setAttributes({ titleBoxShadowActive: v })}
									/>
								</>
							)}
						</>
					)}
				</TabPanel>
				<Divider />
				{respBox(__('Question Padding', 'shapeblock'), 'questionPadding')}
				<Divider />
				<BoxControl
					label={__('Question Border Radius', 'shapeblock')}
					values={attributes.questionBorderRadius}
					onChange={(v) => setAttributes({ questionBorderRadius: v })}
				/>
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'descriptionTypography')}
				<TabPanel tabs={STATE_TABS}>
					{(tab) => {
						const suffix = tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active';
						return (
							<>
								{color(__('Color', 'shapeblock'), `descriptionColor${suffix}`)}
								{color(__('Background', 'shapeblock'), `descriptionBgColor${suffix}`)}
								{tab.name === 'normal' ? (
									<BorderControl
										label={__('Border', 'shapeblock')}
										value={attributes.descriptionBorder}
										onChange={(v) => setAttributes({ descriptionBorder: v })}
									/>
								) : (
									color(__('Border Color', 'shapeblock'), `descriptionBorderColor${suffix}`)
								)}
							</>
						);
					}}
				</TabPanel>
				<Divider />
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.descriptionBorderRadius}
					onChange={(v) => setAttributes({ descriptionBorderRadius: v })}
				/>
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'answerPadding')}
			</PanelBody>

			<PanelBody title={__('Accordion Icon', 'shapeblock')} initialOpen={false}>
				<TabPanel tabs={STATE_TABS}>
					{(tab) => {
						const suffix = tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active';
						return (
							<>
								{color(__('Color', 'shapeblock'), `iconColor${suffix}`)}
								{color(__('Background', 'shapeblock'), `iconBgColor${suffix}`)}
								{tab.name === 'normal' ? (
									<BorderControl
										label={__('Border', 'shapeblock')}
										value={attributes.iconBorder}
										onChange={(v) => setAttributes({ iconBorder: v })}
									/>
								) : (
									color(__('Border Color', 'shapeblock'), `iconBorderColor${suffix}`)
								)}
								{tab.name === 'normal' && (
									<TextControl
										label={__('Vertical Position (px)', 'shapeblock')}
										type="number"
										value={attributes.iconPositionY}
										onChange={(v) => setAttributes({ iconPositionY: v })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								)}
								{tab.name === 'active' && (
									<TextControl
										label={__('Vertical Position (px)', 'shapeblock')}
										type="number"
										value={attributes.iconPositionYActive}
										onChange={(v) => setAttributes({ iconPositionYActive: v })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								)}
							</>
						);
					}}
				</TabPanel>
				<Divider />
				<TextControl
					label={__('Icon Size (px)', 'shapeblock')}
					type="number"
					value={attributes.iconSize}
					onChange={(v) => setAttributes({ iconSize: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={__('Box Size (px)', 'shapeblock')}
					type="number"
					value={attributes.iconBoxSize}
					onChange={(v) => setAttributes({ iconBoxSize: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<Divider />
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.iconBorderRadius}
					onChange={(v) => setAttributes({ iconBorderRadius: v })}
				/>
			</PanelBody>
		</>
	);

	return (
		<div {...blockProps}>
			<style>{editorCss}</style>

			<BlockControls>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(titleTag || 'h4').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].map((t) => ({
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
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<div className={`shapeblock-faq-accordion${openAll ? ' shapeblock-faq-open-all' : ''}${openAll && enableSticky ? ' shapeblock-faq-sticky' : ''}`}>
				{items.map((item, index) => {
					const isOpen = openAll || openIndex === index;
					return (
						<div
							className={`shapeblock-faq-item${isOpen ? ' active' : ''}${isOpen ? ' is-open' : ''}`}
							key={index}
						>
							<div className="shapeblock-faq-editor-controls" contentEditable={false}>
								<Button
									icon={ICON_ARROW_UP}
									label={__('Move up', 'shapeblock')}
									onClick={() => moveItem(index, -1)}
									disabled={index === 0}
									size="small"
								/>
								<Button
									icon={ICON_ARROW_DOWN}
									label={__('Move down', 'shapeblock')}
									onClick={() => moveItem(index, 1)}
									disabled={index === items.length - 1}
									size="small"
								/>
								<Button
									icon={ICON_EYE}
									label={__('Active by default', 'shapeblock')}
									isPressed={!!item.active}
									onClick={() => updateItem(index, 'active', !item.active)}
									size="small"
								/>
								<Button
									icon={ICON_COPY}
									label={__('Duplicate', 'shapeblock')}
									onClick={() => duplicateItem(index)}
									size="small"
								/>
								<Button
									icon={ICON_TRASH}
									label={__('Remove', 'shapeblock')}
									onClick={() => removeItem(index)}
									isDestructive
									size="small"
								/>
							</div>

							<div
								className="shapeblock-faq-question"
								onClick={() => { if (!openAll) toggleOpen(index); }}
								style={!openAll ? { cursor: 'pointer' } : undefined}
							>
								<RichText
									tagName={TitleTag}
									className="shapeblock-faq-title"
									value={item.title}
									onChange={(v) => updateItem(index, 'title', v)}
									placeholder={__('Add question…', 'shapeblock')}
									allowedFormats={['core/bold', 'core/italic', 'core/link']}
									onClick={(e) => e.stopPropagation()}
								/>
								{!openAll && (
									<button
										type="button"
										className="shapeblock-faq-icon-toggle"
										aria-label={__('Toggle answer', 'shapeblock')}
										aria-expanded={isOpen}
										contentEditable={false}
										onClick={(e) => { e.stopPropagation(); toggleOpen(index); }}
									>
										<span className="shapeblock-faq-icon shapeblock-faq-icon-open">
											{renderIcon(iconOpen, ICON_MINUS)}
										</span>
										<span className="shapeblock-faq-icon shapeblock-faq-icon-close">
											{renderIcon(iconClose, ICON_PLUS)}
										</span>
									</button>
								)}
							</div>

							<RichText
								tagName="div"
								className="shapeblock-faq-answer"
								value={item.description}
								onChange={(v) => updateItem(index, 'description', v)}
								placeholder={__('Add answer…', 'shapeblock')}
							/>
						</div>
					);
				})}
			</div>

			<div className="shapeblock-faq-add-row" contentEditable={false}>
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>
					{__('Add Item', 'shapeblock')}
				</Button>
			</div>
		</div>
	);
}
