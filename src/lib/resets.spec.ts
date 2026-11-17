import { describe, expect, it } from 'vitest';
import {
	coarse,
	formatCountdown,
	nextOccurrence,
	seasonAt,
	splitDuration,
	urgency,
	zonedToUtc
} from './resets';

describe('zonedToUtc', () => {
	it('handles EST and EDT', () => {
		expect(zonedToUtc(2026, 1, 6, 14, 0, 'America/New_York')).toBe(Date.UTC(2026, 0, 6, 19));
		expect(zonedToUtc(2026, 7, 7, 14, 0, 'America/New_York')).toBe(Date.UTC(2026, 6, 7, 18));
	});
});

describe('nextOccurrence', () => {
	const weekly = { weekday: 2, hour: 14, minute: 0 };
	it('same Tuesday before reset', () => {
		const now = Date.UTC(2026, 10, 17, 15); // Tue 10:00 EST
		expect(nextOccurrence(weekly, now)).toBe(Date.UTC(2026, 10, 17, 19));
	});
	it('rolls to next week after reset', () => {
		const now = Date.UTC(2026, 10, 17, 20);
		expect(nextOccurrence(weekly, now)).toBe(Date.UTC(2026, 10, 24, 19));
	});
	it('survives DST change (Nov 1 2026)', () => {
		const now = Date.UTC(2026, 10, 1, 12); // Sun after fall back
		expect(nextOccurrence(weekly, now)).toBe(Date.UTC(2026, 10, 3, 19));
		const before = Date.UTC(2026, 9, 27, 20); // Tue Oct 27 after reset (EDT)
		expect(nextOccurrence(weekly, before)).toBe(Date.UTC(2026, 10, 3, 19));
	});
	it('daily rolls to tomorrow', () => {
		const now = Date.UTC(2026, 10, 17, 20);
		expect(nextOccurrence({ hour: 14, minute: 0 }, now)).toBe(Date.UTC(2026, 10, 18, 19));
	});
});

describe('formatting', () => {
	it('splits', () => {
		expect(splitDuration(2 * 86400000 + 14 * 3600000 + 37 * 60000)).toEqual({
			days: 2,
			hours: 14,
			minutes: 37,
			seconds: 0
		});
	});
	it('formats countdown', () => {
		expect(formatCountdown(2 * 86400000 + 14 * 3600000 + 37 * 60000)).toBe('2D 14H 37M');
		expect(formatCountdown(3_725_000)).toBe('1H 02M 05S');
		expect(formatCountdown(65_000)).toBe('1M 05S');
	});
	it('coarse phrasing', () => {
		expect(coarse(19 * 3600000 + 1000)).toBe('19 HOURS');
		expect(coarse(21 * 86400000)).toBe('21 DAYS');
		expect(coarse(3_600_000)).toBe('1 HOUR');
	});
	it('urgency thresholds', () => {
		expect(urgency(30 * 60000)).toBe('critical');
		expect(urgency(5 * 3600000)).toBe('soon');
		expect(urgency(2 * 86400000)).toBe('normal');
	});
});

describe('seasonAt', () => {
	it('Season 5 week 7 of 9 on 2026-11-17 after reset', () => {
		const s = seasonAt(Date.UTC(2026, 10, 17, 20));
		expect(s.number).toBe(5);
		expect(s.week).toBe(7);
		expect(s.weeks).toBe(9);
		expect(s.end).toBe(Date.UTC(2026, 11, 8, 19));
		expect(s.label).toBe('2026: SEASON 5');
	});
	it('Season 4 is 8 weeks', () => {
		expect(seasonAt(Date.UTC(2026, 8, 1)).weeks).toBe(8);
	});
});
