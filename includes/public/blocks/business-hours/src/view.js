/**
 * Business Hours - keeps "today" and the Open now / Closed now badge right in the
 * browser, in the site's time (the offset render.php writes on the block), and
 * checks again every minute. Works for any number of blocks on a page.
 */
(function () {
	'use strict';

	function siteNow(offset) {
		// Shift UTC by the site's offset, then read the parts as UTC.
		var d = new Date(Date.now() + offset * 60000);
		return { day: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
	}

	function update(block) {
		var offset = parseInt(block.getAttribute('data-offset'), 10) || 0;
		var now = siteNow(offset);
		var yesterday = (now.day + 6) % 7;
		var open = false;
		var markToday = block.classList.contains('shapeblock-bh--today');

		Array.prototype.forEach.call(block.querySelectorAll('.shapeblock-bh__row'), function (row) {
			var weekday = parseInt(row.getAttribute('data-weekday'), 10);
			var mode = row.getAttribute('data-mode');
			if (markToday) {
				row.classList.toggle('is-today', weekday === now.day);
			}
			if (isNaN(weekday) || weekday < 0) {
				return;
			}
			if (mode === 'allday' && weekday === now.day) {
				open = true;
			} else if (mode === 'hours') {
				var from = parseInt(row.getAttribute('data-open'), 10);
				var to = parseInt(row.getAttribute('data-close'), 10);
				var overnight = to <= from;
				if (weekday === now.day && now.min >= from && (overnight || now.min < to)) {
					open = true;
				}
				if (overnight && weekday === yesterday && now.min < to) {
					open = true;
				}
			}
		});

		var status = block.querySelector('.shapeblock-bh__status');
		if (status) {
			status.classList.toggle('is-open', open);
			status.classList.toggle('is-closed', !open);
			var text = status.querySelector('.shapeblock-bh__status-text');
			var label = status.getAttribute(open ? 'data-open' : 'data-closed');
			if (text && label !== null && text.textContent !== label) {
				text.textContent = label;
			}
		}
	}

	function init() {
		var blocks = document.querySelectorAll('.shapeblock-bh[data-offset]');
		if (!blocks.length) {
			return;
		}
		var run = function () {
			Array.prototype.forEach.call(blocks, update);
		};
		run();
		setInterval(run, 60000);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
