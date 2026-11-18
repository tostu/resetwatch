<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { CONFIG, nextOccurrence, tzOffset } from '../resets';

	let { now }: { now: number } = $props();

	interface Zone {
		tz: string;
		city: string;
		abbr: string;
		/** 12-hour clock where that is the local habit. */
		h12: boolean;
		/** Slug of this zone's `/reset-time/[zone]` page, when it has one. */
		slug?: string;
	}

	const ZONES: Zone[] = [
		{ tz: 'America/Los_Angeles', city: 'Los Angeles', abbr: 'PT', h12: true, slug: 'pst' },
		{ tz: 'America/New_York', city: 'New York', abbr: 'ET', h12: true, slug: 'est' },
		{ tz: 'America/Sao_Paulo', city: 'São Paulo', abbr: 'BRT', h12: false, slug: 'brt' },
		{ tz: 'Europe/London', city: 'London', abbr: 'UK', h12: false, slug: 'uk' },
		{ tz: 'Europe/Berlin', city: 'Berlin', abbr: 'CET', h12: false, slug: 'cet' },
		{ tz: 'Asia/Kolkata', city: 'Mumbai', abbr: 'IST', h12: false, slug: 'ist' },
		{ tz: 'Asia/Tokyo', city: 'Tokyo', abbr: 'JST', h12: false, slug: 'jst' },
		{ tz: 'Australia/Sydney', city: 'Sydney', abbr: 'AET', h12: false, slug: 'aest' }
	];

	// Set after hydration so the server-rendered table stays identical for every visitor.
	let myTz = $state('');
	onMount(() => {
		myTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	});

	const reset = $derived(nextOccurrence(CONFIG.weekly, now));

	function offsetLabel(ts: number, tz: string): string {
		const mins = Math.round(tzOffset(ts, tz) / 60_000);
		const sign = mins < 0 ? '−' : '+';
		const h = Math.floor(Math.abs(mins) / 60);
		const m = Math.abs(mins) % 60;
		return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
	}

	function whenIn(ts: number, tz: string, h12: boolean) {
		const f = new Intl.DateTimeFormat('en-US', {
			timeZone: tz,
			weekday: 'short',
			hour: h12 ? 'numeric' : '2-digit',
			minute: '2-digit',
			hour12: h12
		});
		const p = Object.fromEntries(f.formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
		const time = h12 ? `${p.hour}:${p.minute} ${p.dayPeriod}` : `${p.hour}:${p.minute}`;
		return { day: p.weekday.toUpperCase(), time };
	}

	function cityOf(tz: string): string {
		return (tz.split('/').pop() ?? tz).replaceAll('_', ' ');
	}

	const rows = $derived.by(() => {
		const zones: Zone[] = [...ZONES];
		if (myTz && !zones.some((z) => z.tz === myTz)) {
			zones.unshift({ tz: myTz, city: cityOf(myTz), abbr: 'LOCAL', h12: false });
		}
		return zones.map((z) => ({
			...z,
			...whenIn(reset, z.tz, z.h12),
			offset: offsetLabel(reset, z.tz),
			you: z.tz === myTz
		}));
	});
</script>

<table class="zones">
	<caption class="sr-only">Next Overwatch weekly reset in major time zones</caption>
	<thead>
		<tr class="label">
			<th scope="col">CITY</th>
			<th scope="col" class="off">OFFSET</th>
			<th scope="col">DAY</th>
			<th scope="col" class="t">RESET TIME</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as r (r.tz)}
			<tr class:you={r.you}>
				<th scope="row">
					{#if r.slug}
						<a class="city" href={resolve('/reset-time/[zone]', { zone: r.slug })}>{r.city}</a>
					{:else}
						<span class="city">{r.city}</span>
					{/if}
					<span class="label abbr">{r.abbr}</span>
					{#if r.you}<span class="tag">YOU</span>{/if}
				</th>
				<td class="off num">{r.offset}</td>
				<td class="day label">{r.day}</td>
				<td class="t num">{r.time}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.zones {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0 4px;
		font-size: 16px;
	}
	thead th {
		padding: 0 14px 4px;
		font-size: 13px;
		text-align: left;
		color: var(--gold);
	}
	thead .t {
		text-align: right;
	}
	tbody tr {
		background: rgb(5 8 24 / 0.45);
	}
	tbody th,
	tbody td {
		padding: 10px 14px;
		text-align: left;
		vertical-align: middle;
	}
	/* Slanted accent edge like the game's list rows. */
	tbody th {
		border-left: 4px solid transparent;
		font-weight: 500;
	}
	tbody tr.you {
		background: linear-gradient(90deg, rgb(255 255 255 / 0.22), rgb(5 8 24 / 0.45) 75%);
	}
	tbody tr.you th {
		border-left-color: var(--gold);
	}
	.city {
		margin-right: 8px;
	}
	a.city {
		color: inherit;
		text-underline-offset: 3px;
	}
	a.city:hover {
		text-decoration: underline;
	}
	.abbr {
		font-size: 13px;
		color: var(--text-faint);
	}
	.tag {
		margin-left: 10px;
		height: 20px;
		font-size: 12px;
		vertical-align: 1px;
	}
	.off {
		font-size: 15px;
		color: var(--text-dim);
		white-space: nowrap;
	}
	.day {
		font-size: 15px;
		color: var(--cyan);
	}
	td.off {
		color: rgb(255 255 255 / 0.75);
	}
	td.t {
		text-align: right;
		font-size: 24px;
		font-style: italic;
		font-weight: 800;
		white-space: nowrap;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (max-width: 559px) {
		.off {
			display: none;
		}
		tbody th,
		tbody td {
			padding: 9px 10px;
		}
		td.t {
			font-size: 21px;
		}
	}
</style>
