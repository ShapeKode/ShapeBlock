import { useEffect, useRef } from 'react';
import { doAction } from '@wordpress/hooks';

/**
 * A dashboard tab added by an add-on through the `shapeblock_admin_pages`
 * filter. The add-on owns the tab's content: it listens for the
 * `shapeblock.admin.tabMounted` action and draws into the element it is given,
 * and cleans up on `shapeblock.admin.tabUnmounted`. The element also carries
 * the tab key in `data-shapeblock-addon-tab`, so an add-on script that loads
 * after the app can still find it.
 */
export default function AddonTab({ tab }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        doAction('shapeblock.admin.tabMounted', tab, el);
        return () => doAction('shapeblock.admin.tabUnmounted', tab, el);
    }, [tab]);

    return <div ref={ref} data-shapeblock-addon-tab={tab} />;
}
