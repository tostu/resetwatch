/** URL slugs for event pages. No imports, so resets.ts and event-pages.ts can both use it. */

const MONTHS = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

/** `Junkrat's Loot Hunt + Double XP` -> `junkrats-loot-hunt-double-xp` (max 60 chars). */
export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/['’]/g, '')
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60)
		.replace(/-+$/, '');
}

/**
 * `taking-reign-november-2026`. Events recur (Junkrat's Loot Hunt runs several times a year),
 * so the month and year of the start (or end, if no start) keep slugs unique and searchable.
 * Times are reset instants (2 PM ET = 18/19 UTC), so the UTC date is the ET date.
 */
export function eventSlug(name: string, at: number): string {
	const d = new Date(at);
	return `${slugify(name) || 'event'}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}
