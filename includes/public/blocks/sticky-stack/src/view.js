/**
 * Sticky Stack - front end (and editor preview).
 *
 * The stacking itself is plain CSS (`position: sticky`). This script only adds
 * the depth effect: as the next card slides over a card that is stuck, that
 * card shrinks and dims a little. It writes one CSS variable (--ss-d, 0 to 1)
 * per card; the stylesheet decides what that does.
 *
 * One scroll listener serves every block on the page, and only blocks near the
 * viewport are measured. Nothing runs when the visitor prefers reduced motion.
 */
(function () {
	'use strict';

	if (window.shapeblockStickyStackReady) {
		return;
	}
	window.shapeblockStickyStackReady = true;

	var busy = false;

	function prefersReducedMotion() {
		return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	}

	function clamp(n) {
		return Math.max(0, Math.min(1, n));
	}

	function paint(root) {
		var cards = root.querySelectorAll('.shapeblock-ss-card');
		var reduce = prefersReducedMotion();
		var i;
		for (i = 0; i < cards.length; i++) {
			var card = cards[i];
			var next = cards[i + 1];
			var depth = 0;

			// Only a card that is really stuck (stacking is switched off on the
			// devices the author chose) takes part in the effect.
			if (next && !reduce && 'sticky' === window.getComputedStyle(card).position) {
				var rc = card.getBoundingClientRect();
				var rn = next.getBoundingClientRect();
				var topNext = parseFloat(window.getComputedStyle(next).top) || 0;
				depth = clamp(1 - (rn.top - topNext) / (rc.height * 0.9));
			}
			card.style.setProperty('--ss-d', depth.toFixed(3));
		}
	}

	function update() {
		busy = false;
		var roots = document.querySelectorAll('.shapeblock-ss[data-depth="1"]');
		var vh = window.innerHeight || document.documentElement.clientHeight;
		var i;
		for (i = 0; i < roots.length; i++) {
			var r = roots[i].getBoundingClientRect();
			// Skip blocks that are well off screen.
			if (r.bottom < -200 || r.top > vh + 200) {
				continue;
			}
			paint(roots[i]);
		}
	}

	function queue() {
		if (!busy) {
			busy = true;
			window.requestAnimationFrame(update);
		}
	}

	// Capture phase: the block editor scrolls an inner container, not the window.
	document.addEventListener('scroll', queue, { passive: true, capture: true });
	window.addEventListener('resize', queue);
	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', queue);
	} else {
		queue();
	}

	// In the editor the block's markup is replaced whenever a setting changes.
	if (window.MutationObserver && document.body && (document.body.classList.contains('wp-admin') || document.querySelector('.editor-styles-wrapper'))) {
		new window.MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
	}
})();
