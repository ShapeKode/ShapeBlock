<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/button',
		'version' => '0.1.0',
		'title' => 'Button',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A flexible button with icon, gradient and full style controls.',
		'keywords' => array(
			'button',
			'link',
			'cta',
			'click'
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
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Click Here'
			),
			'buttonUrl' => array(
				'type' => 'string',
				'default' => '#'
			),
			'buttonTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonType' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPosition' => array(
				'type' => 'string',
				'default' => 'after'
			),
			'iconSpacing' => array(
				'type' => 'string',
				'default' => '8'
			),
			'minWidth' => array(
				'type' => 'string',
				'default' => '150'
			),
			'buttonAlignment' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'showGradient' => array(
				'type' => 'boolean',
				'default' => false
			),
			'gradient1' => array(
				'type' => 'string',
				'default' => '#4750CC'
			),
			'gradient2' => array(
				'type' => 'string',
				'default' => '#EF5CE8'
			),
			'gradient3' => array(
				'type' => 'string',
				'default' => '#EFC7AE'
			),
			'borderGradientButton' => array(
				'type' => 'boolean',
				'default' => false
			),
			'borderGradientColor1' => array(
				'type' => 'string',
				'default' => '#A53E1B'
			),
			'borderGradientColor2' => array(
				'type' => 'string',
				'default' => '#173998'
			),
			'buttonTypography' => array(
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
			'textColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'buttonBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
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
			'buttonPadding' => array(
				'type' => 'object'
			),
			'buttonMargin' => array(
				'type' => 'object'
			),
			'textColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonBorderHover' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'iconRotation' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconRotationHover' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
