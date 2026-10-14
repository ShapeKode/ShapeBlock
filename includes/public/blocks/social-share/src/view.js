/**
 * Social Share — front-end behaviour.
 *
 * - A network's share page opens in a small window on a desktop (a new tab
 *   when the window is blocked, and the app or a tab on a phone).
 * - Networks with no share link for websites (Instagram, YouTube, TikTok ...)
 *   open the device's share sheet where there is one, or copy the link.
 * - Copy Link copies the page address.
 *
 * Scoped, dependency-free JS.
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
			} catch {
				/* no-op */
			}
			document.body.removeChild(input);
			resolve();
		});
	}

	// For two seconds: a check in place of the icon, and "Copied!" in place of
	// the name on a button that shows one.
	function showCopied(btn) {
		if (btn.classList.contains('shapeblock-copied')) {
			return;
		}
		var original = btn.innerHTML;
		var icon = btn.querySelector('svg, i');
		var label = btn.querySelector('.shapeblock-social-label');
		if (label) {
			if (icon) {
				icon.outerHTML = CHECK_SVG;
			}
			label.textContent = btn.getAttribute('data-copied') || label.textContent;
		} else {
			btn.innerHTML = CHECK_SVG;
		}
		btn.classList.add('shapeblock-copied');
		window.setTimeout(function () {
			btn.innerHTML = original;
			btn.classList.remove('shapeblock-copied');
		}, 2000);
	}

	function copyLink(btn) {
		copyText(btn.getAttribute('data-url') || window.location.href).then(function () {
			showCopied(btn);
		});
	}

	// A share window only where there is room for one and a mouse to use it.
	var canPopup = function () {
		return window.innerWidth > 767 && !!window.matchMedia && window.matchMedia('(pointer: fine)').matches;
	};

	function openShareWindow(e, btn) {
		if (!canPopup()) {
			return;
		}
		var w = 640;
		var h = 560;
		var left = (window.screenX || 0) + Math.max(0, (window.outerWidth - w) / 2);
		var top = (window.screenY || 0) + Math.max(0, (window.outerHeight - h) / 2);
		var win = window.open(btn.href, 'shapeblock-share', 'width=' + w + ',height=' + h + ',left=' + Math.round(left) + ',top=' + Math.round(top) + ',resizable=yes,scrollbars=yes');
		if (win) {
			// The share page gets no handle back to this one.
			win.opener = null;
			e.preventDefault();
		}
	}

	function shareNative(e, btn) {
		e.preventDefault();
		if (navigator.share) {
			navigator
				.share({
					title: btn.getAttribute('data-title') || document.title,
					url: btn.getAttribute('data-url') || window.location.href,
				})
				.catch(function () {
					/* Closed by the visitor. */
				});
			return;
		}
		copyLink(btn);
	}

	document.addEventListener('click', function (e) {
		var btn = e.target.closest ? e.target.closest('.shapeblock-social-share-block-wrap .shapeblock-social-button') : null;
		// A modified or middle click keeps the browser's own behaviour.
		if (!btn || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
			return;
		}
		if (btn.classList.contains('shapeblock-social-copy')) {
			e.preventDefault();
			copyLink(btn);
		} else if (btn.hasAttribute('data-native')) {
			shareNative(e, btn);
		} else if (btn.hasAttribute('data-popup')) {
			openShareWindow(e, btn);
		}
	});
})();
