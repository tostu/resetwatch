import { describe, expect, it } from 'vitest';
import {
	FEED_GOOGLE_URL,
	FEED_URL,
	FEED_WEBCAL_URL,
	combinedIcs,
	eventAddOnce,
	eventEntries,
	feedSeasons,
	googleUrl,
	seasonsIcs,
	singleIcs,
	weeklyResetEntry
} from './calendar';
import type { EventPage } from './event-pages';
import { seasonAt } from './resets';

const NOW = Date.UTC(2026, 10, 25, 12);
const DAY = 86_400_000;

const EVENT: EventPage = {
	slug: 'taking-reign-november-2026',
	name: 'Taking Reign',
	startsAt: Date.UTC(2026, 10, 3, 19),
	endsAt: Date.UTC(2026, 11, 8, 19)
};

const octets = (l: string) => new TextEncoder().encode(l).length;

describe('legacy seasons feed', () => {
	const ics = seasonsIcs(NOW, NOW);
	const lines = ics.split('\r\n');

	it('is a CRLF-terminated VCALENDAR with refresh hints', () => {
		expect(lines[0]).toBe('BEGIN:VCALENDAR');
		expect(lines.at(-2)).toBe('END:VCALENDAR');
		expect(lines.at(-1)).toBe('');
		expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT6H');
		expect(ics).toContain('X-PUBLISHED-TTL:PT6H');
	});

	it('keeps the current season so past launches stay in calendars', () => {
		const seasons = feedSeasons(NOW);
		expect(seasons[0].index).toBe(seasonAt(NOW).index);
		expect(seasons).toHaveLength(5);
	});

	it('uses stable, unique UIDs so redeploys update events instead of duplicating', () => {
		const uids = lines.filter((l) => l.startsWith('UID:'));
		expect(uids).toHaveLength(5);
		expect(new Set(uids).size).toBe(5);
		expect(seasonsIcs(NOW, NOW + DAY).match(/^UID:.*$/gm)).toEqual(ics.match(/^UID:.*$/gm));
	});

	it('has no weekly reset in it', () => {
		expect(ics).not.toContain('RRULE');
	});
});

describe('combined subscription feed', () => {
	const ics = combinedIcs(NOW, NOW, [EVENT]);
	const lines = ics.split('\r\n');

	it('carries the recurring weekly reset in ET with a VTIMEZONE', () => {
		expect(ics).toContain('BEGIN:VTIMEZONE');
		expect(ics).toContain('DTSTART;TZID=America/New_York:20260106T140000');
		expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=TU');
	});

	it('has seasons and both event reminders, all with unique UIDs', () => {
		const uids = lines.filter((l) => l.startsWith('UID:'));
		// weekly + 5 seasons + event start + event end
		expect(uids).toHaveLength(8);
		expect(new Set(uids).size).toBe(8);
		expect(ics).toContain('UID:event-taking-reign-november-2026-end@resetwatch');
	});

	it('drops events that ended long ago', () => {
		const old = { ...EVENT, slug: 'old', endsAt: NOW - 90 * DAY, startsAt: NOW - 120 * DAY };
		expect(combinedIcs(NOW, NOW, [old])).not.toContain('UID:event-old');
	});

	it('folds lines to 75 octets', () => {
		for (const line of lines) expect(octets(line)).toBeLessThanOrEqual(75);
	});

	it('exposes subscribe links built from the feed URL', () => {
		expect(FEED_URL).toMatch(/\/calendar\.ics$/);
		expect(FEED_WEBCAL_URL).toBe(FEED_URL.replace('https:', 'webcal:'));
		expect(FEED_GOOGLE_URL).toContain(encodeURIComponent(FEED_WEBCAL_URL));
	});
});

describe('add once', () => {
	it('single files have no refresh hints', () => {
		const ics = singleIcs([weeklyResetEntry()], 'x', NOW);
		expect(ics).not.toContain('REFRESH-INTERVAL');
		expect(ics.replace(/\r\n /g, '')).toContain('Does not update');
	});

	it('event download keeps the start only while it is ahead', () => {
		expect(eventAddOnce(EVENT, NOW)).toHaveLength(1);
		expect(eventAddOnce(EVENT, EVENT.startsAt! - DAY)).toHaveLength(2);
		expect(eventEntries(EVENT)).toHaveLength(2);
	});

	it('end reminder alarms a day before', () => {
		const end = eventAddOnce(EVENT, NOW)[0];
		expect(end.alarm).toBe('-PT24H');
		expect(end.start).toBe(EVENT.endsAt);
	});

	it('Google link for the weekly reset repeats in ET', () => {
		const u = new URL(googleUrl(weeklyResetEntry()));
		expect(u.searchParams.get('recur')).toBe('RRULE:FREQ=WEEKLY;BYDAY=TU');
		expect(u.searchParams.get('ctz')).toBe('America/New_York');
		expect(u.searchParams.get('dates')).toBe('20260106T140000/20260106T150000');
	});
});
