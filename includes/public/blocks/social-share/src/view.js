/**
 * Social Share — front-end behaviour (copy link).
 *
 * Ported from the inline jQuery in the Elementor "Social Share" widget.
 * Rewritten as scoped, dependency-free JS.
 */
(function () {
	'use strict';

	var CHECK_SVG =
		'<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>';

	function copyText(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			return navigator.clipboard.writeText(text);
		}
		return new Promise(function (resolve) {
			var input = document.createElement('input');
			input.value = text;
			document.body.appendChild(input);
			input.select();
			try {
				document.execCommand('copy');
			} catch (e) {
				/* no-op */
			}
			document.body.removeChild(input);
			resolve();
		});
	}

	function initCopy(btn) {
		if (btn.dataset.shapeblockCopyInit === '1') {
			return;
		}
		btn.dataset.shapeblockCopyInit = '1';

		btn.addEventListener('click', function (e) {
			e.preventDefault();
			var url = btn.getAttribute('data-url') || window.location.href;

			copyText(url).then(function () {
				var original = btn.innerHTML;
				btn.innerHTML = CHECK_SVG;
				btn.classList.add('shapeblock-copied');
				window.setTimeout(function () {
					btn.innerHTML = original;
					btn.classList.remove('shapeblock-copied');
				}, 2000);
			});
		});
	}

	function initAll() {
		var buttons = document.querySelectorAll('.shapeblock-social-share-block-wrap .shapeblock-social-copy');
		Array.prototype.forEach.call(buttons, initCopy);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
