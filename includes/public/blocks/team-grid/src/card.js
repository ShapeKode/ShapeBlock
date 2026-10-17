/**
 * The Team Member card as it shows in the editor: the same markup render.php
 * prints, with the name, designation, bio, email and phone typed in place, the
 * photo picked by clicking it, and each social icon's link and icon changed by
 * clicking the icon (the + adds one).
 */
import { __ } from '@wordpress/i18n';
import { useState, useRef } from '@wordpress/element';
import { RichText, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Popover, TextControl, Button } from '@wordpress/components';
import IconPicker from '../../custom-components/IconPicker';

const SVG = (d) => <svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d={d} /></svg>;
const LINK_SVG = SVG('M3.9 12a3 3 0 013-3h3v2H6.9a1 1 0 100 2h3v2h-3a3 3 0 01-3-3zm6 1h4v-2h-4v2zm4-4h3a3 3 0 010 6h-3v-2h3a1 1 0 100-2h-3V9z');
const PLUS_SVG = SVG('M11 5v6H5v2h6v6h2v-6h6v-2h-6V5z');
const MAIL_SVG = SVG('M3 5h18v14H3V5zm9 7L4 7v1l8 5 8-5V7l-8 5z');
const PHONE_SVG = SVG('M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.55 3.4 1 1 0 01-.24 1l-2.2 2.4z');

// The same stand-in photo render.php uses.
// Read when drawn: the editor's settings object is printed after this script.
const placeholder = () => ((window.shapeblockEditor && window.shapeblockEditor.plugin_url) || '') + 'includes/public/assets/img/placeholder.png';

const icon = (cls, fallback) => (cls && 'none' !== cls ? <i className={`shapeblock-icon ${cls}`} aria-hidden="true" /> : fallback);

// Name, designation, email and phone are plain text (render.php escapes them).
const toHtml = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toText = (html) => String(html ?? '').replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const NAME_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'];

export default function TeamCard({ attributes, setAttributes, isSelected }) {
	const { blockId, teamSkin, skin4HoverOverlay, contentShow, showSocialIcon, socialIconShow, socialHoverIcon, showContactInfo } = attributes;
	const skin = teamSkin || 'default';
	const overlay4 = skin4HoverOverlay || 'overlay1';
	const tag = NAME_TAGS.includes(attributes.titleTag) ? attributes.titleTag : 'h4';
	const links = Array.isArray(attributes.socialLinks) ? attributes.socialLinks : [];
	const [editing, setEditing] = useState(-1);
	const [anchor, setAnchor] = useState(null);
	// A click on another icon (or the +) also counts as a click outside the open
	// box, whose close then comes after the new one opened: it is ignored.
	const pressed = useRef(0);
	const press = () => { pressed.current = Date.now(); };
	const closePopover = () => { if (Date.now() - pressed.current > 400) setEditing(-1); };

	// As render.php: the round overlay keeps its icons in the circle, and the
	// default place has no hover-only showing.
	const pos = 'skin4' === skin && 'overlay2' === overlay4 ? 'default' : attributes.socialIconPosition || 'default';
	const show = 'default' === pos ? 'dafault_show' : socialIconShow || 'dafault_show';

	// While the block is selected, the empty fields show (with a hint) so they can be typed in.
	const hasSocial = showSocialIcon && (links.length > 0 || isSelected);
	const hasContact = showContactInfo && (attributes.teamEmail || attributes.teamPhone || isSelected);
	const hasDetails = !!attributes.details || isSelected;

	const set = (key) => (v) => setAttributes({ [key]: toText(v) });
	const updateLink = (i, key, val) => setAttributes({ socialLinks: links.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)) });
	const moveLink = (i, dir) => {
		const t = i + dir;
		if (t < 0 || t >= links.length) return;
		const next = links.slice();
		const [m] = next.splice(i, 1);
		next.splice(t, 0, m);
		setAttributes({ socialLinks: next });
		setEditing(t);
	};
	const removeLink = (i) => {
		setAttributes({ socialLinks: links.filter((_, idx) => idx !== i) });
		setEditing(-1);
	};
	const addLink = (e) => {
		e.preventDefault();
		setAttributes({ socialLinks: [...links, { url: '', icon: '' }] });
		setAnchor(e.currentTarget.closest('li'));
		setEditing(links.length);
	};

	const nameEl = (
		<RichText tagName={tag} className="shapeblock-name" value={toHtml(attributes.name)} onChange={set('name')} allowedFormats={[]} placeholder={__('Name', 'shapeblock')} />
	);
	const designationEl = (
		<RichText tagName="div" className="shapeblock-designation" value={toHtml(attributes.designation)} onChange={set('designation')} allowedFormats={[]} placeholder={__('Designation', 'shapeblock')} />
	);
	const detailsEl = (className) => (
		<RichText
			tagName="div"
			className={className}
			value={String(attributes.details || '').replace(/\n/g, '<br>')}
			onChange={(v) => setAttributes({ details: v })}
			allowedFormats={['core/bold', 'core/italic', 'core/link']}
			placeholder={__('Write a short bio…', 'shapeblock')}
		/>
	);

	const contact = hasContact && (
		<div className="shapeblock-contact-inner">
			{(attributes.teamEmail || isSelected) && (
				<span className="shapeblock-team-email shapeblock-contact-item">
					<span className="shapeblock-contact-icon">{icon(attributes.teamEmailIcon, MAIL_SVG)}</span>
					<RichText tagName="span" className="shapeblock-contact-text" value={toHtml(attributes.teamEmail)} onChange={set('teamEmail')} allowedFormats={[]} placeholder={__('Email address', 'shapeblock')} />
				</span>
			)}
			{(attributes.teamPhone || isSelected) && (
				<span className="shapeblock-team-phone shapeblock-contact-item">
					<span className="shapeblock-contact-icon">{icon(attributes.teamPhoneIcon, PHONE_SVG)}</span>
					<RichText tagName="span" className="shapeblock-contact-text" value={toHtml(attributes.teamPhone)} onChange={set('teamPhone')} allowedFormats={[]} placeholder={__('Phone number', 'shapeblock')} />
				</span>
			)}
		</div>
	);
	const contactBlock = hasContact && <div className="shapeblock-author-contact">{contact}</div>;

	const social = hasSocial && (
		<div className={`shapeblock-team-social ${pos} ${show}`}>
			{'hover_show' === show && socialHoverIcon && (
				<div className="shapeblock-team-social-hover">
					<a href="#shapeblock-team" onClick={(e) => e.preventDefault()}>{icon(socialHoverIcon, PLUS_SVG)}</a>
				</div>
			)}
			<ul>
				{links.map((l, i) => (
					<li key={i}>
						<a
							href="#shapeblock-team"
							className={editing === i ? 'is-editing-link' : undefined}
							aria-label={__('Change this social link', 'shapeblock')}
							onMouseDown={press}
							onClick={(e) => {
								e.preventDefault();
								setAnchor(e.currentTarget.closest('li'));
								setEditing(editing === i ? -1 : i);
							}}
						>
							{icon(l.icon, LINK_SVG)}
						</a>
					</li>
				))}
				{isSelected && (
					<li className="shapeblock-team-social-add">
						<a href="#shapeblock-team" aria-label={__('Add a social link', 'shapeblock')} onMouseDown={press} onClick={addLink}>{PLUS_SVG}</a>
					</li>
				)}
			</ul>
			{isSelected && editing >= 0 && links[editing] && anchor && (
				<Popover anchor={anchor} placement="bottom" onClose={closePopover} className="shapeblock-team-social-popover" focusOnMount={false}>
					<div className="shapeblock-team-social-popover__inner">
						<TextControl
							label={__('Link', 'shapeblock')}
							type="url"
							placeholder="https://"
							value={links[editing].url || ''}
							onChange={(v) => updateLink(editing, 'url', v)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<IconPicker label={__('Icon', 'shapeblock')} value={links[editing].icon || ''} onChange={(v) => updateLink(editing, 'icon', v)} />
						<div className="shapeblock-team-social-popover__actions">
							<Button size="small" variant="secondary" onClick={() => moveLink(editing, -1)} disabled={editing === 0}>{__('Move left', 'shapeblock')}</Button>
							<Button size="small" variant="secondary" onClick={() => moveLink(editing, 1)} disabled={editing === links.length - 1}>{__('Move right', 'shapeblock')}</Button>
							<Button size="small" isDestructive variant="secondary" onClick={() => removeLink(editing)}>{__('Remove', 'shapeblock')}</Button>
						</div>
					</div>
				</Popover>
			)}
		</div>
	);

	const image = attributes.image && attributes.image.url ? attributes.image : null;
	const imgBox = (
		<MediaUploadCheck fallback={<div className="shapeblock-team-img-box"><img className="shapeblock-team-img" src={image ? image.url : placeholder()} alt="" /></div>}>
			<MediaUpload
				onSelect={(m) => setAttributes({ image: { id: m.id, url: m.url, alt: m.alt } })}
				allowedTypes={['image']}
				value={image ? image.id : undefined}
				render={({ open }) => (
					// A click on the photo (not on the bio typed over it) opens the Media Library.
					<div
						className="shapeblock-team-img-box"
						onClick={(e) => {
							if (isSelected && !e.target.closest('.shapeblock-image-content, button, [contenteditable]')) open();
						}}
					>
						<img className="shapeblock-team-img" src={image ? image.url : placeholder()} alt={image ? image.alt || '' : ''} />
						<div className="shapeblock-image-below-bg" />
						<div className="shapeblock-image-overlay" />
						{'skin3' === skin && hasDetails && <div className="shapeblock-image-content">{detailsEl('shapeblock-description')}</div>}
						{isSelected && (
							<Button className="shapeblock-team-img-replace" variant="primary" size="small" onClick={open}>
								{image ? __('Replace photo', 'shapeblock') : __('Choose photo', 'shapeblock')}
							</Button>
						)}
					</div>
				)}
			/>
		</MediaUploadCheck>
	);

	const nameWrap = (extra, withDetails, withSocial) => (
		<div className={`shapeblock-name-deg-wrap ${extra}`}>
			{nameEl}
			{designationEl}
			{withDetails && hasDetails && detailsEl('shapeblock-team-description')}
			{contactBlock}
			{withSocial && 'default' === pos && social}
		</div>
	);

	let body;
	if ('skin1' === skin) {
		body = (
			<div className="shapeblock-grid-item">
				<div className="shapeblock-team-card">
					<div className="shapeblock-team-left"><div className="shapeblock-team-img-area">{imgBox}</div></div>
					<div className="shapeblock-team-right">
						{nameWrap('', true, false)}
						{'default' === pos && social}
					</div>
					{'default' !== pos && social}
				</div>
			</div>
		);
	} else if ('skin3' === skin) {
		body = (
			<div className="shapeblock-grid-item skin3">
				<div className="shapeblock-team-card">
					<div className="shapeblock-team-img-area">{imgBox}</div>
					<div className="shapeblock-team-deg-content">
						<div className="shapeblock-name-deg-wrap">{nameEl}{designationEl}</div>
					</div>
					{(hasContact || ('default' === pos && hasSocial)) && (
						<div className="shapeblock-social-media">
							{contactBlock}
							{'default' === pos && social}
						</div>
					)}
					{'default' !== pos && social}
				</div>
			</div>
		);
	} else if ('skin4' === skin) {
		body = (
			<div className="shapeblock-grid-item">
				<div className="shapeblock-team-card">
					<div className="shapeblock-team-img-area">{imgBox}</div>
					<div className={`shapeblock-team-hover-content ${overlay4}`}>
						<div className="shapeblock-name-deg-wrap">{nameEl}{designationEl}{contactBlock}</div>
						{social}
					</div>
				</div>
			</div>
		);
	} else if ('skin5' === skin) {
		body = (
			<div className="shapeblock-grid-item">
				<div className="shapeblock-team-card skin5">
					<div className="shapeblock-team-img-area">
						{imgBox}
						<div className="shapeblock-name-deg-wrap">
							<div className="shapeblock-author-content">{nameEl}{designationEl}</div>
							{(hasDetails || hasContact || ('default' === pos && hasSocial)) && (
								<div className="shapeblock-author-contact">
									{hasDetails && <div className="shapeblock-image-content">{detailsEl('shapeblock-description')}</div>}
									{contact}
									{'default' === pos && social}
								</div>
							)}
						</div>
					</div>
					{'default' !== pos && social}
				</div>
			</div>
		);
	} else {
		const inside = 'normal' !== contentShow;
		body = (
			<div className="shapeblock-grid-item">
				<div className="shapeblock-team-card">
					<div className="shapeblock-team-img-area">
						{imgBox}
						{inside && nameWrap('inside', true, true)}
					</div>
					{!inside && nameWrap('', true, true)}
					{'default' !== pos && social}
				</div>
			</div>
		);
	}

	const wrap = ['shapeblock-block', 'shapeblock-team-grid-block-wrap', blockId, 'shapeblock-team-wraps', 'shapeblock-team-grid', 'shapeblock-grid-layout', skin, 'is-team-editor'].filter(Boolean).join(' ');
	return (
		<div className={wrap}>
			<div className="shapeblock-grid-wrap">{body}</div>
		</div>
	);
}
