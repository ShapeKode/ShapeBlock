import { __ } from '@wordpress/i18n';
import { Dropdown, Button, ColorIndicator, GradientPicker, TabPanel } from '@wordpress/components';
import {
	__experimentalColorGradientControl as ColorGradientControl,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';

import ColorField from './ColorField';

const useOrigins = typeof useMultipleOriginColorsAndGradients === 'function'
	? useMultipleOriginColorsAndGradients
	: () => ({});

/**
 * A background setting: a colour or a gradient, picked the way the core
 * sidebar does it - one popover with a Color / Gradient switch, the theme
 * swatches and a Clear link. Picking one clears the other, because the front
 * end paints the gradient whenever there is one.
 */
const BackgroundControl = ({
	label,
	colorValue,
	gradientValue,
	onColorChange,
	onGradientChange,
	defaultColor = '',
	defaultGradient = '',
}) => {
	const origins = useOrigins();

	// What the swatch in the row shows: the gradient if there is one, else the colour.
	const swatch = gradientValue || colorValue || undefined;

	const pickColor = (color) => {
		onColorChange(color || defaultColor);
		if (color && gradientValue) {
			onGradientChange(defaultGradient);
		}
	};
	const pickGradient = (gradient) => {
		onGradientChange(gradient || defaultGradient);
		if (gradient && colorValue) {
			onColorChange(defaultColor);
		}
	};

	const content = ColorGradientControl ? (
		<ColorGradientControl
			{...origins}
			colorValue={colorValue || undefined}
			gradientValue={gradientValue || undefined}
			onColorChange={pickColor}
			onGradientChange={pickGradient}
			enableAlpha
			showTitle={false}
			headingLevel={4}
			__experimentalIsRenderedInSidebar
		/>
	) : (
		// Older editors without the combined control: the two pickers on tabs.
		<TabPanel
			className="shapeblock-background-tabs"
			activeClass="is-active"
			initialTabName={gradientValue ? 'gradient' : 'solid'}
			tabs={[
				{ name: 'solid', title: __('Solid', 'shapeblock') },
				{ name: 'gradient', title: __('Gradient', 'shapeblock') },
			]}
		>
			{(tab) =>
				'gradient' === tab.name ? (
					<GradientPicker value={gradientValue || undefined} onChange={pickGradient} clearable />
				) : (
					<ColorField value={colorValue} onChange={pickColor} />
				)
			}
		</TabPanel>
	);

	return (
		<div className="shapeblock-background-control" style={{ position: 'relative', marginBottom: '15px' }}>
			<Dropdown
				// The dropdown wrapper is inline-block by default, which shrank the row
				// to its text; it spans the panel like the Border and Shadow rows.
				className="shapeblock-color-dropdown"
				style={{ display: 'block', width: '100%' }}
				popoverProps={{ placement: 'left-start', offset: 36, shift: true }}
				renderToggle={({ isOpen, onToggle }) => (
					<Button
						className="shapeblock-color-item"
						onClick={onToggle}
						aria-expanded={isOpen}
						style={{
							width: '100%',
							boxSizing: 'border-box',
							height: 'auto',
							minHeight: '40px',
							justifyContent: 'flex-start',
							gap: '10px',
							padding: '8px 12px',
							border: '1px solid #ddd',
							borderRadius: '2px',
							background: isOpen ? '#f0f0f0' : 'transparent',
						}}
					>
						<ColorIndicator colorValue={swatch} />
						<span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
					</Button>
				)}
				renderContent={() => <div style={{ padding: '16px', width: '260px' }}>{content}</div>}
			/>
		</div>
	);
};

export default BackgroundControl;
