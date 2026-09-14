<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/icon-box',
		'version' => '0.1.0',
		'title' => 'Icon Box',
		'category' => 'shapeblock',
		'description' => 'Icon boxes with the icon on top, then title and description — icon, number or image supported.',
		'keywords' => array(
			'icon box',
			'icon',
			'feature',
			'service',
			'box'
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
			)
		),
		'textdomain' => 'shapeblock',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'showIcon' => array(
				'type' => 'boolean',
				'default' => true
			),
			'iconType' => array(
				'type' => 'string',
				'default' => 'icon'
			),
			'icon' => array(
				'type' => 'string',
				'default' => 'shapeblock-icon-favorite'
			),
			'number' => array(
				'type' => 'string',
				'default' => '01'
			),
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Lightning Fast'
			),
			'desc' => array(
				'type' => 'string',
				'default' => 'Your site loads in seconds with our highly optimized structure.'
			),
			'boxAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'boxVAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'iconView' => array(
				'type' => 'string',
				'default' => 'stracked'
			),
			'iconShape' => array(
				'type' => 'string',
				'default' => 'rounded'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h3'
			),
			'listBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'listBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaItemGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaItemGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaItemGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaMiddleGap' => array(
				'type' => 'string',
				'default' => '20'
			),
			'feaMiddleGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaMiddleGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaListBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'feaListBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'feaListPadding' => array(
				'type' => 'object'
			),
			'feaListPaddingTablet' => array(
				'type' => 'object'
			),
			'feaListPaddingMobile' => array(
				'type' => 'object'
			),
			'feaBlockMargin' => array(
				'type' => 'object'
			),
			'feaBlockMarginTablet' => array(
				'type' => 'object'
			),
			'feaBlockMarginMobile' => array(
				'type' => 'object'
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconAlignment' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'iconShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'iconBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'iconRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => ''
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
			'titleTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'titleTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'titlePadding' => array(
				'type' => 'object'
			),
			'titlePaddingTablet' => array(
				'type' => 'object'
			),
			'titlePaddingMobile' => array(
				'type' => 'object'
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
			'descTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
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
