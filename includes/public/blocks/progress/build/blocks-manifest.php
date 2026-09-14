<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/progress',
		'version' => '0.1.0',
		'title' => 'Progress Bar',
		'category' => 'shapeblock',
		'description' => 'A progress / skill bar with title and percent — two layout styles and full styling.',
		'keywords' => array(
			'progress',
			'bar',
			'skill',
			'percent',
			'meter'
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
			'selectStyle' => array(
				'type' => 'string',
				'default' => 'style1'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Web Designer'
			),
			'percent' => array(
				'type' => 'number',
				'default' => 50
			),
			'progressColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'progressBarColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'style2BgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'style2BgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'progressHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'progressHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'progressHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'progressRadius' => array(
				'type' => 'string',
				'default' => ''
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
			'titleTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'titleTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'percentColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'percentTypography' => array(
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
			'percentTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'percentTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
