import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	Button,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import BackgroundControl from '../../custom-components/BackgroundControl';

import './editor.scss';

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, socialLinks, colorMode } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'eelfg-si-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const items = Array.isArray(socialLinks) ? socialLinks : [];
	const update = (i, key, val) => setAttributes({ socialLinks: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const add = () =>
		setAttributes({
			socialLinks: [
				...items,
				{ linkTitle: __('Social Link', 'easy-elements-for-gutenberg'), linkUrl: '#', isExternal: false, nofollow: false, icon: 'eelfg-icon-logo-facebook', bgColor: '#1877F2', bgGradient: '', iconColor: '#ffffff', hoverBgColor: '#166fe5', hoverBgGradient: '', hoverIconColor: '#ffffff' },
			],
		});
	const remove = (i) => setAttributes({ socialLinks: items.filter((_, idx) => idx !== i) });
	const move = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= items.length) return;
		const next = items.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ socialLinks: next });
	};

	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes.alignment}
					onChange={(value) => setAttributes({ alignment: value || 'left' })}
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('Social Settings', 'easy-elements-for-gutenberg')} initialOpen={true}>
					{items.map((item, index) => (
						<div className="eelfg-si-repeater-item" key={index}>
							<div className="eelfg-si-repeater-head">
								<strong>{item.linkTitle || `#${index + 1}`}</strong>
								<div>
									<Button icon={ICON_UP} label={__('Move up', 'easy-elements-for-gutenberg')} onClick={() => move(index, -1)} disabled={index === 0} size="small" />
									<Button icon={ICON_DOWN} label={__('Move down', 'easy-elements-for-gutenberg')} onClick={() => move(index, 1)} disabled={index === items.length - 1} size="small" />
									<Button icon={ICON_TRASH} label={__('Remove', 'easy-elements-for-gutenberg')} onClick={() => remove(index)} isDestructive size="small" />
								</div>
							</div>
							<TextControl label={__('Link Title', 'easy-elements-for-gutenberg')} value={item.linkTitle || ''} onChange={(v) => update(index, 'linkTitle', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
							<TextControl label={__('Link URL', 'easy-elements-for-gutenberg')} value={item.linkUrl || ''} onChange={(v) => update(index, 'linkUrl', v)} placeholder="https://" __next40pxDefaultSize __nextHasNoMarginBottom />
							<ToggleControl label={__('Open in new tab', 'easy-elements-for-gutenberg')} checked={!!item.isExternal} onChange={(v) => update(index, 'isExternal', v)} __nextHasNoMarginBottom />
							<ToggleControl label={__('Add nofollow', 'easy-elements-for-gutenberg')} checked={!!item.nofollow} onChange={(v) => update(index, 'nofollow', v)} __nextHasNoMarginBottom />
							<IconPicker label={__('Icon', 'easy-elements-for-gutenberg')} value={item.icon || ''} onChange={(v) => update(index, 'icon', v)} />
							{colorMode === 'custom' && (
								<>
									<BackgroundControl
										label={__('Background', 'easy-elements-for-gutenberg')}
										colorValue={item.bgColor}
										gradientValue={item.bgGradient}
										onColorChange={(v) => update(index, 'bgColor', v && typeof v === 'object' ? v.hex : v || '')}
										onGradientChange={(v) => update(index, 'bgGradient', v || '')}
									/>
									<ColorPopover label={__('Icon Color', 'easy-elements-for-gutenberg')} color={item.iconColor || ''} onChange={(v) => update(index, 'iconColor', v)} />
									<BackgroundControl
										label={__('Hover Background', 'easy-elements-for-gutenberg')}
										colorValue={item.hoverBgColor}
										gradientValue={item.hoverBgGradient}
										onColorChange={(v) => update(index, 'hoverBgColor', v && typeof v === 'object' ? v.hex : v || '')}
										onGradientChange={(v) => update(index, 'hoverBgGradient', v || '')}
									/>
									<ColorPopover label={__('Hover Icon Color', 'easy-elements-for-gutenberg')} color={item.hoverIconColor || ''} onChange={(v) => update(index, 'hoverIconColor', v)} />
								</>
							)}
						</div>
					))}
					<Button variant="primary" onClick={add} icon={ICON_ADD}>{__('Add Social Link', 'easy-elements-for-gutenberg')}</Button>
					<Divider />
					<SelectControl
						label={__('Color Mode', 'easy-elements-for-gutenberg')}
						value={colorMode}
						options={[
							{ label: __('Custom Colors (Per Item)', 'easy-elements-for-gutenberg'), value: 'custom' },
							{ label: __('Global Colors', 'easy-elements-for-gutenberg'), value: 'global' },
						]}
						onChange={(v) => setAttributes({ colorMode: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Buttons', 'easy-elements-for-gutenberg')} initialOpen={false}>
					{num(__('Button Size (px)', 'easy-elements-for-gutenberg'), 'buttonSize')}
					{num(__('Button Spacing (px)', 'easy-elements-for-gutenberg'), 'buttonSpacing')}
					{num(__('Icon Size (px)', 'easy-elements-for-gutenberg'), 'iconSize')}
					<Divider />
					<BoxControl label={__('Border Radius', 'easy-elements-for-gutenberg')} values={attributes.buttonRadius} onChange={(v) => setAttributes({ buttonRadius: v })} />
					<BorderControl label={__('Border', 'easy-elements-for-gutenberg')} value={attributes.buttonBorder} onChange={(v) => setAttributes({ buttonBorder: v })} />
					<BorderControl label={__('Border (Hover)', 'easy-elements-for-gutenberg')} value={attributes.buttonBorderHover} onChange={(v) => setAttributes({ buttonBorderHover: v })} />
					<BoxShadowControls label={__('Box Shadow', 'easy-elements-for-gutenberg')} value={attributes.buttonBoxShadow} onChange={(v) => setAttributes({ buttonBoxShadow: v })} />

					{colorMode === 'global' && (
						<>
							<Divider />
							<BackgroundControl
								label={__('Background', 'easy-elements-for-gutenberg')}
								colorValue={attributes.gBgColor}
								gradientValue={attributes.gBgGradient}
								onColorChange={(v) => setAttributes({ gBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
								onGradientChange={(v) => setAttributes({ gBgGradient: v || '' })}
							/>
							<ColorPopover label={__('Icon Color', 'easy-elements-for-gutenberg')} color={attributes.gIconColor} onChange={(v) => setAttributes({ gIconColor: v })} />
							<BackgroundControl
								label={__('Hover Background', 'easy-elements-for-gutenberg')}
								colorValue={attributes.gHoverBgColor}
								gradientValue={attributes.gHoverBgGradient}
								onColorChange={(v) => setAttributes({ gHoverBgColor: v && typeof v === 'object' ? v.hex : v || '' })}
								onGradientChange={(v) => setAttributes({ gHoverBgGradient: v || '' })}
							/>
							<ColorPopover label={__('Hover Icon Color', 'easy-elements-for-gutenberg')} color={attributes.gHoverIconColor} onChange={(v) => setAttributes({ gHoverIconColor: v })} />
						</>
					)}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/social-icon" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
