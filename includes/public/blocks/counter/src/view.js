/**
 * Counter — front-end animation (count up + odometer).
 *
 * Behaviour ported from the Elementor widget script
 * (easy-elements/widgets/counter/js/counter.js). Rewritten as scoped,
 * dependency-free JS (the Elementor version used jQuery + frontend hooks).
 */
(function () {
	'use strict';

	var SEPARATORS = { comma: ',', dot: '.', space: ' ', underline: '_' };

	function formatWithSeparator(num, separator) {
		var str = num.toString();
		if (!separator) return str;
		var negative = str.charAt(0) === '-';
		var body = negative ? str.slice(1) : str;
		if (body.length < 4) return str;
		return (negative ? '-' : '') + body.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
	}

	function runCounter(counter, target, start, duration, separator) {
		var startTime = performance.now();
		function tick(time) {
			var progress = Math.min((time - startTime) / duration, 1);
			var current = Math.floor(start + (target - start) * progress);
			counter.textContent = formatWithSeparator(current, separator);
			if (progress < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	function runOdometer(counter, target, duration, separator) {
		var targetInt = Math.floor(Math.abs(target));
		var targetStr = targetInt.toString();
		var negative = target < 0;

		counter.innerHTML = '';
		counter.classList.add('shapeblock-cnt-odometer-wrap');

		if (negative) {
			var s = document.createElement('span');
			s.className = 'shapeblock-cnt-odometer-sep';
			s.textContent = '-';
			counter.appendChild(s);
		}

		var animEls = [];
		var digitIndex = 0;

		for (var i = 0; i < targetStr.length; i++) {
			var posFromRight = targetStr.length - i;
			if (i > 0 && separator && posFromRight % 3 === 0) {
				var sep = document.createElement('span');
				sep.className = 'shapeblock-cnt-odometer-sep';
				sep.textContent = separator;
				counter.appendChild(sep);
			}

			var col = document.createElement('span');
			col.className = 'shapeblock-cnt-odometer-digit';

			var roll = document.createElement('span');
			roll.className = 'shapeblock-cnt-odometer-roll';

			var spins = 2 + digitIndex;
			var html = '';
			for (var sp = 0; sp < spins; sp++) {
				for (var n = 0; n <= 9; n++) {
					html += '<span class="shapeblock-cnt-odometer-num">' + n + '</span>';
				}
			}
			html += '<span class="shapeblock-cnt-odometer-num">' + targetStr.charAt(i) + '</span>';
			roll.innerHTML = html;
			roll.style.transform = 'translateY(0)';

			col.appendChild(roll);
			counter.appendChild(col);
			animEls.push({ roll: roll, spins: spins });
			digitIndex++;
		}

		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				animEls.forEach(function (item) {
					item.roll.style.transition = 'transform ' + duration + 'ms cubic-bezier(.22,.85,.34,1)';
					item.roll.style.transform = 'translateY(-' + (item.spins * 10) + 'em)';
				});
			});
		});
	}

	function init() {
		var counters = document.querySelectorAll('.shapeblock-counter');
		if (!counters.length) return;

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var counter = entry.target;
				observer.unobserve(counter);

				var target = parseInt(counter.dataset.count, 10) || 0;
				var start = parseInt(counter.dataset.start, 10) || 0;
				var duration = parseInt(counter.dataset.duration, 10) || 1000;
				var format = counter.dataset.format || 'default';
				var animation = counter.dataset.animation || 'counter';
				var separator = SEPARATORS[format] || '';

				if (animation === 'odometer') {
					runOdometer(counter, target, duration, separator);
				} else {
					runCounter(counter, target, start, duration, separator);
				}
			});
		}, { threshold: 0.2 });

		counters.forEach(function (c) {
			observer.observe(c);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
