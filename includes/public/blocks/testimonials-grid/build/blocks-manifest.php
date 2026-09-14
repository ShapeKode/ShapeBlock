<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/testimonials-grid',
		'version' => '0.1.0',
		'title' => 'Testimonial',
		'category' => 'shapeblock',
		'description' => 'A grid of testimonials with three styles, ratings, quote icons and logos.',
		'keywords' => array(
			'testimonial',
			'review',
			'feedback',
			'quote',
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
			)
		),
		'textdomain' => 'shapeblock',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php',
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'testimonialsSkin' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'testimonials' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						),
						'name' => 'Stefan Sears',
						'designation' => 'Developer, ShapeBlock Inc',
						'description' => 'This service exceeded all my expectations. The team was professional, fast, and truly cared about delivering a top-notch experience from start to finish.',
						'quoteIcon' => '',
						'showQuoteIconSkin1' => false,
						'rating' => '5',
						'logo' => array(
							
						)
					),
					array(
						'image' => array(
							
						),
						'name' => 'Stefan Sears',
						'designation' => 'Developer, ShapeBlock Inc',
						'description' => 'This service exceeded all my expectations. The team was professional, fast, and truly cared about delivering a top-notch experience from start to finish.',
						'quoteIcon' => '',
						'showQuoteIconSkin1' => false,
						'rating' => '5',
						'logo' => array(
							
						)
					),
					array(
						'image' => array(
							
						),
						'name' => 'Stefan Sears',
						'designation' => 'Developer, ShapeBlock Inc',
						'description' => 'This service exceeded all my expectations. The team was professional, fast, and truly cared about delivering a top-notch experience from start to finish.',
						'quoteIcon' => '',
						'showQuoteIconSkin1' => false,
						'rating' => '5',
						'logo' => array(
							
						)
					),
					array(
						'image' => array(
							
						),
						'name' => 'Stefan Sears',
						'designation' => 'Developer, ShapeBlock Inc',
						'description' => 'This service exceeded all my expectations. The team was professional, fast, and truly cared about delivering a top-notch experience from start to finish.',
						'quoteIcon' => '',
						'showQuoteIconSkin1' => false,
						'rating' => '5',
						'logo' => array(
							
						)
					)
				)
			),
			'showImage' => array(
				'type' => 'boolean',
				'default' => true
			),
			'columns' => array(
				'type' => 'string',
				'default' => '3'
			),
			'columnsTablet' => array(
				'type' => 'string',
				'default' => '2'
			),
			'columnsMobile' => array(
				'type' => 'string',
				'default' => '1'
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
			'logoHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'logoHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'logoHeightMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'testimonialsAlignment' => array(
				'type' => 'string',
				'default' => ''
			),
			'testimonialsAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'testimonialsAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'showRating' => array(
				'type' => 'boolean',
				'default' => true
			),
			'ratingColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'ratingSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'bgGradient' => array(
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
			'itemBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
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
			'itemInnerPadding' => array(
				'type' => 'object'
			),
			'itemInnerPaddingTablet' => array(
				'type' => 'object'
			),
			'itemInnerPaddingMobile' => array(
				'type' => 'object'
			),
			'wrapperGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'wrapperGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'wrapperGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'nameColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'nameTypography' => array(
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
			'nameTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'nameTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'nameMargin' => array(
				'type' => 'object'
			),
			'nameMarginTablet' => array(
				'type' => 'object'
			),
			'nameMarginMobile' => array(
				'type' => 'object'
			),
			'designationColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'designationTypography' => array(
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
			'designationTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'designationTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descriptionTypography' => array(
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
			'descriptionTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descriptionTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descriptionMargin' => array(
				'type' => 'object'
			),
			'descriptionMarginTablet' => array(
				'type' => 'object'
			),
			'descriptionMarginMobile' => array(
				'type' => 'object'
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
			'authorMetaAlignment' => array(
				'type' => 'string',
				'default' => 'flex-start'
			),
			'authorMetaAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorMetaAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorMetaAlignmentStyle4' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'authorMetaAlignmentStyle4Tablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorMetaAlignmentStyle4Mobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorMetaGap' => array(
				'type' => 'object'
			),
			'authorMetaGapTablet' => array(
				'type' => 'object'
			),
			'authorMetaGapMobile' => array(
				'type' => 'object'
			),
			'authorImageSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorImageBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'quoteIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'quoteIconSize' => array(
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
