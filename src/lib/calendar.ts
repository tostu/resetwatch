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

/** Next `count` season launches after `now`. */
export function upcomingSeasons(now: number, count = 4): SeasonRef[] {
	const cur = seasonAt(now);
	return Array.from({ length: count }, (_, i) => seasonByIndex(cur.index + 1 + i));
}

/** RFC 5545 requires CRLF line endings. */
export function seasonsIcs(now: number, stamp: number): string {
	const events = upcomingSeasons(now).flatMap((s) => [
		'BEGIN:VEVENT',
		`UID:season-${s.year}-${s.number}@resetwatch`,
		`DTSTAMP:${icsDate(stamp)}`,
		`DTSTART:${icsDate(s.start)}`,
		`DTEND:${icsDate(s.start + HOUR)}`,
		`SUMMARY:${icsEscape(seasonStartTitle(s))}`,
		`DESCRIPTION:${icsEscape(NOTE)}`,
		`URL:${SITE_URL}/seasons`,
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
		'X-WR-CALNAME:Overwatch season launches',
		...events,
		'END:VCALENDAR',
		''
	].join('\r\n');
}
