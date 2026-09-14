/**
 * FAQ Accordion — front-end behaviour.
 *
 * Behaviour ported from the Elementor widget script
 * (easy-elements/widgets/faq/js/faq.js). Rewritten as scoped, dependency-free
 * JS so it runs on any front-end page (the Elementor version hooked into
 * `elementor/frontend/init` and used jQuery slideUp/slideDown).
 */
(function () {
	'use strict';

	var DURATION = 300;

	function slideDown(el) {
		// Set an explicit display so the element is laid out (the base stylesheet
		// has `display:none`); removing the property would keep it hidden and make
		// scrollHeight read 0.
		el.style.display = 'block';
		var height = el.scrollHeight;
		el.style.overflow = 'hidden';
		el.style.height = '0px';
		// Force reflow so the transition runs.
		void el.offsetHeight;
		el.style.transition = 'height ' + DURATION + 'ms ease';
		el.style.height = height + 'px';
		window.setTimeout(function () {
			el.style.removeProperty('height');
			el.style.removeProperty('overflow');
			el.style.removeProperty('transition');
			// Keep display:block so the answer stays visible after the animation.
		}, DURATION);
	}

	function slideUp(el) {
		el.style.overflow = 'hidden';
		el.style.height = el.scrollHeight + 'px';
		void el.offsetHeight;
		el.style.transition = 'height ' + DURATION + 'ms ease';
		el.style.height = '0px';
		window.setTimeout(function () {
			el.style.display = 'none';
			el.style.removeProperty('height');
			el.style.removeProperty('overflow');
			el.style.removeProperty('transition');
		}, DURATION);
	}

	function initAccordion(wrap) {
		if (wrap.dataset.shapeblockFaqInit === '1') {
			return;
		}
		wrap.dataset.shapeblockFaqInit = '1';

		var accordion = wrap.querySelector('.shapeblock-faq-accordion');
		if (!accordion) {
			return;
		}

		// In "open all" mode every answer stays visible (handled by CSS); no toggling.
		if (accordion.classList.contains('shapeblock-faq-open-all')) {
			return;
		}

		var items = Array.prototype.slice.call(accordion.querySelectorAll('.shapeblock-faq-item'));

		items.forEach(function (item) {
			var question = item.querySelector('.shapeblock-faq-question');
			var answer = item.querySelector('.shapeblock-faq-answer');

			if (!question || !answer) {
				return;
			}

			// Initial state.
			answer.style.display = item.classList.contains('active') ? 'block' : 'none';

			question.addEventListener('click', function () {
				var isActive = item.classList.contains('active');

				// Close every other open item.
				items.forEach(function (other) {
					if (other !== item && other.classList.contains('active')) {
						other.classList.remove('active');
						var otherAnswer = other.querySelector('.shapeblock-faq-answer');
						if (otherAnswer) {
							slideUp(otherAnswer);
						}
					}
				});

				// Toggle the clicked item.
				if (isActive) {
					item.classList.remove('active');
					slideUp(answer);
				} else {
					item.classList.add('active');
					slideDown(answer);
				}
			});
		});
	}

	function checkSticky() {
		var hasSticky = !!document.querySelector('.shapeblock-faq-sticky');
		document.body.classList.toggle('sticky-enabled-overlap-faq', hasSticky);
	}

	function initAll() {
		var wraps = document.querySelectorAll('.shapeblock-faq-block-wrap');
		Array.prototype.forEach.call(wraps, initAccordion);
		checkSticky();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
