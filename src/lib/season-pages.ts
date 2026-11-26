/** Per-season pages (`/seasons/[slug]`). Dates come from the season list in resets.ts. */
import { seasonByIndex, type SeasonRef } from './resets';

const WEEK = 7 * 86_400_000;

export interface SeasonPage {
	slug: string;
	/** 0-based index into the season list in resets.ts. */
	index: number;
	/** False while the start date is only an estimate (see CONFIG.seasons in resets.ts). */
	confirmed: boolean;
}

export const SEASON_PAGES: SeasonPage[] = [
	// Archive: past seasons answer "when did season N end" searches.
	{ slug: '2026-season-1', index: 0, confirmed: true },
	{ slug: '2026-season-2', index: 1, confirmed: true },
	{ slug: '2026-season-3', index: 2, confirmed: true },
	{ slug: '2026-season-4', index: 3, confirmed: true },
	{ slug: '2026-season-5', index: 4, confirmed: true },
	{ slug: '2026-season-6', index: 5, confirmed: true },
	{ slug: '2027-season-1', index: 6, confirmed: false }
];

export function seasonPage(slug: string): SeasonPage | undefined {
	return SEASON_PAGES.find((s) => s.slug === slug);
}

/** Slug of the season's page, if it has one. */
export function seasonSlug(ref: SeasonRef): string | undefined {
	return SEASON_PAGES.find((s) => s.index === ref.index)?.slug;
}

export interface SeasonDetail {
	page: SeasonPage;
	season: SeasonRef;
	weeks: number;
	/** The end is the next season's start, so it is only as firm as that date. */
	endConfirmed: boolean;
	/** `Overwatch 2026 Season 6`. */
	name: string;
	prev?: SeasonRef;
	next: SeasonRef;
}

export function seasonDetail(page: SeasonPage): SeasonDetail {
	const season = seasonByIndex(page.index);
	return {
		page,
		season,
		weeks: Math.round((season.end - season.start) / WEEK),
		name: `Overwatch ${season.year} Season ${season.number}`,
		endConfirmed: SEASON_PAGES.find((s) => s.index === page.index + 1)?.confirmed ?? false,
		prev: page.index > 0 ? seasonByIndex(page.index - 1) : undefined,
		next: seasonByIndex(page.index + 1)
	};
}

/** Fixed-zone date for static text, e.g. `Tuesday, December 8, 2026`. */
export function longDate(ts: number, tz: string): string {
	return new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(new Date(ts));
}

/** `11 AM PT / 2 PM ET`, the way the reset time is usually quoted. */
export function resetClock(ts: number): string {
	const t = (tz: string) =>
		new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })
			.format(new Date(ts))
			.replace(':00', '');
	return `${t('America/Los_Angeles')} PT / ${t('America/New_York')} ET`;
}

/** Past seasons (as of the build) lead with the end date: that is what people look up later. */
export function seasonTitle(d: SeasonDetail, now = Date.now()): string {
	if (d.season.end <= now) return `${d.name}: Start & End Date | Resetwatch`;
	if (d.season.start <= now) return `${d.name} End Date & Countdown | Resetwatch`;
	return `${d.name} Release Date: Start, End & Countdown | Resetwatch`;
}

export function seasonDescription(d: SeasonDetail, now = Date.now()): string {
	const s = longDate(d.season.start, 'America/New_York');
	const e = longDate(d.season.end, 'America/New_York');
	if (d.season.end <= now) {
		return `When did ${d.name} end? It ran from ${s} to ${e} (${d.weeks} weeks), start and end at the weekly reset.`;
	}
	const verb = d.page.confirmed ? 'starts' : 'is expected to start';
	const endVerb = d.endConfirmed ? 'ends' : 'ends around';
	return `When does ${d.name} start? It ${verb} ${s} and ${endVerb} ${e} (${d.weeks} weeks). Live countdown in your local time.`;
}

export function startAnswer(d: SeasonDetail, now = Date.now()): string {
	const when = `${longDate(d.season.start, 'America/New_York')} at ${resetClock(d.season.start)}`;
	if (d.season.start <= now) return `${d.name} started on ${when}, at the weekly reset.`;
	return d.page.confirmed
		? `${d.name} starts on ${when}, at the weekly reset.`
		: `${d.name} is expected to start on ${when}, at the weekly reset. This date is an estimate until Blizzard confirms it.`;
}

export function endAnswer(d: SeasonDetail, now = Date.now()): string {
	const when = `${longDate(d.season.end, 'America/New_York')} at ${resetClock(d.season.end)}`;
	if (d.season.end <= now) {
		return `${d.name} ended on ${when}, when the next season began. It ran ${d.weeks} weeks.`;
	}
	return d.endConfirmed
		? `${d.name} ends on ${when}, when the next season begins. It runs ${d.weeks} weeks.`
		: `${d.name} is expected to end on ${when}, when the next season begins. It runs ${d.weeks} weeks. This date is an estimate until Blizzard confirms the next season.`;
}
