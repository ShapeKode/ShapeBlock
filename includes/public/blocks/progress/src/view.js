/**
 * Progress Bar — front-end behaviour.
 *
 * Animates the fill from 0 to its target width when scrolled into view.
 * Dependency-free; the bar is also rendered at its target width inline so it
 * stays correct if JavaScript is unavailable.
 */
(function () {
	'use strict';

	function animate(fill) {
		if (fill.dataset.shapeblockPbInit === '1') {
			return;
		}
		fill.dataset.shapeblockPbInit = '1';

		var target = (fill.getAttribute('data-width') || '0') + '%';

		// Reset to 0 WITHOUT animating (disable transition + force reflow), so the
		// bar doesn't visibly shrink from its inline target width first.
		fill.style.transition = 'none';
		fill.style.width = '0%';
		void fill.offsetWidth; // force reflow
		fill.style.transition = '';

		var run = function () {
			// Next frame so the 0% is committed before transitioning to target.
			window.requestAnimationFrame(function () {
				fill.style.width = target;
			});
		};

		if ('IntersectionObserver' in window) {
			var io = new IntersectionObserver(function (entries, obs) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						run();
						obs.unobserve(entry.target);
					}
				});
			}, { threshold: 0.25 });
			io.observe(fill);
		} else {
			run();
		}
	}

	function initAll() {
		var fills = document.querySelectorAll('.shapeblock-progress-bar-block-wrap .shapeblock-progress-fill');
		Array.prototype.forEach.call(fills, animate);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
