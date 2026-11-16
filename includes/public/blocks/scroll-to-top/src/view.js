/**
 * Scroll Top — front-end behaviour.
 *
 * Scoped, dependency-free JS. Supports Lenis smooth scrolling when present.
 */
(function () {
	'use strict';

	function init() {
		var buttons = document.querySelectorAll('.shapeblock-scroll-top-block-wrap .shapeblock-scroll-top');
		if (!buttons.length) {
			return;
		}

		function check(currentScroll) {
			Array.prototype.forEach.call(buttons, function (btn) {
				var threshold = parseInt(btn.getAttribute('data-show-after'), 10);
				if (isNaN(threshold)) {
					threshold = 150;
				}
				btn.classList.toggle('shapeblock-scroll-visible', currentScroll > threshold);
			});
		}

		if (window.lenis && typeof window.lenis.on === 'function') {
			window.lenis.on('scroll', function (e) {
				check(e.scroll);
			});
		} else {
			window.addEventListener('scroll', function () {
				check(window.pageYOffset || document.documentElement.scrollTop);
			}, { passive: true });
		}

		Array.prototype.forEach.call(buttons, function (btn) {
			var toTop = function (e) {
				e.preventDefault();
				if (window.lenis && typeof window.lenis.scrollTo === 'function') {
					window.lenis.scrollTo(0, {
						duration: 1.2,
						easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
					});
				} else {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}
			};
			// A <button>: Enter and Space click it.
			btn.addEventListener('click', toTop);
		});

		// Set initial state.
		check(window.pageYOffset || document.documentElement.scrollTop);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
