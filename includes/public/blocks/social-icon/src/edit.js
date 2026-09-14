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

const STATE_TABS = [
	{ name: 'normal', title: __('Normal', 'shapeblock') },
	{ name: 'hover', title: __('Hover', 'shapeblock') },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, socialLinks, colorMode } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-si-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (alignment / alignmentTablet / alignmentMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'alignment' : `alignment${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	const items = Array.isArray(socialLinks) ? socialLinks : [];
	const update = (i, key, val) => setAttributes({ socialLinks: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () =>
		setAttributes({
			socialLinks: [
				...items,
				{ linkTitle: __('Social Link', 'shapeblock'), linkUrl: '#', isExternal: false, nofollow: false, icon: 'shapeblock-icon-logo-facebook', bgColor: '#1877F2', bgGradient: '', iconColor: '#ffffff', hoverBgColor: '#166fe5', hoverBgGradient: '', hoverIconColor: '#ffffff' },
			],
		});
	const remove = (i) => setAttributes({ socialLinks: items.filter((_, idx) => idx !== i) });
	// Deep copy, so the clone's nested values are not shared with the original.
	const duplicate = (i) => {
		const next = items.slice();
		next.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
		setAttributes({ socialLinks: next });
	};
	const move = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ socialLinks: next });
	};

	// Responsive variant — device switcher above the control, editing the
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
		<PanelBody title={__('Social Settings', 'shapeblock')} initialOpen={true}>
			{items.map((item, index) => (
				<div className="shapeblock-si-repeater-item" key={index}>
					<div className="shapeblock-si-repeater-head">
						<strong>{item.linkTitle || `#${index + 1}`}</strong>
						<div>
							<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => move(index, -1)} disabled={index === 0} size="small" />
							<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => move(index, 1)} disabled={index === items.length - 1} size="small" />
							<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicate(index)} size="small" />
							<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => remove(index)} isDestructive size="small" />
						</div>
					</div>
					<TextControl label={__('Link Title', 'shapeblock')} value={item.linkTitle || ''} onChange={(v) => update(index, 'linkTitle', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
					<TextControl label={__('Link URL', 'shapeblock')} value={item.linkUrl || ''} onChange={(v) => update(index, 'linkUrl', v)} placeholder="https://" __next40pxDefaultSize __nextHasNoMarginBottom />
					<ToggleControl label={__('Open in new tab', 'shapeblock')} checked={!!item.isExternal} onChange={(v) => update(index, 'isExternal', v)} __nextHasNoMarginBottom />
					<ToggleControl label={__('Add nofollow', 'shapeblock')} checked={!!item.nofollow} onChange={(v) => update(index, 'nofollow', v)} __nextHasNoMarginBottom />
					<IconPicker label={__('Icon', 'shapeblock')} value={item.icon || ''} onChange={(v) => update(index, 'icon', v)} />
					{colorMode === 'custom' && (
						<TabPanel tabs={STATE_TABS}>
							{(tab) =>
								tab.name === 'normal' ? (
									<>
										<BackgroundControl
											label={__('Background', 'shapeblock')}
											colorValue={item.bgColor}
											gradientValue={item.bgGradient}
											onColorChange={(v) => update(index, 'bgColor', v && typeof v === 'object' ? v.hex : v || '')}
											onGradientChange={(v) => update(index, 'bgGradient', v || '')}
										/>
										<ColorPopover label={__('Icon Color', 'shapeblock')} color={item.iconColor || ''} onChange={(v) => update(index, 'iconColor', v)} />
									</>
								) : (
									<>
										<BackgroundControl
											label={__('Background', 'shapeblock')}
											colorValue={item.hoverBgColor}
											gradientValue={item.hoverBgGradient}
											onColorChange={(v) => update(index, 'hoverBgColor', v && typeof v === 'object' ? v.hex : v || '')}
											onGradientChange={(v) => update(index, 'hoverBgGradient', v || '')}
										/>
										<ColorPopover label={__('Icon Color', 'shapeblock')} color={item.hoverIconColor || ''} onChange={(v) => update(index, 'hoverIconColor', v)} />
									</>
								)
							}
						</TabPanel>
					)}
				</div>
			))}
			<Button variant="primary" onClick={add} icon={ICON_ADD}>{__('Add Social Link', 'shapeblock')}</Button>
			<Divider />
			<SelectControl
				label={__('Color Mode', 'shapeblock')}
				value={colorMode}
				options={[
					{ label: __('Global Colors', 'shapeblock'), value: 'global' },
					{ label: __('Custom Colors (Per Item)', 'shapeblock'), value: 'custom' },
				]}
				onChange={(v) => setAttributes({ colorMode: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<PanelBody title={__('Buttons', 'shapeblock')} initialOpen={true}>
			{respNum(__('Button Size (px)', 'shapeblock'), 'buttonSize')}
			{respNum(__('Button Spacing (px)', 'shapeblock'), 'buttonSpacing')}
			{respNum(__('Icon Size (px)', 'shapeblock'), 'iconSize')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<PanelBody title={__('Buttons', 'shapeblock')} initialOpen={true}>
			<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.buttonRadius} onChange={(v) => setAttributes({ buttonRadius: v })} />
			<BorderControl label={__('Border', 'shapeblock')} value={attributes.buttonBorder} onChange={(v) => setAttributes({ buttonBorder: v })} />
			<BorderControl label={__('Border (Hover)', 'shapeblock')} value={attributes.buttonBorderHover} onChange={(v) => setAttributes({ buttonBorderHover: v })} />
			<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.buttonBoxShadow} onChange={(v) => setAttributes({ buttonBoxShadow: v })} />

			{colorMode === 'global' && (
				<>
					<Divider />
					<TabPanel tabs={STATE_TABS}>
						{(tab) =>
							tab.name === 'normal' ? (
								<>
									<BackgroundControl
										label={__('Background', 'shapeblock')}
										colorValue={attributes.gBgColor}
										gradientValue={attributes.gBgGradient}
										onColorChange={(v) => setAttributes({ gBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
										onGradientChange={(v) => setAttributes({ gBgGradient: v || '' })}
									/>
									<ColorPopover label={__('Icon Color', 'shapeblock')} color={attributes.gIconColor} onChange={(v) => setAttributes({ gIconColor: v })} />
								</>
							) : (
								<>
									<BackgroundControl
										label={__('Background', 'shapeblock')}
										colorValue={attributes.gHoverBgColor}
										gradientValue={attributes.gHoverBgGradient}
										onColorChange={(v) => setAttributes({ gHoverBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
										onGradientChange={(v) => setAttributes({ gHoverBgGradient: v || '' })}
									/>
									<ColorPopover label={__('Icon Color', 'shapeblock')} color={attributes.gHoverIconColor} onChange={(v) => setAttributes({ gHoverIconColor: v })} />
								</>
							)
						}
					</TabPanel>
				</>
			)}
		</PanelBody>
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

			<ServerSideRender block="shapeblock/social-icon" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
