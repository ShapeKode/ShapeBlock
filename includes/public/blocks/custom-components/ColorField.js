import { ColorPalette, __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients } from '@wordpress/block-editor';

// The editor's own hook that returns the palettes grouped by where they come
// from (Theme, Default, Custom). With it the picker shows the same "THEME"
// swatches the core colour controls show. If a WordPress version ever drops the
// hook the picker still works, with the flat list the core component builds.
const useOrigins = typeof useMultipleOriginColorsAndGradients === 'function'
	? useMultipleOriginColorsAndGradients
	: () => ({});

/**
 * A colour picker that looks and behaves like the one in the core sidebar:
 * the site's theme colours as swatches, a custom colour option and a Clear
 * link. Always reports a string ('' when cleared), never undefined.
 */
const ColorField = ({ value, onChange, enableAlpha = true }) => {
	const origins = useOrigins();

	return (
		<ColorPalette
			colors={origins.colors}
			disableCustomColors={origins.disableCustomColors}
			value={value || undefined}
			onChange={(color) => onChange(color || '')}
			enableAlpha={enableAlpha}
			clearable
			__experimentalIsRenderedInSidebar
		/>
	);
};

export default ColorField;
