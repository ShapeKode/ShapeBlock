/**
 * Table — front-end behaviour (tooltips).
 *
 * Ported from the Elementor widget script
 * (easy-elements/widgets/table/js/table.js). Rewritten as scoped,
 * dependency-free JS (the original relied on jQuery / Bootstrap tooltips).
 */
(function () {
	'use strict';

	function initAll() {
		var tooltips = document.querySelectorAll('.shapeblock-table-block-wrap .shapeblock-tbl-tooltip');

		Array.prototype.forEach.call(tooltips, function (tip) {
			if (tip.dataset.shapeblockTipInit === '1') {
				return;
			}
			tip.dataset.shapeblockTipInit = '1';

			tip.addEventListener('mouseenter', function () {
				tip.classList.add('show');
			});
			tip.addEventListener('mouseleave', function () {
				tip.classList.remove('show');
			});
			tip.addEventListener('click', function (e) {
				e.stopPropagation();
				tip.classList.toggle('show');
			});
		});

		// Close any open tooltip when clicking elsewhere.
		if (!document.body.dataset.shapeblockTipDocInit) {
			document.body.dataset.shapeblockTipDocInit = '1';
			document.addEventListener('click', function () {
				var open = document.querySelectorAll('.shapeblock-tbl-tooltip.show');
				Array.prototype.forEach.call(open, function (t) {
					t.classList.remove('show');
				});
			});
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
