import { createRoot, createElement, useState, useEffect, useCallback } from '@wordpress/element';
import { select, subscribe, dispatch } from '@wordpress/data';
import { parse } from '@wordpress/blocks';
import TemplateImporterModal from './components/editor-components/TemplateImporterModal';

const BUTTON_ID = 'shapeblock-premade-designs-btn';

let currentBlockName = null;
let currentBlockClientId = null;

/**
 * Inject the "Premade Designs" button in the editor top toolbar (always visible).
 */
function injectButton() {
    const toolbar = document.querySelector('.editor-header__toolbar');
    if ( ! toolbar ) return;

    let btn = document.getElementById( BUTTON_ID );
    if ( btn ) return; // already injected

    btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.className = 'shapeblock-premade-designs-btn components-button';
    btn.type = 'button';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 553 508" fill="none"><path d="M0 115C0 209.706 20.2941 230 115 230C209.706 230 230 209.706 230 115C230 20.2941 209.706 0 115 0C20.2941 0 0 20.2941 0 115Z" fill="currentColor"/><path d="M0 393C0 487.706 20.2855 508 114.951 508C209.617 508 230 487.804 230 393C230 298.294 209.715 278 114.951 278C20.1875 278 0 298.294 0 393Z" fill="currentColor"/><path d="M278 65.5868C278 119.599 289.574 131.173 343.587 131.173C397.6 131.173 409.174 119.599 409.174 65.5868C409.174 11.5743 397.6 0.000201185 343.587 0.000201185C289.574 -0.0557124 278 11.5184 278 65.5868Z" fill="currentColor"/><rect x="433.024" y="35.7745" width="71.5493" height="23.8497" rx="11.9249" fill="currentColor"/><rect x="433.023" y="71.5491" width="119.249" height="23.8497" rx="11.9249" fill="currentColor"/><path d="M278 254C278 308.012 289.574 319.587 343.587 319.587C397.6 319.587 409.174 308.012 409.174 254C409.174 199.987 397.6 188.413 343.587 188.413C289.574 188.357 278 199.932 278 254Z" fill="currentColor"/><rect x="433.024" y="224.188" width="71.5493" height="23.8497" rx="11.9249" fill="currentColor"/><rect x="433.023" y="259.962" width="119.249" height="23.8497" rx="11.9249" fill="currentColor"/><path d="M278 442.413C278 496.426 289.574 508 343.587 508C397.6 508 409.174 496.426 409.174 442.413C409.174 388.401 397.6 376.827 343.587 376.827C289.574 376.771 278 388.345 278 442.413Z" fill="currentColor"/><rect x="433.024" y="412.601" width="71.5493" height="23.8497" rx="11.9249" fill="currentColor"/><rect x="433.023" y="448.376" width="119.249" height="23.8497" rx="11.9249" fill="currentColor"/></svg> Premade Designs';

    btn.addEventListener('click', () => {
        openModal();
    });

    toolbar.appendChild( btn );
}

/**
 * Modal mount point and controls.
 */
let modalRoot = null;
let modalContainer = null;

function ensureModalMount() {
    if ( ! modalContainer ) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'shapeblock-template-importer-modal-root';
        document.body.appendChild( modalContainer );
        modalRoot = createRoot( modalContainer );
    }
}

function openModal() {
    ensureModalMount();

    // Pass whichever ShapeBlock block is currently selected (or null)
    const preselect = currentBlockName && currentBlockName.startsWith('shapeblock/')
        ? currentBlockName
        : null;

    modalRoot.render(
        createElement( ModalWrapper, {
            blockType: preselect,
            clientId: currentBlockClientId,
        })
    );
}

function closeModal() {
    if ( modalRoot ) {
        modalRoot.render( null );
    }
}

/**
 * Wrapper component that manages modal open/close state.
 */
function ModalWrapper({ blockType, clientId }) {
    const [ isOpen, setIsOpen ] = useState( true );

    const handleClose = useCallback(() => {
        setIsOpen( false );
        closeModal();
    }, []);

    const handleImport = useCallback(( rawContent ) => {
        // Get the latest selected block at import time
        const activeClientId = clientId || select('core/block-editor').getSelectedBlockClientId();

        if ( activeClientId ) {
            const blocks = parse( rawContent );
            if ( blocks && blocks.length > 0 ) {
                dispatch('core/block-editor').replaceBlock( activeClientId, blocks );
            }
        } else {
            // No block selected – insert at the end
            const blocks = parse( rawContent );
            if ( blocks && blocks.length > 0 ) {
                dispatch('core/block-editor').insertBlocks( blocks );
            }
        }

        setIsOpen( false );
        closeModal();
    }, [ clientId ]);

    if ( ! isOpen ) return null;

    return createElement( TemplateImporterModal, {
        isOpen,
        onClose: handleClose,
        onImport: handleImport,
        blockType,
    });
}

/**
 * Track selected block so the modal can pre-select the filter.
 */
subscribe(() => {
    const selectedBlock = select('core/block-editor').getSelectedBlock();
    if ( selectedBlock ) {
        currentBlockName = selectedBlock.name;
        currentBlockClientId = selectedBlock.clientId;
    } else {
        currentBlockName = null;
        currentBlockClientId = null;
    }
});

/**
 * Inject button once the toolbar is available.
 */
const waitForToolbar = setInterval(() => {
    const toolbar = document.querySelector('.editor-header__toolbar');
    if ( toolbar ) {
        injectButton();
        clearInterval( waitForToolbar );
    }
}, 300);
