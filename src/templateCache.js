/**
 * In-memory cache for template API responses.
 * Each entry stores { data, timestamp }.
 * TTL: 5 minutes (300000ms).
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();
const inflightRequests = new Map(); // prevent duplicate API calls for same key

/**
 * Build a deterministic cache key from request params.
 */
export function buildCacheKey( params ) {
    const parts = [
        params.page || 1,
        params.per_page || 12,
        params.block_type || '',
        params.template_type || '',
        params.search || '',
    ];
    return parts.join( '|' );
}

/**
 * Get cached response if it exists and hasn't expired.
 * Returns null if cache miss or expired.
 */
export function getFromCache( key ) {
    const entry = cache.get( key );
    if ( ! entry ) return null;

    if ( Date.now() - entry.timestamp > CACHE_TTL ) {
        cache.delete( key );
        return null;
    }

    return entry.data;
}

/**
 * Store a response in the cache.
 */
export function setInCache( key, data ) {
    cache.set( key, {
        data,
        timestamp: Date.now(),
    });
}

/**
 * Clear all cached entries (used by Synchronize).
 */
export function clearCache() {
    cache.clear();
    inflightRequests.clear();
}

/**
 * Track an in-flight request to prevent duplicates.
 * Returns existing promise if the same key is already being fetched.
 */
export function getInflight( key ) {
    return inflightRequests.get( key ) || null;
}

export function setInflight( key, promise ) {
    inflightRequests.set( key, promise );
}

export function removeInflight( key ) {
    inflightRequests.delete( key );
}
