<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/offcanvas',
		'version' => '0.1.0',
		'title' => 'Offcanvas',
		'category' => 'shapeblock',
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
				'default' => 'shapeblock-offcanvas-right'
			),
			'offcanvasWidth' => array(
				'type' => 'string',
				'default' => '380'
			),
			'offcanvasWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'offcanvasWidthMobile' => array(
				'type' => 'string',
				'default' => ''
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
			'openerTextTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'openerTextTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			),
			'offcanvasPaddingTablet' => array(
				'type' => 'object'
			),
			'offcanvasPaddingMobile' => array(
				'type' => 'object'
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
