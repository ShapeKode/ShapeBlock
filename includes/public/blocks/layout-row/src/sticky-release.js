/**
 * Releases one sticky row when the section after it arrives.
 *
 * A sticky row stays pinned until its containing block ends, which for a row in
 * the post content means the bottom of the page. This walks the row up out of
 * view as the next section reaches it, so that section pushes the sticky stack
 * away instead of sliding underneath it.
 *
 * Shared by the front end (view.js) and the editor canvas (edit.js), which runs
 * inside an iframe — hence every lookup goes through the row's own document.
 */

const UNRENDERED = { STYLE: 1, SCRIPT: 1, LINK: 1, TEMPLATE: 1, NOSCRIPT: 1 };

// Each block prints a <style> tag alongside its markup, so the next sibling is
// usually invisible. An unrendered element reports a zero rect, which would read
// as "already at the top" and shove the row out of view at once.
const isRenderable = (el) => !UNRENDERED[el.tagName] && el.getClientRects().length > 0;

export function observeStickyRow(row) {
	const doc = row.ownerDocument;
	const win = doc.defaultView;

	let pusher = null;
	let pushPoint = 0;
	let queued = false;

	function measure() {
		// Clear first, so the height is read without a leftover shift applied.
		row.style.transform = '';

		pusher = row.nextElementSibling;
		while (pusher && (pusher.classList.contains('is-sticky') || !isRenderable(pusher))) {
			pusher = pusher.nextElementSibling;
		}

		// Where the row's bottom edge sits once pinned; the pusher reaching this
		// line is the moment it starts shifting the row up.
		pushPoint = (parseFloat(win.getComputedStyle(row).top) || 0) + row.offsetHeight;
	}

	function update() {
		if (!pusher) {
			return;
		}
		const shift = Math.min(0, pusher.getBoundingClientRect().top - pushPoint);
		row.style.transform = shift ? `translateY(${shift}px)` : '';
	}

	function onScroll() {
		if (queued) {
			return;
		}
		queued = true;
		win.requestAnimationFrame(() => {
			queued = false;
			update();
		});
	}

	function remeasure() {
		measure();
		update();
	}

	measure();
	update();

	// Capture, because the editor canvas scrolls an inner element rather than
	// the document, and scroll events from an element do not bubble.
	doc.addEventListener('scroll', onScroll, { passive: true, capture: true });
	win.addEventListener('resize', remeasure);

	let observer;
	if (win.ResizeObserver) {
		observer = new win.ResizeObserver(remeasure);
		observer.observe(row);
	}

	return function cleanup() {
		doc.removeEventListener('scroll', onScroll, { capture: true });
		win.removeEventListener('resize', remeasure);
		if (observer) {
			observer.disconnect();
		}
		row.style.transform = '';
	};
}
