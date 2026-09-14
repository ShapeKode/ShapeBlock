<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/heading',
		'version' => '0.1.0',
		'title' => 'Heading',
		'category' => 'shapeblock',
		'description' => 'A heading with sub-heading, highlight, separator, gradient text and watermark.',
		'keywords' => array(
			'heading',
			'title',
			'subtitle',
			'text'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'shapeblock',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Heading'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h2'
			),
			'linkUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'linkTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'linkNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'align' => array(
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
			'titleMargin' => array(
				'type' => 'object'
			),
			'titleMarginTablet' => array(
				'type' => 'object'
			),
			'titleMarginMobile' => array(
				'type' => 'object'
			),
			'titlePadding' => array(
				'type' => 'object'
			),
			'titlePaddingTablet' => array(
				'type' => 'object'
			),
			'titlePaddingMobile' => array(
				'type' => 'object'
			),
			'highlightColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'highlightTypography' => array(
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
			'highlightTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'highlightTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'highlightPadding' => array(
				'type' => 'object'
			),
			'highlightPaddingTablet' => array(
				'type' => 'object'
			),
			'highlightPaddingMobile' => array(
				'type' => 'object'
			),
			'highlightMargin' => array(
				'type' => 'object'
			),
			'highlightMarginTablet' => array(
				'type' => 'object'
			),
			'highlightMarginMobile' => array(
				'type' => 'object'
			),
			'highlightBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
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
