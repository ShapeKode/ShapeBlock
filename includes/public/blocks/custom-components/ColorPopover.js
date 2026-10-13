import { Dropdown, Button, ColorIndicator } from '@wordpress/components';

import ColorField from './ColorField';

/**
 * A colour setting that looks like the colour rows in the core sidebar: a
 * swatch and a label, and a popover with the theme palette when it is clicked.
 */
const ColorPopover = ({ label, color, onChange, defaultColor = '' }) => {
	return (
		<div className="shapeblock-color-popover-control" style={{ position: 'relative', marginBottom: '15px' }}>
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
						<ColorIndicator colorValue={color || undefined} />
						<span style={{ textAlign: 'left' }}>{label}</span>
					</Button>
				)}
				renderContent={() => (
					<div style={{ padding: '16px', width: '260px' }}>
						<ColorField value={color} onChange={(value) => onChange(value || defaultColor)} />
					</div>
				)}
			/>
		</div>
	);
};

export default ColorPopover;
