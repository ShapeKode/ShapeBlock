/**
 * Keep links inside ShapeBlock block previews from navigating in the editor.
 *
 * Most ShapeBlock blocks are previewed with their real front-end markup, so a
 * breadcrumb, a button, a team member or a post card holds working links. A
 * click on one of them in the editor canvas would leave the page being edited;
 * here it only selects the block, the same as core's own blocks.
 *
 * Loaded inside the editor canvas only (see shapeblock_editor_links_script()).
 */
(function () {
	'use strict';

	document.addEventListener(
		'click',
		function (e) {
			var target = e.target;
			if (!target || !target.closest) {
				return;
			}
			var link = target.closest('a[href]');
			if (link && link.closest('[data-type^="shapeblock/"]')) {
				e.preventDefault();
			}
		},
		true
	);
})();
