import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
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

// Desktop keeps the base key; tablet / mobile append a suffix.
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const ASVG = ({ children }) => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{children}</svg>
);
const ICON_LEFT = <ASVG><rect x="3" y="6" width="10" height="12" rx="2" /><rect x="15" y="9" width="6" height="2" opacity="0.4" /><rect x="15" y="13" width="6" height="2" opacity="0.4" /></ASVG>;
const ICON_CENTER = <ASVG><rect x="7" y="6" width="10" height="12" rx="2" /><rect x="2" y="9" width="3" height="2" opacity="0.4" /><rect x="19" y="9" width="3" height="2" opacity="0.4" /></ASVG>;
const ICON_RIGHT = <ASVG><rect x="11" y="6" width="10" height="12" rx="2" /><rect x="3" y="9" width="6" height="2" opacity="0.4" /><rect x="3" y="13" width="6" height="2" opacity="0.4" /></ASVG>;
const ICON_CIRCLE = <ASVG><circle cx="12" cy="12" r="8" /></ASVG>;
const ICON_SQUARE = <ASVG><rect x="4" y="4" width="16" height="16" rx="2" /></ASVG>;
const ICON_IMAGE = <ASVG><rect x="3" y="5" width="18" height="14" rx="2" opacity="0.35" /><circle cx="9" cy="10" r="2" /><path d="M5 17l4-4 3 3 3-3 4 4z" /></ASVG>;
const ICON_ICON = <ASVG><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" /></ASVG>;

// The directions each effect understands. An effect that reads the same from
// every side has none, and the Direction control is then not shown at all
// rather than offered and ignored.
const SIDES = [
	{ label: __('From Top', 'shapeblock'), value: 'top' },
	{ label: __('From Bottom', 'shapeblock'), value: 'bottom' },
	{ label: __('From Left', 'shapeblock'), value: 'left' },
	{ label: __('From Right', 'shapeblock'), value: 'right' },
];

// Every effect the stylesheet knows about, in the order they read best.
const EFFECTS = [
	{ label: __('Fade', 'shapeblock'), value: 'fade', dirs: [] },
	{ label: __('Slide', 'shapeblock'), value: 'slide', dirs: SIDES },
	{ label: __('Push', 'shapeblock'), value: 'push', dirs: SIDES },
	{ label: __('Hinge', 'shapeblock'), value: 'hinge', dirs: SIDES },
	{ label: __('Shutter', 'shapeblock'), value: 'shutter', dirs: SIDES },
	{
		label: __('Zoom', 'shapeblock'), value: 'zoom', dirs: [
			{ label: __('Zoom Up', 'shapeblock'), value: 'up' },
			{ label: __('Zoom Down', 'shapeblock'), value: 'down' },
		],
	},
	{
		label: __('Flip', 'shapeblock'), value: 'flip', dirs: [
			{ label: __('Horizontal', 'shapeblock'), value: 'horizontal' },
			{ label: __('Vertical', 'shapeblock'), value: 'vertical' },
		],
	},
	{ label: __('Spin', 'shapeblock'), value: 'spin', dirs: [] },
	{ label: __('Blur', 'shapeblock'), value: 'blur', dirs: [] },
	{ label: __('Greyscale', 'shapeblock'), value: 'grayscale', dirs: [] },
	{ label: __('Circle Open', 'shapeblock'), value: 'circle', dirs: [] },
	{ label: __('Curtain', 'shapeblock'), value: 'curtain', dirs: [] },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, mediaType, image, title, desc } = attributes;

	const currentEffect = EFFECTS.find((e) => e.value === attributes.effect);
	const currentDirs = currentEffect ? currentEffect.dirs : [];

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-hover-box-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, colorKey, gradKey) => (
		<BackgroundControl
			label={label}
			color={attributes[colorKey]}
			gradient={attributes[gradKey]}
			onChangeColor={(v) => setAttributes({ [colorKey]: v })}
			onChangeGradient={(v) => setAttributes({ [gradKey]: v })}
		/>
	);
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<SpacingControl
					values={attributes[getKey(base, device)]}
					onChange={(v) => setAttributes({ [getKey(base, device)]: v })}
				/>
			)}
		</ResponsiveWrapper>
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />
			)}
		</ResponsiveWrapper>
	);
	const num = (label, key, max = 100, min = 0) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(key, device);
				return (
					<RangeControl
						value={attributes[k] !== '' && attributes[k] != null ? Number(attributes[k]) : undefined}
						onChange={(v) => setAttributes({ [k]: v == null ? '' : String(v) })}
						min={min}
						max={max}
						allowReset
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings ------------------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Content', 'shapeblock')} initialOpen={true}>
				<ToggleGroupControl
					label={__('Media', 'shapeblock')}
					value={mediaType || 'image'}
					onChange={(v) => setAttributes({ mediaType: v })}
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				>
					<ToggleGroupControlOptionIcon value="image" icon={ICON_IMAGE} label={__('Image', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="icon" icon={ICON_ICON} label={__('Icon', 'shapeblock')} />
				</ToggleGroupControl>

				{mediaType !== 'icon' && (
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) => setAttributes({ image: { id: media.id, url: media.url, alt: media.alt } })}
							allowedTypes={['image']}
							value={image?.id}
							render={({ open }) => (
								<div style={{ marginBottom: '16px' }}>
									{image?.url && <img src={image.url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
									<Button variant="secondary" size="small" onClick={open}>
										{image?.url ? __('Replace Image', 'shapeblock') : __('Select Image', 'shapeblock')}
									</Button>
									{image?.url && (
										<Button variant="tertiary" size="small" isDestructive onClick={() => setAttributes({ image: {} })}>
											{__('Remove', 'shapeblock')}
										</Button>
									)}
								</div>
							)}
						/>
					</MediaUploadCheck>
				)}

				{mediaType === 'icon' && (
					<IconPicker label={__('Icon', 'shapeblock')} value={attributes.icon} onChange={(v) => setAttributes({ icon: v })} />
				)}

				<TextControl
					label={__('Title', 'shapeblock')}
					value={title}
					onChange={(v) => setAttributes({ title: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<TextareaControl
					label={__('Description', 'shapeblock')}
					value={desc}
					onChange={(v) => setAttributes({ desc: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Hover', 'shapeblock')} initialOpen={true}>
				<ToggleGroupControl
					label={__('Shape', 'shapeblock')}
					value={attributes.shape}
					onChange={(v) => setAttributes({ shape: v })}
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				>
					<ToggleGroupControlOptionIcon value="circle" icon={ICON_CIRCLE} label={__('Circle', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="square" icon={ICON_SQUARE} label={__('Square', 'shapeblock')} />
				</ToggleGroupControl>
				<SelectControl
					label={__('Effect', 'shapeblock')}
					value={attributes.effect}
					options={EFFECTS.map(({ label, value }) => ({ label, value }))}
					onChange={(v) => {
						// Move to a direction the new effect actually has, so the
						// box never lands on a combination that does nothing.
						const next = EFFECTS.find((e) => e.value === v);
						const dirs = next ? next.dirs : [];
						const keep = dirs.some((d) => d.value === attributes.direction);
						setAttributes({ effect: v, direction: dirs.length ? (keep ? attributes.direction : dirs[0].value) : '' });
					}}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{currentDirs.length > 0 && (
					<SelectControl
						label={__('Direction', 'shapeblock')}
						value={attributes.direction || currentDirs[0].value}
						options={currentDirs}
						onChange={(v) => setAttributes({ direction: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				<RangeControl
					label={__('Speed (ms)', 'shapeblock')}
					value={attributes.speed !== '' && attributes.speed != null ? Number(attributes.speed) : undefined}
					onChange={(v) => setAttributes({ speed: v == null ? '' : String(v) })}
					min={100}
					max={2000}
					step={50}
					allowReset
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Link', 'shapeblock')} initialOpen={false}>
				<TextControl
					label={__('URL', 'shapeblock')}
					value={attributes.linkUrl}
					onChange={(v) => setAttributes({ linkUrl: v })}
					placeholder="https://"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__('Open in a new tab', 'shapeblock')}
					checked={!!attributes.linkNewTab}
					onChange={(v) => setAttributes({ linkNewTab: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout --------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Box', 'shapeblock')} initialOpen={true}>
				<ToggleGroupControl
					label={__('Alignment', 'shapeblock')}
					value={attributes.boxAlign}
					onChange={(v) => setAttributes({ boxAlign: v })}
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				>
					<ToggleGroupControlOptionIcon value="left" icon={ICON_LEFT} label={__('Left', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="center" icon={ICON_CENTER} label={__('Center', 'shapeblock')} />
					<ToggleGroupControlOptionIcon value="right" icon={ICON_RIGHT} label={__('Right', 'shapeblock')} />
				</ToggleGroupControl>
				{num(__('Size (px)', 'shapeblock'), 'boxSize', 600, 60)}
				{respBox(__('Margin', 'shapeblock'), 'blockMargin')}
			</PanelBody>

			<PanelBody title={__('Overlay', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'contentPadding')}
			</PanelBody>

			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{num(__('Size (px)', 'shapeblock'), 'iconSize', 200, 8)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style ---------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Box', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'boxBgColor', 'boxBgGradient')}
				{border(__('Border', 'shapeblock'), 'boxBorder')}
				{box(__('Border Radius', 'shapeblock'), 'boxRadius')}
				{shadow(__('Box Shadow', 'shapeblock'), 'boxShadow')}
			</PanelBody>

			<PanelBody title={__('Overlay', 'shapeblock')} initialOpen={false}>
				{bg(__('Background', 'shapeblock'), 'overlayColor', 'overlayGradient')}
			</PanelBody>

			<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'iconColor')}
			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'titleColor')}
				{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
			</PanelBody>

			<PanelBody title={__('Description', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'descColor')}
				{respTypo(__('Typography', 'shapeblock'), 'descTypography')}
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h3').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({
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

			<ServerSideRender block="shapeblock/hover-box" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
