import { seasonsIcs } from '../../lib/calendar';

export const prerender = true;

/**
 * Subscription feed, baked at build time. Every deploy re-runs the build (which refetches events and
 * season names first), so calendar clients that poll this URL pick up changed dates on their next
 * refresh. No `Content-Disposition: attachment`: that is for one-off downloads and can make
 * subscribing clients refuse the URL. Prerendered headers are dropped by the static adapter, so
 * `static/_headers` carries the real ones.
 */
export function GET() {
	const now = Date.now();
	return new Response(seasonsIcs(now, now), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
	});
}
