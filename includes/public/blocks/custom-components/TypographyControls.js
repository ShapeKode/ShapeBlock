import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';

// Web-safe / system font stacks (always available). Google fonts are appended
// from window.shapeblockFonts (the full list exposed by the plugin); a small
// fallback list is used if that global is unavailable.
const SHAPEBLOCK_WEBSAFE_FONTS = [
    { label: __( 'Default', 'shapeblock' ), value: '' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];
const SHAPEBLOCK_FALLBACK_GOOGLE = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Nunito',
    'Raleway', 'Oswald', 'Merriweather', 'Ubuntu', 'Rubik', 'Work Sans',
    'Playfair Display', 'Source Sans 3', 'PT Sans', 'Mukti', 'Hind Siliguri',
];
import {
    SelectControl,
    TextControl,
    Button,
    Icon
} from '@wordpress/components';
import * as blockEditor from '@wordpress/block-editor';

// The same controls the core Typography panel is made of. Most of them are
// still exported under an __experimental name, so each one is looked up here
// and the panel simply leaves out any a WordPress version does not have.
const FontSizePicker = blockEditor.FontSizePicker;
const FontAppearanceControl = blockEditor.__experimentalFontAppearanceControl;
const LineHeightControl = blockEditor.LineHeightControl || blockEditor.__experimentalLineHeightControl;
const LetterSpacingControl = blockEditor.__experimentalLetterSpacingControl;
const TextDecorationControl = blockEditor.__experimentalTextDecorationControl;
const TextTransformControl = blockEditor.__experimentalTextTransformControl;

const TypographyControls = ({ label, attributes, setAttributes, attributeKey }) => {
    // The controls sit inline, under a row that opens and closes them.
    const [isOpen, setIsOpen] = useState(false);
    const typography = attributes[attributeKey] || {};

    // Google Fonts is an opt-in connection (ShapeBlock > Settings). While it is
    // off the picker offers only locally available stacks and nothing here ever
    // contacts fonts.googleapis.com.
    const googleFontsAllowed = (typeof window !== 'undefined' && !!window.shapeblockGoogleFonts);

    // Build the Font Family options: web-safe stacks + the full Google Fonts
    // list (window.shapeblockFonts), falling back to a small bundled list.
    const googleList = !googleFontsAllowed
        ? []
        : ((typeof window !== 'undefined' && Array.isArray(window.shapeblockFonts) && window.shapeblockFonts.length)
            ? window.shapeblockFonts
            : SHAPEBLOCK_FALLBACK_GOOGLE);
    const fontOptions = [
        ...SHAPEBLOCK_WEBSAFE_FONTS,
        ...googleList.map((f) => ({ label: f, value: f })),
    ];

    // Custom font picker. A native <select> does NOT render per-option fonts
    // reliably (the OS dropdown ignores option font-family, e.g. on Windows),
    // so we use a searchable list of <div>s (which DO honor font-family) and
    // lazy-load each shown font so previews render without downloading all
    // ~1500 fonts at once.
    const [fontOpen, setFontOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const currentFont = fontOptions.find((o) => o.value === (typography.fontFamily || '')) || fontOptions[0];
    const filteredFonts = fontSearch
        ? fontOptions.filter((o) => o.label.toLowerCase().includes(fontSearch.toLowerCase()))
        : fontOptions;
    const shownFonts = filteredFonts.slice(0, 80);

    const loadFontPreview = (fam) => {
        if (!googleFontsAllowed) return;
        if (!fam || fam.indexOf(',') !== -1 || typeof document === 'undefined') return;
        const slug = fam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // Skip if this font is already loaded (full weights) or previewed — one
        // request per font, never a duplicate.
        if (document.getElementById('shapeblock-font-' + slug) || document.getElementById('shapeblock-fontprev-' + slug)) return;
        const link = document.createElement('link');
        link.id = 'shapeblock-fontprev-' + slug;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + '&display=swap';
        document.head.appendChild(link);
    };

    // Lazy-load previews for the fonts currently shown in the open picker.
    useEffect(() => {
        if (!fontOpen) return;
        shownFonts.forEach((o) => loadFontPreview(o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fontOpen, fontSearch]);

    // Load the selected Google font in the editor so the preview shows it.
    // The editor canvas is an <iframe>, so the font must be injected BOTH into
    // the outer document and into the canvas iframe's document — otherwise the
    // preview (inside the iframe) never sees the font and "nothing happens".
    useEffect(() => {
        const fam = typography.fontFamily;
        if (!googleFontsAllowed) return;
        if (!fam || fam.indexOf(',') !== -1 || typeof document === 'undefined') {
            return; // empty or a web-safe stack — nothing to load.
        }
        const id = 'shapeblock-font-' + fam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@100;200;300;400;500;600;700;800;900&display=swap';
        const addTo = (doc) => {
            try {
                if (!doc || !doc.head || doc.getElementById(id)) return;
                const link = doc.createElement('link');
                link.id = id;
                link.rel = 'stylesheet';
                link.href = href;
                doc.head.appendChild(link);
            } catch (e) { /* cross-origin / not ready — ignore */ }
        };
        addTo(document);
        const iframe = document.querySelector('iframe[name="editor-canvas"]');
        if (iframe) {
            const inject = () => addTo(iframe.contentDocument);
            inject();
            // Canvas may not be ready yet on first mount — retry shortly.
            setTimeout(inject, 300);
        }
    }, [typography.fontFamily]);

    const updateTypography = (newAttrs) => {
        setAttributes({
            [attributeKey]: {
                ...typography,
                ...newAttrs
            }
        });
    };

    // A stored 'inherit' (the old default for weight) means "not set".
    const weightValue = (typography.fontWeight && typography.fontWeight !== 'inherit') ? typography.fontWeight : undefined;
    const summary = [
        currentFont && currentFont.value ? currentFont.label : '',
        typography.fontSize || '',
        weightValue || '',
    ].filter(Boolean).join(' \u00b7 ');

    const sectionLabel = { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' };
    const twoColumns = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px', alignItems: 'start' };

    return (
        <div className="shapeblock-typography-control" style={{ position: 'relative', marginBottom: '15px' }}>
            <Button
                className="shapeblock-typography-toggle"
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: 'auto',
                    minHeight: '40px',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    background: isOpen ? '#f0f0f0' : 'transparent',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span
                        aria-hidden="true"
                        style={{
                            fontFamily: typography.fontFamily || undefined,
                            fontWeight: weightValue,
                            fontSize: '18px',
                            lineHeight: 1,
                        }}
                    >
                        Aa
                    </span>
                    <span style={{ textAlign: 'left' }}>{label}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    {summary ? (
                        <span style={{ color: '#757575', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                            {summary}
                        </span>
                    ) : null}
                    <Icon icon={isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2'} />
                </span>
            </Button>

            {isOpen && (
                <div
                    style={{
                        boxSizing: 'border-box',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr)',
                        gap: '16px',
                        padding: '16px 12px',
                        border: '1px solid #ddd',
                        borderTop: 0,
                        borderRadius: '0 0 2px 2px',
                    }}
                >
                    <div>
                        <div style={{ ...sectionLabel, marginBottom: '8px' }}>{__('Font family', 'shapeblock')}</div>
                        <Button
                            variant="secondary"
                            onClick={() => setFontOpen((v) => !v)}
                            style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'space-between' }}
                        >
                            <span style={{ fontFamily: (currentFont && currentFont.value) ? currentFont.value : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentFont ? currentFont.label : __('Default', 'shapeblock')}
                            </span>
                            <Icon icon={fontOpen ? 'arrow-up-alt2' : 'arrow-down-alt2'} />
                        </Button>
                        {fontOpen && (
                            <div style={{ border: '1px solid #ddd', borderRadius: '2px', marginTop: '6px' }}>
                                <TextControl
                                    value={fontSearch}
                                    onChange={setFontSearch}
                                    placeholder={__('Search fonts…', 'shapeblock')}
                                    __nextHasNoMarginBottom={true}
                                    __next40pxDefaultSize={true}
                                />
                                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    {shownFonts.map((o) => (
                                        <div
                                            key={o.value || 'default'}
                                            onClick={() => { updateTypography({ fontFamily: o.value }); setFontOpen(false); setFontSearch(''); }}
                                            style={{
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                fontFamily: o.value || undefined,
                                                background: (typography.fontFamily || '') === o.value ? '#e7f0f7' : 'transparent',
                                            }}
                                        >
                                            {o.label}
                                        </div>
                                    ))}
                                    {shownFonts.length === 0 && (
                                        <div style={{ padding: '6px 10px', color: '#757575' }}>{__('No fonts found', 'shapeblock')}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {FontSizePicker ? (
                        <FontSizePicker
                            value={typography.fontSize || undefined}
                            onChange={(value) => updateTypography({ fontSize: (value === undefined || value === null || value === '') ? '' : (typeof value === 'number' ? value + 'px' : String(value)) })}
                            withReset
                            __next40pxDefaultSize
                        />
                    ) : (
                        <TextControl
                            label={__('Font Size', 'shapeblock')}
                            value={typography.fontSize}
                            onChange={(val) => updateTypography({ fontSize: val })}
                            help={__('Include unit (e.g., 14px, 1.2rem)', 'shapeblock')}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                    )}

                    {FontAppearanceControl ? (
                        <FontAppearanceControl
                            value={{ fontStyle: typography.fontStyle || undefined, fontWeight: weightValue }}
                            onChange={(next) => updateTypography({ fontStyle: next.fontStyle || '', fontWeight: next.fontWeight || '' })}
                            hasFontStyles
                            hasFontWeights
                            __next40pxDefaultSize
                        />
                    ) : (
                        <SelectControl
                            label={__('Font Weight', 'shapeblock')}
                            value={weightValue || ''}
                            options={[
                                { label: __('Default', 'shapeblock'), value: '' },
                                { label: __('Light (300)', 'shapeblock'), value: '300' },
                                { label: __('Regular (400)', 'shapeblock'), value: '400' },
                                { label: __('Medium (500)', 'shapeblock'), value: '500' },
                                { label: __('Semi Bold (600)', 'shapeblock'), value: '600' },
                                { label: __('Bold (700)', 'shapeblock'), value: '700' },
                                { label: __('Black (900)', 'shapeblock'), value: '900' },
                            ]}
                            onChange={(val) => updateTypography({ fontWeight: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                    )}

                    <div style={twoColumns}>
                        {LineHeightControl ? (
                            <LineHeightControl
                                value={typography.lineHeight || undefined}
                                onChange={(value) => updateTypography({ lineHeight: value === undefined || value === null ? '' : String(value) })}
                                __unstableInputWidth="100%"
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        ) : (
                            <TextControl
                                label={__('Line Height', 'shapeblock')}
                                value={typography.lineHeight}
                                onChange={(val) => updateTypography({ lineHeight: val })}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                            />
                        )}
                        {LetterSpacingControl ? (
                            <LetterSpacingControl
                                value={typography.letterSpacing || undefined}
                                onChange={(value) => updateTypography({ letterSpacing: value || '' })}
                                __unstableInputWidth="100%"
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        ) : (
                            <TextControl
                                label={__('Letter Spacing', 'shapeblock')}
                                value={typography.letterSpacing}
                                onChange={(val) => updateTypography({ letterSpacing: val })}
                                help={__('Include unit (e.g., 1px)', 'shapeblock')}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                            />
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
                        {TextDecorationControl ? (
                            <TextDecorationControl
                                value={typography.textDecoration || undefined}
                                onChange={(value) => updateTypography({ textDecoration: value || '' })}
                                __next40pxDefaultSize
                            />
                        ) : null}
                        {TextTransformControl ? (
                            <TextTransformControl
                                value={(typography.textTransform && typography.textTransform !== 'none') ? typography.textTransform : undefined}
                                onChange={(value) => updateTypography({ textTransform: value || '' })}
                                __next40pxDefaultSize
                            />
                        ) : null}
                    </div>

                    <Button
                        variant="tertiary"
                        isSmall
                        onClick={() => {
                            setAttributes({
                                [attributeKey]: {
                                    fontFamily: '',
                                    fontSize: '',
                                    fontWeight: '',
                                    fontStyle: '',
                                    lineHeight: '',
                                    textTransform: '',
                                    textDecoration: '',
                                    letterSpacing: ''
                                }
                            });
                        }}
                        style={{ justifySelf: 'start' }}
                    >
                        {__('Reset typography', 'shapeblock')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TypographyControls;
