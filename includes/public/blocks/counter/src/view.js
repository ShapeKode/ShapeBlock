/**
 * Counter — front-end animation (count up + odometer).
 *
 * Scoped, dependency-free JS.
 */
(function () {
	'use strict';

	var SEPARATORS = { comma: ',', dot: '.', space: ' ', underline: '_' };

	// Number of decimal places typed in a value ("99.50" -> 2).
	function decimalsOf(value) {
		var m = String(value || '').match(/\.(\d+)/);
		return m ? m[1].length : 0;
	}

	// Thousands separator on the whole part; the decimal mark is "." (or ","
	// when the thousands separator itself is a dot).
	function formatWithSeparator(num, separator, decimals) {
		decimals = decimals || 0;
		var str = decimals ? num.toFixed(decimals) : Math.floor(num).toString();
		var negative = str.charAt(0) === '-';
		var body = negative ? str.slice(1) : str;
		var parts = body.split('.');
		var whole = parts[0];
		if (separator && whole.length > 3) {
			whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
		}
		var mark = separator === '.' ? ',' : '.';
		return (negative ? '-' : '') + whole + (parts[1] ? mark + parts[1] : '');
	}

	function runCounter(counter, target, start, duration, separator, decimals) {
		var startTime = performance.now();
		function tick(time) {
			var progress = Math.min((time - startTime) / duration, 1);
			var current = start + (target - start) * progress;
			counter.textContent = formatWithSeparator(progress < 1 ? current : target, separator, decimals);
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

				var target = parseFloat(counter.dataset.count) || 0;
				var start = parseFloat(counter.dataset.start) || 0;
				var decimals = decimalsOf(counter.dataset.count);
				var duration = parseInt(counter.dataset.duration, 10) || 1000;
				var format = counter.dataset.format || 'default';
				var animation = counter.dataset.animation || 'counter';
				var separator = SEPARATORS[format] || '';

				// The odometer rolls whole digits, so a number with decimals
				// counts up normally instead.
				if (animation === 'odometer' && !decimals) {
					runOdometer(counter, target, duration, separator);
				} else {
					runCounter(counter, target, start, duration, separator, decimals);
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
