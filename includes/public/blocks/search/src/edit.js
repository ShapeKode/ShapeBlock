import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
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
	TextControl,
	BoxControl,
	TabPanel,
	Button,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, selectStyle } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-search-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: open/close the popup lightbox (front-end view.js doesn't run
	// inside ServerSideRender). Delegated on a persistent wrapper. The open state
	// is kept in a ref and RE-APPLIED after ServerSideRender replaces the preview
	// markup (e.g. when the Close Icon changes) — otherwise the popup would snap
	// shut on every re-render and you could never see the close icon update.
	const previewRef = useRef(null);
	// Popup starts CLOSED (opens when the user clicks the search icon). Once the
	// user opens it, the open state is re-applied after each ServerSideRender
	// re-render so editing the close icon doesn't snap the popup shut.
	const popupOpenRef = useRef(false);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;

		const applyOpen = () => {
			const box = root.querySelector('.shapeblock-search-lightbox');
			if (box) box.classList.toggle('shapeblock-lightbox', popupOpenRef.current);
		};

		const onClick = (e) => {
			const open = e.target.closest('.shapeblock-search-open-btn');
			const close = e.target.closest('.shapeblock-search-close-btn, .shapeblock-search-overlay');
			if (open && root.contains(open)) {
				e.preventDefault();
				popupOpenRef.current = true;
				applyOpen();
			} else if (close && root.contains(close)) {
				e.preventDefault();
				popupOpenRef.current = false;
				applyOpen();
			}
		};
		root.addEventListener('click', onClick);

		// ServerSideRender swaps out the inner markup on every attribute change;
		// re-apply the popup-open state to the freshly rendered lightbox so the
		// close button (and its icon) stays visible while being edited.
		const observer = new MutationObserver(applyOpen);
		observer.observe(root, { childList: true, subtree: true });

		return () => {
			root.removeEventListener('click', onClick);
			observer.disconnect();
		};
	}, []);

	const isPopup = selectStyle === '1';
	const isFields = selectStyle === '2';

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Upload a custom image / SVG for an icon. Stored as { id, url, alt }; an image
	// takes precedence over the icon-font glyph in render.php. Removing it clears back
	// to the glyph (or the built-in SVG fallback).
	const mediaControl = (label, key) => {
		const media = attributes[key];
		const hasImage = media && media.url;
		return (
			<div className="shapeblock-search-media-control" style={{ marginBottom: '15px' }}>
				<div style={{ marginBottom: '8px', fontWeight: '500' }}>{label}</div>
				{hasImage && (
					<img
						src={media.url}
						alt={media.alt || ''}
						style={{ maxWidth: '48px', height: 'auto', display: 'block', marginBottom: '8px' }}
					/>
				)}
				<MediaUploadCheck>
					<MediaUpload
						onSelect={(m) => setAttributes({ [key]: { id: m.id, url: m.url, alt: m.alt || '' } })}
						allowedTypes={['image']}
						value={media && media.id}
						render={({ open }) => (
							<>
								<Button variant="secondary" onClick={open} __next40pxDefaultSize>
									{hasImage ? __('Replace Image', 'shapeblock') : __('Upload Image', 'shapeblock')}
								</Button>
								{hasImage && (
									<Button variant="link" isDestructive onClick={() => setAttributes({ [key]: {} })} style={{ marginLeft: '8px' }}>
										{__('Remove', 'shapeblock')}
									</Button>
								)}
							</>
						)}
					/>
				</MediaUploadCheck>
			</div>
		);
	};
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
		<PanelBody title={__('Search Settings', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Search Skin', 'shapeblock')}
				value={selectStyle}
				options={[
					{ label: __('Search Popup', 'shapeblock'), value: '1' },
					{ label: __('Search Fields', 'shapeblock'), value: '2' },
				]}
				onChange={(v) => setAttributes({ selectStyle: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{isPopup && <TextControl label={__('Search Title', 'shapeblock')} value={attributes.searchTitle} onChange={(v) => setAttributes({ searchTitle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
			<TextControl label={__('Search Placeholder', 'shapeblock')} value={attributes.placeholder} onChange={(v) => setAttributes({ placeholder: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<IconPicker label={__('Search Icon', 'shapeblock')} value={attributes.openIcon || ''} onChange={(v) => setAttributes({ openIcon: v })} />
			{mediaControl(__('Or Upload Search Icon (SVG/Image)', 'shapeblock'), 'openIconImage')}
			{isPopup && <IconPicker label={__('Close Icon', 'shapeblock')} value={attributes.closeIcon || ''} onChange={(v) => setAttributes({ closeIcon: v })} />}
			{isPopup && mediaControl(__('Or Upload Close Icon (SVG/Image)', 'shapeblock'), 'closeIconImage')}
		</PanelBody>
	);

	// --- Tab 2: Layout (size, spacing & position) -----------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Search Icon', 'shapeblock')} initialOpen={true}>
				{respNum(__('Icon Size (px)', 'shapeblock'), 'iconSize')}
				{isPopup && num(__('Icon Vertical Position (px)', 'shapeblock'), 'iconVerticalPosition')}
				{isFields && (
					<>
						<SelectControl
							label={__('Icon Position', 'shapeblock')}
							value={attributes.iconPositionSide}
							options={[
								{ label: __('Left', 'shapeblock'), value: 'left' },
								{ label: __('Right', 'shapeblock'), value: 'right' },
							]}
							onChange={(v) => setAttributes({ iconPositionSide: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						{attributes.iconPositionSide === 'right' && num(__('Offset From Right (px)', 'shapeblock'), 'iconOffsetRight')}
						{attributes.iconPositionSide === 'left' && num(__('Offset From Left (px)', 'shapeblock'), 'iconOffsetLeft')}
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Input Field', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'inputPadding')}
				{respNum(__('Height (px)', 'shapeblock'), 'inputHeight')}
				{isFields && respNum(__('Input Field Width (px)', 'shapeblock'), 'inputFieldWidth')}
			</PanelBody>

			<PanelBody title={__('Submit Button', 'shapeblock')} initialOpen={false}>
				{respBox(__('Padding', 'shapeblock'), 'submitPadding')}
			</PanelBody>

			{isPopup && (
				<PanelBody title={__('Search Popup', 'shapeblock')} initialOpen={false}>
					{respNum(__('Close Icon Size (px)', 'shapeblock'), 'closeIconSize')}
				</PanelBody>
			)}
		</>
	);

	// --- Tab 3: Style (colors, typography, borders) ---------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Search Icon', 'shapeblock')} initialOpen={true}>
				{color(__('Icon Color', 'shapeblock'), 'iconColor')}
			</PanelBody>

			<PanelBody title={__('Input Field', 'shapeblock')} initialOpen={false}>
				{respTypo(__('Typography', 'shapeblock'), 'inputTypography')}
				{color(__('Input Text Color', 'shapeblock'), 'inputTextColor')}
				{color(__('Placeholder Color', 'shapeblock'), 'placeholderColor')}
				{color(__('Input Background Color', 'shapeblock'), 'inputBgColor')}
				{isFields && box(__('Border Radius', 'shapeblock'), 'inputBorderRadius')}
				{isFields && color(__('Input Border Color', 'shapeblock'), 'inputBorderColor')}
				{isFields && color(__('Border Color (Focus)', 'shapeblock'), 'inputFocusBorderColor')}
			</PanelBody>

			<PanelBody title={__('Submit Button', 'shapeblock')} initialOpen={false}>
				{isPopup && color(__('Submit Icon Color', 'shapeblock'), 'submitIconColor')}
				{isPopup && color(__('Submit Icon Hover Color', 'shapeblock'), 'submitIconHoverColor')}
				{color(__('Submit Icon Background', 'shapeblock'), 'submitBtnBg')}
				{isPopup && color(__('Submit Icon Hover Background', 'shapeblock'), 'submitBtnHoverBg')}
			</PanelBody>

			{isPopup && (
				<PanelBody title={__('Search Popup', 'shapeblock')} initialOpen={false}>
					{color(__('Overlay Background', 'shapeblock'), 'overlayBg')}
					<Divider />
					{color(__('Title Color', 'shapeblock'), 'popupTitleColor')}
					{respTypo(__('Title Typography', 'shapeblock'), 'popupTitleTypography')}
					<Divider />
					{color(__('Close Icon Color', 'shapeblock'), 'closeIconColor')}
				</PanelBody>
			)}
		</>
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

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/search" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
