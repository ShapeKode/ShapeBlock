<?php
/**
 * Theme Builder — replacement header wrapper.
 *
 * Required from \ShapeBlock\Extension\ThemeBuilder\Builder_Render::maybe_override_header(). Emits a complete
 * document head + opening body, then the matched builder header. wp_head() runs
 * here once (visibly); the theme's own header.php is loaded into a discarded
 * buffer afterwards, so its wp_head() call prints nothing.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php
echo \ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance()->get_output( 'header' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Content is sanitised/escaped in render_post().
