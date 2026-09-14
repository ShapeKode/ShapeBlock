import { useState, useEffect, useRef } from '@wordpress/element';
import { Modal, Button, Spinner, Notice, SelectControl, SearchControl, ButtonGroup } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import {
    buildCacheKey, getFromCache, setInCache, clearCache,
    getInflight, setInflight, removeInflight,
} from '../../templateCache';

const BLOCK_TYPE_OPTIONS = [
    { label: 'All Block Types', value: '' },
    { label: 'Post Grid', value: 'shapeblock/post-grid' },
    { label: 'Post Grid 2', value: 'shapeblock/post-grid-2' },
    { label: 'Post Grid 3', value: 'shapeblock/post-grid-3' },
    { label: 'Post Grid 4', value: 'shapeblock/post-grid-4' },
    { label: 'Post List', value: 'shapeblock/post-list' },
    { label: 'Post List 2', value: 'shapeblock/post-list-2' },
    { label: 'Post List 3', value: 'shapeblock/post-list-3' },
    { label: 'Post List 4', value: 'shapeblock/post-list-4' },
    { label: 'Post Slider', value: 'shapeblock/post-slider' },
    { label: 'Post Slider 2', value: 'shapeblock/post-slider-2' },
    { label: 'Post Slider 3', value: 'shapeblock/post-slider-3' },
    { label: 'Post Slider 4', value: 'shapeblock/post-slider-4' },
    { label: 'Post Ticker', value: 'shapeblock/post-ticker' },
    { label: 'Post Ticker 2', value: 'shapeblock/post-ticker-2' },
    { label: 'Category List', value: 'shapeblock/category-list' },
    { label: 'Heading', value: 'shapeblock/heading' },
    { label: 'Social Icons', value: 'shapeblock/social-icons' },
    { label: 'Button', value: 'shapeblock/button' },
    { label: 'Info Box', value: 'shapeblock/info-box' },
];

const PER_PAGE = 12;
const API_BASE = (typeof shapeblockEditor !== 'undefined' && shapeblockEditor.api_url) || '/wp-json/shapeblock/v1';
const IS_EXTERNAL_API = API_BASE.startsWith('http') && !API_BASE.startsWith(window.location.origin);

/**
 * Fetch wrapper — uses plain fetch for external (cross-origin) APIs
 * to avoid wp-api-fetch adding the local nonce header.
 */
async function templateApiFetch({ url, method = 'GET' }) {
    if (IS_EXTERNAL_API) {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }
    console.log('url', url);
    return apiFetch({ url, method });
}

/**
 * Build full API URL from filter params.
 */
function buildApiUrl(params) {
    let url = `${API_BASE}/posts?per_page=${PER_PAGE}&page=${params.page || 1}`;
    if (params.block_type) url += `&filter[block_type]=${encodeURIComponent(params.block_type)}`;
    if (params.template_type) url += `&filter[template_type]=${encodeURIComponent(params.template_type)}`;
    if (params.search) url += `&filter[search]=${encodeURIComponent(params.search)}`;
    return url;
}

/**
 * Fetch with cache: check memory cache first, then API, then store.
 * Prevents duplicate in-flight requests for the same key.
 */
async function cachedFetch(params) {
    const key = buildCacheKey(params);

    // 1. Cache hit
    const cached = getFromCache(key);
    if (cached) return cached;

    // 2. Already in-flight — reuse the same promise
    const inflight = getInflight(key);
    if (inflight) return inflight;

    // 3. Fresh fetch
    const promise = templateApiFetch({ url: buildApiUrl(params) }).then(response => {
        removeInflight(key);
        if (response.success) {
            setInCache(key, response);
        }
        return response;
    }).catch(err => {
        removeInflight(key);
        throw err;
    });

    setInflight(key, promise);
    return promise;
}

/**
 * Silently prefetch the next page into cache.
 */
function prefetchNext(params, hasMore) {
    if (!hasMore) return;
    const nextParams = { ...params, page: (params.page || 1) + 1 };
    const key = buildCacheKey(nextParams);
    if (getFromCache(key)) return; // already cached
    if (getInflight(key)) return;  // already fetching
    cachedFetch(nextParams).catch(() => { }); // fire & forget
}

export default function TemplateImporterModal({ isOpen, onClose, onImport, blockType }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [filterBlockType, setFilterBlockType] = useState(blockType || '');
    const [filterTemplateType, setFilterTemplateType] = useState('');
    const [search, setSearch] = useState('');
    const searchTimer = useRef(null);
    const scrollRef = useRef(null);
    const sentinelRef = useRef(null);

    // Current filter params (used to build cache keys)
    const getFilterParams = (pageNum) => ({
        page: pageNum,
        per_page: PER_PAGE,
        block_type: filterBlockType,
        template_type: filterTemplateType,
        search: search.trim(),
    });

    // Reset and fetch on filter changes
    useEffect(() => {
        if (!isOpen) return;
        resetAndFetch();
    }, [isOpen, filterBlockType, filterTemplateType]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            resetAndFetch();
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    // Infinite scroll observer
    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadNextPage();
                }
            },
            { root: scrollRef.current, threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, templates]);

    const resetAndFetch = () => {
        setTemplates([]);
        setPage(1);
        setHasMore(false);
        fetchTemplates(1, true);
    };

    const loadNextPage = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTemplates(nextPage, false);
    };

    const fetchTemplates = async (pageNum, isReset) => {
        if (isReset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const params = getFilterParams(pageNum);
            const response = await cachedFetch(params);

            if (response.success) {
                const newData = response.data || [];
                const pagination = response.pagination || {};
                const pageHasMore = pagination.has_more || false;

                if (isReset) {
                    setTemplates(newData);
                } else {
                    // Deduplicate by id
                    setTemplates(prev => {
                        const existingIds = new Set(prev.map(t => t.id));
                        const unique = newData.filter(t => !existingIds.has(t.id));
                        return [...prev, ...unique];
                    });
                }

                setHasMore(pageHasMore);

                // Prefetch next page
                prefetchNext(params, pageHasMore);
            } else {
                setError('Failed to load templates.');
            }
        } catch (err) {
            setError(err.message || 'Failed to load templates.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleImport = (template) => {
        setImporting(template.id);
        onImport(template.raw_content);
    };

    const handleSynchronize = async () => {
        setSyncing(true);

        // Clear frontend cache
        clearCache();

        // Clear backend transient cache
        try {
            await templateApiFetch({
                url: `${API_BASE}/cache/clear`,
                method: 'POST',
            });
        } catch (e) {
            // Non-critical — frontend cache is already cleared
        }

        // Re-fetch current view
        setTemplates([]);
        setPage(1);
        setHasMore(false);
        await fetchTemplates(1, true);
        setSyncing(false);
    };

    if (!isOpen) return null;

    return (
        <Modal
            title="Premade Designs"
            onRequestClose={onClose}
            isFullScreen={true}
            className="shapeblock-template-importer-modal"
        >
            <div className="shapeblock-template-importer" ref={scrollRef}>

                <div className="shapeblock-template-importer__toolbar">
                    <SelectControl
                        value={filterBlockType}
                        options={BLOCK_TYPE_OPTIONS}
                        onChange={setFilterBlockType}
                        className="shapeblock-template-importer__filter"
                        __nextHasNoMarginBottom
                    />
                    <SearchControl
                        value={search}
                        onChange={setSearch}
                        placeholder="Search designs..."
                        className="shapeblock-template-importer__search"
                        __nextHasNoMarginBottom
                    />
                    <div className="shapeblock-template-importer__type-filter">
                        <ButtonGroup>
                            <Button
                                variant={filterTemplateType === '' ? 'primary' : 'secondary'}
                                onClick={() => setFilterTemplateType('')}
                                className={'shapeblock-tier-btn' + (filterTemplateType === '' ? ' is-active' : '')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterTemplateType === 'starter_page' ? 'primary' : 'secondary'}
                                onClick={() => setFilterTemplateType('starter_page')}
                                className={'shapeblock-tier-btn' + (filterTemplateType === 'starter_page' ? ' is-active' : '')}
                            >
                                Starter Page
                            </Button>
                            <Button
                                variant={filterTemplateType === 'starter_section' ? 'primary' : 'secondary'}
                                onClick={() => setFilterTemplateType('starter_section')}
                                className={'shapeblock-tier-btn' + (filterTemplateType === 'starter_section' ? ' is-active' : '')}
                            >
                                Starter Section
                            </Button>
                            <Button
                                variant={filterTemplateType === 'starter_block' ? 'primary' : 'secondary'}
                                onClick={() => setFilterTemplateType('starter_block')}
                                className={'shapeblock-tier-btn' + (filterTemplateType === 'starter_block' ? ' is-active' : '')}
                            >
                                Starter Block
                            </Button>
                        </ButtonGroup>
                    </div>
                    <Button
                        variant="tertiary"
                        onClick={handleSynchronize}
                        isBusy={syncing}
                        disabled={syncing}
                        className="shapeblock-template-importer__sync-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Synchronize
                    </Button>
                </div>

                {error && (
                    <Notice status="error" isDismissible={false}>
                        {error}
                    </Notice>
                )}

                {loading && (
                    <div className="shapeblock-template-importer__loading">
                        <Spinner />
                        <p>Loading designs...</p>
                    </div>
                )}

                {!loading && templates.length === 0 && !error && (
                    <div className="shapeblock-template-importer__empty">
                        <p>No premade designs found
                            {filterBlockType && <> for <strong>{filterBlockType}</strong></>}.
                        </p>
                    </div>
                )}

                {!loading && templates.length > 0 && (
                    <>
                        <div className="shapeblock-template-importer__masonry">
                            {templates.map((template) => {
                                return (
                                    <div
                                        key={template.id}
                                        className="shapeblock-template-importer__item"
                                    >
                                        <div className="shapeblock-template-importer__preview">
                                            {template.featured_image ? (
                                                <img
                                                    src={template.featured_image}
                                                    alt={template.title}
                                                />
                                            ) : (
                                                <div className="shapeblock-template-importer__preview-placeholder">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                    <span>{template.title}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="shapeblock-template-importer__info">
                                            <h4 className="shapeblock-template-importer__title">
                                                {template.title}
                                            </h4>
                                            <Button
                                                variant="primary"
                                                onClick={() => handleImport(template)}
                                                isBusy={importing === template.id}
                                                disabled={importing !== null}
                                                className="shapeblock-template-importer__import-btn"
                                            >
                                                Import Now
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div ref={sentinelRef} className="shapeblock-template-importer__sentinel">
                            {loadingMore && (
                                <div className="shapeblock-template-importer__loading-more">
                                    <Spinner />
                                    <span>Loading more...</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
