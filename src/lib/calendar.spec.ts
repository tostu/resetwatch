import { describe, expect, it } from 'vitest';
import { FEED_GOOGLE_URL, FEED_URL, FEED_WEBCAL_URL, feedSeasons, seasonsIcs } from './calendar';
import { seasonAt } from './resets';

const NOW = Date.UTC(2026, 10, 25, 12);

describe('season subscription feed', () => {
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
		expect(seasonsIcs(NOW, NOW + 86_400_000).match(/^UID:.*$/gm)).toEqual(ics.match(/^UID:.*$/gm));
	});

	it('folds lines to 75 octets', () => {
		for (const line of lines) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
	});

	it('exposes subscribe links built from the feed URL', () => {
		expect(FEED_WEBCAL_URL).toBe(FEED_URL.replace('https:', 'webcal:'));
		expect(FEED_GOOGLE_URL).toContain(encodeURIComponent(FEED_WEBCAL_URL));
	});
});
