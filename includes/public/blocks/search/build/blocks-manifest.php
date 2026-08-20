<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/search',
		'version' => '0.1.0',
		'title' => 'Search',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A site search — popup lightbox skin or inline search field skin, with full styling.',
		'keywords' => array(
			'search',
			'input',
			'field',
			'popup',
			'form'
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
			'selectStyle' => array(
				'type' => 'string',
				'default' => '1'
			),
			'searchTitle' => array(
				'type' => 'string',
				'default' => ''
			),
			'placeholder' => array(
				'type' => 'string',
				'default' => 'Type keywords here...'
			),
			'openIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconVerticalPosition' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconPositionSide' => array(
				'type' => 'string',
				'default' => 'right'
			),
			'iconOffsetRight' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconOffsetLeft' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputTypography' => array(
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
			'inputTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'placeholderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputPadding' => array(
				'type' => 'object'
			),
			'inputHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputFieldWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'inputBorderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputFocusBorderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'submitIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'submitIconHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'submitBtnBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'submitBtnHoverBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'submitPadding' => array(
				'type' => 'object'
			),
			'overlayBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupTitleColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupTitleTypography' => array(
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
			'closeIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIconSize' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
