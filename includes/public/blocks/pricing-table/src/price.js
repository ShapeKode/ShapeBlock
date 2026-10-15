/**
 * The price inside a Pricing Table: the amount, or the regular price crossed
 * out and the sale price, with its currency and the period - each typed in
 * place. Rendered by shapeblock_render_pricing_price() in pricing-table.php.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl } from '@wordpress/components';

export const PRICE_BLOCK = 'shapeblock/pricing-price';
export const PRICE_KEYS = ['onSale', 'price', 'regularPrice', 'salePrice', 'currency', 'currencyPlacement', 'period', 'separator'];

const toHtml = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toText = (html) => {
	const el = document.createElement('textarea');
	el.innerHTML = String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '');
	return el.value;
};

function PriceEdit({ attributes, setAttributes }) {
	const { onSale, currencyPlacement, separator } = attributes;
	const plain = (key, placeholder, className) => (
		<RichText
			tagName="span"
			className={className}
			value={toHtml(attributes[key])}
			onChange={(v) => setAttributes({ [key]: toText(v) })}
			allowedFormats={[]}
			placeholder={placeholder}
		/>
	);
	const amount = (key) => {
		const currency = plain('currency', '$', 'shapeblock-currency');
		const value = plain(key, '0');
		return 'right' === currencyPlacement ? <>{value}{currency}</> : <>{currency}{value}</>;
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Price', 'shapeblock')} initialOpen={true}>
					<p className="components-base-control__help">{__('Type the price, currency and period in the card.', 'shapeblock')}</p>
					<ToggleControl label={__('On Sale?', 'shapeblock')} help={__('Shows the regular price crossed out, then the sale price.', 'shapeblock')} checked={!!onSale} onChange={(v) => setAttributes({ onSale: v })} __nextHasNoMarginBottom />
					<SelectControl
						label={__('Currency Position', 'shapeblock')}
						value={currencyPlacement}
						options={[
							{ label: __('Left', 'shapeblock'), value: 'left' },
							{ label: __('Right', 'shapeblock'), value: 'right' },
						]}
						onChange={(v) => setAttributes({ currencyPlacement: v })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl label={__('Separator', 'shapeblock')} help={__('Between the price and the period, such as /.', 'shapeblock')} value={separator} onChange={(v) => setAttributes({ separator: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps({ className: 'shapeblock-price' })}>
				{onSale ? (
					<>
						<span className="shapeblock-old-price">{amount('regularPrice')}</span>
						<span className="shapeblock-sale-price">{amount('salePrice')}</span>
					</>
				) : (
					<span className="shapeblock-amount">{amount('price')}</span>
				)}
				<span className="shapeblock-period">
					{separator}
					{plain('period', __('month', 'shapeblock'))}
				</span>
			</div>
		</>
	);
}

registerBlockType(PRICE_BLOCK, {
	apiVersion: 3,
	title: __('Price', 'shapeblock'),
	description: __('The price of a plan, with its currency and period.', 'shapeblock'),
	category: 'shapeblock',
	parent: ['shapeblock/pricing-table'],
	icon: (
		<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path fill="currentColor" d="M12.8 5v1.6c1.6.3 2.8 1.3 3 2.9h-1.9c-.1-.8-.9-1.4-2.1-1.4-1.3 0-2 .6-2 1.3 0 .8.7 1.1 2.4 1.5 2.2.5 3.8 1.1 3.8 3.1 0 1.6-1.2 2.6-3.2 2.9V19h-1.6v-1.6c-1.9-.3-3.2-1.4-3.3-3.2h1.9c.1 1 1 1.7 2.4 1.7s2.2-.6 2.2-1.4c0-.9-.8-1.2-2.6-1.6-2.1-.5-3.6-1.1-3.6-3 0-1.4 1.1-2.5 2.9-2.8V5h1.7z" />
		</svg>
	),
	// Part of the card: no Responsive, Display Conditions or Motion of its own.
	supports: { html: false, reusable: false, shapeblockExtensions: false },
	attributes: {
		onSale: { type: 'boolean', default: false },
		price: { type: 'string', default: '59' },
		regularPrice: { type: 'string', default: '59' },
		salePrice: { type: 'string', default: '49' },
		currency: { type: 'string', default: '$' },
		currencyPlacement: { type: 'string', default: 'left' },
		period: { type: 'string', default: 'month' },
		separator: { type: 'string', default: '/' },
	},
	edit: PriceEdit,
	save: () => null,
});
