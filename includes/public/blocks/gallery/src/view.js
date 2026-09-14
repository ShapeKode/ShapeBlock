/**
 * Simple Gallery — front-end lightbox.
 *
 * Behaviour ported from the Elementor widget script
 * (easy-elements/widgets/gallery/js/simple-gallery.js). Rewritten as scoped,
 * dependency-free JS so it runs on any front-end page where the block appears
 * (the Elementor version hooked into `elementor/frontend/init`).
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

		function open(index) {
			current = index;
			image.setAttribute('src', links[current].getAttribute('href'));
			lightbox.classList.add('is-open');
		}

		function close() {
			lightbox.classList.remove('is-open');
		}

		function show(index) {
			current = (index + links.length) % links.length;
			image.setAttribute('src', links[current].getAttribute('href'));
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
			if (!lightbox.classList.contains('is-open')) {
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
