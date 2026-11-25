/**
 * Bakes season/event dates from Cloudflare D1 into src/lib/data/events.json.
 * Never fails the build: on missing env or any error, keeps the existing file and exits 0.
 * Skips the write when rows are unchanged, so the file only changes when D1 data does.
 *
 * Env: CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const OUT = new URL('../src/lib/data/events.json', import.meta.url);
// Keep all season rows; drop events that ended more than 30 days ago.
// Needs the 2026-11-23 ingest migration (summary/facts/source columns). Before it runs, this
// query fails and the existing events.json is kept.
// Ended events stay a year: their /events pages keep answering "when did X end?".
const SQL = `SELECT kind,name,starts_at,ends_at,summary,facts,source_url,source_title FROM events
WHERE kind != 'event' OR ends_at IS NULL OR ends_at > strftime('%Y-%m-%dT%H:%M:%SZ','now','-365 days')
ORDER BY starts_at`;
const KINDS = new Set(['season_start', 'season_end', 'event']);
/** Only link to official sources; anything else in D1 is dropped, not rendered. */
const SOURCE_HOSTS = new Set(['overwatch.blizzard.com', 'us.forums.blizzard.com']);

interface D1Response {
	success: boolean;
	errors?: { message: string }[];
	result?: { success?: boolean; results?: Record<string, unknown>[] }[];
}

interface Fact {
	label: string;
	value: string;
}

interface Row {
	kind: string;
	name: string | null;
	starts_at: string | null;
	ends_at: string | null;
	summary?: string | null;
	facts?: Fact[];
	source_url?: string | null;
	source_title?: string | null;
}

const validDate = (v: unknown): v is string =>
	typeof v === 'string' && !Number.isNaN(Date.parse(v));

const shortText = (v: unknown, max: number): string | null =>
	typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null;

function sourceUrl(v: unknown): string | null {
	if (typeof v !== 'string') return null;
	try {
		const u = new URL(v);
		return u.protocol === 'https:' && SOURCE_HOSTS.has(u.hostname) ? v : null;
	} catch {
		return null;
	}
}

function parseFacts(v: unknown): Fact[] {
	if (typeof v !== 'string') return [];
	try {
		const arr: unknown = JSON.parse(v);
		if (!Array.isArray(arr)) return [];
		return arr
			.filter(
				(f): f is Fact =>
					!!f &&
					typeof f.label === 'string' &&
					typeof f.value === 'string' &&
					f.label.length <= 40 &&
					f.value.length <= 60
			)
			.slice(0, 4)
			.map((f) => ({ label: f.label, value: f.value }));
	} catch {
		return [];
	}
}

async function existing(): Promise<{ generatedAt: string | null; events: Row[] } | null> {
	try {
		return JSON.parse(await readFile(OUT, 'utf8'));
	} catch {
		return null;
	}
}

async function main(): Promise<void> {
	const { CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID } = process.env;
	if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !D1_DATABASE_ID) {
		const prev = await existing();
		const missing = [
			!CF_API_TOKEN && 'CF_API_TOKEN',
			!CF_ACCOUNT_ID && 'CF_ACCOUNT_ID',
			!D1_DATABASE_ID && 'D1_DATABASE_ID'
		].filter(Boolean);
		const stale = !prev?.generatedAt;
		const msg = `[fetch-events] missing ${missing.join(', ')}; keeping existing events.json${
			stale ? ' (EMPTY: site uses hardcoded fallbacks only)' : ''
		}`;
		if (stale && (process.env.CI || process.env.WORKERS_CI_BRANCH)) console.error(msg);
		else console.warn(msg);
		return;
	}

	const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CF_API_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ sql: SQL }),
		signal: AbortSignal.timeout(15_000)
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);

	const json = (await res.json()) as D1Response;
	if (!json.success) {
		throw new Error(json.errors?.map((e) => e.message).join('; ') || 'D1 query failed');
	}
	const rows = json.result?.[0]?.results;
	if (!Array.isArray(rows)) throw new Error('unexpected D1 response shape');

	const events: Row[] = [];
	for (const r of rows) {
		const startsOk = r.starts_at == null || validDate(r.starts_at);
		const endsOk = r.ends_at == null || validDate(r.ends_at);
		if (typeof r.kind !== 'string' || !KINDS.has(r.kind) || !startsOk || !endsOk) {
			console.warn(`[fetch-events] dropping invalid row: ${JSON.stringify(r)}`);
			continue;
		}
		const url = sourceUrl(r.source_url);
		events.push({
			kind: r.kind,
			name: typeof r.name === 'string' ? r.name : null,
			starts_at: (r.starts_at as string | null) ?? null,
			ends_at: (r.ends_at as string | null) ?? null,
			summary: shortText(r.summary, 300),
			facts: parseFacts(r.facts),
			source_url: url,
			source_title: url ? shortText(r.source_title, 200) : null
		});
	}

	const prev = await existing();
	if (prev?.generatedAt && JSON.stringify(prev.events) === JSON.stringify(events)) {
		console.log(`[fetch-events] unchanged (${events.length} events)`);
		return;
	}

	await mkdir(dirname(OUT.pathname), { recursive: true });
	await writeFile(
		OUT,
		JSON.stringify({ generatedAt: new Date().toISOString(), events }, null, '\t') + '\n'
	);
	console.log(`[fetch-events] wrote ${events.length} events`);
}

try {
	await main();
} catch (err) {
	console.warn(
		`[fetch-events] failed (${err instanceof Error ? err.message : err}); keeping existing events.json`
	);
}
