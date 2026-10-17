<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function shapeblock_create_block_pricing_table_block_init() {
	// Register the block-specific style handle so render.php can attach the
	// per-instance inline CSS to it (matches the post-grid / gallery pattern).
	wp_register_style(
		'shapeblock-pricing-table-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array( 'shapeblock-public-style' ),
		shapeblock_asset_version( __DIR__ . '/build/style-index.css' )
	);

	// Editor-only styles (compiled from src/editor.scss).
	wp_register_style(
		'shapeblock-pricing-table-editor-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array( 'shapeblock-pricing-table-style' ),
		shapeblock_asset_version( __DIR__ . '/build/index.css' )
	);

	register_block_type( __DIR__ . '/build', array(
		'style'        => 'shapeblock-pricing-table-style',
		'editor_style' => 'shapeblock-pricing-table-editor-style',
	) );

	// The price inside a pricing table: its editor script comes with the
	// Pricing Table's, the markup from shapeblock_render_pricing_price().
	register_block_type( 'shapeblock/pricing-price', array(
		'api_version'     => 3,
		'parent'          => array( 'shapeblock/pricing-table' ),
		'attributes'      => array(
			'onSale'            => array( 'type' => 'boolean', 'default' => false ),
			'price'             => array( 'type' => 'string', 'default' => '59' ),
			'regularPrice'      => array( 'type' => 'string', 'default' => '59' ),
			'salePrice'         => array( 'type' => 'string', 'default' => '49' ),
			'currency'          => array( 'type' => 'string', 'default' => '$' ),
			'currencyPlacement' => array( 'type' => 'string', 'default' => 'left' ),
			'period'            => array( 'type' => 'string', 'default' => 'month' ),
			'separator'         => array( 'type' => 'string', 'default' => '/' ),
		),
		'render_callback' => 'shapeblock_render_pricing_price',
	) );
}
add_action( 'init', 'shapeblock_create_block_pricing_table_block_init' );

/**
 * The price: the amount (or the regular price crossed out and the sale price)
 * with its currency, then the period.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function shapeblock_render_pricing_price( $attributes ) {
	$currency = '<span class="shapeblock-currency">' . esc_html( (string) $attributes['currency'] ) . '</span>';
	$value    = function ( $amount ) use ( $currency, $attributes ) {
		return 'right' === $attributes['currencyPlacement'] ? esc_html( (string) $amount ) . $currency : $currency . esc_html( (string) $amount );
	};
	if ( ! empty( $attributes['onSale'] ) ) {
		$amounts = '<span class="shapeblock-old-price">' . $value( $attributes['regularPrice'] ) . '</span><span class="shapeblock-sale-price">' . $value( $attributes['salePrice'] ) . '</span>';
	} else {
		$amounts = '<span class="shapeblock-amount">' . $value( $attributes['price'] ) . '</span>';
	}
	$period = '<span class="shapeblock-period">' . esc_html( (string) $attributes['separator'] . (string) $attributes['period'] ) . '</span>';
	return '<div ' . get_block_wrapper_attributes( array( 'class' => 'shapeblock-price' ) ) . '>' . $amounts . $period . '</div>';
}

/**
 * Three pricing plans side by side, in one of the Pricing Table's styles.
 *
 * @param string $style Block style: default, centered or dark.
 * @return string Block markup.
 */
function shapeblock_pricing_pattern_content( $style ) {
	$plans = array(
		array(
			'title'    => __( 'Basic', 'shapeblock' ),
			'price'    => '19',
			'features' => array( __( '1 Website', 'shapeblock' ), __( '10 GB Storage', 'shapeblock' ), __( 'Free SSL Certificate', 'shapeblock' ), __( 'Email Support', 'shapeblock' ) ),
		),
		array(
			'title'    => __( 'Pro', 'shapeblock' ),
			'price'    => '49',
			'featured' => true,
			'features' => array( __( '10 Websites', 'shapeblock' ), __( '100 GB Storage', 'shapeblock' ), __( 'Free SSL Certificate', 'shapeblock' ), __( 'Priority Support', 'shapeblock' ) ),
		),
		array(
			'title'    => __( 'Business', 'shapeblock' ),
			'price'    => '99',
			'features' => array( __( 'Unlimited Websites', 'shapeblock' ), __( '1 TB Storage', 'shapeblock' ), __( 'Free SSL Certificate', 'shapeblock' ), __( '24/7 Phone Support', 'shapeblock' ) ),
		),
	);

	$columns = '';
	foreach ( $plans as $plan ) {
		$attrs = array();
		if ( ! empty( $plan['featured'] ) ) {
			$attrs['isFeatured']   = true;
			$attrs['featuredText'] = __( 'Most Popular', 'shapeblock' );
		}
		if ( 'default' !== $style ) {
			$attrs['className'] = 'is-style-' . $style;
		}

		// The card's blocks, in the markup their own save() writes.
		$items = '';
		foreach ( $plan['features'] as $feature ) {
			$items .= '<!-- wp:list-item --><li>' . esc_html( $feature ) . '</li><!-- /wp:list-item -->';
		}
		$inner  = '<!-- wp:heading {"level":3,"className":"shapeblock-price-title"} --><h3 class="wp-block-heading shapeblock-price-title">' . esc_html( $plan['title'] ) . '</h3><!-- /wp:heading -->';
		$inner .= '<!-- wp:shapeblock/pricing-price ' . wp_json_encode( array( 'price' => $plan['price'] ) ) . ' /-->';
		$inner .= '<!-- wp:list {"className":"shapeblock-features"} --><ul class="wp-block-list shapeblock-features">' . $items . '</ul><!-- /wp:list -->';
		$inner .= '<!-- wp:buttons {"className":"shapeblock-btn-part"} --><div class="wp-block-buttons shapeblock-btn-part"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button">' . esc_html__( 'Get Started', 'shapeblock' ) . '</a></div><!-- /wp:button --></div><!-- /wp:buttons -->';

		$columns .= '<!-- wp:column --><div class="wp-block-column"><!-- wp:shapeblock/pricing-table ' . ( $attrs ? wp_json_encode( $attrs ) . ' ' : '' ) . '-->' . $inner . '<!-- /wp:shapeblock/pricing-table --></div><!-- /wp:column -->';
	}

	return '<!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide">' . $columns . '</div><!-- /wp:columns -->';
}

/**
 * Ready-made pricing sections, one in each style, shown with a preview in
 * the inserter (search "pricing", or the ShapeBlock patterns).
 */
function shapeblock_register_pricing_patterns() {
	register_block_pattern_category(
		'shapeblock',
		array( 'label' => __( 'ShapeBlock', 'shapeblock' ) )
	);

	$styles = array(
		'default'  => array(
			'title'       => __( 'Pricing Table: Classic', 'shapeblock' ),
			'description' => __( 'Three pricing plans side by side on white cards.', 'shapeblock' ),
		),
		'centered' => array(
			'title'       => __( 'Pricing Table: Centered', 'shapeblock' ),
			'description' => __( 'Three centered pricing plans with a colored top bar and round buttons.', 'shapeblock' ),
		),
		'dark'     => array(
			'title'       => __( 'Pricing Table: Dark', 'shapeblock' ),
			'description' => __( 'Three pricing plans on dark cards with light text.', 'shapeblock' ),
		),
	);

	foreach ( $styles as $style => $pattern ) {
		register_block_pattern(
			'shapeblock/pricing-table-' . $style,
			array(
				'title'       => $pattern['title'],
				'description' => $pattern['description'],
				'categories'  => array( 'shapeblock' ),
				'keywords'    => array( __( 'pricing', 'shapeblock' ), __( 'price', 'shapeblock' ), __( 'plan', 'shapeblock' ) ),
				'blockTypes'  => array( 'shapeblock/pricing-table' ),
				'content'     => shapeblock_pricing_pattern_content( $style ),
			)
		);
	}
}
add_action( 'init', 'shapeblock_register_pricing_patterns' );
