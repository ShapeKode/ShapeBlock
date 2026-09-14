import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

const TextAlignControl = ({
    attributes,
    setAttributes,
    attributeKey,
    label = __('Text Align', 'shapeblock'),
}) => {
    const value = attributes[attributeKey] || '';

    return (
        <SelectControl
            value={value}
            options={[
                { label: __('Default', 'shapeblock'), value: '' },
                { label: __('Left', 'shapeblock'), value: 'left' },
                { label: __('Center', 'shapeblock'), value: 'center' },
                { label: __('Right', 'shapeblock'), value: 'right' },
                { label: __('Justify', 'shapeblock'), value: 'justify' },
            ]}
            onChange={(newValue) => setAttributes({ [attributeKey]: newValue })}
            __nextHasNoMarginBottom={true}
        />
    );
};

export default TextAlignControl;
