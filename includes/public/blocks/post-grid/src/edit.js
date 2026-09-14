/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';

import {
	PanelBody,
	__experimentalHeading as Heading,
	BoxControl,
	__experimentalDivider as Divider,
	TabPanel,
	__experimentalNumberControl as NumberControl,
	TextControl,
	SelectControl,
	ToggleControl,
	ToolbarDropdownMenu
} from '@wordpress/components';
import BackgroundControl from '../../custom-components/BackgroundControl';
import TypographyControls from '../../custom-components/TypographyControls';
import ColorPopover from '../../custom-components/ColorPopover';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import RangeControlWithUnit from '../../custom-components/RangeControlWithUnit';
import TextAlignControl from '../../custom-components/TextAlignControl';
import BoxShadowControl from '../../custom-components/BoxShadowControls';
import BorderControl from '../../custom-components/BorderControl';
import IconPicker from '../../custom-components/IconPicker';
/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
import { useState, useEffect } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import metadata from './block.json';

export default function Edit({ attributes, setAttributes }) {

	const paginationOptions = applyFilters(
		'shapeblock.post-grid.pagination_options',
		[
			{ label: __('Numeric', 'shapeblock'), value: 'numeric' }
		],
		{ attributes, setAttributes }
	);

	useEffect(() => {
		const id = 'shapeblock-' + Math.random().toString(36).substr(2, 5);
		setAttributes({ blockId: id });
	}, []);


	const getAttrKey = (base, device) => {
		if (device === 'desktop') return base;
		return `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;
	};

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (contentTextAlign / contentTextAlignTablet / contentTextAlignMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'contentTextAlign' : `contentTextAlign${dev.charAt(0).toUpperCase() + dev.slice(1)}`;

	const categories = useSelect(
		(select) =>
			select('core').getEntityRecords(
				'taxonomy',
				'category',
				{ per_page: -1 }
			),
		[]
	);

	let categoriesOptions = (categories || []).map((category) => ({
		label: decodeEntities(category.name),
		value: category.slug,
	}));

	categoriesOptions.unshift({ label: __('All Categories', 'shapeblock'), value: 'all' });

	const imageSizeOptions = useSelect((select) => {
		const blockEditorStore = select('core/block-editor');
		const editorStore = select('core'); // Testing 'core' store as well

		const blockEditorSettings = blockEditorStore && typeof blockEditorStore.getSettings === 'function' ? blockEditorStore.getSettings() : null;
		const coreSettings = editorStore && typeof editorStore.getSettings === 'function' ? editorStore.getSettings() : null;

		const sizes = blockEditorSettings?.imageSizes || coreSettings?.imageSizes;

		let options = [];

		if (sizes && Array.isArray(sizes)) {
			options = sizes.map((size) => ({
				label: size.name,
				value: size.slug,
			}));
		} else {
			options = [
				{ label: __('Large', 'shapeblock'), value: 'large' },
				{ label: __('Medium', 'shapeblock'), value: 'medium' },
				{ label: __('Thumbnail', 'shapeblock'), value: 'thumbnail' },
			];
		}

		return options;
	}, []);

	const posts = useSelect(
		(select) =>
			select('core').getEntityRecords(
				'postType',
				'post',
				{ per_page: -1 }
			),
		[]
	);

	let postsOptions = (posts || []).map((post) => ({
		label: decodeEntities(post.title.rendered),
		value: post.id,
	}));



	let excludesOptions = [...postsOptions];
	let includesOptions = postsOptions.filter(opt => !(Array.isArray(attributes.excludes) ? attributes.excludes : []).includes(opt.value));

	// add no excludes
	excludesOptions.unshift({ label: __('No Excludes', 'shapeblock'), value: 'no-excludes' });

	// add all
	includesOptions.unshift({ label: __('All', 'shapeblock'), value: 'all' });

	// --- Tab 1: Settings (content / query / behavior) -------------------------
	const settingsTab = (
		<>
			{/* {query panel group} */}
			<PanelBody title={__('Query', 'shapeblock')} initialOpen={false}>
				<NumberControl
					label={__('Per Page', 'shapeblock')}
					value={attributes.perPage}
					onChange={(value) => setAttributes({ perPage: value })}
					help={__('Number of items to display.', 'shapeblock')}
					__next40pxDefaultSize={true}
				/>
				<SelectControl
					label={__('Includes', 'shapeblock')}
					value={attributes.posts}
					onChange={(value) => setAttributes({ posts: value })}
					multiple={true}
					options={includesOptions}
				/>
				<SelectControl
					label={__('Excludes', 'shapeblock')}
					value={attributes.excludes}
					onChange={(value) => setAttributes({ excludes: value })}
					multiple={true}
					options={excludesOptions}
				/>
				<ToggleControl
					label={__('Ignore Sticky Posts', 'shapeblock')}
					checked={attributes.ignoreStikcyPosts}
					onChange={(value) => setAttributes({ ignoreStikcyPosts: value })}
				/>
				<SelectControl
					label={__('Categories', 'shapeblock')}
					value={attributes.categories}
					onChange={(value) => setAttributes({ categories: value })}
					options={categoriesOptions}
					multiple={true}
					help={__('Select post categories from here. If you do not select any category, it will display posts from all categories.', 'shapeblock')}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<SelectControl
					label={__('Order', 'shapeblock')}
					value={attributes.order}
					onChange={(value) => setAttributes({ order: value })}
					options={[
						{ label: __('Ascending', 'shapeblock'), value: 'ASC' },
						{ label: __('Descending', 'shapeblock'), value: 'DESC' },
					]}
					help={__('Order of items to display.', 'shapeblock')}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<SelectControl
					label={__('Order By', 'shapeblock')}
					value={attributes.orderby}
					onChange={(value) => setAttributes({ orderby: value })}
					options={[
						{ label: __('Date', 'shapeblock'), value: 'date' },
						{ label: __('Title', 'shapeblock'), value: 'title' },
						{ label: __('Name', 'shapeblock'), value: 'name' },
						{ label: __('ID', 'shapeblock'), value: 'id' },
						{ label: __('Random', 'shapeblock'), value: 'rand' },
					]}
					help={__('Order of items to display.', 'shapeblock')}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<NumberControl
					label={__('Offset', 'shapeblock')}
					value={attributes.offset}
					onChange={(value) => setAttributes({ offset: value })}
					help={__('Number of items to skip.', 'shapeblock')}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<ToggleControl
					label={__('Is Featured', 'shapeblock')}
					checked={attributes.isFeatured}
					onChange={(value) => setAttributes({ isFeatured: value })}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>

			<PanelBody title={__('Video', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Video', 'shapeblock')}
					checked={attributes.showVideo}
					onChange={(value) => setAttributes({ showVideo: value })}
				/>

				{attributes.showVideo && (
					<>
						<ToggleControl
							label={__('Autoplay', 'shapeblock')}
							checked={attributes.videoAutoplay}
							onChange={(value) => setAttributes({ videoAutoplay: value })}
						/>
						<ToggleControl
							label={__('Mute', 'shapeblock')}
							checked={attributes.videoMute}
							onChange={(value) => setAttributes({ videoMute: value })}
						/>
						<ResponsiveWrapper label={__('Video Height', 'shapeblock')}>
							{(device) => (
								<RangeControlWithUnit
									attributes={attributes}
									setAttributes={setAttributes}
									attributeKey={getAttrKey('videoHeight', device)}
									units={['px', '%', 'em', 'rem', 'vw', 'vh']}
									min={0}
									max={1080}
									step={1}
								/>
							)}
						</ResponsiveWrapper>
						<ResponsiveWrapper label={__('Video Width', 'shapeblock')}>
							{(device) => (
								<RangeControlWithUnit
									attributes={attributes}
									setAttributes={setAttributes}
									attributeKey={getAttrKey('videoWidth', device)}
									units={['px', '%', 'em', 'rem', 'vw', 'vh']}
									min={0}
									max={1080}
									step={1}
								/>
							)}
						</ResponsiveWrapper>
						<ToggleControl
							label={__('Show Controls', 'shapeblock')}
							checked={attributes.videoControls}
							onChange={(value) => setAttributes({ videoControls: value })}
						/>
					</>
				)}

			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Title Tag', 'shapeblock')}
					value={attributes.titleTag}
					onChange={(value) => setAttributes({ titleTag: value })}
					options={[
						{ label: __('H2', 'shapeblock'), value: 'h2' },
						{ label: __('H3', 'shapeblock'), value: 'h3' },
						{ label: __('H4', 'shapeblock'), value: 'h4' },
						{ label: __('H5', 'shapeblock'), value: 'h5' },
						{ label: __('H6', 'shapeblock'), value: 'h6' },
					]}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<NumberControl
					label={__('Title Trim', 'shapeblock')}
					value={attributes.titleTrim}
					onChange={(value) => setAttributes({ titleTrim: value })}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>

			<PanelBody title={__('Excerpt', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show / Hide', 'shapeblock')}
					checked={attributes.showExcerpt}
					onChange={(value) => setAttributes({ showExcerpt: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showExcerpt && (
					<NumberControl
						label={__('Excerpt Trim', 'shapeblock')}
						value={attributes.excerptTrim}
						onChange={(value) => setAttributes({ excerptTrim: value })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				)}
			</PanelBody>

			<PanelBody title={__('Meta', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show / Hide', 'shapeblock')}
					checked={attributes.showMeta}
					onChange={(value) => setAttributes({ showMeta: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showMeta && (
					<>
						<SelectControl
							label={__('Meta', 'shapeblock')}
							value={attributes.allowedMetas}
							onChange={(value) => setAttributes({ allowedMetas: value })}
							multiple={true}
							options={[
								{ label: __('Author', 'shapeblock'), value: 'author' },
								{ label: __('Date', 'shapeblock'), value: 'date' },
								{ label: __('Category', 'shapeblock'), value: 'category' },
								{ label: __('Tag', 'shapeblock'), value: 'tag' },
								{ label: __('Comments Count', 'shapeblock'), value: 'comments_count' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						{
							attributes.allowedMetas.includes('author') && (
								<TextControl
									label={__('Author Prefix', 'shapeblock')}
									value={attributes.authorPrefix}
									onChange={(value) => setAttributes({ authorPrefix: value })}
									__next40pxDefaultSize={true}
									__nextHasNoMarginBottom={true}
								/>
							)}
						<SelectControl
							label={__('Position', 'shapeblock')}
							value={attributes.metaPosition}
							onChange={(value) => setAttributes({ metaPosition: value })}
							options={[
								{ label: __('Default', 'shapeblock'), value: '' },
								{ label: __('Up Title', 'shapeblock'), value: 'up_title' },
								{ label: __('Below Title', 'shapeblock'), value: 'below_title' },
								{ label: __('Below Content', 'shapeblock'), value: 'below_content' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<SelectControl
							label={__('Style', 'shapeblock')}
							value={attributes.metaStyle}
							onChange={(value) => setAttributes({ metaStyle: value })}
							options={[
								{ label: __('Default', 'shapeblock'), value: 'default' },
								{ label: __('Style 1', 'shapeblock'), value: '1' },
								{ label: __('Style 2', 'shapeblock'), value: '2' },
								{ label: __('Style 3', 'shapeblock'), value: '3' }
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label={__('Show Date Badge', 'shapeblock')}
							checked={attributes.showDateOnTop}
							onChange={(value) => { setAttributes({ showDateOnTop: value }); console.log(value); }}
							__nextHasNoMarginBottom={true}
						/>
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show / Hide', 'shapeblock')}
					checked={attributes.showReadMore}
					onChange={(value) => setAttributes({ showReadMore: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showReadMore && (
					<>
						<TextControl
							label={__('Text', 'shapeblock')}
							value={attributes.readMoreText}
							onChange={(value) => setAttributes({ readMoreText: value })}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<IconPicker
							label={__('Icon', 'shapeblock')}
							value={attributes.readMoreIcon}
							onChange={(value) => setAttributes({ readMoreIcon: value })}
						/>
						<SelectControl
							label={__('Icon Position', 'shapeblock')}
							value={attributes.readMoreIconPosition}
							onChange={(value) => setAttributes({ readMoreIconPosition: value })}
							options={[
								{ label: __('Before', 'shapeblock'), value: 'before' },
								{ label: __('After', 'shapeblock'), value: 'after' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Pagination', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Pagination', 'shapeblock')}
					checked={attributes.pagination}
					onChange={(value) => setAttributes({ pagination: value })}
					__nextHasNoMarginBottom={true}
				/>
				<SelectControl
					label={__('Pagination Type', 'shapeblock')}
					value={attributes.paginationType}
					onChange={(value) => setAttributes({ paginationType: value })}
					options={paginationOptions}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (columns / alignment / gap / geometry / image size) ----
	const layoutTab = (
		<>
			<PanelBody title={__('Preset', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Layout', 'shapeblock')}
					value={attributes.gridStyle}
					options={[
						{ label: __('Default', 'shapeblock'), value: 'default' },
						{ label: __('Style 1', 'shapeblock'), value: '1' },
					]}
					onChange={(value) => setAttributes({ gridStyle: value })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* content panel group */}
			<PanelBody title={__('Content', 'shapeblock')} initialOpen={false}>

				<ResponsiveWrapper label={__('Columns', 'shapeblock')}>
					{(device) => (
						<SelectControl
							value={attributes[getAttrKey('columns', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('columns', device)]: value })}
							options={[
								{ label: __('1 Column', 'shapeblock'), value: '1' },
								{ label: __('2 Column', 'shapeblock'), value: '2' },
								{ label: __('3 Column', 'shapeblock'), value: '3' },
								{ label: __('4 Column', 'shapeblock'), value: '4' },
								{ label: __('6 Column', 'shapeblock'), value: '6' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Text Align', 'shapeblock')}>
					{(device) => (
						<TextAlignControl
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('contentTextAlign', device)}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('contentPadding', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('contentPadding', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>

			</PanelBody>

			<PanelBody title={__('Thumbnail', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Size', 'shapeblock')}
					value={attributes.thumbnailSize}
					onChange={(value) => setAttributes({ thumbnailSize: value })}
					options={imageSizeOptions}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<ResponsiveWrapper label={__('Thumbnail Height', 'shapeblock')}>
					{(device) => (
						<RangeControlWithUnit
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('thumbnailHeight', device)}
							units={['px', '%', 'em', 'rem', 'vw', 'vh']}
							min={0}
							max={500}
							step={1}
						/>
					)}
				</ResponsiveWrapper>
				<SelectControl
					label={__('Animation', 'shapeblock')}
					value={attributes.animStyle}
					onChange={(value) => setAttributes({ animStyle: value })}
					options={[
						{ label: __('None', 'shapeblock'), value: 'none' },
						{ label: __('Left Right', 'shapeblock'), value: 'left_right' },
						{ label: __('Top Bottom', 'shapeblock'), value: 'top_bottom' }
					]}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>

			<PanelBody title={__('Item', 'shapeblock')} initialOpen={false}>
				<ResponsiveWrapper label={__('Item Gap', 'shapeblock')}>
					{(device) => (
						<NumberControl
							value={attributes[getAttrKey('itemGap', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemGap', device)]: value })}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
							max={5}
						/>
					)}
				</ResponsiveWrapper>
				<ResponsiveWrapper label={__('Item Row Gap', 'shapeblock')}>
					{(device) => (
						<NumberControl
							value={attributes[getAttrKey('itemRowGap', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemRowGap', device)]: value })}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
							max={5}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemPadding', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemPadding', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
				<ResponsiveWrapper label={__('Margin', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemMargin', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemMargin', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (colors / typography / background / border / hover) -----
	const styleTab = (
		<>
			<PanelBody title={__('Item', 'shapeblock')} initialOpen={false}>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<BackgroundControl
									label={isHover ? __('Background', 'shapeblock') : __('Background', 'shapeblock')}
									colorValue={isHover ? attributes.itemBackgroundColorHover : attributes.itemBackgroundColor}
									gradientValue={isHover ? attributes.itemBackgroundGradientHover : attributes.itemBackgroundGradient}
									onColorChange={(value) => {
										const hex = (value && typeof value === 'object') ? value.hex : value;
										setAttributes({ [isHover ? 'itemBackgroundColorHover' : 'itemBackgroundColor']: hex });
									}}
									onGradientChange={(value) => setAttributes({ [isHover ? 'itemBackgroundGradientHover' : 'itemBackgroundGradient']: value })}
								/>
								{!isHover && (
									<BackgroundControl
										label={__('Overlay', 'shapeblock')}
										colorValue={attributes.itemOverlayBackgroundColor}
										gradientValue={attributes.itemOverlayBackgroundGradient}
										onColorChange={(value) => {
											const hex = (value && typeof value === 'object') ? value.hex : value;
											setAttributes({ itemOverlayBackgroundColorHover: hex });
										}}
										onGradientChange={(value) => setAttributes({ itemOverlayBackgroundGradientHover: value })}
									/>
								)}
							</div>
						);
					}}
				</TabPanel>
				<Divider />
				<BoxShadowControl
					label={__('Box Shadow', 'shapeblock')}
					value={attributes.itemBoxShadow}
					onChange={(value) => setAttributes({ itemBoxShadow: value })}
				/>
				<Divider />
				<BorderControl
					label={__('Border', 'shapeblock')}
					value={attributes.itemBorder}
					onChange={(value) => setAttributes({ itemBorder: value })}
				/>
				<Divider />
				<BoxControl
					label={__('Border Radious', 'shapeblock')}
					values={attributes.itemBorderRadius}
					onChange={(nextValues) => setAttributes({ itemBorderRadius: nextValues })}
				/>
			</PanelBody>
			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<ColorPopover
									label={isHover ? __('Color', 'shapeblock') : __('Color', 'shapeblock')}
									color={isHover ?
										attributes.itemTitleColorHover
										: attributes.itemTitleColor}
									defaultColor={isHover ? '' : ''}
									onChange={(value) => {
										const hex = (value && typeof value === 'object') ? value.hex : value;
										setAttributes({ [isHover ? 'itemTitleColorHover' : 'itemTitleColor']: hex });
									}}
								/>
							</div>
						);
					}}
				</TabPanel>
				<Divider />
				<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemTitlePadding', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemTitlePadding', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Margin', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemTitleMargin', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemTitleMargin', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Text Align', 'shapeblock')}>
					{(device) => (
						<TextAlignControl
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('titleTextAlign', device)}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Typography', 'shapeblock')}>
					{(device) => (
						<TypographyControls
							label={__('Typography', 'shapeblock')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('itemTitleTypography', device)}
						/>
					)}
				</ResponsiveWrapper>
			</PanelBody>

			<PanelBody title={__('Excerpt', 'shapeblock')} initialOpen={false}>
				<ColorPopover
					label={__('Color', 'shapeblock')}
					color={attributes.itemExcerptColor}
					defaultColor={''}
					onChange={(value) => {
						const hex = (value && typeof value === 'object') ? value.hex : value;
						setAttributes({ itemExcerptColor: hex });
					}}
				/>
				<Divider />
				<ResponsiveWrapper label={__('Padding', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemExcerptPadding', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemExcerptPadding', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Margin', 'shapeblock')}>
					{(device) => (
						<BoxControl
							values={attributes[getAttrKey('itemExcerptMargin', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('itemExcerptMargin', device)]: value })}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Text Align', 'shapeblock')}>
					{(device) => (
						<TextAlignControl
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('excerptTextAlign', device)}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<ResponsiveWrapper label={__('Typography', 'shapeblock')}>
					{(device) => (
						<TypographyControls
							label={__('Typography', 'shapeblock')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('itemExcerptTypography', device)}
						/>
					)}
				</ResponsiveWrapper>
			</PanelBody>

			<PanelBody title={__('Date Badge', 'shapeblock')} initialOpen={false}>
				<ColorPopover
					label={__('Color', 'shapeblock')}
					color={attributes.topDateColor}
					defaultColor={attributes.topDateColor}
					onChange={(value) => setAttributes({ topDateColor: value })}
				/>
				<ColorPopover
					label={__('Background Color', 'shapeblock')}
					color={attributes.topDateBackgroundColor}
					defaultColor={attributes.topDateBackgroundColor}
					onChange={(value) => setAttributes({ topDateBackgroundColor: value })}
				/>
			</PanelBody>
			<PanelBody title={__('Meta', 'shapeblock')} initialOpen={false}>
				<Heading>{__('Text', 'shapeblock')}</Heading>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<ColorPopover
									label={__('Color', 'shapeblock')}
									color={isHover ? attributes.metaColorHover : attributes.metaColor}
									defaultColor={isHover ? attributes.metaColorHover : attributes.metaColor}
									onChange={(value) => setAttributes({ [isHover ? 'metaColorHover' : 'metaColor']: value })}
								/>
							</div>
						)
					}
					}
				</TabPanel>
				<Heading>{__('Icon', 'shapeblock')}</Heading>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<ColorPopover
									label={__('Color', 'shapeblock')}
									color={isHover ? attributes.metaIconColorHover : attributes.metaIconColor}
									defaultColor={isHover ? attributes.metaIconColorHover : attributes.metaIconColor}
									onChange={(value) => setAttributes({ [isHover ? 'metaIconColorHover' : 'metaIconColor']: value })}
								/>
							</div>
						)
					}
					}
				</TabPanel>
				<BoxControl
					label={__('Margin', 'shapeblock')}
					values={attributes.metaMargin}
					onChange={(value) => setAttributes({ metaMargin: value })}
				/>
				<TypographyControls
					label={__('Typography', 'shapeblock')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeKey="metaTypography"
				/>
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<BackgroundControl
									label={isHover ? __('Background', 'shapeblock') : __('Background', 'shapeblock')}
									colorValue={isHover ? attributes.readMoreBackgroundColorHover : attributes.readMoreBackgroundColor}
									gradientValue={isHover ? attributes.readMoreBackgroundGradientHover : attributes.readMoreBackgroundGradient}
									onColorChange={(value) => {
										const hex = (value && typeof value === 'object') ? value.hex : value;
										setAttributes({ [isHover ? 'readMoreBackgroundColorHover' : 'readMoreBackgroundColor']: hex });
									}}
									onGradientChange={(value) => setAttributes({ [isHover ? 'readMoreBackgroundGradientHover' : 'readMoreBackgroundGradient']: value })}
								/>
								<ColorPopover
									label={isHover ? __('Color', 'shapeblock') : __('Color', 'shapeblock')}
									color={isHover ?
										attributes.readMoreColorHover
										: attributes.readMoreColor}
									defaultColor={isHover ? '' : ''}
									onChange={(value) => {
										const hex = (value && typeof value === 'object') ? value.hex : value;
										setAttributes({ [isHover ? 'readMoreColorHover' : 'readMoreColor']: hex });
									}}
								/>
							</div>
						);
					}}
				</TabPanel>
				<Divider />
				<BoxControl
					label={__('Padding', 'shapeblock')}
					values={attributes.readMorePadding}
					onChange={(value) => setAttributes({ readMorePadding: value })}
				/>
				<Divider />
				<BoxControl
					label={__('Margin', 'shapeblock')}
					values={attributes.readMoreMargin}
					onChange={(value) => setAttributes({ readMoreMargin: value })}
				/>
				<Divider />
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.readMoreBorderRadius}
					onChange={(value) => setAttributes({ readMoreBorderRadius: value })}
				/>
				<Divider />
				<BorderControl
					label={__('Border', 'shapeblock')}
					value={attributes.readMoreBorder}
					onChange={(value) => setAttributes({ readMoreBorder: value })}
				/>
				<Divider />
				<ResponsiveWrapper label={__('Text Align', 'shapeblock')}>
					{(device) => (
						<TextAlignControl
							attributes={attributes}
							setAttributes={setAttributes}
							attributeKey={getAttrKey('buttonTextAlign', device)}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				<TypographyControls
					label={__('Typography', 'shapeblock')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeKey="readMoreTypography"
				/>
			</PanelBody>

			<PanelBody title={__('Pagination', 'shapeblock')} initialOpen={false}>
				<TabPanel
					className="shapeblock-tab-panel"
					activeClass="is-active"
					tabs={[
						{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
						{ name: 'hover', title: __('Hover / Active', 'shapeblock'), className: 'shapeblock-tab-hover' },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						return (
							<div style={{ marginTop: '15px' }}>
								<ColorPopover
									label={__('Color', 'shapeblock')}
									color={isHover ? attributes.paginationColorHover : attributes.paginationColor}
									defaultColor={isHover ? 'var(--shapeblock-preset-color-white)' : 'var(--shapeblock-preset-color-contrast-2)'}
									onChange={(value) => setAttributes({ [isHover ? 'paginationColorHover' : 'paginationColor']: value })}
								/>
								<ColorPopover
									label={__('Background Color', 'shapeblock')}
									color={isHover ? attributes.paginationBackgroundColorHover : attributes.paginationBackgroundColor}
									defaultColor={isHover ? 'var(--shapeblock-preset-color-primary)' : 'var(--shapeblock-preset-color-tertiary)'}
									onChange={(value) => setAttributes({ [isHover ? 'paginationBackgroundColorHover' : 'paginationBackgroundColor']: value })}
								/>
							</div>
						);
					}}
				</TabPanel>

				{attributes.paginationType == 'load_more' && (
					<ResponsiveWrapper label={__('Button Width (%)', 'shapeblock')}>
						{(device) => (
							<RangeControlWithUnit
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('paginationBtnWidth', device)}
								units={['px', '%', 'em', 'rem', 'vw', 'vh']}
								min={0}
								max={500}
								step={1}
							/>
						)}
					</ResponsiveWrapper>
				)}

				<BorderControl
					label={__('Border', 'shapeblock')}
					value={attributes.paginationBtnBorder}
					onChange={(value) => setAttributes({ paginationBtnBorder: value })}
				/>
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.paginationBtnBorderRadius}
					onChange={(value) => setAttributes({ paginationBtnBorderRadius: value })}
				/>
				<Divider />
				<TypographyControls
					label={__('Typography', 'shapeblock')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeKey="paginationTypography"
				/>

			</PanelBody>

			<PanelBody title={__('Thumbnail', 'shapeblock')} initialOpen={false}>
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.thumbnailBorderRadius}
					onChange={(value) => setAttributes({ thumbnailBorderRadius: value })}
				/>
			</PanelBody>

			{attributes.gridStyle == '2' && (

				<PanelBody title={__('Category', 'shapeblock')} initialOpen={false}>
					<TabPanel
						className="shapeblock-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'shapeblock'), className: 'shapeblock-tab-normal' },
							{ name: 'hover', title: __('Hover', 'shapeblock'), className: 'shapeblock-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<ColorPopover
										label={__('Color', 'shapeblock')}
										color={isHover ? attributes.categoryColorHover : attributes.categoryColor}
										defaultColor={''}
										onChange={(value) => {
											const hex = (value && typeof value === 'object') ? value.hex : value;
											setAttributes({ [isHover ? 'categoryColorHover' : 'categoryColor']: hex });
										}}
									/>
									<ColorPopover
										label={__('Background Color', 'shapeblock')}
										color={isHover ? attributes.categoryBackgroundColorHover : attributes.categoryBackgroundColor}
										defaultColor={''}
										onChange={(value) => {
											const hex = (value && typeof value === 'object') ? value.hex : value;
											setAttributes({ [isHover ? 'categoryBackgroundColorHover' : 'categoryBackgroundColor']: hex });
										}}
									/>
								</div>
							);
						}}
					</TabPanel>
					<Divider />
					<BoxControl
						label={__('Padding', 'shapeblock')}
						values={attributes.categoryPadding}
						onChange={(value) => setAttributes({ categoryPadding: value })}
					/>
					<Divider />
					<BoxControl
						label={__('Margin', 'shapeblock')}
						values={attributes.categoryMargin}
						onChange={(value) => setAttributes({ categoryMargin: value })}
					/>
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<AlignmentControl
					value={attributes[alignKey]}
					onChange={(value) => setAttributes({ [alignKey]: value || (dev === 'desktop' ? 'left' : '') })}
				/>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'h3').toUpperCase()}
					controls={['h2', 'h3', 'h4', 'h5', 'h6'].map((t) => ({
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
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/post-grid" attributes={attributes} httpMethod="POST" />
		</div >
	);
}
