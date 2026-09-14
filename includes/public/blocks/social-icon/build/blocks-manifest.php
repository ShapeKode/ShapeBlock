<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/social-icon',
		'version' => '0.1.0',
		'title' => 'Social Icon',
		'category' => 'shapeblock',
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
			'socialLinks' => array(
				'type' => 'array',
				'default' => array(
					array(
						'linkTitle' => 'Facebook',
						'linkUrl' => '#',
						'isExternal' => false,
						'nofollow' => false,
						'icon' => 'shapeblock-icon-logo-facebook',
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
						'icon' => 'shapeblock-icon-logo-twitter',
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
						'icon' => 'shapeblock-icon-logo-instagram',
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
				'default' => 'global'
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'alignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignmentMobile' => array(
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
				'default' => '10'
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
			'iconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'gBgColor' => array(
				'type' => 'string',
				'default' => '#121212'
			),
			'gBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'gHoverBgColor' => array(
				'type' => 'string',
				'default' => '#1f2937'
			),
			'gHoverBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'gIconColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'gHoverIconColor' => array(
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
