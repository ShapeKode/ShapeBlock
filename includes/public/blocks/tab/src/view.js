/**
 * Tabs — front-end behaviour.
 *
 * Switching is done by toggling the `.active` class only; the stylesheet is the single source of
 * truth for show/hide + the opacity fade ( .shapeblock-tab-content / .shapeblock-tab-content.active ). The
 * previous setTimeout-based slide left multiple panels visible when tabs were clicked quickly
 * ( each click queued its own 300ms "hide" timer ), so switching is intentionally instant here.
 *
 * Each tab is a <button role="tab"> inside its list item: the selected one is the only one in the
 * Tab order (roving tabindex), and the arrow keys, Home and End move between the tabs.
 */
(function () {
	'use strict';

	function buttonOf(tab) {
		return tab.querySelector('.shapeblock-tab-nav-btn');
	}

	function activate(tabs, contents, tab) {
		var targetId = tab.getAttribute('data-tab');
		tabs.forEach(function (t) {
			var on = t === tab;
			var btn = buttonOf(t);
			t.classList.toggle('active', on);
			if (btn) {
				btn.setAttribute('aria-selected', on ? 'true' : 'false');
				btn.setAttribute('tabindex', on ? '0' : '-1');
			}
		});
		contents.forEach(function (c) {
			c.classList.toggle('active', c.id === targetId);
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

		function select(tab) {
			var targetId = tab.getAttribute('data-tab');
			if (!targetId || !wrapper.querySelector('#' + targetId)) {
				return false;
			}
			activate(tabs, contents, tab);
			return true;
		}

		tabs.forEach(function (tab, index) {
			tab.addEventListener('click', function () {
				select(tab);
			});

			var btn = buttonOf(tab);
			if (!btn) {
				return;
			}
			btn.addEventListener('keydown', function (e) {
				var next = -1;
				if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
					next = (index + 1) % tabs.length;
				} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
					next = (index - 1 + tabs.length) % tabs.length;
				} else if (e.key === 'Home') {
					next = 0;
				} else if (e.key === 'End') {
					next = tabs.length - 1;
				}
				if (next < 0) {
					return;
				}
				e.preventDefault();
				if (select(tabs[next]) && buttonOf(tabs[next])) {
					buttonOf(tabs[next]).focus();
				}
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
