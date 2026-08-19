import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState, useCallback, createPortal } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
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
			setAttributes({ blockId: 'eelfg-gallery-' + clientId.slice(0, 6) });
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
			const link = (e.target && e.target.closest) ? e.target.closest('.eelfg-popup-link') : null;
			if (!link || !previewNodeRef.current || !previewNodeRef.current.contains(link)) {
				return;
			}
			e.preventDefault();
			const grid = link.closest('.eelfg-gallery-grid');
			if (!grid) {
				return;
			}
			const allLinks = Array.prototype.slice.call(grid.querySelectorAll('.eelfg-popup-link'));
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

	const inspector = (
		<>
			<InspectorControls>
				<PanelBody title={__('Gallery', 'easy-elements-for-gutenberg')} initialOpen={true}>
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
										? __('Edit / Replace Images', 'easy-elements-for-gutenberg')
										: __('Add Images', 'easy-elements-for-gutenberg')}
								</ToolbarButton>
							)}
						/>
					</MediaUploadCheck>
					{hasImages && (
						<p style={{ marginTop: '8px' }}>
							{galleryImages.length}{' '}
							{__('image(s) selected.', 'easy-elements-for-gutenberg')}
						</p>
					)}

					<Divider />

					<ResponsiveWrapper label={__('Columns', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<SelectControl
								value={attributes[getAttrKey('columns', device)]}
								options={[
									{ label: __('1 Column', 'easy-elements-for-gutenberg'), value: '1' },
									{ label: __('2 Columns', 'easy-elements-for-gutenberg'), value: '2' },
									{ label: __('3 Columns', 'easy-elements-for-gutenberg'), value: '3' },
									{ label: __('4 Columns', 'easy-elements-for-gutenberg'), value: '4' },
									{ label: __('5 Columns', 'easy-elements-for-gutenberg'), value: '5' },
									{ label: __('6 Columns', 'easy-elements-for-gutenberg'), value: '6' },
								]}
								onChange={(v) => setAttributes({ [getAttrKey('columns', device)]: v })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						)}
					</ResponsiveWrapper>

					<ResponsiveWrapper label={__('Gap (px)', 'easy-elements-for-gutenberg')}>
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

					<Divider />

					<SelectControl
						label={__('Thumbnail Size', 'easy-elements-for-gutenberg')}
						value={thumbnailSize}
						options={[
							{ label: __('Thumbnail', 'easy-elements-for-gutenberg'), value: 'thumbnail' },
							{ label: __('Medium', 'easy-elements-for-gutenberg'), value: 'medium' },
							{ label: __('Large', 'easy-elements-for-gutenberg'), value: 'large' },
							{ label: __('Full', 'easy-elements-for-gutenberg'), value: 'full' },
						]}
						onChange={(v) => setAttributes({ thumbnailSize: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<SelectControl
						label={__('Order By', 'easy-elements-for-gutenberg')}
						value={orderBy}
						options={[
							{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'menu_order' },
							{ label: __('Title', 'easy-elements-for-gutenberg'), value: 'title' },
							{ label: __('ID', 'easy-elements-for-gutenberg'), value: 'id' },
							{ label: __('Date', 'easy-elements-for-gutenberg'), value: 'date' },
							{ label: __('Random', 'easy-elements-for-gutenberg'), value: 'rand' },
						]}
						onChange={(v) => setAttributes({ orderBy: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<ToggleControl
						label={__('Enable Lightbox', 'easy-elements-for-gutenberg')}
						checked={enablePopup}
						onChange={(v) => setAttributes({ enablePopup: v })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Caption', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show Caption', 'easy-elements-for-gutenberg')}
						checked={showCaption}
						onChange={(v) => setAttributes({ showCaption: v })}
						__nextHasNoMarginBottom
					/>
					{showCaption && (
						<SelectControl
							label={__('Caption Source', 'easy-elements-for-gutenberg')}
							value={captionSource}
							options={[
								{ label: __('Media Library Caption', 'easy-elements-for-gutenberg'), value: 'media' },
								{ label: __('Image Title', 'easy-elements-for-gutenberg'), value: 'title' },
								{ label: __('None', 'easy-elements-for-gutenberg'), value: 'none' },
							]}
							onChange={(v) => setAttributes({ captionSource: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
					<Divider />
					<ToggleControl
						label={__('Show Description', 'easy-elements-for-gutenberg')}
						help={__("Pulls from each image's Description field in the Media Library. Hidden automatically when empty.", 'easy-elements-for-gutenberg')}
						checked={showDescription}
						onChange={(v) => setAttributes({ showDescription: v })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Hover', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<SelectControl
						label={__('On Hover', 'easy-elements-for-gutenberg')}
						value={hoverStyle}
						options={[
							{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'default' },
							{ label: __('Icon', 'easy-elements-for-gutenberg'), value: 'icon' },
							{ label: __('Text', 'easy-elements-for-gutenberg'), value: 'text' },
						]}
						onChange={(v) => setAttributes({ hoverStyle: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{hoverStyle === 'text' && (
						<TextControl
							label={__('Hover Text', 'easy-elements-for-gutenberg')}
							value={hoverText}
							onChange={(v) => setAttributes({ hoverText: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
					{hoverStyle === 'icon' && (
						<IconPicker
							label={__('Hover Icon', 'easy-elements-for-gutenberg')}
							value={hoverIcon}
							onChange={(v) => setAttributes({ hoverIcon: v })}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Image', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TextControl
						label={__('Height (e.g. 300px)', 'easy-elements-for-gutenberg')}
						value={imageHeight}
						onChange={(v) => setAttributes({ imageHeight: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<Divider />
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={imageBorderRadius}
						onChange={(v) => setAttributes({ imageBorderRadius: v })}
					/>
				</PanelBody>

				{(showCaption || showDescription) && (
					<PanelBody title={__('Caption', 'easy-elements-for-gutenberg')} initialOpen={false}>
						<SelectControl
							label={__('Alignment', 'easy-elements-for-gutenberg')}
							value={captionAlign}
							options={[
								{ label: __('Default', 'easy-elements-for-gutenberg'), value: '' },
								{ label: __('Left', 'easy-elements-for-gutenberg'), value: 'left' },
								{ label: __('Center', 'easy-elements-for-gutenberg'), value: 'center' },
								{ label: __('Right', 'easy-elements-for-gutenberg'), value: 'right' },
							]}
							onChange={(v) => setAttributes({ captionAlign: v })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<ColorPopover
							label={__('Caption Color', 'easy-elements-for-gutenberg')}
							color={captionColor}
							onChange={(v) => setAttributes({ captionColor: v })}
						/>
						<ColorPopover
							label={__('Caption Background', 'easy-elements-for-gutenberg')}
							color={captionBgColor}
							onChange={(v) => setAttributes({ captionBgColor: v })}
						/>
						{showDescription && (
							<ColorPopover
								label={__('Description Color', 'easy-elements-for-gutenberg')}
								color={descriptionColor}
								onChange={(v) => setAttributes({ descriptionColor: v })}
							/>
						)}
					</PanelBody>
				)}

				{hoverStyle !== 'default' && (
					<PanelBody title={__('Hover Overlay', 'easy-elements-for-gutenberg')} initialOpen={false}>
						<ColorPopover
							label={__('Overlay Color', 'easy-elements-for-gutenberg')}
							color={hoverOverlayColor}
							onChange={(v) => setAttributes({ hoverOverlayColor: v })}
						/>
						{hoverStyle === 'icon' && (
							<>
								<TextControl
									label={__('Icon Size (px)', 'easy-elements-for-gutenberg')}
									type="number"
									value={hoverIconSize}
									onChange={(v) => setAttributes({ hoverIconSize: v })}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<ColorPopover
									label={__('Icon Color', 'easy-elements-for-gutenberg')}
									color={hoverIconColor}
									onChange={(v) => setAttributes({ hoverIconColor: v })}
								/>
							</>
						)}
						{hoverStyle === 'text' && (
							<ColorPopover
								label={__('Text Color', 'easy-elements-for-gutenberg')}
								color={hoverTextColor}
								onChange={(v) => setAttributes({ hoverTextColor: v })}
							/>
						)}
					</PanelBody>
				)}
			</InspectorControls>
		</>
	);

	return (
		<div {...blockProps}>
			{inspector}

			{hasImages && (
				<BlockControls>
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
										label={__('Edit Gallery', 'easy-elements-for-gutenberg')}
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
							block="easy-elements-for-gutenberg/gallery"
							attributes={attributes}
							httpMethod="POST"
						/>
					</div>
					{lightbox.open && portalDoc && createPortal(
						<div
							className="eelfg-lightbox-gallery is-open"
							onClick={(e) => {
								if (e.target === e.currentTarget) {
									closeLightbox();
								}
							}}
							style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						>
							<span className="eelfg-close" role="button" tabIndex={0} onClick={closeLightbox} style={{ position: 'absolute', top: 15, right: 25, fontSize: 35, lineHeight: 1, color: '#fff', cursor: 'pointer' }}>&times;</span>
							<img className="eelfg-lightbox-image" src={lightbox.images[lightbox.index]} alt="" style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: 10 }} />
							{lightbox.images.length > 1 && (
								<>
									<button type="button" className="eelfg-prev" onClick={lightboxPrev} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer' }}>&#10094;</button>
									<button type="button" className="eelfg-next" onClick={lightboxNext} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer' }}>&#10095;</button>
								</>
							)}
						</div>,
						portalDoc.body
					)}
				</>
			) : (
				<MediaPlaceholder
					className="eelfg-gallery-empty-placeholder"
					icon="format-gallery"
					labels={{
						title: __('Simple Gallery', 'easy-elements-for-gutenberg'),
						instructions: __('Select images to build your gallery.', 'easy-elements-for-gutenberg'),
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
