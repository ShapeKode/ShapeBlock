<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/pricing-table',
		'version' => '0.1.0',
		'title' => 'Pricing Table',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A configurable pricing table with features list, featured ribbon and call-to-action button.',
		'keywords' => array(
			'pricing',
			'pricing-table',
			'table',
			'plan',
			'price'
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
			),
			'color' => array(
				'background' => true,
				'text' => false,
				'gradients' => true
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
			'skinStyle' => array(
				'type' => 'string',
				'default' => 'skin1'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Basic Plan'
			),
			'description' => array(
				'type' => 'string',
				'default' => ''
			),
			'onSale' => array(
				'type' => 'boolean',
				'default' => false
			),
			'regularPrice' => array(
				'type' => 'string',
				'default' => '59'
			),
			'salePrice' => array(
				'type' => 'string',
				'default' => '49'
			),
			'price' => array(
				'type' => 'string',
				'default' => '59'
			),
			'currency' => array(
				'type' => 'string',
				'default' => '$'
			),
			'currencyPlacement' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'period' => array(
				'type' => 'string',
				'default' => 'month'
			),
			'separator' => array(
				'type' => 'string',
				'default' => '/'
			),
			'headerAlignment' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'featuresDescription' => array(
				'type' => 'string',
				'default' => ''
			),
			'features' => array(
				'type' => 'array',
				'default' => array(
					array(
						'icon' => '',
						'text' => '99.9% Uptime Guarantee'
					),
					array(
						'icon' => '',
						'text' => 'Free SSL Certificate'
					),
					array(
						'icon' => '',
						'text' => '24/7 Expert Support'
					),
					array(
						'icon' => '',
						'text' => 'One-Click WordPress Install'
					),
					array(
						'icon' => '',
						'text' => 'Unlimited Bandwidth'
					),
					array(
						'icon' => '',
						'text' => 'SSD Storage'
					),
					array(
						'icon' => '',
						'text' => 'Free Daily Backups'
					),
					array(
						'icon' => '',
						'text' => 'Enhanced Security'
					)
				)
			),
			'featureIconStyle' => array(
				'type' => 'string',
				'default' => 'icon-only'
			),
			'featureTextAlignment' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'featureIconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'featureIconBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'featureIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'featureIconPadding' => array(
				'type' => 'object'
			),
			'featureIconBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'isFeatured' => array(
				'type' => 'boolean',
				'default' => false
			),
			'ribbonStyle' => array(
				'type' => 'string',
				'default' => 'style1'
			),
			'featuredText' => array(
				'type' => 'string',
				'default' => 'Featured'
			),
			'ribbonAlignment' => array(
				'type' => 'string',
				'default' => 'right'
			),
			'showButton' => array(
				'type' => 'boolean',
				'default' => true
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Choose Plan'
			),
			'buttonSubtext' => array(
				'type' => 'string',
				'default' => 'No credit card required!'
			),
			'buttonUrl' => array(
				'type' => 'string',
				'default' => '#'
			),
			'buttonTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonIconPosition' => array(
				'type' => 'string',
				'default' => 'after'
			),
			'buttonPosition' => array(
				'type' => 'string',
				'default' => 'after_features'
			),
			'btnAlignment' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'buttonFullWidth' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleHighlightColor' => array(
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
			'titleBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'titleBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'titlePadding' => array(
				'type' => 'object'
			),
			'titleMargin' => array(
				'type' => 'object'
			),
			'descriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionTypography' => array(
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
			'descriptionBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'descriptionPadding' => array(
				'type' => 'object'
			),
			'descriptionMargin' => array(
				'type' => 'object'
			),
			'priceColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'priceTypography' => array(
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
			'priceMargin' => array(
				'type' => 'object'
			),
			'salePriceColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'salePriceTypography' => array(
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
			'oldPriceColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'periodColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'periodTypography' => array(
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
			'periodMargin' => array(
				'type' => 'object'
			),
			'currencyColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'currencyTypography' => array(
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
			'currencyMargin' => array(
				'type' => 'object'
			),
			'currencyVerticalPosition' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresDescriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresDescriptionTypography' => array(
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
			'featuresDescriptionBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'featuresDescriptionPadding' => array(
				'type' => 'object'
			),
			'featuresDescriptionMargin' => array(
				'type' => 'object'
			),
			'featuresTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresTextTypography' => array(
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
			'featuresBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'featuresPadding' => array(
				'type' => 'object'
			),
			'featuresIconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresMargin' => array(
				'type' => 'object'
			),
			'ribbonColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'ribbonBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'ribbonTypography' => array(
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
			'ribbonPadding' => array(
				'type' => 'object'
			),
			'ribbonBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'buttonTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonBgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTypography' => array(
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
			'buttonBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'buttonBorderHover' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'buttonBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'buttonBoxShadowHover' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'buttonBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'buttonPadding' => array(
				'type' => 'object'
			),
			'buttonMargin' => array(
				'type' => 'object'
			),
			'buttonIconSpacing' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSubtextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSubtextTypography' => array(
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
			'buttonSubtextMargin' => array(
				'type' => 'object'
			)
		)
	)
);
