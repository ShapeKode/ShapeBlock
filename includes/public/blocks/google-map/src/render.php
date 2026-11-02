<?php
/**
 * Google Map - server-side render: a Google Maps embed of the first place, and
 * a list of the places (name, address, details, phone, a directions link)
 * beside it, under it or on a card over it. Picking a place in the list shows
 * it on the map (view.js). With "Load on click" nothing is loaded from Google
 * until the visitor asks for the map.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
return ( function ( $attributes ) {

	$h         = '\ShapeBlock\Frontend\Helper';
	$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : '';
	if ( '' === $unique_id ) {
		$unique_id = 'shapeblock-gm-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
	}
	$get  = function ( $key, $fallback = '' ) use ( $attributes ) {
		return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : $fallback;
	};
	$pick = function ( $key, $allowed, $fallback ) use ( $get ) {
		return in_array( $get( $key ), $allowed, true ) ? $get( $key ) : $fallback;
	};
	$tag    = $pick( 'titleTag', array( 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ), 'h4' );
	$list   = $pick( 'listPosition', array( 'left', 'right', 'below', 'overlay', 'none' ), 'left' );
	$look   = $pick( 'mapLook', array( 'standard', 'gray', 'dark', 'warm', 'soft' ), 'standard' );
	$type   = 'satellite' === $get( 'mapType' ) ? 'k' : 'm';
	$zoom   = isset( $attributes['zoom'] ) ? max( 1, min( 21, (int) $attributes['zoom'] ) ) : 15;
	$lang   = substr( get_locale(), 0, 2 );
	$lazy   = ! empty( $attributes['clickToLoad'] );
	$route  = ! isset( $attributes['showDirections'] ) || ! empty( $attributes['showDirections'] );
	$label  = '' !== trim( $get( 'directionsLabel' ) ) ? $get( 'directionsLabel' ) : __( 'Get Directions', 'shapeblock' );
	$places = array();
	foreach ( isset( $attributes['locations'] ) && is_array( $attributes['locations'] ) ? $attributes['locations'] : array() as $place ) {
		if ( is_array( $place ) && isset( $place['address'] ) && is_scalar( $place['address'] ) && '' !== trim( (string) $place['address'] ) ) {
			$places[] = $place;
		}
	}
	if ( ! $places ) {
		echo '<div ' . wp_kses_post( get_block_wrapper_attributes( array( 'class' => 'shapeblock-block shapeblock-gm' ) ) ) . '><p>' . esc_html__( 'Please add an address.', 'shapeblock' ) . '</p></div>';
		return;
	}
	$embed = function ( $address ) use ( $type, $zoom, $lang ) {
		return 'https://maps.google.com/maps?' . http_build_query(
			array(
				'q'      => $address,
				't'      => $type,
				'z'      => $zoom,
				'hl'     => $lang,
				'output' => 'embed',
			)
		);
	};

	// Inline styles: sizes and colours as custom properties on the block, the
	// map, the places and the text as rules on their own elements.
	$selector = '.shapeblock-gm.' . $unique_id;
	$handle   = 'shapeblock-google-map-style';
	$typo     = function ( $obj ) use ( $h ) {
		$out = array();
		if ( empty( $obj ) || ! is_array( $obj ) ) {
			return $out;
		}
		foreach ( array( 'fontFamily' => 'font-family', 'fontWeight' => 'font-weight', 'fontStyle' => 'font-style', 'textTransform' => 'text-transform', 'lineHeight' => 'line-height', 'textDecoration' => 'text-decoration' ) as $key => $prop ) {
			if ( ! empty( $obj[ $key ] ) ) {
				$out[ $prop ] = $obj[ $key ];
			}
		}
		foreach ( array( 'fontSize' => 'font-size', 'letterSpacing' => 'letter-spacing' ) as $key => $prop ) {
			if ( ! empty( $obj[ $key ] ) ) {
				$out[ $prop ] = $h::ensure_unit( $obj[ $key ] );
			}
		}
		return $out;
	};
	$dims     = function ( $obj, $type ) use ( $h ) {
		$out = array();
		if ( empty( $obj ) || ! is_array( $obj ) ) {
			return $out;
		}
		$map = 'padding' === $type
			? array( 'top' => 'padding-top', 'right' => 'padding-right', 'bottom' => 'padding-bottom', 'left' => 'padding-left' )
			: array( 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' );
		foreach ( $map as $side => $prop ) {
			if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) {
				$out[ $prop ] = $h::ensure_unit( $obj[ $side ] );
			}
		}
		return $out;
	};
	$color    = function ( $key ) use ( $attributes, $h ) {
		return ! empty( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $h::sanitize_css_color( $attributes[ $key ], '' ) : '';
	};
	// One device's rules; $suffix is '', 'Tablet' or 'Mobile'.
	$rules = function ( $suffix ) use ( $attributes, $selector, $typo, $dims, $color, $h ) {
		$root = array();
		foreach ( array( 'height' => '--shapeblock-gm-h', 'listWidth' => '--shapeblock-gm-list-w', 'gap' => '--shapeblock-gm-gap', 'itemGap' => '--shapeblock-gm-item-gap' ) as $key => $prop ) {
			$k = $key . $suffix;
			if ( isset( $attributes[ $k ] ) && is_scalar( $attributes[ $k ] ) && '' !== (string) $attributes[ $k ] ) {
				$root[ $prop ] = $h::ensure_unit( $attributes[ $k ] );
			}
		}
		// Phones keep their own 340px map until a phone height is set, even when a
		// desktop or tablet height is (the block's rule would otherwise win).
		if ( 'Mobile' === $suffix && ! isset( $root['--shapeblock-gm-h'] ) && ( ! empty( $attributes['height'] ) || ! empty( $attributes['heightTablet'] ) ) ) {
			$root['--shapeblock-gm-h'] = '340px';
		}
		$map = array();
		if ( '' === $suffix ) {
			foreach ( array( 'activeColor' => '--shapeblock-gm-accent', 'itemBg' => '--shapeblock-gm-item-bg', 'itemActiveBg' => '--shapeblock-gm-active-bg', 'cardBg' => '--shapeblock-gm-card-bg', 'titleColor' => '--shapeblock-gm-title', 'textColor' => '--shapeblock-gm-text', 'linkColor' => '--shapeblock-gm-link' ) as $key => $prop ) {
				if ( '' !== $color( $key ) ) {
					$root[ $prop ] = $color( $key );
				}
			}
			$map = $dims( $attributes['mapRadius'] ?? array(), 'radius' );
			if ( ! empty( $attributes['mapBorder'] ) ) {
				$map = array_merge( $map, $h::border_to_css_props( $attributes['mapBorder'] ) );
			}
			if ( ! empty( $attributes['mapShadow'] ) && is_array( $attributes['mapShadow'] ) && '' !== trim( (string) ( $attributes['mapShadow']['c'] ?? '' ) ) ) {
				$map['box-shadow'] = $h::box_shadow_to_css( $attributes['mapShadow'] );
			}
		}
		$item = $dims( $attributes[ 'itemPadding' . $suffix ] ?? array(), 'padding' );
		if ( '' === $suffix ) {
			$item = array_merge( $item, $dims( $attributes['itemRadius'] ?? array(), 'radius' ) );
		}
		$css = '';
		foreach ( array(
			''                        => $root,
			' .shapeblock-gm__map'   => $map,
			' .shapeblock-gm__item'  => $item,
			' .shapeblock-gm__title' => $typo( $attributes[ 'titleTypography' . $suffix ] ?? array() ),
			' .shapeblock-gm__text'  => $typo( $attributes[ 'textTypography' . $suffix ] ?? array() ),
		) as $sub => $decls ) {
			$decls = $h::get_inline_styles( $decls );
			if ( $decls ) {
				$css .= $selector . $sub . '{' . $decls . '}';
			}
		}
		return $css;
	};
	$css    = $rules( '' );
	$tablet = $rules( 'Tablet' );
	$mobile = $rules( 'Mobile' );
	$css   .= '' !== $tablet ? '@media (max-width:1024px){' . $tablet . '}' : '';
	$css   .= '' !== $mobile ? '@media (max-width:767px){' . $mobile . '}' : '';
	wp_enqueue_style( $handle );
	if ( '' !== $css ) {
		$h::add_custom_style( $handle, $selector, $css, array() );
	}

	$first   = trim( (string) $places[0]['address'] );
	$heading = isset( $places[0]['title'] ) && is_scalar( $places[0]['title'] ) && '' !== trim( (string) $places[0]['title'] ) ? (string) $places[0]['title'] : $first;
	/* translators: %s: the name or address of the place on the map. */
	$frame_title = sprintf( __( 'Map: %s', 'shapeblock' ), $heading );
	if ( $lazy ) {
		$load = '' !== trim( $get( 'loadLabel' ) ) ? $get( 'loadLabel' ) : __( 'Show the Map', 'shapeblock' );
		$map  = '<div class="shapeblock-gm__consent"><p>' . esc_html__( 'The map is loaded from Google Maps, which receives your IP address when it loads.', 'shapeblock' ) . '</p>'
			. '<button type="button" class="shapeblock-gm__load">' . esc_html( $load ) . '</button></div>';
	} else {
		$map = '<iframe class="shapeblock-gm__frame" src="' . esc_url( $embed( $first ) ) . '" title="' . esc_attr( $frame_title ) . '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
	}
	$map = '<div class="shapeblock-gm__map" data-src="' . esc_url( $embed( $first ) ) . '" data-title="' . esc_attr( $frame_title ) . '">' . $map . '</div>';

	$items = '';
	if ( 'none' !== $list ) {
		$several = count( $places ) > 1;
		foreach ( $places as $n => $place ) {
			$field   = function ( $key ) use ( $place ) {
				return isset( $place[ $key ] ) && is_scalar( $place[ $key ] ) ? trim( (string) $place[ $key ] ) : '';
			};
			$address = $field( 'address' );
			$name    = '' !== $field( 'title' ) ? $field( 'title' ) : $address;
			/* translators: %s: the name or address of the place on the map. */
			$title_n = sprintf( __( 'Map: %s', 'shapeblock' ), $name );
			$name    = $several
				? '<button type="button" class="shapeblock-gm__pick" data-src="' . esc_url( $embed( $address ) ) . '" data-title="' . esc_attr( $title_n ) . '" aria-pressed="' . ( 0 === $n ? 'true' : 'false' ) . '">' . esc_html( $name ) . '</button>'
				: esc_html( $name );
			$phone   = $field( 'phone' );
			$dial    = preg_replace( '/[^0-9+]/', '', $phone );
			$items  .= '<li class="shapeblock-gm__item' . ( $several && 0 === $n ? ' is-active' : '' ) . '">'
				. '<' . $tag . ' class="shapeblock-gm__title">' . $name . '</' . $tag . '>'
				. '<p class="shapeblock-gm__text shapeblock-gm__address">' . esc_html( $address ) . '</p>'
				. ( '' !== $field( 'details' ) ? '<p class="shapeblock-gm__text shapeblock-gm__details">' . esc_html( $field( 'details' ) ) . '</p>' : '' )
				. ( '' !== $dial ? '<p class="shapeblock-gm__text"><a class="shapeblock-gm__link" href="' . esc_url( 'tel:' . $dial ) . '">' . esc_html( $phone ) . '</a></p>' : '' )
				. ( $route ? '<p class="shapeblock-gm__text"><a class="shapeblock-gm__link shapeblock-gm__route" href="' . esc_url( 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode( $address ) ) . '" target="_blank" rel="noopener">' . esc_html( $label ) . '<span aria-hidden="true"> &rarr;</span></a></p>' : '' )
				. '</li>';
		}
		$items = '<ul class="shapeblock-gm__list" role="list">' . $items . '</ul>';
	}

	$wrapper = get_block_wrapper_attributes(
		array(
			'class'     => 'shapeblock-block shapeblock-gm ' . $unique_id,
			'data-list' => $list,
			'data-look' => $look,
			'data-hover' => ! empty( $attributes['colorOnHover'] ) && 'standard' !== $look ? '1' : '0',
		)
	);
	$allowed = array(
		'div'    => array( 'class' => true, 'data-src' => true, 'data-title' => true ),
		'iframe' => array( 'class' => true, 'src' => true, 'title' => true, 'loading' => true, 'referrerpolicy' => true, 'allowfullscreen' => true ),
		'p'      => array( 'class' => true ),
		'button' => array( 'type' => true, 'class' => true, 'data-src' => true, 'data-title' => true, 'aria-pressed' => true ),
		'ul'     => array( 'class' => true, 'role' => true ),
		'li'     => array( 'class' => true ),
		'a'      => array( 'class' => true, 'href' => true, 'target' => true, 'rel' => true ),
		'span'   => array( 'aria-hidden' => true ),
	);
	$allowed[ $tag ] = isset( $allowed[ $tag ] ) ? $allowed[ $tag ] : array( 'class' => true );
	$protocols = array_merge( wp_allowed_protocols(), array( 'tel' ) );
	?>
<div <?php echo wp_kses_post( $wrapper ); ?>><div class="shapeblock-gm__inner"><?php echo wp_kses( $map . $items, $allowed, $protocols ); ?></div></div>
	<?php
} )( $attributes );
