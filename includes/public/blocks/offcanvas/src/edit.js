import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ServerSideRender from '../../custom-components/ServerRender';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BoxControl,
	Button,
	Notice,
	TabPanel,
	__experimentalDivider as Divider,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import IconPicker from '../../custom-components/IconPicker';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, offcanvasLayout, menuText } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-oc-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: the front-end view.js doesn't run inside ServerSideRender,
	// so wire up the open/close toggle here. Delegated on a persistent wrapper so
	// it survives the SSR markup being replaced.
	const previewRef = useRef(null);
	const isOpenRef = useRef(false);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;
		const doc = root.ownerDocument || document;
		// The overlay is only shown together with its own panel (as on the front end).
		const syncOverlay = (panel, on) => {
			root.querySelectorAll('.shapeblock-offcanvas-overlay').forEach((el) => {
				if (el.getAttribute('data-target') === '#' + panel.id) el.classList.toggle('shapeblock-active', on);
			});
		};
		const syncBody = () => {
			const anyOpen = !!root.querySelector('.shapeblock-offcanvas.shapeblock-active');
			doc.body.classList.toggle('shapeblock-offcanvas-active', anyOpen);
		};
		const onClick = (e) => {
			const toggle = e.target.closest('.shapeblock-offcanvas-toggle');
			if (!toggle || !root.contains(toggle)) return;
			e.preventDefault();
			e.stopPropagation();
			const target = toggle.getAttribute('data-target');
			const panel = target ? root.querySelector(target) : null;
			if (!panel) return;
			const nowOpen = !panel.classList.contains('shapeblock-active');
			panel.classList.toggle('shapeblock-active', nowOpen);
			syncOverlay(panel, nowOpen);
			isOpenRef.current = nowOpen;
			syncBody();
		};
		// After the SSR markup is swapped (e.g. when the selected template or any
		// other attribute changes), re-apply the remembered open state so the panel
		// does not snap shut on every edit.
		const applyOpenState = () => {
			const p = root.querySelector('.shapeblock-offcanvas');
			if (p) {
				p.classList.toggle('shapeblock-active', isOpenRef.current);
				syncOverlay(p, isOpenRef.current);
			}
			syncBody();
		};
		root.addEventListener('click', onClick);
		const previewObserver = new MutationObserver(applyOpenState);
		previewObserver.observe(root, { childList: true, subtree: true });
		return () => {
			root.removeEventListener('click', onClick);
			previewObserver.disconnect();
		};
	}, []);

	const [templates, setTemplates] = useState([]);
	useEffect(() => {
		apiFetch({ path: '/wp/v2/shapeblock-templates?per_page=100&status=publish&_fields=id,title' })
			.then((posts) => {
				setTemplates(
					(posts || []).map((p) => ({
						label: (p.title && p.title.rendered) || `#${p.id}`,
						value: String(p.id),
					}))
				);
			})
			.catch(() => setTemplates([]));
	}, []);

	const templateOptions = [{ label: __('— Select Template —', 'shapeblock'), value: '' }, ...templates];

	const editorData = typeof shapeblockEditor !== 'undefined' ? shapeblockEditor : {};
	const adminUrl = editorData.admin_url || '/wp-admin/';
	const newTemplateUrl = editorData.new_tpl_url || (adminUrl + 'post-new.php?post_type=shapeblock-template');
	const editTemplateUrl = attributes.contentTemplate
		? adminUrl + 'post.php?post=' + attributes.contentTemplate + '&action=edit'
		: '';

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl
			label={label}
			colorValue={attributes[c]}
			gradientValue={attributes[g]}
			onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })}
			onGradientChange={(v) => setAttributes({ [g]: v || '' })}
		/>
	);
	const num = (label, key) => <TextControl label={label} type="number" value={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	// Responsive variants — a device switcher above the control, editing the
	// matching per-device attribute (base / baseTablet / baseMobile).
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);
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

	const isClassic = offcanvasLayout === 'classic';

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Offcanvas Settings', 'shapeblock')} initialOpen={true}>
			<SelectControl
				label={__('Offcanvas Layout', 'shapeblock')}
				value={offcanvasLayout}
				options={[
					{ label: __('Classic', 'shapeblock'), value: 'classic' },
					{ label: __('Modern', 'shapeblock'), value: 'modern' },
				]}
				onChange={(v) => setAttributes({ offcanvasLayout: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<TextControl label={__('Canvas Menu Text', 'shapeblock')} value={menuText} onChange={(v) => setAttributes({ menuText: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
			{isClassic && <IconPicker label={__('Menu Icon', 'shapeblock')} value={attributes.btnIcon || ''} onChange={(v) => setAttributes({ btnIcon: v })} />}
			{!isClassic && (
				<SelectControl
					label={__('Open Position', 'shapeblock')}
					value={attributes.modernPosition || 'fade'}
					options={[
						{ label: __('Fade in place', 'shapeblock'), value: 'fade' },
						{ label: __('From left', 'shapeblock'), value: 'left' },
						{ label: __('From right', 'shapeblock'), value: 'right' },
						{ label: __('From top', 'shapeblock'), value: 'top' },
						{ label: __('From bottom', 'shapeblock'), value: 'bottom' },
					]}
					onChange={(v) => setAttributes({ modernPosition: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			)}
			{isClassic && (
				<SelectControl
					label={__('Open Position', 'shapeblock')}
					value={attributes.positionOffcanvas}
					options={[
						{ label: __('Left', 'shapeblock'), value: 'shapeblock-offcanvas-left' },
						{ label: __('Right', 'shapeblock'), value: 'shapeblock-offcanvas-right' },
					]}
					onChange={(v) => setAttributes({ positionOffcanvas: v })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			)}
			<Divider />
			<SelectControl
				label={__('Select Template', 'shapeblock')}
				value={attributes.contentTemplate}
				options={templateOptions}
				onChange={(v) => setAttributes({ contentTemplate: v })}
				help={__('Pick an ShapeBlock Template to show inside the panel.', 'shapeblock')}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
					{editTemplateUrl && (
						<Button variant="link" href={editTemplateUrl} target="_blank" rel="noopener noreferrer">
							{__('Edit Template', 'shapeblock')}
						</Button>
					)}
					<Button variant="link" href={newTemplateUrl} target="_blank" rel="noopener noreferrer">
						{__('Create New Template', 'shapeblock')}
					</Button>
				</div>
				{!templates.length && (
				<Notice status="warning" isDismissible={false}>
					{__('No templates yet. Click “Create New Template” to add one, then select it here.', 'shapeblock')}
				</Notice>
			)}
			{isClassic && <IconPicker label={__('Close Icon', 'shapeblock')} value={attributes.closeIcon || ''} onChange={(v) => setAttributes({ closeIcon: v })} />}
		</PanelBody>
	);

	// --- Tab 2: Layout (size) -------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Canvas', 'shapeblock')} initialOpen={true}>
				{isClassic && respNum(__('Canvas Width (px)', 'shapeblock'), 'offcanvasWidth')}
				{!isClassic && (
					<ResponsiveWrapper label={__('Canvas Width', 'shapeblock')}>
						{(device) => {
							const k = getKey('modernWidth', device);
							return (
								<TextControl
									value={attributes[k] || ''}
									placeholder="100%"
									help={__('Empty = full screen (100%). A number is px; 80% or 60vw also work.', 'shapeblock')}
									onChange={(v) => setAttributes({ [k]: v })}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							);
						}}
					</ResponsiveWrapper>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Opener Icon', 'shapeblock')} initialOpen={true}>
				{menuText !== '' && color(__('Text Color', 'shapeblock'), 'openerTextColor')}
				{menuText !== '' && respTypo(__('Typography', 'shapeblock'), 'openerTextTypography')}
				{isClassic
					? color(__('Hamburger Color', 'shapeblock'), 'openerIconColor')
					: color(__('Hamburger Color', 'shapeblock'), 'openerHamburgerColor')}
				{isClassic
					? num(__('Hamburger Size (px)', 'shapeblock'), 'openerIconSize')
					: num(__('Hamburger Size (px)', 'shapeblock'), 'openerIconSizeModern')}
			</PanelBody>

			<PanelBody title={__('Closing Icon', 'shapeblock')} initialOpen={false}>
				{isClassic
					? color(__('Icon Color', 'shapeblock'), 'closingIconColor')
					: color(__('Icon Color', 'shapeblock'), 'closingIconModernColor')}
				{isClassic && num(__('Icon Size (px)', 'shapeblock'), 'closingIconSize')}
			</PanelBody>

			<PanelBody title={__('Offcanvas Item', 'shapeblock')} initialOpen={false}>
				{bg(__('Background', 'shapeblock'), 'offcanvasBg', 'offcanvasBgGradient')}
				{respBox(__('Padding', 'shapeblock'), 'offcanvasPadding')}
				<ToggleControl label={__('Enable Blur', 'shapeblock')} checked={!!attributes.needBlur} onChange={(v) => setAttributes({ needBlur: v })} __nextHasNoMarginBottom />
			</PanelBody>
		</>
	);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<TabPanel
					className="shapeblock-inspector-tabs"
					activeClass="is-active"
					tabs={[
						{ name: 'settings', title: __('Settings', 'shapeblock') },
						{ name: 'layout', title: __('Layout', 'shapeblock') },
						{ name: 'style', title: __('Style', 'shapeblock') },
						{ name: 'advanced', title: __('Advanced', 'shapeblock') },
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'advanced' ? <AdvancedControls attributes={attributes} setAttributes={setAttributes} /> :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/offcanvas" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
