<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/countdown',
		'version' => '0.1.0',
		'title' => 'Countdown',
		'category' => 'easy-elements-for-gutenberg',
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
				'default' => 'eelfg-cntdwn-space'
			),
			'labelUnderNumber' => array(
				'type' => 'boolean',
				'default' => false
			),
			'contentAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'midGap' => array(
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
			)
		)
	)
);
