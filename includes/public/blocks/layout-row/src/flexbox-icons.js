/**
 * Compact 24x24 inline SVG icons for flexbox toggle controls.
 * Each icon is a React element ready for <ToggleGroupControlOptionIcon icon={...} />.
 */

const SVG = ({ children }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" focusable="false">
        {children}
    </svg>
);

/* ---------- flex-direction ---------- */
export const iconDirRow = (
    <SVG><path d="M4 11h12.2l-3.6-3.6L14 6l6 6-6 6-1.4-1.4L16.2 13H4z" /></SVG>
);
export const iconDirRowRev = (
    <SVG><path d="M20 11H7.8l3.6-3.6L10 6l-6 6 6 6 1.4-1.4L7.8 13H20z" /></SVG>
);
export const iconDirCol = (
    <SVG><path d="M11 4v12.2l-3.6-3.6L6 14l6 6 6-6-1.4-1.4L13 16.2V4z" /></SVG>
);
export const iconDirColRev = (
    <SVG><path d="M11 20V7.8l-3.6 3.6L6 10l6-6 6 6-1.4 1.4L13 7.8V20z" /></SVG>
);

/* ---------- justify-content (main axis) ---------- */
export const iconJustifyStart = (
    <SVG>
        <rect x="3" y="4" width="2" height="16" />
        <rect x="7" y="7" width="6" height="4" />
        <rect x="7" y="13" width="10" height="4" />
    </SVG>
);
export const iconJustifyCenter = (
    <SVG>
        <rect x="11" y="4" width="2" height="16" />
        <rect x="5" y="7" width="6" height="4" />
        <rect x="13" y="7" width="6" height="4" />
        <rect x="3" y="13" width="9" height="4" />
        <rect x="12" y="13" width="9" height="4" />
    </SVG>
);
export const iconJustifyEnd = (
    <SVG>
        <rect x="19" y="4" width="2" height="16" />
        <rect x="11" y="7" width="6" height="4" />
        <rect x="7" y="13" width="10" height="4" />
    </SVG>
);
export const iconJustifyBetween = (
    <SVG>
        <rect x="3" y="6" width="5" height="12" />
        <rect x="10" y="6" width="4" height="12" />
        <rect x="16" y="6" width="5" height="12" />
    </SVG>
);
export const iconJustifyAround = (
    <SVG>
        <rect x="2.5" y="6" width="4" height="12" />
        <rect x="10" y="6" width="4" height="12" />
        <rect x="17.5" y="6" width="4" height="12" />
    </SVG>
);
export const iconJustifyEvenly = (
    <SVG>
        <rect x="4" y="6" width="3" height="12" />
        <rect x="10.5" y="6" width="3" height="12" />
        <rect x="17" y="6" width="3" height="12" />
    </SVG>
);

/* ---------- align-items / align-content (cross axis) ---------- */
export const iconAlignStretch = (
    <SVG>
        <rect x="3" y="4" width="18" height="2" />
        <rect x="4" y="8" width="4" height="8" />
        <rect x="10" y="8" width="4" height="8" />
        <rect x="16" y="8" width="4" height="8" />
        <rect x="3" y="18" width="18" height="2" />
    </SVG>
);
export const iconAlignTop = (
    <SVG>
        <rect x="3" y="3" width="18" height="2" />
        <rect x="4" y="7" width="4" height="10" />
        <rect x="10" y="7" width="4" height="6" />
        <rect x="16" y="7" width="4" height="13" />
    </SVG>
);
export const iconAlignMiddle = (
    <SVG>
        <rect x="3" y="11" width="18" height="2" />
        <rect x="4" y="5" width="4" height="14" />
        <rect x="10" y="8" width="4" height="8" />
        <rect x="16" y="3" width="4" height="18" />
    </SVG>
);
export const iconAlignBottom = (
    <SVG>
        <rect x="3" y="19" width="18" height="2" />
        <rect x="4" y="7" width="4" height="10" />
        <rect x="10" y="11" width="4" height="6" />
        <rect x="16" y="4" width="4" height="13" />
    </SVG>
);
export const iconAlignBaseline = (
    <SVG>
        <rect x="3" y="14" width="18" height="1.5" />
        <rect x="4" y="6" width="4" height="8" />
        <rect x="10" y="3" width="4" height="11" />
        <rect x="16" y="8" width="4" height="6" />
    </SVG>
);

/* ---------- flex-wrap ---------- */
export const iconWrapNo = (
    <SVG>
        <rect x="3" y="9" width="3" height="6" />
        <rect x="7" y="9" width="3" height="6" />
        <rect x="11" y="9" width="3" height="6" />
        <rect x="15" y="9" width="3" height="6" />
    </SVG>
);
export const iconWrap = (
    <SVG>
        <rect x="3" y="4" width="3" height="6" />
        <rect x="7" y="4" width="3" height="6" />
        <rect x="11" y="4" width="3" height="6" />
        <rect x="3" y="14" width="3" height="6" />
        <rect x="7" y="14" width="3" height="6" />
    </SVG>
);
export const iconWrapRev = (
    <SVG>
        <rect x="3" y="4" width="3" height="6" />
        <rect x="7" y="4" width="3" height="6" />
        <rect x="3" y="14" width="3" height="6" />
        <rect x="7" y="14" width="3" height="6" />
        <rect x="11" y="14" width="3" height="6" />
    </SVG>
);
