/**
 * Table — front-end behaviour (tooltips).
 *
 * Scoped, dependency-free JS.
 */
import { placeTooltip, resetTooltip } from './tooltip-position';

(function () {
	'use strict';

	function show(tip) {
		placeTooltip(tip);
		tip.classList.add('show');
	}

	function hide(tip) {
		tip.classList.remove('show');
		resetTooltip(tip);
	}

	function hideAll() {
		Array.prototype.forEach.call(document.querySelectorAll('.shapeblock-tbl-tooltip.show'), hide);
	}

	function initAll() {
		var tooltips = document.querySelectorAll('.shapeblock-table-block-wrap .shapeblock-tbl-tooltip');

		Array.prototype.forEach.call(tooltips, function (tip) {
			if (tip.dataset.shapeblockTipInit === '1') {
				return;
			}
			tip.dataset.shapeblockTipInit = '1';

			tip.addEventListener('mouseenter', function () {
				show(tip);
			});
			tip.addEventListener('mouseleave', function () {
				hide(tip);
			});
			tip.addEventListener('click', function (e) {
				e.stopPropagation();
				if (tip.classList.contains('show')) {
					hide(tip);
				} else {
					show(tip);
				}
			});
		});

		// Close any open tooltip when clicking elsewhere, or when the page moves
		// under it.
		if (!document.body.dataset.shapeblockTipDocInit) {
			document.body.dataset.shapeblockTipDocInit = '1';
			document.addEventListener('click', hideAll);
			// Capture: a table's own scroll box does not bubble its scrolling.
			document.addEventListener('scroll', hideAll, { capture: true, passive: true });
			window.addEventListener('resize', hideAll);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
