<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/scroll-to-top',
		'version' => '0.1.0',
		'title' => 'Scroll Top',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A floating scroll-to-top button that appears after scrolling and smoothly returns to the top.',
		'keywords' => array(
			'scroll',
			'top',
			'back to top',
			'button'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom',
					'left',
					'right'
				)
			)
		),
		'textdomain' => 'easy-elements-for-gutenberg',
		'editorScript' => 'file:./index.js',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'scrollIcon' => array(
				'type' => 'string',
				'default' => 'eelfg-icon-arrow-up'
			),
			'position' => array(
				'type' => 'string',
				'default' => 'right'
			),
			'offsetX' => array(
				'type' => 'string',
				'default' => ''
			),
			'offsetY' => array(
				'type' => 'string',
				'default' => ''
			),
			'showAfter' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'color' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'colorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'sttBorder' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'sttRadius' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'sttBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'sttPadding' => array(
				'type' => 'object',
				'default' => array(
					
				)
			)
		)
	)
);
