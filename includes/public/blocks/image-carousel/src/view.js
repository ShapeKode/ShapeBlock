/**
 * Image Carousel block — front-end behaviour.
 *
 * Every option is read from the container's data attribute, which render.php
 * writes, so no inline script is printed per instance. Swiper itself is the
 * plugin-wide `swiper` handle this script depends on.
 */
(function () {
	'use strict';

	function readOptions(el) {
		try {
			return JSON.parse(el.dataset.shapeblockImageCarousel || '{}');
		} catch (e) {
			return {};
		}
	}

	function init(el) {
		if (el.dataset.shapeblockImageCarouselReady === '1') {
			return;
		}
		if (typeof window.Swiper === 'undefined') {
			return;
		}

		const opts = readOptions(el);
		// The arrows sit outside the Swiper container so they can be positioned
		// against the block, not clipped by the slides' overflow.
		const wrap = el.closest('.shapeblock-image-carousel-block-wrap') || el.parentNode;

		const config = {
			slidesPerView: opts.slidesPerView || 1,
			spaceBetween: typeof opts.spaceBetween === 'number' ? opts.spaceBetween : 20,
			speed: typeof opts.speed === 'number' ? opts.speed : 600,
			loop: !!opts.loop,
			centeredSlides: !!opts.centeredSlides,
			watchSlidesProgress: true,
			breakpoints: opts.breakpoints || undefined,
			a11y: { enabled: true },
		};

		if (opts.autoplay) {
			config.autoplay = opts.autoplay;
		}

		// Continuous scroll only reads as continuous when the track wraps around,
		// so looping is part of the mode rather than a separate choice.
		if (opts.marquee) {
			config.loop = true;
			config.allowTouchMove = false;
		}

		if (opts.dots) {
			const pagination = el.querySelector('.swiper-pagination');
			if (pagination) {
				config.pagination = { el: pagination, clickable: true };
			}
		}

		if (opts.arrows && wrap) {
			const next = wrap.querySelector('.shapeblock-image-carousel-next');
			const prev = wrap.querySelector('.shapeblock-image-carousel-prev');
			if (next && prev) {
				config.navigation = { nextEl: next, prevEl: prev };
			}
		}

		// A loop needs more slides than are on screen at once; without this
		// Swiper warns and disables looping.
		if (config.loop) {
			const count = el.querySelectorAll('.swiper-slide').length;
			const perView = Number(config.slidesPerView) || 1;
			if (count <= perView) {
				config.loop = false;
			}
		}

		el.dataset.shapeblockImageCarouselReady = '1';
		new window.Swiper(el, config);
	}

	function initAll() {
		document.querySelectorAll('.shapeblock-image-carousel[data-shapeblock-image-carousel]').forEach(init);
	}

	function start() {
		initAll();

		// The editor re-renders the block through ServerSideRender, so newly
		// inserted markup is picked up as it appears. The callback is coalesced
		// to one run per frame — an editor session fires a great many mutations,
		// and scanning the document on each one would be wasteful.
		// Observe <html>, not <body>: the editor canvas replaces its body while
		// loading, which silently detaches an observer bound to the old one.
		const root = document.documentElement || document.body;
		if (typeof MutationObserver === 'undefined' || !root) {
			return;
		}

		let queued = false;
		const observer = new MutationObserver(function () {
			if (queued) {
				return;
			}
			queued = true;
			window.requestAnimationFrame(function () {
				queued = false;
				initAll();
			});
		});
		observer.observe(root, { childList: true, subtree: true });
	}

	// In the editor this file is loaded into the canvas iframe, where it can run
	// before <body> exists — so always wait for the document to be ready.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
