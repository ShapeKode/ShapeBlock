import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import ServerSideRender from '../../custom-components/ServerRender';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	RangeControl,
	BoxControl,
	Button,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';
import { TAB_ITEM, ActiveTab } from './item';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
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
const ICON_COLLAPSE = SVG('M5 11h14v2H5z'); // minus (shown when expanded — click to collapse)
const ICON_EXPAND = SVG('M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z'); // plus (shown when collapsed — click to expand)
const HEART = <svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-6.7-4.3-9.3-8.5C1 9.6 2 6 5.3 5.2 7.3 4.7 9 5.8 12 8.6c3-2.8 4.7-3.9 6.7-3.4C22 6 23 9.6 21.3 12.5 18.7 16.7 12 21 12 21z" /></svg>;

// A tab saved before tabs held blocks: its title, description and link as
// blocks (a heading, paragraphs and a link), with the same classes.
const toHtml = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tabContent = (t) => {
	const blocks = [];
	if (t.contentTitle) {
		blocks.push(createBlock('core/heading', { level: 4, content: toHtml(t.contentTitle), className: 'shapeblock-content-title' }));
	}
	String(t.contentDescription || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).forEach((p) => {
		blocks.push(createBlock('core/paragraph', { content: p.replace(/\n/g, '<br>'), className: 'shapeblock-content-description' }));
	});
	if (t.readMoreText && t.readMoreUrl) {
		const target = t.readMoreNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
		blocks.push(createBlock('core/paragraph', { content: `<a href="${toHtml(t.readMoreUrl)}"${target}>${toHtml(t.readMoreText)}</a>` }));
	}
	return blocks;
};

// A tab's three looks: normal, under the mouse, and open.
const TAB_STATES = [
	{ name: 'normal', title: __('Normal', 'shapeblock') },
	{ name: 'hover', title: __('Hover', 'shapeblock') },
	{ name: 'active', title: __('Active', 'shapeblock') },
];

const POSITION_OPTIONS = [
	{ label: __('Left', 'shapeblock'), value: 'left' },
	{ label: __('Top', 'shapeblock'), value: 'top' },
	{ label: __('Right', 'shapeblock'), value: 'right' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, tabs, iconPosition, layoutDirection } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-tab-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (descriptionAlignment / ...Tablet / ...Mobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'descriptionAlignment' : `descriptionAlignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	// ---- The tabs: each a block, its content any blocks ----------------------
	const items = useSelect((select) => select(blockEditorStore).getBlocks(clientId), [clientId]);
	const { replaceInnerBlocks, insertBlock, removeBlock, moveBlocksToPosition, updateBlockAttributes, duplicateBlocks, __unstableMarkNextChangeAsNotPersistent } = useDispatch(blockEditorStore);
	const [active, setActive] = useState(0);
	const shown = Math.min(active, Math.max(0, items.length - 1));

	// Tabs saved before tabs held blocks (and a new Tabs block) get theirs
	// once, from the settings.
	useEffect(() => {
		if (items.length) {
			return;
		}
		const saved = Array.isArray(tabs) ? tabs : [];
		__unstableMarkNextChangeAsNotPersistent();
		replaceInnerBlocks(
			clientId,
			saved.map((t) => createBlock(TAB_ITEM, { tabTitle: t.tabTitle || '', iconType: t.iconType || 'icon', icon: t.icon || '', image: t.image || {} }, tabContent(t))),
			false
		);
		__unstableMarkNextChangeAsNotPersistent();
		setAttributes({ tabs: [] });
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// A block chosen inside a tab (from the List View, say) shows that tab.
	const selectedTab = useSelect(
		(select) => {
			const be = select(blockEditorStore);
			const sel = be.getSelectedBlockClientId();
			if (!sel) return -1;
			const tabId = be.getBlockName(sel) === TAB_ITEM ? sel : be.getBlockParentsByBlockName(sel, TAB_ITEM, true)[0];
			return tabId && be.getBlockRootClientId(tabId) === clientId ? be.getBlockIndex(tabId) : -1;
		},
		[clientId]
	);
	useEffect(() => {
		if (selectedTab >= 0) setActive(selectedTab);
	}, [selectedTab]);

	// Whether the tabs still use the blocks made from tabs saved before (their
	// title, description and link styles show only then).
	const legacyClasses = useMemo(() => {
		const found = { title: false, desc: false };
		const walk = (b) => {
			const cls = b.attributes.className || '';
			if (/shapeblock-content-title/.test(cls)) found.title = true;
			if (/shapeblock-content-description/.test(cls)) found.desc = true;
			b.innerBlocks.forEach(walk);
		};
		items.forEach(walk);
		return found;
	}, [items]);

	const updateItem = (i, key, val) => items[i] && updateBlockAttributes(items[i].clientId, { [key]: val });
	const addItem = () => {
		insertBlock(createBlock(TAB_ITEM, { tabTitle: __('New Tab', 'shapeblock') }, [createBlock('core/paragraph')]), items.length, clientId, false);
		setActive(items.length);
	};
	const removeItem = (i) => {
		removeBlock(items[i].clientId, false);
		setActive(Math.max(0, i - 1));
	};
	const duplicateItem = (i) => duplicateBlocks([items[i].clientId], false);
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		moveBlocksToPosition([items[i].clientId], clientId, clientId, t);
		setActive(t);
	};

	// Editor-only: which tabs are folded in the sidebar list.
	const [collapsed, setCollapsed] = useState({});
	const toggleCollapsed = (i) => setCollapsed((cur) => ({ ...cur, [i]: !cur[i] }));

	// The block's own CSS (colours, sizes ...) comes from the server: a hidden
	// preview of its settings, not fetched again while the tabs are typed in.
	const styleOnly = useMemo(() => ({ ...attributes, tabs: [{ tabTitle: '' }] }), [JSON.stringify({ ...attributes, tabs: 0 })]); // eslint-disable-line react-hooks/exhaustive-deps

	const contentProps = useInnerBlocksProps({ className: 'shapeblock-tab-contents' }, { allowedBlocks: [TAB_ITEM], renderAppender: false, templateLock: false, orientation: 'horizontal' });

	const color = (label, key) => (
		<ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	const border = (label, key) => (
		<BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const box = (label, key) => (
		<BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
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
			{(device) => <BoxControl label="" values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
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
	const shadow = (label, key) => (
		<BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />
	);
	const respSelect = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <SelectControl value={attributes[k]} options={options} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content) --------------------------------------------
	const settingsTab = (
		<PanelBody title={__('Tabs', 'shapeblock')} initialOpen={true}>
			<p className="components-base-control__help">
				{__('Click a tab in the block to show it, and type its title there. Its content is blocks: type, or add or drag in any block.', 'shapeblock')}
			</p>
			{items.map((block, index) => { const item = block.attributes; const isCollapsed = collapsed[index] ?? index !== shown; return (
				<div className="shapeblock-tab-repeater-item" key={block.clientId}>
					<div className="shapeblock-tab-repeater-head">
						<strong>{item.tabTitle || `#${index + 1}`}</strong>
						<div>
							<Button icon={isCollapsed ? ICON_EXPAND : ICON_COLLAPSE} label={isCollapsed ? __('Expand', 'shapeblock') : __('Collapse', 'shapeblock')} onClick={() => toggleCollapsed(index)} size="small" />
								<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
						</div>
					</div>
					{!isCollapsed && (<>
						<TextControl
						label={__('Tab Title', 'shapeblock')}
						value={item.tabTitle || ''}
						onChange={(v) => updateItem(index, 'tabTitle', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Icon / Image', 'shapeblock')}
						value={item.iconType || 'icon'}
						options={[
							{ label: __('None', 'shapeblock'), value: 'none' },
							{ label: __('Icon', 'shapeblock'), value: 'icon' },
							{ label: __('Image', 'shapeblock'), value: 'image' },
						]}
						onChange={(v) => updateItem(index, 'iconType', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{(item.iconType || 'icon') === 'icon' && (
						<IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => updateItem(index, 'icon', v)} />
					)}
					{item.iconType === 'image' && (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => updateItem(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
								allowedTypes={['image']}
								value={item.image?.id}
								render={({ open }) => (
									<div style={{ marginBottom: '8px' }}>
										{item.image?.url && <img src={item.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
										<Button variant="secondary" size="small" onClick={open}>
											{item.image?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
					)}
						</>
						)}
				</div>
			)})}
			<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Tab', 'shapeblock')}</Button>
		</PanelBody>
	);

	// --- Tab 2: Layout (orientation & position) -------------------------------
	const layoutTab = (
		<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Icon Position', 'shapeblock')}
				help={__('Where the icon sits next to the tab title.', 'shapeblock')}
				value={iconPosition}
				options={POSITION_OPTIONS}
				onChange={(v) => setAttributes({ iconPosition: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('Tabs Position', 'shapeblock')}
				help={__('The tabs above the content, or beside it.', 'shapeblock')}
				value={layoutDirection}
				options={POSITION_OPTIONS}
				onChange={(v) => setAttributes({ layoutDirection: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{('left' === layoutDirection || 'right' === layoutDirection) && (
				<ResponsiveWrapper label={__('Tabs Width (%)', 'shapeblock')}>
					{(device) => {
						const k = getKey('navWidth', device);
						return (
							<RangeControl
								help={__('The column of tabs; the content takes the rest. Empty: about a third.', 'shapeblock')}
								value={'' === (attributes[k] ?? '') ? undefined : Number(attributes[k])}
								onChange={(v) => setAttributes({ [k]: undefined === v || null === v ? '' : String(v) })}
								min={10}
								max={80}
								allowReset
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						);
					}}
				</ResponsiveWrapper>
			)}
			{respSelect(__('Content Alignment', 'shapeblock'), 'descriptionAlignment', [
				{ label: __('Left', 'shapeblock'), value: 'left' },
				{ label: __('Center', 'shapeblock'), value: 'center' },
				{ label: __('Right', 'shapeblock'), value: 'right' },
				{ label: __('Justify', 'shapeblock'), value: 'justify' },
			])}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Tab Bar', 'shapeblock')} initialOpen={true}>
				{'left' !== layoutDirection && 'right' !== layoutDirection && respSelect(__('Tabs Alignment', 'shapeblock'), 'navAlign', [
					{ label: __('Fill the row', 'shapeblock'), value: '' },
					{ label: __('Left', 'shapeblock'), value: 'left' },
					{ label: __('Center', 'shapeblock'), value: 'center' },
					{ label: __('Right', 'shapeblock'), value: 'right' },
				])}
				{respNum(__('Space Between Tabs (px)', 'shapeblock'), 'navGap')}
				{bg(__('Background', 'shapeblock'), 'navBgColor', 'navBgGradient')}
				{respBox(__('Padding', 'shapeblock'), 'navPadding')}
				{box(__('Border Radius', 'shapeblock'), 'navRadius')}
				{border(__('Border', 'shapeblock'), 'navBorder')}
				{respNum(__('Space Below the Tabs (px)', 'shapeblock'), 'titleBottomSpacing')}
			</PanelBody>

			<PanelBody title={__('Tab Buttons', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				{respSelect(__('Text Alignment', 'shapeblock'), 'titleItemAlign', [
					{ label: __('Default', 'shapeblock'), value: '' },
					{ label: __('Left', 'shapeblock'), value: 'left' },
					{ label: __('Center', 'shapeblock'), value: 'center' },
					{ label: __('Right', 'shapeblock'), value: 'right' },
				])}
				<TabPanel className="shapeblock-tab-state-tabs" tabs={TAB_STATES}>
					{(tab) =>
						'normal' === tab.name ? (
							<>
								{color(__('Text Color', 'shapeblock'), 'titleColor')}
								{bg(__('Background', 'shapeblock'), 'titleBgColor', 'titleBgColorGradient')}
								{border(__('Border', 'shapeblock'), 'titleBorder')}
								{shadow(__('Shadow', 'shapeblock'), 'titleShadow')}
								{color(__('Icon Color', 'shapeblock'), 'tabIconColor')}
								{bg(__('Icon Background', 'shapeblock'), 'tabIconBgColor', 'tabIconBgColorGradient')}
							</>
						) : 'hover' === tab.name ? (
							<>
								<p className="components-base-control__help">{__('Empty: a tab under the mouse looks like the active tab.', 'shapeblock')}</p>
								{color(__('Text Color', 'shapeblock'), 'titleHoverColor')}
								{bg(__('Background', 'shapeblock'), 'titleHoverBgColor', 'titleHoverBgColorGradient')}
								{color(__('Border Color', 'shapeblock'), 'titleHoverBorderColor')}
							</>
						) : (
							<>
								{color(__('Text Color', 'shapeblock'), 'titleActiveColor')}
								{bg(__('Background', 'shapeblock'), 'titleActiveBgColor', 'titleActiveBgColorGradient')}
								{color(__('Border Color', 'shapeblock'), 'titleActiveBorderColor')}
								{shadow(__('Shadow', 'shapeblock'), 'titleActiveShadow')}
								{color(__('Icon Color', 'shapeblock'), 'tabIconActiveColor')}
								{bg(__('Icon Background', 'shapeblock'), 'tabIconActiveBgColor', 'tabIconActiveBgGradient')}
							</>
						)
					}
				</TabPanel>
				<Divider />
				{box(__('Border Radius', 'shapeblock'), 'titleBorderRadius')}
				{respBox(__('Padding', 'shapeblock'), 'titlePadding')}
				{respBox(__('Margin', 'shapeblock'), 'titleMargin')}
			</PanelBody>

			<PanelBody title={__('Icon & Image', 'shapeblock')} initialOpen={false}>
				{respNum(__('Icon / Image Size (px)', 'shapeblock'), 'tabIconSize')}
				{respNum(__('Space to the Title (px)', 'shapeblock'), 'tabIconGap')}
				<ToggleControl label={__('Icon Box', 'shapeblock')} help={__('A shaded box round the icon.', 'shapeblock')} checked={false !== attributes.tabIconBox} onChange={(v) => setAttributes({ tabIconBox: v })} __nextHasNoMarginBottom />
				{false !== attributes.tabIconBox && (
					<>
						{respNum(__('Box Size (px)', 'shapeblock'), 'tabIconBoxSize')}
						{box(__('Box Border Radius', 'shapeblock'), 'tabIconRadius')}
					</>
				)}
				<p className="components-base-control__help">{__('Icon colors are under Tab Buttons, for each state.', 'shapeblock')}</p>
			</PanelBody>

			<PanelBody title={__('Tab Content Area', 'shapeblock')} initialOpen={false}>
				{bg(__('Background Color', 'shapeblock'), 'contentBgColor', 'contentBgColorGradient')}
				{border(__('Border', 'shapeblock'), 'contentBorder')}
				{box(__('Border Radius', 'shapeblock'), 'contentBorderRadius')}
				{respBox(__('Padding', 'shapeblock'), 'contentPadding')}
				{respBox(__('Margin', 'shapeblock'), 'contentMargin')}
			</PanelBody>

			{legacyClasses.title && <PanelBody title={__('Content Title', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'contentTitleTypography')}
				{color(__('Color', 'shapeblock'), 'contentTitleColor')}
				{respBox(__('Margin', 'shapeblock'), 'contentTitleMargin')}
			</PanelBody>}

			{legacyClasses.desc && <PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respBox(__('Margin', 'shapeblock'), 'descMargin')}
			</PanelBody>}

		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || (dev === 'desktop' ? 'center' : '') })}
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

			<div className={`shapeblock-block shapeblock-tab-block-wrap ${blockId}`}>
				<div className="shapeblock-tabs-wrapper" data-tab-direction={layoutDirection || 'top'} data-icon-position={iconPosition || 'left'}>
					<ul className="shapeblock-tab-titles">
						{items.map((block, index) => {
							const item = block.attributes;
							const type = item.iconType || 'icon';
							return (
								<li key={block.clientId} className={`shapeblock-tab-nav-item${index === shown ? ' active' : ''}`} onClick={() => setActive(index)}>
									{'icon' === type && <span className="shapeblock-tab-icon">{item.icon && 'none' !== item.icon ? <i className={`shapeblock-icon ${item.icon}`} aria-hidden="true" /> : HEART}</span>}
									{'image' === type && item.image?.url && <span className="shapeblock-tab-image"><img src={item.image.url} alt={item.image.alt || ''} /></span>}
									<RichText
										tagName="span"
										className="shapeblock-tab-title-text"
										value={toHtml(item.tabTitle)}
										onChange={(v) => updateItem(index, 'tabTitle', v.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))}
										allowedFormats={[]}
										placeholder={__('Tab title', 'shapeblock')}
									/>
								</li>
							);
						})}
						<li className="shapeblock-tab-add">
							<Button icon={ICON_ADD} label={__('Add Tab', 'shapeblock')} onClick={addItem} />
						</li>
					</ul>
					<ActiveTab.Provider value={shown}>
						<div {...contentProps} />
					</ActiveTab.Provider>
				</div>
			</div>
			<div className="shapeblock-tab-styles" hidden>
				<ServerSideRender block="shapeblock/tab" attributes={styleOnly} httpMethod="POST" />
			</div>
		</div>
	);
}
