/**
 * Per-time-zone reset pages (`/reset-time/[zone]`). All times derive from CONFIG.weekly
 * (Tue 2 PM New York), so a change to the reset rule flows through every page.
 */
import { CONFIG, RESET_TZ, tzOffset, zonedToUtc } from './resets';

export interface ZonePage {
	slug: string;
	/** Used in the H1 and title: "Overwatch Reset Time in {name}". */
	name: string;
	/** Short label for the title tag and breadcrumbs. */
	short: string;
	tz: string;
	/** 12-hour clock where that is the local habit. */
	h12: boolean;
	/** What the zone is called while US clocks are on standard time / daylight time. */
	abbrStd: string;
	abbrDst: string;
	/** Where this zone applies, in one sentence. */
	region: string;
}

export const ZONE_PAGES: ZonePage[] = [
	{
		slug: 'pst',
		name: 'Pacific Time (PST / PT)',
		short: 'PST / PT',
		tz: 'America/Los_Angeles',
		h12: true,
		abbrStd: 'PST',
		abbrDst: 'PDT',
		region:
			'Pacific Time covers California, Washington, Oregon, Nevada and Vancouver, and is the zone Blizzard is based in.'
	},
	{
		slug: 'est',
		name: 'Eastern Time (EST / ET)',
		short: 'EST / ET',
		tz: 'America/New_York',
		h12: true,
		abbrStd: 'EST',
		abbrDst: 'EDT',
		region:
			'Eastern Time covers New York, Washington DC, Florida, Toronto and most of the US East Coast. The reset is defined in this zone, so it is the same wall-clock time all year.'
	},
	{
		slug: 'cst',
		name: 'Central Time (CST / CT)',
		short: 'CST / CT',
		tz: 'America/Chicago',
		h12: true,
		abbrStd: 'CST',
		abbrDst: 'CDT',
		region: 'Central Time covers Chicago, Dallas, Houston, Mexico City and much of the US Midwest.'
	},
	{
		slug: 'brt',
		name: 'Brasília Time (BRT)',
		short: 'BRT / Brazil',
		tz: 'America/Sao_Paulo',
		h12: false,
		abbrStd: 'BRT',
		abbrDst: 'BRT',
		region:
			'Brasília Time covers São Paulo, Rio de Janeiro and most of Brazil. Brazil does not use daylight saving time, so only the US clock change moves the reset.'
	},
	{
		slug: 'utc',
		name: 'UTC',
		short: 'UTC',
		tz: 'UTC',
		h12: false,
		abbrStd: 'UTC',
		abbrDst: 'UTC',
		region:
			'UTC never changes with the seasons, which is why the reset hour in UTC moves when US clocks change.'
	},
	{
		slug: 'uk',
		name: 'the UK (GMT / BST)',
		short: 'UK',
		tz: 'Europe/London',
		h12: false,
		abbrStd: 'GMT',
		abbrDst: 'BST',
		region: 'The UK and Ireland use GMT in winter and British Summer Time from late March.'
	},
	{
		slug: 'cet',
		name: 'Central Europe (CET / CEST)',
		short: 'CET / Germany',
		tz: 'Europe/Berlin',
		h12: false,
		abbrStd: 'CET',
		abbrDst: 'CEST',
		region:
			'Central European Time covers Germany, France, Spain, Italy, the Netherlands, Poland and most of central Europe.'
	},
	{
		slug: 'ist',
		name: 'India (IST)',
		short: 'IST / India',
		tz: 'Asia/Kolkata',
		h12: false,
		abbrStd: 'IST',
		abbrDst: 'IST',
		region:
			'India Standard Time is UTC+5:30 all year. The reset lands around midnight, so the day flips between Tuesday and Wednesday when US clocks change.'
	},
	{
		slug: 'jst',
		name: 'Japan (JST)',
		short: 'JST / Japan',
		tz: 'Asia/Tokyo',
		h12: false,
		abbrStd: 'JST',
		abbrDst: 'JST',
		region: 'Japan Standard Time is UTC+9 all year. In Japan the reset falls on Wednesday morning.'
	},
	{
		slug: 'aest',
		name: 'Australia East (AEST / AEDT)',
		short: 'AEST / Sydney',
		tz: 'Australia/Sydney',
		h12: false,
		abbrStd: 'AEDT',
		abbrDst: 'AEST',
		region:
			'Sydney, Melbourne, Canberra and Hobart. Southern-hemisphere clocks change in the opposite season to the US, so the shift between the two reset times is larger.'
	}
];

export function zonePage(slug: string): ZonePage | undefined {
	return ZONE_PAGES.find((z) => z.slug === slug);
}

/**
 * Reference Tuesdays. Plain `Date.UTC` of a fixed week would be wrong around DST, so the
 * instants are built from the reset rule itself: 2 PM New York on a Tuesday in
 * January (US standard time) and in July (US daylight time).
 */
function refInstant(y: number, m: number, d: number): number {
	return zonedToUtc(y, m, d, CONFIG.weekly.hour, CONFIG.weekly.minute, RESET_TZ);
}
const STD_REF = refInstant(2027, 1, 12); // Tue
const DST_REF = refInstant(2027, 7, 13); // Tue

function offsetLabel(ts: number, tz: string): string {
	const mins = Math.round(tzOffset(ts, tz) / 60_000);
	const sign = mins < 0 ? '−' : '+';
	const h = Math.floor(Math.abs(mins) / 60);
	const m = Math.abs(mins) % 60;
	return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

export interface ZoneReset {
	day: string;
	/** Full weekday name, e.g. `Tuesday`. */
	dayLong: string;
	time: string;
	offset: string;
	abbr: string;
}

function resetAt(z: ZonePage, ts: number, abbr: string): ZoneReset {
	const parts = (opts: Intl.DateTimeFormatOptions) =>
		Object.fromEntries(
			new Intl.DateTimeFormat('en-US', { timeZone: z.tz, ...opts })
				.formatToParts(new Date(ts))
				.map((x) => [x.type, x.value])
		);
	const t = parts({
		hour: z.h12 ? 'numeric' : '2-digit',
		minute: '2-digit',
		hour12: z.h12,
		weekday: 'long'
	});
	return {
		day: t.weekday.slice(0, 3).toUpperCase(),
		dayLong: t.weekday,
		time: z.h12 ? `${t.hour}:${t.minute} ${t.dayPeriod}` : `${t.hour}:${t.minute}`,
		offset: offsetLabel(ts, z.tz),
		abbr
	};
}

export function zoneResets(z: ZonePage): { std: ZoneReset; dst: ZoneReset; shifts: boolean } {
	const std = resetAt(z, STD_REF, z.abbrStd);
	const dst = resetAt(z, DST_REF, z.abbrDst);
	return { std, dst, shifts: std.time !== dst.time || std.dayLong !== dst.dayLong };
}

/** One-sentence answer, used on the page, in the FAQ markup and in the meta description. */
export function zoneAnswer(z: ZonePage): string {
	const { std, dst, shifts } = zoneResets(z);
	const label = z.slug === 'utc' ? 'UTC' : z.name;
	if (!shifts) {
		return z.tz === RESET_TZ
			? `The Overwatch weekly reset in ${label} is every ${std.dayLong} at ${std.time}, all year round.`
			: `The Overwatch weekly reset in ${label} is ${std.dayLong} at ${std.time} for most of the year. For about three weeks in March and again around the end of October or early November it is one hour earlier or later, because US and local clocks change on different dates.`;
	}
	return `The Overwatch weekly reset in ${label} is ${std.dayLong} at ${std.time} (${std.abbr}) while US clocks are on standard time, and ${dst.dayLong} at ${dst.time} (${dst.abbr}) while US clocks are on daylight time.`;
}

export function zoneTitle(z: ZonePage): string {
	return `Overwatch Reset Time in ${z.short} | Resetwatch`;
}

export function zoneDescription(z: ZonePage): string {
	const { std, dst, shifts } = zoneResets(z);
	return shifts
		? `Overwatch weekly reset in ${z.short}: ${std.dayLong} ${std.time} (${std.abbr}) or ${dst.dayLong} ${dst.time} (${dst.abbr}). Live countdown to the next reset.`
		: `Overwatch weekly reset in ${z.short}: ${std.dayLong} at ${std.time} for most of the year. Live countdown to the next reset.`;
}
