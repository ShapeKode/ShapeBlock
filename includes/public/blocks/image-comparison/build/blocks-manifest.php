<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/image-comparison',
		'version' => '0.1.0',
		'title' => 'Image Comparison',
		'category' => 'shapeblock',
		'description' => 'A before / after image comparison slider with a draggable handle — horizontal or vertical.',
		'keywords' => array(
			'before',
			'after',
			'compare',
			'comparison',
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
			'beforeImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'afterImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'orientation' => array(
				'type' => 'string',
				'default' => 'horizontal'
			),
			'offset' => array(
				'type' => 'number',
				'default' => 50
			),
			'height' => array(
				'type' => 'string',
				'default' => '540'
			),
			'heightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'heightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'containerRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
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
