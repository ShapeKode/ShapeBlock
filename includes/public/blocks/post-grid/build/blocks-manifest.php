<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/post-grid',
		'version' => '0.1.0',
		'title' => 'Post Grid',
		'category' => 'shapeblock',
		'description' => 'Post Grid Block',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'left',
				'center',
				'right',
				'wide',
				'full'
			)
		),
		'textdomain' => 'shapeblock',
		'editorScript' => 'file:./index.js',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'ignoreStikcyPosts' => array(
				'type' => 'boolean',
				'default' => true
			),
			'isFeatured' => array(
				'type' => 'boolean',
				'default' => false
			),
			'gridStyle' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'columns' => array(
				'type' => 'string',
				'default' => '3'
			),
			'thumbnailSize' => array(
				'type' => 'string',
				'default' => 'medium'
			),
			'thumbnailHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'thumbnailHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'thumbnailHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'showVideo' => array(
				'type' => 'boolean',
				'default' => true
			),
			'videoAutoplay' => array(
				'type' => 'boolean',
				'default' => false
			),
			'videoMute' => array(
				'type' => 'boolean',
				'default' => true
			),
			'videoHeight' => array(
				'type' => 'string',
				'default' => '312px'
			),
			'videoWidth' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'videoControls' => array(
				'type' => 'boolean',
				'default' => false
			),
			'perPage' => array(
				'type' => 'string',
				'default' => '6'
			),
			'order' => array(
				'type' => 'string',
				'default' => 'ASC'
			),
			'orderby' => array(
				'type' => 'string',
				'default' => 'date'
			),
			'offset' => array(
				'type' => 'string',
				'default' => ''
			),
			'categories' => array(
				'type' => 'array',
				'default' => array(
					'all'
				)
			),
			'excludes' => array(
				'type' => 'array',
				'default' => array(
					'no-excludes'
				)
			),
			'posts' => array(
				'type' => 'array',
				'default' => array(
					'all'
				)
			),
			'itemPadding' => array(
				'type' => 'object'
			),
			'itemMargin' => array(
				'type' => 'object'
			),
			'itemBorderRadius' => array(
				'type' => 'object'
			),
			'itemTitlePadding' => array(
				'type' => 'object'
			),
			'itemTitleMargin' => array(
				'type' => 'object'
			),
			'itemExcerptPadding' => array(
				'type' => 'object'
			),
			'itemExcerptMargin' => array(
				'type' => 'object'
			),
			'itemTitleTypography' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '1.2em',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'itemExcerptTypography' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'contentPadding' => array(
				'type' => 'object'
			),
			'readMorePadding' => array(
				'type' => 'object'
			),
			'readMoreMargin' => array(
				'type' => 'object'
			),
			'readMoreTypography' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'readMoreBorderRadius' => array(
				'type' => 'object'
			),
			'readMoreBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBackgroundColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBackgroundGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBackgroundGradientHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemOverlayBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemOverlayBackgroundColorHover' => array(
				'type' => 'string',
				'default' => 'var(--shapeblock-preset-color-primary)'
			),
			'itemOverlayBackgroundGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemOverlayBackgroundGradientHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'itemBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemGap' => array(
				'type' => 'string',
				'default' => '4'
			),
			'itemTitleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemTitleColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemExcerptColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreBackgroundColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreBackgroundGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreBackgroundGradientHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'showMeta' => array(
				'type' => 'boolean',
				'default' => true
			),
			'allowedMetas' => array(
				'type' => 'array',
				'default' => array(
					'author',
					'date'
				)
			),
			'authorPrefix' => array(
				'type' => 'string',
				'default' => 'by'
			),
			'metaPosition' => array(
				'type' => 'string'
			),
			'metaColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'metaColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'metaIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'metaIconColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'metaMargin' => array(
				'type' => 'object'
			),
			'metaTypography' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'metaStyle' => array(
				'type' => 'string'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h3'
			),
			'showExcerpt' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showReadMore' => array(
				'type' => 'boolean',
				'default' => true
			),
			'readMoreText' => array(
				'type' => 'string',
				'default' => 'Read More'
			),
			'readMoreIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'readMoreIconPosition' => array(
				'type' => 'string',
				'default' => 'after'
			),
			'showDateOnTop' => array(
				'type' => 'boolean',
				'default' => false
			),
			'topDateBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'topDateColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'titleTrim' => array(
				'type' => 'string',
				'default' => '100'
			),
			'excerptTrim' => array(
				'type' => 'string',
				'default' => '12'
			),
			'animStyle' => array(
				'type' => 'string',
				'default' => ''
			),
			'thumbAnim' => array(
				'type' => 'boolean',
				'default' => true
			),
			'paginationType' => array(
				'type' => 'string',
				'default' => 'numeric'
			),
			'paginationBtnWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'paginationBtnWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'paginationBtnWidthMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'paginationBtnBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'paginationBtnBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'pagination' => array(
				'type' => 'boolean',
				'default' => true
			),
			'paginationColor' => array(
				'type' => 'string',
				'default' => 'var(--shapeblock-preset-color-contrast-2)'
			),
			'paginationColorHover' => array(
				'type' => 'string',
				'default' => 'var(--shapeblock-preset-color-white)'
			),
			'paginationBackgroundColor' => array(
				'type' => 'string',
				'default' => 'var(--shapeblock-preset-color-tertiary)'
			),
			'paginationBackgroundColorHover' => array(
				'type' => 'string',
				'default' => 'var(--shapeblock-preset-color-primary)'
			),
			'paginationTypography' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'columnsTablet' => array(
				'type' => 'string',
				'default' => '2'
			),
			'columnsMobile' => array(
				'type' => 'string',
				'default' => '1'
			),
			'itemGapTablet' => array(
				'type' => 'string',
				'default' => '3'
			),
			'itemGapMobile' => array(
				'type' => 'string',
				'default' => '0'
			),
			'itemRowGap' => array(
				'type' => 'string',
				'default' => '4'
			),
			'itemRowGapTablet' => array(
				'type' => 'string',
				'default' => '3'
			),
			'itemRowGapMobile' => array(
				'type' => 'string',
				'default' => '3'
			),
			'itemPaddingTablet' => array(
				'type' => 'object'
			),
			'itemPaddingMobile' => array(
				'type' => 'object'
			),
			'itemTitlePaddingTablet' => array(
				'type' => 'object'
			),
			'itemTitlePaddingMobile' => array(
				'type' => 'object'
			),
			'itemTitleMarginTablet' => array(
				'type' => 'object'
			),
			'itemTitleMarginMobile' => array(
				'type' => 'object'
			),
			'itemTitleTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'itemTitleTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'itemExcerptTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'itemExcerptTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					'fontFamily' => '',
					'fontSize' => '',
					'fontWeight' => '',
					'fontStyle' => '',
					'textTransform' => '',
					'lineHeight' => '',
					'letterSpacing' => ''
				)
			),
			'itemExcerptPaddingTablet' => array(
				'type' => 'object'
			),
			'itemExcerptPaddingMobile' => array(
				'type' => 'object'
			),
			'itemExcerptMarginTablet' => array(
				'type' => 'object'
			),
			'itemExcerptMarginMobile' => array(
				'type' => 'object'
			),
			'contentTextAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'contentTextAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentTextAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTextAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTextAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTextAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'excerptTextAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'excerptTextAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'excerptTextAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'thumbnailBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'categoryColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'categoryColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'categoryBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'categoryBackgroundColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'categoryPadding' => array(
				'type' => 'object'
			),
			'categoryMargin' => array(
				'type' => 'object'
			),
			'hideDesktop' => array(
				'type' => 'boolean',
				'default' => false
			),
			'hideTablet' => array(
				'type' => 'boolean',
				'default' => false
			),
			'hideMobile' => array(
				'type' => 'boolean',
				'default' => false
			)
		)
	)
);
