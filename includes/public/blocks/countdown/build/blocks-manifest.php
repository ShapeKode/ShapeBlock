<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/countdown',
		'version' => '0.1.0',
		'title' => 'Countdown',
		'category' => 'shapeblock',
		'description' => 'A countdown timer to a target date with days/hours/minutes/seconds, custom labels, separators and full styling.',
		'keywords' => array(
			'countdown',
			'timer',
			'schedule',
			'time',
			'date'
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
			'dayLabel' => array(
				'type' => 'string',
				'default' => 'Days'
			),
			'hoursLabel' => array(
				'type' => 'string',
				'default' => 'Hours'
			),
			'minuteLabel' => array(
				'type' => 'string',
				'default' => 'Minutes'
			),
			'secondsLabel' => array(
				'type' => 'string',
				'default' => 'Seconds'
			),
			'targetDate' => array(
				'type' => 'string',
				'default' => ''
			),
			'separator' => array(
				'type' => 'string',
				'default' => 'shapeblock-cntdwn-space'
			),
			'labelUnderNumber' => array(
				'type' => 'boolean',
				'default' => false
			),
			'contentAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'contentAlignTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contentAlignMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'midGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'midGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'midGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorPositionX' => array(
				'type' => 'string',
				'default' => ''
			),
			'separatorColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemBgColor' => array(
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
			'itemBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'itemPadding' => array(
				'type' => 'object'
			),
			'itemPaddingTablet' => array(
				'type' => 'object'
			),
			'itemPaddingMobile' => array(
				'type' => 'object'
			),
			'daysTypography' => array(
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
			'daysTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'daysTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'daysColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'daysLabelColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'daysLabelTypography' => array(
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
			'daysLabelTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'daysLabelTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'hoursTypography' => array(
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
			'hoursTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'hoursTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'hoursColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'hoursLabelColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'hoursLabelTypography' => array(
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
			'hoursLabelTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'hoursLabelTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'minutesTypography' => array(
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
			'minutesTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'minutesTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'minutesColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'minutesLabelColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'minutesLabelTypography' => array(
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
			'minutesLabelTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'minutesLabelTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'secondsTypography' => array(
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
			'secondsTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'secondsTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'secondsColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'secondsLabelColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'secondsLabelTypography' => array(
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
			'secondsLabelTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'secondsLabelTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
