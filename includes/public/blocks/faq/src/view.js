/**
 * FAQ Accordion — front-end behaviour.
 *
 * Scoped, dependency-free JS that runs on any front-end page.
 */
(function () {
	'use strict';

	var DURATION = 300;

	// The answer's own top and bottom padding (set in the block) are animated with
	// its height; otherwise they stay while the height runs to 0 and the page jumps
	// by that padding at the end.
	var PROPS = ['height', 'padding-top', 'padding-bottom'];
	function clean(el) {
		PROPS.concat(['overflow', 'transition']).forEach(function (p) {
			el.style.removeProperty(p);
		});
	}

	function slideDown(el) {
		// Set an explicit display so the element is laid out (the base stylesheet
		// has `display:none`); removing the property would keep it hidden and make
		// scrollHeight read 0.
		el.style.display = 'block';
		var cs = window.getComputedStyle(el);
		var padTop = cs.paddingTop;
		var padBottom = cs.paddingBottom;
		// scrollHeight counts the padding; a content-box answer gets it on top of its height.
		var height = el.scrollHeight - ('border-box' === cs.boxSizing ? 0 : parseFloat(padTop) + parseFloat(padBottom));
		el.style.overflow = 'hidden';
		el.style.height = '0px';
		el.style.paddingTop = '0px';
		el.style.paddingBottom = '0px';
		// Force reflow so the transition runs.
		void el.offsetHeight;
		el.style.transition = PROPS.map(function (p) {
			return p + ' ' + DURATION + 'ms ease';
		}).join(',');
		el.style.height = height + 'px';
		el.style.paddingTop = padTop;
		el.style.paddingBottom = padBottom;
		window.setTimeout(function () {
			// Keep display:block so the answer stays visible after the animation.
			clean(el);
		}, DURATION);
	}

	function slideUp(el) {
		el.style.overflow = 'hidden';
		// The current content height, without padding (the padding animates on its own).
		el.style.height = window.getComputedStyle(el).height;
		void el.offsetHeight;
		el.style.transition = PROPS.map(function (p) {
			return p + ' ' + DURATION + 'ms ease';
		}).join(',');
		el.style.height = '0px';
		el.style.paddingTop = '0px';
		el.style.paddingBottom = '0px';
		window.setTimeout(function () {
			el.style.display = 'none';
			clean(el);
		}, DURATION);
	}

	// While answers open and close, the browser's scroll anchoring is paused: it
	// would scroll the page to make up for the changing height, and next to a
	// sticky column that moved the page by hundreds of pixels, or shook it.
	var anchorTimer = 0;
	function pauseScrollAnchoring() {
		var root = document.documentElement;
		root.style.overflowAnchor = 'none';
		window.clearTimeout(anchorTimer);
		anchorTimer = window.setTimeout(function () {
			root.style.removeProperty('overflow-anchor');
		}, DURATION + 200);
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

			var title = item.querySelector('.shapeblock-faq-title');
			var setExpanded = function (el, open) {
				var t = el.querySelector('.shapeblock-faq-title');
				if (t) {
					t.setAttribute('aria-expanded', open ? 'true' : 'false');
				}
			};

			// Initial state.
			answer.style.display = item.classList.contains('active') ? 'block' : 'none';

			var toggle = function () {
				var isActive = item.classList.contains('active');
				pauseScrollAnchoring();

				// Close every other open item.
				items.forEach(function (other) {
					if (other !== item && other.classList.contains('active')) {
						other.classList.remove('active');
						setExpanded(other, false);
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
				setExpanded(item, !isActive);
			};

			question.addEventListener('click', toggle);

			// The question is focusable: Enter and Space open and close it too.
			if (title) {
				title.addEventListener('keydown', function (e) {
					if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
						e.preventDefault();
						toggle();
					}
				});
			}
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
