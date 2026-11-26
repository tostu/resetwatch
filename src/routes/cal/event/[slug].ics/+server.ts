import { error } from '@sveltejs/kit';
import { eventAddOnce, singleIcs } from '../../../../lib/calendar';
import { eventPage, eventPages } from '../../../../lib/event-pages';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => eventPages().map((p) => ({ slug: p.slug }));

/** One-time copy of one event: its end reminder, plus the start while that is still ahead. */
export const GET: RequestHandler = ({ params }) => {
	const p = eventPage(params.slug);
	if (!p) error(404, 'Unknown event');
	const now = Date.now();
	return new Response(singleIcs(eventAddOnce(p, now), `Overwatch: ${p.name}`, now), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
	});
};
