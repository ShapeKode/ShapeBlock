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
import AdvancedControls from '../../custom-components/AdvancedControls';
/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
import { useEffect } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';

export default function Edit({ attributes, setAttributes, clientId }) {

	const paginationOptions = applyFilters(
		'shapeblock.post-grid.pagination_options',
		[
			{ label: __('Numeric', 'shapeblock'), value: 'numeric' }
		],
		{ attributes, setAttributes }
	);

	// A block id once, kept after that: it scopes the CSS and names the page
	// parameter (?paged_<id>), so changing it would break saved page links.
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: 'shapeblock-' + clientId.slice(0, 6) });
		}
	}, [attributes.blockId, clientId, setAttributes]);


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
		const blockEditorSettings = blockEditorStore && typeof blockEditorStore.getSettings === 'function' ? blockEditorStore.getSettings() : null;
		const sizes = blockEditorSettings?.imageSizes;

		if (sizes && Array.isArray(sizes)) {
			return sizes.map((size) => ({
				label: size.name,
				value: size.slug,
			}));
		}

		return [
			{ label: __('Large', 'shapeblock'), value: 'large' },
			{ label: __('Medium', 'shapeblock'), value: 'medium' },
			{ label: __('Thumbnail', 'shapeblock'), value: 'thumbnail' },
		];
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
			<PanelBody title={__('Query', 'shapeblock')} initialOpen={true}>
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
					label={__('Only Featured (Sticky) Posts', 'shapeblock')}
					help={__('Shows only the posts marked "Stick to the top of the blog".', 'shapeblock')}
					checked={attributes.isFeatured}
					onChange={(value) => setAttributes({ isFeatured: value })}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>

			<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Title HTML Tag', 'shapeblock')}
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
					label={__('Title Length (words)', 'shapeblock')}
					value={attributes.titleTrim}
					onChange={(value) => setAttributes({ titleTrim: value })}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>

			<PanelBody title={__('Excerpt', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Excerpt', 'shapeblock')}
					checked={attributes.showExcerpt}
					onChange={(value) => setAttributes({ showExcerpt: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showExcerpt && (
					<NumberControl
						label={__('Excerpt Length (words)', 'shapeblock')}
						value={attributes.excerptTrim}
						onChange={(value) => setAttributes({ excerptTrim: value })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				)}
			</PanelBody>

			<PanelBody title={__('Meta', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Meta', 'shapeblock')}
					checked={attributes.showMeta}
					onChange={(value) => setAttributes({ showMeta: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showMeta && (
					<>
						<SelectControl
							label={__('Items to Show', 'shapeblock')}
								help={__('Hold Ctrl (Cmd on Mac) to pick more than one.', 'shapeblock')}
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
								{ label: __('Above Title', 'shapeblock'), value: 'up_title' },
								{ label: __('Below Title', 'shapeblock'), value: 'below_title' },
								{ label: __('Below Content', 'shapeblock'), value: 'below_content' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label={__('Show Date Badge', 'shapeblock')}
							checked={attributes.showDateOnTop}
							onChange={(value) => setAttributes({ showDateOnTop: value })}
							__nextHasNoMarginBottom={true}
						/>
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Button', 'shapeblock')} initialOpen={false}>
				<ToggleControl
					label={__('Show Button', 'shapeblock')}
					checked={attributes.showReadMore}
					onChange={(value) => setAttributes({ showReadMore: value })}
					__nextHasNoMarginBottom={true}
				/>
				{attributes.showReadMore && (
					<>
						<ToggleControl
							label={__('Keep the button at the bottom of the card', 'shapeblock')}
							help={__('Lines the buttons up across a row when excerpts differ in length. For the Default card style.', 'shapeblock')}
							checked={!!attributes.buttonAtBottom}
							onChange={(value) => setAttributes({ buttonAtBottom: value })}
							__nextHasNoMarginBottom={true}
						/>
						<TextControl
							label={__('Button Text', 'shapeblock')}
							value={attributes.readMoreText}
							onChange={(value) => setAttributes({ readMoreText: value })}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<IconPicker
							label={__('Button Icon', 'shapeblock')}
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

	// The gutter is a step on a fixed scale (render.php: 0 / 0.25 / 0.5 / 1 / 1.5 / 3rem).
	const GAP_STEPS = [
		{ label: __('None', 'shapeblock'), value: '0' },
		{ label: __('Extra Small (4px)', 'shapeblock'), value: '1' },
		{ label: __('Small (8px)', 'shapeblock'), value: '2' },
		{ label: __('Medium (16px)', 'shapeblock'), value: '3' },
		{ label: __('Large (24px)', 'shapeblock'), value: '4' },
		{ label: __('Extra Large (48px)', 'shapeblock'), value: '5' },
	];
	const gapSelect = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<SelectControl
					value={String(attributes[getAttrKey(base, device)] ?? '')}
					onChange={(value) => setAttributes({ [getAttrKey(base, device)]: value })}
					options={GAP_STEPS}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			)}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => (
				<BoxControl
					values={attributes[getAttrKey(base, device)]}
					onChange={(value) => setAttributes({ [getAttrKey(base, device)]: value })}
				/>
			)}
		</ResponsiveWrapper>
	);

	// --- Tab 2: Layout (grid / alignment / image) ------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Grid', 'shapeblock')} initialOpen={true}>
				<SelectControl
					label={__('Card Style', 'shapeblock')}
					value={attributes.gridStyle}
					options={[
						{ label: __('Default', 'shapeblock'), value: 'default' },
						{ label: __('Style 1', 'shapeblock'), value: '1' },
					]}
					onChange={(value) => setAttributes({ gridStyle: value })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<Divider />
				<ResponsiveWrapper label={__('Columns', 'shapeblock')}>
					{(device) => (
						<SelectControl
							value={attributes[getAttrKey('columns', device)]}
							onChange={(value) => setAttributes({ [getAttrKey('columns', device)]: value })}
							options={[
								{ label: __('1 Column', 'shapeblock'), value: '1' },
								{ label: __('2 Columns', 'shapeblock'), value: '2' },
								{ label: __('3 Columns', 'shapeblock'), value: '3' },
								{ label: __('4 Columns', 'shapeblock'), value: '4' },
								{ label: __('5 Columns', 'shapeblock'), value: '5' },
								{ label: __('6 Columns', 'shapeblock'), value: '6' },
							]}
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
					)}
				</ResponsiveWrapper>
				<Divider />
				{gapSelect(__('Space Between Columns', 'shapeblock'), 'itemGap')}
				{gapSelect(__('Space Between Rows', 'shapeblock'), 'itemRowGap')}
			</PanelBody>

			<PanelBody title={__('Image', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Image Size', 'shapeblock')}
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
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (colors / typography / background / border / hover) -----
	const styleTab = (
		<>
			<PanelBody title={__('Card', 'shapeblock')} initialOpen={true}>
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
								{isHover && (
									<>
										<ColorPopover
											label={__('Border Color', 'shapeblock')}
											color={attributes.itemBorderColorHover}
											onChange={(value) => setAttributes({ itemBorderColorHover: value || '' })}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'shapeblock')}
											value={attributes.itemBoxShadowHover}
											onChange={(value) => setAttributes({ itemBoxShadowHover: value })}
										/>
										<ToggleControl
											label={__('Lift the card on hover', 'shapeblock')}
											checked={!!attributes.itemHoverLift}
											onChange={(value) => setAttributes({ itemHoverLift: value })}
											__nextHasNoMarginBottom={true}
										/>
									</>
								)}
								{!isHover && (
									<BackgroundControl
										label={__('Overlay', 'shapeblock')}
										colorValue={attributes.itemOverlayBackgroundColor}
										gradientValue={attributes.itemOverlayBackgroundGradient}
										onColorChange={(value) => {
											const hex = (value && typeof value === 'object') ? value.hex : value;
											setAttributes({ itemOverlayBackgroundColor: hex });
										}}
										onGradientChange={(value) => setAttributes({ itemOverlayBackgroundGradient: value })}
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
					label={__('Border Radius', 'shapeblock')}
					values={attributes.itemBorderRadius}
					onChange={(nextValues) => setAttributes({ itemBorderRadius: nextValues })}
				/>
				<Divider />
				{respBox(__('Padding', 'shapeblock'), 'itemPadding')}
				{respBox(__('Margin', 'shapeblock'), 'itemMargin')}
			</PanelBody>

			<PanelBody title={__('Content Area', 'shapeblock')} initialOpen={false}>
				<p className="components-base-control__help">{__('The part of the card under the image: meta, title, excerpt and button.', 'shapeblock')}</p>
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
				{respBox(__('Padding', 'shapeblock'), 'contentPadding')}
			</PanelBody>

			<PanelBody title={__('Thumbnail', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Hover Animation', 'shapeblock')}
					value={attributes.animStyle}
					onChange={(value) => setAttributes({ animStyle: value })}
					options={[
						{ label: __('None', 'shapeblock'), value: 'none' },
						{ label: __('Left Right', 'shapeblock'), value: 'left_right' },
						{ label: __('Top Bottom', 'shapeblock'), value: 'top_bottom' },
						{ label: __('Zoom', 'shapeblock'), value: 'zoom' }
					]}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<BoxControl
					label={__('Border Radius', 'shapeblock')}
					values={attributes.thumbnailBorderRadius}
					onChange={(value) => setAttributes({ thumbnailBorderRadius: value })}
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
					onChange={(value) => setAttributes({ topDateColor: value || '' })}
				/>
				<BackgroundControl
					label={__('Background', 'shapeblock')}
					colorValue={attributes.topDateBackgroundColor}
					gradientValue={attributes.topDateBackgroundGradient}
					onColorChange={(value) => setAttributes({ topDateBackgroundColor: (value && typeof value === 'object') ? value.hex : value })}
					onGradientChange={(value) => setAttributes({ topDateBackgroundGradient: value || '' })}
				/>
			</PanelBody>
			<PanelBody title={__('Meta', 'shapeblock')} initialOpen={false}>
				<SelectControl
					label={__('Meta Style', 'shapeblock')}
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
				<Divider />
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
									onChange={(value) => setAttributes({ [isHover ? 'paginationColorHover' : 'paginationColor']: value })}
								/>
								<BackgroundControl
									label={__('Background', 'shapeblock')}
									colorValue={isHover ? attributes.paginationBackgroundColorHover : attributes.paginationBackgroundColor}
									gradientValue={isHover ? attributes.paginationBackgroundGradientHover : attributes.paginationBackgroundGradient}
									onColorChange={(value) => setAttributes({ [isHover ? 'paginationBackgroundColorHover' : 'paginationBackgroundColor']: (value && typeof value === 'object') ? value.hex : value })}
									onGradientChange={(value) => setAttributes({ [isHover ? 'paginationBackgroundGradientHover' : 'paginationBackgroundGradient']: value || '' })}
								/>
							</div>
						);
					}}
				</TabPanel>

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

			<ServerSideRender block="shapeblock/post-grid" attributes={attributes} httpMethod="POST" />
		</div >
	);
}
