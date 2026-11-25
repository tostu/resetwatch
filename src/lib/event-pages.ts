/** Per-event pages (`/events/[slug]`), built from the baked D1 rows in data/events.json. */
import {
	bakedEvents,
	detailsOf,
	eventWindow,
	seasonAt,
	type BakedEvents,
	type EventDetails
} from './resets';
import { eventSlug } from './slug';
import { longDate, resetClock } from './season-pages';

const DAY = 86_400_000;

export interface EventPage {
	slug: string;
	name: string;
	/** Reset-snapped instants (ms), same rules as the home page cards. */
	startsAt?: number;
	endsAt: number;
	details?: EventDetails;
}

export type EventPhase = 'upcoming' | 'live' | 'ended';

/**
 * Every kind=event row with an end date, one page per slug. The ingest can store the same event
 * twice (two sources, different names); within one slug the row with details wins.
 * Sorted by start, newest first.
 */
export function buildEventPages(data: BakedEvents): EventPage[] {
	const bySlug = new Map<string, EventPage>();
	for (const e of data.events) {
		if (e.kind !== 'event' || !e.name || !e.ends_at) continue;
		const { startsAt, endsAt } = eventWindow(e.starts_at, e.ends_at);
		if (Number.isNaN(endsAt)) continue;
		const slug = eventSlug(e.name, startsAt ?? endsAt);
		const page: EventPage = { slug, name: e.name, startsAt, endsAt, details: detailsOf(e) };
		const prev = bySlug.get(slug);
		if (!prev || (!prev.details && page.details)) bySlug.set(slug, page);
	}
	return [...bySlug.values()].sort((a, b) => (b.startsAt ?? b.endsAt) - (a.startsAt ?? a.endsAt));
}

let cache: EventPage[] | undefined;
export function eventPages(): EventPage[] {
	return (cache ??= buildEventPages(bakedEvents()));
}

export function eventPage(slug: string): EventPage | undefined {
	return eventPages().find((p) => p.slug === slug);
}

export function eventPhase(p: EventPage, now: number): EventPhase {
	if (p.startsAt !== undefined && now < p.startsAt) return 'upcoming';
	return now < p.endsAt ? 'live' : 'ended';
}

/** Whole days, rounded: `Nov 3 - Dec 8` is 35. */
export function durationDays(p: EventPage): number | undefined {
	return p.startsAt === undefined ? undefined : Math.round((p.endsAt - p.startsAt) / DAY);
}

/** True when the event ends at the season end (the usual case for season-long events). */
export function endsWithSeason(p: EventPage): boolean {
	return seasonAt(p.endsAt - 1).end === p.endsAt;
}

const ET = 'America/New_York';

/**
 * `Overwatch Taking Reign: End Date & Countdown | Resetwatch`; upcoming events lead with the
 * start date, since that is what people search for before it begins.
 */
export function eventTitle(p: EventPage, now: number): string {
	const what = eventPhase(p, now) === 'upcoming' ? 'Start Date' : 'End Date';
	return `Overwatch ${p.name}: ${what} & Countdown | Resetwatch`;
}

/** Summaries come without a final stop; meta descriptions should end like a sentence. */
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

export function eventDescription(p: EventPage): string {
	const end = longDate(p.endsAt, ET);
	const range =
		p.startsAt !== undefined ? `runs from ${longDate(p.startsAt, ET)} to ${end}` : `ends ${end}`;
	const base = `Overwatch ${p.name} ${range}. Live countdown in your local time`;
	return p.details?.summary
		? `${base}. ${sentence(p.details.summary)}`
		: `${base}, with a link to the official post.`;
}

export function endAnswer(p: EventPage, now: number): string {
	const when = `${longDate(p.endsAt, ET)} at ${resetClock(p.endsAt)}`;
	const tail = endsWithSeason(p) ? ', together with the current season' : '';
	return eventPhase(p, now) === 'ended'
		? `${p.name} ended on ${when}${tail}.`
		: `${p.name} ends on ${when}${tail}.`;
}

export function startAnswer(p: EventPage, now: number): string | undefined {
	if (p.startsAt === undefined) return undefined;
	const when = `${longDate(p.startsAt, ET)} at ${resetClock(p.startsAt)}`;
	const days = durationDays(p);
	const verb = eventPhase(p, now) === 'ended' ? 'ran' : 'runs';
	const len = days ? ` It ${verb} ${days} day${days === 1 ? '' : 's'}.` : '';
	return eventPhase(p, now) === 'upcoming'
		? `${p.name} starts on ${when}.${len}`
		: `${p.name} started on ${when}.${len}`;
}

/** schema.org Event. Online event run by Blizzard; dates are the reset instants. */
export function eventJsonLd(p: EventPage, pageUrl: string, image: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: `Overwatch: ${p.name}`,
		description: p.details?.summary ?? eventDescription(p),
		...(p.startsAt !== undefined && { startDate: new Date(p.startsAt).toISOString() }),
		endDate: new Date(p.endsAt).toISOString(),
		eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
		eventStatus: 'https://schema.org/EventScheduled',
		location: {
			'@type': 'VirtualLocation',
			url: p.details?.sourceUrl ?? 'https://overwatch.blizzard.com/en-us/news/'
		},
		organizer: {
			'@type': 'Organization',
			name: 'Blizzard Entertainment',
			url: 'https://overwatch.blizzard.com/'
		},
		image: [image],
		url: pageUrl
	};
}
