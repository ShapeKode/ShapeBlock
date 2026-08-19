<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/testimonials-grid',
		'version' => '0.1.0',
		'title' => 'Testimonial',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A grid of testimonials with 6 skins, ratings, quote icons, logos and a view-all reveal.',
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
			'testimonialsSkin' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'avatarImageTop' => array(
				'type' => 'boolean',
				'default' => false
			),
			'showLoadmore' => array(
				'type' => 'boolean',
				'default' => false
			),
			'loadMoreText' => array(
				'type' => 'string',
				'default' => 'View all reviews'
			),
			'testimonials' => array(
				'type' => 'array',
				'default' => array(
					array(
						'image' => array(
							
						),
						'name' => 'Stefan Sears',
						'designation' => 'Developer, Easy Elements Inc',
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
						'designation' => 'Developer, Easy Elements Inc',
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
						'designation' => 'Developer, Easy Elements Inc',
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
						'designation' => 'Developer, Easy Elements Inc',
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
				'default' => '3'
			),
			'columnsMobile' => array(
				'type' => 'string',
				'default' => '2'
			),
			'itemPadding' => array(
				'type' => 'object'
			),
			'logoHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'testimonialsAlignment' => array(
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
			'titleIcon' => array(
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
			'wrapperGap' => array(
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
			'nameMargin' => array(
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
			'descriptionMargin' => array(
				'type' => 'object'
			),
			'minHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'maxWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'authorMetaAlignment' => array(
				'type' => 'string',
				'default' => 'flex-start'
			),
			'authorMetaAlignmentStyle4' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'authorMetaGap' => array(
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
			'loadMoreTypography' => array(
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
			'loadMoreColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadMoreBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadMoreBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadmorePadding' => array(
				'type' => 'object'
			),
			'loadmoreBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'loadMoreBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'loadMoreHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadMoreHoverBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadMoreHoverBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'loadMoreHoverBorderColor' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
