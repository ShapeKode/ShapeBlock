<?php
/**
 * Plugin Name: ShapeBlock
 * Plugin URI:  https://profiles.wordpress.org/shapekode22/
 * Description: A library of 30 Gutenberg blocks - sliders, carousels, grids, tabs, counters and more - with full styling and per-device controls.
 * Version:     1.0.0
 * Author:      ShapeKode
 * Author URI:  https://profiles.wordpress.org/shapekode22/
 * Text Domain: shapeblock
 * Domain Path: /languages
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define constants
define( 'SHAPEBLOCK_VERSION', '1.0.0' );
define( 'SHAPEBLOCK_PL_ROOT', __FILE__ );
define( 'SHAPEBLOCK_PL_URL', plugins_url( '/', SHAPEBLOCK_PL_ROOT ) );
define( 'SHAPEBLOCK_PL_PATH', plugin_dir_path( SHAPEBLOCK_PL_ROOT ) );
define( 'SHAPEBLOCK_PLUGIN_BASE', plugin_basename( SHAPEBLOCK_PL_ROOT ) );

// Register the PSR-4 autoloader, then boot the plugin. Every class under the
// ShapeBlock\ namespace is loaded on demand from includes/ — no manual require list.
require_once SHAPEBLOCK_PL_PATH . 'includes/autoload.php';

\ShapeBlock\Main::instance();