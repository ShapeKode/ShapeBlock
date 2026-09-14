/**
 * Countdown — front-end behaviour.
 *
 * Ported from the Elementor widget script
 * (easy-elements/widgets/countdown/js/countdown.js). Rewritten as scoped,
 * dependency-free JS so it runs on any front-end page and supports multiple
 * countdown instances per page.
 */
(function () {
	'use strict';

	var SECOND = 1000,
		MINUTE = SECOND * 60,
		HOUR = MINUTE * 60,
		DAY = HOUR * 24;

	function initCountdown(cd) {
		if (cd.dataset.shapeblockCntdwnInit === '1') {
			return;
		}
		cd.dataset.shapeblockCntdwnInit = '1';

		var targetDate = new Date(cd.dataset.target).getTime();
		if (isNaN(targetDate)) {
			return;
		}

		var daysEl = cd.querySelector('.shapeblock-cntdwn-days');
		var hoursEl = cd.querySelector('.shapeblock-cntdwn-hours');
		var minutesEl = cd.querySelector('.shapeblock-cntdwn-minutes');
		var secondsEl = cd.querySelector('.shapeblock-cntdwn-seconds');

		if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
			return;
		}

		var intervalId;

		function update() {
			var distance = targetDate - Date.now();

			if (distance <= 0) {
				daysEl.textContent = 0;
				hoursEl.textContent = 0;
				minutesEl.textContent = 0;
				secondsEl.textContent = 0;
				window.clearInterval(intervalId);
				return;
			}

			daysEl.textContent = Math.floor(distance / DAY);
			hoursEl.textContent = Math.floor((distance % DAY) / HOUR);
			minutesEl.textContent = Math.floor((distance % HOUR) / MINUTE);
			secondsEl.textContent = Math.floor((distance % MINUTE) / SECOND);
		}

		update();
		intervalId = window.setInterval(update, 1000);
	}

	function initAll() {
		var nodes = document.querySelectorAll('.shapeblock-countdown-block-wrap .shapeblock-cntdwn[data-target]');
		Array.prototype.forEach.call(nodes, initCountdown);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
