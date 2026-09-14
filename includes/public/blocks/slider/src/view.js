/**
 * Slider block — front-end behaviour.
 *
 * Every option is read from the container's data attribute, which render.php
 * writes, so no inline script is printed per instance. Swiper itself is the
 * plugin-wide `swiper` handle this script depends on.
 */
(function () {
	'use strict';

	function readOptions(el) {
		try {
			return JSON.parse(el.dataset.shapeblockSlider || '{}');
		} catch (e) {
			return {};
		}
	}

	function init(el) {
		if (el.dataset.shapeblockSliderReady === '1') {
			return;
		}
		if (typeof window.Swiper === 'undefined') {
			return;
		}

		const opts = readOptions(el);
		// The arrows sit outside the Swiper container so they can be positioned
		// against the block, not clipped by the slides' overflow.
		const wrap = el.closest('.shapeblock-slider-block-wrap') || el.parentNode;

		const config = {
			slidesPerView: opts.slidesPerView || 1,
			spaceBetween: typeof opts.spaceBetween === 'number' ? opts.spaceBetween : 24,
			speed: typeof opts.speed === 'number' ? opts.speed : 600,
			loop: !!opts.loop,
			breakpoints: opts.breakpoints || undefined,
			a11y: { enabled: true },
		};

		if (opts.autoplay) {
			config.autoplay = opts.autoplay;
		}

		if (opts.dots) {
			const pagination = el.querySelector('.swiper-pagination');
			if (pagination) {
				config.pagination = { el: pagination, clickable: true };
			}
		}

		if (opts.arrows && wrap) {
			const next = wrap.querySelector('.shapeblock-slider-next');
			const prev = wrap.querySelector('.shapeblock-slider-prev');
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

		el.dataset.shapeblockSliderReady = '1';
		new window.Swiper(el, config);
	}

	function initAll() {
		document.querySelectorAll('.shapeblock-slider[data-shapeblock-slider]').forEach(init);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}

	// The editor re-renders the block through ServerSideRender, so newly
	// inserted markup is picked up as it appears. The callback is coalesced to
	// one run per frame — an editor session fires a great many mutations, and
	// scanning the document on each one would be wasteful.
	if (typeof MutationObserver !== 'undefined') {
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
		observer.observe(document.body, { childList: true, subtree: true });
	}
})();
