/**
 * Editor-side CSS generator for the FAQ Accordion block.
 *
 * Mirrors the inline CSS produced by render.php so the in-canvas (RichText)
 * preview matches the front end. Scoped to `.{blockId}`.
 */

const ensureUnit = (value) => {
	if (value === '' || value === null || value === undefined) {
		return '';
	}
	if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(String(value))) {
		return `${value}px`;
	}
	return value;
};

const dims = (obj, type) => {
	const out = {};
	if (!obj || typeof obj !== 'object') {
		return out;
	}
	const map =
		type === 'padding'
			? { top: 'padding-top', right: 'padding-right', bottom: 'padding-bottom', left: 'padding-left' }
			: type === 'margin'
				? { top: 'margin-top', right: 'margin-right', bottom: 'margin-bottom', left: 'margin-left' }
				: {
						top: 'border-top-left-radius',
						right: 'border-top-right-radius',
						bottom: 'border-bottom-right-radius',
						left: 'border-bottom-left-radius',
					};
	Object.keys(map).forEach((side) => {
		if (obj[side] !== undefined && obj[side] !== '') {
			out[map[side]] = ensureUnit(obj[side]);
		}
	});
	return out;
};

const borderToCss = (border) => {
	if (!border) {
		return {};
	}
	const style = border.style || 'solid';
	const color = border.color || 'rgba(0,0,0,0)';
	const width = border.width;

	if (width && typeof width === 'object') {
		const top = parseInt(width.top, 10) || 0;
		const right = parseInt(width.right, 10) || 0;
		const bottom = parseInt(width.bottom, 10) || 0;
		const left = parseInt(width.left, 10) || 0;
		if (!top && !right && !bottom && !left) {
			return {};
		}
		return {
			'border-style': style,
			'border-color': color,
			'border-width': `${ensureUnit(width.top || 0)} ${ensureUnit(width.right || 0)} ${ensureUnit(width.bottom || 0)} ${ensureUnit(width.left || 0)}`,
		};
	}

	if (!parseInt(width, 10)) {
		return {};
	}
	return { border: `${ensureUnit(width)} ${style} ${color}` };
};

const boxShadowToCss = (shadow) => {
	if (!shadow) {
		return '';
	}
	const x = ensureUnit(shadow.x || 0);
	const y = ensureUnit(shadow.y || 0);
	const b = ensureUnit(shadow.b || 0);
	const s = ensureUnit(shadow.s || 0);
	const c = shadow.c || 'rgba(0,0,0,0)';
	return `${x} ${y} ${b} ${s} ${c}`;
};

const typographyToCss = (typo) => {
	const out = {};
	if (!typo) {
		return out;
	}
	if (typo.fontFamily) out['font-family'] = typo.fontFamily;
	if (typo.fontSize) out['font-size'] = ensureUnit(typo.fontSize);
	if (typo.fontWeight) out['font-weight'] = typo.fontWeight;
	if (typo.fontStyle) out['font-style'] = typo.fontStyle;
	if (typo.textTransform) out['text-transform'] = typo.textTransform;
	if (typo.lineHeight) out['line-height'] = typo.lineHeight;
	if (typo.letterSpacing) out['letter-spacing'] = ensureUnit(typo.letterSpacing);
	return out;
};

const toRule = (selector, styleObj) => {
	const decls = Object.keys(styleObj)
		.filter((k) => styleObj[k] !== '' && styleObj[k] !== undefined && styleObj[k] !== null)
		.map((k) => `${k}:${styleObj[k]}`)
		.join(';');
	return decls ? `${selector}{${decls}}` : '';
};

export function buildFaqEditorCss(attributes) {
	const a = attributes || {};
	const root = `.${a.blockId || 'shapeblock-faq-preview'}`;

	// Accordion + question layout
	const accordion = {};
	if (a.itemsGap) accordion.gap = ensureUnit(a.itemsGap);

	const questionLayout = {
		'flex-direction': a.iconPosition === 'row-reverse' ? 'row-reverse' : 'row',
		'justify-content': 'left',
	};

	// Item
	const item = {};
	if (a.itemBackgroundColor) item.background = a.itemBackgroundColor;
	Object.assign(item, dims(a.itemBorderRadius, 'radius'), dims(a.itemPadding, 'padding'), borderToCss(a.itemBorder));
	const itemShadow = boxShadowToCss(a.itemBoxShadow);
	if (itemShadow && itemShadow !== '0px 0px 0px 0px rgba(0,0,0,0)') item['box-shadow'] = itemShadow;

	const itemHover = {};
	if (a.itemBackgroundColorHover) itemHover.background = a.itemBackgroundColorHover;
	Object.assign(itemHover, borderToCss(a.itemBorderHover));
	const itemHoverShadow = boxShadowToCss(a.itemBoxShadowHover);
	if (itemHoverShadow && itemHoverShadow !== '0px 0px 0px 0px rgba(0,0,0,0)') itemHover['box-shadow'] = itemHoverShadow;

	const itemActive = {};
	if (a.itemBackgroundColorActive) itemActive.background = a.itemBackgroundColorActive;
	Object.assign(itemActive, borderToCss(a.itemBorderActive));
	const itemActiveShadow = boxShadowToCss(a.itemBoxShadowActive);
	if (itemActiveShadow && itemActiveShadow !== '0px 0px 0px 0px rgba(0,0,0,0)') itemActive['box-shadow'] = itemActiveShadow;

	// Title
	const title = typographyToCss(a.titleTypography);
	if (a.titleColor) title.color = a.titleColor;
	const titleHover = a.titleColorHover ? { color: a.titleColorHover } : {};
	const titleActive = a.titleColorActive ? { color: a.titleColorActive } : {};

	// Question (bar)
	const question = {};
	if (a.titleBgColor) question['background-color'] = a.titleBgColor;
	Object.assign(question, dims(a.questionPadding, 'padding'), dims(a.questionBorderRadius, 'radius'), borderToCss(a.titleBorder));
	const titleShadow = boxShadowToCss(a.titleBoxShadow);
	if (titleShadow && titleShadow !== '0px 0px 0px 0px rgba(0,0,0,0)') question['box-shadow'] = titleShadow;
	const questionFull = { ...questionLayout, ...question };

	const questionHover = {};
	if (a.titleBgColorHover) questionHover['background-color'] = a.titleBgColorHover;
	if (a.titleBorderColorHover) questionHover['border-color'] = a.titleBorderColorHover;
	const titleShadowHover = boxShadowToCss(a.titleBoxShadowHover);
	if (titleShadowHover && titleShadowHover !== '0px 0px 0px 0px rgba(0,0,0,0)') questionHover['box-shadow'] = titleShadowHover;

	const questionActive = {};
	if (a.titleBgColorActive) questionActive['background-color'] = a.titleBgColorActive;
	if (a.titleBorderColorActive) questionActive['border-color'] = a.titleBorderColorActive;
	const titleShadowActive = boxShadowToCss(a.titleBoxShadowActive);
	if (titleShadowActive && titleShadowActive !== '0px 0px 0px 0px rgba(0,0,0,0)') questionActive['box-shadow'] = titleShadowActive;

	// Answer
	const answer = typographyToCss(a.descriptionTypography);
	if (a.descriptionColor) answer.color = a.descriptionColor;
	if (a.descriptionBgColor) answer['background-color'] = a.descriptionBgColor;
	Object.assign(answer, dims(a.answerPadding, 'padding'), dims(a.descriptionBorderRadius, 'radius'), borderToCss(a.descriptionBorder));

	const answerHover = {};
	if (a.descriptionColorHover) answerHover.color = a.descriptionColorHover;
	if (a.descriptionBgColorHover) answerHover['background-color'] = a.descriptionBgColorHover;
	if (a.descriptionBorderColorHover) answerHover['border-color'] = a.descriptionBorderColorHover;

	const answerActive = {};
	if (a.descriptionColorActive) answerActive.color = a.descriptionColorActive;
	if (a.descriptionBgColorActive) answerActive['background-color'] = a.descriptionBgColorActive;
	if (a.descriptionBorderColorActive) answerActive['border-color'] = a.descriptionBorderColorActive;

	// Icon
	const icon = {};
	if (a.iconColor) {
		icon.color = a.iconColor;
		icon.fill = a.iconColor;
	}
	if (a.iconBgColor) icon.background = a.iconBgColor;
	if (a.iconSize) icon['font-size'] = ensureUnit(a.iconSize);
	if (a.iconBoxSize) {
		const box = ensureUnit(a.iconBoxSize);
		Object.assign(icon, {
			'min-width': box,
			'min-height': box,
			width: box,
			height: box,
			'line-height': box,
		});
	}
	Object.assign(icon, dims(a.iconBorderRadius, 'radius'), borderToCss(a.iconBorder));
	if (a.iconPositionY !== '' && a.iconPositionY !== undefined) {
		icon.transform = `translateY(${ensureUnit(a.iconPositionY)})`;
	}

	const iconHover = {};
	if (a.iconColorHover) {
		iconHover.color = a.iconColorHover;
		iconHover.fill = a.iconColorHover;
	}
	if (a.iconBgColorHover) iconHover.background = a.iconBgColorHover;
	if (a.iconBorderColorHover) iconHover['border-color'] = a.iconBorderColorHover;

	const iconActive = {};
	if (a.iconColorActive) {
		iconActive.color = a.iconColorActive;
		iconActive.fill = a.iconColorActive;
	}
	if (a.iconBgColorActive) iconActive.background = a.iconBgColorActive;
	if (a.iconBorderColorActive) iconActive['border-color'] = a.iconBorderColorActive;
	if (a.iconPositionYActive !== '' && a.iconPositionYActive !== undefined) {
		iconActive.transform = `translateY(${ensureUnit(a.iconPositionYActive)})`;
	}

	return [
		toRule(`${root} .shapeblock-faq-accordion`, accordion),
		toRule(`${root} .shapeblock-faq-item`, item),
		toRule(`${root} .shapeblock-faq-item:hover`, itemHover),
		toRule(`${root} .shapeblock-faq-item.active`, itemActive),
		toRule(`${root} .shapeblock-faq-question`, questionFull),
		toRule(`${root} .shapeblock-faq-item:hover .shapeblock-faq-question`, questionHover),
		toRule(`${root} .shapeblock-faq-item.active .shapeblock-faq-question`, questionActive),
		toRule(`${root} .shapeblock-faq-title`, title),
		toRule(`${root} .shapeblock-faq-item:hover .shapeblock-faq-title`, titleHover),
		toRule(`${root} .shapeblock-faq-item.active .shapeblock-faq-title`, titleActive),
		toRule(`${root} .shapeblock-faq-answer`, answer),
		toRule(`${root} .shapeblock-faq-item:hover .shapeblock-faq-answer`, answerHover),
		toRule(`${root} .shapeblock-faq-item.active .shapeblock-faq-answer`, answerActive),
		toRule(`${root} .shapeblock-faq-icon`, icon),
		toRule(`${root} .shapeblock-faq-item:hover .shapeblock-faq-icon`, iconHover),
		toRule(`${root} .shapeblock-faq-item.active .shapeblock-faq-icon`, iconActive),
		buildFaqResponsiveCss(a, root),
	]
		.filter(Boolean)
		.join('\n');
}

/**
 * Tablet / Mobile overrides, mirroring the media queries in render.php so the
 * editor's device preview matches the front end. Emitted after the desktop
 * rules above, so equal-specificity selectors resolve the same way they do on
 * the front end.
 *
 * @param {Object} a    Block attributes.
 * @param {string} root Selector for this block instance.
 * @return {string} CSS.
 */
function buildFaqResponsiveCss(a, root) {
	const devices = [
		['Tablet', '@media (max-width: 1024px)'],
		['Mobile', '@media (max-width: 767px)'],
	];

	return devices
		.map(([suffix, query]) => {
			const gap = a[`itemsGap${suffix}`];

			const rules = [
				toRule(`${root} .shapeblock-faq-accordion`, gap ? { gap: ensureUnit(gap) } : {}),
				toRule(`${root} .shapeblock-faq-title`, typographyToCss(a[`titleTypography${suffix}`])),
				toRule(`${root} .shapeblock-faq-answer`, {
					...typographyToCss(a[`descriptionTypography${suffix}`]),
					...dims(a[`answerPadding${suffix}`], 'padding'),
				}),
				toRule(`${root} .shapeblock-faq-item`, dims(a[`itemPadding${suffix}`], 'padding')),
				toRule(`${root} .shapeblock-faq-question`, dims(a[`questionPadding${suffix}`], 'padding')),
			]
				.filter(Boolean)
				.join('');

			return rules ? `${query}{${rules}}` : '';
		})
		.filter(Boolean)
		.join('\n');
}
