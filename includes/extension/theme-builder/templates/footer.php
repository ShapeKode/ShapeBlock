<?php
/**
 * Theme Builder — replacement footer wrapper.
 *
 * Required from \ShapeBlock\Extension\ThemeBuilder\Builder_Render::maybe_override_footer(). Emits the matched
 * builder footer, then wp_footer() and the closing tags. wp_footer() runs here
 * once (visibly); the theme's own footer.php is loaded into a discarded buffer
 * afterwards, so its wp_footer() call prints nothing.
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo \ShapeBlock\Extension\ThemeBuilder\Builder_Render::instance()->get_output( 'footer' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Content is sanitised/escaped in render_post().
?>
<?php wp_footer(); ?>
</body>
</html>
