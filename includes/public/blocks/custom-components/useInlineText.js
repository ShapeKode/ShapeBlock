/**
 * Edit the text of a server-rendered block preview right on the canvas.
 *
 * The preview keeps every style exactly as the site shows it; the elements
 * named here become editable in place, and what is typed is saved to the
 * block's attribute when the field loses focus (the preview then redraws).
 * Enter ends a one-line field (or runs onEnter), Escape undoes, and a paste
 * comes in as text.
 *
 * @param {Array} fields Each: {
 *     selector,           every matching element is editable
 *     multiline,          Enter makes a new line instead of ending the field
 *     getIndex( el ),     which item the element is (default: its position
 *                         among the matches)
 *     save( index, value ),
 *     onEnter( index, value ), optional: what Enter does in a one-line field
 *     focus,              optional ref, { index, text }: put the cursor in that
 *                         item once the preview shows it with that text (the
 *                         old preview is redrawn once while the new one loads)
 * }
 * @return {Object} Ref for the element around the preview.
 */
import { useEffect, useRef } from '@wordpress/element';

// The field's content as the attribute keeps it: one-line text with its
// inline formatting, or text whose line breaks are newlines (the server
// turns them back into <br>).
function readValue(el, multiline) {
	let html = el.innerHTML.replace(/&nbsp;/g, ' ');
	if (multiline) {
		html = html
			.replace(/<div><br\s*\/?><\/div>/gi, '\n')
			.replace(/<div>/gi, '\n')
			.replace(/<\/div>/gi, '')
			.replace(/<br\s*\/?>\n?/gi, '\n');
	} else {
		html = html.replace(/<br\s*\/?>/gi, '');
	}
	return html.trim();
}

export default function useInlineText(fields) {
	const ref = useRef();
	const fieldsRef = useRef(fields);
	fieldsRef.current = fields;

	useEffect(() => {
		const root = ref.current;
		if (!root) {
			return undefined;
		}
		const attach = () => {
			fieldsRef.current.forEach(({ selector, multiline }, fieldIndex) => {
				root.querySelectorAll(selector).forEach((el, position) => {
					if (el.dataset.shapeblockInline) {
						return;
					}
					const field = () => fieldsRef.current[fieldIndex];
					const at = () => (field().getIndex ? field().getIndex(el) : position);
					el.dataset.shapeblockInline = '1';
					el.contentEditable = 'true';
					el.style.cursor = 'text';
					let before = el.innerHTML;
					el.addEventListener('focus', () => {
						before = el.innerHTML;
						el.style.outline = '1px dashed rgba(162, 22, 255, 0.6)';
						el.style.outlineOffset = '2px';
					});
					el.addEventListener('keydown', (e) => {
						if (e.key === 'Escape') {
							el.innerHTML = before;
							el.blur();
						} else if (e.key === 'Enter' && !multiline) {
							e.preventDefault();
							if (field().onEnter) {
								const value = readValue(el, multiline);
								before = el.innerHTML; // Saved by onEnter, not again on blur.
								field().onEnter(at(), value);
							}
							el.blur();
						}
					});
					el.addEventListener('paste', (e) => {
						e.preventDefault();
						const text = (e.clipboardData || window.clipboardData).getData('text/plain');
						el.ownerDocument.execCommand('insertText', false, text);
					});
					el.addEventListener('blur', () => {
						el.style.outline = '';
						el.style.outlineOffset = '';
						if (el.innerHTML !== before) {
							field().save(at(), readValue(el, multiline));
						}
					});
					// A field just added (Enter in the one before): cursor in, text selected.
					const focus = field().focus;
					if (focus && focus.current && focus.current.index === at() && el.textContent.trim() === focus.current.text) {
						focus.current = null;
						el.focus();
						const range = el.ownerDocument.createRange();
						range.selectNodeContents(el);
						const selection = el.ownerDocument.defaultView.getSelection();
						selection.removeAllRanges();
						selection.addRange(range);
					}
				});
			});
		};
		attach();
		// The preview is replaced whenever the block's attributes change.
		const observer = new window.MutationObserver(attach);
		observer.observe(root, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);

	return ref;
}
