/**
 * Shared before/after comparison slider logic (dependency-free), used by the
 * front end (view.js) and the editor preview (edit.js) alike.
 */
export function initComparison(container) {
	if (!container || container.dataset.shapeblockCmpInit === '1') {
		return;
	}

	const before = container.querySelector('.shapeblock-comparison-before');
	const after = container.querySelector('.shapeblock-comparison-after');
	const beforeLabel = container.querySelector('.shapeblock-comparison-overlay.is-before');
	const afterLabel = container.querySelector('.shapeblock-comparison-overlay.is-after');
	const handle = container.querySelector('.shapeblock-comparison-handle');
	if (!before || !after || !handle) {
		return;
	}

	container.dataset.shapeblockCmpInit = '1';

	const orientation = ['vertical', 'diagonal'].includes(container.dataset.orientation) ? container.dataset.orientation : 'horizontal';
	const divider = container.querySelector('.shapeblock-comparison-divider');
	const icon = handle.querySelector('.shapeblock-comparison-icon');	let pct = parseFloat(container.dataset.offset);
	if (isNaN(pct)) {
		pct = 0.5;
	}

	const clamp = (n) => Math.max(0, Math.min(1, n));
	pct = clamp(pct);

	// The images fill the area inside the container's border.
	const adjust = (p) => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		const cw = p * w;
		const ch = p * h;

		let beforeClip = orientation === 'vertical' ? `inset(0 0 ${Math.max(0, h - ch)}px 0)` : `inset(0 ${Math.max(0, w - cw)}px 0 0)`;
		let afterClip = orientation === 'vertical' ? `inset(${Math.max(0, ch)}px 0 0 0)` : `inset(0 0 0 ${Math.max(0, cw)}px)`;
		// Diagonal: the handle travels corner to corner, from bottom left (0%)
		// through the centre (50%) to top right (100%). The line runs through it
		// parallel to the box's top-left to bottom-right diagonal, turned this
		// many degrees from upright.
		const tilt = orientation === 'diagonal' ? (-Math.atan2(w, h) * 180) / Math.PI : 0;
		if (orientation === 'diagonal') {
			const top = (2 * p - 1) * w; // where the line meets the top edge
			const bottom = top + w; // ... and the bottom edge
			beforeClip = `polygon(${-2 * w}px 0, ${top}px 0, ${bottom}px ${h}px, ${-2 * w}px ${h}px)`;
			afterClip = `polygon(${top}px 0, ${3 * w}px 0, ${3 * w}px ${h}px, ${bottom}px ${h}px)`;
			if (divider) {
				divider.style.left = cw + 'px';
				divider.style.top = h - ch + 'px';
				divider.style.height = 2 * Math.hypot(w, h) + 'px';
				divider.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
			}
		}
		before.style.clipPath = beforeClip;
		after.style.clipPath = afterClip;
		// A label is cut with its own picture, so it never shows over the other one.
		if (beforeLabel) {
			beforeLabel.style.clipPath = beforeClip;
		}
		if (afterLabel) {
			afterLabel.style.clipPath = afterClip;
		}

		if (orientation === 'vertical') {
			handle.style.top = ch + 'px';
			handle.style.left = '50%';
		} else if (orientation === 'diagonal') {
			// On the bottom-left to top-right diagonal, turned with the line; its
			// arrows point along the track, to the two corners it moves between.
			handle.style.left = cw + 'px';
			handle.style.top = h - ch + 'px';
			handle.style.rotate = tilt + 'deg';
			if (icon) {
				icon.style.rotate = (-Math.atan2(h, w) * 180) / Math.PI - tilt + 'deg';
			}
		} else {
			handle.style.left = cw + 'px';
			handle.style.top = '50%';
		}
		handle.setAttribute('aria-valuenow', String(Math.round(p * 100)));
	};

	const getPct = (clientX, clientY) => {
		const rect = container.getBoundingClientRect();
		if (orientation === 'diagonal') {
			// The point of the handle's corner-to-corner track nearest the pointer.
			const w = container.clientWidth;
			const h = container.clientHeight;
			const x = clientX - rect.left - container.clientLeft;
			const y = clientY - rect.top - container.clientTop;
			const len = w * w + h * h;
			return clamp(len ? (x * w + (h - y) * h) / len : 0.5);
		}
		const pos = orientation === 'vertical' ? clientY - rect.top - container.clientTop : clientX - rect.left - container.clientLeft;
		const size = orientation === 'vertical' ? container.clientHeight : container.clientWidth;
		return clamp(size ? pos / size : 0.5);
	};

	// Dragging. The handle captures the pointer (mouse, touch or pen), so the
	// drag follows it wherever it goes - also inside the block editor, whose
	// canvas is an iframe the editor's own document does not hear.
	let dragging = false;
	handle.addEventListener('pointerdown', (e) => {
		if (e.button !== 0) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		handle.setPointerCapture(e.pointerId);
		handle.focus({ preventScroll: true });
	});
	handle.addEventListener('pointermove', (e) => {
		if (!dragging) {
			return;
		}
		e.preventDefault();
		pct = getPct(e.clientX, e.clientY);
		adjust(pct);
	});
	const stop = (e) => {
		dragging = false;
		if (handle.hasPointerCapture(e.pointerId)) {
			handle.releasePointerCapture(e.pointerId);
		}
	};
	handle.addEventListener('pointerup', stop);
	handle.addEventListener('pointercancel', stop);

	// Keyboard: arrow keys move it 5%, Home / End to either end. The editor
	// must not take these keys for moving between blocks.
	handle.addEventListener('keydown', (e) => {
		const steps = { ArrowLeft: -0.05, ArrowUp: -0.05, ArrowRight: 0.05, ArrowDown: 0.05 };
		let next = null;
		if (e.key in steps) {
			next = pct + steps[e.key];
		} else if (e.key === 'Home') {
			next = 0;
		} else if (e.key === 'End') {
			next = 1;
		}
		if (next !== null) {
			e.preventDefault();
			e.stopPropagation();
			pct = clamp(next);
			adjust(pct);
		}
	});

	// Follow the box's size: window resizes, and in the editor the canvas and
	// device preview too.
	if (typeof ResizeObserver !== 'undefined') {
		new ResizeObserver(() => adjust(pct)).observe(container);
	} else {
		(container.ownerDocument.defaultView || window).addEventListener('resize', () => adjust(pct));
	}

	// Initial position. Run now and again after images load (so dimensions are known).
	adjust(pct);
	const imgs = container.querySelectorAll('img');
	imgs.forEach((img) => {
		if (!img.complete) {
			img.addEventListener('load', () => adjust(pct), { once: true });
		}
	});
}
