/**
 * Row — sticky release behaviour on the front end.
 */
import { observeStickyRow } from './sticky-release';

(function () {
	'use strict';

	function init() {
		const rows = document.querySelectorAll('.shapeblock-layout-row.is-sticky');
		Array.prototype.forEach.call(rows, observeStickyRow);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
