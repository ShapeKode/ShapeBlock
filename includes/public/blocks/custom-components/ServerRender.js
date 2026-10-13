/**
 * ServerSideRender that tries again when the preview request fails.
 *
 * Every ShapeBlock block previews itself with a request to the block-renderer
 * REST endpoint, so a page with many blocks fires many requests at once when
 * the editor loads. Hosts that cap PHP workers or rate-limit REST calls answer
 * some of them with an error (429 / 503 / a timeout), and core's component then
 * shows "Error loading block" until the block is edited. Here a failed request
 * is retried a few times with a growing delay, and only if all of them fail is
 * the error shown -- with a button to try again by hand.
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useRef } from '@wordpress/element';
import ServerSideRenderModule from '@wordpress/server-side-render';
import { Button, Spinner } from '@wordpress/components';

// WordPress 6.9+ exposes the component as a named export as well; older
// versions (the plugin supports 6.6) only have the default one.
const CoreServerSideRender =
	ServerSideRenderModule && ServerSideRenderModule.ServerSideRender
		? ServerSideRenderModule.ServerSideRender
		: ServerSideRenderModule;

const MAX_RETRIES = 3;

export default function ServerSideRender(props) {
	const [attempt, setAttempt] = useState(0);
	const [failed, setFailed] = useState('');

	// A new set of attributes is a new request: start counting again.
	const attrKey = JSON.stringify(props.attributes || {});
	useEffect(() => {
		setAttempt(0);
		setFailed('');
	}, [attrKey]);

	// Called by the placeholder below whenever a request fails.
	const onError = useRef(null);
	onError.current = (message) => {
		if (attempt < MAX_RETRIES) {
			return setTimeout(() => setAttempt((n) => n + 1), 700 * (attempt + 1));
		}
		setFailed(message || __('Unknown error', 'shapeblock'));
		return null;
	};

	// One stable component, so a re-render of the block (selecting it, for
	// one) does not restart the timer.
	const ErrorPlaceholder = useMemo(
		() =>
			function ShapeBlockPreviewError({ response }) {
				useEffect(() => {
					const msg = response && response.errorMsg ? String(response.errorMsg) : '';
					const timer = onError.current(msg);
					return () => timer && clearTimeout(timer);
				}, []);
				return (
					<div className="shapeblock-ssr-retry" style={{ padding: '12px', textAlign: 'center' }}>
						<Spinner />
					</div>
				);
			},
		[]
	);

	if (failed) {
		return (
			<div className="shapeblock-ssr-error" style={{ padding: '12px', border: '1px dashed #cc1818', color: '#cc1818' }}>
				<p style={{ margin: '0 0 8px' }}>
					{__('The block preview could not be loaded.', 'shapeblock')} ({failed})
				</p>
				<Button
					variant="secondary"
					onClick={() => {
						setFailed('');
						setAttempt(0);
					}}
				>
					{__('Try again', 'shapeblock')}
				</Button>
			</div>
		);
	}

	return <CoreServerSideRender key={attempt} {...props} ErrorResponsePlaceholder={ErrorPlaceholder} />;
}
