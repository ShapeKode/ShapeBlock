<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/table',
		'version' => '0.1.0',
		'title' => 'Table',
		'category' => 'easy-elements-for-gutenberg',
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
			'tableMargin' => array(
				'type' => 'object'
			),
			'tablePadding' => array(
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
			'headerIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'headerIconSize' => array(
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
			'bodyIconGap' => array(
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
			'tbodyMargin' => array(
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
			'tooltipIconMargin' => array(
				'type' => 'object'
			),
			'tooltipAlign' => array(
				'type' => 'string',
				'default' => 'top'
			),
			'imgSize' => array(
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
			'footBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			)
		)
	)
);
