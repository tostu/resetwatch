import { json } from '@sveltejs/kit';
import {
	CONFIG,
	RESET_TZ,
	allResets,
	currentEvents,
	nextOccurrence,
	seasonAt
} from '../../../lib/resets';
import { upcomingSeasons } from '../../../lib/calendar';

export const prerender = true;

const iso = (ts: number) => new Date(ts).toISOString();

/**
 * Static snapshot written at build time (the site has no Worker). It carries the schedule,
 * not a countdown: consumers compute "time left" themselves from the ISO timestamps, and
 * `nextWeeklyReset` is only the next one as of `generatedAt`.
 */
export function GET() {
	const now = Date.now();
	const season = seasonAt(now);
	return json(
		{
			generatedAt: iso(now),
			weeklyReset: {
				rule: 'Every Tuesday 14:00 America/New_York (11:00 America/Los_Angeles)',
				timeZone: RESET_TZ,
				weekday: CONFIG.weekly.weekday,
				hour: CONFIG.weekly.hour,
				minute: CONFIG.weekly.minute,
				nextWeeklyReset: iso(nextOccurrence(CONFIG.weekly, now))
			},
			season: {
				label: season.label,
				week: season.week,
				weeks: season.weeks,
				startsAt: iso(season.start),
				endsAt: iso(season.end)
			},
			events: currentEvents(now).map((e) => ({
				name: e.label,
				phase: e.phase,
				startsAt: e.startsAt ? iso(e.startsAt) : null,
				endsAt: iso(e.endsAt)
			})),
			upcomingSeasons: upcomingSeasons(now).map((s) => ({
				label: s.label,
				startsAt: iso(s.start),
				endsAt: iso(s.end)
			})),
			resets: allResets(now).map((r) => ({
				kind: r.kind,
				phase: r.phase,
				name: r.name ?? null,
				at: iso(r.endsAt)
			}))
		},
		{ headers: { 'Access-Control-Allow-Origin': '*' } }
	);
}
