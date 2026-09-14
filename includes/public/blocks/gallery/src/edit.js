import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState, useCallback, createPortal } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	MediaUpload,
	MediaUploadCheck,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	ToolbarGroup,
	ToolbarButton,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

const ALLOWED_MEDIA_TYPES = ['image'];

const getAttrKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const mapImages = (media) =>
	(media || []).map((item) => ({
		id: item.id,
		url:
			item.sizes && item.sizes.large
				? item.sizes.large.url
				: item.url,
	}));

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		galleryImages,
		columns,
		imageGap,
		thumbnailSize,
		showCaption,
		captionSource,
		showDescription,
		enablePopup,
		orderBy,
		hoverStyle,
		hoverText,
		hoverIcon,
		imageHeight,
		imageBorderRadius,
		captionColor,
		captionBgColor,
		captionAlign,
		descriptionColor,
		hoverOverlayColor,
		hoverIconSize,
		hoverIconColor,
		hoverTextColor,
	} = attributes;

	// Stable, unique id per block instance (used to scope the inline styles).
	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-gallery-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: the lightbox/popup lives in view.js (viewScript), which
	// does not load inside the editor. Recreate it here with a React-controlled
	// lightbox (rendered below) so it survives ServerSideRender re-renders — the
	// click just reads the popup links from the SSR grid and opens our lightbox.
	const previewNodeRef = useRef(null);
	const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
	// The editor canvas is an iframe; render the lightbox into its document body
	// so position:fixed is not clipped by a transformed/contained ancestor.
	const [portalDoc, setPortalDoc] = useState(null);

	// Stable click handler: from a clicked popup link, collect all links in the
	// grid and open the lightbox at that index.
	// Store the preview node and its document (the editor canvas iframe).
	const setPreviewRef = useCallback((node) => {
		previewNodeRef.current = node;
		if (node) {
			setPortalDoc(node.ownerDocument);
		}
	}, []);

	// Open the lightbox when a popup link is clicked. Listen on the iframe
	// document in the capture phase so the click is caught reliably over the
	// ServerSideRender preview, scoped to this block's own images.
	useEffect(() => {
		if (!portalDoc) {
			return undefined;
		}
		const onDocClick = (e) => {
			const link = (e.target && e.target.closest) ? e.target.closest('.shapeblock-popup-link') : null;
			if (!link || !previewNodeRef.current || !previewNodeRef.current.contains(link)) {
				return;
			}
			e.preventDefault();
			const grid = link.closest('.shapeblock-gallery-grid');
			if (!grid) {
				return;
			}
			const allLinks = Array.prototype.slice.call(grid.querySelectorAll('.shapeblock-popup-link'));
			const images = allLinks.map((a) => a.getAttribute('href')).filter(Boolean);
			const index = Math.max(0, allLinks.indexOf(link));
			if (images.length) {
				setLightbox({ open: true, images, index });
			}
		};
		portalDoc.addEventListener('click', onDocClick, true);
		return () => portalDoc.removeEventListener('click', onDocClick, true);
	}, [portalDoc]);

	// Keyboard controls while the editor lightbox is open.
	useEffect(() => {
		if (!lightbox.open) {
			return undefined;
		}
		const onKey = (e) => {
			if (e.key === 'Escape') {
				setLightbox((s) => ({ ...s, open: false }));
			} else if (e.key === 'ArrowRight') {
				setLightbox((s) => ({ ...s, index: (s.index + 1) % s.images.length }));
			} else if (e.key === 'ArrowLeft') {
				setLightbox((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
			}
		};
		const doc = (previewNodeRef.current && previewNodeRef.current.ownerDocument) || document;
		doc.addEventListener('keydown', onKey);
		return () => doc.removeEventListener('keydown', onKey);
	}, [lightbox.open]);

	const closeLightbox = () => setLightbox((s) => ({ ...s, open: false }));
	const lightboxNext = () => setLightbox((s) => ({ ...s, index: (s.index + 1) % s.images.length }));
	const lightboxPrev = () => setLightbox((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));

	const blockProps = useBlockProps();

	const hasImages = Array.isArray(galleryImages) && galleryImages.length > 0;
	const imageIds = hasImages ? galleryImages.map((img) => img.id).filter(Boolean) : [];

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Gallery', 'shapeblock')} initialOpen={true}>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={(media) => setAttributes({ galleryImages: mapImages(media) })}
						allowedTypes={ALLOWED_MEDIA_TYPES}
						multiple
						gallery
						value={imageIds}
						render={({ open }) => (
							<ToolbarButton
								icon="format-gallery"
								variant="secondary"
								onClick={open}
								style={{ width: '100%', justifyContent: 'center', border: '1px solid #ddd', height: '40px' }}
							>
								{hasImages
									? __('Edit / Replace Images', 'shapeblock')
									: __('Add Images', 'shapeblock')}
							</ToolbarButton>
						)}
					/>
				</MediaUploadCheck>
				{hasImages && (
					<p style={{ marginTop: '8px' }}>
						{galleryImages.length}{' '}
						{__('image(s) selected.', 'shapeblock')}
					</p>
				)}

				<Divider />

				<SelectControl
					label={__('Thumbnail Size', 'shapeblock')}
					value={thumbnailSize}
					options={[
						{ label: __('Thumbnail', 'shapeblock'), value: 'thumbnail' },
						{ label: __('Medium', 'shapeblock'), value: 'medium' },
						{ label: __('Large', 'shapeblock'), value: 'large' },
						{ label: __('Full', 'shapeblock'), value: 'full' },
					]}
					onChange={(v) => setAttributes({ thumbnailSize: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				<SelectControl
					label={__('Order By', 'shapeblock')}
					value={orderBy}
					options={[
						{ label: __('Default', 'shapeblock'), value: 'menu_order' },
						{ label: __('Title', 'shapeblock'), value: 'title' },
						{ label: __('ID', 'shapeblock'), value: 'id' },
						{ label: __('Date', 'shapeblock'), value: 'date' },
						{ label: __('Random', 'shapeblock'), value: 'rand' },
					]}
					onChange={(v) => setAttributes({ orderBy: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				<ToggleControl
					label={__('Enable Lightbox', 'shapeblock')}
					checked={enablePopup}
					onChange={(v) => setAttributes({ enablePopup: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Caption', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Caption', 'shapeblock')}
					checked={showCaption}
					onChange={(v) => setAttributes({ showCaption: v })}
					__nextHasNoMarginBottom
				/>
				{showCaption && (
					<SelectControl
						label={__('Caption Source', 'shapeblock')}
						value={captionSource}
						options={[
							{ label: __('Media Library Caption', 'shapeblock'), value: 'media' },
							{ label: __('Image Title', 'shapeblock'), value: 'title' },
							{ label: __('None', 'shapeblock'), value: 'none' },
						]}
						onChange={(v) => setAttributes({ captionSource: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				<Divider />
				<ToggleControl
					label={__('Show Description', 'shapeblock')}
					help={__("Pulls from each image's Description field in the Media Library. Hidden automatically when empty.", 'shapeblock')}
					checked={showDescription}
					onChange={(v) => setAttributes({ showDescription: v })}
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={__('Hover', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('On Hover', 'shapeblock')}
					value={hoverStyle}
					options={[
						{ label: __('Default', 'shapeblock'), value: 'default' },
						{ label: __('Icon', 'shapeblock'), value: 'icon' },
						{ label: __('Text', 'shapeblock'), value: 'text' },
					]}
					onChange={(v) => setAttributes({ hoverStyle: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{hoverStyle === 'text' && (
					<TextControl
						label={__('Hover Text', 'shapeblock')}
						value={hoverText}
						onChange={(v) => setAttributes({ hoverText: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				)}
				{hoverStyle === 'icon' && (
					<IconPicker
						label={__('Hover Icon', 'shapeblock')}
						value={hoverIcon}
						onChange={(v) => setAttributes({ hoverIcon: v })}
					/>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (columns, spacing & size) ------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Gallery', 'shapeblock')} initialOpen={true}>
				<ResponsiveWrapper label={__('Columns', 'shapeblock')}>
					{(device) => (
						<SelectControl
							value={attributes[getAttrKey('columns', device)]}
							options={[
								{ label: __('1 Column', 'shapeblock'), value: '1' },
								{ label: __('2 Columns', 'shapeblock'), value: '2' },
								{ label: __('3 Columns', 'shapeblock'), value: '3' },
								{ label: __('4 Columns', 'shapeblock'), value: '4' },
								{ label: __('5 Columns', 'shapeblock'), value: '5' },
								{ label: __('6 Columns', 'shapeblock'), value: '6' },
							]}
							onChange={(v) => setAttributes({ [getAttrKey('columns', device)]: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
				</ResponsiveWrapper>

				<ResponsiveWrapper label={__('Gap (px)', 'shapeblock')}>
					{(device) => (
						<TextControl
							type="number"
							value={attributes[getAttrKey('imageGap', device)]}
							onChange={(v) => setAttributes({ [getAttrKey('imageGap', device)]: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
				</ResponsiveWrapper>
			</PanelBody>

			<PanelBody title={__('Image', 'shapeblock')} initialOpen={false}>
				<TextControl
					label={__('Height (e.g. 300px)', 'shapeblock')}
					value={imageHeight}
					onChange={(v) => setAttributes({ imageHeight: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{(showCaption || showDescription) && (
				<PanelBody title={__('Caption', 'shapeblock')} initialOpen={false}>
					<SelectControl
						label={__('Alignment', 'shapeblock')}
						value={captionAlign}
						options={[
							{ label: __('Default', 'shapeblock'), value: '' },
							{ label: __('Left', 'shapeblock'), value: 'left' },
							{ label: __('Center', 'shapeblock'), value: 'center' },
							{ label: __('Right', 'shapeblock'), value: 'right' },
						]}
						onChange={(v) => setAttributes({ captionAlign: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			)}
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Image', 'shapeblock')} initialOpen={true}>
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={imageBorderRadius}
					onChange={(v) => setAttributes({ imageBorderRadius: v })}
				/>
			</PanelBody>

			{(showCaption || showDescription) && (
				<PanelBody title={__('Caption', 'shapeblock')} initialOpen={false}>
					<ColorPopover
						label={__('Caption Color', 'shapeblock')}
						color={captionColor}
						onChange={(v) => setAttributes({ captionColor: v })}
					/>
					<ColorPopover
						label={__('Caption Background', 'shapeblock')}
						color={captionBgColor}
						onChange={(v) => setAttributes({ captionBgColor: v })}
					/>
					{showDescription && (
						<ColorPopover
							label={__('Description Color', 'shapeblock')}
							color={descriptionColor}
							onChange={(v) => setAttributes({ descriptionColor: v })}
						/>
					)}
				</PanelBody>
			)}

			{hoverStyle !== 'default' && (
				<PanelBody title={__('Hover Overlay', 'shapeblock')} initialOpen={false}>
					<ColorPopover
						label={__('Overlay Color', 'shapeblock')}
						color={hoverOverlayColor}
						onChange={(v) => setAttributes({ hoverOverlayColor: v })}
					/>
					{hoverStyle === 'icon' && (
						<>
							<TextControl
								label={__('Icon Size (px)', 'shapeblock')}
								type="number"
								value={hoverIconSize}
								onChange={(v) => setAttributes({ hoverIconSize: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<ColorPopover
								label={__('Icon Color', 'shapeblock')}
								color={hoverIconColor}
								onChange={(v) => setAttributes({ hoverIconColor: v })}
							/>
						</>
					)}
					{hoverStyle === 'text' && (
						<ColorPopover
							label={__('Text Color', 'shapeblock')}
							color={hoverTextColor}
							onChange={(v) => setAttributes({ hoverTextColor: v })}
						/>
					)}
				</PanelBody>
			)}
		</>
	);

	const inspector = (
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
	);

	return (
		<div {...blockProps}>
			{inspector}

			{hasImages && (
				<BlockControls>
					<AlignmentControl
						value={captionAlign}
						onChange={(value) => setAttributes({ captionAlign: value || '' })}
					/>
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => setAttributes({ galleryImages: mapImages(media) })}
								allowedTypes={ALLOWED_MEDIA_TYPES}
								multiple
								gallery
								value={imageIds}
								render={({ open }) => (
									<ToolbarButton
										icon="format-gallery"
										label={__('Edit Gallery', 'shapeblock')}
										onClick={open}
									/>
								)}
							/>
						</MediaUploadCheck>
					</ToolbarGroup>
				</BlockControls>
			)}

			{hasImages ? (
				<>
					<div ref={setPreviewRef}>
						<ServerSideRender
							block="shapeblock/gallery"
							attributes={attributes}
							httpMethod="POST"
						/>
					</div>
					{lightbox.open && portalDoc && createPortal(
						<div
							className="shapeblock-lightbox-gallery is-open"
							onClick={(e) => {
								if (e.target === e.currentTarget) {
									closeLightbox();
								}
							}}
							style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						>
							<span className="shapeblock-close" role="button" tabIndex={0} onClick={closeLightbox} style={{ position: 'absolute', top: 15, right: 25, fontSize: 35, lineHeight: 1, color: '#fff', cursor: 'pointer' }}>&times;</span>
							<img className="shapeblock-lightbox-image" src={lightbox.images[lightbox.index]} alt="" style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: 10 }} />
							{lightbox.images.length > 1 && (
								<>
									<button type="button" className="shapeblock-prev" onClick={lightboxPrev} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer' }}>&#10094;</button>
									<button type="button" className="shapeblock-next" onClick={lightboxNext} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer' }}>&#10095;</button>
								</>
							)}
						</div>,
						portalDoc.body
					)}
				</>
			) : (
				<MediaPlaceholder
					className="shapeblock-gallery-empty-placeholder"
					icon="format-gallery"
					labels={{
						title: __('Simple Gallery', 'shapeblock'),
						instructions: __('Select images to build your gallery.', 'shapeblock'),
					}}
					onSelect={(media) => setAttributes({ galleryImages: mapImages(media) })}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					multiple
					accept="image/*"
				/>
			)}
		</div>
	);
}
