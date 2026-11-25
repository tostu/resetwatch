import { describe, expect, it } from 'vitest';
import { slugify, eventSlug } from './slug';
import {
	buildEventPages,
	durationDays,
	endAnswer,
	endsWithSeason,
	eventJsonLd,
	eventPhase,
	startAnswer
} from './event-pages';
import { activeEvents } from './resets';

const src = 'https://overwatch.blizzard.com/en-us/news/24303010/x#:~:text=An%20Eventful%20Reunion';
const data = {
	events: [
		{
			kind: 'event',
			name: 'Taking Reign',
			starts_at: '2026-11-03T19:00:00Z',
			ends_at: '2026-12-07T18:00:00Z',
			summary: 'Five-week story event with free and premium reward tracks.',
			facts: [{ label: 'Reward tiers', value: '24' }],
			source_url: src,
			source_title: 'S5 Midcycle'
		},
		// Same event again from another source, no details: must not replace the first.
		{ kind: 'event', name: 'Taking Reign', starts_at: '2026-11-03', ends_at: '2026-12-07' },
		{
			kind: 'event',
			name: "Junkrat's Loot Hunt",
			starts_at: '2026-11-20T18:00:00Z',
			ends_at: '2026-11-23T18:00:00Z'
		},
		{ kind: 'event', name: 'No end', starts_at: '2026-11-20T18:00:00Z', ends_at: null },
		{ kind: 'season_start', name: 'Season 6', starts_at: '2026-12-08T19:00:00Z' }
	]
};

describe('slugs', () => {
	it('slugify', () => {
		expect(slugify("Junkrat's Loot Hunt + Double XP")).toBe('junkrats-loot-hunt-double-xp');
		expect(slugify('Overwatch x EVE Protocol')).toBe('overwatch-x-eve-protocol');
		expect(slugify('Pokémon & Friends!')).toBe('pokemon-and-friends');
	});
	it('eventSlug adds month and year', () => {
		expect(eventSlug('Taking Reign', Date.UTC(2026, 10, 3, 19))).toBe('taking-reign-november-2026');
	});
});

describe('buildEventPages', () => {
	const pages = buildEventPages(data);
	it('one page per event with an end, newest start first, details win on duplicates', () => {
		expect(pages.map((p) => p.slug)).toEqual([
			'junkrats-loot-hunt-november-2026',
			'taking-reign-november-2026'
		]);
		expect(pages[1].details?.sourceUrl).toBe(src);
	});
	it('uses the same snapping as the cards (short event ends Monday, long one at Tuesday reset)', () => {
		expect(pages[0].endsAt).toBe(Date.UTC(2026, 10, 23, 19));
		expect(pages[1].endsAt).toBe(Date.UTC(2026, 11, 8, 19));
		expect(durationDays(pages[1])).toBe(35);
	});
	it('card slugs match page slugs', () => {
		const cards = activeEvents({ label: 'x', endsAt: '2026-01-01' }, data, Date.UTC(2026, 10, 18));
		const slugs = new Set(pages.map((p) => p.slug));
		expect(cards.length).toBeGreaterThan(0);
		expect(cards.every((c) => c.slug && slugs.has(c.slug))).toBe(true);
	});
	it('phase, answers, season end', () => {
		const tr = pages[1];
		expect(eventPhase(tr, Date.UTC(2026, 10, 1))).toBe('upcoming');
		expect(eventPhase(tr, Date.UTC(2026, 10, 20))).toBe('live');
		expect(eventPhase(tr, Date.UTC(2026, 11, 9))).toBe('ended');
		expect(endsWithSeason(tr)).toBe(true);
		expect(endsWithSeason(pages[0])).toBe(false);
		expect(endAnswer(tr, Date.UTC(2026, 10, 20))).toBe(
			'Taking Reign ends on Tuesday, December 8, 2026 at 11 AM PT / 2 PM ET, together with the current season.'
		);
		expect(startAnswer(pages[0], Date.UTC(2026, 10, 25))).toBe(
			"Junkrat's Loot Hunt started on Friday, November 20, 2026 at 11 AM PT / 2 PM ET. It ran 3 days."
		);
	});
	it('Event JSON-LD', () => {
		const ld = eventJsonLd(pages[1], 'https://resetwatch.tostu.net/events/x', 'img');
		expect(ld['@type']).toBe('Event');
		expect(ld.startDate).toBe('2026-11-03T19:00:00.000Z');
		expect(ld.endDate).toBe('2026-12-08T19:00:00.000Z');
		expect(ld.location.url).toBe(src);
	});
});
