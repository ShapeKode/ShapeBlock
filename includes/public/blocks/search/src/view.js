/**
 * Search — front-end behaviour (popup lightbox).
 *
 * Ported from the Elementor widget's jQuery script
 * (easy-elements/widgets/search/js/search.js). Rewritten as scoped,
 * dependency-free JS.
 */
(function () {
	'use strict';

	function init() {
		var wraps = document.querySelectorAll('.shapeblock-search-block-wrap');

		Array.prototype.forEach.call(wraps, function (wrap) {
			if (wrap.dataset.shapeblockSearchInit === '1') {
				return;
			}
			wrap.dataset.shapeblockSearchInit = '1';

			var box = wrap.querySelector('.shapeblock-search-lightbox');
			if (!box) {
				return;
			}
			var openBtn = wrap.querySelector('.shapeblock-search-open-btn');
			var closers = wrap.querySelectorAll('.shapeblock-search-close-btn, .shapeblock-search-overlay');
			var field = box.querySelector('.shapeblock-search-field');

			if (openBtn) {
				openBtn.addEventListener('click', function (e) {
					e.preventDefault();
					e.stopPropagation();
					box.classList.add('shapeblock-lightbox');
					if (field) {
						window.setTimeout(function () { field.focus(); }, 400);
					}
				});
			}

			Array.prototype.forEach.call(closers, function (closer) {
				closer.addEventListener('click', function (e) {
					e.preventDefault();
					e.stopPropagation();
					box.classList.remove('shapeblock-lightbox');
				});
			});

			// Clicking inside the content shouldn't close the popup.
			var content = box.querySelector('.shapeblock-search-content');
			if (content) {
				content.addEventListener('click', function (e) {
					e.stopPropagation();
				});
			}

			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape') {
					box.classList.remove('shapeblock-lightbox');
				}
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
