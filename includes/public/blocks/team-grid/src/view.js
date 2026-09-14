/**
 * Team Member — front-end popup.
 *
 * Behaviour ported from the Elementor widget script
 * (easy-elements/widgets/team-grid/js/team.js). Rewritten as dependency-free JS
 * (the Elementor version used jQuery + `elementor/frontend/init`).
 */
(function () {
	'use strict';

	function closeAll() {
		document.querySelectorAll('.shapeblock-popup-modal.active').forEach(function (modal) {
			modal.style.display = 'none';
			modal.classList.remove('active');
		});
		document.body.classList.remove('shapeblock-popup-open');
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
					modal.style.display = 'block';
					modal.classList.add('active');
					document.body.classList.add('shapeblock-popup-open');
				}
				return;
			}

			if (e.target.closest('.shapeblock-popup-close') || e.target.classList.contains('shapeblock-popup-modal')) {
				closeAll();
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
