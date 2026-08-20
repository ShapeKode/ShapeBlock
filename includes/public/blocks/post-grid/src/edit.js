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
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	__experimentalHeading as Heading,
	BoxControl,
	__experimentalDivider as Divider,
	TabPanel,
	__experimentalNumberControl as NumberControl,
	TextControl,
	SelectControl,
	ToggleControl
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

	const FREE_PAGINATION_VALUES = ['numeric'];
	const PRO_UPGRADE_URL = 'https://themewant.com/downloads/easy-elements-for-gutenberg-pro/';
	const isLicenseActive = typeof easyElementsForGutenbergProData !== 'undefined' && easyElementsForGutenbergProData.is_license_active === '1';

	const paginationOptions = applyFilters(
		'easylementsforgutenberg.post-grid.pagination_options',
		[
			{ label: __('Numeric', 'easy-elements-for-gutenberg'), value: 'numeric' }
		],
		{ attributes, setAttributes }
	);

	useEffect(() => {
		const id = 'eelfg-' + Math.random().toString(36).substr(2, 5);
		setAttributes({ blockId: id });
	}, []);


	const getAttrKey = (base, device) => {
		if (device === 'desktop') return base;
		return `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;
	};

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

	categoriesOptions.unshift({ label: __('All Categories', 'easy-elements-for-gutenberg'), value: 'all' });

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
				{ label: __('Large', 'easy-elements-for-gutenberg'), value: 'large' },
				{ label: __('Medium', 'easy-elements-for-gutenberg'), value: 'medium' },
				{ label: __('Thumbnail', 'easy-elements-for-gutenberg'), value: 'thumbnail' },
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
	excludesOptions.unshift({ label: __('No Excludes', 'easy-elements-for-gutenberg'), value: 'no-excludes' });

	// add all
	includesOptions.unshift({ label: __('All', 'easy-elements-for-gutenberg'), value: 'all' });

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				{/* {query panel group} */}
				<PanelBody title={__('Query', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<NumberControl
						label={__('Per Page', 'easy-elements-for-gutenberg')}
						value={attributes.perPage}
						onChange={(value) => setAttributes({ perPage: value })}
						help={__('Number of items to display.', 'easy-elements-for-gutenberg')}
						__next40pxDefaultSize={true}
					/>
					<SelectControl
						label={__('Includes', 'easy-elements-for-gutenberg')}
						value={attributes.posts}
						onChange={(value) => setAttributes({ posts: value })}
						multiple={true}
						options={includesOptions}
					/>
					<SelectControl
						label={__('Excludes', 'easy-elements-for-gutenberg')}
						value={attributes.excludes}
						onChange={(value) => setAttributes({ excludes: value })}
						multiple={true}
						options={excludesOptions}
					/>
					<ToggleControl
						label={__('Ignore Sticky Posts', 'easy-elements-for-gutenberg')}
						checked={attributes.ignoreStikcyPosts}
						onChange={(value) => setAttributes({ ignoreStikcyPosts: value })}
					/>
					<SelectControl
						label={__('Categories', 'easy-elements-for-gutenberg')}
						value={attributes.categories}
						onChange={(value) => setAttributes({ categories: value })}
						options={categoriesOptions}
						multiple={true}
						help={__('Select post categories from here. If you do not select any category, it will display posts from all categories.', 'easy-elements-for-gutenberg')}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<SelectControl
						label={__('Order', 'easy-elements-for-gutenberg')}
						value={attributes.order}
						onChange={(value) => setAttributes({ order: value })}
						options={[
							{ label: __('Ascending', 'easy-elements-for-gutenberg'), value: 'ASC' },
							{ label: __('Descending', 'easy-elements-for-gutenberg'), value: 'DESC' },
						]}
						help={__('Order of items to display.', 'easy-elements-for-gutenberg')}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<SelectControl
						label={__('Order By', 'easy-elements-for-gutenberg')}
						value={attributes.orderby}
						onChange={(value) => setAttributes({ orderby: value })}
						options={[
							{ label: __('Date', 'easy-elements-for-gutenberg'), value: 'date' },
							{ label: __('Title', 'easy-elements-for-gutenberg'), value: 'title' },
							{ label: __('Name', 'easy-elements-for-gutenberg'), value: 'name' },
							{ label: __('ID', 'easy-elements-for-gutenberg'), value: 'id' },
							{ label: __('Random', 'easy-elements-for-gutenberg'), value: 'rand' },
						]}
						help={__('Order of items to display.', 'easy-elements-for-gutenberg')}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<NumberControl
						label={__('Offset', 'easy-elements-for-gutenberg')}
						value={attributes.offset}
						onChange={(value) => setAttributes({ offset: value })}
						help={__('Number of items to skip.', 'easy-elements-for-gutenberg')}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<ToggleControl
						label={__('Is Featured', 'easy-elements-for-gutenberg')}
						checked={attributes.isFeatured}
						onChange={(value) => setAttributes({ isFeatured: value })}
						__nextHasNoMarginBottom={true}
					/>
				</PanelBody>


				<PanelBody title={__('Layout', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<SelectControl
						label={__('Layout', 'easy-elements-for-gutenberg')}
						value={attributes.gridStyle}
						options={[
							{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'default' },
							{ label: __('Style 1', 'easy-elements-for-gutenberg'), value: '1' },
							...(isLicenseActive ? [
								{ label: __('Style 2', 'easy-elements-for-gutenberg'), value: '2' },
							] : []),
						]}
						onChange={(value) => setAttributes({ gridStyle: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				{ /* content panel group */}
				<PanelBody title={__('Content', 'easy-elements-for-gutenberg')} initialOpen={false}>

					<ResponsiveWrapper label={__('Columns', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<SelectControl
								value={attributes[getAttrKey('columns', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('columns', device)]: value })}
								options={[
									{ label: __('1 Column', 'easy-elements-for-gutenberg'), value: '1' },
									{ label: __('2 Column', 'easy-elements-for-gutenberg'), value: '2' },
									{ label: __('3 Column', 'easy-elements-for-gutenberg'), value: '3' },
									{ label: __('4 Column', 'easy-elements-for-gutenberg'), value: '4' },
									{ label: __('6 Column', 'easy-elements-for-gutenberg'), value: '6' },
								]}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
						)}
					</ResponsiveWrapper>

				</PanelBody>

				<PanelBody title={__('Video', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show Video', 'easy-elements-for-gutenberg')}
						checked={attributes.showVideo}
						onChange={(value) => setAttributes({ showVideo: value })}
					/>

					{attributes.showVideo && (
						<>
							<ToggleControl
								label={__('Autoplay', 'easy-elements-for-gutenberg')}
								checked={attributes.videoAutoplay}
								onChange={(value) => setAttributes({ videoAutoplay: value })}
							/>
							<ToggleControl
								label={__('Mute', 'easy-elements-for-gutenberg')}
								checked={attributes.videoMute}
								onChange={(value) => setAttributes({ videoMute: value })}
							/>
							<ResponsiveWrapper label={__('Video Height', 'easy-elements-for-gutenberg')}>
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
							<ResponsiveWrapper label={__('Video Width', 'easy-elements-for-gutenberg')}>
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
								label={__('Show Controls', 'easy-elements-for-gutenberg')}
								checked={attributes.videoControls}
								onChange={(value) => setAttributes({ videoControls: value })}
							/>
						</>
					)}

				</PanelBody>

				<PanelBody title={__('Thumbnail', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<SelectControl
						label={__('Size', 'easy-elements-for-gutenberg')}
						value={attributes.thumbnailSize}
						onChange={(value) => setAttributes({ thumbnailSize: value })}
						options={imageSizeOptions}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<ResponsiveWrapper label={__('Thumbnail Height', 'easy-elements-for-gutenberg')}>
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
						label={__('Animation', 'easy-elements-for-gutenberg')}
						value={attributes.animStyle}
						onChange={(value) => setAttributes({ animStyle: value })}
						options={[
							{ label: __('None', 'easy-elements-for-gutenberg'), value: 'none' },
							{ label: __('Left Right', 'easy-elements-for-gutenberg'), value: 'left_right' },
							{ label: __('Top Bottom', 'easy-elements-for-gutenberg'), value: 'top_bottom' }
						]}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				</PanelBody>

				<PanelBody title={__('Title', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<SelectControl
						label={__('Title Tag', 'easy-elements-for-gutenberg')}
						value={attributes.titleTag}
						onChange={(value) => setAttributes({ titleTag: value })}
						options={[
							{ label: __('H2', 'easy-elements-for-gutenberg'), value: 'h2' },
							{ label: __('H3', 'easy-elements-for-gutenberg'), value: 'h3' },
							{ label: __('H4', 'easy-elements-for-gutenberg'), value: 'h4' },
							{ label: __('H5', 'easy-elements-for-gutenberg'), value: 'h5' },
							{ label: __('H6', 'easy-elements-for-gutenberg'), value: 'h6' },
						]}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<NumberControl
						label={__('Title Trim', 'easy-elements-for-gutenberg')}
						value={attributes.titleTrim}
						onChange={(value) => setAttributes({ titleTrim: value })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				</PanelBody>

				<PanelBody title={__('Excerpt', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show / Hide', 'easy-elements-for-gutenberg')}
						checked={attributes.showExcerpt}
						onChange={(value) => setAttributes({ showExcerpt: value })}
						__nextHasNoMarginBottom={true}
					/>
					{attributes.showExcerpt && (
						<NumberControl
							label={__('Excerpt Trim', 'easy-elements-for-gutenberg')}
							value={attributes.excerptTrim}
							onChange={(value) => setAttributes({ excerptTrim: value })}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
					)}
				</PanelBody>

				<PanelBody title={__('Meta', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show / Hide', 'easy-elements-for-gutenberg')}
						checked={attributes.showMeta}
						onChange={(value) => setAttributes({ showMeta: value })}
						__nextHasNoMarginBottom={true}
					/>
					{attributes.showMeta && (
						<>
							<SelectControl
								label={__('Meta', 'easy-elements-for-gutenberg')}
								value={attributes.allowedMetas}
								onChange={(value) => setAttributes({ allowedMetas: value })}
								multiple={true}
								options={[
									{ label: __('Author', 'easy-elements-for-gutenberg'), value: 'author' },
									{ label: __('Date', 'easy-elements-for-gutenberg'), value: 'date' },
									{ label: __('Category', 'easy-elements-for-gutenberg'), value: 'category' },
									{ label: __('Tag', 'easy-elements-for-gutenberg'), value: 'tag' },
									{ label: __('Comments Count', 'easy-elements-for-gutenberg'), value: 'comments_count' },
								]}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
							{
								attributes.allowedMetas.includes('author') && (
									<TextControl
										label={__('Author Prefix', 'easy-elements-for-gutenberg')}
										value={attributes.authorPrefix}
										onChange={(value) => setAttributes({ authorPrefix: value })}
										__next40pxDefaultSize={true}
										__nextHasNoMarginBottom={true}
									/>
								)}
							<SelectControl
								label={__('Position', 'easy-elements-for-gutenberg')}
								value={attributes.metaPosition}
								onChange={(value) => setAttributes({ metaPosition: value })}
								options={[
									{ label: __('Default', 'easy-elements-for-gutenberg'), value: '' },
									{ label: __('Up Title', 'easy-elements-for-gutenberg'), value: 'up_title' },
									{ label: __('Below Title', 'easy-elements-for-gutenberg'), value: 'below_title' },
									{ label: __('Below Content', 'easy-elements-for-gutenberg'), value: 'below_content' },
								]}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
							<SelectControl
								label={__('Style', 'easy-elements-for-gutenberg')}
								value={attributes.metaStyle}
								onChange={(value) => setAttributes({ metaStyle: value })}
								options={[
									{ label: __('Default', 'easy-elements-for-gutenberg'), value: 'default' },
									{ label: __('Style 1', 'easy-elements-for-gutenberg'), value: '1' },
									{ label: __('Style 2', 'easy-elements-for-gutenberg'), value: '2' },
									{ label: __('Style 3', 'easy-elements-for-gutenberg'), value: '3' }
								]}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
							<ToggleControl
								label={__('Show Date Badge', 'easy-elements-for-gutenberg')}
								checked={attributes.showDateOnTop}
								onChange={(value) => { setAttributes({ showDateOnTop: value }); console.log(value); }}
								__nextHasNoMarginBottom={true}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody title={__('Button', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show / Hide', 'easy-elements-for-gutenberg')}
						checked={attributes.showReadMore}
						onChange={(value) => setAttributes({ showReadMore: value })}
						__nextHasNoMarginBottom={true}
					/>
					{attributes.showReadMore && (
						<>
							<TextControl
								label={__('Text', 'easy-elements-for-gutenberg')}
								value={attributes.readMoreText}
								onChange={(value) => setAttributes({ readMoreText: value })}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
							<IconPicker
								label={__('Icon', 'easy-elements-for-gutenberg')}
								value={attributes.readMoreIcon}
								onChange={(value) => setAttributes({ readMoreIcon: value })}
							/>
							<SelectControl
								label={__('Icon Position', 'easy-elements-for-gutenberg')}
								value={attributes.readMoreIconPosition}
								onChange={(value) => setAttributes({ readMoreIconPosition: value })}
								options={[
									{ label: __('Before', 'easy-elements-for-gutenberg'), value: 'before' },
									{ label: __('After', 'easy-elements-for-gutenberg'), value: 'after' },
								]}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody title={__('Pagination', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ToggleControl
						label={__('Show Pagination', 'easy-elements-for-gutenberg')}
						checked={attributes.pagination}
						onChange={(value) => setAttributes({ pagination: value })}
						__nextHasNoMarginBottom={true}
					/>
					<SelectControl
						label={__('Pagination Type', 'easy-elements-for-gutenberg')}
						value={attributes.paginationType}
						onChange={(value) => setAttributes({ paginationType: value })}
						options={paginationOptions}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				</PanelBody>

			</InspectorControls>
			<InspectorControls group='styles'>
				<PanelBody title={__('Item', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<BackgroundControl
										label={isHover ? __('Background', 'easy-elements-for-gutenberg') : __('Background', 'easy-elements-for-gutenberg')}
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
											label={__('Overlay', 'easy-elements-for-gutenberg')}
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
						label={__('Box Shadow', 'easy-elements-for-gutenberg')}
						value={attributes.itemBoxShadow}
						onChange={(value) => setAttributes({ itemBoxShadow: value })}
					/>
					<Divider />
					<BorderControl
						label={__('Border', 'easy-elements-for-gutenberg')}
						value={attributes.itemBorder}
						onChange={(value) => setAttributes({ itemBorder: value })}
					/>
					<Divider />
					<ResponsiveWrapper label={__('Item Gap', 'easy-elements-for-gutenberg')}>
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
					<ResponsiveWrapper label={__('Item Row Gap', 'easy-elements-for-gutenberg')}>
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
					<ResponsiveWrapper label={__('Padding', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemPadding', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemPadding', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<ResponsiveWrapper label={__('Margin', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemMargin', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemMargin', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<BoxControl
						label={__('Border Radious', 'easy-elements-for-gutenberg')}
						values={attributes.itemBorderRadius}
						onChange={(nextValues) => setAttributes({ itemBorderRadius: nextValues })}
					/>
				</PanelBody>
				<PanelBody title={__('Content', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ResponsiveWrapper label={__('Text Align', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<TextAlignControl
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('contentTextAlign', device)}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Padding', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('contentPadding', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('contentPadding', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
				</PanelBody>
				<PanelBody title={__('Title', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<ColorPopover
										label={isHover ? __('Color', 'easy-elements-for-gutenberg') : __('Color', 'easy-elements-for-gutenberg')}
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
					<ResponsiveWrapper label={__('Padding', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemTitlePadding', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemTitlePadding', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Margin', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemTitleMargin', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemTitleMargin', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Text Align', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<TextAlignControl
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('titleTextAlign', device)}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Typography', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<TypographyControls
								label={__('Typography', 'easy-elements-for-gutenberg')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('itemTitleTypography', device)}
							/>
						)}
					</ResponsiveWrapper>
				</PanelBody>

				<PanelBody title={__('Excerpt', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ColorPopover
						label={__('Color', 'easy-elements-for-gutenberg')}
						color={attributes.itemExcerptColor}
						defaultColor={''}
						onChange={(value) => {
							const hex = (value && typeof value === 'object') ? value.hex : value;
							setAttributes({ itemExcerptColor: hex });
						}}
					/>
					<Divider />
					<ResponsiveWrapper label={__('Padding', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemExcerptPadding', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemExcerptPadding', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Margin', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<BoxControl
								values={attributes[getAttrKey('itemExcerptMargin', device)]}
								onChange={(value) => setAttributes({ [getAttrKey('itemExcerptMargin', device)]: value })}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Text Align', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<TextAlignControl
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('excerptTextAlign', device)}
							/>
						)}
					</ResponsiveWrapper>
					<Divider />
					<ResponsiveWrapper label={__('Typography', 'easy-elements-for-gutenberg')}>
						{(device) => (
							<TypographyControls
								label={__('Typography', 'easy-elements-for-gutenberg')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeKey={getAttrKey('itemExcerptTypography', device)}
							/>
						)}
					</ResponsiveWrapper>
				</PanelBody>

				<PanelBody title={__('Date Badge', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<ColorPopover
						label={__('Color', 'easy-elements-for-gutenberg')}
						color={attributes.topDateColor}
						defaultColor={attributes.topDateColor}
						onChange={(value) => setAttributes({ topDateColor: value })}
					/>
					<ColorPopover
						label={__('Background Color', 'easy-elements-for-gutenberg')}
						color={attributes.topDateBackgroundColor}
						defaultColor={attributes.topDateBackgroundColor}
						onChange={(value) => setAttributes({ topDateBackgroundColor: value })}
					/>
				</PanelBody>
				<PanelBody title={__('Meta', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<Heading>{__('Text', 'easy-elements-for-gutenberg')}</Heading>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<ColorPopover
										label={__('Color', 'easy-elements-for-gutenberg')}
										color={isHover ? attributes.metaColorHover : attributes.metaColor}
										defaultColor={isHover ? attributes.metaColorHover : attributes.metaColor}
										onChange={(value) => setAttributes({ [isHover ? 'metaColorHover' : 'metaColor']: value })}
									/>
								</div>
							)
						}
						}
					</TabPanel>
					<Heading>{__('Icon', 'easy-elements-for-gutenberg')}</Heading>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<ColorPopover
										label={__('Color', 'easy-elements-for-gutenberg')}
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
						label={__('Margin', 'easy-elements-for-gutenberg')}
						values={attributes.metaMargin}
						onChange={(value) => setAttributes({ metaMargin: value })}
					/>
					<TypographyControls
						label={__('Typography', 'easy-elements-for-gutenberg')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeKey="metaTypography"
					/>
				</PanelBody>

				<PanelBody title={__('Button', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<BackgroundControl
										label={isHover ? __('Background', 'easy-elements-for-gutenberg') : __('Background', 'easy-elements-for-gutenberg')}
										colorValue={isHover ? attributes.readMoreBackgroundColorHover : attributes.readMoreBackgroundColor}
										gradientValue={isHover ? attributes.readMoreBackgroundGradientHover : attributes.readMoreBackgroundGradient}
										onColorChange={(value) => {
											const hex = (value && typeof value === 'object') ? value.hex : value;
											setAttributes({ [isHover ? 'readMoreBackgroundColorHover' : 'readMoreBackgroundColor']: hex });
										}}
										onGradientChange={(value) => setAttributes({ [isHover ? 'readMoreBackgroundGradientHover' : 'readMoreBackgroundGradient']: value })}
									/>
									<ColorPopover
										label={isHover ? __('Color', 'easy-elements-for-gutenberg') : __('Color', 'easy-elements-for-gutenberg')}
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
						label={__('Padding', 'easy-elements-for-gutenberg')}
						values={attributes.readMorePadding}
						onChange={(value) => setAttributes({ readMorePadding: value })}
					/>
					<Divider />
					<BoxControl
						label={__('Margin', 'easy-elements-for-gutenberg')}
						values={attributes.readMoreMargin}
						onChange={(value) => setAttributes({ readMoreMargin: value })}
					/>
					<Divider />
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.readMoreBorderRadius}
						onChange={(value) => setAttributes({ readMoreBorderRadius: value })}
					/>
					<Divider />
					<BorderControl
						label={__('Border', 'easy-elements-for-gutenberg')}
						value={attributes.readMoreBorder}
						onChange={(value) => setAttributes({ readMoreBorder: value })}
					/>
					<Divider />
					<ResponsiveWrapper label={__('Text Align', 'easy-elements-for-gutenberg')}>
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
						label={__('Typography', 'easy-elements-for-gutenberg')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeKey="readMoreTypography"
					/>
				</PanelBody>

				<PanelBody title={__('Pagination', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<TabPanel
						className="eshb-tab-panel"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
							{ name: 'hover', title: __('Hover / Active', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
						]}
					>
						{(tab) => {
							const isHover = tab.name === 'hover';
							return (
								<div style={{ marginTop: '15px' }}>
									<ColorPopover
										label={__('Color', 'easy-elements-for-gutenberg')}
										color={isHover ? attributes.paginationColorHover : attributes.paginationColor}
										defaultColor={isHover ? 'var(--eelfg-preset-color-white)' : 'var(--eelfg-preset-color-contrast-2)'}
										onChange={(value) => setAttributes({ [isHover ? 'paginationColorHover' : 'paginationColor']: value })}
									/>
									<ColorPopover
										label={__('Background Color', 'easy-elements-for-gutenberg')}
										color={isHover ? attributes.paginationBackgroundColorHover : attributes.paginationBackgroundColor}
										defaultColor={isHover ? 'var(--eelfg-preset-color-primary)' : 'var(--eelfg-preset-color-tertiary)'}
										onChange={(value) => setAttributes({ [isHover ? 'paginationBackgroundColorHover' : 'paginationBackgroundColor']: value })}
									/>
								</div>
							);
						}}
					</TabPanel>

					{attributes.paginationType == 'load_more' && (
						<ResponsiveWrapper label={__('Button Width (%)', 'easy-elements-for-gutenberg')}>
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
						label={__('Border', 'easy-elements-for-gutenberg')}
						value={attributes.paginationBtnBorder}
						onChange={(value) => setAttributes({ paginationBtnBorder: value })}
					/>
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.paginationBtnBorderRadius}
						onChange={(value) => setAttributes({ paginationBtnBorderRadius: value })}
					/>

				</PanelBody>

				<PanelBody title={__('Thumbnail', 'easy-elements-for-gutenberg')} initialOpen={false}>
					<BoxControl
						label={__('Border Radius', 'easy-elements-for-gutenberg')}
						values={attributes.thumbnailBorderRadius}
						onChange={(value) => setAttributes({ thumbnailBorderRadius: value })}
					/>
				</PanelBody>

				{attributes.gridStyle == '2' && (

					<PanelBody title={__('Category', 'easy-elements-for-gutenberg')} initialOpen={false}>
						<TabPanel
							className="eshb-tab-panel"
							activeClass="is-active"
							tabs={[
								{ name: 'normal', title: __('Normal', 'easy-elements-for-gutenberg'), className: 'eshb-tab-normal' },
								{ name: 'hover', title: __('Hover', 'easy-elements-for-gutenberg'), className: 'eshb-tab-hover' },
							]}
						>
							{(tab) => {
								const isHover = tab.name === 'hover';
								return (
									<div style={{ marginTop: '15px' }}>
										<ColorPopover
											label={__('Color', 'easy-elements-for-gutenberg')}
											color={isHover ? attributes.categoryColorHover : attributes.categoryColor}
											defaultColor={''}
											onChange={(value) => {
												const hex = (value && typeof value === 'object') ? value.hex : value;
												setAttributes({ [isHover ? 'categoryColorHover' : 'categoryColor']: hex });
											}}
										/>
										<ColorPopover
											label={__('Background Color', 'easy-elements-for-gutenberg')}
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
							label={__('Padding', 'easy-elements-for-gutenberg')}
							values={attributes.categoryPadding}
							onChange={(value) => setAttributes({ categoryPadding: value })}
						/>
						<Divider />
						<BoxControl
							label={__('Margin', 'easy-elements-for-gutenberg')}
							values={attributes.categoryMargin}
							onChange={(value) => setAttributes({ categoryMargin: value })}
						/>
					</PanelBody>
				)}
			</InspectorControls>

			<ServerSideRender block="easy-elements-for-gutenberg/post-grid" attributes={attributes} httpMethod="POST" />
		</div >
	);
}
