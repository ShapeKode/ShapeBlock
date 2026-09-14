import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { ServerSideRender } from '@wordpress/server-side-render';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	TextControl,
	BoxControl,
	Button,
	TabPanel,
} from '@wordpress/components';

import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';

import { initComparison } from './comparison';

import './editor.scss';

// Map a base attribute name to its per-device key (desktop uses the base name).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, orientation, offset } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-cmp-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	// Editor preview: the front-end view.js doesn't run inside ServerSideRender,
	// so initialise the slider here. A MutationObserver re-inits whenever the SSR
	// markup is replaced (e.g. when images / offset / orientation change).
	const previewRef = useRef(null);
	useEffect(() => {
		const root = previewRef.current;
		if (!root) return undefined;
		let timer;
		const run = () => {
			const c = root.querySelector('.shapeblock-comparison-container');
			if (c) {
				delete c.dataset.shapeblockCmpInit;
				initComparison(c);
			}
		};
		const schedule = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(run, 80);
		};
		const mo = new MutationObserver(schedule);
		mo.observe(root, { childList: true, subtree: true });
		schedule();
		return () => {
			mo.disconnect();
			window.clearTimeout(timer);
		};
	}, []);

	const imageControl = (label, key) => (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={(media) => setAttributes({ [key]: { id: media.id, url: media.url, alt: media.alt } })}
				allowedTypes={['image']}
				value={attributes[key]?.id}
				render={({ open }) => (
					<div style={{ marginBottom: '12px' }}>
						<div style={{ marginBottom: '6px', fontWeight: 500 }}>{label}</div>
						{attributes[key]?.url && <img src={attributes[key].url} alt="" style={{ maxWidth: '100%', marginBottom: '6px' }} />}
						<Button variant="secondary" size="small" onClick={open}>{attributes[key]?.url ? __('Replace', 'shapeblock') : __('Select Image', 'shapeblock')}</Button>
					</div>
				)}
			/>
		</MediaUploadCheck>
	);

	// Responsive number control — a device switcher above the control, editing
	// the matching per-device attribute (base / baseTablet / baseMobile).
	const respNum = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(base, device);
				return <TextControl type="number" value={attributes[k]} onChange={(v) => setAttributes({ [k]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
			}}
		</ResponsiveWrapper>
	);

	// --- Tab 1: Settings (content & behavior) ---------------------------------
	const settingsTab = (
		<PanelBody title={__('Images', 'shapeblock')} initialOpen={true}>
			{imageControl(__('Before Image', 'shapeblock'), 'beforeImage')}
			{imageControl(__('After Image', 'shapeblock'), 'afterImage')}
			<SelectControl
				label={__('Layout', 'shapeblock')}
				value={orientation}
				options={[
					{ label: __('Horizontal', 'shapeblock'), value: 'horizontal' },
					{ label: __('Vertical', 'shapeblock'), value: 'vertical' },
				]}
				onChange={(v) => setAttributes({ orientation: v })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<RangeControl
				label={__('Default Offset (%)', 'shapeblock')}
				value={offset}
				onChange={(v) => setAttributes({ offset: v })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	// --- Tab 2: Layout (size) -------------------------------------------------
	const layoutTab = (
		<PanelBody title={__('Size', 'shapeblock')} initialOpen={true}>
			{respNum(__('Height (px)', 'shapeblock'), 'height')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<PanelBody title={__('Container', 'shapeblock')} initialOpen={true}>
			<BoxControl label={__('Container Radius', 'shapeblock')} values={attributes.containerRadius} onChange={(v) => setAttributes({ containerRadius: v })} />
		</PanelBody>
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
					]}
				>
					{(tab) => (
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						styleTab
					)}
				</TabPanel>
			</InspectorControls>

			<div ref={previewRef}>
				<ServerSideRender block="shapeblock/image-comparison" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
