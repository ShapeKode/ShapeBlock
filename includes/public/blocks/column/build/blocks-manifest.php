<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/column',
		'version' => '0.1.0',
		'title' => 'Column',
		'category' => 'easy-elements-for-gutenberg',
		'icon' => 'align-center',
		'description' => 'A column inside a eelfg Row. Holds any block — including nested Rows.',
		'keywords' => array(
			'column',
			'container',
			'layout'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'anchor' => true,
			'reusable' => false,
			'inserter' => true,
			'spacing' => array(
				'padding' => false,
				'margin' => false
			),
			'color' => array(
				'background' => false,
				'text' => false,
				'gradients' => false
			)
		),
		'textdomain' => 'easy-elements-for-gutenberg',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'htmlTag' => array(
				'type' => 'string',
				'default' => 'div'
			),
			'customClass' => array(
				'type' => 'string',
				'default' => ''
			),
			'widthType' => array(
				'type' => 'string',
				'default' => 'percentage'
			),
			'width' => array(
				'type' => 'string',
				'default' => ''
			),
			'widthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'widthMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexGrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexGrowTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexGrowMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexBasis' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexBasisTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexBasisMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'minHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'minHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'minHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'verticalAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexDirection' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexDirectionTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexDirectionMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'justifyContent' => array(
				'type' => 'string',
				'default' => ''
			),
			'justifyContentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'justifyContentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignItems' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignItemsTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignItemsMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignContent' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignContentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignContentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexWrap' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexWrapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexWrapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'paddingTablet' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'paddingMobile' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'margin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'marginTablet' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'marginMobile' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'background' => array(
				'type' => 'string',
				'default' => ''
			),
			'backgroundGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'border' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'borderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'boxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => ''
				)
			)
		)
	)
);
