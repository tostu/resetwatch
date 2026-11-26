/**
 * Calendar output, in two deliberately separate flavours:
 *
 * - Subscription (`/calendar.ics`): ONE feed with the weekly reset, season launches and every
 *   event. Calendar apps poll it, so moved dates and new events show up by themselves.
 * - Add once (`/cal/...ics` downloads and Google Calendar links): a one-time copy of a single
 *   item. It never updates, which is fine for a date that is already fixed.
 *
 * `/seasons.ics` is the older launches-only feed. It stays as is for existing subscribers.
 */
import { CONFIG, RESET_TZ, seasonAt, seasonByIndex, type SeasonRef } from './resets';
import { eventPages, type EventPage } from './event-pages';
import { SITE_URL, absolute } from './seo';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/* ---------- Entries ---------- */

/** One calendar entry. Instants are UTC ms; `weekly` makes it repeat every week in ET wall time. */
export interface CalEntry {
	/** Stable across builds, so subscribed clients update instead of duplicating. */
	uid: string;
	summary: string;
	description: string;
	url: string;
	start: number;
	end: number;
	/** VALARM trigger relative to the start, e.g. `-PT1H`. */
	alarm?: string;
	weekly?: boolean;
}

/** Fixed anchor for the recurring reset: Tue 6 Jan 2026, 2 PM ET (a regular weekly reset). */
const WEEKLY_ANCHOR = { y: 2026, m: 1, d: 6 };

export function weeklyResetEntry(): CalEntry {
	const { hour, minute } = CONFIG.weekly;
	// UTC instant of the anchor; only used for Google links and sorting.
	const start = Date.UTC(WEEKLY_ANCHOR.y, WEEKLY_ANCHOR.m - 1, WEEKLY_ANCHOR.d, hour + 5, minute);
	return {
		uid: 'weekly-reset@resetwatch',
		summary: 'Overwatch weekly reset',
		description: `Weekly challenges, shop and arcade rotate. Every Tuesday 2 PM ET / 11 AM PT. Live countdown: ${SITE_URL}/`,
		url: `${SITE_URL}/`,
		start,
		end: start + HOUR,
		weekly: true
	};
}

export function seasonStartTitle(s: SeasonRef): string {
	return `Overwatch ${s.label}${s.title ? `: ${s.title}` : ''} starts`;
}

export function seasonCalSlug(s: SeasonRef): string {
	return `${s.year}-season-${s.number}`;
}

export function seasonStartEntry(s: SeasonRef): CalEntry {
	return {
		uid: `season-${s.year}-${s.number}@resetwatch`,
		summary: seasonStartTitle(s),
		description: `Seasons go live at the weekly reset. Dates can shift; confirm at ${SITE_URL}/seasons`,
		url: `${SITE_URL}/seasons`,
		start: s.start,
		end: s.start + HOUR,
		alarm: '-PT1H'
	};
}

/**
 * An event becomes up to two short reminders, not one bar across weeks of the calendar:
 * the start (if known) and the end, with an alarm a day before the end.
 */
export function eventEntries(p: EventPage, opts: { from?: number } = {}): CalEntry[] {
	const url = absolute(`/events/${p.slug}`);
	const out: CalEntry[] = [];
	if (p.startsAt !== undefined && p.startsAt >= (opts.from ?? -Infinity)) {
		out.push({
			uid: `event-${p.slug}-start@resetwatch`,
			summary: `Overwatch: ${p.name} starts`,
			description: `${p.details?.summary ? `${p.details.summary}. ` : ''}Live countdown: ${url}`,
			url,
			start: p.startsAt,
			end: p.startsAt + HOUR
		});
	}
	out.push({
		uid: `event-${p.slug}-end@resetwatch`,
		summary: `Overwatch: ${p.name} ends`,
		description: `Last chance for ${p.name}. Live countdown: ${url}`,
		url,
		start: p.endsAt,
		end: p.endsAt + HOUR,
		alarm: '-PT24H'
	});
	return out;
}

/* ---------- Google Calendar "add once" links ---------- */

/** `20261208T190000Z` */
function icsDate(ts: number): string {
	return new Date(ts)
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

/** `20260106T140000`: wall time in ET, for TZID'd and recurring entries. */
function etLocal(ts: number): string {
	const p = new Intl.DateTimeFormat('en-CA', {
		timeZone: RESET_TZ,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).formatToParts(new Date(ts));
	const g = (t: string) => p.find((x) => x.type === t)!.value;
	return `${g('year')}${g('month')}${g('day')}T${g('hour')}${g('minute')}${g('second')}`;
}

export function googleUrl(e: CalEntry): string {
	const q = new URLSearchParams({ action: 'TEMPLATE', text: e.summary, details: e.description });
	if (e.weekly) {
		q.set('dates', `${etLocal(e.start)}/${etLocal(e.end)}`);
		q.set('ctz', RESET_TZ);
		q.set('recur', 'RRULE:FREQ=WEEKLY;BYDAY=TU');
	} else {
		q.set('dates', `${icsDate(e.start)}/${icsDate(e.end)}`);
	}
	return `https://calendar.google.com/calendar/render?${q}`;
}

/** Google Calendar link for a season launch. */
export function googleCalendarUrl(s: SeasonRef): string {
	return googleUrl(seasonStartEntry(s));
}

/* ---------- .ics serialisation ---------- */

function icsEscape(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\n/g, '\\n');
}

/** Fold to 75 octets per line (RFC 5545 §3.1); continuation lines start with one space. */
function fold(line: string): string {
	const enc = new TextEncoder();
	if (enc.encode(line).length <= 75) return line;
	const out: string[] = [];
	let cur = '';
	let bytes = 0;
	for (const ch of line) {
		const n = enc.encode(ch).length;
		// Continuation lines carry a leading space, so they hold 74 octets of content.
		if (bytes + n > (out.length ? 74 : 75)) {
			out.push(cur);
			cur = '';
			bytes = 0;
		}
		cur += ch;
		bytes += n;
	}
	out.push(cur);
	return out.join('\r\n ');
}

/** US Eastern rules since 2007; needed by strict clients for the TZID'd weekly reset. */
const VTIMEZONE_ET = [
	'BEGIN:VTIMEZONE',
	`TZID:${RESET_TZ}`,
	'BEGIN:DAYLIGHT',
	'TZOFFSETFROM:-0500',
	'TZOFFSETTO:-0400',
	'TZNAME:EDT',
	'DTSTART:20070311T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
	'END:DAYLIGHT',
	'BEGIN:STANDARD',
	'TZOFFSETFROM:-0400',
	'TZOFFSETTO:-0500',
	'TZNAME:EST',
	'DTSTART:20071104T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
	'END:STANDARD',
	'END:VTIMEZONE'
];

function vevent(e: CalEntry, stamp: number): string[] {
	const when = e.weekly
		? [
				`DTSTART;TZID=${RESET_TZ}:${etLocal(e.start)}`,
				`DTEND;TZID=${RESET_TZ}:${etLocal(e.end)}`,
				'RRULE:FREQ=WEEKLY;BYDAY=TU'
			]
		: [`DTSTART:${icsDate(e.start)}`, `DTEND:${icsDate(e.end)}`];
	return [
		'BEGIN:VEVENT',
		`UID:${e.uid}`,
		`DTSTAMP:${icsDate(stamp)}`,
		`LAST-MODIFIED:${icsDate(stamp)}`,
		...when,
		`SUMMARY:${icsEscape(e.summary)}`,
		`DESCRIPTION:${icsEscape(e.description)}`,
		`URL:${e.url}`,
		// Reminders, not meetings: don't block the calendar.
		'TRANSP:TRANSPARENT',
		...(e.alarm
			? [
					'BEGIN:VALARM',
					'ACTION:DISPLAY',
					`DESCRIPTION:${icsEscape(e.summary)}`,
					`TRIGGER:${e.alarm}`,
					'END:VALARM'
				]
			: []),
		'END:VEVENT'
	];
}

/** How often clients are asked to re-fetch. They treat it as a hint; Google ignores it (~12-24 h). */
const REFRESH = 'PT6H';

interface CalMeta {
	name: string;
	description: string;
	/** Subscription feeds carry refresh hints; one-off downloads do not. */
	feed: boolean;
}

/** RFC 5545 requires CRLF line endings. */
export function icsCalendar(entries: CalEntry[], meta: CalMeta, stamp: number): string {
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Resetwatch//Overwatch calendar//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${icsEscape(meta.name)}`,
		`X-WR-CALDESC:${icsEscape(meta.description)}`,
		...(meta.feed
			? [`REFRESH-INTERVAL;VALUE=DURATION:${REFRESH}`, `X-PUBLISHED-TTL:${REFRESH}`]
			: []),
		...(entries.some((e) => e.weekly) ? VTIMEZONE_ET : []),
		...entries.flatMap((e) => vevent(e, stamp)),
		'END:VCALENDAR',
		''
	]
		.map(fold)
		.join('\r\n');
}

/* ---------- Combined subscription feed ---------- */

export const FEED_PATH = '/calendar.ics';
export const FEED_URL = `${SITE_URL}${FEED_PATH}`;
/** Opens the default calendar app's "subscribe" dialog (Apple Calendar, most desktop clients). */
export const FEED_WEBCAL_URL = FEED_URL.replace(/^https?:/, 'webcal:');
/** Google Calendar "add by URL" deep link: subscribes the signed-in account. */
export const FEED_GOOGLE_URL = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(FEED_WEBCAL_URL)}`;
export const FEED_NAME = 'Overwatch resets, events & seasons';
/** Outlook.com "add from web" deep link. */
export const FEED_OUTLOOK_URL = `https://outlook.live.com/calendar/0/addfromweb?${new URLSearchParams(
	{ url: FEED_URL, name: FEED_NAME }
)}`;

/** Next `count` season launches after `now`. */
export function upcomingSeasons(now: number, count = 4): SeasonRef[] {
	const cur = seasonAt(now);
	return Array.from({ length: count }, (_, i) => seasonByIndex(cur.index + 1 + i));
}

/**
 * Seasons in a feed: the current one (so a launch stays in subscribers' calendars after it
 * happens) plus the next few.
 */
export function feedSeasons(now: number, ahead = 4): SeasonRef[] {
	const cur = seasonAt(now);
	return [seasonByIndex(cur.index), ...upcomingSeasons(now, ahead)];
}

/** Events that ended more than this long ago drop out of the feed. */
const FEED_HISTORY = 45 * DAY;

export function feedEvents(now: number, pages: EventPage[] = eventPages()): EventPage[] {
	return pages.filter((p) => p.endsAt >= now - FEED_HISTORY);
}

export function combinedEntries(now: number, pages?: EventPage[]): CalEntry[] {
	return [
		weeklyResetEntry(),
		...feedSeasons(now).map(seasonStartEntry),
		...feedEvents(now, pages).flatMap((p) => eventEntries(p))
	];
}

export function combinedIcs(now: number, stamp: number, pages?: EventPage[]): string {
	return icsCalendar(
		combinedEntries(now, pages),
		{
			name: FEED_NAME,
			description: `Weekly reset, season launches and limited-time events from ${SITE_URL}. Updates itself when the site does.`,
			feed: true
		},
		stamp
	);
}

/** Legacy launches-only feed at `/seasons.ics`. */
export function seasonsIcs(now: number, stamp: number): string {
	return icsCalendar(
		feedSeasons(now).map(seasonStartEntry),
		{
			name: 'Overwatch season launches',
			description: `Season launch dates from ${SITE_URL}. Updates itself when the site does.`,
			feed: true
		},
		stamp
	);
}

/* ---------- Add-once downloads ---------- */

export const WEEKLY_ICS_PATH = '/cal/weekly-reset.ics';
export const seasonIcsPath = (s: SeasonRef) => `/cal/season/${seasonCalSlug(s)}.ics`;
export const eventIcsPath = (p: EventPage) => `/cal/event/${p.slug}.ics`;

/** Single-item file: no refresh hints, the calendar app imports it once. */
export function singleIcs(entries: CalEntry[], name: string, stamp: number): string {
	return icsCalendar(
		entries,
		{ name, description: `One-time copy from ${SITE_URL}. Does not update.`, feed: false },
		stamp
	);
}

/** Entries for a single event download: the end, plus the start while it is still ahead. */
export function eventAddOnce(p: EventPage, now: number): CalEntry[] {
	return eventEntries(p, { from: now });
}
