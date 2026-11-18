/**
 * Reset config + time helpers. Edit CONFIG below to change reset times.
 * CONFIG season/event values are fallbacks; D1 data baked into data/events.json is merged over them.
 */
import eventsJson from './data/events.json';

export const RESET_TZ = 'America/New_York';

export type Urgency = 'normal' | 'soon' | 'critical';

export const CONFIG = {
	/** Weekly reset. weekday: 0 = Sun … 2 = Tue. */
	weekly: { weekday: 2, hour: 14, minute: 0 },
	/** Current event end (date; snapped to that Tuesday's reset). */
	event: { label: 'Current event', endsAt: '2026-12-08' },
	/**
	 * Season start dates. Seasons, events and patches all go live at the weekly reset
	 * (Tue 11 AM PT / 2 PM ET; S5 launched Tue 6 Oct 2026 11 AM PT), so only the date
	 * matters: every value is snapped to the nearest weekly reset. S1-S6 per
	 * esports.gg/Dexerto/Dotesports; later entries are estimates (9-week default) -
	 * replace when Blizzard confirms. Lengths vary (8 or 9 weeks), so list them explicitly.
	 */
	seasons: {
		starts: [
			'2026-02-10', // 2026 S1
			'2026-04-14', // 2026 S2
			'2026-06-16', // 2026 S3
			'2026-08-11', // 2026 S4
			'2026-10-06', // 2026 S5
			'2026-12-08', // 2026 S6
			'2027-02-09', // 2027 S1 (estimate)
			'2027-04-13' // 2027 S2 (estimate)
		],
		/** Length used past the last known start. */
		defaultWeeks: 9
	}
} as const;

const DAY = 86_400_000;
const WEEK = 7 * DAY;

/* ---------- Baked D1 events (src/lib/data/events.json) ---------- */

export interface BakedEvent {
	kind: 'season_start' | 'season_end' | 'event' | string;
	name?: string | null;
	starts_at?: string | null;
	ends_at?: string | null;
}

export interface BakedEvents {
	generatedAt?: string | null;
	events: BakedEvent[];
}

const baked = eventsJson as BakedEvents;

/**
 * Snap a date (`YYYY-MM-DD`) or ISO instant to the nearest weekly reset.
 * Seasons, events and patches all go live at the weekly reset, so D1 rows with
 * sloppy times (midnight UTC, 1 PM ET, ...) still land on the right instant.
 * Returns NaN for unparseable input.
 */
export function snapToReset(input: string): number {
	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
	// Date-only: noon ET-ish on that day, so it snaps to that day's reset.
	const t = dateOnly
		? Date.UTC(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3], 17)
		: Date.parse(input);
	if (Number.isNaN(t)) return NaN;
	// First reset after (t - half a week) = the reset closest to t.
	return nextOccurrence(CONFIG.weekly, t - WEEK / 2);
}

/**
 * Season start instants (ms): fallback list plus season_start events,
 * snapped to the weekly reset, sorted and deduped.
 */
export function mergeSeasonStarts(fallback: readonly string[], data: BakedEvents): number[] {
	const out = new Set<number>();
	for (const s of fallback) out.add(snapToReset(s));
	for (const e of data.events) {
		if (e.kind !== 'season_start' || !e.starts_at) continue;
		out.add(snapToReset(e.starts_at));
	}
	out.delete(NaN);
	return [...out].sort((a, b) => a - b);
}

export interface ActiveEvent {
	label: string;
	/** ms; undefined when D1 has no start (treated as already live). */
	startsAt?: number;
	endsAt: number;
	phase: 'live' | 'upcoming';
}

/** Max event cards shown at once. */
export const MAX_EVENTS = 4;

/**
 * All kind=event rows not yet ended (relative to `now`): live ones first by end time,
 * then upcoming ones by start time. Capped at `max`. Falls back to the single
 * hardcoded event when none qualify, or to nothing once that has ended too.
 * Start and end are snapped to the weekly reset.
 */
export function activeEvents(
	fallback: { label: string; endsAt: string },
	data: BakedEvents,
	now: number,
	max = MAX_EVENTS
): ActiveEvent[] {
	const out: ActiveEvent[] = [];
	for (const e of data.events) {
		if (e.kind !== 'event' || !e.ends_at) continue;
		const endsAt = snapToReset(e.ends_at);
		if (Number.isNaN(endsAt) || endsAt <= now) continue;
		const s = e.starts_at ? snapToReset(e.starts_at) : NaN;
		const startsAt = Number.isNaN(s) ? undefined : s;
		out.push({
			label: e.name || fallback.label,
			startsAt,
			endsAt,
			phase: startsAt !== undefined && startsAt > now ? 'upcoming' : 'live'
		});
	}
	if (out.length === 0) {
		const endsAt = snapToReset(fallback.endsAt);
		return endsAt > now ? [{ label: fallback.label, endsAt, phase: 'live' }] : [];
	}
	out.sort((a, b) => {
		if (a.phase !== b.phase) return a.phase === 'live' ? -1 : 1;
		return a.phase === 'live' ? a.endsAt - b.endsAt : a.startsAt! - b.startsAt!;
	});
	return out.slice(0, max);
}

let seasonStartsCache: number[] | undefined;
/** Lazy: snapping needs the formatters defined further down. */
function seasonStarts(): number[] {
	return (seasonStartsCache ??= mergeSeasonStarts(CONFIG.seasons.starts, baked));
}

export function currentEvents(now: number): ActiveEvent[] {
	return activeEvents(CONFIG.event, baked, now);
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string): Intl.DateTimeFormat {
	let f = dtfCache.get(tz);
	if (!f) {
		f = new Intl.DateTimeFormat('en-US', {
			timeZone: tz,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		});
		dtfCache.set(tz, f);
	}
	return f;
}

function parts(ts: number, tz: string) {
	const o: Record<string, number> = {};
	for (const p of dtf(tz).formatToParts(new Date(ts))) {
		if (p.type !== 'literal') o[p.type] = Number(p.value);
	}
	return o as {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
		second: number;
	};
}

/** Offset (ms) of tz from UTC at instant ts. */
export function tzOffset(ts: number, tz: string): number {
	const p = parts(ts, tz);
	const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
	return asUtc - Math.floor(ts / 1000) * 1000;
}

/** Wall-clock time in tz -> UTC ms. DST safe. */
export function zonedToUtc(
	y: number,
	m: number,
	d: number,
	h: number,
	min: number,
	tz: string
): number {
	const guess = Date.UTC(y, m - 1, d, h, min);
	let t = guess - tzOffset(guess, tz);
	t = guess - tzOffset(t, tz);
	return t;
}

export interface Rule {
	weekday?: number;
	hour: number;
	minute: number;
	tz?: string;
}

/** Next instant strictly after `now` matching rule. */
export function nextOccurrence(rule: Rule, now: number): number {
	const tz = rule.tz ?? RESET_TZ;
	const p = parts(now, tz);
	for (let i = 0; i < 9; i++) {
		const base = Date.UTC(p.year, p.month - 1, p.day + i);
		const c = new Date(base);
		if (rule.weekday !== undefined && c.getUTCDay() !== rule.weekday) continue;
		const t = zonedToUtc(
			c.getUTCFullYear(),
			c.getUTCMonth() + 1,
			c.getUTCDate(),
			rule.hour,
			rule.minute,
			tz
		);
		if (t > now) return t;
	}
	throw new Error('no occurrence found');
}

export interface Split {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export function splitDuration(ms: number): Split {
	const s = Math.max(0, Math.floor(ms / 1000));
	return {
		days: Math.floor(s / 86400),
		hours: Math.floor((s % 86400) / 3600),
		minutes: Math.floor((s % 3600) / 60),
		seconds: s % 60
	};
}

/** Exact countdown, e.g. `2D 14H 37M`, `14H 37M 05S`, `37M 05S`. */
export function formatCountdown(ms: number): string {
	const { days, hours, minutes, seconds } = splitDuration(ms);
	const pad = (n: number) => String(n).padStart(2, '0');
	if (days > 0) return `${days}D ${hours}H ${pad(minutes)}M`;
	if (hours > 0) return `${hours}H ${pad(minutes)}M ${pad(seconds)}S`;
	return `${minutes}M ${pad(seconds)}S`;
}

/** Game-style coarse phrasing: `19 HOURS`, `21 DAYS`, `1 HOUR`. */
export function coarse(ms: number): string {
	const { days, hours, minutes } = splitDuration(ms);
	const unit = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 'S'}`;
	if (days > 0) return unit(days, 'DAY');
	if (hours > 0) return unit(hours, 'HOUR');
	return unit(Math.max(minutes, 1), 'MINUTE');
}

export function urgency(ms: number): Urgency {
	if (ms < 3_600_000) return 'critical';
	if (ms < DAY) return 'soon';
	return 'normal';
}

/**
 * Time in the viewer's zone, e.g. `Tue, Nov 24, 20:00 CET`. Pass `tz` (IANA) to pin the zone;
 * without it the runtime's zone is used (UTC during prerender, so the label stays explicit
 * until the client swaps in local time).
 */
export function formatLocal(ts: number, locale?: string, tz?: string): string {
	const opts: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: tz || undefined,
		timeZoneName: 'short'
	};
	const text = new Intl.DateTimeFormat(locale, opts).format(new Date(ts));
	// en-US prints `GMT+1`; en-GB knows `CET`/`BST`. Prefer the readable abbreviation.
	if (!locale && /GMT[+-]/.test(text)) {
		const alt = new Intl.DateTimeFormat('en-GB', opts).format(new Date(ts));
		if (!/GMT[+-]/.test(alt)) return alt;
	}
	return text;
}

/* ---------- Seasons ---------- */

export interface SeasonRef {
	/** 0-based index into the season list. */
	index: number;
	/** Year the season started in (ET). */
	year: number;
	/** Season number within that year: `2026: SEASON 5`. */
	number: number;
	label: string;
	start: number;
	end: number;
}

export interface SeasonInfo extends SeasonRef {
	weeks: number;
	week: number; // current week, 1-based, clamped
}

/** Start/end of season at 0-based idx. Extrapolates past the known list. */
export function seasonByIndex(idx: number): SeasonRef {
	const starts = seasonStarts();
	const len = CONFIG.seasons.defaultWeeks * WEEK;
	const last = starts.length - 1;
	const startOf = (i: number) => (i <= last ? starts[i] : starts[last] + (i - last) * len);
	const yearOf = (i: number) => parts(startOf(i), RESET_TZ).year;
	const year = yearOf(idx);
	// Numbering restarts every year (`2026: SEASON 5`, then `2027: SEASON 1`).
	let number = 1;
	for (let i = idx - 1; i >= 0 && yearOf(i) === year; i--) number++;
	return {
		index: idx,
		year,
		number,
		label: `${year}: SEASON ${number}`,
		start: startOf(idx),
		end: startOf(idx + 1)
	};
}

export function seasonAt(now: number): SeasonInfo {
	let idx = 0;
	while (seasonByIndex(idx + 1).start <= now) idx++;
	const ref = seasonByIndex(idx);
	const weeks = Math.round((ref.end - ref.start) / WEEK);
	const week = Math.min(weeks, Math.max(1, Math.floor((now - ref.start) / WEEK) + 1));
	return { ...ref, weeks, week };
}

/* ---------- Aggregate ---------- */

export type ResetId = 'weekly' | 'event' | 'season';

export interface ResetEntry {
	/** Unique per card (events get one id each). */
	id: string;
	kind: ResetId;
	label: string;
	/** Event name when kind is `event`. */
	name?: string;
	/** Countdown target: end for live entries, start for upcoming events. */
	endsAt: number;
	remaining: number;
	phase: 'live' | 'upcoming';
}

export function allResets(now: number): ResetEntry[] {
	const season = seasonAt(now);
	const entry = (
		kind: ResetId,
		label: string,
		endsAt: number,
		extra: Partial<ResetEntry> = {}
	): ResetEntry => ({
		id: kind,
		kind,
		label,
		endsAt,
		remaining: endsAt - now,
		phase: 'live',
		...extra
	});
	const events = currentEvents(now).map((e) =>
		e.phase === 'upcoming'
			? entry('event', e.label.toUpperCase(), e.startsAt!, {
					id: `event:${e.startsAt}:${e.endsAt}:${e.label}`,
					name: e.label,
					phase: 'upcoming'
				})
			: entry('event', e.label.toUpperCase(), e.endsAt, {
					id: `event:${e.startsAt ?? ''}:${e.endsAt}:${e.label}`,
					name: e.label
				})
	);
	return [
		entry('weekly', 'WEEKLY', nextOccurrence(CONFIG.weekly, now)),
		...events,
		entry('season', 'SEASON', season.end)
	];
}

/** Soonest live reset (ignores ended ones and not-yet-started events). */
export function nextReset(now: number): ResetEntry {
	return allResets(now)
		.filter((r) => r.remaining > 0 && r.phase === 'live')
		.sort((a, b) => a.remaining - b.remaining)[0];
}
