import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { ServerSideRender } from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls, BlockControls, AlignmentControl } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	TabPanel,
	ToolbarDropdownMenu,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import './editor.scss';

const ALIGN3 = [
	{ label: __('Start', 'shapeblock'), value: 'flex-start' },
	{ label: __('Center', 'shapeblock'), value: 'center' },
	{ label: __('End', 'shapeblock'), value: 'flex-end' },
];

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, iconEnable, title, titlePosition } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-cnt-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Current preview device, so the toolbar alignment edits the matching
	// per-device attribute (wrapAlign / wrapAlignTablet / wrapAlignMobile).
	const device = useSelect((select) => {
		const editor = select('core/editor');
		if (editor && typeof editor.getDeviceType === 'function') return editor.getDeviceType();
		const editPost = select('core/edit-post');
		if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
		return 'Desktop';
	}, []);
	const dev = device ? device.toLowerCase() : 'desktop';
	const alignKey = dev === 'desktop' ? 'wrapAlign' : `wrapAlign${dev.charAt(0).toUpperCase() + dev.slice(1)}`;
	// wrapAlign stores CSS align-items values; map them to/from AlignmentControl's left/center/right.
	const STORED_TO_ALIGN = { start: 'left', center: 'center', end: 'right' };
	const ALIGN_TO_STORED = { left: 'start', center: 'center', right: 'end' };

	// Editor preview: mirror the front-end counter. The animation lives in
	// view.js (viewScript), which does not load inside the editor, so we replay
	// it here — and, like the front end, only when the number scrolls into view
	// (via IntersectionObserver) rather than immediately on render.
	const blockRef = useRef(null);
	const lastSigRef = useRef('');

	useEffect(() => {
		const root = blockRef.current;
		if (!root) {
			return undefined;
		}

		const SEPARATORS = { comma: ',', dot: '.', space: ' ', underline: '_' };
		const formatNum = (num, sep) => {
			const str = num.toString();
			if (!sep) {
				return str;
			}
			const negative = str.charAt(0) === '-';
			const body = negative ? str.slice(1) : str;
			if (body.length < 4) {
				return str;
			}
			return (negative ? '-' : '') + body.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
		};

		let io = null;

		const setup = () => {
			const el = root.querySelector('.shapeblock-counter');
			if (!el) {
				return;
			}
			const target = parseInt(el.dataset.count, 10) || 0;
			const start = parseInt(el.dataset.start, 10) || 0;
			const duration = parseInt(el.dataset.duration, 10) || 1000;
			const sep = SEPARATORS[el.dataset.format] || '';
			const sig = [el.dataset.count, el.dataset.start, el.dataset.duration, el.dataset.format, el.dataset.animation].join('|');

			// Already wired this exact element/config (avoids reacting to our own text updates).
			if (el.dataset.shapeblockSig === sig) {
				return;
			}
			el.dataset.shapeblockSig = sig;

			// Non-count re-renders (e.g. colour tweaks) just show the final value.
			if (sig === lastSigRef.current) {
				el.textContent = formatNum(target, sep);
				return;
			}
			lastSigRef.current = sig;

			const animationType = el.dataset.animation || 'counter';

			// Normal count-up animation.
			const runCounter = () => {
				const startTime = performance.now();
				const tick = (time) => {
					const progress = Math.min((time - startTime) / duration, 1);
					el.textContent = formatNum(Math.floor(start + (target - start) * progress), sep);
					if (progress < 1) {
						requestAnimationFrame(tick);
					}
				};
				requestAnimationFrame(tick);
			};

			// Odometer (rolling digits) animation — mirrors view.js.
			const runOdometer = () => {
				const doc = el.ownerDocument;
				const targetStr = Math.floor(Math.abs(target)).toString();
				el.innerHTML = '';
				el.classList.add('shapeblock-cnt-odometer-wrap');
				if (target < 0) {
					const s = doc.createElement('span');
					s.className = 'shapeblock-cnt-odometer-sep';
					s.textContent = '-';
					el.appendChild(s);
				}
				const rolls = [];
				let digitIndex = 0;
				for (let i = 0; i < targetStr.length; i++) {
					const posFromRight = targetStr.length - i;
					if (i > 0 && sep && posFromRight % 3 === 0) {
						const sepEl = doc.createElement('span');
						sepEl.className = 'shapeblock-cnt-odometer-sep';
						sepEl.textContent = sep;
						el.appendChild(sepEl);
					}
					const col = doc.createElement('span');
					col.className = 'shapeblock-cnt-odometer-digit';
					const roll = doc.createElement('span');
					roll.className = 'shapeblock-cnt-odometer-roll';
					const spins = 2 + digitIndex;
					let html = '';
					for (let sp = 0; sp < spins; sp++) {
						for (let n = 0; n <= 9; n++) {
							html += '<span class="shapeblock-cnt-odometer-num">' + n + '</span>';
						}
					}
					html += '<span class="shapeblock-cnt-odometer-num">' + targetStr.charAt(i) + '</span>';
					roll.innerHTML = html;
					roll.style.transform = 'translateY(0)';
					col.appendChild(roll);
					el.appendChild(col);
					rolls.push({ roll, spins });
					digitIndex++;
				}
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						rolls.forEach((item) => {
							item.roll.style.transition = 'transform ' + duration + 'ms cubic-bezier(.22,.85,.34,1)';
							item.roll.style.transform = 'translateY(-' + item.spins * 10 + 'em)';
						});
					});
				});
			};

			const animate = () => {
				if (animationType === 'odometer') {
					runOdometer();
				} else {
					runCounter();
				}
			};

			// Start from the initial value (count mode), then animate when scrolled into view.
			if (animationType !== 'odometer') {
				el.textContent = formatNum(start, sep);
			}

			if (io) {
				io.disconnect();
			}
			// Use the counter's own window so the observer tracks the editor
			// canvas iframe's scroll, not the outer document.
			const view = el.ownerDocument.defaultView || window;
			const IO = view.IntersectionObserver || window.IntersectionObserver;
			if (IO) {
				io = new IO(
					(entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								io.unobserve(entry.target);
								animate();
							}
						});
					},
					{ threshold: 0.2 }
				);
				io.observe(el);
			} else {
				animate();
			}
		};

		const mo = new MutationObserver(setup);
		mo.observe(root, { childList: true, subtree: true });
		setup();

		return () => {
			mo.disconnect();
			if (io) {
				io.disconnect();
			}
		};
	}, []);

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const typo = (label, key) => <TypographyControls label={label} attributes={attributes} setAttributes={setAttributes} attributeKey={key} />;
	const border = (label, key) => <BorderControl label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const shadow = (label, key) => <BoxShadowControls label={label} value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const box = (label, key) => <BoxControl label={label} values={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	const tshadow = (label, key) => {
		const v = attributes[key] || {};
		const set = (patch) => setAttributes({ [key]: { ...v, ...patch } });
		return (
			<div style={{ marginBottom: '12px' }}>
				<strong style={{ display: 'block', marginBottom: '6px' }}>{label}</strong>
				<TextControl label={__('Offset X', 'shapeblock')} type="number" value={v.x ?? ''} onChange={(x) => set({ x })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Offset Y', 'shapeblock')} type="number" value={v.y ?? ''} onChange={(y) => set({ y })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<TextControl label={__('Blur', 'shapeblock')} type="number" value={v.blur ?? ''} onChange={(blur) => set({ blur })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<ColorPopover label={__('Shadow Color', 'shapeblock')} color={v.color} onChange={(c) => set({ color: c })} />
			</div>
		);
	};

	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <BoxControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
	const respAlign = (label, base, options) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <SelectControl value={attributes[k]} options={options} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Counter', 'shapeblock')} initialOpen={true}>
			{num(__('Ending Number', 'shapeblock'), 'number')}
			{num(__('Starting Number', 'shapeblock'), 'startNumber')}
			<TextControl label={__('Number Prefix', 'shapeblock')} value={attributes.prefix} onChange={(v) => setAttributes({ prefix: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<TextControl label={__('Number Suffix', 'shapeblock')} value={attributes.suffix} onChange={(v) => setAttributes({ suffix: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			{num(__('Animation Duration (ms)', 'shapeblock'), 'duration')}
			<SelectControl
				label={__('Separator', 'shapeblock')}
				value={attributes.format}
				options={[
					{ label: __('Default', 'shapeblock'), value: 'default' },
					{ label: __('Comma', 'shapeblock'), value: 'comma' },
					{ label: __('Dot', 'shapeblock'), value: 'dot' },
					{ label: __('Space', 'shapeblock'), value: 'space' },
					{ label: __('Underline', 'shapeblock'), value: 'underline' },
				]}
				onChange={(v) => setAttributes({ format: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={__('Animation Style', 'shapeblock')}
				value={attributes.animationType}
				options={[
					{ label: __('Normal', 'shapeblock'), value: 'counter' },
					{ label: __('Odometer', 'shapeblock'), value: 'odometer' },
				]}
				onChange={(v) => setAttributes({ animationType: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<Divider />
			<ToggleControl label={__('Show Icon', 'shapeblock')} checked={iconEnable} onChange={(v) => setAttributes({ iconEnable: v })} __nextHasNoMarginBottom />
			{iconEnable && <IconPicker label={__('Icon', 'shapeblock')} value={attributes.icon} onChange={(v) => setAttributes({ icon: v })} />}
			<Divider />
			<TextControl label={__('Title', 'shapeblock')} value={title} onChange={(v) => setAttributes({ title: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			<SelectControl label={__('Title Tag', 'shapeblock')} value={attributes.titleTag} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
		</PanelBody>
	);

	// --- Tab 2: Layout (structure & spacing) ----------------------------------
	const layoutTab = (
		<PanelBody title={__('Positioning', 'shapeblock')} initialOpen={true}>
			{title !== '' && (
				<SelectControl
					label={__('Title Position', 'shapeblock')}
					value={titlePosition}
					options={[
						{ label: __('Top', 'shapeblock'), value: 'top' },
						{ label: __('Bottom', 'shapeblock'), value: 'bottom' },
						{ label: __('Left', 'shapeblock'), value: 'left' },
						{ label: __('Right', 'shapeblock'), value: 'right' },
					]}
					onChange={(v) => setAttributes({ titlePosition: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			)}
			{respNum(__('Content Gap (px)', 'shapeblock'), 'contentGap')}
			{title !== '' && (titlePosition === 'left' || titlePosition === 'right') && (
				respAlign(__('Content Vertical Align', 'shapeblock'), 'contentVerticalAlign', [{ label: __('Default', 'shapeblock'), value: '' }, ...ALIGN3])
			)}
			{respNum(__('Prefix/Suffix Gap (px)', 'shapeblock'), 'subPreGap')}
			<Divider />
			{iconEnable && (
				<SelectControl
					label={__('Icon Position', 'shapeblock')}
					value={attributes.iconPosition}
					options={[
						{ label: __('Left', 'shapeblock'), value: 'left' },
						{ label: __('Top', 'shapeblock'), value: 'top' },
						{ label: __('Bottom', 'shapeblock'), value: 'bottom' },
						{ label: __('Right', 'shapeblock'), value: 'right' },
					]}
					onChange={(v) => setAttributes({ iconPosition: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			)}
			{iconEnable && respNum(__('Icon Gap (px)', 'shapeblock'), 'iconGap')}
			{respAlign(__('Box Align (align-items)', 'shapeblock'), 'wrapAlign', [{ label: __('Default', 'shapeblock'), value: '' }, { label: __('Start', 'shapeblock'), value: 'start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('End', 'shapeblock'), value: 'end' }])}
			<SelectControl label={__('Box Justify (justify-content)', 'shapeblock')} value={attributes.wrapJustify} options={[{ label: __('Default', 'shapeblock'), value: '' }, { label: __('Start', 'shapeblock'), value: 'flex-start' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('End', 'shapeblock'), value: 'flex-end' }, { label: __('Space Between', 'shapeblock'), value: 'space-between' }]} onChange={(v) => setAttributes({ wrapJustify: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Number', 'shapeblock')} initialOpen={true}>
				{color(__('Color', 'shapeblock'), 'numberColor')}
				{respTypo(__('Typography', 'shapeblock'), 'numberTypography')}
				{respNum(__('Stroke Width (px)', 'shapeblock'), 'numberStrokeWidth')}
				{color(__('Stroke Color', 'shapeblock'), 'numberStrokeColor')}
				{tshadow(__('Text Shadow', 'shapeblock'), 'numberTextShadow')}
			</PanelBody>

			{attributes.prefix !== '' && (
				<PanelBody title={__('Prefix', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'prefixColor')}
					{respTypo(__('Typography', 'shapeblock'), 'prefixTypography')}
					{tshadow(__('Text Shadow', 'shapeblock'), 'prefixTextShadow')}
				</PanelBody>
			)}

			{attributes.suffix !== '' && (
				<PanelBody title={__('Suffix', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'suffixColor')}
					{respTypo(__('Typography', 'shapeblock'), 'suffixTypography')}
					{tshadow(__('Text Shadow', 'shapeblock'), 'suffixTextShadow')}
				</PanelBody>
			)}

			{title !== '' && (
				<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'titleColor')}
					{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
					{respAlign(__('Text Alignment', 'shapeblock'), 'titleAlign', [{ label: __('Default', 'shapeblock'), value: '' }, { label: __('Left', 'shapeblock'), value: 'left' }, { label: __('Center', 'shapeblock'), value: 'center' }, { label: __('Right', 'shapeblock'), value: 'right' }, { label: __('Justify', 'shapeblock'), value: 'justify' }])}
					{tshadow(__('Text Shadow', 'shapeblock'), 'titleTextShadow')}
				</PanelBody>
			)}

			{iconEnable && (
				<PanelBody title={__('Icon', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'iconColor')}
					{color(__('Background', 'shapeblock'), 'iconBgColor')}
					{num(__('Box Size (px)', 'shapeblock'), 'iconBoxSize')}
					{num(__('Icon Size (px)', 'shapeblock'), 'iconSize')}
					{box(__('Border Radius', 'shapeblock'), 'iconBorderRadius')}
					{respBox(__('Padding', 'shapeblock'), 'iconPadding')}
					{border(__('Border', 'shapeblock'), 'iconBorder')}
					{shadow(__('Box Shadow', 'shapeblock'), 'iconBoxShadow')}
				</PanelBody>
			)}
		</>
	);

	return (
		<div {...useBlockProps({ ref: blockRef })}>
			<BlockControls>
				<AlignmentControl
					value={STORED_TO_ALIGN[attributes[alignKey]]}
					onChange={(value) => setAttributes({ [alignKey]: value ? ALIGN_TO_STORED[value] : '' })}
				/>
				<ToolbarDropdownMenu
					icon="heading"
					label={__('Title HTML Tag', 'shapeblock')}
					text={(attributes.titleTag || 'span').toUpperCase()}
					controls={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((t) => ({
						title: t.toUpperCase(),
						isActive: attributes.titleTag === t,
						onClick: () => setAttributes({ titleTag: t }),
					}))}
				/>
			</BlockControls>
			<InspectorControls>
				<TabPanel
					className="shapeblock-inspector-tabs"
					activeClass="is-active"
					tabs={[
						{ name: 'settings', title: __('Settings', 'shapeblock') },
						{ name: 'layout', title: __('Layout', 'shapeblock') },
						{ name: 'style', title: __('Style', 'shapeblock') },
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<ServerSideRender block="shapeblock/counter" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
