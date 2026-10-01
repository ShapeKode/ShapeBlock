/**
 * The Advanced tab's padding, margin and background, as CSS for the editor.
 *
 * On the page these come from a render_block_data filter in blocks.php, which
 * every server-rendered block passes through. Row and Column are drawn by the
 * browser while they are being edited -- they keep their inner blocks live --
 * so that filter never runs there and what an author typed into Advanced was
 * visible only after saving and viewing the page.
 *
 * This produces the same declarations for the canvas. The selector repeats the
 * block's own class three times for the same reason the PHP does: Row and
 * Column write padding and margin onto that same element from their own
 * controls, and without the extra weight the Advanced value would lose to them.
 */

const DEVICES = [
	{ suffix: '', query: '' },
	{ suffix: 'Tablet', query: '@media (max-width: 1024px)' },
	{ suffix: 'Mobile', query: '@media (max-width: 767px)' },
];

const SIDES = [ 'top', 'right', 'bottom', 'left' ];

/**
 * A number becomes pixels; anything already carrying a unit is left alone.
 *
 * @param {string|number} value Raw value.
 * @return {string} CSS length.
 */
const withUnit = ( value ) => {
	const v = String( value ).trim();
	if ( v === '' ) return '';
	return /^-?\d*\.?\d+$/.test( v ) ? `${ v }px` : v;
};

/**
 * One device's worth of declarations.
 *
 * @param {Object} attrs  Block attributes.
 * @param {string} suffix '', 'Tablet' or 'Mobile'.
 * @return {string} Declarations, or an empty string.
 */
const deviceDecls = ( attrs, suffix ) => {
	let out = '';

	[ [ 'advPadding', 'padding' ], [ 'advMargin', 'margin' ] ].forEach( ( [ base, prop ] ) => {
		const box = attrs[ `${ base }${ suffix }` ];
		if ( ! box || typeof box !== 'object' ) return;
		SIDES.forEach( ( side ) => {
			const value = withUnit( box[ side ] ?? '' );
			if ( value !== '' ) out += `${ prop }-${ side }:${ value };`;
		} );
	} );

	// The background is a single value with no per-device variant, matching the
	// control that sets it.
	if ( suffix === '' && attrs.advBgColor ) {
		out += `background-color:${ attrs.advBgColor };`;
	}

	return out;
};

/**
 * Build the Advanced CSS for one block.
 *
 * @param {Object} attrs Block attributes, including blockId.
 * @return {string} CSS, or an empty string when nothing is set.
 */
export const buildAdvancedCss = ( attrs ) => {
	if ( ! attrs || ! attrs.blockId ) return '';

	const id = String( attrs.blockId ).replace( /[^A-Za-z0-9_-]/g, '' );
	if ( id === '' ) return '';

	const sel = `.${ id }.${ id }.${ id }`;

	return DEVICES.reduce( ( css, { suffix, query } ) => {
		const decls = deviceDecls( attrs, suffix );
		if ( decls === '' ) return css;
		const rule = `${ sel }{${ decls }}`;
		return css + ( query ? `${ query }{${ rule }}` : rule );
	}, '' );
};

export default buildAdvancedCss;
