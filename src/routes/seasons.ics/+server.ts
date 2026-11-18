import { seasonsIcs } from '../../lib/calendar';

export const prerender = true;

/** Static at build time: season dates change only when the baked events do, which triggers a rebuild. */
export function GET() {
	const now = Date.now();
	return new Response(seasonsIcs(now, now), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="overwatch-seasons.ics"'
		}
	});
}
