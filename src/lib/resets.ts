/**
 * Reset config + time helpers. Edit CONFIG below to change reset times.
 * CONFIG season/event values are fallbacks; D1 data baked into data/events.json is merged over them.
 */
import eventsJson from './data/events.json';

export const RESET_TZ = 'America/New_York';

export type Urgency = 'normal' | 'soon' | 'critical';

export const CONFIG = {
	/** Daily challenge reset, wall clock in RESET_TZ. */
	daily: { hour: 14, minute: 0 },
	/** Weekly reset. weekday: 0 = Sun … 2 = Tue. */
	weekly: { weekday: 2, hour: 13, minute: 0 },
	/** Current event end (ISO, UTC). */
	event: { label: 'Current event', endsAt: '2026-12-08T18:00:00Z' },
	/**
	 * Season start instants (Tuesdays, 19:00 UTC). S1-S5 per esports.gg/Dexerto/Dotesports;
	 * S6 (2026-12-08) per Dexerto. Later entries are estimates (9-week default) - replace
	 * when Blizzard confirms. Lengths vary (8 or 9 weeks), so list them explicitly.
	 */
	seasons: {
		year: 2026,
		starts: [
			'2026-02-10T19:00:00Z', // S1
			'2026-04-14T19:00:00Z', // S2
			'2026-06-16T19:00:00Z', // S3
			'2026-08-11T19:00:00Z', // S4
			'2026-10-06T19:00:00Z', // S5
			'2026-12-08T19:00:00Z', // S6
			'2027-02-09T19:00:00Z', // S7 (estimate)
			'2027-04-13T19:00:00Z' // S8 (estimate)
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
 * Season start instants (ISO UTC): fallback list plus season_start events,
 * sorted and deduped by instant. Fallback is returned as-is when there are none.
 */
export function mergeSeasonStarts(fallback: readonly string[], data: BakedEvents): string[] {
	const byInstant = new Map<number, string>();
	for (const s of fallback) byInstant.set(Date.parse(s), s);
	for (const e of data.events) {
		if (e.kind !== 'season_start' || !e.starts_at) continue;
		const t = Date.parse(e.starts_at);
		if (Number.isNaN(t)) continue;
		byInstant.set(t, e.starts_at);
	}
	return [...byInstant.entries()].sort((a, b) => a[0] - b[0]).map(([, s]) => s);
}

/**
 * Latest kind=event with an ends_at still in the future (relative to `now`),
 * else the fallback.
 */
export function pickCurrentEvent(
	fallback: { label: string; endsAt: string },
	data: BakedEvents,
	now: number
): { label: string; endsAt: string } {
	let best: { label: string; endsAt: string; t: number } | undefined;
	for (const e of data.events) {
		if (e.kind !== 'event' || !e.ends_at) continue;
		const t = Date.parse(e.ends_at);
		if (Number.isNaN(t) || t <= now) continue;
		if (!best || t > best.t) best = { label: e.name || fallback.label, endsAt: e.ends_at, t };
	}
	return best ? { label: best.label, endsAt: best.endsAt } : { ...fallback };
}

const seasonStarts = mergeSeasonStarts(CONFIG.seasons.starts, baked);

export function currentEvent(now: number): { label: string; endsAt: string } {
	return pickCurrentEvent(CONFIG.event, baked, now);
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

export function formatLocal(ts: number, locale?: string): string {
	return new Intl.DateTimeFormat(locale, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'short'
	}).format(new Date(ts));
}

export function formatET(ts: number, locale = 'en-US'): string {
	return new Intl.DateTimeFormat(locale, {
		weekday: 'short',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: RESET_TZ,
		timeZoneName: 'short'
	}).format(new Date(ts));
}

export function localTzName(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return 'UTC';
	}
}

/* ---------- Seasons ---------- */

export interface SeasonInfo {
	number: number;
	label: string; // `2026: SEASON 5`
	start: number;
	end: number;
	weeks: number;
	week: number; // current week, 1-based, clamped
}

/** Start/end of season at 0-based idx. Extrapolates past the known list. */
export function seasonByIndex(idx: number): { number: number; start: number; end: number } {
	const starts = seasonStarts.map((s) => Date.parse(s));
	const len = CONFIG.seasons.defaultWeeks * WEEK;
	const last = starts.length - 1;
	const startOf = (i: number) => (i <= last ? starts[i] : starts[last] + (i - last) * len);
	return { number: idx + 1, start: startOf(idx), end: startOf(idx + 1) };
}

export function seasonAt(now: number): SeasonInfo {
	let idx = 0;
	while (seasonByIndex(idx + 1).start <= now) idx++;
	const { start, end } = seasonByIndex(idx);
	const weeks = Math.round((end - start) / WEEK);
	const week = Math.min(weeks, Math.max(1, Math.floor((now - start) / WEEK) + 1));
	return {
		number: idx + 1,
		label: `${CONFIG.seasons.year}: SEASON ${idx + 1}`,
		start,
		end,
		weeks,
		week
	};
}

/* ---------- Aggregate ---------- */

export type ResetId = 'daily' | 'weekly' | 'event' | 'season';

export interface ResetEntry {
	id: ResetId;
	label: string;
	endsAt: number;
	remaining: number;
}

export function allResets(now: number): ResetEntry[] {
	const season = seasonAt(now);
	const raw: [ResetId, string, number][] = [
		['daily', 'DAILY', nextOccurrence(CONFIG.daily, now)],
		['weekly', 'WEEKLY', nextOccurrence(CONFIG.weekly, now)],
		['event', 'EVENT', Date.parse(currentEvent(now).endsAt)],
		['season', 'SEASON', season.end]
	];
	return raw.map(([id, label, endsAt]) => ({ id, label, endsAt, remaining: endsAt - now }));
}

/** Soonest upcoming reset (ignores ended ones). */
export function nextReset(now: number): ResetEntry {
	return allResets(now)
		.filter((r) => r.remaining > 0)
		.sort((a, b) => a.remaining - b.remaining)[0];
}
