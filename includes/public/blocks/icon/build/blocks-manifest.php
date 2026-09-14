<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/icon',
		'version' => '0.1.0',
		'title' => 'Icon',
		'category' => 'shapeblock',
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
			'icon' => array(
				'type' => 'string',
				'default' => 'shapeblock-icon-favorite'
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
			'alignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignmentMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'iconPaddingTablet' => array(
				'type' => 'object'
			),
			'iconPaddingMobile' => array(
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
