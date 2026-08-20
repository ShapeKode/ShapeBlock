<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/breadcrumb',
		'version' => '0.1.0',
		'title' => 'Breadcrumb',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A dynamic breadcrumb trail for the current page, with home icon, separator and full styling.',
		'keywords' => array(
			'breadcrumb',
			'navigation',
			'path',
			'trail'
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
			),
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom',
					'left',
					'right'
				),
				'padding' => array(
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
			'showHomeIcon' => array(
				'type' => 'boolean',
				'default' => true
			),
			'homeIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'homeTitle' => array(
				'type' => 'string',
				'default' => 'Home'
			),
			'showCategoryPath' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showSeparatorIcon' => array(
				'type' => 'boolean',
				'default' => false
			),
			'separatorIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'textColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'activeColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'textTypography' => array(
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
			'textPadding' => array(
				'type' => 'object'
			),
			'textPaddingActive' => array(
				'type' => 'object'
			),
			'textBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'textBgColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'textRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'textRadiusActive' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'homeIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'homeIconBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'homeIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'homeIconRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'homeIconPadding' => array(
				'type' => 'object'
			),
			'homeIconPosY' => array(
				'type' => 'string',
				'default' => ''
			),
			'homeIconPosX' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'separatorPadding' => array(
				'type' => 'object'
			),
			'separatorSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorGap' => array(
				'type' => 'object'
			),
			'separatorPosY' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorPosX' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
