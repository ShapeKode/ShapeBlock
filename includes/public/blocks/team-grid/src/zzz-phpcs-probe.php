<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function shapeblock_probe_a( $val ) {
	$allowed = array( 'i' => array( 'class' => true ) );
	$out = wp_kses( '<i class="' . esc_attr( $val ) . '"></i>', $allowed );
	return $out;
}

$probe = shapeblock_probe_a( 'x' );
echo $probe;
