/**
 * Filterable List - front end (and editor preview).
 *
 * A filter button shows the items of that filter; typing in the search box
 * narrows them to those whose title (or search words) contain the text. Both
 * work together, and each button's count follows the search, so it always
 * says how many matching items that filter holds.
 *
 * Handled with delegated listeners, so it needs no setup per block and keeps
 * working when the editor re-renders the block's markup.
 */
(function () {
	'use strict';

	if (window.shapeblockFilterListReady) {
		return;
	}
	window.shapeblockFilterListReady = true;

	function apply(block) {
		var active = block.getAttribute('data-active') || 'all';
		var input = block.querySelector('.shapeblock-fl-search-input');
		var query = input ? input.value.trim().toLowerCase() : '';
		var counts = { all: 0 };
		var shown = 0;

		block.querySelectorAll('.shapeblock-fl-item').forEach(function (item) {
			var ids = (item.getAttribute('data-filters') || '').split(' ').filter(Boolean);
			var found = '' === query || (item.getAttribute('data-search') || '').indexOf(query) !== -1;
			if (found) {
				counts.all++;
				ids.forEach(function (id) {
					counts[id] = (counts[id] || 0) + 1;
				});
			}
			var visible = found && ('all' === active || ids.indexOf(active) !== -1);
			if (visible) {
				item.removeAttribute('hidden');
				shown++;
			} else {
				item.setAttribute('hidden', '');
			}
		});

		block.querySelectorAll('.shapeblock-fl-filter').forEach(function (button) {
			var key = button.getAttribute('data-filter');
			var on = key === active;
			button.classList.toggle('is-active', on);
			button.setAttribute('aria-pressed', on ? 'true' : 'false');
			var count = button.querySelector('.shapeblock-fl-count');
			if (count) {
				count.textContent = String(counts[key] || 0);
			}
		});

		var empty = block.querySelector('.shapeblock-fl-empty');
		if (empty) {
			if (shown) {
				empty.setAttribute('hidden', '');
			} else {
				empty.removeAttribute('hidden');
			}
		}
	}

	document.addEventListener('click', function (e) {
		var button = e.target.closest ? e.target.closest('.shapeblock-fl-filter') : null;
		if (!button) {
			return;
		}
		var block = button.closest('.shapeblock-fl-block-wrap');
		if (!block) {
			return;
		}
		e.preventDefault();
		block.setAttribute('data-active', button.getAttribute('data-filter') || 'all');
		apply(block);
	});

	document.addEventListener('input', function (e) {
		if (!e.target.classList || !e.target.classList.contains('shapeblock-fl-search-input')) {
			return;
		}
		var block = e.target.closest('.shapeblock-fl-block-wrap');
		if (block) {
			apply(block);
		}
	});

	// Enter in the search box must not submit a surrounding form.
	document.addEventListener('keydown', function (e) {
		if ('Enter' === e.key && e.target.classList && e.target.classList.contains('shapeblock-fl-search-input')) {
			e.preventDefault();
		}
	});
})();
