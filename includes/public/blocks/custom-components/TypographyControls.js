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
// Popular fonts we preload (weight 400) so their dropdown options render IN
// their own font. Previewing all ~1500 Google fonts is not feasible (each
// styled option would download a font file), so we preview this popular set;
// any other font still applies when selected (loaded on demand).
const SHAPEBLOCK_POPULAR_FONTS = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Raleway',
    'Merriweather', 'Nunito', 'Playfair Display', 'Ubuntu', 'Rubik', 'Work Sans',
    'Inter', 'Roboto Condensed', 'Roboto Slab', 'PT Sans', 'Noto Sans', 'Mulish',
    'Quicksand', 'Josefin Sans', 'Bebas Neue', 'Dancing Script', 'Pacifico',
    'Lobster', 'Source Sans 3', 'Barlow', 'Kanit', 'Manrope', 'Karla',
    'Fira Sans', 'Cabin', 'DM Sans', 'Heebo', 'Titillium Web', 'Archivo',
    'Libre Baskerville', 'Comfortaa', 'Teko', 'Anton', 'Hind Siliguri',
];
import {
    SelectControl,
    TextControl,
    Popover,
    Button,
    Icon
} from '@wordpress/components';

const TypographyControls = ({ label, attributes, setAttributes, attributeKey, nextDefaultSize }) => {
    const [isVisible, setIsVisible] = useState(false);
    const typography = attributes[attributeKey] || {};

    const _nextDefaultSize = nextDefaultSize || false;

    // Build the Font Family options: web-safe stacks + the full Google Fonts
    // list (window.shapeblockFonts), falling back to a small bundled list.
    const googleList = (typeof window !== 'undefined' && Array.isArray(window.shapeblockFonts) && window.shapeblockFonts.length)
        ? window.shapeblockFonts
        : SHAPEBLOCK_FALLBACK_GOOGLE;
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

    const toggleVisible = () => {
        setIsVisible((state) => !state);
    };

    const updateTypography = (newAttrs) => {
        const nextTypography = {
            ...typography,
            ...newAttrs
        };

        setAttributes({
            [attributeKey]: nextTypography
        });
    };

    return (
        <div className="shapeblock-typography-control" style={{ position: 'relative' }}>
            <Button
                variant="secondary"
                onClick={toggleVisible}
                style={{ width: '100%', justifyContent: 'space-between', marginBottom: '15px', boxShadow: 'none' }}
            >
                {label}
                <Icon icon="editor-textcolor" />
            </Button>
            {isVisible && (
                <Popover
                    position="bottom center"
                    onFocusOutside={() => setIsVisible(false)}
                >
                    <div style={{ padding: '20px', width: '260px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="components-base-control__label" style={{ display: 'block', marginBottom: '8px' }}>
                                {__('Font Family', 'shapeblock')}
                            </label>
                            <Button
                                variant="secondary"
                                onClick={() => setFontOpen((v) => !v)}
                                style={{ width: '100%', justifyContent: 'space-between' }}
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
                        <TextControl
                            label={__('Font Size', 'shapeblock')}
                            value={typography.fontSize}
                            onChange={(val) => updateTypography({ fontSize: val })}
                            help={__('Include unit (e.g., 14px, 1.2rem)', 'shapeblock')}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <SelectControl
                            label={__('Font Weight', 'shapeblock')}
                            value={typography.fontWeight}
                            options={[
                                { label: __('Default', 'shapeblock'), value: 'inherit' },
                                { label: __('Thin (100)', 'shapeblock'), value: '100' },
                                { label: __('Light (300)', 'shapeblock'), value: '300' },
                                { label: __('Regular (400)', 'shapeblock'), value: '400' },
                                { label: __('Medium (500)', 'shapeblock'), value: '500' },
                                { label: __('Semi Bold (600)', 'shapeblock'), value: '600' },
                                { label: __('Bold (700)', 'shapeblock'), value: '700' },
                                { label: __('Extra Bold (800)', 'shapeblock'), value: '800' },
                                { label: __('Black (900)', 'shapeblock'), value: '900' },
                            ]}
                            onChange={(val) => updateTypography({ fontWeight: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <SelectControl
                            label={__('Font Style', 'shapeblock')}
                            value={typography.fontStyle || ''}
                            options={[
                                { label: __('Default', 'shapeblock'), value: '' },
                                { label: __('Normal', 'shapeblock'), value: 'normal' },
                                { label: __('Italic', 'shapeblock'), value: 'italic' },
                                { label: __('Oblique', 'shapeblock'), value: 'oblique' },
                            ]}
                            onChange={(val) => updateTypography({ fontStyle: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <SelectControl
                            label={__('Text Decoration', 'shapeblock')}
                            value={typography.textDecoration || ''}
                            options={[
                                { label: __('Default', 'shapeblock'), value: '' },
                                { label: __('None', 'shapeblock'), value: 'none' },
                                { label: __('Underline', 'shapeblock'), value: 'underline' },
                                { label: __('Overline', 'shapeblock'), value: 'overline' },
                                { label: __('Line Through', 'shapeblock'), value: 'line-through' },
                            ]}
                            onChange={(val) => updateTypography({ textDecoration: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <SelectControl
                            label={__('Text Transform', 'shapeblock')}
                            value={typography.textTransform}
                            options={[
                                { label: __('None', 'shapeblock'), value: 'none' },
                                { label: __('Uppercase', 'shapeblock'), value: 'uppercase' },
                                { label: __('Lowercase', 'shapeblock'), value: 'lowercase' },
                                { label: __('Capitalize', 'shapeblock'), value: 'capitalize' },
                            ]}
                            onChange={(val) => updateTypography({ textTransform: val })}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                        <TextControl
                            __next40pxDefaultSize={_nextDefaultSize}
                            label={__('Line Height', 'shapeblock')}
                            value={typography.lineHeight}
                            onChange={(val) => updateTypography({ lineHeight: val })}
                            __nextHasNoMarginBottom={true}
                        />
                        <TextControl
                            __next40pxDefaultSize={_nextDefaultSize}
                            label={__('Letter Spacing', 'shapeblock')}
                            value={typography.letterSpacing}
                            onChange={(val) => updateTypography({ letterSpacing: val })}
                            help={__('Include unit (e.g., 1px)', 'shapeblock')}
                            __nextHasNoMarginBottom={true}
                        />
                        <Button
                            variant="secondary"
                            isSmall
                            onClick={() => {
                                setAttributes({
                                    [attributeKey]: {
                                        fontFamily: '',
                                        fontSize: '',
                                        fontWeight: 'inherit',
                                        lineHeight: '',
                                        textTransform: 'none',
                                        letterSpacing: ''
                                    }
                                });
                                setIsVisible(false);
                            }}
                            style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                        >
                            {__('Reset Typography', 'shapeblock')}
                        </Button>
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default TypographyControls;
