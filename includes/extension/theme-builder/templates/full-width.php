<?php
/**
 * "ShapeBlock Full Width" page template (classic themes): site header, the
 * page title (unless switched off), the page content at full width, site
 * footer. See \ShapeBlock\Extension\ThemeBuilder\Page_Template, which also
 * adds this layout's CSS.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
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
<?php
get_footer();
