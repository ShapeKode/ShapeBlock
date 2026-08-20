/**
 * Build editor-side CSS for a Row block. Mirrors the frontend PHP renderer so
 * the editor shows what the visitor will see. Returns a single <style> body.
 */

const BREAKPOINTS = {
    tablet: '@media (max-width: 1024px)',
    mobile: '@media (max-width: 767px)',
};

const ensureUnit = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    if (typeof v === 'number') return v === 0 ? '0px' : `${v}px`;
    if (typeof v === 'string' && /^[0-9.]+$/.test(v)) return `${v}px`;
    return v;
};

const boxToCss = (box, prop) => {
    if (!box || typeof box !== 'object') return {};
    const map = {};
    const k = prop;
    if (box.top !== '' && box.top != null) map[`${k}-top`] = box.top;
    if (box.right !== '' && box.right != null) map[`${k}-right`] = box.right;
    if (box.bottom !== '' && box.bottom != null) map[`${k}-bottom`] = box.bottom;
    if (box.left !== '' && box.left != null) map[`${k}-left`] = box.left;
    return map;
};

const radiusToCss = (r) => {
    if (!r || typeof r !== 'object') return {};
    const map = {};
    if (r.top) map['border-top-left-radius'] = ensureUnit(r.top);
    if (r.right) map['border-top-right-radius'] = ensureUnit(r.right);
    if (r.bottom) map['border-bottom-right-radius'] = ensureUnit(r.bottom);
    if (r.left) map['border-bottom-left-radius'] = ensureUnit(r.left);
    return map;
};

const borderToCss = (b) => {
    if (!b || typeof b !== 'object') return {};
    const w = b.width;
    const out = {};
    if (w && typeof w === 'object') {
        const t = ensureUnit(w.top ?? 0);
        const r = ensureUnit(w.right ?? 0);
        const bo = ensureUnit(w.bottom ?? 0);
        const l = ensureUnit(w.left ?? 0);
        if ([t, r, bo, l].some((v) => v && v !== '0px')) {
            out['border-style'] = b.style || 'solid';
            out['border-color'] = b.color || 'transparent';
            out['border-width'] = `${t} ${r} ${bo} ${l}`;
        }
    } else if (w && parseFloat(w) !== 0) {
        out.border = `${ensureUnit(w)} ${b.style || 'solid'} ${b.color || 'transparent'}`;
    }
    return out;
};

const shadowToCss = (s) => {
    if (!s || typeof s !== 'object') return '';
    const x = ensureUnit(s.x || 0);
    const y = ensureUnit(s.y || 0);
    const b = ensureUnit(s.b || 0);
    const sp = ensureUnit(s.s || 0);
    const c = s.c || '';
    if (!c || c === 'rgba(0,0,0,0)') return '';
    return `${x} ${y} ${b} ${sp} ${c}`;
};

const renderDecls = (map) =>
    Object.entries(map)
        .filter(([, v]) => v !== '' && v != null)
        .map(([k, v]) => `${k}:${v}`)
        .join(';');

const collectDevice = (attrs, suffix) => {
    const k = (base) => attrs[suffix === '' ? base : `${base}${suffix}`];
    const decls = {};

    if (k('flexDirection')) decls['flex-direction'] = k('flexDirection');
    if (k('justifyContent')) decls['justify-content'] = k('justifyContent');
    if (k('alignItems')) decls['align-items'] = k('alignItems');
    if (k('alignContent')) decls['align-content'] = k('alignContent');
    if (k('flexWrap')) decls['flex-wrap'] = k('flexWrap');
    if (k('gap')) decls['gap'] = k('gap');
    if (k('rowGap')) decls['row-gap'] = k('rowGap');
    if (k('columnGap')) decls['column-gap'] = k('columnGap');
    if (k('minHeight')) decls['min-height'] = k('minHeight');
    // Boxed max-width is applied to the inner via a CSS variable in style.scss — see
    // render.php for the same approach. Setting `max-width` on the wrapper would
    // constrain the wrong element and not match the frontend.
    if (k('maxWidth')) decls['--eelfg-layout-row-max-width'] = k('maxWidth');

    Object.assign(decls, boxToCss(k('padding'), 'padding'));
    Object.assign(decls, boxToCss(k('margin'), 'margin'));

    if (suffix === '') {
        if (attrs.background) decls['background-color'] = attrs.background;
        if (attrs.backgroundGradient) decls['background-image'] = attrs.backgroundGradient;
        if (attrs.backgroundImage?.url) {
            const url = attrs.backgroundImage.url;
            decls['background-image'] = attrs.backgroundGradient
                ? `${attrs.backgroundGradient}, url(${url})`
                : `url(${url})`;
            if (attrs.backgroundSize) decls['background-size'] = attrs.backgroundSize;
            if (attrs.backgroundPosition) decls['background-position'] = attrs.backgroundPosition;
            if (attrs.backgroundRepeat) decls['background-repeat'] = attrs.backgroundRepeat;
            if (attrs.backgroundAttachment) decls['background-attachment'] = attrs.backgroundAttachment;
        }
        Object.assign(decls, borderToCss(attrs.border));
        Object.assign(decls, radiusToCss(attrs.borderRadius));
        const sh = shadowToCss(attrs.boxShadow);
        if (sh) decls['box-shadow'] = sh;
        if (attrs.overflow) decls.overflow = attrs.overflow;
        if (attrs.position) decls.position = attrs.position;
        if (attrs.zIndex !== '' && attrs.zIndex != null) decls['z-index'] = attrs.zIndex;
    }

    return decls;
};

// CSS custom props consumed by columns to compute width = calc(W% - share-of-gap).
// `colCount` should be the actual inner-block count (passed from edit.js useSelect).
const pickColGap = (attrs, suffix) => {
    const k = (base) => attrs[suffix === '' ? base : `${base}${suffix}`];
    return k('columnGap') || k('gap') || '';
};

export const buildRowEditorCss = (attrs, colCount = 0) => {
    if (!attrs.blockId) return '';
    const sel = `.${attrs.blockId}`;

    const desktop = collectDevice(attrs, '');
    const tablet = collectDevice(attrs, 'Tablet');
    const mobile = collectDevice(attrs, 'Mobile');

    if (colCount > 0) desktop['--bp-cols'] = colCount;
    const gD = pickColGap(attrs, '');
    const gT = pickColGap(attrs, 'Tablet');
    const gM = pickColGap(attrs, 'Mobile');
    if (gD) desktop['--bp-gap'] = ensureUnit(gD);
    if (gT) tablet['--bp-gap']  = ensureUnit(gT);
    if (gM) mobile['--bp-gap']  = ensureUnit(gM);

    let css = '';
    const d = renderDecls(desktop);
    if (d) css += `${sel}{${d}}`;
    const t = renderDecls(tablet);
    if (t) css += `${BREAKPOINTS.tablet}{${sel}{${t}}}`;
    const m = renderDecls(mobile);
    if (m) css += `${BREAKPOINTS.mobile}{${sel}{${m}}}`;

    return css;
};

const collectColumnDevice = (attrs, suffix) => {
    const k = (base) => attrs[suffix === '' ? base : `${base}${suffix}`];
    const decls = {};

    const widthType = attrs.widthType || 'percentage';
    const w = k('width');
    // Subtract this column's share of the row gap so columns total exactly 100% of
    // the row regardless of gap. Vars are set by the parent row (see buildRowEditorCss).
    //   calc(W% - (cols - 1) * gap * W / 100)
    if (widthType === 'percentage' && w) {
        const wNum = parseFloat(w);
        const calc = `calc(${w} - (var(--bp-cols, 1) - 1) * var(--bp-gap, 0px) * ${wNum} / 100)`;
        decls['flex'] = `0 1 ${calc}`;
        decls['max-width'] = calc;
    }
    if (widthType === 'flex') {
        const grow = k('flexGrow');
        const basis = k('flexBasis');
        if (grow !== '' && grow != null) decls['flex-grow'] = grow;
        if (basis) decls['flex-basis'] = basis;
    }
    if (widthType === 'custom' && w) decls['width'] = w;

    if (k('minHeight')) decls['min-height'] = k('minHeight');

    Object.assign(decls, boxToCss(k('padding'), 'padding'));
    Object.assign(decls, boxToCss(k('margin'), 'margin'));

    if (suffix === '') {
        if (attrs.background) decls['background-color'] = attrs.background;
        if (attrs.backgroundGradient) decls['background-image'] = attrs.backgroundGradient;
        Object.assign(decls, borderToCss(attrs.border));
        Object.assign(decls, radiusToCss(attrs.borderRadius));
        const sh = shadowToCss(attrs.boxShadow);
        if (sh) decls['box-shadow'] = sh;
        if (attrs.verticalAlign) decls['align-self'] = attrs.verticalAlign;
    }

    return decls;
};

export const buildColumnEditorCss = (attrs) => {
    if (!attrs.blockId) return '';
    const sel = `.${attrs.blockId}`;

    const desktop = collectColumnDevice(attrs, '');
    const tablet = collectColumnDevice(attrs, 'Tablet');
    const mobile = collectColumnDevice(attrs, 'Mobile');

    let css = '';
    const d = renderDecls(desktop);
    if (d) css += `${sel}{${d}}`;
    const t = renderDecls(tablet);
    if (t) css += `${BREAKPOINTS.tablet}{${sel}{${t}}}`;
    const m = renderDecls(mobile);
    if (m) css += `${BREAKPOINTS.mobile}{${sel}{${m}}}`;

    // Content flexbox — the inner wrapper is a flex container (matches render.php).
    const innerSel = `${sel} > .eelfg-column__inner`;
    const innerOf = (suffix) => {
        const k = (base) => attrs[suffix === '' ? base : `${base}${suffix}`];
        const dcl = {};
        if (k('flexDirection')) dcl['flex-direction'] = k('flexDirection');
        if (k('justifyContent')) dcl['justify-content'] = k('justifyContent');
        if (k('alignItems')) dcl['align-items'] = k('alignItems');
        if (k('alignContent')) dcl['align-content'] = k('alignContent');
        if (k('flexWrap')) dcl['flex-wrap'] = k('flexWrap');
        if (k('contentGap')) dcl['gap'] = k('contentGap');
        return dcl;
    };
    const iD = innerOf(''), iT = innerOf('Tablet'), iM = innerOf('Mobile');
    // Flex only when the user set at least one flex option (keeps empty/default columns as normal block flow).
    if (Object.keys(iD).length || Object.keys(iT).length || Object.keys(iM).length) {
        iD['display'] = 'flex';
    }
    const idd = renderDecls(iD);
    if (idd) css += `${innerSel}{${idd}}`;
    const itt = renderDecls(iT);
    if (itt) css += `${BREAKPOINTS.tablet}{${innerSel}{${itt}}}`;
    const imm = renderDecls(iM);
    if (imm) css += `${BREAKPOINTS.mobile}{${innerSel}{${imm}}}`;

    return css;
};
