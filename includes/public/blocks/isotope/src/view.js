/**
 * Isotope Filter - front end (and editor preview).
 *
 * Clicking a filter button shows the items of that category and hides the rest.
 * Items that stay move smoothly to their new place, items that leave fade out
 * first and items that arrive fade in (the "FLIP" technique, through the Web
 * Animations API). No library is needed.
 *
 * With "Load More" on, only the first few items of the active filter show; the
 * button reveals the next batch, and choosing another filter starts over.
 *
 * With the search box on, typing narrows the active filter to the items that
 * contain the text; a message shows when none do.
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

	function intAttr(root, name, fallback) {
		var n = parseInt(root.getAttribute(name), 10);
		return isNaN(n) || n < 1 ? fallback : n;
	}

	// How many items of the active filter may show right now (Load More only).
	function currentLimit(root) {
		if ('number' !== typeof root.shapeblockIsoLimit) {
			root.shapeblockIsoLimit = intAttr(root, 'data-initial', 12);
		}
		return root.shapeblockIsoLimit;
	}

	// The button is only there while there is something left to reveal.
	function syncMore(root, enabled, total, limit) {
		var more = root.querySelector('.shapeblock-iso-more');
		if (!more) {
			return;
		}
		if (enabled && total > limit) {
			more.removeAttribute('hidden');
		} else {
			more.setAttribute('hidden', '');
		}
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
		// The search box, when there is one, narrows the filter to the items whose
		// title, description or badge contain what was typed.
		var input = root.querySelector('.shapeblock-iso-search-input');
		var query = input ? input.value.trim().toLowerCase() : '';
		var matching = items.filter(function (item) {
			return ('all' === filter || item.getAttribute('data-cat') === filter) &&
				('' === query || (item.getAttribute('data-search') || '').indexOf(query) !== -1);
		});
		var empty = root.querySelector('.shapeblock-iso-empty');
		if (empty) {
			if (matching.length) {
				empty.setAttribute('hidden', '');
			} else {
				empty.removeAttribute('hidden');
			}
		}
		var loadMore = '1' === root.getAttribute('data-load-more');
		var limit = loadMore ? currentLimit(root) : 0;
		var allowed = loadMore ? matching.slice(0, limit) : matching;
		var wanted = function (item) {
			return allowed.indexOf(item) !== -1;
		};
		syncMore(root, loadMore, matching.length, limit);

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
		root.shapeblockIsoLimit = intAttr(root, 'data-initial', 12);
		apply(root, btn.getAttribute('data-filter') || 'all');
	});

	// Typing in the search box: once the typing pauses, show the matching items
	// of the active filter, from the first batch again.
	document.addEventListener('input', function (event) {
		var input = event.target;
		if (!input.classList || !input.classList.contains('shapeblock-iso-search-input')) {
			return;
		}
		var root = input.closest('.shapeblock-iso');
		if (!root) {
			return;
		}
		clearTimeout(root.shapeblockIsoTyping);
		root.shapeblockIsoTyping = setTimeout(function () {
			root.shapeblockIsoLimit = intAttr(root, 'data-initial', 12);
			apply(root, root.getAttribute('data-active') || 'all');
		}, 150);
	});

	// Enter in the search box must not submit a surrounding form.
	document.addEventListener('keydown', function (event) {
		var input = event.target;
		if ('Enter' === event.key && input.classList && input.classList.contains('shapeblock-iso-search-input')) {
			event.preventDefault();
		}
	});

	// The Load More button: show the next batch of the filter that is active.
	document.addEventListener('click', function (event) {
		var target = event.target;
		var btn = target && target.closest ? target.closest('.shapeblock-iso-load-more') : null;
		if (!btn) {
			return;
		}
		var root = btn.closest('.shapeblock-iso');
		if (!root) {
			return;
		}
		event.preventDefault();
		root.shapeblockIsoLimit = currentLimit(root) + intAttr(root, 'data-step', 12);
		apply(root, root.getAttribute('data-active') || 'all');
	});
})();
