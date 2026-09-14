/**
 * Tabs — front-end behaviour.
 *
 * Switching is done by toggling the `.active` class only; the stylesheet is the single source of
 * truth for show/hide + the opacity fade ( .shapeblock-tab-content / .shapeblock-tab-content.active ). The
 * previous setTimeout-based slide left multiple panels visible when tabs were clicked quickly
 * ( each click queued its own 300ms "hide" timer ), so switching is intentionally instant here.
 */
(function () {
	'use strict';

	function activate(tabs, contents, tab) {
		var targetId = tab.getAttribute('data-tab');
		tabs.forEach(function (t) {
			t.classList.toggle('active', t === tab);
		});
		contents.forEach(function (c) {
			c.classList.toggle('active', c.id === targetId);
			// Clear any stale inline styles so the stylesheet controls display / opacity.
			c.style.removeProperty('display');
			c.style.removeProperty('opacity');
			c.style.removeProperty('transform');
			c.style.removeProperty('transition');
		});
	}

	function initTabs(wrap) {
		if (wrap.dataset.shapeblockTabInit === '1') {
			return;
		}
		wrap.dataset.shapeblockTabInit = '1';

		var wrapper = wrap.querySelector('.shapeblock-tabs-wrapper');
		if (!wrapper) {
			return;
		}

		var tabs = Array.prototype.slice.call(wrapper.querySelectorAll('.shapeblock-tab-titles li'));
		var contents = Array.prototype.slice.call(wrapper.querySelectorAll('.shapeblock-tab-content'));

		if (!tabs.length || !contents.length) {
			return;
		}

		tabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				var targetId = this.getAttribute('data-tab');
				if (!wrapper.querySelector('#' + targetId)) {
					return;
				}
				activate(tabs, contents, this);
			});
		});

		// Initial state: honour the server-rendered active item, else the first.
		var activeIndex = tabs.findIndex(function (t) {
			return t.classList.contains('active');
		});
		if (activeIndex < 0) {
			activeIndex = 0;
		}
		activate(tabs, contents, tabs[activeIndex]);
	}

	function initAll() {
		var wraps = document.querySelectorAll('.shapeblock-tab-block-wrap');
		Array.prototype.forEach.call(wraps, initTabs);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
