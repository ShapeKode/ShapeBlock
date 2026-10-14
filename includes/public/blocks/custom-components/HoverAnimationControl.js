import { __ } from '@wordpress/i18n';
import { SelectControl, TextControl } from '@wordpress/components';

/**
 * Hover Animation and its speed, for any block that renders the class from
 * Helper::hover_animation(). `defaultLabel` names what the block does with
 * no animation chosen; `allowNone` adds an option that turns that off too.
 */
const HoverAnimationControl = ({ attributes, setAttributes, defaultLabel = __('None', 'shapeblock'), allowNone = false }) => {
	const { hoverAnimation, hoverAnimSpeed } = attributes;
	const options = [
		{ label: defaultLabel, value: '' },
		...(allowNone ? [{ label: __('None', 'shapeblock'), value: 'none' }] : []),
		{ label: __('Grow', 'shapeblock'), value: 'grow' },
		{ label: __('Shrink', 'shapeblock'), value: 'shrink' },
		{ label: __('Float', 'shapeblock'), value: 'float' },
		{ label: __('Sink', 'shapeblock'), value: 'sink' },
		{ label: __('Rotate', 'shapeblock'), value: 'rotate' },
		{ label: __('Spin', 'shapeblock'), value: 'spin' },
		{ label: __('Pulse', 'shapeblock'), value: 'pulse' },
		{ label: __('Pop', 'shapeblock'), value: 'pop' },
		{ label: __('Bob', 'shapeblock'), value: 'bob' },
		{ label: __('Hang', 'shapeblock'), value: 'hang' },
		{ label: __('Wobble Horizontal', 'shapeblock'), value: 'wobble-horizontal' },
		{ label: __('Wobble Vertical', 'shapeblock'), value: 'wobble-vertical' },
		{ label: __('Buzz', 'shapeblock'), value: 'buzz' },
	];
	return (
		<>
			<SelectControl
				label={__('Hover Animation', 'shapeblock')}
				value={hoverAnimation}
				options={options}
				onChange={(v) => setAttributes({ hoverAnimation: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{hoverAnimation && hoverAnimation !== 'none' && (
				<TextControl
					label={__('Animation Speed (ms)', 'shapeblock')}
					type="number"
					min={100}
					max={5000}
					step={50}
					value={hoverAnimSpeed}
					onChange={(v) => setAttributes({ hoverAnimSpeed: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			)}
		</>
	);
};

export default HoverAnimationControl;
