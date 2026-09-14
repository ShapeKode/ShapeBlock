import { createElement } from '@wordpress/element';
import { SVG, Path, Rect, Defs, LinearGradient, Stop } from '@wordpress/primitives';
import { registerBlockCategory } from './components/editor-components/registerBlocklCategory';


const catIcon = () => {
    return createElement(
        SVG,
        { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "20", height: "20", fill: "none" },
        createElement(Rect, { x: "0.363636", y: "0.363636", width: "23.2727", height: "23.2727", rx: "2.54545", fill: "url(#paint0_linear_2032_692)" }),
        createElement(Rect, { x: "0.363636", y: "0.363636", width: "23.2727", height: "23.2727", rx: "2.54545", stroke: "url(#paint1_linear_2032_692)", strokeWidth: "0.727273" }),
        createElement(Path, { d: "M15.8871 7.81738H18.9089V4.72729H17.6235L15.8871 7.81738Z", fill: "white" }),
        createElement(Path, { d: "M4.36365 4.72729V7.81738H12.3016L14.0155 4.72729H4.36365Z", fill: "white" }),
        createElement(Path, { d: "M4.36365 10.4438V13.5339H9.12193L10.8358 10.4438H4.36365Z", fill: "white" }),
        createElement(Path, { d: "M18.9091 13.5339V10.4438H14.444L12.7301 13.5339H18.9091Z", fill: "white" }),
        createElement(Path, { d: "M4.36365 16.1826V19.2727H5.94222L7.65611 16.1826H4.36365Z", fill: "white" }),
        createElement(Path, { d: "M18.909 19.2727V16.1826H11.2416L9.52771 19.2727H18.909Z", fill: "white" }),
        createElement(
            Defs,
            null,
            createElement(
                LinearGradient,
                { id: "paint0_linear_2032_692", x1: "12", y1: "0", x2: "12", y2: "24", gradientUnits: "userSpaceOnUse" },
                createElement(Stop, { stopColor: "#4015FF" }),
                createElement(Stop, { offset: "1", stopColor: "#A08BFF" })
            ),
            createElement(
                LinearGradient,
                { id: "paint1_linear_2032_692", x1: "12", y1: "0", x2: "12", y2: "24", gradientUnits: "userSpaceOnUse" },
                createElement(Stop, { stopColor: "#483A87" }),
                createElement(Stop, { offset: "1", stopColor: "#7559F2" })
            )
        )
    );
}
registerBlockCategory('shapeblock', 'ShapeBlock', catIcon);

const disableBlockLinks = () => {
    const selector = '.shapeblock-block a';

    const processDocument = (doc) => {
        if (!doc) return;

        // Block click events in the capture phase
        if (!doc._shapeblockLinkBlockerBound) {
            doc.addEventListener('click', (e) => {
                const link = e.target.closest(selector);
                if (link) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
            doc._shapeblockLinkBlockerBound = true;
        }

        // Remove href attributes to avoid navigation and hover effects
        doc.querySelectorAll(selector).forEach(link => {
            if (link.hasAttribute('href')) {
                link.removeAttribute('href');
            }
        });
    };

    // Run on the main document
    processDocument(document);

    // Run on all found iframes (Canvas mode handles blocks in an iframe)
    document.querySelectorAll('iframe').forEach(iframe => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                processDocument(iframeDoc);
            }
        } catch (e) {
            // Ignore potential cross-origin access errors from other plugins/iframes
        }
    });
};

// Run periodically to catch dynamically rendered content (ServerSideRender)
setInterval(disableBlockLinks, 1000);

