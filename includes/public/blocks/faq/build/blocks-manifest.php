<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/faq',
		'version' => '0.1.0',
		'title' => 'Accordion',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'An FAQ accordion with collapsible questions and custom icons.',
		'keywords' => array(
			'faq',
			'accordion',
			'question',
			'answer',
			'toggle'
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
			),
			'color' => array(
				'background' => true,
				'text' => false,
				'gradients' => true
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
			'faqItems' => array(
				'type' => 'array',
				'default' => array(
					array(
						'title' => 'What is Easy Elements?',
						'description' => 'Easy Elements is a custom addon plugin that offers useful blocks.',
						'active' => false
					),
					array(
						'title' => 'Does it work with the block editor?',
						'description' => 'Yes, it fully supports the WordPress block editor (Gutenberg).',
						'active' => false
					),
					array(
						'title' => 'How to install Easy Elements?',
						'description' => 'Upload the plugin via WordPress Dashboard or FTP and activate it.',
						'active' => false
					)
				)
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h4'
			),
			'iconOpen' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconClose' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPosition' => array(
				'type' => 'string',
				'default' => 'row'
			),
			'openAll' => array(
				'type' => 'boolean',
				'default' => false
			),
			'enableSticky' => array(
				'type' => 'boolean',
				'default' => false
			),
			'itemBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBackgroundColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBackgroundColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemBorderHover' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemBorderActive' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'itemBoxShadowHover' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'itemBoxShadowActive' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'itemBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'itemPadding' => array(
				'type' => 'object'
			),
			'itemsGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTypography' => array(
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
			'titleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBgColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'titleBorderColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBorderColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'titleBoxShadowHover' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'titleBoxShadowActive' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'questionPadding' => array(
				'type' => 'object'
			),
			'questionBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'descriptionTypography' => array(
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
			'descriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBgColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'descriptionBorderColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBorderColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'answerPadding' => array(
				'type' => 'object'
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'iconBorderColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBorderColorActive' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxSize' => array(
				'type' => 'string',
				'default' => ''
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
			'iconPositionY' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPositionYActive' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
