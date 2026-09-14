<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/image-carousel',
		'version' => '0.1.0',
		'title' => 'Image Carousel',
		'category' => 'shapeblock',
		'description' => 'A multi-image carousel with centred slides and continuous scrolling.',
		'keywords' => array(
			'carousel',
			'images',
			'logos',
			'marquee',
			'slider'
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
			'images' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						)
					),
					array(
						'image' => array(
							
						)
					),
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
				'default' => '3'
			),
			'slidesPerViewTablet' => array(
				'type' => 'string',
				'default' => '2'
			),
			'slidesPerViewMobile' => array(
				'type' => 'string',
				'default' => '1'
			),
			'spaceBetween' => array(
				'type' => 'string',
				'default' => '20'
			),
			'spaceBetweenTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'spaceBetweenMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'centeredSlides' => array(
				'type' => 'boolean',
				'default' => false
			),
			'inactiveScale' => array(
				'type' => 'string',
				'default' => ''
			),
			'inactiveOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'loop' => array(
				'type' => 'boolean',
				'default' => true
			),
			'autoplay' => array(
				'type' => 'boolean',
				'default' => true
			),
			'autoplayDelay' => array(
				'type' => 'string',
				'default' => '3000'
			),
			'pauseOnHover' => array(
				'type' => 'boolean',
				'default' => true
			),
			'speed' => array(
				'type' => 'string',
				'default' => '600'
			),
			'marquee' => array(
				'type' => 'boolean',
				'default' => false
			),
			'marqueeSpeed' => array(
				'type' => 'string',
				'default' => '4000'
			),
			'showArrows' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showDots' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideHeight' => array(
				'type' => 'string',
				'default' => '260'
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
			'imageSize' => array(
				'type' => 'string',
				'default' => 'thumbnail'
			),
			'slidePadding' => array(
				'type' => 'object'
			),
			'slidePaddingTablet' => array(
				'type' => 'object'
			),
			'slidePaddingMobile' => array(
				'type' => 'object'
			),
			'slideBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'slideRadius' => array(
				'type' => 'object'
			),
			'slideBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
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
