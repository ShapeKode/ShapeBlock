<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/social-share',
		'version' => '0.1.0',
		'title' => 'Social Share',
		'category' => 'shapeblock',
		'description' => 'Social share buttons for the current page — Facebook, X, LinkedIn, WhatsApp, copy link and more.',
		'keywords' => array(
			'social',
			'share',
			'icon',
			'link'
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
			'platforms' => array(
				'type' => 'array',
				'default' => array(
					array(
						'platform' => 'facebook',
						'customIcon' => ''
					),
					array(
						'platform' => 'twitter',
						'customIcon' => ''
					),
					array(
						'platform' => 'instagram',
						'customIcon' => ''
					),
					array(
						'platform' => 'linkedin',
						'customIcon' => ''
					),
					array(
						'platform' => 'youtube',
						'customIcon' => ''
					),
					array(
						'platform' => 'whatsapp',
						'customIcon' => ''
					),
					array(
						'platform' => 'telegram',
						'customIcon' => ''
					),
					array(
						'platform' => 'copy',
						'customIcon' => ''
					)
				)
			),
			'layout' => array(
				'type' => 'string',
				'default' => 'horizontal'
			),
			'openNewTab' => array(
				'type' => 'boolean',
				'default' => true
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => '18'
			),
			'iconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSize' => array(
				'type' => 'string',
				'default' => '45'
			),
			'buttonSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSpacing' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSpacingTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonSpacingMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '50%',
					'right' => '50%',
					'bottom' => '50%',
					'left' => '50%'
				)
			),
			'buttonBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'buttonBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
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
