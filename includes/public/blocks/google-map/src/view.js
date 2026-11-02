/**
 * Google Map on the page: picking a place in the list shows it on the map,
 * and with "Load on click" the map is only loaded from Google when the
 * visitor asks for it (or picks a place).
 */
(function () {
	const show = (map, src, title) => {
		let frame = map.querySelector('.shapeblock-gm__frame');
		if (!frame) {
			frame = document.createElement('iframe');
			frame.className = 'shapeblock-gm__frame';
			frame.setAttribute('loading', 'lazy');
			frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
			frame.setAttribute('allowfullscreen', '');
			map.replaceChildren(frame);
		}
		frame.title = title;
		if (frame.getAttribute('src') !== src) {
			frame.src = src;
		}
	};

	const init = (block) => {
		const map = block.querySelector('.shapeblock-gm__map');
		if (!map) {
			return;
		}
		const load = map.querySelector('.shapeblock-gm__load');
		if (load) {
			load.addEventListener('click', () => {
				const active = block.querySelector('.shapeblock-gm__pick[aria-pressed="true"]');
				show(map, active ? active.dataset.src : map.dataset.src, active ? active.dataset.title : map.dataset.title);
				map.querySelector('.shapeblock-gm__frame').focus();
			});
		}
		const picks = block.querySelectorAll('.shapeblock-gm__pick');
		picks.forEach((pick) => {
			pick.addEventListener('click', () => {
				picks.forEach((other) => {
					other.setAttribute('aria-pressed', other === pick ? 'true' : 'false');
					other.closest('.shapeblock-gm__item').classList.toggle('is-active', other === pick);
				});
				show(map, pick.dataset.src, pick.dataset.title);
			});
		});
		// A click anywhere on a place (not on its links) picks it too.
		block.querySelectorAll('.shapeblock-gm__item').forEach((item) => {
			const pick = item.querySelector('.shapeblock-gm__pick');
			if (pick) {
				item.addEventListener('click', (e) => {
					if (!e.target.closest('a, button')) {
						pick.click();
					}
				});
			}
		});
	};

	const start = () => document.querySelectorAll('.shapeblock-gm').forEach(init);
	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
