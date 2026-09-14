/**
 * Image Comparison — front-end behaviour.
 */
import { initComparison } from './comparison';

(function () {
	'use strict';

	function initAll() {
		var nodes = document.querySelectorAll('.shapeblock-image-comparison-block-wrap .shapeblock-comparison-container');
		Array.prototype.forEach.call(nodes, initComparison);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
