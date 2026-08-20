<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'easy-elements-for-gutenberg/team-grid',
		'version' => '0.1.0',
		'title' => 'Team Member',
		'category' => 'easy-elements-for-gutenberg',
		'description' => 'A team member card with 5 skins, social icons, contact info and an optional popup.',
		'keywords' => array(
			'team',
			'member',
			'profile',
			'people',
			'staff'
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
			'teamSkin' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'skin4HoverOverlay' => array(
				'type' => 'string',
				'default' => 'overlay1'
			),
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'imageSize' => array(
				'type' => 'string',
				'default' => 'full'
			),
			'name' => array(
				'type' => 'string',
				'default' => 'Harry Nelson'
			),
			'titleTag' => array(
				'type' => 'string',
				'default' => 'h4'
			),
			'designation' => array(
				'type' => 'string',
				'default' => 'Head of Operations'
			),
			'details' => array(
				'type' => 'string',
				'default' => ''
			),
			'showContactInfo' => array(
				'type' => 'boolean',
				'default' => true
			),
			'teamEmail' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamPhone' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamEmailIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamPhoneIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'actionType' => array(
				'type' => 'string',
				'default' => 'link'
			),
			'linkUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'linkTarget' => array(
				'type' => 'boolean',
				'default' => false
			),
			'linkNofollow' => array(
				'type' => 'boolean',
				'default' => false
			),
			'contentShow' => array(
				'type' => 'string',
				'default' => 'inside'
			),
			'fetchpriority' => array(
				'type' => 'string',
				'default' => 'low'
			),
			'imageOverlayColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageOverlayGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'disableImageScale' => array(
				'type' => 'boolean',
				'default' => false
			),
			'disableSocialLift' => array(
				'type' => 'boolean',
				'default' => false
			),
			'showSocialIcon' => array(
				'type' => 'boolean',
				'default' => false
			),
			'socialIconPosition' => array(
				'type' => 'string',
				'default' => 'default'
			),
			'socialIconShow' => array(
				'type' => 'string',
				'default' => 'dafault_show'
			),
			'socialHoverIcon' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconPosiTop' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconPosiBottom' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconPosiLeft' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconPosiRight' => array(
				'type' => 'string',
				'default' => ''
			),
			'socialLinks' => array(
				'type' => 'array',
				'default' => array(
					array(
						'url' => '#',
						'icon' => 'eelfg-icon-facebook-f'
					)
				)
			),
			'cardBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'cardBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'itemPadding' => array(
				'type' => 'object'
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
			'teamBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'teamHoverBorderColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'teamContentAlignment' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageHeightStyle' => array(
				'type' => 'string',
				'default' => ''
			),
			'imagePadding' => array(
				'type' => 'object'
			),
			'imageStyleRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'imageBelowBg' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageBelowHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageBelowPosition' => array(
				'type' => 'string',
				'default' => 'top'
			),
			'imageBelowRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'areaBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'wrapPadding' => array(
				'type' => 'object'
			),
			'wrapMargin' => array(
				'type' => 'object'
			),
			'areaBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'skin4OverlayColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'skin4OverlayGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'skin4OverlayBlur' => array(
				'type' => 'string',
				'default' => ''
			),
			'skin4OverlayTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'skin4Overlay2CircleSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'skin4OverlayPadding' => array(
				'type' => 'object'
			),
			'skin4OverlayBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'skin4OverlayTransition' => array(
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
			'namePadding' => array(
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
			'contactGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactTextColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactItemBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactItemBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactTextHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactItemBgHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactItemBgHoverGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactTypography' => array(
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
			'contactItemRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'contactItemPadding' => array(
				'type' => 'object'
			),
			'contactIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBoxSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'teamDescriptionColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamDescriptionTypography' => array(
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
			'teamDescriptionMargin' => array(
				'type' => 'object'
			),
			'teamDescriptionPadding' => array(
				'type' => 'object'
			),
			'descColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descBgGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'descColorHover' => array(
				'type' => 'string',
				'default' => ''
			),
			'descBgHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'descBgHoverGradient' => array(
				'type' => 'string',
				'default' => ''
			),
			'descBgHoverOpacity' => array(
				'type' => 'string',
				'default' => ''
			),
			'descTypography' => array(
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
			'descPadding' => array(
				'type' => 'object'
			),
			'sIconColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconHoverColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconHoverBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconTypography' => array(
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
			'sIconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconButtonSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconRadius' => array(
				'type' => 'object',
				'default' => array(
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => ''
				)
			),
			'sIconAreaPadding' => array(
				'type' => 'object'
			),
			'socialItemBorder' => array(
				'type' => 'object',
				'default' => array(
					'width' => 0,
					'color' => '',
					'style' => 'solid'
				)
			),
			'teamSocialIconAlignment' => array(
				'type' => 'string',
				'default' => ''
			),
			'socialBoxShadow' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0,
					'y' => 0,
					'b' => 0,
					's' => 0,
					'c' => 'rgba(0, 0, 0, 0)'
				)
			),
			'popupBgColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupNameColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupNameTypography' => array(
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
			'popupDesignationColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupDesignationTypography' => array(
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
			'popupDetailsColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupDetailsTypography' => array(
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
			'popupCloseColor' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
