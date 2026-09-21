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
		'description' => 'An image slider.',
		'keywords' => array(
			'slider',
			'carousel',
			'slideshow',
			'image',
			'gallery'
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
			'advPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advPaddingTablet' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advPaddingMobile' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advMarginTablet' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advMarginMobile' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'advBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						)
					),
					array(
						'image' => array(
							
						)
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
			'imageFit' => array(
				'type' => 'string',
				'default' => 'cover'
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
