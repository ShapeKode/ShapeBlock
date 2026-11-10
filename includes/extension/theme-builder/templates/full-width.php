<?php
/**
 * "ShapeBlock Full Width" page template: site header, the page content at
 * full width, site footer. See \ShapeBlock\Extension\ThemeBuilder\Page_Template.
 *
 * Many classic themes wrap everything between header and footer in a boxed
 * container (Astra's .ast-container, for one), so the content breaks out of
 * it to the full width of the window.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<style id="shapeblock-full-width-css">
	html, body { overflow-x: clip; }
	main.shapeblock-full-width { position: relative; width: 100vw; max-width: 100vw; margin: 0 calc(50% - 50vw); padding: 0; flex: 0 0 100vw; }
	main.shapeblock-full-width > * { margin-block-start: 0; }
</style>
<main id="shapeblock-content" class="shapeblock-full-width">
	<?php
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	?>
</main>
<?php
get_footer();
