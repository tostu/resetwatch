/** Calendar helpers: Google Calendar links and an iCalendar (.ics) feed of season launches. */
import { seasonAt, seasonByIndex, type SeasonRef } from './resets';
import { SITE_URL } from './seo';

const HOUR = 3_600_000;

/** `20261208T190000Z` */
function icsDate(ts: number): string {
	return new Date(ts)
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

function icsEscape(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\n/g, '\\n');
}

export function seasonStartTitle(s: SeasonRef): string {
	return `Overwatch ${s.label} starts`;
}

const NOTE = `Seasons go live at the weekly reset. Dates can shift; confirm at ${SITE_URL}/seasons`;

export function googleCalendarUrl(s: SeasonRef): string {
	const q = new URLSearchParams({
		action: 'TEMPLATE',
		text: seasonStartTitle(s),
		dates: `${icsDate(s.start)}/${icsDate(s.start + HOUR)}`,
		details: NOTE
	});
	return `https://calendar.google.com/calendar/render?${q}`;
}

/** Google Calendar link for a one-hour slot at `ts` (e.g. an event's end). */
export function calendarUrl(title: string, ts: number, details: string): string {
	const q = new URLSearchParams({
		action: 'TEMPLATE',
		text: title,
		dates: `${icsDate(ts)}/${icsDate(ts + HOUR)}`,
		details
	});
	return `https://calendar.google.com/calendar/render?${q}`;
}

/** Next `count` season launches after `now`. */
export function upcomingSeasons(now: number, count = 4): SeasonRef[] {
	const cur = seasonAt(now);
	return Array.from({ length: count }, (_, i) => seasonByIndex(cur.index + 1 + i));
}

/* ---------- Subscription feed ---------- */

export const FEED_PATH = '/seasons.ics';
export const FEED_URL = `${SITE_URL}${FEED_PATH}`;
/** Opens the default calendar app's "subscribe" dialog (Apple Calendar, most desktop clients). */
export const FEED_WEBCAL_URL = FEED_URL.replace(/^https?:/, 'webcal:');
/** Google Calendar "add by URL" deep link: subscribes the signed-in account. */
export const FEED_GOOGLE_URL = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(FEED_WEBCAL_URL)}`;
/** Outlook.com "add from web" deep link. */
export const FEED_OUTLOOK_URL = `https://outlook.live.com/calendar/0/addfromweb?${new URLSearchParams(
	{
		url: FEED_URL,
		name: 'Overwatch season launches'
	}
)}`;

/** How often clients are asked to re-fetch. They treat it as a hint; Google ignores it (~12-24 h). */
const REFRESH = 'PT6H';

/**
 * Seasons in the feed: the current one (so a launch stays in subscribers' calendars after it
 * happens) plus the next few. Events keep a stable UID, so when a redeploy moves a date or adds
 * the name Blizzard announced, subscribed clients update the existing entry instead of duplicating.
 */
export function feedSeasons(now: number, ahead = 4): SeasonRef[] {
	const cur = seasonAt(now);
	return [seasonByIndex(cur.index), ...upcomingSeasons(now, ahead)];
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

/** RFC 5545 requires CRLF line endings. */
export function seasonsIcs(now: number, stamp: number): string {
	const events = feedSeasons(now).flatMap((s) => [
		'BEGIN:VEVENT',
		`UID:season-${s.year}-${s.number}@resetwatch`,
		`DTSTAMP:${icsDate(stamp)}`,
		`LAST-MODIFIED:${icsDate(stamp)}`,
		`DTSTART:${icsDate(s.start)}`,
		`DTEND:${icsDate(s.start + HOUR)}`,
		`SUMMARY:${icsEscape(seasonStartTitle(s))}`,
		`DESCRIPTION:${icsEscape(NOTE)}`,
		`URL:${SITE_URL}/seasons`,
		// A launch is a reminder, not a meeting: don't block the subscriber's calendar.
		'TRANSP:TRANSPARENT',
		'BEGIN:VALARM',
		'ACTION:DISPLAY',
		`DESCRIPTION:${icsEscape(seasonStartTitle(s))}`,
		'TRIGGER:-PT1H',
		'END:VALARM',
		'END:VEVENT'
	]);
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Resetwatch//Overwatch seasons//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:Overwatch season launches',
		`X-WR-CALDESC:${icsEscape(`Season launch dates from ${SITE_URL}. Updates itself when the site does.`)}`,
		`REFRESH-INTERVAL;VALUE=DURATION:${REFRESH}`,
		`X-PUBLISHED-TTL:${REFRESH}`,
		...events,
		'END:VCALENDAR',
		''
	]
		.map(fold)
		.join('\r\n');
}
