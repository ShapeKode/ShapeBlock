<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/offcanvas',
		'version' => '0.1.0',
		'title' => 'Offcanvas',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A toggle button that opens an off-canvas panel rendering a selected Template — classic side or modern fullscreen.',
		'keywords' => array(
			'offcanvas',
			'menu',
			'drawer',
			'sidebar',
			'panel'
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
			'offcanvasLayout' => array(
				'type' => 'string',
				'default' => 'classic'
			),
			'menuText' => array(
				'type' => 'string',
				'default' => 'Menu'
			),
			'btnIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'positionOffcanvas' => array(
				'type' => 'string',
				'default' => 'eelfg-offcanvas-right'
			),
			'offcanvasWidth' => array(
				'type' => 'string',
				'default' => '380'
			),
			'contentTemplate' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'needBlur' => array(
				'type' => 'boolean',
				'default' => false
			),
			'openerTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'openerTextTypography' => array(
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
			'openerIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'openerHamburgerColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'openerIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'openerIconSizeModern' => array(
				'type' => 'string',
				'default' => ''
			),
			'closingIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'closingIconModernColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'closingIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'offcanvasBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'offcanvasPadding' => array(
				'type' => 'object'
			)
		)
	)
);
