<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
return ( function ( $attributes, $content, $block ) {

/**
 * Server-side render for the Business Hours block.
 *
 * Today's row and the Open now / Closed now badge are worked out here from the
 * site's own time (Settings > General > Timezone), so the first paint is right
 * without any script. view.js repeats the same check in the browser every
 * minute, so a cached page stays right too.
 */

$H = '\ShapeBlock\Frontend\Helper';

$unique_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( (string) $attributes['blockId'] ) : '';
if ( '' === $unique_id ) {
	$unique_id = 'shapeblock-business-hours-' . substr( md5( wp_json_encode( $attributes ) ), 0, 6 );
}

$str = function ( $key, $fallback = '' ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : $fallback;
};
$pick = function ( $key, $allowed, $fallback ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && in_array( $attributes[ $key ], $allowed, true ) ? $attributes[ $key ] : $fallback;
};

$items       = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();
$layout      = $pick( 'layout', array( 'row', 'stacked' ), 'row' );
$leader      = $pick( 'leader', array( 'none', 'dotted', 'dashed', 'solid' ), 'none' );
$text_align  = $pick( 'textAlign', array( 'left', 'center', 'right' ), 'left' );
$title_tag   = $pick( 'titleTag', array( 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ), 'h3' );
$format_24   = '24' === $str( 'timeFormat', '12' );
$separator   = $str( 'timeSeparator', ' – ' );
$closed_text = $str( 'closedLabel', __( 'Closed', 'shapeblock' ) );
$allday_text = $str( 'allDayLabel', __( 'Open 24 hours', 'shapeblock' ) );
$today_label = $str( 'todayLabel', __( 'Today', 'shapeblock' ) );
$show_title  = ! ( isset( $attributes['showTitle'] ) && false === $attributes['showTitle'] );
$show_status = ! ( isset( $attributes['showStatus'] ) && false === $attributes['showStatus'] );
$hl_today    = ! ( isset( $attributes['highlightToday'] ) && false === $attributes['highlightToday'] );
$status_pos  = $pick( 'statusPosition', array( 'below', 'inline' ), 'below' );
$status_dot  = ! ( isset( $attributes['statusDot'] ) && false === $attributes['statusDot'] );
$divider     = ! ( isset( $attributes['divider'] ) && false === $attributes['divider'] );

// "09:30" -> minutes since midnight, or null.
$minutes = function ( $time ) {
	if ( ! is_string( $time ) || ! preg_match( '/^([01]?\d|2[0-3]):([0-5]\d)$/', trim( $time ), $m ) ) {
		return null;
	}
	return (int) $m[1] * 60 + (int) $m[2];
};
// Minutes -> "9:30 AM" or "09:30".
$format = function ( $mins ) use ( $format_24 ) {
	$h = (int) floor( $mins / 60 ) % 24;
	$m = sprintf( '%02d', $mins % 60 );
	if ( $format_24 ) {
		return sprintf( '%02d', $h ) . ':' . $m;
	}
	/* translators: Morning half of a 12-hour time, as in "9:00 AM". */
	$am = __( 'AM', 'shapeblock' );
	/* translators: Afternoon half of a 12-hour time, as in "6:00 PM". */
	$pm = __( 'PM', 'shapeblock' );
	return ( 0 === $h % 12 ? 12 : $h % 12 ) . ':' . $m . ' ' . ( $h < 12 ? $am : $pm );
};

// Rows, cleaned once: what each one says and when it is open.
$rows = array();
foreach ( $items as $item ) {
	if ( ! is_array( $item ) ) {
		continue;
	}
	$weekday = isset( $item['weekday'] ) && preg_match( '/^[0-6]$/', (string) $item['weekday'] ) ? (int) $item['weekday'] : -1;
	$mode    = isset( $item['mode'] ) && in_array( $item['mode'], array( 'hours', 'closed', 'allday', 'text' ), true ) ? $item['mode'] : 'hours';
	$open    = $minutes( $item['open'] ?? '' );
	$close   = $minutes( $item['close'] ?? '' );
	if ( 'hours' === $mode && ( null === $open || null === $close ) ) {
		$mode = 'text';
	}
	$note = isset( $item['note'] ) && is_string( $item['note'] ) ? $item['note'] : '';
	if ( 'closed' === $mode ) {
		$time = $closed_text;
	} elseif ( 'allday' === $mode ) {
		$time = $allday_text;
	} elseif ( 'text' === $mode ) {
		$time = $note;
	} else {
		$time = $format( $open ) . $separator . $format( $close );
	}
	$rows[] = array(
		'day'     => isset( $item['day'] ) && is_string( $item['day'] ) ? $item['day'] : '',
		'weekday' => $weekday,
		'mode'    => $mode,
		'open'    => $open,
		'close'   => $close,
		'time'    => $time,
	);
}

// The site's time now. Overnight hours (closing after midnight) count for the next morning too.
$now      = current_datetime();
$today    = (int) $now->format( 'w' );
$now_min  = (int) $now->format( 'G' ) * 60 + (int) $now->format( 'i' );
$offset   = (int) round( $now->getOffset() / 60 );
$has_days = false;
$is_open  = false;
foreach ( $rows as $r ) {
	if ( $r['weekday'] < 0 ) {
		continue;
	}
	$has_days = true;
	if ( 'allday' === $r['mode'] && $r['weekday'] === $today ) {
		$is_open = true;
	} elseif ( 'hours' === $r['mode'] ) {
		$overnight = $r['close'] <= $r['open'];
		if ( $r['weekday'] === $today && $now_min >= $r['open'] && ( $overnight || $now_min < $r['close'] ) ) {
			$is_open = true;
		}
		if ( $overnight && $r['weekday'] === ( $today + 6 ) % 7 && $now_min < $r['close'] ) {
			$is_open = true;
		}
	}
}
$show_status = $show_status && $has_days;

$wrap_classes = array(
	'shapeblock-block',
	'shapeblock-business-hours-block-wrap',
	$unique_id,
	'shapeblock-bh',
	'shapeblock-bh--' . $layout,
	'shapeblock-bh--align-' . $text_align,
);
if ( 'none' !== $leader && 'row' === $layout ) {
	$wrap_classes[] = 'shapeblock-bh--leader';
}
if ( $divider ) {
	$wrap_classes[] = 'shapeblock-bh--divider';
}
if ( $hl_today ) {
	$wrap_classes[] = 'shapeblock-bh--today';
}
$wrap_attr = get_block_wrapper_attributes(
	array(
		'class'       => implode( ' ', $wrap_classes ),
		'data-offset' => (string) $offset,
	)
);

// ---------------------------------------------------------------------------
// Inline styles.
// ---------------------------------------------------------------------------
$selector     = '.shapeblock-business-hours-block-wrap.' . $unique_id;
$style_handle = 'shapeblock-business-hours-style';

$typo = function ( $obj ) use ( $H ) {
	$out = array();
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	$map = array( 'fontFamily' => 'font-family', 'fontWeight' => 'font-weight', 'fontStyle' => 'font-style', 'textTransform' => 'text-transform', 'lineHeight' => 'line-height', 'textDecoration' => 'text-decoration' );
	foreach ( $map as $key => $prop ) {
		if ( ! empty( $obj[ $key ] ) ) {
			$out[ $prop ] = $obj[ $key ];
		}
	}
	foreach ( array( 'fontSize' => 'font-size', 'letterSpacing' => 'letter-spacing' ) as $key => $prop ) {
		if ( isset( $obj[ $key ] ) && '' !== $obj[ $key ] ) {
			$out[ $prop ] = $H::ensure_unit( $obj[ $key ] );
		}
	}
	return $out;
};
$dims = function ( $obj, $prefix ) use ( $H ) {
	$out = array();
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return $out;
	}
	if ( 'radius' === $prefix ) {
		$map = array( 'top' => 'border-top-left-radius', 'right' => 'border-top-right-radius', 'bottom' => 'border-bottom-right-radius', 'left' => 'border-bottom-left-radius' );
	} else {
		$map = array( 'top' => $prefix . '-top', 'right' => $prefix . '-right', 'bottom' => $prefix . '-bottom', 'left' => $prefix . '-left' );
	}
	foreach ( $map as $side => $prop ) {
		if ( isset( $obj[ $side ] ) && '' !== $obj[ $side ] ) {
			$out[ $prop ] = $H::ensure_unit( $obj[ $side ] );
		}
	}
	return $out;
};
$bg = function ( $color_key, $gradient_key ) use ( $attributes, $H ) {
	if ( ! empty( $attributes[ $gradient_key ] ) && is_string( $attributes[ $gradient_key ] ) ) {
		return array( 'background' => $attributes[ $gradient_key ] );
	}
	if ( ! empty( $attributes[ $color_key ] ) && is_string( $attributes[ $color_key ] ) ) {
		return array( 'background' => $H::sanitize_css_color( $attributes[ $color_key ], '' ) );
	}
	return array();
};
$color = function ( $key, $prop = 'color' ) use ( $attributes, $H ) {
	return ! empty( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? array( $prop => $H::sanitize_css_color( $attributes[ $key ], '' ) ) : array();
};
$shadow = function ( $obj ) use ( $H ) {
	if ( empty( $obj ) || ! is_array( $obj ) ) {
		return array();
	}
	$c           = (string) ( $obj['c'] ?? '' );
	$transparent = in_array( str_replace( ' ', '', $c ), array( '', 'rgba(0,0,0,0)' ), true );
	if ( 0 === (int) ( $obj['x'] ?? 0 ) && 0 === (int) ( $obj['y'] ?? 0 ) && 0 === (int) ( $obj['b'] ?? 0 ) && 0 === (int) ( $obj['s'] ?? 0 ) && $transparent ) {
		return array();
	}
	return array( 'box-shadow' => $H::box_shadow_to_css( $obj ) );
};
$len = function ( $key, $suffix = '' ) use ( $attributes, $H ) {
	$k = $key . $suffix;
	return isset( $attributes[ $k ] ) && '' !== $attributes[ $k ] && null !== $attributes[ $k ] ? $H::ensure_unit( $attributes[ $k ] ) : '';
};

$css  = '';
$rule = function ( $sub, $decls ) use ( $selector, $H ) {
	$d = $H::get_inline_styles( $decls );
	return '' !== $d ? $selector . $sub . '{' . $d . '}' : '';
};

// Box.
$box = array_merge( $bg( 'boxBg', 'boxBgGradient' ), $dims( $attributes['boxRadius'] ?? array(), 'radius' ), $dims( $attributes['boxPadding'] ?? array(), 'padding' ), $shadow( $attributes['boxShadow'] ?? array() ) );
if ( ! empty( $attributes['boxBorder'] ) ) {
	$box = array_merge( $box, $H::border_to_css_props( $attributes['boxBorder'] ) );
}
$vars = array();
if ( '' !== $len( 'rowGap' ) ) {
	$vars['--sb-bh-row-gap'] = $len( 'rowGap' );
}
if ( '' !== $len( 'columnGap' ) ) {
	$vars['--sb-bh-col-gap'] = $len( 'columnGap' );
}
if ( '' !== $len( 'titleGap' ) ) {
	$vars['--sb-bh-title-gap'] = $len( 'titleGap' );
}
if ( $divider ) {
	$vars['--sb-bh-divider'] = ( '' !== $len( 'dividerWidth' ) ? $len( 'dividerWidth' ) : '1px' ) . ' ' . $H::sanitize_css_border_style( $str( 'dividerStyle', 'solid' ) ) . ' ' . ( '' !== $str( 'dividerColor' ) ? $H::sanitize_css_color( $str( 'dividerColor' ), 'rgba(0,0,0,.1)' ) : 'rgba(0,0,0,.1)' );
}
if ( 'none' !== $leader ) {
	$vars['--sb-bh-leader'] = '2px ' . $leader . ' ' . ( '' !== $str( 'leaderColor' ) ? $H::sanitize_css_color( $str( 'leaderColor' ), 'currentColor' ) : 'currentColor' );
}
$css .= $rule( '', array_merge( $box, $vars ) );

// Title and badge.
$css .= $rule( ' .shapeblock-bh__title', array_merge( $typo( $attributes['titleTypography'] ?? array() ), $color( 'titleColor' ) ) );
$status = array_merge( $typo( $attributes['statusTypography'] ?? array() ), $dims( $attributes['statusPadding'] ?? array(), 'padding' ) );
if ( '' !== $len( 'statusRadius' ) ) {
	$status['border-radius'] = $len( 'statusRadius' );
}
$css .= $rule( ' .shapeblock-bh__status', $status );
$css .= $rule( ' .shapeblock-bh__status.is-open', array_merge( $color( 'statusOpenColor' ), $bg( 'statusOpenBg', 'statusOpenBgGradient' ) ) );
$css .= $rule( ' .shapeblock-bh__status.is-closed', array_merge( $color( 'statusClosedColor' ), $bg( 'statusClosedBg', 'statusClosedBgGradient' ) ) );

// Rows.
$row = array_merge( $bg( 'rowBg', 'rowBgGradient' ), $dims( $attributes['rowPadding'] ?? array(), 'padding' ) );
if ( '' !== $len( 'rowRadius' ) ) {
	$row['border-radius'] = $len( 'rowRadius' );
}
$css .= $rule( ' .shapeblock-bh__row', $row );
$css .= $rule( ' .shapeblock-bh__row:nth-child(even)', $bg( 'rowBgAlt', 'rowBgAltGradient' ) );
$css .= $rule( ' .shapeblock-bh__day', array_merge( $typo( $attributes['dayTypography'] ?? array() ), $color( 'dayColor' ) ) );
$css .= $rule( ' .shapeblock-bh__time', array_merge( $typo( $attributes['timeTypography'] ?? array() ), $color( 'timeColor' ) ) );
$css .= $rule( ' .shapeblock-bh__row.is-closed .shapeblock-bh__time', $color( 'closedColor' ) );
$css .= $rule( ' .shapeblock-bh__note', array_merge( $typo( $attributes['noteTypography'] ?? array() ), $color( 'noteColor' ) ) );

// Today.
if ( $hl_today ) {
	$css .= $rule( ' .shapeblock-bh__row.is-today', $bg( 'todayBg', 'todayBgGradient' ) );
	$css .= $rule( ' .shapeblock-bh__row.is-today .shapeblock-bh__day', $color( 'todayColor' ) );
	$css .= $rule( ' .shapeblock-bh__row.is-today .shapeblock-bh__time', $color( 'todayTimeColor' ) );
	$css .= $rule( ' .shapeblock-bh__today', array_merge( $color( 'todayBadgeColor' ), $bg( 'todayBadgeBg', 'todayBadgeBgGradient' ) ) );
}

// Tablet and mobile, after the desktop rules so they win at their widths.
foreach ( array( 'Tablet' => '1024px', 'Mobile' => '767px' ) as $suffix => $width ) {
	$r = '';
	$v = array();
	foreach ( array( 'rowGap' => '--sb-bh-row-gap', 'columnGap' => '--sb-bh-col-gap', 'titleGap' => '--sb-bh-title-gap' ) as $key => $var ) {
		if ( '' !== $len( $key, $suffix ) ) {
			$v[ $var ] = $len( $key, $suffix );
		}
	}
	$r .= $rule( '', array_merge( $dims( $attributes[ 'boxPadding' . $suffix ] ?? array(), 'padding' ), $v ) );
	$r .= $rule( ' .shapeblock-bh__title', $typo( $attributes[ 'titleTypography' . $suffix ] ?? array() ) );
	$r .= $rule( ' .shapeblock-bh__status', array_merge( $typo( $attributes[ 'statusTypography' . $suffix ] ?? array() ), $dims( $attributes[ 'statusPadding' . $suffix ] ?? array(), 'padding' ) ) );
	$r .= $rule( ' .shapeblock-bh__row', $dims( $attributes[ 'rowPadding' . $suffix ] ?? array(), 'padding' ) );
	$r .= $rule( ' .shapeblock-bh__day', $typo( $attributes[ 'dayTypography' . $suffix ] ?? array() ) );
	$r .= $rule( ' .shapeblock-bh__time', $typo( $attributes[ 'timeTypography' . $suffix ] ?? array() ) );
	$r .= $rule( ' .shapeblock-bh__note', $typo( $attributes[ 'noteTypography' . $suffix ] ?? array() ) );
	if ( '' !== $r ) {
		$css .= '@media (max-width:' . $width . '){' . $r . '}';
	}
}

wp_enqueue_style( $style_handle );
$H::add_custom_style( $style_handle, $selector, $css, array() );

// ---------------------------------------------------------------------------
// Markup.
// ---------------------------------------------------------------------------
$status_html = '';
if ( $show_status ) {
	$open_text   = $str( 'statusOpenText', __( 'Open now', 'shapeblock' ) );
	$closed_now  = $str( 'statusClosedText', __( 'Closed now', 'shapeblock' ) );
	$status_html = '<span class="shapeblock-bh__status ' . ( $is_open ? 'is-open' : 'is-closed' ) . '" data-open="' . esc_attr( $open_text ) . '" data-closed="' . esc_attr( $closed_now ) . '" role="status">'
		. ( $status_dot ? '<span class="shapeblock-bh__dot" aria-hidden="true"></span>' : '' )
		. '<span class="shapeblock-bh__status-text">' . esc_html( $is_open ? $open_text : $closed_now ) . '</span></span>';
}
$title = $str( 'title', '' );
$allowed_inline = $H::inline_allowed_html();
?>
<div <?php echo wp_kses_post( $wrap_attr ); ?>>
	<?php if ( ( $show_title && '' !== trim( $title ) ) || '' !== $status_html ) : ?>
	<div class="shapeblock-bh__head shapeblock-bh__head--<?php echo esc_attr( $status_pos ); ?>">
		<?php if ( $show_title && '' !== trim( $title ) ) : ?>
			<?php printf( '<%1$s class="shapeblock-bh__title">%2$s</%1$s>', tag_escape( $title_tag ), wp_kses( $title, $allowed_inline ) ); ?>
		<?php endif; ?>
		<?php echo wp_kses_post( $status_html ); ?>
	</div>
	<?php endif; ?>
	<?php if ( empty( $rows ) ) : ?>
		<p class="shapeblock-bh__empty"><?php esc_html_e( 'Add a day in the block settings.', 'shapeblock' ); ?></p>
	<?php else : ?>
	<ul class="shapeblock-bh__list">
		<?php
		foreach ( $rows as $r ) :
			$classes = 'shapeblock-bh__row is-' . $r['mode'];
			if ( 'closed' === $r['mode'] ) {
				$classes .= ' is-closed';
			}
			if ( $hl_today && $r['weekday'] === $today ) {
				$classes .= ' is-today';
			}
			?>
			<li class="<?php echo esc_attr( $classes ); ?>" data-weekday="<?php echo esc_attr( (string) $r['weekday'] ); ?>" data-mode="<?php echo esc_attr( $r['mode'] ); ?>"<?php echo 'hours' === $r['mode'] ? ' data-open="' . esc_attr( (string) $r['open'] ) . '" data-close="' . esc_attr( (string) $r['close'] ) . '"' : ''; ?>>
				<span class="shapeblock-bh__day"><span class="shapeblock-bh__day-name"><?php echo wp_kses( $r['day'], $allowed_inline ); ?></span><?php if ( $hl_today && '' !== trim( $today_label ) ) : ?><span class="shapeblock-bh__today"><?php echo esc_html( $today_label ); ?></span><?php endif; ?></span>
				<?php if ( 'row' === $layout && 'none' !== $leader ) : ?><span class="shapeblock-bh__leader" aria-hidden="true"></span><?php endif; ?>
				<span class="shapeblock-bh__time"><?php echo wp_kses( $r['time'], $allowed_inline ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php endif; ?>
	<?php $note = $str( 'footerNote', '' ); ?>
	<?php if ( '' !== trim( $note ) ) : ?>
		<p class="shapeblock-bh__note"><?php echo wp_kses( nl2br( $note ), $allowed_inline ); ?></p>
	<?php endif; ?>
</div>
<?php } )( $attributes, $content, $block );
