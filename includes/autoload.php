<?php
/**
 * PSR-4 autoloader for the Easy Elements For Gutenberg plugin.
 *
 * Maps the `EELFG\` namespace to the `includes/` directory. Directories whose
 * names are not valid namespace segments (`public` is a reserved word,
 * `theme-builder` contains a hyphen) are mapped explicitly; everything else
 * follows the namespace -> sub-directory convention.
 *
 * Only class DEFINITIONS are loaded here, on demand. Files that merely define
 * functions or run procedural bootstrap code (e.g. scripts.php, blocks.php,
 * block render templates) are still required explicitly from Main::includes().
 *
 * @package EasyElementsForGutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

spl_autoload_register(
	function ( $class ) {
		// Namespace prefix => base directory (relative to this plugin).
		// Longest prefixes first so the more specific mapping wins.
		static $prefixes = array(
			'EELFG\\Extension\\ThemeBuilder\\' => 'includes/extension/theme-builder/',
			'EELFG\\Extension\\'               => 'includes/extension/',
			'EELFG\\Admin\\'                   => 'includes/admin/',
			'EELFG\\Editor\\'                  => 'includes/editor/',
			'EELFG\\Frontend\\'                => 'includes/public/',
			'EELFG\\'                          => 'includes/',
		);

		foreach ( $prefixes as $prefix => $base_dir ) {
			$len = strlen( $prefix );
			if ( 0 !== strncmp( $prefix, $class, $len ) ) {
				continue;
			}

			$relative = substr( $class, $len );
			$file     = EELFG_PL_PATH . $base_dir . str_replace( '\\', '/', $relative ) . '.php';

			if ( is_readable( $file ) ) {
				require_once $file;
			}
			return;
		}
	}
);
