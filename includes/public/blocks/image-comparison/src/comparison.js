/**
 * Shared before/after comparison slider logic (dependency-free).
 *
 * Ported from the Elementor widget's jQuery `eel_comparison` plugin
 * (easy-elements/widgets/image-comparison/js/event.move.js), rewritten as
 * vanilla JS so it runs on the front end and inside the editor preview without
 * jQuery / jquery.event.move.
 */
export function initComparison(container) {
	if (!container || container.dataset.shapeblockCmpInit === '1') {
		return;
	}

	const before = container.querySelector('.shapeblock-comparison-before');
	const after = container.querySelector('.shapeblock-comparison-after');
	const handle = container.querySelector('.shapeblock-comparison-handle');
	if (!before || !after || !handle) {
		return;
	}

	container.dataset.shapeblockCmpInit = '1';

	const orientation = container.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal';
	let pct = parseFloat(container.dataset.offset);
	if (isNaN(pct)) {
		pct = 0.5;
	}

	const clamp = (n) => Math.max(0, Math.min(1, n));

	const adjust = (p) => {
		const rect = container.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		const cw = p * w;
		const ch = p * h;

		before.style.clipPath = 'inset(0 0 0 0)';
		after.style.clipPath = 'inset(0 0 0 0)';

		if (orientation === 'vertical') {
			before.style.clipPath = `inset(0 0 ${Math.max(0, h - ch)}px 0)`;
			after.style.clipPath = `inset(${Math.max(0, ch)}px 0 0 0)`;
			handle.style.top = ch + 'px';
			handle.style.left = '50%';
		} else {
			before.style.clipPath = `inset(0 ${Math.max(0, w - cw)}px 0 0)`;
			after.style.clipPath = `inset(0 0 0 ${Math.max(0, cw)}px)`;
			handle.style.left = cw + 'px';
			handle.style.top = '50%';
		}
	};

	const getPct = (clientX, clientY) => {
		const rect = container.getBoundingClientRect();
		const pos = orientation === 'vertical' ? clientY - rect.top : clientX - rect.left;
		const size = orientation === 'vertical' ? rect.height : rect.width;
		return clamp(size ? pos / size : 0.5);
	};

	const coords = (e) => {
		const t = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches && e.changedTouches[0];
		if (t) {
			return { x: t.clientX, y: t.clientY };
		}
		return { x: e.clientX, y: e.clientY };
	};

	const onMove = (e) => {
		if (e.cancelable) {
			e.preventDefault();
		}
		const c = coords(e);
		pct = getPct(c.x, c.y);
		adjust(pct);
	};

	const onUp = () => {
		document.removeEventListener('mousemove', onMove);
		document.removeEventListener('touchmove', onMove);
		document.removeEventListener('mouseup', onUp);
		document.removeEventListener('touchend', onUp);
	};

	const onDown = (e) => {
		e.preventDefault();
		document.addEventListener('mousemove', onMove);
		document.addEventListener('touchmove', onMove, { passive: false });
		document.addEventListener('mouseup', onUp);
		document.addEventListener('touchend', onUp);
	};

	handle.addEventListener('mousedown', onDown);
	handle.addEventListener('touchstart', onDown, { passive: false });

	window.addEventListener('resize', () => adjust(pct));

	// Initial position. Run now and again after images load (so dimensions are known).
	adjust(pct);
	const imgs = container.querySelectorAll('img');
	imgs.forEach((img) => {
		if (!img.complete) {
			img.addEventListener('load', () => adjust(pct), { once: true });
		}
	});
}
