<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/heading',
		'version' => '0.1.0',
		'title' => 'Heading',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A heading with sub-heading, highlight, separator, gradient text and watermark.',
		'keywords' => array(
			'heading',
			'title',
			'subtitle',
			'text'
		),
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
			),
			'spacing' => array(
				'padding' => array(
					'top',
					'bottom',
					'left',
					'right'
				),
				'margin' => array(
					'top',
					'bottom',
					'left',
					'right'
				)
			)
		),
		'textdomain' => 'easy-elements-for-gutenberg',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Heading {{Here}}'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h2'
			),
			'linkUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'linkTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'linkNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'showBorderTitle' => array(
				'type' => 'boolean',
				'default' => false
			),
			'borderPosition' => array(
				'type' => 'string',
				'default' => 'eelfg-title-start'
			),
			'borderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'borderPadding' => array(
				'type' => 'object'
			),
			'showGradientTitle' => array(
				'type' => 'boolean',
				'default' => false
			),
			'description' => array(
				'type' => 'string',
				'default' => ''
			),
			'align' => array(
				'type' => 'string',
				'default' => ''
			),
			'subTitle' => array(
				'type' => 'string',
				'default' => ''
			),
			'subHeadingType' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'subHeadingIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'subHeadingImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'iconDirection' => array(
				'type' => 'string',
				'default' => 'top'
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'showGradientBorder' => array(
				'type' => 'boolean',
				'default' => false
			),
			'gradientColor1' => array(
				'type' => 'string',
				'default' => 'rgba(0, 0, 0, 0.15)'
			),
			'gradientColor2' => array(
				'type' => 'string',
				'default' => 'rgba(0, 0, 0, 0.30)'
			),
			'gradientColor3' => array(
				'type' => 'string',
				'default' => 'rgba(0, 0, 0, 0.50)'
			),
			'subGradientBorderPadding' => array(
				'type' => 'object'
			),
			'gradientBorderRadius' => array(
				'type' => 'string',
				'default' => '40'
			),
			'separatorType' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'solidColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorBarWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorBarHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'selectIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'sepImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'separatorImageWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorPosition' => array(
				'type' => 'string',
				'default' => 'below'
			),
			'separatorMargin' => array(
				'type' => 'object'
			),
			'waterMark' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleFillColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleFillGradient' => array(
				'type' => 'string',
				'default' => 'linear-gradient(68.75deg, #B0FF96 9.78%, #FFF1B5 92.67%)'
			),
			'titleTypography' => array(
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
			'titleOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleStrokeWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleStrokeColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'titleBlendMode' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleMargin' => array(
				'type' => 'object'
			),
			'titlePadding' => array(
				'type' => 'object'
			),
			'enableTitleImageFill' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleImageFill' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'subColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'subBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'subBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'subTypography' => array(
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
			'subIconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'subIconMargin' => array(
				'type' => 'object'
			),
			'subIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'subImageWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'subImageHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'subImageRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'subBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'subBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'subPadding' => array(
				'type' => 'object'
			),
			'subMargin' => array(
				'type' => 'object'
			),
			'highlightColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightTypography' => array(
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
			'highlightPadding' => array(
				'type' => 'object'
			),
			'highlightMargin' => array(
				'type' => 'object'
			),
			'highlightBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'descColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descTypography' => array(
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
			'descMargin' => array(
				'type' => 'object'
			),
			'descPadding' => array(
				'type' => 'object'
			),
			'wmColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmStrokeColor' => array(
				'type' => 'string',
				'default' => 'rgba(0, 0, 0, 0.3)'
			),
			'wmStrokeWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmFontSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmTypography' => array(
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
			'wmTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'wmBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'wmBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'wmPadding' => array(
				'type' => 'object'
			),
			'wmBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'wmTop' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmLeft' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmRotation' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmZIndex' => array(
				'type' => 'string',
				'default' => ''
			),
			'wmBlendMode' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
