<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/slider',
		'version' => '0.1.0',
		'title' => 'Slider',
		'category' => 'shapeblock',
		'description' => 'A content slider with image slides, heading, text and a button.',
		'keywords' => array(
			'slider',
			'carousel',
			'slideshow',
			'swiper',
			'banner'
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
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						),
						'title' => 'First slide',
						'description' => 'Describe this slide in a sentence or two.',
						'buttonText' => 'Learn more',
						'buttonUrl' => '',
						'buttonNewTab' => false
					),
					array(
						'image' => array(
							
						),
						'title' => 'Second slide',
						'description' => 'Describe this slide in a sentence or two.',
						'buttonText' => 'Learn more',
						'buttonUrl' => '',
						'buttonNewTab' => false
					)
				)
			),
			'slidesPerView' => array(
				'type' => 'string',
				'default' => '1'
			),
			'slidesPerViewTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'slidesPerViewMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'spaceBetween' => array(
				'type' => 'string',
				'default' => '24'
			),
			'spaceBetweenTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'spaceBetweenMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'loop' => array(
				'type' => 'boolean',
				'default' => true
			),
			'autoplay' => array(
				'type' => 'boolean',
				'default' => false
			),
			'autoplayDelay' => array(
				'type' => 'string',
				'default' => '4000'
			),
			'pauseOnHover' => array(
				'type' => 'boolean',
				'default' => true
			),
			'speed' => array(
				'type' => 'string',
				'default' => '600'
			),
			'showArrows' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showDots' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideHeight' => array(
				'type' => 'string',
				'default' => '420'
			),
			'slideHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'slideHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'contentAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentWidthMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'slideRadius' => array(
				'type' => 'object'
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'overlayGradient' => array(
				'type' => 'string',
				'default' => ''
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
					'letterSpacing' => '',
					'textDecoration' => ''
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
			'titleMargin' => array(
				'type' => 'object'
			),
			'titleMarginTablet' => array(
				'type' => 'object'
			),
			'titleMarginMobile' => array(
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
					'letterSpacing' => '',
					'textDecoration' => ''
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
			'descMargin' => array(
				'type' => 'object'
			),
			'descMarginTablet' => array(
				'type' => 'object'
			),
			'descMarginMobile' => array(
				'type' => 'object'
			),
			'buttonColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonHoverBgColor' => array(
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
					'letterSpacing' => '',
					'textDecoration' => ''
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
			'buttonPadding' => array(
				'type' => 'object'
			),
			'buttonPaddingTablet' => array(
				'type' => 'object'
			),
			'buttonPaddingMobile' => array(
				'type' => 'object'
			),
			'buttonRadius' => array(
				'type' => 'object'
			),
			'buttonBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'arrowColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'arrowBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'arrowSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'arrowSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'arrowSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'arrowRadius' => array(
				'type' => 'object'
			),
			'dotColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'dotActiveColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'dotSize' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
