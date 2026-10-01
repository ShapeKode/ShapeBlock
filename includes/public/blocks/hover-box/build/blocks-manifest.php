<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/hover-box',
		'version' => '0.1.0',
		'title' => 'Hover Box',
		'category' => 'shapeblock',
		'description' => 'An image or icon in a circle or square that reveals a title and description on hover.',
		'keywords' => array(
			'hover',
			'image',
			'icon',
			'overlay',
			'effect'
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
			'mediaType' => array(
				'type' => 'string',
				'default' => 'image'
			),
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'icon' => array(
				'type' => 'string',
				'default' => 'shapeblock-icon-favorite'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Hover over me'
			),
			'desc' => array(
				'type' => 'string',
				'default' => 'A short line that appears when the pointer is over the box.'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h3'
			),
			'linkUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'linkNewTab' => array(
				'type' => 'boolean',
				'default' => false
			),
			'shape' => array(
				'type' => 'string',
				'default' => 'circle'
			),
			'effect' => array(
				'type' => 'string',
				'default' => 'fade'
			),
			'direction' => array(
				'type' => 'string',
				'default' => ''
			),
			'speed' => array(
				'type' => 'string',
				'default' => '450'
			),
			'boxAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'boxSize' => array(
				'type' => 'string',
				'default' => '240'
			),
			'boxSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'boxSizeMobile' => array(
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
			'blockMargin' => array(
				'type' => 'object'
			),
			'blockMarginTablet' => array(
				'type' => 'object'
			),
			'blockMarginMobile' => array(
				'type' => 'object'
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'rgba(89, 51, 255, 0.85)'
			),
			'overlayGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'boxBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'boxBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'boxBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'boxRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'boxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => '48'
			),
			'iconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
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
			'descColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
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
