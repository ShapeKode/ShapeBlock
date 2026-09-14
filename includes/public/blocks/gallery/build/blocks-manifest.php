<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/gallery',
		'version' => '0.1.0',
		'title' => 'Simple Gallery',
		'category' => 'shapeblock',
		'description' => 'A responsive image gallery with captions, hover effects and a lightbox.',
		'keywords' => array(
			'gallery',
			'image',
			'photo',
			'portfolio',
			'lightbox'
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
			'galleryImages' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'columns' => array(
				'type' => 'string',
				'default' => '4'
			),
			'columnsTablet' => array(
				'type' => 'string',
				'default' => '2'
			),
			'columnsMobile' => array(
				'type' => 'string',
				'default' => '1'
			),
			'imageGap' => array(
				'type' => 'string',
				'default' => '10'
			),
			'imageGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'thumbnailSize' => array(
				'type' => 'string',
				'default' => 'large'
			),
			'showCaption' => array(
				'type' => 'boolean',
				'default' => true
			),
			'captionSource' => array(
				'type' => 'string',
				'default' => 'media'
			),
			'showDescription' => array(
				'type' => 'boolean',
				'default' => false
			),
			'enablePopup' => array(
				'type' => 'boolean',
				'default' => true
			),
			'orderBy' => array(
				'type' => 'string',
				'default' => 'menu_order'
			),
			'hoverStyle' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'hoverText' => array(
				'type' => 'string',
				'default' => 'View'
			),
			'hoverIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'captionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'captionBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'captionAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'hoverOverlayColor' => array(
				'type' => 'string',
				'default' => 'rgba(0,0,0,0.6)'
			),
			'hoverIconSize' => array(
				'type' => 'string',
				'default' => '16'
			),
			'hoverIconColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'hoverTextColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
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
