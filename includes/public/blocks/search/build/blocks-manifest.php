<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/search',
		'version' => '0.1.0',
		'title' => 'Search',
		'category' => 'shapeblock',
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
			'openIconImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'closeIconImage' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'iconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'iconSizeMobile' => array(
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
			'inputTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'inputTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'inputPaddingTablet' => array(
				'type' => 'object'
			),
			'inputPaddingMobile' => array(
				'type' => 'object'
			),
			'inputHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputFieldWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputFieldWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'inputFieldWidthMobile' => array(
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
			'submitPaddingTablet' => array(
				'type' => 'object'
			),
			'submitPaddingMobile' => array(
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
			'popupTitleTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'popupTitleTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'closeIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'closeIconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
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
