/**
 * Places an open table tooltip against the window, so a table's scroll box or
 * rounded corners never cut it off. Its side (top, bottom, left, right) comes
 * from the --sb-tip-place custom property, which the per-device Tooltip Align
 * settings change.
 */
const GAP = 8;

export function placeTooltip(tip) {
	const box = tip.querySelector('.shapeblock-tbl-tooltip-content');
	if (!box) {
		return;
	}
	const view = tip.ownerDocument.defaultView;
	const place = view.getComputedStyle(tip).getPropertyValue('--sb-tip-place').trim() || tip.dataset.placement || 'top';
	const r = tip.getBoundingClientRect();
	const w = box.offsetWidth;
	const h = box.offsetHeight;
	let x = r.left + r.width / 2 - w / 2;
	let y = r.top - h - GAP;
	if ('bottom' === place) {
		y = r.bottom + GAP;
	} else if ('left' === place || 'right' === place) {
		x = 'left' === place ? r.left - w - GAP : r.right + GAP;
		y = r.top + r.height / 2 - h / 2;
	}
	// Kept inside the window.
	x = Math.max(GAP, Math.min(x, view.innerWidth - w - GAP));
	y = Math.max(GAP, Math.min(y, view.innerHeight - h - GAP));
	Object.assign(box.style, { position: 'fixed', left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto', transform: 'none' });
}

export function resetTooltip(tip) {
	const box = tip.querySelector('.shapeblock-tbl-tooltip-content');
	if (box) {
		['position', 'left', 'top', 'right', 'bottom', 'transform'].forEach((k) => box.style.removeProperty(k));
	}
}
