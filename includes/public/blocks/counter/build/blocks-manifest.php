<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/counter',
		'version' => '0.1.0',
		'title' => 'Counter',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'An animated number counter with prefix/suffix, icon, title, and counter or odometer animation.',
		'keywords' => array(
			'counter',
			'number',
			'odometer',
			'stats',
			'animated'
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
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'number' => array(
				'type' => 'string',
				'default' => '500'
			),
			'startNumber' => array(
				'type' => 'string',
				'default' => '0'
			),
			'prefix' => array(
				'type' => 'string',
				'default' => ''
			),
			'suffix' => array(
				'type' => 'string',
				'default' => ''
			),
			'duration' => array(
				'type' => 'string',
				'default' => '1000'
			),
			'format' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'animationType' => array(
				'type' => 'string',
				'default' => 'counter'
			),
			'iconEnable' => array(
				'type' => 'boolean',
				'default' => false
			),
			'icon' => array(
				'type' => 'string',
				'default' => ''
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Easy Block'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'span'
			),
			'titlePosition' => array(
				'type' => 'string',
				'default' => 'bottom'
			),
			'contentGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentVerticalAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'subPreGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'wrapAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'wrapJustify' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPosition' => array(
				'type' => 'string',
				'default' => 'top'
			),
			'iconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'numberColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'numberTypography' => array(
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
			'numberStrokeWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'numberStrokeColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'numberTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'prefixColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'prefixTypography' => array(
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
			'prefixTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'suffixColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'suffixTypography' => array(
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
			'suffixTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'titleColor' => array(
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
			'titleAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'titleTextShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => '',
					'y' => '',
					'blur' => '',
					'color' => ''
				)
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconBoxSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
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
			'iconBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			)
		)
	)
);
