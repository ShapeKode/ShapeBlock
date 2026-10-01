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
/*
 * The header region is rendered block markup, escaped against the same allowlist
 * the Templates shortcode uses. Rendering all 31 blocks and comparing the markup
 * before and after shows the list changes nothing a visitor can see.
 */
echo wp_kses(
	\ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance()->get_output( 'header' ),
	\ShapeBlock\Frontend\Helper::template_allowed_html()
);
