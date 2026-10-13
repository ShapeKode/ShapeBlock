import { __, _n, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import {
    Popover,
    Button,
    TextControl,
    SelectControl,
    Icon,
} from '@wordpress/components';

// Icons shown at once; more are added with "Show more". Drawing every one of
// the ~870 icons as buttons on open would make the picker slow to appear.
const PAGE = 120;

// Both icon lists are loaded once per editor session and shared by every
// picker on the page.
let iconCache = null;
const loadIcons = (pluginUrl, version) => {
    if (!iconCache) {
        const base = `${pluginUrl}includes/public/assets/icon/`;
        const ver = version ? `?ver=${encodeURIComponent(version)}` : '';
        iconCache = Promise.all([
            fetch(`${base}config.json${ver}`).then((r) => r.json()).catch(() => null),
            fetch(`${base}library.json${ver}`).then((r) => r.json()).catch(() => null),
        ]).then(([original, library]) => {
            const list = [];
            const categories = [];
            if (original && original.glyphs) {
                categories.push(__('ShapeBlock', 'shapeblock'));
                original.glyphs.forEach((g) => list.push({ value: `shapeblock-icon-${g.css}`, name: g.css.replace(/^logo-/, ''), cat: 0 }));
            }
            if (library && library.icons) {
                // ShapeBlock's own block icons ("block-" names) join the
                // ShapeBlock group at the top; the rest keep their categories.
                if (!categories.length) {
                    categories.push(__('ShapeBlock', 'shapeblock'));
                }
                const blockCat = library.icons.find(([name]) => name.startsWith('block-'));
                const skip = blockCat ? blockCat[1] : -1;
                const index = {};
                library.categories.forEach((c, i) => {
                    if (i !== skip) {
                        index[i] = categories.length;
                        categories.push(c);
                    }
                });
                const own = [];
                library.icons.forEach(([name, cat, keywords]) => {
                    const icon = { value: `${library.prefix}${name}`, name: name.replace(/^block-/, ''), keywords: keywords || '' };
                    if (cat === skip) {
                        own.push({ ...icon, cat: 0 });
                    } else {
                        list.push({ ...icon, cat: index[cat] });
                    }
                });
                list.unshift(...own);
            }
            return { list, categories };
        });
    }
    return iconCache;
};

const IconPicker = ({ label, value, onChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    // Popover needs a stable anchor element. Without one it falls back to a
    // placeholder node and floating-ui keeps re-measuring against a moving
    // reference, which makes the panel visibly jitter while it is open.
    const [anchorEl, setAnchorEl] = useState(null);
    const [data, setData] = useState({ list: [], categories: [] });
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [limit, setLimit] = useState(PAGE);

    useEffect(() => {
        const pluginUrl = window.shapeblockEditor && window.shapeblockEditor.plugin_url ? window.shapeblockEditor.plugin_url : '';
        if (!pluginUrl) {
            return;
        }
        let alive = true;
        loadIcons(pluginUrl, window.shapeblockEditor.icons_version).then((d) => {
            if (alive) {
                setData(d);
            }
        });
        return () => {
            alive = false;
        };
    }, []);

    // A new search or category starts from the top again.
    useEffect(() => {
        setLimit(PAGE);
    }, [search, category]);

    const filtered = useMemo(() => {
        // Matches the icon's name ("arrow right" finds arrow-right) or one of
        // its extra search words ("cross" finds the x icons).
        const term = search.trim().toLowerCase();
        const slug = term.replace(/\s+/g, '-');
        return data.list.filter((icon) =>
            (category === 'all' || String(icon.cat) === category) &&
            (!term || icon.name.includes(slug) || (icon.keywords && icon.keywords.includes(term)))
        );
    }, [data, search, category]);

    // Show the icon's name alone, not the CSS class it is stored as.
    const iconLabel = (val) => String(val).replace(/^shapeblock-icon-/, '').replace(/^shapeblock-bi-/, '').replace(/^(logo|block)-/, '');

    const pick = (val) => {
        onChange(val);
        setIsVisible(false);
    };

    const cell = (selected) => ({
        padding: 0,
        height: '40px',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: selected ? '2px solid #007cba' : '1px solid #e0e0e0',
        borderRadius: '4px',
    });

    return (
        <div className="shapeblock-icon-picker-control" style={{ position: 'relative', marginBottom: '15px' }}>
            {label && <div style={{ marginBottom: '8px', fontWeight: '500' }}>{label}</div>}
            <Button
                variant="secondary"
                ref={setAnchorEl}
                onClick={() => setIsVisible(!isVisible)}
                style={{ width: '100%', justifyContent: 'space-between', height: 'auto', padding: '8px 12px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {value && value !== 'none' ? (
                        <i className={`shapeblock-icon ${value}`} style={{ fontSize: '20px' }}></i>
                    ) : (
                        <div style={{ width: '20px', height: '20px', border: '1px dashed #ccc' }}></div>
                    )}
                    <span>{value && value !== 'none' ? iconLabel(value) : __('Select Icon', 'shapeblock')}</span>
                </div>
                <Icon icon="edit" />
            </Button>

            {isVisible && (
                <Popover
                    anchor={anchorEl}
                    placement="left-start"
                    offset={20}
                    shift
                    flip={false}
                    resize={false}
                    onFocusOutside={() => setIsVisible(false)}
                    className="shapeblock-icon-picker-popover"
                >
                    <div style={{ padding: '14px', width: '320px', boxSizing: 'border-box' }}>
                        <TextControl
                            placeholder={__('Search icons…', 'shapeblock')}
                            value={search}
                            onChange={setSearch}
                            autoFocus
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <div style={{ margin: '8px 0' }}>
                            <SelectControl
                                value={category}
                                options={[
                                    { label: __('All categories', 'shapeblock'), value: 'all' },
                                    ...data.categories.map((c, i) => ({ label: c, value: String(i) })),
                                ]}
                                onChange={setCategory}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </div>
                        {/* Clearing the icon is a plain text button, kept apart
                            from the grid so it cannot be mistaken for an icon. */}
                        <Button
                            variant="secondary"
                            isDestructive
                            disabled={!value || value === 'none'}
                            onClick={() => pick('none')}
                            style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
                        >
                            {__('Remove icon', 'shapeblock')}
                        </Button>
                        <div style={{ fontSize: '12px', color: '#757575', marginBottom: '6px' }}>
                            {sprintf(
                                /* translators: %d: number of icons found. */
                                _n('%d icon', '%d icons', filtered.length, 'shapeblock'),
                                filtered.length
                            )}
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                            gap: '6px',
                            maxHeight: '280px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '2px',
                        }}>
                            {filtered.slice(0, limit).map((icon) => (
                                <Button
                                    key={icon.value}
                                    title={icon.name}
                                    aria-label={icon.name}
                                    onClick={() => pick(icon.value)}
                                    style={cell(value === icon.value)}
                                >
                                    <i className={`shapeblock-icon ${icon.value}`} style={{ fontSize: '18px' }} aria-hidden="true"></i>
                                </Button>
                            ))}
                        </div>
                        {filtered.length > limit && (
                            <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => setLimit(limit + PAGE * 2)}>
                                {__('Show more', 'shapeblock')}
                            </Button>
                        )}
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default IconPicker;
