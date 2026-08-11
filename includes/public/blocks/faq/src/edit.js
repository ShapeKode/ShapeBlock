import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import TypographyControls from '../../custom-components/TypographyControls';

import { buildFaqEditorCss } from './style-utils';

import './editor.scss';

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg') },
	{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg') },
	{ name: 'active', title: __('Active', 'easy-elements-for-gutenberg') },
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

const renderIcon = (iconClass, fallback) =>
	iconClass && iconClass !== 'none' ? (
		<i className={`eelfg-icon ${iconClass}`} aria-hidden="true" />
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
		enableSchema,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'eelfg-faq-' + clientId.slice(0, 6) });
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
			faqItems: [...items, { title: __('New question', 'easy-elements-for-gutenberg'), description: '', active: false }],
		});
	};

	const removeItem = (index) => {
		setAttributes({ faqItems: items.filter((_, i) => i !== index) });
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
		'eelfg-block',
		'eelfg-faq-block-wrap',
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

	return (
		<div {...blockProps}>
			<style>{editorCss}</style>

			<InspectorControls>
				<PanelBody title={__('Settings', 'easy-elements-for-gutenberg')} initialOpen={true}>
					<SelectControl
						label={__('Title HTML Tag', 'easy-elements-for-gutenberg')}
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
						label={__('Open Icon (expanded)', 'easy-elements-for-gutenberg')}
						value={iconOpen}
						onChange={(v) => setAttributes({ iconOpen: v })}
					/>
					<IconPicker
						label={__('Close Icon (collapsed)', 'easy-elements-for-gutenberg')}
						value={iconClose}
						onChange={(v) => setAttributes({ iconClose: v })}
					/>
					<SelectControl
						label={__('Icon Position', 'easy-elements-for-gutenberg')}
						value={iconPosition}
						options={[
							{ label: __('Right', 'easy-elements-for-gutenberg'), value: 'row' },
							{ label: __('Left', 'easy-elements-for-gutenberg'), value: 'row-reverse' },
						]}
						onChange={(v) => setAttributes({ iconPosition: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<Divider />
					<ToggleControl
						label={__('Open All FAQs by Default', 'easy-elements-for-gutenberg')}
						checked={openAll}
						onChange={(v) => setAttributes({ openAll: v })}
						__nextHasNoMarginBottom
					/>
					{openAll && (
						<ToggleControl
							label={__('Enable Sticky', 'easy-elements-for-gutenberg')}
							checked={enableSticky}
							onChange={(v) => setAttributes({ enableSticky: v })}
							__nextHasNoMarginBottom
						/>
					)}
					<ToggleControl
						label={__('Enable FAQ Schema', 'easy-elements-for-gutenberg')}
						help={__('Outputs FAQPage JSON-LD structured data.', 'easy-elements-for-gutenberg')}
						checked={enableSchema}
						onChange={(v) => setAttributes({ enableSchema: v })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Items', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel tabs={STATE_TABS}>
						{(tab) => (
							<>
								{tab.name === 'normal' && color(__('Background', 'easy-elements-for-gutenberg'), 'itemBackgroundColor')}
								{tab.name === 'hover' && color(__('Background', 'easy-elements-for-gutenberg'), 'itemBackgroundColorHover')}
								{tab.name === 'active' && color(__('Background', 'easy-elements-for-gutenberg'), 'itemBackgroundColorActive')}

								<BorderControl
									label={__('Border', 'easy-elements-for-gutenberg')}
									value={attributes[`itemBorder${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]}
									onChange={(v) =>
										setAttributes({
											[`itemBorder${tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active'}`]: v,
										})
									}
								/>
								<Divider />
								<BoxShadowControls
									label={__('Box Shadow', 'easy-elements-for-gutenberg')}
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
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.itemBorderRadius}
						onChange={(v) => setAttributes({ itemBorderRadius: v })}
					/>
					<Divider />
					<BoxControl
						label={__('Padding', 'easy-elements-for-gutenberg')}
						values={attributes.itemPadding}
						onChange={(v) => setAttributes({ itemPadding: v })}
					/>
					<Divider />
					<TextControl
						label={__('Items Space (gap px)', 'easy-elements-for-gutenberg')}
						type="number"
						value={attributes.itemsGap}
						onChange={(v) => setAttributes({ itemsGap: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Title', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TypographyControls
						label={__('Typography', 'easy-elements-for-gutenberg')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeKey="titleTypography"
					/>
					<TabPanel tabs={STATE_TABS}>
						{(tab) => (
							<>
								{tab.name === 'normal' && (
									<>
										{color(__('Color', 'easy-elements-for-gutenberg'), 'titleColor')}
										{color(__('Question Background', 'easy-elements-for-gutenberg'), 'titleBgColor')}
										<BorderControl
											label={__('Question Border', 'easy-elements-for-gutenberg')}
											value={attributes.titleBorder}
											onChange={(v) => setAttributes({ titleBorder: v })}
										/>
										<Divider />
										<BoxShadowControls
											label={__('Question Box Shadow', 'easy-elements-for-gutenberg')}
											value={attributes.titleBoxShadow}
											onChange={(v) => setAttributes({ titleBoxShadow: v })}
										/>
									</>
								)}
								{tab.name === 'hover' && (
									<>
										{color(__('Color', 'easy-elements-for-gutenberg'), 'titleColorHover')}
										{color(__('Question Background', 'easy-elements-for-gutenberg'), 'titleBgColorHover')}
										{color(__('Question Border Color', 'easy-elements-for-gutenberg'), 'titleBorderColorHover')}
										<BoxShadowControls
											label={__('Question Box Shadow', 'easy-elements-for-gutenberg')}
											value={attributes.titleBoxShadowHover}
											onChange={(v) => setAttributes({ titleBoxShadowHover: v })}
										/>
									</>
								)}
								{tab.name === 'active' && (
									<>
										{color(__('Color', 'easy-elements-for-gutenberg'), 'titleColorActive')}
										{color(__('Question Background', 'easy-elements-for-gutenberg'), 'titleBgColorActive')}
										{color(__('Question Border Color', 'easy-elements-for-gutenberg'), 'titleBorderColorActive')}
										<BoxShadowControls
											label={__('Question Box Shadow', 'easy-elements-for-gutenberg')}
											value={attributes.titleBoxShadowActive}
											onChange={(v) => setAttributes({ titleBoxShadowActive: v })}
										/>
									</>
								)}
							</>
						)}
					</TabPanel>
					<Divider />
					<BoxControl
						label={__('Question Padding', 'easy-elements-for-gutenberg')}
						values={attributes.questionPadding}
						onChange={(v) => setAttributes({ questionPadding: v })}
					/>
					<Divider />
					<BoxControl
						label={__('Question Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.questionBorderRadius}
						onChange={(v) => setAttributes({ questionBorderRadius: v })}
					/>
				</PanelBody>

				<PanelBody title={__('Description', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TypographyControls
						label={__('Typography', 'easy-elements-for-gutenberg')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeKey="descriptionTypography"
					/>
					<TabPanel tabs={STATE_TABS}>
						{(tab) => {
							const suffix = tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active';
							return (
								<>
									{color(__('Color', 'easy-elements-for-gutenberg'), `descriptionColor${suffix}`)}
									{color(__('Background', 'easy-elements-for-gutenberg'), `descriptionBgColor${suffix}`)}
									{tab.name === 'normal' ? (
										<BorderControl
											label={__('Border', 'easy-elements-for-gutenberg')}
											value={attributes.descriptionBorder}
											onChange={(v) => setAttributes({ descriptionBorder: v })}
										/>
									) : (
										color(__('Border Color', 'easy-elements-for-gutenberg'), `descriptionBorderColor${suffix}`)
									)}
								</>
							);
						}}
					</TabPanel>
					<Divider />
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.descriptionBorderRadius}
						onChange={(v) => setAttributes({ descriptionBorderRadius: v })}
					/>
					<Divider />
					<BoxControl
						label={__('Padding', 'easy-elements-for-gutenberg')}
						values={attributes.answerPadding}
						onChange={(v) => setAttributes({ answerPadding: v })}
					/>
				</PanelBody>

				<PanelBody title={__('Accordion Icon', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel tabs={STATE_TABS}>
						{(tab) => {
							const suffix = tab.name === 'normal' ? '' : tab.name === 'hover' ? 'Hover' : 'Active';
							return (
								<>
									{color(__('Color', 'easy-elements-for-gutenberg'), `iconColor${suffix}`)}
									{color(__('Background', 'easy-elements-for-gutenberg'), `iconBgColor${suffix}`)}
									{tab.name === 'normal' ? (
										<BorderControl
											label={__('Border', 'easy-elements-for-gutenberg')}
											value={attributes.iconBorder}
											onChange={(v) => setAttributes({ iconBorder: v })}
										/>
									) : (
										color(__('Border Color', 'easy-elements-for-gutenberg'), `iconBorderColor${suffix}`)
									)}
									{tab.name === 'normal' && (
										<TextControl
											label={__('Vertical Position (px)', 'easy-elements-for-gutenberg')}
											type="number"
											value={attributes.iconPositionY}
											onChange={(v) => setAttributes({ iconPositionY: v })}
											__next40pxDefaultSize
											__nextHasNoMarginBottom
										/>
									)}
									{tab.name === 'active' && (
										<TextControl
											label={__('Vertical Position (px)', 'easy-elements-for-gutenberg')}
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
						label={__('Icon Size (px)', 'easy-elements-for-gutenberg')}
						type="number"
						value={attributes.iconSize}
						onChange={(v) => setAttributes({ iconSize: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={__('Box Size (px)', 'easy-elements-for-gutenberg')}
						type="number"
						value={attributes.iconBoxSize}
						onChange={(v) => setAttributes({ iconBoxSize: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<Divider />
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.iconBorderRadius}
						onChange={(v) => setAttributes({ iconBorderRadius: v })}
					/>
				</PanelBody>
			</InspectorControls>

			<div className={`eelfg-faq-accordion${openAll ? ' eelfg-faq-open-all' : ''}${openAll && enableSticky ? ' eelfg-faq-sticky' : ''}`}>
				{items.map((item, index) => {
					const isOpen = openAll || openIndex === index;
					return (
						<div
							className={`eelfg-faq-item${isOpen ? ' active' : ''}${isOpen ? ' is-open' : ''}`}
							key={index}
						>
							<div className="eelfg-faq-editor-controls" contentEditable={false}>
								<Button
									icon={ICON_ARROW_UP}
									label={__('Move up', 'easy-elements-for-gutenberg')}
									onClick={() => moveItem(index, -1)}
									disabled={index === 0}
									size="small"
								/>
								<Button
									icon={ICON_ARROW_DOWN}
									label={__('Move down', 'easy-elements-for-gutenberg')}
									onClick={() => moveItem(index, 1)}
									disabled={index === items.length - 1}
									size="small"
								/>
								<Button
									icon={ICON_EYE}
									label={__('Active by default', 'easy-elements-for-gutenberg')}
									isPressed={!!item.active}
									onClick={() => updateItem(index, 'active', !item.active)}
									size="small"
								/>
								<Button
									icon={ICON_TRASH}
									label={__('Remove', 'easy-elements-for-gutenberg')}
									onClick={() => removeItem(index)}
									isDestructive
									size="small"
								/>
							</div>

							<div
								className="eelfg-faq-question"
								onClick={() => { if (!openAll) toggleOpen(index); }}
								style={!openAll ? { cursor: 'pointer' } : undefined}
							>
								<RichText
									tagName={TitleTag}
									className="eelfg-faq-title"
									value={item.title}
									onChange={(v) => updateItem(index, 'title', v)}
									placeholder={__('Add question…', 'easy-elements-for-gutenberg')}
									allowedFormats={['core/bold', 'core/italic', 'core/link']}
									onClick={(e) => e.stopPropagation()}
								/>
								{!openAll && (
									<button
										type="button"
										className="eelfg-faq-icon-toggle"
										aria-label={__('Toggle answer', 'easy-elements-for-gutenberg')}
										aria-expanded={isOpen}
										contentEditable={false}
										onClick={(e) => { e.stopPropagation(); toggleOpen(index); }}
									>
										<span className="eelfg-faq-icon eelfg-faq-icon-open">
											{renderIcon(iconOpen, ICON_MINUS)}
										</span>
										<span className="eelfg-faq-icon eelfg-faq-icon-close">
											{renderIcon(iconClose, ICON_PLUS)}
										</span>
									</button>
								)}
							</div>

							<RichText
								tagName="div"
								className="eelfg-faq-answer"
								value={item.description}
								onChange={(v) => updateItem(index, 'description', v)}
								placeholder={__('Add answer…', 'easy-elements-for-gutenberg')}
							/>
						</div>
					);
				})}
			</div>

			<div className="eelfg-faq-add-row" contentEditable={false}>
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>
					{__('Add Item', 'easy-elements-for-gutenberg')}
				</Button>
			</div>
		</div>
	);
}
