/**
 * Bakes season/event dates from Cloudflare D1 into src/lib/data/events.json.
 * Never fails the build: on missing env or any error, keeps the existing file and exits 0.
 *
 * Env: CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const OUT = new URL('../src/lib/data/events.json', import.meta.url);
const SQL = 'SELECT kind,name,starts_at,ends_at FROM events ORDER BY starts_at';

interface D1Response {
	success: boolean;
	errors?: { message: string }[];
	result?: { success?: boolean; results?: Record<string, unknown>[] }[];
}

async function main(): Promise<void> {
	const { CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID } = process.env;
	if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !D1_DATABASE_ID) {
		console.warn(
			'[fetch-events] CF_API_TOKEN / CF_ACCOUNT_ID / D1_DATABASE_ID not set; keeping existing events.json'
		);
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

	const events = rows.map((r) => ({
		kind: r.kind,
		name: r.name ?? null,
		starts_at: r.starts_at ?? null,
		ends_at: r.ends_at ?? null
	}));

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
