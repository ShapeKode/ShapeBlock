<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/social-icon',
		'version' => '0.1.0',
		'title' => 'Social Icon',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A row of linked social icons with per-icon or global colors, hover states and full button styling.',
		'keywords' => array(
			'social',
			'icon',
			'link',
			'profile',
			'share'
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
			'socialLinks' => array(
				'type' => 'array',
				'default' => array(
					array(
						'linkTitle' => 'Facebook',
						'linkUrl' => '#',
						'isExternal' => false,
						'nofollow' => false,
						'icon' => 'eelfg-icon-logo-facebook',
						'bgColor' => '#1877F2',
						'bgGradient' => '',
						'iconColor' => '#ffffff',
						'hoverBgColor' => '#166fe5',
						'hoverBgGradient' => '',
						'hoverIconColor' => '#ffffff'
					),
					array(
						'linkTitle' => 'Twitter',
						'linkUrl' => '#',
						'isExternal' => false,
						'nofollow' => false,
						'icon' => 'eelfg-icon-logo-twitter',
						'bgColor' => '#1DA1F2',
						'bgGradient' => '',
						'iconColor' => '#ffffff',
						'hoverBgColor' => '#1a91da',
						'hoverBgGradient' => '',
						'hoverIconColor' => '#ffffff'
					),
					array(
						'linkTitle' => 'Instagram',
						'linkUrl' => '#',
						'isExternal' => false,
						'nofollow' => false,
						'icon' => 'eelfg-icon-logo-instagram',
						'bgColor' => '#E4405F',
						'bgGradient' => '',
						'iconColor' => '#ffffff',
						'hoverBgColor' => '#d63384',
						'hoverBgGradient' => '',
						'hoverIconColor' => '#ffffff'
					)
				)
			),
			'colorMode' => array(
				'type' => 'string',
				'default' => 'custom'
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'buttonSize' => array(
				'type' => 'string',
				'default' => '45'
			),
			'buttonSpacing' => array(
				'type' => 'string',
				'default' => '10'
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
			'buttonBorderHover' => array(
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
			'iconSize' => array(
				'type' => 'string',
				'default' => '18'
			),
			'gBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'gBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'gHoverBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'gHoverBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'gIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'gHoverIconColor' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
