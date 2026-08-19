<?php
/**
 * Plugin Name: Easy Elements For Gutenberg
 * Plugin URI:  https://wpEELFG.com/
 * Description: Provides a set of custom Guttenberg blocks, shortcodes, and enhancements.
 * Version:     1.0.0
 * Author:      Themewant
 * Author URI:  https://wpeasyelements.com
 * Text Domain: easy-elements-for-gutenberg
 * Domain Path: /languages
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


// Define constants
define( 'EELFG_VERSION', '1.0.0' );
define( 'EELFG_PL_ROOT', __FILE__ );
define( 'EELFG_PL_URL', plugins_url( '/', EELFG_PL_ROOT ) );
define( 'EELFG_PL_PATH', plugin_dir_path( EELFG_PL_ROOT ) );
define( 'EELFG_DIR_URL', plugin_dir_url( EELFG_PL_ROOT ) );
define( 'EELFG_PLUGIN_BASE', plugin_basename( EELFG_PL_ROOT ) );

if ( ! defined( 'EELFG_EXTENSION_BADGE' ) ) {
	define( 'EELFG_EXTENSION_BADGE', '<span class="easy-extension-badge"></span>' );
}

// Register the PSR-4 autoloader, then boot the plugin. Every class under the
// EELFG\ namespace is loaded on demand from includes/ — no manual require list.
require_once EELFG_PL_PATH . 'includes/autoload.php';

\EELFG\Main::instance();