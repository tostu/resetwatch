import { error } from '@sveltejs/kit';
import {
	feedSeasons,
	seasonCalSlug,
	seasonStartEntry,
	seasonStartTitle,
	singleIcs
} from '../../../../lib/calendar';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	feedSeasons(Date.now()).map((s) => ({ slug: seasonCalSlug(s) }));

/** One-time copy of a single season launch. */
export const GET: RequestHandler = ({ params }) => {
	const now = Date.now();
	const s = feedSeasons(now).find((x) => seasonCalSlug(x) === params.slug);
	if (!s) error(404, 'Unknown season');
	return new Response(singleIcs([seasonStartEntry(s)], seasonStartTitle(s), now), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
	});
};
