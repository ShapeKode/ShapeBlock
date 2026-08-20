<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/layout-row',
		'version' => '0.1.0',
		'title' => 'Row',
		'category' => 'easy-elements-for-gutenberg',
		'icon' => 'grid-view',
		'description' => 'A flexible row container that holds columns. Build any layout with responsive presets, flexbox controls and per-device styling.',
		'keywords' => array(
			'row',
			'container',
			'section',
			'layout',
			'columns',
			'grid',
			'flex'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'anchor' => true,
			'align' => array(
				'left',
				'center',
				'right',
				'wide',
				'full'
			),
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
			'preset' => array(
				'type' => 'string',
				'default' => '2-50-50'
			),
			'contentWidth' => array(
				'type' => 'string',
				'default' => 'boxed'
			),
			'customClass' => array(
				'type' => 'string',
				'default' => ''
			),
			'maxWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'maxWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'maxWidthMobile' => array(
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
			'columns' => array(
				'type' => 'number',
				'default' => 2
			),
			'columnsTablet' => array(
				'type' => 'number',
				'default' => 0
			),
			'columnsMobile' => array(
				'type' => 'number',
				'default' => 0
			),
			'gap' => array(
				'type' => 'string',
				'default' => '20px'
			),
			'gapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'gapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'rowGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'rowGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'rowGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'columnGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'columnGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'columnGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexDirection' => array(
				'type' => 'string',
				'default' => 'row'
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
				'default' => 'flex-start'
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
				'default' => 'stretch'
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
				'default' => 'wrap'
			),
			'flexWrapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'flexWrapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'verticalAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'equalHeight' => array(
				'type' => 'boolean',
				'default' => false
			),
			'stretchColumns' => array(
				'type' => 'boolean',
				'default' => false
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
					'right' => '15px',
					'bottom' => '',
					'left' => '15px'
				)
			),
			'paddingMobile' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '15px',
					'bottom' => '',
					'left' => '15px'
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
			'backgroundImage' => array(
				'type' => 'object',
				'default' => array(
					'url' => '',
					'id' => 0
				)
			),
			'backgroundSize' => array(
				'type' => 'string',
				'default' => 'cover'
			),
			'backgroundPosition' => array(
				'type' => 'string',
				'default' => 'center center'
			),
			'backgroundRepeat' => array(
				'type' => 'string',
				'default' => 'no-repeat'
			),
			'backgroundAttachment' => array(
				'type' => 'string',
				'default' => 'scroll'
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
			),
			'overflow' => array(
				'type' => 'string',
				'default' => ''
			),
			'zIndex' => array(
				'type' => 'string',
				'default' => ''
			),
			'position' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
