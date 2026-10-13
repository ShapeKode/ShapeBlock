import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import ServerSideRender from '../../custom-components/ServerRender';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	RangeControl,
	BoxControl,
	Button,
	TabPanel,
	ToolbarDropdownMenu,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import SpacingControl from '../../custom-components/SpacingControl';
import AdvancedControls from '../../custom-components/AdvancedControls';

import './editor.scss';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. stickyTopTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');
const ICON_CARET = SVG('M7 10l5 5 5-5z');
const ICON_ALIGN_LEFT = SVG('M4 19h16v-2H4v2zm0-6h10v-2H4v2zm0-8v2h16V5H4z');
const ICON_ALIGN_CENTER = SVG('M4 19h16v-2H4v2zm3-6h10v-2H7v2zM4 5v2h16V5H4z');
const ICON_ALIGN_RIGHT = SVG('M4 19h16v-2H4v2zm6-6h10v-2H10v2zM4 5v2h16V5H4z');

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
	{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
];

const TITLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'];

const blankCard = (n) => ({
	number: String(n).padStart(2, '0'),
	icon: '',
	title: __('New card', 'shapeblock'),
	desc: '',
	points: '',
	imageId: 0,
	imageUrl: '',
	imageAlt: '',
	btnText: '',
	btnUrl: '',
	btnNewTab: false,
	badgeBg: '',
	badgeBgGradient: '',
});
const clone = (v) => JSON.parse(JSON.stringify(v));

// Move an element of an array one place; returns a new array.
const moved = (arr, i, dir) => {
	const t = i + dir;
	if (t < 0 || t >= arr.length) return arr;
	const next = arr.slice();
	const [m] = next.splice(i, 1);
	next.splice(t, 0, m);
	return next;
};

// A stored length such as "90px" or "90" -> the number for a slider.
const toNumber = (v) => {
	const n = parseFloat(v);
	return Number.isNaN(n) ? undefined : n;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, cards, depthEffect } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-ss-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// The editor's preview device, so the toolbar edits the matching per-device value.
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = getKey('contentAlign', dev);

	const list = Array.isArray(cards) ? cards : [];
	// Which card is expanded in the sidebar (accordion). null = none.
	const [openCard, setOpenCard] = useState(0);

	// Two updates can arrive in one click (a colour picked, the gradient cleared), so each one
	// builds on the latest list rather than the one this render started with.
	const latestCards = useRef(list);
	latestCards.current = list;
	const setCards = (next) => {
		latestCards.current = next;
		setAttributes({ cards: next });
	};
	const updateCard = (i, patch) => setCards(latestCards.current.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
	const addCard = () => {
		setCards([...list, blankCard(list.length + 1)]);
		setOpenCard(list.length);
	};
	const removeCard = (i) => setCards(list.filter((_, idx) => idx !== i));
	const duplicateCard = (i) => {
		const next = list.slice();
		next.splice(i + 1, 0, clone(list[i]));
		setCards(next);
	};
	const moveCard = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= list.length) return;
		setCards(moved(list, i, dir));
		setOpenCard(t);
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	// Responsive spacing (padding) - clean 4-side control per device.
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => (
				<SpacingControl
					values={attributes[getKey(base, d)]}
					onChange={(v) => setAttributes({ [getKey(base, d)]: v })}
				/>
			)}
		</ResponsiveWrapper>
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(d) => (
				<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, d)} />
			)}
		</ResponsiveWrapper>
	);
	// Responsive slider, stored as a plain number string per device; render.php adds the unit.
	const num = (label, key, max = 100, min = 0) => (
		<ResponsiveWrapper label={label}>
			{(d) => {
				const k = getKey(key, d);
				return (
					<RangeControl
						value={toNumber(attributes[k])}
						onChange={(v) => setAttributes({ [k]: v == null ? '' : String(v) })}
						min={min}
						max={max}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);
	// Plain (not per-device) slider.
	const single = (label, key, max = 100, min = 0, step = 1) => (
		<RangeControl
			label={label}
			value={toNumber(attributes[key])}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={min}
			max={max}
			step={step}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	const toggle = (label, key) => (
		<ToggleControl label={label} checked={attributes[key] !== false} onChange={(v) => setAttributes({ [key]: v })} __nextHasNoMarginBottom />
	);

	// --- Tab 1: Settings (content / behaviour) --------------------------------
	const renderCard = (card, i) => {
		const open = openCard === i;
		return (
			<div className="shapeblock-ss-repeater-item" key={i}>
				<button
					type="button"
					className="shapeblock-ss-repeater-toggle"
					onClick={() => setOpenCard(open ? null : i)}
					aria-expanded={open}
				>
					<span className="shapeblock-ss-num">{card.number || i + 1}</span>
					<strong>{card.title || `${__('Card', 'shapeblock')} ${i + 1}`}</strong>
					<span className="shapeblock-ss-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
				</button>
				{open && (
					<div className="shapeblock-ss-repeater-body">
						<TextControl label={__('Number / Label', 'shapeblock')} value={card.number || ''} onChange={(v) => updateCard(i, { number: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<IconPicker label={__('Icon', 'shapeblock')} value={card.icon || ''} onChange={(v) => updateCard(i, { icon: v })} />
						<TextControl label={__('Title', 'shapeblock')} value={card.title || ''} onChange={(v) => updateCard(i, { title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextareaControl label={__('Description', 'shapeblock')} value={card.desc || ''} onChange={(v) => updateCard(i, { desc: v })} __nextHasNoMarginBottom />
						<TextareaControl
							label={__('Points', 'shapeblock')}
							help={__('One point per line.', 'shapeblock')}
							value={card.points || ''}
							onChange={(v) => updateCard(i, { points: v })}
							__nextHasNoMarginBottom
						/>

						<div className="shapeblock-ss-subhead">{__('Image', 'shapeblock')}</div>
						{card.imageUrl ? <img className="shapeblock-ss-image-preview" src={card.imageUrl} alt="" /> : null}
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={['image']}
								value={card.imageId || undefined}
								onSelect={(m) => updateCard(i, { imageId: m.id || 0, imageUrl: m.url || '', imageAlt: card.imageAlt || m.alt || '' })}
								render={({ open: openMedia }) => (
									<div className="shapeblock-ss-repeater-actions" style={{ justifyContent: 'flex-start' }}>
										<Button variant="secondary" onClick={openMedia}>
											{card.imageUrl ? __('Replace image', 'shapeblock') : __('Select image', 'shapeblock')}
										</Button>
										{card.imageUrl ? (
											<Button variant="tertiary" isDestructive onClick={() => updateCard(i, { imageId: 0, imageUrl: '', imageAlt: '' })}>
												{__('Remove', 'shapeblock')}
											</Button>
										) : null}
									</div>
								)}
							/>
						</MediaUploadCheck>
						{card.imageUrl ? (
							<TextControl label={__('Image alt text', 'shapeblock')} value={card.imageAlt || ''} onChange={(v) => updateCard(i, { imageAlt: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						) : null}

						<div className="shapeblock-ss-subhead">{__('Button', 'shapeblock')}</div>
						<TextControl label={__('Button text', 'shapeblock')} value={card.btnText || ''} onChange={(v) => updateCard(i, { btnText: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<TextControl label={__('Button link', 'shapeblock')} value={card.btnUrl || ''} onChange={(v) => updateCard(i, { btnUrl: v })} placeholder="https://" __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl label={__('Open in a new tab', 'shapeblock')} checked={!!card.btnNewTab} onChange={(v) => updateCard(i, { btnNewTab: v })} __nextHasNoMarginBottom />

						<div className="shapeblock-ss-subhead">{__('Number badge', 'shapeblock')}</div>
						<BackgroundControl
							label={__('Badge background (this card)', 'shapeblock')}
							colorValue={card.badgeBg || ''}
							gradientValue={card.badgeBgGradient || ''}
							onColorChange={(v) => updateCard(i, { badgeBg: v && typeof v === 'object' ? v.hex : v || '' })}
							onGradientChange={(v) => updateCard(i, { badgeBgGradient: v || '' })}
						/>

						<Divider />
						<div className="shapeblock-ss-repeater-actions">
							<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveCard(i, -1)} disabled={i === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveCard(i, 1)} disabled={i === list.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateCard(i)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeCard(i)} isDestructive size="small" />
						</div>
					</div>
				)}
			</div>
		);
	};

	const settingsTab = (
		<>
			<PanelBody title={__('Cards', 'shapeblock')} initialOpen={true}>
				{list.map(renderCard)}
				<Button variant="primary" onClick={addCard} icon={ICON_ADD}>{__('Add Card', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Stacking', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Stack on', 'shapeblock')}
					value={attributes.stackOn}
					options={[
						{ label: __('Desktop, tablet and mobile', 'shapeblock'), value: 'all' },
						{ label: __('Desktop and tablet', 'shapeblock'), value: 'desktop-tablet' },
						{ label: __('Desktop only', 'shapeblock'), value: 'desktop' },
					]}
					onChange={(v) => setAttributes({ stackOn: v })}
					help={__('On other screens the cards simply follow each other.', 'shapeblock')}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{num(__('Distance from top (px)', 'shapeblock'), 'stickyTop', 300)}
				{num(__('Step between cards (px)', 'shapeblock'), 'stepOffset', 80)}
				<p className="shapeblock-ss-hint">
					{__('Sticky stacking needs every parent block to leave overflow alone. If the cards do not stick, check the parent Row or Group.', 'shapeblock')}
				</p>
			</PanelBody>

			<PanelBody title={__('Depth Effect', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Shrink and dim the cards underneath', 'shapeblock')}
					checked={depthEffect !== false}
					onChange={(v) => setAttributes({ depthEffect: v })}
					__nextHasNoMarginBottom
				/>
				{depthEffect !== false && (
					<>
						{single(__('Shrink (%)', 'shapeblock'), 'depthScale', 15, 0, 0.5)}
						{single(__('Dim (%)', 'shapeblock'), 'depthDim', 40, 0)}
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Content', 'shapeblock')} initialOpen={false}>
				{toggle(__('Show number', 'shapeblock'), 'showNumber')}
				{toggle(__('Show icon', 'shapeblock'), 'showIcon')}
				{toggle(__('Show points', 'shapeblock'), 'showPoints')}
				{toggle(__('Show image', 'shapeblock'), 'showImage')}
				{toggle(__('Show button', 'shapeblock'), 'showButton')}
				<SelectControl
					label={__('Title HTML Tag', 'shapeblock')}
					value={attributes.titleTag}
					options={TITLE_TAGS.map((t) => ({ label: t.toUpperCase(), value: t }))}
					onChange={(v) => setAttributes({ titleTag: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout ----------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Card Layout', 'shapeblock')} initialOpen={true}>
				<ResponsiveWrapper label={__('Image Position', 'shapeblock')}>
					{(d) => {
						const k = getKey('mediaPosition', d);
						return (
							<SelectControl
								value={attributes[k]}
								options={[
									...(d === 'desktop' ? [] : [{ label: __('Default', 'shapeblock'), value: '' }]),
									{ label: __('Right', 'shapeblock'), value: 'right' },
									{ label: __('Left', 'shapeblock'), value: 'left' },
									{ label: __('Top', 'shapeblock'), value: 'top' },
									{ label: __('Bottom', 'shapeblock'), value: 'bottom' },
								]}
								onChange={(v) => setAttributes({ [k]: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						);
					}}
				</ResponsiveWrapper>
				{single(__('Text column width (%)', 'shapeblock'), 'contentWidth', 80, 20)}
				<ResponsiveWrapper label={__('Content Alignment', 'shapeblock')}>
					{(d) => {
						const k = getKey('contentAlign', d);
						return (
							<ToggleGroupControl
								value={attributes[k] || (d === 'desktop' ? 'left' : undefined)}
								onChange={(v) => setAttributes({ [k]: v || '' })}
								isBlock
								isDeselectable={d !== 'desktop'}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOptionIcon value="left" icon={ICON_ALIGN_LEFT} label={__('Left', 'shapeblock')} />
								<ToggleGroupControlOptionIcon value="center" icon={ICON_ALIGN_CENTER} label={__('Center', 'shapeblock')} />
								<ToggleGroupControlOptionIcon value="right" icon={ICON_ALIGN_RIGHT} label={__('Right', 'shapeblock')} />
							</ToggleGroupControl>
						);
					}}
				</ResponsiveWrapper>
				<SelectControl
					label={__('Vertical alignment', 'shapeblock')}
					value={attributes.verticalAlign || 'center'}
					options={[
						{ label: __('Top', 'shapeblock'), value: 'start' },
						{ label: __('Middle', 'shapeblock'), value: 'center' },
						{ label: __('Bottom', 'shapeblock'), value: 'end' },
					]}
					onChange={(v) => setAttributes({ verticalAlign: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={false}>
				{num(__('Space between cards (px)', 'shapeblock'), 'cardGap', 200)}
				{num(__('Card minimum height (px)', 'shapeblock'), 'cardMinHeight', 800)}
				{num(__('Gap between text and image (px)', 'shapeblock'), 'columnGap', 120)}
				{single(__('Gap inside the text (px)', 'shapeblock'), 'textGap', 40)}
			</PanelBody>

			<PanelBody title={__('Image Size', 'shapeblock')} initialOpen={false}>
				{num(__('Image height (px)', 'shapeblock'), 'imageHeight', 800)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style -----------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Card', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'cardBg', 'cardBgGradient')}
				{border(__('Border', 'shapeblock'), 'cardBorder')}
				{shadow(__('Box Shadow', 'shapeblock'), 'cardShadow')}
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'cardRadius')}
				{respBox(__('Card Padding', 'shapeblock'), 'cardPadding')}
			</PanelBody>

			<PanelBody title={__('Number Badge', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'badgeColor')}
				{bg(__('Background', 'shapeblock'), 'badgeBg', 'badgeBgGradient')}
				{single(__('Size (px)', 'shapeblock'), 'badgeSize', 120, 16)}
				{box(__('Border Radius', 'shapeblock'), 'badgeRadius')}
				{respTypo(__('Typography', 'shapeblock'), 'badgeTypography')}
			</PanelBody>

			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'iconColor')}
				{single(__('Icon Size (px)', 'shapeblock'), 'iconSize', 120, 8)}
			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
			</PanelBody>

			<PanelBody title={__('Points', 'shapeblock')} initialOpen={false}>
				{color(__('Text Color', 'shapeblock'), 'pointsColor')}
				{color(__('Tick Color', 'shapeblock'), 'pointsBulletColor')}
				{single(__('Space between points (px)', 'shapeblock'), 'pointsGap', 40)}
				{respTypo(__('Typography', 'shapeblock'), 'pointsTypography')}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'btnTypography')}
				<Divider />
				<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATE_TABS}>
					{(tab) =>
						tab.name === 'hover' ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'btnColorHover')}
								{bg(__('Background', 'shapeblock'), 'btnBgHover', 'btnBgGradientHover')}
								{color(__('Border Color', 'shapeblock'), 'btnBorderColorHover')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'btnColor')}
								{bg(__('Background', 'shapeblock'), 'btnBg', 'btnBgGradient')}
								{border(__('Border', 'shapeblock'), 'btnBorder')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'btnPadding')}
				{box(__('Border Radius', 'shapeblock'), 'btnRadius')}
			</PanelBody>

			<PanelBody title={__('Image', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Image fit', 'shapeblock')}
					value={attributes.imageFit}
					options={[
						{ label: __('Cover', 'shapeblock'), value: 'cover' },
						{ label: __('Contain', 'shapeblock'), value: 'contain' },
					]}
					onChange={(v) => setAttributes({ imageFit: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{box(__('Border Radius', 'shapeblock'), 'imageRadius')}
				{shadow(__('Box Shadow', 'shapeblock'), 'imageShadow')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey] || (dev === 'desktop' ? 'left' : undefined)}
					onChange={(v) => setAttributes({ [alignKey]: v || (dev === 'desktop' ? 'left' : '') })}
				/>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h3').toUpperCase()}
					controls={TITLE_TAGS.map((t) => ({
						title: t.toUpperCase(),
						isActive: attributes.titleTag === t,
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

			<ServerSideRender block="shapeblock/sticky-stack" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
