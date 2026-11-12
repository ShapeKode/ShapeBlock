<?php
/**
 * "ShapeBlock Canvas" page template (classic themes): the page title (unless
 * switched off) and the page content alone, without the theme's header,
 * footer or sidebar. See \ShapeBlock\Extension\ThemeBuilder\Page_Template.
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
<body <?php body_class( 'shapeblock-canvas' ); ?>>
<?php wp_body_open(); ?>
<main id="shapeblock-content" class="shapeblock-full-width">
	<?php
	while ( have_posts() ) {
		the_post();
		if ( ! \ShapeBlock\Extension\ThemeBuilder\Page_Template::title_hidden( get_the_ID() ) ) {
			echo '<div class="shapeblock-page-title-wrap"><h1 class="shapeblock-page-title">' . esc_html( get_the_title() ) . '</h1></div>';
		}
		the_content();
	}
	?>
</main>
<?php wp_footer(); ?>
</body>
</html>
