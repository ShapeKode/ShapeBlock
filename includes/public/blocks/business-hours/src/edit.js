import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';
import ServerSideRender from '../../custom-components/ServerRender';
import useInlineText from '../../custom-components/useInlineText';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	TextControl,
	TextareaControl,
	SelectControl,
	RangeControl,
	Button,
	TabPanel,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalDivider as Divider,
	BoxControl,
} from '@wordpress/components';

import ColorPopover from '../../custom-components/ColorPopover';
import BackgroundControl from '../../custom-components/BackgroundControl';
import BorderControl from '../../custom-components/BorderControl';
import BoxShadowControls from '../../custom-components/BoxShadowControls';
import SpacingControl from '../../custom-components/SpacingControl';
import TypographyControls from '../../custom-components/TypographyControls';
import ResponsiveWrapper from '../../custom-components/ResponsiveWrapper';
import AdvancedControls from '../../custom-components/AdvancedControls';

import './editor.scss';

// Desktop keeps the base key; tablet / mobile append a suffix (e.g. rowGapTablet).
const getKey = (base, device) =>
	device === 'desktop' ? base : `${base}${device.charAt(0).toUpperCase() + device.slice(1)}`;

const SVG = (path) => (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d={path} fill="currentColor" />
	</svg>
);
const ICON_UP = SVG('M12 6.6l-6 6 1.4 1.4 4.6-4.6 4.6 4.6 1.4-1.4z');
const ICON_DOWN = SVG('M12 15.4l6-6-1.4-1.4-4.6 4.6-4.6-4.6-1.4 1.4z');
const ICON_TRASH = SVG('M9 3v1H4v2h16V4h-5V3H9zM6 7l1 13h10l1-13H6zm4 2h1v9h-1V9zm3 0h1v9h-1V9z');
const ICON_ADD = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const ICON_COPY = SVG('M5 4h10v2H7v10H5V4zM9 8h10v12H9V8zm2 2v8h6v-8h-6z');
const ICON_CARET = SVG('M7 10l5 5 5-5z');

const WEEKDAYS = [
	{ value: '', label: __('None (not a weekday)', 'shapeblock') },
	{ value: '1', label: __('Monday', 'shapeblock') },
	{ value: '2', label: __('Tuesday', 'shapeblock') },
	{ value: '3', label: __('Wednesday', 'shapeblock') },
	{ value: '4', label: __('Thursday', 'shapeblock') },
	{ value: '5', label: __('Friday', 'shapeblock') },
	{ value: '6', label: __('Saturday', 'shapeblock') },
	{ value: '0', label: __('Sunday', 'shapeblock') },
];
const MODES = [
	{ value: 'hours', label: __('Open from - to', 'shapeblock') },
	{ value: 'closed', label: __('Closed', 'shapeblock') },
	{ value: 'allday', label: __('Open 24 hours', 'shapeblock') },
	{ value: 'text', label: __('Custom text', 'shapeblock') },
];
const STATUS_TABS = [
	{ name: 'open', title: __('Open', 'shapeblock'), className: 'shapeblock-tab-normal' },
	{ name: 'closed', title: __('Closed', 'shapeblock'), className: 'shapeblock-tab-hover' },
];

// "9am", "9:30 AM", "21:00", "9.30 pm" -> "HH:MM", or null.
const readClock = (text) => {
	const m = text.trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
	if (!m) return null;
	let h = Number(m[1]);
	const min = Number(m[2] || 0);
	if (m[3]) {
		if (h < 1 || h > 12) return null;
		h = (h % 12) + (m[3].startsWith('p') ? 12 : 0);
	}
	if (h > 23 || min > 59) return null;
	return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
};
// What was typed in a row's time, as that row's settings.
const readHours = (value, attributes) => {
	const text = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
	const same = (label, fallback) => text.toLowerCase() === String(label || fallback).trim().toLowerCase();
	if (same(attributes.closedLabel, 'Closed')) return { mode: 'closed' };
	if (same(attributes.allDayLabel, 'Open 24 hours')) return { mode: 'allday' };
	const parts = text.split(/\s*(?:\u2013|\u2014|-|\bto\b|\buntil\b|\btill\b)\s*/i).filter(Boolean);
	if (parts.length === 2) {
		const open = readClock(parts[0]);
		const close = readClock(parts[1]);
		if (open && close) return { mode: 'hours', open, close };
	}
	return { mode: 'text', note: value };
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { blockId, items, layout, leader, divider, highlightToday, showTitle, showStatus } = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: 'shapeblock-business-hours-' + clientId.slice(0, 6) });
		}
	}, [blockId, clientId, setAttributes]);

	const rows = Array.isArray(items) ? items : [];
	const [openIndex, setOpenIndex] = useState(null);
	const updateItem = (i, key, val) => setAttributes({ items: rows.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
	const addItem = () => {
		setAttributes({ items: [...rows, { day: __('Holidays', 'shapeblock'), weekday: '', open: '', close: '', mode: 'text', note: __('By appointment', 'shapeblock') }] });
		setOpenIndex(rows.length);
	};
	const removeItem = (i) => setAttributes({ items: rows.filter((_, idx) => idx !== i) });
	const duplicateItem = (i) => {
		const next = rows.slice();
		next.splice(i + 1, 0, { ...rows[i] });
		setAttributes({ items: next });
		setOpenIndex(i + 1);
	};
	const moveItem = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= rows.length) return;
		const next = rows.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ items: next });
		setOpenIndex(t);
	};

	const text = (label, key, help) => <TextControl label={label} help={help} value={attributes[key] || ''} onChange={(v) => setAttributes({ [key]: v })} __next40pxDefaultSize __nextHasNoMarginBottom />;
	const color = (label, key) => <ColorPopover label={label} color={attributes[key]} onChange={(v) => setAttributes({ [key]: v })} />;
	const bg = (label, c, g) => (
		<BackgroundControl label={label} colorValue={attributes[c]} gradientValue={attributes[g]} onColorChange={(v) => setAttributes({ [c]: v && typeof v === 'object' ? v.hex : v || '' })} onGradientChange={(v) => setAttributes({ [g]: v || '' })} />
	);
	const respTypo = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <TypographyControls attributes={attributes} setAttributes={setAttributes} attributeKey={getKey(base, device)} />}
		</ResponsiveWrapper>
	);
	const respBox = (label, base) => (
		<ResponsiveWrapper label={label}>
			{(device) => <SpacingControl values={attributes[getKey(base, device)]} onChange={(v) => setAttributes({ [getKey(base, device)]: v })} />}
		</ResponsiveWrapper>
	);
	// Responsive slider, stored as a string per device so render.php's ensure_unit() works.
	const num = (label, key, max = 100) => (
		<ResponsiveWrapper label={label}>
			{(device) => {
				const k = getKey(key, device);
				return (
					<RangeControl
						value={attributes[k] !== '' && attributes[k] != null ? Number(attributes[k]) : undefined}
						onChange={(v) => setAttributes({ [k]: v == null ? '' : String(v) })}
						min={0}
						max={max}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			}}
		</ResponsiveWrapper>
	);
	const single = (label, key, max = 100) => (
		<RangeControl
			label={label}
			value={attributes[key] !== '' && attributes[key] != null ? Number(attributes[key]) : undefined}
			onChange={(v) => setAttributes({ [key]: v == null ? '' : String(v) })}
			min={0}
			max={max}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
	const group = (label, key, options, fallback) => (
		<div className="shapeblock-caps-label">
			<ToggleGroupControl label={label} value={attributes[key] || fallback} onChange={(v) => setAttributes({ [key]: v })} isBlock __next40pxDefaultSize __nextHasNoMarginBottom>
				{options.map(([value, title]) => <ToggleGroupControlOption key={value} value={value} label={title} />)}
			</ToggleGroupControl>
		</div>
	);

	// --- Tab 1: Settings --------------------------------------------------------
	const settingsTab = (
		<>
			<PanelBody title={__('Days', 'shapeblock')} initialOpen={true}>
				{rows.map((item, index) => {
					const mode = item.mode || 'hours';
					return (
						<div className="shapeblock-bh-repeater-item" key={index}>
							<button type="button" className="shapeblock-bh-repeater-toggle" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
								<strong>{item.day || `#${index + 1}`}</strong>
								<span className="shapeblock-bh-repeater-sub">
									{mode === 'hours' ? `${item.open || '--'} - ${item.close || '--'}` : (MODES.find((m) => m.value === mode) || MODES[0]).label}
								</span>
								<span className="shapeblock-bh-caret" style={{ transform: openIndex === index ? 'rotate(180deg)' : 'none' }}>{ICON_CARET}</span>
							</button>
							{openIndex === index && (
								<div className="shapeblock-bh-repeater-body">
									<TextControl label={__('Label', 'shapeblock')} value={item.day || ''} onChange={(v) => updateItem(index, 'day', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									<SelectControl label={__('Weekday', 'shapeblock')} help={__('Used for "Today" and Open now. Pick None for rows such as holidays.', 'shapeblock')} value={item.weekday ?? ''} options={WEEKDAYS} onChange={(v) => updateItem(index, 'weekday', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									<SelectControl label={__('Hours', 'shapeblock')} value={mode} options={MODES} onChange={(v) => updateItem(index, 'mode', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									{mode === 'hours' && (
										<div className="shapeblock-bh-times">
											<TextControl type="time" label={__('Opens', 'shapeblock')} value={item.open || ''} onChange={(v) => updateItem(index, 'open', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
											<TextControl type="time" label={__('Closes', 'shapeblock')} value={item.close || ''} onChange={(v) => updateItem(index, 'close', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
										</div>
									)}
									{mode === 'hours' && item.open && item.close && item.close <= item.open && (
										<p className="shapeblock-bh-hint">{__('Closes after midnight: counted as open until then the next morning.', 'shapeblock')}</p>
									)}
									{mode === 'text' && (
										<TextControl label={__('Text', 'shapeblock')} value={item.note || ''} onChange={(v) => updateItem(index, 'note', v)} __next40pxDefaultSize __nextHasNoMarginBottom />
									)}
									<div className="shapeblock-bh-repeater-actions">
										<Button icon={ICON_UP} label={__('Move up', 'shapeblock')} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
										<Button icon={ICON_DOWN} label={__('Move down', 'shapeblock')} onClick={() => moveItem(index, 1)} disabled={index === rows.length - 1} size="small" />
										<Button icon={ICON_COPY} label={__('Duplicate', 'shapeblock')} onClick={() => duplicateItem(index)} size="small" />
										<Button icon={ICON_TRASH} label={__('Remove', 'shapeblock')} onClick={() => removeItem(index)} isDestructive size="small" />
									</div>
								</div>
							)}
						</div>
					);
				})}
				<Button variant="primary" onClick={addItem} icon={ICON_ADD}>{__('Add Row', 'shapeblock')}</Button>
			</PanelBody>

			<PanelBody title={__('Title & Status', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Title', 'shapeblock')} checked={showTitle !== false} onChange={(v) => setAttributes({ showTitle: v })} __nextHasNoMarginBottom />
				{showTitle !== false && (
					<>
						{text(__('Title Text', 'shapeblock'), 'title')}
						<SelectControl label={__('Title HTML Tag', 'shapeblock')} value={attributes.titleTag || 'h3'} options={['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].map((t) => ({ value: t, label: t.toUpperCase() }))} onChange={(v) => setAttributes({ titleTag: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
					</>
				)}
				<Divider />
				<ToggleControl label={__('Open now / Closed now Badge', 'shapeblock')} help={__('Follows the site time zone (Settings > General).', 'shapeblock')} checked={showStatus !== false} onChange={(v) => setAttributes({ showStatus: v })} __nextHasNoMarginBottom />
				{showStatus !== false && (
					<>
						{text(__('Open Text', 'shapeblock'), 'statusOpenText')}
						{text(__('Closed Text', 'shapeblock'), 'statusClosedText')}
						<ToggleControl label={__('Pulsing Dot', 'shapeblock')} checked={attributes.statusDot !== false} onChange={(v) => setAttributes({ statusDot: v })} __nextHasNoMarginBottom />
					</>
				)}
			</PanelBody>

			<PanelBody title={__('Time & Labels', 'shapeblock')} initialOpen={false}>
				{group(__('Time Format', 'shapeblock'), 'timeFormat', [['12', __('12 hour', 'shapeblock')], ['24', __('24 hour', 'shapeblock')]], '12')}
				{text(__('Between Times', 'shapeblock'), 'timeSeparator')}
				{text(__('Closed Label', 'shapeblock'), 'closedLabel')}
				{text(__('Open 24 Hours Label', 'shapeblock'), 'allDayLabel')}
				<Divider />
				<ToggleControl label={__('Highlight Today', 'shapeblock')} checked={highlightToday !== false} onChange={(v) => setAttributes({ highlightToday: v })} __nextHasNoMarginBottom />
				{highlightToday !== false && text(__('Today Label', 'shapeblock'), 'todayLabel', __('Empty: no label, only the highlight.', 'shapeblock'))}
				<Divider />
				<TextareaControl label={__('Note Below', 'shapeblock')} help={__('For example holiday hours. Empty: no note.', 'shapeblock')} value={attributes.footerNote || ''} onChange={(v) => setAttributes({ footerNote: v })} __nextHasNoMarginBottom />
			</PanelBody>
		</>
	);

	// --- Tab 2: Layout ----------------------------------------------------------
	const layoutTab = (
		<>
			<PanelBody title={__('Layout', 'shapeblock')} initialOpen={true}>
				{group(__('Rows', 'shapeblock'), 'layout', [['row', __('Side by side', 'shapeblock')], ['stacked', __('Stacked', 'shapeblock')]], 'row')}
				{layout === 'stacked' && group(__('Alignment', 'shapeblock'), 'textAlign', [['left', __('Left', 'shapeblock')], ['center', __('Center', 'shapeblock')], ['right', __('Right', 'shapeblock')]], 'left')}
				{layout !== 'stacked' && (
					<SelectControl label={__('Line Between Day and Time', 'shapeblock')} value={leader || 'none'} options={[{ value: 'none', label: __('None', 'shapeblock') }, { value: 'dotted', label: __('Dotted', 'shapeblock') }, { value: 'dashed', label: __('Dashed', 'shapeblock') }, { value: 'solid', label: __('Solid', 'shapeblock') }]} onChange={(v) => setAttributes({ leader: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
				)}
				{showStatus !== false && group(__('Badge Position', 'shapeblock'), 'statusPosition', [['below', __('Below title', 'shapeblock')], ['inline', __('Beside title', 'shapeblock')]], 'below')}
			</PanelBody>
			<PanelBody title={__('Spacing', 'shapeblock')} initialOpen={false}>
				{num(__('Space Below Title (px)', 'shapeblock'), 'titleGap')}
				{num(__('Space Between Rows (px)', 'shapeblock'), 'rowGap')}
				{num(__('Space Between Day and Time (px)', 'shapeblock'), 'columnGap')}
				{respBox(__('Row Padding', 'shapeblock'), 'rowPadding')}
			</PanelBody>
			<PanelBody title={__('Divider', 'shapeblock')} initialOpen={false}>
				<ToggleControl label={__('Line Under Each Row', 'shapeblock')} checked={divider !== false} onChange={(v) => setAttributes({ divider: v })} __nextHasNoMarginBottom />
				{divider !== false && (
					<>
						<SelectControl label={__('Style', 'shapeblock')} value={attributes.dividerStyle || 'solid'} options={[{ value: 'solid', label: __('Solid', 'shapeblock') }, { value: 'dashed', label: __('Dashed', 'shapeblock') }, { value: 'dotted', label: __('Dotted', 'shapeblock') }]} onChange={(v) => setAttributes({ dividerStyle: v })} __next40pxDefaultSize __nextHasNoMarginBottom />
						{single(__('Width (px)', 'shapeblock'), 'dividerWidth', 10)}
						{color(__('Color', 'shapeblock'), 'dividerColor')}
					</>
				)}
			</PanelBody>
		</>
	);

	// --- Tab 3: Style -------------------------------------------------------------
	const styleTab = (
		<>
			<PanelBody title={__('Box', 'shapeblock')} initialOpen={true}>
				{bg(__('Background', 'shapeblock'), 'boxBg', 'boxBgGradient')}
				{respBox(__('Padding', 'shapeblock'), 'boxPadding')}
				<BorderControl label={__('Border', 'shapeblock')} value={attributes.boxBorder} onChange={(v) => setAttributes({ boxBorder: v })} />
				<BoxControl label={__('Border Radius', 'shapeblock')} values={attributes.boxRadius} onChange={(v) => setAttributes({ boxRadius: v })} />
				<BoxShadowControls label={__('Box Shadow', 'shapeblock')} value={attributes.boxShadow} onChange={(v) => setAttributes({ boxShadow: v })} />
			</PanelBody>
			{showTitle !== false && (
				<PanelBody title={__('Title', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'titleColor')}
					{respTypo(__('Typography', 'shapeblock'), 'titleTypography')}
				</PanelBody>
			)}
			{showStatus !== false && (
				<PanelBody title={__('Badge', 'shapeblock')} initialOpen={false}>
					<TabPanel className="shapeblock-tab-panel" activeClass="is-active" tabs={STATUS_TABS}>
						{(tab) =>
							tab.name === 'closed' ? (
								<>
									{color(__('Text Color', 'shapeblock'), 'statusClosedColor')}
									{bg(__('Background', 'shapeblock'), 'statusClosedBg', 'statusClosedBgGradient')}
								</>
							) : (
								<>
									{color(__('Text Color', 'shapeblock'), 'statusOpenColor')}
									{bg(__('Background', 'shapeblock'), 'statusOpenBg', 'statusOpenBgGradient')}
								</>
							)
						}
					</TabPanel>
					{respTypo(__('Typography', 'shapeblock'), 'statusTypography')}
					{respBox(__('Padding', 'shapeblock'), 'statusPadding')}
					{single(__('Border Radius (px)', 'shapeblock'), 'statusRadius', 100)}
				</PanelBody>
			)}
			<PanelBody title={__('Rows', 'shapeblock')} initialOpen={false}>
				{bg(__('Background', 'shapeblock'), 'rowBg', 'rowBgGradient')}
				{bg(__('Every Second Row', 'shapeblock'), 'rowBgAlt', 'rowBgAltGradient')}
				{single(__('Border Radius (px)', 'shapeblock'), 'rowRadius', 50)}
				{layout !== 'stacked' && leader && leader !== 'none' && color(__('Line Color', 'shapeblock'), 'leaderColor')}
			</PanelBody>
			<PanelBody title={__('Day', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'dayColor')}
				{respTypo(__('Typography', 'shapeblock'), 'dayTypography')}
			</PanelBody>
			<PanelBody title={__('Time', 'shapeblock')} initialOpen={false}>
				{color(__('Color', 'shapeblock'), 'timeColor')}
				{color(__('Closed Color', 'shapeblock'), 'closedColor')}
				{respTypo(__('Typography', 'shapeblock'), 'timeTypography')}
			</PanelBody>
			{highlightToday !== false && (
				<PanelBody title={__('Today', 'shapeblock')} initialOpen={false}>
					{color(__('Day Color', 'shapeblock'), 'todayColor')}
					{color(__('Time Color', 'shapeblock'), 'todayTimeColor')}
					{bg(__('Row Background', 'shapeblock'), 'todayBg', 'todayBgGradient')}
					{color(__('Label Text Color', 'shapeblock'), 'todayBadgeColor')}
					{bg(__('Label Background', 'shapeblock'), 'todayBadgeBg', 'todayBadgeBgGradient')}
				</PanelBody>
			)}
			{!!attributes.footerNote && (
				<PanelBody title={__('Note', 'shapeblock')} initialOpen={false}>
					{color(__('Color', 'shapeblock'), 'noteColor')}
					{respTypo(__('Typography', 'shapeblock'), 'noteTypography')}
				</PanelBody>
			)}
		</>
	);

	// Every text on the preview is typed right there. A row's place in the list tells which day it is.
	const rowIndex = (el) => {
		const row = el.closest('li');
		return row ? Array.prototype.indexOf.call(row.parentElement.children, row) : 0;
	};
	const focusRow = useRef(null);
	const inlineRef = useInlineText([
		{ selector: '.shapeblock-bh__title', save: (i, v) => setAttributes({ title: v }) },
		{
			selector: '.shapeblock-bh__day-name',
			getIndex: rowIndex,
			save: (i, v) => updateItem(i, 'day', v),
			// Enter adds a row below, ready to type over.
			onEnter: (i, v) => {
				const next = rows.map((it, idx) => (idx === i ? { ...it, day: v } : it));
				const day = __('New row', 'shapeblock');
				next.splice(i + 1, 0, { day, weekday: '', open: '', close: '', mode: 'text', note: __('By appointment', 'shapeblock') });
				focusRow.current = { index: i + 1, text: day };
				setAttributes({ items: next });
			},
			focus: focusRow,
		},
		// The time of any row: typed clock times become that day's hours, the Closed or Open 24 hours label
		// switches the day to that, and anything else is kept as the row's own text.
		{ selector: '.shapeblock-bh__time', getIndex: rowIndex, save: (i, v) => setAttributes({ items: rows.map((it, idx) => (idx === i ? { ...it, ...readHours(v, attributes) } : it)) }) },
		{ selector: '.shapeblock-bh__status.is-open .shapeblock-bh__status-text', save: (i, v) => setAttributes({ statusOpenText: v }) },
		{ selector: '.shapeblock-bh__status.is-closed .shapeblock-bh__status-text', save: (i, v) => setAttributes({ statusClosedText: v }) },
		{ selector: '.shapeblock-bh__today', save: (i, v) => setAttributes({ todayLabel: v }) },
		{ selector: '.shapeblock-bh__note', multiline: true, save: (i, v) => setAttributes({ footerNote: v }) },
	]);
	// A clock time is set with the time fields: clicking it opens that day in the sidebar.
	const openDay = (e) => {
		const time = e.target.closest('.shapeblock-bh__row.is-hours .shapeblock-bh__time');
		if (time) {
			setOpenIndex(rowIndex(time));
		}
	};

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
					{(tab) =>
						tab.name === 'settings' ? settingsTab :
						tab.name === 'layout' ? layoutTab :
						tab.name === 'style' ? styleTab :
						<AdvancedControls attributes={attributes} setAttributes={setAttributes} />
					}
				</TabPanel>
			</InspectorControls>
			<div ref={inlineRef} onClickCapture={openDay}>
				<ServerSideRender block="shapeblock/business-hours" attributes={attributes} httpMethod="POST" />
			</div>
		</div>
	);
}
