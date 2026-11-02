import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl, RangeControl, BoxControl, Button, TabPanel } from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import TypographyControls from '../../custom-components/TypographyControls';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import SpacingControl from '../../custom-components/SpacingControl';
import AdvancedControls from '../../custom-components/AdvancedControls';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. heightTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

import './editor.scss';

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_CARET = SVG('M7 10l5 5 5-5z');

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, locations, mapLook, clickToLoad, listPosition, showDirections } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-gm-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const places = Array.isArray(locations) ? locations : [];
	// Which place is expanded in the sidebar (the first, while there is only one).
	const [openIndex, setOpenIndex] = useState(0);
	const updatePlace = (i, key, val) => setAttributes({ locations: places.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addPlace = () => {
		setAttributes({ locations: [...places, { title: '', address: '', details: '', phone: '' }] });
		setOpenIndex(places.length);
	};
	const movePlace = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= places.length) return;
		const next = places.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ locations: next });
	};

	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <SpacingControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	// A size per device, typed with its unit (render.php adds px to a bare number).
	const respSize = (label, base, help) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TextControl value={attributes[getKey(base, device)] || ''} placeholder="e.g. 400px" help={help} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />}
		</ResponsiveWrapper>
	);
	const text = (label, key, placeholder, help) => <TextControl label={label} value={attributes[key] || ''} placeholder={placeholder} help={help} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	const hasList = listPosition !== 'none';
	const beside = listPosition === 'left' || listPosition === 'right' || listPosition === 'overlay';

	// --- Tab 1: Settings (content / behavior) ---------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Places', 'shapeblock')} initialOpen={true}>
				{places.map((place, index) => (
					<div className="shapeblock-gm-repeater-item" key={index}>
						<div className="shapeblock-gm-repeater-head">
							<button type="button" className="shapeblock-gm-repeater-toggle" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
								<strong>{place.title || place.address || sprintf(__('Place %d', 'shapeblock'), index + 1)}</strong>
								<span className="shapeblock-gm-caret" style={{ transform: openIndex === index ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
							</button>
						</div>
						{openIndex === index && (
							<div className="shapeblock-gm-repeater-body">
								<TextControl label={__('Address', 'shapeblock')} help={__('A street address, a place name, or coordinates such as 40.7580, -73.9855.', 'shapeblock')} value={place.address || ''} onChange={(v) => updatePlace(index, 'address', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<TextControl label={__('Name', 'shapeblock')} value={place.title || ''} placeholder={__('e.g. Downtown Office', 'shapeblock')} onChange={(v) => updatePlace(index, 'title', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<TextControl label={__('Details', 'shapeblock')} value={place.details || ''} placeholder={__('e.g. Open daily, 8am to 6pm', 'shapeblock')} onChange={(v) => updatePlace(index, 'details', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<TextControl label={__('Phone', 'shapeblock')} type="tel" value={place.phone || ''} onChange={(v) => updatePlace(index, 'phone', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
								<div className="shapeblock-gm-repeater-actions">
									<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => movePlace(index, -1)} disabled={index === 0} size="small" />
									<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => movePlace(index, 1)} disabled={index === places.length - 1} size="small" />
									<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => setAttributes({ locations: places.filter((_, idx) => idx !== index) })} disabled={places.length === 1} isDestructive size="small" />
								</div>
							</div>
						)}
					</div>
				))}
				<Button variant="primary" onClick={addPlace} icon={ICON_ADD}>{__('Add Place', 'shapeblock')}</Button>
				{places.length > 1 && <p className="components-base-control__help">{__('On the page, clicking a place in the list shows it on the map.', 'shapeblock')}</p>}
			</PanelBody>

			<PanelBody title={__('Map', 'shapeblock')} initialOpen={false}>
				<RangeControl label={__('Zoom', 'shapeblock')} value={attributes.zoom} min={1} max={21} help={__('1 shows the world, 15 a few streets, 20 a single building.', 'shapeblock')} onChange={(v) => setAttributes({ zoom: v || 15 })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl label={__('Map Type', 'shapeblock')} value={attributes.mapType} options={[{ label: __('Road Map', 'shapeblock'), value: 'roadmap' }, { label: __('Satellite', 'shapeblock'), value: 'satellite' }]} onChange={(v) => setAttributes({ mapType: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				<SelectControl label={__('Look', 'shapeblock')} value={mapLook} options={[{ label: __('Standard', 'shapeblock'), value: 'standard' }, { label: __('Gray', 'shapeblock'), value: 'gray' }, { label: __('Dark', 'shapeblock'), value: 'dark' }, { label: __('Warm', 'shapeblock'), value: 'warm' }, { label: __('Soft', 'shapeblock'), value: 'soft' }]} onChange={(v) => setAttributes({ mapLook: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{mapLook !== 'standard' && <ToggleControl label={__('Full Color on Hover', 'shapeblock')} checked={!!attributes.colorOnHover} onChange={(v) => setAttributes({ colorOnHover: v })} __nextHasNoMarginBottom />}
				<ToggleControl label={__('Load on Click', 'shapeblock')} help={__('Nothing is loaded from Google until the visitor clicks the button. Good for privacy and page speed.', 'shapeblock')} checked={!!clickToLoad} onChange={(v) => setAttributes({ clickToLoad: v })} __nextHasNoMarginBottom />
				{clickToLoad && text(__('Button Text', 'shapeblock'), 'loadLabel', __('Show the Map', 'shapeblock'))}
			</PanelBody>

			<PanelBody title={__('Place List', 'shapeblock')} initialOpen={false}>
				<SelectControl label={__('Show the List', 'shapeblock')} value={listPosition} options={[{ label: __('Left of the Map', 'shapeblock'), value: 'left' }, { label: __('Right of the Map', 'shapeblock'), value: 'right' }, { label: __('Under the Map', 'shapeblock'), value: 'below' }, { label: __('On a Card over the Map', 'shapeblock'), value: 'overlay' }, { label: __('Hide', 'shapeblock'), value: 'none' }]} onChange={(v) => setAttributes({ listPosition: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				{hasList && (
					<>
						<SelectControl label={__('Name HTML Tag', 'shapeblock')} value={attributes.titleTag} options={['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].map((t) => ({ label: t.toUpperCase(), value: t }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						<ToggleControl label={__('Directions Link', 'shapeblock')} help={__('Opens Google Maps with the route to the place.', 'shapeblock')} checked={showDirections !== false} onChange={(v) => setAttributes({ showDirections: v })} __nextHasNoMarginBottom />
						{showDirections !== false && text(__('Link Text', 'shapeblock'), 'directionsLabel', __('Get Directions', 'shapeblock'))}
					</>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout (size & spacing) ---------------------------------------
	const layoutTab = (
		<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
			{respSize(__('Map Height', 'shapeblock'), 'height', __('Empty: 460px, 340px on phones.', 'shapeblock'))}
			{beside && respSize(__('List Width', 'shapeblock'), 'listWidth', __('Empty: 340px. In a narrow space the list goes under the map.', 'shapeblock'))}
			{hasList && listPosition !== 'overlay' && respSize(__('Space Between Map and List', 'shapeblock'), 'gap')}
			{hasList && respSize(__('Space Between Places', 'shapeblock'), 'itemGap')}
		</PanelBody>
	);

	// --- Tab 3: Style (appearance) --------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Map', 'shapeblock')} initialOpen={true}>
				<BorderControl label={__('Border', 'shapeblock')} value={attributes.mapBorder} onChange={(v) => setAttributes({ mapBorder: v })} />
				<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.mapRadius} onChange={(v) => setAttributes({ mapRadius: v })} />
				<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.mapShadow} onChange={(v) => setAttributes({ mapShadow: v })} />
			</PanelBody>
			{hasList && (
				<>
					<PanelBody title={__('Place', 'shapeblock')} initialOpen={false}>
						{color(__('Background', 'shapeblock'), 'itemBg')}
						{color(__('Chosen Place Background', 'shapeblock'), 'itemActiveBg')}
						{color(__('Chosen Place Line', 'shapeblock'), 'activeColor')}
						{listPosition === 'overlay' && color(__('Card Background', 'shapeblock'), 'cardBg')}
						{respBox(__('Padding', 'shapeblock'), 'itemPadding')}
						<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.itemRadius} onChange={(v) => setAttributes({ itemRadius: v })} />
					</PanelBody>
					<PanelBody title={__('Name', 'shapeblock')} initialOpen={false}>
						{color(__('Color', 'shapeblock'), 'titleColor')}
						{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
					</PanelBody>
					<PanelBody title={__('Text', 'shapeblock')} initialOpen={false}>
						{color(__('Color', 'shapeblock'), 'textColor')}
						{color(__('Link Color', 'shapeblock'), 'linkColor')}
						{respTypo(__('Typography', 'shapeblock'), 'textTypography')}
					</PanelBody>
				</>
			)}
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

			<ServerSideRender block="shapeblock/google-map" attributes={attributes} httpMethod="POST" />
		</div>
	);
}
