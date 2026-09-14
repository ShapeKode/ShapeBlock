<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/table',
		'version' => '0.1.0',
		'title' => 'Table',
		'category' => 'shapeblock',
		'description' => 'A data table with header, body and footer cells — icons, images, tooltips, colspan/rowspan and full styling.',
		'keywords' => array(
			'table',
			'data',
			'grid',
			'rows',
			'columns'
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
			'tableHeader' => array(
				'type' => 'array',
				'default' => array(
					array(
						'text' => 'Table Header'
					),
					array(
						'text' => 'Table Header'
					),
					array(
						'text' => 'Table Header'
					),
					array(
						'text' => 'Table Header'
					)
				)
			),
			'tableBody' => array(
				'type' => 'array',
				'default' => array(
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon',
						'row' => true
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					),
					array(
						'text' => 'Table Data',
						'type' => 'icon'
					)
				)
			),
			'tableFooter' => array(
				'type' => 'array',
				'default' => array(
					array(
						'text' => 'Table Footer'
					),
					array(
						'text' => 'Table Footer'
					),
					array(
						'text' => 'Table Footer'
					),
					array(
						'text' => 'Table Footer'
					)
				)
			),
			'verticalAlignTable' => array(
				'type' => 'string',
				'default' => ''
			),
			'verticalAlignTableTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'verticalAlignTableMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'tableMargin' => array(
				'type' => 'object'
			),
			'tableMarginTablet' => array(
				'type' => 'object'
			),
			'tableMarginMobile' => array(
				'type' => 'object'
			),
			'tablePadding' => array(
				'type' => 'object'
			),
			'tablePaddingTablet' => array(
				'type' => 'object'
			),
			'tablePaddingMobile' => array(
				'type' => 'object'
			),
			'tableBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'tableRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'headerAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerTypography' => array(
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
			'headerTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'headerTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'headBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'theadRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'theadPadding' => array(
				'type' => 'object'
			),
			'theadPaddingTablet' => array(
				'type' => 'object'
			),
			'theadPaddingMobile' => array(
				'type' => 'object'
			),
			'headerIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconYPos' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconMargin' => array(
				'type' => 'object'
			),
			'bodyAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyTypography' => array(
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
			'bodyTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'bodyTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'stripedBg' => array(
				'type' => 'boolean',
				'default' => false
			),
			'stripedBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyIconSize' => array(
				'type' => 'string',
				'default' => '16'
			),
			'bodyIconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyIconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'bodyIconGap' => array(
				'type' => 'object'
			),
			'bodyIconGapTablet' => array(
				'type' => 'object'
			),
			'bodyIconGapMobile' => array(
				'type' => 'object'
			),
			'tbodyRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'tbodyPadding' => array(
				'type' => 'object'
			),
			'tbodyPaddingTablet' => array(
				'type' => 'object'
			),
			'tbodyPaddingMobile' => array(
				'type' => 'object'
			),
			'tbodyMargin' => array(
				'type' => 'object'
			),
			'tbodyMarginTablet' => array(
				'type' => 'object'
			),
			'tbodyMarginMobile' => array(
				'type' => 'object'
			),
			'bodyBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'tooltipIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'tooltipIconSize' => array(
				'type' => 'string',
				'default' => '16'
			),
			'tooltipIconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'tooltipIconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'tooltipIconMargin' => array(
				'type' => 'object'
			),
			'tooltipAlign' => array(
				'type' => 'string',
				'default' => 'top'
			),
			'tooltipAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'tooltipAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'imgSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'imgSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'imgSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'imgRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'footerAlign' => array(
				'type' => 'string',
				'default' => ''
			),
			'footerAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'footerAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'footerTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'footerBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'footerTypography' => array(
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
			'footerTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'footerTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'tfootRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'tfootPadding' => array(
				'type' => 'object'
			),
			'tfootPaddingTablet' => array(
				'type' => 'object'
			),
			'tfootPaddingMobile' => array(
				'type' => 'object'
			),
			'footBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
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
