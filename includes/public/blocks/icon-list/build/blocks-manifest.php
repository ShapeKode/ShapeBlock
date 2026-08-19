<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/icon-list',
		'version' => '0.1.0',
		'title' => 'Icon List',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A vertical list of items with icon, number or image, title, description and optional connector.',
		'keywords' => array(
			'icon',
			'list',
			'feature',
			'steps',
			'service'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
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
			'features' => array(
				'type' => 'array',
				'default' => array(
					array(
						'icon' => 'eelfg-icon-favorite',
						'title' => 'Unlimited bandwidth'
					),
					array(
						'icon' => 'eelfg-icon-favorite',
						'title' => 'Free SSL certificate'
					),
					array(
						'icon' => 'eelfg-icon-favorite',
						'title' => '24/7 expert support'
					)
				)
			),
			'feaDir' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'showIcon' => array(
				'type' => 'boolean',
				'default' => true
			),
			'feaVerticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'layout' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'listAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'divider' => array(
				'type' => 'boolean',
				'default' => false
			),
			'dividerColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconView' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'iconShape' => array(
				'type' => 'string',
				'default' => 'rounded'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'span'
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
				'default' => ''
			),
			'feaMiddleGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaMiddleGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnector' => array(
				'type' => 'boolean',
				'default' => false
			),
			'feaConnectorLeft' => array(
				'type' => 'boolean',
				'default' => false
			),
			'feaConnectorType' => array(
				'type' => 'string',
				'default' => 'solid'
			),
			'feaConnectorWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorWidthMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorPositionX' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorPositionXTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorPositionXMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorRightPositionX' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorRightPositionXTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorRightPositionXMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'feaConnectorColor' => array(
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
			'iconColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconHAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'iconOffsetY' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconOffsetYTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconOffsetYMobile' => array(
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
			)
		)
	)
);
