import { singleIcs, weeklyResetEntry } from '../../../lib/calendar';

export const prerender = true;

/** One-time import of the recurring weekly reset. The rule never changes, so no feed is needed. */
export function GET() {
	return new Response(singleIcs([weeklyResetEntry()], 'Overwatch weekly reset', Date.now()), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
	});
}
