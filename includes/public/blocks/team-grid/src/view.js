/**
 * Team Member — front-end popup and social reveal.
 *
 * Dependency-free JS.
 */
(function () {
	'use strict';

	// The element that opened the popup, so focus can go back to it.
	var opener = null;

	function closeAll() {
		var open = document.querySelectorAll('.shapeblock-popup-modal.active');
		if (!open.length) {
			return;
		}
		open.forEach(function (modal) {
			modal.classList.remove('active');
		});
		document.body.classList.remove('shapeblock-popup-open');
		if (opener && document.contains(opener)) {
			opener.focus();
		}
		opener = null;
	}

	function init() {
		if (document.body.dataset.shapeblockTeamPopup === '1') {
			return;
		}
		document.body.dataset.shapeblockTeamPopup = '1';

		document.addEventListener('click', function (e) {
			var trigger = e.target.closest('.shapeblock-popup-trigger');
			if (trigger) {
				e.preventDefault();
				e.stopPropagation();
				var id = trigger.getAttribute('data-popup-id');
				var modal = id && document.getElementById(id);
				if (modal) {
					opener = trigger;
					modal.classList.add('active');
					document.body.classList.add('shapeblock-popup-open');
					var close = modal.querySelector('.shapeblock-popup-close');
					if (close) {
						close.focus();
					}
				}
				return;
			}

			// The social reveal button shows the icons (as hover does) and moves
			// focus to the first one; they hide again when focus leaves them.
			var reveal = e.target.closest('.shapeblock-team-social-hover button');
			if (reveal) {
				var social = reveal.closest('.shapeblock-team-social');
				social.classList.add('is-open');
				reveal.setAttribute('aria-expanded', 'true');
				var first = social.querySelector('ul a[href]');
				if (first) {
					first.focus();
				}
				return;
			}

			if (e.target.closest('.shapeblock-popup-close') || e.target.classList.contains('shapeblock-popup-modal')) {
				closeAll();
			}
		});

		document.addEventListener('focusout', function (e) {
			var social = e.target.closest && e.target.closest('.shapeblock-team-social.is-open');
			if (social && !social.contains(e.relatedTarget)) {
				social.classList.remove('is-open');
				var reveal = social.querySelector('.shapeblock-team-social-hover button');
				if (reveal) {
					reveal.setAttribute('aria-expanded', 'false');
				}
			}
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' || e.keyCode === 27) {
				closeAll();
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
