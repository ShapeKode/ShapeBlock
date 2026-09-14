import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
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
import BackgroundControl from '../../custom-components/BackgroundControl';
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

const PLATFORM_OPTIONS = [
	{ label: 'Facebook', value: 'facebook' },
	{ label: 'Twitter/X', value: 'twitter' },
	{ label: 'Instagram', value: 'instagram' },
	{ label: 'LinkedIn', value: 'linkedin' },
	{ label: 'YouTube', value: 'youtube' },
	{ label: 'TikTok', value: 'tiktok' },
	{ label: 'Pinterest', value: 'pinterest' },
	{ label: 'WhatsApp', value: 'whatsapp' },
	{ label: 'Telegram', value: 'telegram' },
	{ label: 'Snapchat', value: 'snapchat' },
	{ label: 'Reddit', value: 'reddit' },
	{ label: 'Discord', value: 'discord' },
	{ label: 'Spotify', value: 'spotify' },
	{ label: 'Email', value: 'email' },
	{ label: 'Copy Link', value: 'copy' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, platforms, layout, openNewTab } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-soc-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(platforms) ? platforms : [];
	const update = (i, key, val) => setAttributes({ platforms: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () => setAttributes({ platforms: [...items, { platform: 'facebook', customIcon: '' }] });
	const remove = (i) => setAttributes({ platforms: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's nested values are not shared with the original.
	const duplicate = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ platforms: next });
	};
	const move = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ platforms: next });
	};

	// Responsive variant — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
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
		<PanelBody title={__('Social Share', 'shapeblock')} initialOpen={true}>
			{items.map((item, index) => (
				<div className="shapeblock-soc-repeater-item" key={index}>
					<div className="shapeblock-soc-repeater-head">
						<strong>{item.platform || `#${index + 1}`}</strong>
						<div>
							<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => move(index, -1)} disabled={index === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => move(index, 1)} disabled={index === items.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicate(index)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => remove(index)} isDestructive size="small" />
						</div>
					</div>
					<SelectControl
						label={__('Platform', 'shapeblock')}
						value={item.platform || 'facebook'}
						options={PLATFORM_OPTIONS}
						onChange={(v) => update(index, 'platform', v)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<IconPicker label={__('Custom Icon (optional)', 'shapeblock')} value={item.customIcon || ''} onChange={(v) => update(index, 'customIcon', v)} />
				</div>
			))}
			<Button variant="primary" onClick={add} icon={ICON_ADD}>{__('Add Platform', 'shapeblock')}</Button>
			<Divider />
			<ToggleControl
				label={__('Open in New Tab', 'shapeblock')}
				checked={openNewTab}
				onChange={(v) => setAttributes({ openNewTab: v })}
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 2: Layout (arrangement, size & spacing) --------------------------
	const layoutTab = (
		<PanelBody title={__('Direction', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Layout', 'shapeblock')}
				value={layout}
				options={[
					{ label: __('Horizontal', 'shapeblock'), value: 'horizontal' },
					{ label: __('Vertical', 'shapeblock'), value: 'vertical' },
					{ label: __('Grid', 'shapeblock'), value: 'grid' },
				]}
				onChange={(v) => setAttributes({ layout: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			{respNum(__('Icon Size (px)', 'shapeblock'), 'iconSize')}
			{respNum(__('Button Size (px)', 'shapeblock'), 'buttonSize')}
			{respNum(__('Button Spacing (px)', 'shapeblock'), 'buttonSpacing')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<PanelBody title={__('Buttons', 'shapeblock')} initialOpen={true}>
			<BackgroundControl
				label={__('Background', 'shapeblock')}
				colorValue={attributes.iconBgColor}
				gradientValue={attributes.iconBgGradient}
				onColorChange={(v) => setAttributes({ iconBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
				onGradientChange={(v) => setAttributes({ iconBgGradient: v || '' })}
			/>
			<ColorPopover label={__('Icon Color', 'shapeblock')} color={attributes.iconColor} onChange={(v) => setAttributes({ iconColor: v })} />
			<Divider />
			<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.buttonRadius} onChange={(v) => setAttributes({ buttonRadius: v })} />
			<BorderControl label={__('Border', 'shapeblock')} value={attributes.buttonBorder} onChange={(v) => setAttributes({ buttonBorder: v })} />
			<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.buttonBoxShadow} onChange={(v) => setAttributes({ buttonBoxShadow: v })} />
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

			<ServerSideRender block="shapeblock/social-share" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
