<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/icon',
		'version' => '0.1.0',
		'title' => 'Icon',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A single icon with color, size, background, border, rotation and link — like Elementor\'s Icon widget.',
		'keywords' => array(
			'icon',
			'svg',
			'glyph',
			'symbol'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'align' => array(
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
			'icon' => array(
				'type' => 'string',
				'default' => 'eelfg-icon-favorite'
			),
			'view' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'shape' => array(
				'type' => 'string',
				'default' => 'circle'
			),
			'iconUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'iconNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => '48'
			),
			'iconRotation' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPadding' => array(
				'type' => 'object'
			),
			'iconBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'iconBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'iconBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'iconColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBorderHover' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'iconRotationHover' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
