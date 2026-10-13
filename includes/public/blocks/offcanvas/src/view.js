/**
 * Offcanvas — front-end behaviour.
 *
 * Scoped, dependency-free JS.
 */
(function () {
	'use strict';

	var ACTIVE = 'shapeblock-active';
	var BODY_ACTIVE = 'shapeblock-offcanvas-active';

	// The overlay(s) that open and close this panel.
	function overlaysFor(panel) {
		if (!panel.id) {
			return [];
		}
		return Array.prototype.filter.call(document.querySelectorAll('.shapeblock-offcanvas-overlay'), function (el) {
			return el.getAttribute('data-target') === '#' + panel.id;
		});
	}

	function setOverlay(panel, on) {
		overlaysFor(panel).forEach(function (el) {
			el.classList.toggle(ACTIVE, on);
		});
		// Screen readers: the opener reports whether its panel is open.
		if (panel.id) {
			Array.prototype.forEach.call(document.querySelectorAll('.shapeblock-offcanvas-wrapper > .shapeblock-offcanvas-toggle'), function (el) {
				if (el.getAttribute('data-target') === '#' + panel.id) {
					el.setAttribute('aria-expanded', on ? 'true' : 'false');
				}
			});
		}
	}

	function closePanel(panel) {
		panel.classList.remove(ACTIVE);
		setOverlay(panel, false);
		if (!document.querySelector('.shapeblock-offcanvas.' + ACTIVE)) {
			document.body.classList.remove(BODY_ACTIVE);
		}
	}

	function openPanel(panel) {
		// Close any other open panels first.
		Array.prototype.forEach.call(document.querySelectorAll('.shapeblock-offcanvas.' + ACTIVE), function (other) {
			if (other !== panel) {
				closePanel(other);
			}
		});
		panel.classList.add(ACTIVE);
		setOverlay(panel, true);
		document.body.classList.add(BODY_ACTIVE);
	}

	function onToggleClick(e) {
		var toggle = e.target.closest('.shapeblock-offcanvas-toggle');
		if (!toggle) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		var target = toggle.getAttribute('data-target');
		var panel = target ? document.querySelector(target) : null;
		if (!panel) {
			return;
		}
		if (panel.classList.contains(ACTIVE)) {
			closePanel(panel);
		} else {
			openPanel(panel);
		}
	}

	function init() {
		document.addEventListener('click', onToggleClick);

		// Click inside the panel shouldn't close it; click on the overlay / outside should.
		document.addEventListener('click', function (e) {
			if (e.target.closest('.shapeblock-offcanvas-toggle')) {
				return;
			}
			var open = document.querySelectorAll('.shapeblock-offcanvas.' + ACTIVE);
			Array.prototype.forEach.call(open, function (panel) {
				// Any click inside the open panel (including its empty area, not just
				// the inner content wrapper) should keep it open. Only clicks on the
				// overlay (handled above) or truly outside the panel close it.
				if (panel.contains(e.target)) {
					return;
				}
				closePanel(panel);
			});
		});

		document.addEventListener('keydown', function (e) {
			// The opener and close buttons are focusable: Enter and Space work them.
			if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && e.target.closest && e.target.closest('.shapeblock-offcanvas-toggle[role="button"]')) {
				onToggleClick(e);
				return;
			}
			if (e.key === 'Escape') {
				Array.prototype.forEach.call(document.querySelectorAll('.shapeblock-offcanvas.' + ACTIVE), closePanel);
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
