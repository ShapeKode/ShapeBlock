/**
 * "ShapeBlock Page" panel in the page sidebar: the page layout (the theme's
 * default, ShapeBlock Full Width or ShapeBlock Canvas) and Show Page Title.
 *
 * The layout is the page's template, so it is the same setting as the
 * editor's own Template choice. Settings come from
 * \ShapeBlock\Extension\ThemeBuilder\Page_Template::enqueue_editor().
 */
( function ( wp ) {
	'use strict';

	var settings = window.shapeblockPageSettings || {};
	var el = wp.element.createElement;
	var __ = wp.i18n.__;
	var useSelect = wp.data.useSelect;
	var useDispatch = wp.data.useDispatch;
	var Panel = ( wp.editor && wp.editor.PluginDocumentSettingPanel ) || ( wp.editPost && wp.editPost.PluginDocumentSettingPanel );
	var SelectControl = wp.components.SelectControl;
	var ToggleControl = wp.components.ToggleControl;
	var slugs = settings.slugs || {};
	// Empty when the theme has its own title switch: then only the layout here.
	var metaKey = settings.meta || '';

	if ( ! Panel || ! wp.plugins ) {
		return;
	}

	function PageSettings() {
		var data = useSelect( function ( select ) {
			var editor = select( 'core/editor' );
			return {
				type: editor.getCurrentPostType(),
				template: editor.getEditedPostAttribute( 'template' ) || '',
				meta: editor.getEditedPostAttribute( 'meta' ) || {},
			};
		}, [] );
		var editPost = useDispatch( 'core/editor' ).editPost;

		if ( 'page' !== data.type ) {
			return null;
		}

		var layouts = [ { label: __( 'Default (from the theme)', 'shapeblock' ), value: '' } ];
		if ( slugs.full ) {
			layouts.push( { label: __( 'Full Width', 'shapeblock' ), value: slugs.full } );
		}
		if ( slugs.canvas ) {
			layouts.push( { label: __( 'Canvas (no header or footer)', 'shapeblock' ), value: slugs.canvas } );
		}
		// A template of the theme's own stays choosable as it is.
		var known = layouts.some( function ( option ) {
			return option.value === data.template;
		} );
		if ( ! known ) {
			layouts.push( { label: data.template, value: data.template } );
		}

		return el(
			Panel,
			{ name: 'shapeblock-page-settings', title: __( 'ShapeBlock Page', 'shapeblock' ), className: 'shapeblock-page-settings' },
			layouts.length > 1 &&
				el( SelectControl, {
					label: __( 'Page Layout', 'shapeblock' ),
					value: data.template,
					options: layouts,
					onChange: function ( value ) {
						editPost( { template: value } );
					},
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
				} ),
			metaKey && layouts.length > 1 && el( 'div', { style: { height: '16px' } } ),
			metaKey && el( ToggleControl, {
				label: __( 'Show Page Title', 'shapeblock' ),
				checked: ! data.meta[ metaKey ],
				onChange: function ( show ) {
					var meta = {};
					meta[ metaKey ] = ! show;
					editPost( { meta: meta } );
				},
				__nextHasNoMarginBottom: true,
			} )
		);
	}

	wp.plugins.registerPlugin( 'shapeblock-page-settings', { render: PageSettings } );
} )( window.wp );
