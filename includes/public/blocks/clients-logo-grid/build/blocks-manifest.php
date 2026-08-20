<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/clients-logo-grid',
		'version' => '0.1.0',
		'title' => 'Client Logo',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A responsive grid of client / partner logos with links, grayscale and hover-swap effects.',
		'keywords' => array(
			'logo',
			'clients',
			'brand',
			'partner',
			'grid'
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
			'logos' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						),
						'link' => '',
						'linkNewTab' => false,
						'linkNofollow' => false
					),
					array(
						'image' => array(
							
						),
						'link' => '',
						'linkNewTab' => false,
						'linkNofollow' => false
					),
					array(
						'image' => array(
							
						),
						'link' => '',
						'linkNewTab' => false,
						'linkNofollow' => false
					),
					array(
						'image' => array(
							
						),
						'link' => '',
						'linkNewTab' => false,
						'linkNofollow' => false
					)
				)
			),
			'imageWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'fetchpriority' => array(
				'type' => 'string',
				'default' => 'low'
			),
			'columns' => array(
				'type' => 'string',
				'default' => '4'
			),
			'columnsTablet' => array(
				'type' => 'string',
				'default' => '3'
			),
			'columnsMobile' => array(
				'type' => 'string',
				'default' => '2'
			),
			'hoverSwap' => array(
				'type' => 'boolean',
				'default' => false
			),
			'itemWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemSpace' => array(
				'type' => 'object'
			),
			'itemPadding' => array(
				'type' => 'object'
			),
			'itemRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'itemBg' => array(
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
			'itemOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemScale' => array(
				'type' => 'string',
				'default' => ''
			),
			'grayscale' => array(
				'type' => 'boolean',
				'default' => false
			),
			'grayscaleOption' => array(
				'type' => 'string',
				'default' => 'normal_grayscale'
			),
			'itemHoverBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemHoverBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'itemHoverBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'itemHoverOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemHoverScale' => array(
				'type' => 'string',
				'default' => ''
			),
			'transition' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
