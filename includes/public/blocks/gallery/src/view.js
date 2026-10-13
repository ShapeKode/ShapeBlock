/**
 * Simple Gallery — front-end lightbox.
 *
 * Scoped, dependency-free JS that runs on any front-end page where the block appears.
 */
(function () {
	'use strict';

	function initGallery(wrap) {
		if (wrap.dataset.shapeblockGalleryInit === '1') {
			return;
		}
		wrap.dataset.shapeblockGalleryInit = '1';

		var grid = wrap.querySelector('.shapeblock-gallery-grid.shapeblock-popup-enabled');
		var lightbox = wrap.querySelector('.shapeblock-lightbox-gallery');

		if (!grid || !lightbox) {
			return;
		}

		var links = Array.prototype.slice.call(grid.querySelectorAll('.shapeblock-popup-link'));
		var image = lightbox.querySelector('.shapeblock-lightbox-image');
		var nextBtn = lightbox.querySelector('.shapeblock-next');
		var prevBtn = lightbox.querySelector('.shapeblock-prev');
		var closeBtn = lightbox.querySelector('.shapeblock-close');

		if (!links.length || !image) {
			return;
		}

		var current = 0;
		var duration = parseInt(lightbox.getAttribute('data-duration'), 10) || 0;
		var closing = null;

		// Show a picture: back to the animation's start, then play it in.
		function present(src) {
			image.classList.remove('is-in');
			image.style.transition = 'none';
			image.setAttribute('src', src);
			void image.offsetWidth;
			image.style.transition = '';
			window.requestAnimationFrame(function () {
				image.classList.add('is-in');
			});
		}

		function open(index) {
			window.clearTimeout(closing);
			current = index;
			lightbox.classList.add('is-open');
			present(links[current].getAttribute('href'));
			window.requestAnimationFrame(function () {
				lightbox.classList.add('is-visible');
			});
		}

		function close() {
			lightbox.classList.remove('is-visible');
			image.classList.remove('is-in');
			closing = window.setTimeout(function () {
				lightbox.classList.remove('is-open');
			}, duration);
		}

		function show(index) {
			current = (index + links.length) % links.length;
			present(links[current].getAttribute('href'));
		}

		links.forEach(function (link, index) {
			link.addEventListener('click', function (e) {
				e.preventDefault();
				open(index);
			});
		});

		if (nextBtn) {
			nextBtn.addEventListener('click', function () {
				show(current + 1);
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener('click', function () {
				show(current - 1);
			});
		}

		if (closeBtn) {
			closeBtn.addEventListener('click', close);
		}

		lightbox.addEventListener('click', function (e) {
			if (e.target === lightbox || e.target === closeBtn) {
				close();
			}
		});

		document.addEventListener('keydown', function (e) {
			if (!lightbox.classList.contains('is-visible')) {
				return;
			}
			if (e.key === 'ArrowRight') {
				show(current + 1);
			} else if (e.key === 'ArrowLeft') {
				show(current - 1);
			} else if (e.key === 'Escape') {
				close();
			}
		});
	}

	function initAll() {
		var wraps = document.querySelectorAll('.shapeblock-gallery-block-wrap');
		Array.prototype.forEach.call(wraps, initGallery);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
