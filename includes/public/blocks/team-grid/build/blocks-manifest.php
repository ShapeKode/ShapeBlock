<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'shapeblock/team-grid',
		'version' => '0.1.0',
		'title' => 'Team Member',
		'category' => 'shapeblock',
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
			'imageOverlayColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageOverlayGradient' => array(
				'type' => 'string',
				'default' => ''
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
						'icon' => 'shapeblock-icon-facebook-f'
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
			'itemPaddingTablet' => array(
				'type' => 'object'
			),
			'itemPaddingMobile' => array(
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
			'teamContentAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamContentAlignmentMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageWidth' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageWidthTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageWidthMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageHeightStyle' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageHeightStyleTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageHeightStyleMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'imagePadding' => array(
				'type' => 'object'
			),
			'imagePaddingTablet' => array(
				'type' => 'object'
			),
			'imagePaddingMobile' => array(
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
			'imageBelowHeightTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageBelowHeightMobile' => array(
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
			'wrapPaddingTablet' => array(
				'type' => 'object'
			),
			'wrapPaddingMobile' => array(
				'type' => 'object'
			),
			'wrapMargin' => array(
				'type' => 'object'
			),
			'wrapMarginTablet' => array(
				'type' => 'object'
			),
			'wrapMarginMobile' => array(
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
			'contactGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactGapMobile' => array(
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
			'contactTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'contactTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'contactIconSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconSizeMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBoxSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBoxSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactIconBoxSizeMobile' => array(
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
			'teamDescriptionTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'teamDescriptionTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'descTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'descTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'sIconTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'sIconTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'sIconGap' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconGapTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconGapMobile' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconButtonSize' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconButtonSizeTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'sIconButtonSizeMobile' => array(
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
			'sIconAreaPaddingTablet' => array(
				'type' => 'object'
			),
			'sIconAreaPaddingMobile' => array(
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
			'teamSocialIconAlignmentTablet' => array(
				'type' => 'string',
				'default' => ''
			),
			'teamSocialIconAlignmentMobile' => array(
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
			'popupNameTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'popupNameTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'popupDesignationTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'popupDesignationTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
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
			'popupDetailsTypographyTablet' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'popupDetailsTypographyMobile' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'popupCloseColor' => array(
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
