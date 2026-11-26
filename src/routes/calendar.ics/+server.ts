import { combinedIcs } from '../../lib/calendar';

export const prerender = true;

/**
 * The one subscription feed: weekly reset, season launches and events. Baked at build time; every
 * deploy re-runs the build, so subscribed clients pick up changes on their next poll. No
 * `Content-Disposition: attachment`, which can make subscribing clients refuse the URL. The static
 * adapter drops these headers, `static/_headers` carries the real ones.
 */
export function GET() {
	const now = Date.now();
	return new Response(combinedIcs(now, now), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
	});
}
