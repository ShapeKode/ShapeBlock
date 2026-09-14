<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/pricing-table',
		'version' => '0.1.0',
		'title' => 'Pricing Table',
		'category' => 'shapeblock',
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
			'headerAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'featureTextAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'featureTextAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'featureIconPaddingTablet' => array(
				'type' => 'object'
			),
			'featureIconPaddingMobile' => array(
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
			'ribbonAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'ribbonAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'btnAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'titlePaddingTablet' => array(
				'type' => 'object'
			),
			'titlePaddingMobile' => array(
				'type' => 'object'
			),
			'titleMargin' => array(
				'type' => 'object'
			),
			'titleMarginTablet' => array(
				'type' => 'object'
			),
			'titleMarginMobile' => array(
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
			'descriptionTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descriptionTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'descriptionPaddingTablet' => array(
				'type' => 'object'
			),
			'descriptionPaddingMobile' => array(
				'type' => 'object'
			),
			'descriptionMargin' => array(
				'type' => 'object'
			),
			'descriptionMarginTablet' => array(
				'type' => 'object'
			),
			'descriptionMarginMobile' => array(
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
			'priceTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'priceTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'priceMargin' => array(
				'type' => 'object'
			),
			'priceMarginTablet' => array(
				'type' => 'object'
			),
			'priceMarginMobile' => array(
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
			'salePriceTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'salePriceTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'periodTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'periodTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'periodMargin' => array(
				'type' => 'object'
			),
			'periodMarginTablet' => array(
				'type' => 'object'
			),
			'periodMarginMobile' => array(
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
			'currencyTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'currencyTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'currencyMargin' => array(
				'type' => 'object'
			),
			'currencyMarginTablet' => array(
				'type' => 'object'
			),
			'currencyMarginMobile' => array(
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
			'featuresDescriptionTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'featuresDescriptionTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'featuresDescriptionPaddingTablet' => array(
				'type' => 'object'
			),
			'featuresDescriptionPaddingMobile' => array(
				'type' => 'object'
			),
			'featuresDescriptionMargin' => array(
				'type' => 'object'
			),
			'featuresDescriptionMarginTablet' => array(
				'type' => 'object'
			),
			'featuresDescriptionMarginMobile' => array(
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
			'featuresTextTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'featuresTextTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'featuresPaddingTablet' => array(
				'type' => 'object'
			),
			'featuresPaddingMobile' => array(
				'type' => 'object'
			),
			'featuresIconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresIconGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresIconGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'featuresMargin' => array(
				'type' => 'object'
			),
			'featuresMarginTablet' => array(
				'type' => 'object'
			),
			'featuresMarginMobile' => array(
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
			'ribbonTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'ribbonTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'ribbonPadding' => array(
				'type' => 'object'
			),
			'ribbonPaddingTablet' => array(
				'type' => 'object'
			),
			'ribbonPaddingMobile' => array(
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
			'buttonTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'buttonTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'buttonPaddingTablet' => array(
				'type' => 'object'
			),
			'buttonPaddingMobile' => array(
				'type' => 'object'
			),
			'buttonMargin' => array(
				'type' => 'object'
			),
			'buttonMarginTablet' => array(
				'type' => 'object'
			),
			'buttonMarginMobile' => array(
				'type' => 'object'
			),
			'buttonIconSpacing' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonIconSpacingTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonIconSpacingMobile' => array(
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
			'buttonSubtextTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'buttonSubtextTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'buttonSubtextMargin' => array(
				'type' => 'object'
			),
			'buttonSubtextMarginTablet' => array(
				'type' => 'object'
			),
			'buttonSubtextMarginMobile' => array(
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
