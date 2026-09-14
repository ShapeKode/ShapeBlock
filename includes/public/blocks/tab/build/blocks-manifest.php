<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/tab',
		'version' => '0.1.0',
		'title' => 'Tabs',
		'category' => 'shapeblock',
		'description' => 'Tabbed content with icon/image titles, content title, description and a button — horizontal or vertical layouts.',
		'keywords' => array(
			'tab',
			'tabs',
			'link',
			'click',
			'content'
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
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'tabs' => array(
				'type' => 'array',
				'default' => array(
					array(
						'tabTitle' => 'Our Company',
						'iconType' => 'icon',
						'icon' => '',
						'image' => array(
							
						),
						'contentTitle' => '',
						'contentDescription' => 'We are a passionate team crafting reliable products and services that help businesses grow. Since day one we have focused on quality, transparency, and building lasting relationships with every client we serve.',
						'readMoreText' => '',
						'readMoreUrl' => '#',
						'readMoreNewTab' => false
					),
					array(
						'tabTitle' => 'Our Mission',
						'iconType' => 'icon',
						'icon' => '',
						'image' => array(
							
						),
						'contentTitle' => '',
						'contentDescription' => 'Our mission is to deliver simple, effective solutions to real problems. We make powerful tools accessible to everyone, backed by friendly support and a habit of continuous improvement.',
						'readMoreText' => '',
						'readMoreUrl' => '#',
						'readMoreNewTab' => false
					),
					array(
						'tabTitle' => 'Our Vision',
						'iconType' => 'icon',
						'icon' => '',
						'image' => array(
							
						),
						'contentTitle' => '',
						'contentDescription' => 'We envision a future where great design and technology are within reach of every business. We lead with innovation, integrity, and a genuine commitment to our customers\' success.',
						'readMoreText' => '',
						'readMoreUrl' => '#',
						'readMoreNewTab' => false
					)
				)
			),
			'iconPosition' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'layoutDirection' => array(
				'type' => 'string',
				'default' => 'top'
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
			'titleColor' => array(
				'type' => 'string',
				'default' => ''
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
			'tabIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'tabIconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleActiveColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'titleActiveBgColor' => array(
				'type' => 'string',
				'default' => '#5933FF'
			),
			'titleActiveBorderColor' => array(
				'type' => 'string',
				'default' => '#5933FF'
			),
			'titleBottomSpacing' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBottomSpacingTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBottomSpacingMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'navBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'contentBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'contentBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'contentPadding' => array(
				'type' => 'object'
			),
			'contentPaddingTablet' => array(
				'type' => 'object'
			),
			'contentPaddingMobile' => array(
				'type' => 'object'
			),
			'contentMargin' => array(
				'type' => 'object'
			),
			'contentMarginTablet' => array(
				'type' => 'object'
			),
			'contentMarginMobile' => array(
				'type' => 'object'
			),
			'descriptionAlignment' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'descriptionAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentTitleTypography' => array(
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
			'contentTitleTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'contentTitleTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'contentTitleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentTitleMargin' => array(
				'type' => 'object'
			),
			'contentTitleMarginTablet' => array(
				'type' => 'object'
			),
			'contentTitleMarginMobile' => array(
				'type' => 'object'
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
			'descColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descMargin' => array(
				'type' => 'object'
			),
			'descMarginTablet' => array(
				'type' => 'object'
			),
			'descMarginMobile' => array(
				'type' => 'object'
			),
			'btnTypography' => array(
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
			'btnTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'btnTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'btnColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnHoverBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnHoverBorderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'btnBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'btnBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'btnPadding' => array(
				'type' => 'object'
			),
			'btnPaddingTablet' => array(
				'type' => 'object'
			),
			'btnPaddingMobile' => array(
				'type' => 'object'
			),
			'btnMargin' => array(
				'type' => 'object'
			),
			'btnMarginTablet' => array(
				'type' => 'object'
			),
			'btnMarginMobile' => array(
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
