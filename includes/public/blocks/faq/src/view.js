/**
 * FAQ Accordion — front-end behaviour.
 *
 * Scoped, dependency-free JS that runs on any front-end page.
 *
 * Whether an answer shows is the stylesheet's job (.shapeblock-faq-item.active).
 * The script sets inline height / padding / overflow / display only while an
 * answer slides open or shut — the animation needs the measured height — and
 * removes them all again when it ends.
 */
(function () {
	'use strict';

	var DURATION = 300;

	// The answer's own top and bottom padding (set in the block) are animated with
	// its height; otherwise they stay while the height runs to 0 and the page jumps
	// by that padding at the end.
	var PROPS = ['height', 'padding-top', 'padding-bottom'];
	function clean(el) {
		PROPS.concat(['overflow', 'transition', 'display']).forEach(function (p) {
			el.style.removeProperty(p);
		});
		// Leave no empty style attribute behind.
		if (!el.getAttribute('style')) {
			el.removeAttribute('style');
		}
	}

	function transition() {
		return PROPS.map(function (p) {
			return p + ' ' + DURATION + 'ms ease';
		}).join(',');
	}

	// Each answer runs one animation at a time: a new one cancels the last.
	function finishLater(el) {
		window.clearTimeout(el.shapeblockFaqTimer);
		el.shapeblockFaqTimer = window.setTimeout(function () {
			clean(el);
		}, DURATION);
	}

	// Called once the item is active, so the stylesheet shows the answer.
	function slideDown(el) {
		clean(el);
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
		el.style.transition = transition();
		el.style.height = height + 'px';
		el.style.paddingTop = padTop;
		el.style.paddingBottom = padBottom;
		finishLater(el);
	}

	// Called while the item is still active (the answer still shows); the inline
	// display keeps it laid out after the item closes, until the animation ends.
	function slideUp(el) {
		clean(el);
		el.style.display = 'block';
		el.style.overflow = 'hidden';
		// The current content height, without padding (the padding animates on its own).
		el.style.height = window.getComputedStyle(el).height;
		void el.offsetHeight;
		el.style.transition = transition();
		el.style.height = '0px';
		el.style.paddingTop = '0px';
		el.style.paddingBottom = '0px';
		finishLater(el);
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
			if (!root.getAttribute('style')) {
				root.removeAttribute('style');
			}
		}, DURATION + 200);
	}

	// Screen readers: the question's button reports whether its answer is open.
	function setExpanded(item, open) {
		var btn = item.querySelector('.shapeblock-faq-toggle');
		if (btn) {
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
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

			var toggle = function () {
				var isActive = item.classList.contains('active');
				pauseScrollAnchoring();

				// Close every other open item.
				items.forEach(function (other) {
					if (other !== item && other.classList.contains('active')) {
						var otherAnswer = other.querySelector('.shapeblock-faq-answer');
						if (otherAnswer) {
							slideUp(otherAnswer);
						}
						other.classList.remove('active');
						setExpanded(other, false);
					}
				});

				// Toggle the clicked item.
				if (isActive) {
					slideUp(answer);
					item.classList.remove('active');
				} else {
					item.classList.add('active');
					slideDown(answer);
				}
				setExpanded(item, !isActive);
			};

			// The whole question row opens and closes the answer; its <button>
			// (Enter and Space click it) is what the keyboard reaches.
			question.addEventListener('click', toggle);
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
