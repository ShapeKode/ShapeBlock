import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
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
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');

const COLS = ['1', '2', '3', '4', '5', '6'].map((n) => ({ label: `${n} ${n === '1' ? 'Column' : 'Columns'}`, value: n }));

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock') },
	{ name: 'hover', title: __('Hover', 'shapeblock') },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, logos, hoverSwap, grayscale } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-clg-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(logos) ? logos : [];
	const update = (i, key, val) => setAttributes({ logos: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () => setAttributes({ logos: [...items, { image: {}, link: '', linkNewTab: false, linkNofollow: false }] });
	const remove = (i) => setAttributes({ logos: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's image object is not shared with the original.
	const duplicate = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ logos: next });
	};
	const move = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ logos: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
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
		<>
			<PanelBody title={__('Logo Settings', 'shapeblock')} initialOpen={true}>
				{items.map((item, index) => (
					<div className="shapeblock-clg-repeater-item" key={index}>
						<div className="shapeblock-clg-repeater-head">
							<strong>{__('Logo', 'shapeblock')} #{index + 1}</strong>
							<div>
								<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => move(index, -1)} disabled={index === 0} size="small" />
								<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => move(index, 1)} disabled={index === items.length - 1} size="small" />
								<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicate(index)} size="small" />
								<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => remove(index)} isDestructive size="small" />
							</div>
						</div>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => update(index, 'image', { id: media.id, url: media.url, alt: media.alt })}
								allowedTypes={['image']}
								value={item.image?.id}
								render={({ open }) => (
									<div style={{ marginBottom: '8px' }}>
										{item.image?.url && <img src={item.image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
										<Button variant="secondary" size="small" onClick={open}>{item.image?.url ? __('Replace Logo', 'shapeblock') : __('Select Logo', 'shapeblock')}</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
						<TextControl label={__('Link', 'shapeblock')} value={item.link || ''} onChange={(v) => update(index, 'link', v)} placeholder="https://example.com" __next40pxDefaultSize __nextHasNoMarginBottom />
						{item.link && (
							<>
								<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={!!item.linkNewTab} onChange={(v) => update(index, 'linkNewTab', v)} __nextHasNoMarginBottom />
								<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={!!item.linkNofollow} onChange={(v) => update(index, 'linkNofollow', v)} __nextHasNoMarginBottom />
							</>
						)}
					</div>
				))}
				<Button variant="primary" onClick={add} icon={ICON_ADD}>{__('Add Logo', 'shapeblock')}</Button>
				<Divider />
				<ToggleControl label={__('Image Hover Swap Effect', 'shapeblock')} checked={hoverSwap} onChange={(v) => setAttributes({ hoverSwap: v })} __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Grayscale', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Image Grayscale', 'shapeblock')} checked={grayscale} onChange={(v) => setAttributes({ grayscale: v })} __nextHasNoMarginBottom />
				{grayscale && (
					<SelectControl
						label={__('Grayscale', 'shapeblock')}
						value={attributes.grayscaleOption}
						options={[
							{ label: __('Default Grayscale', 'shapeblock'), value: 'normal_grayscale' },
							{ label: __('Hover Grayscale', 'shapeblock'), value: 'hover_grayscale' },
							{ label: __('Hover to Default Image', 'shapeblock'), value: 'hover_to_default' },
						]}
						onChange={(v) => setAttributes({ grayscaleOption: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (columns, size & spacing) ------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Columns', 'shapeblock')} initialOpen={true}>
				{respNum(__('Image Width (px)', 'shapeblock'), 'imageWidth')}
				<SelectControl label={__('Columns', 'shapeblock')} value={attributes.columns} options={COLS} onChange={(v) => setAttributes({ columns: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl label={__('Columns (Tablet)', 'shapeblock')} value={attributes.columnsTablet} options={COLS} onChange={(v) => setAttributes({ columnsTablet: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl label={__('Columns (Mobile)', 'shapeblock')} value={attributes.columnsMobile} options={COLS} onChange={(v) => setAttributes({ columnsMobile: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={__('Item', 'shapeblock')} initialOpen={false}>
				{respNum(__('Item Max Width (px)', 'shapeblock'), 'itemWidth')}
				{respNum(__('Item Height (px)', 'shapeblock'), 'itemHeight')}
				{box(__('Item Space', 'shapeblock'), 'itemSpace')}
				{respBox(__('Padding', 'shapeblock'), 'itemPadding')}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (appearance & hover effects) ----------------------------
	const styleTab = (
		<PanelBody title={__('Item', 'shapeblock')} initialOpen={true}>
			{box(__('Border Radius', 'shapeblock'), 'itemRadius')}
			{num(__('Transition (seconds)', 'shapeblock'), 'transition')}
			<Divider />
			<TabPanel tabs={STATE_TABS}>
				{(tab) =>
					tab.name === 'normal' ? (
						<>
							{color(__('Item Background', 'shapeblock'), 'itemBg')}
							<BorderControl label={__('Border', 'shapeblock')} value={attributes.itemBorder} onChange={(v) => setAttributes({ itemBorder: v })} />
							<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.itemBoxShadow} onChange={(v) => setAttributes({ itemBoxShadow: v })} />
							{num(__('Opacity (0–1)', 'shapeblock'), 'itemOpacity')}
							{!hoverSwap && num(__('Transform Scale (e.g. 1)', 'shapeblock'), 'itemScale')}
						</>
					) : (
						<>
							{color(__('Item Hover Background', 'shapeblock'), 'itemHoverBg')}
							<BorderControl label={__('Border', 'shapeblock')} value={attributes.itemHoverBorder} onChange={(v) => setAttributes({ itemHoverBorder: v })} />
							<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.itemHoverBoxShadow} onChange={(v) => setAttributes({ itemHoverBoxShadow: v })} />
							{num(__('Opacity (0–1)', 'shapeblock'), 'itemHoverOpacity')}
							{!hoverSwap && num(__('Transform Scale (e.g. 1.1)', 'shapeblock'), 'itemHoverScale')}
						</>
					)
				}
			</TabPanel>
		</PanelBody>
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
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/clients-logo-grid" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
