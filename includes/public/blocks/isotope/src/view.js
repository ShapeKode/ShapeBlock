/**
 * Isotope Filter - front end (and editor preview).
 *
 * Clicking a filter button shows the items of that category and hides the rest.
 * Items that stay move smoothly to their new place, items that leave fade out
 * first and items that arrive fade in (the "FLIP" technique, through the Web
 * Animations API). No library is needed.
 *
 * Handled with one delegated click listener, so it needs no setup per block and
 * keeps working when the editor re-renders the block's markup.
 */
(function () {
	'use strict';

	if (window.shapeblockIsotopeReady) {
		return;
	}
	window.shapeblockIsotopeReady = true;

	var EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

	function prefersReducedMotion() {
		return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	}

	function setVisible(item, on) {
		if (on) {
			item.removeAttribute('hidden');
		} else {
			item.setAttribute('hidden', '');
		}
	}

	function enterFrames(type) {
		return 'scale' === type
			? [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'scale(1)' }]
			: [{ opacity: 0 }, { opacity: 1 }];
	}

	function leaveFrames(type) {
		return 'scale' === type
			? [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.92)' }]
			: [{ opacity: 1 }, { opacity: 0 }];
	}

	function apply(root, filter) {
		var grid = root.querySelector('.shapeblock-iso-grid');
		if (!grid) {
			return;
		}

		// A filter clicked while the last one is still animating: finish that one now.
		if (typeof root.shapeblockIsoFinish === 'function') {
			root.shapeblockIsoFinish();
		}

		var items = Array.prototype.filter.call(grid.children, function (el) {
			return el.classList.contains('shapeblock-iso-item');
		});
		var wanted = function (item) {
			return 'all' === filter || item.getAttribute('data-cat') === filter;
		};

		Array.prototype.forEach.call(root.querySelectorAll('.shapeblock-iso-filter'), function (btn) {
			var on = btn.getAttribute('data-filter') === filter;
			btn.classList.toggle('is-active', on);
			btn.setAttribute('aria-pressed', on ? 'true' : 'false');
		});
		root.setAttribute('data-active', filter);

		var type = root.getAttribute('data-anim') || 'scale';
		var duration = parseInt(root.getAttribute('data-duration'), 10);
		if (isNaN(duration)) {
			duration = 400;
		}
		var animate = 'none' !== type && duration > 0 && !prefersReducedMotion() && typeof Element.prototype.animate === 'function';

		if (!animate) {
			items.forEach(function (item) {
				setVisible(item, wanted(item));
			});
			return;
		}

		var first = new Map();
		items.forEach(function (item) {
			if (!item.hidden) {
				first.set(item, item.getBoundingClientRect());
			}
		});

		var leaving = items.filter(function (item) { return !item.hidden && !wanted(item); });
		var entering = items.filter(function (item) { return item.hidden && wanted(item); });
		var staying = items.filter(function (item) { return !item.hidden && wanted(item); });
		var running = [];
		var done = false;

		function finish() {
			if (done) {
				return;
			}
			done = true;
			root.shapeblockIsoFinish = null;
			running.forEach(function (anim) { anim.cancel(); });
			running = [];

			leaving.forEach(function (item) { setVisible(item, false); });
			entering.forEach(function (item) { setVisible(item, true); });

			// Where the staying items ended up, against where they were.
			staying.forEach(function (item) {
				var from = first.get(item);
				var to = item.getBoundingClientRect();
				var dx = from.left - to.left;
				var dy = from.top - to.top;
				if (dx || dy) {
					item.animate(
						[{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'translate(0, 0)' }],
						{ duration: duration, easing: EASE }
					);
				}
			});
			entering.forEach(function (item) {
				item.animate(enterFrames(type), { duration: duration, easing: EASE, fill: 'backwards' });
			});
		}

		root.shapeblockIsoFinish = finish;

		if (!leaving.length) {
			finish();
			return;
		}

		var remaining = leaving.length;
		leaving.forEach(function (item) {
			var anim = item.animate(leaveFrames(type), {
				duration: Math.round(duration * 0.5),
				easing: 'ease',
				fill: 'forwards',
			});
			running.push(anim);
			anim.onfinish = function () {
				remaining -= 1;
				if (0 === remaining) {
					finish();
				}
			};
		});
	}

	document.addEventListener('click', function (event) {
		var target = event.target;
		var btn = target && target.closest ? target.closest('.shapeblock-iso-filter') : null;
		if (!btn) {
			return;
		}
		var root = btn.closest('.shapeblock-iso');
		if (!root) {
			return;
		}
		event.preventDefault();
		apply(root, btn.getAttribute('data-filter') || 'all');
	});
})();
