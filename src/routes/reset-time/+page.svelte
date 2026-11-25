<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../lib/now.svelte';
	import { CONFIG, nextOccurrence } from '../../lib/resets';
	import { ZONE_PAGES, zoneResets } from '../../lib/zones';
	import { breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import PageHero from '#lib/components/PageHero.svelte';

	const TITLE = 'Overwatch Reset Time by Time Zone | Resetwatch';
	const DESCRIPTION =
		'What time is the Overwatch weekly reset in your time zone? Reset times for EST, PST, CST, UTC, UK, Central Europe, Brazil, India, Japan and Australia.';

	$effect(() => clock.start());

	const remaining = $derived(nextOccurrence(CONFIG.weekly, clock.now) - clock.now);

	const rows = ZONE_PAGES.map((z) => ({ z, r: zoneResets(z) }));
	const gapRows = rows.filter((x) => x.r.gap);
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Reset time by time zone', path: '/reset-time' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="blue"
		glyph="clock"
		eyebrow="EVERY TUESDAY"
		title="RESET TIME"
		subtitle="BY TIME ZONE"
		ms={remaining}
		msLabel="NEXT WEEKLY RESET IN"
	/>

	<div class="column">
		<p class="intro">
			The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Pick your
			time zone for the local reset time and a live countdown, or see the
			<a href={resolve('/')}>countdown in your own time zone</a>.
		</p>

		<h2 class="label sec">LOCAL RESET TIME</h2>
		<div class="panel">
			<table class="zones">
				<caption class="sr-only">Overwatch weekly reset time by time zone</caption>
				<thead>
					<tr class="label">
						<th scope="col">ZONE</th>
						<th scope="col" class="c">US STANDARD<span class="sub"> · NOV–MAR</span></th>
						<th scope="col" class="c">US DAYLIGHT<span class="sub"> · MAR–NOV</span></th>
					</tr>
				</thead>
				<tbody>
					{#each rows as { z, r } (z.slug)}
						<tr>
							<th scope="row">
								<a class="name" href={resolve('/reset-time/[zone]', { zone: z.slug })}>{z.short}</a>
							</th>
							<td class="c">
								<span class="num t">{r.std.time}</span>
								<span class="label day">{r.std.day}</span>
							</td>
							<td class="c">
								<span class="num t">{r.dst.time}</span>
								<span class="label day">{r.dst.day}</span>{#if r.gap}<abbr title="See note below"
										>*</abbr
									>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="notes">
			{#if gapRows.length}
				<p class="note">
					<span class="label">* GAP WEEKS</span>
					For about three weeks in March and one week around the end of October, US clocks are on daylight
					time while Europe is not. The reset then lands one hour earlier:
					{#each gapRows as { z, r }, i (z.slug)}
						{z.short}
						{r.gap!.time}{i < gapRows.length - 1 ? ', ' : '.'}
					{/each}
				</p>
			{/if}
			<p class="note">
				<span class="label">WHY IT MOVES</span>
				The reset is fixed in US Eastern time, so it moves in other zones when US clocks change in March
				and November. <a href={resolve('/faq')}>More in the FAQ</a>.
			</p>
		</div>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}
	.panel {
		padding: 8px 12px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
		overflow-x: auto;
	}
	.intro {
		margin: 0 auto 32px;
		max-width: 64ch;
		text-align: center;
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.intro a {
		color: inherit;
		text-underline-offset: 3px;
	}
	.sec {
		margin: 0 0 12px;
		font-size: 15px;
		color: var(--text-faint);
	}

	.zones {
		width: 100%;
		border-collapse: collapse;
	}
	tbody tr:first-child {
		border-top: 0;
	}
	thead th {
		padding: 0 16px 4px;
		font-size: 13px;
		text-align: left;
		color: var(--text-faint);
	}
	.sub {
		color: var(--text-faint);
	}
	tbody tr {
		border-top: 1px solid var(--line);
		transition: background 0.15s;
	}
	tbody tr:hover {
		background: rgb(255 255 255 / 0.05);
	}
	tbody th,
	tbody td {
		padding: 12px 16px;
		text-align: left;
		vertical-align: middle;
		white-space: nowrap;
	}
	tbody th {
		font-weight: 500;
	}
	.name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 22px;
		letter-spacing: 0.02em;
		color: var(--text);
		text-underline-offset: 3px;
	}
	.name:hover {
		text-decoration: underline;
	}
	.t {
		font-size: 24px;
		font-weight: 700;
		color: var(--text);
	}
	.day {
		margin-left: 6px;
		font-size: 13px;
		color: var(--text-dim);
	}
	abbr {
		text-decoration: none;
		color: var(--text-faint);
		margin-left: 2px;
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

	.notes {
		display: grid;
		gap: 10px;
		margin-top: 32px;
	}
	.note {
		margin: 0;
		padding-left: 14px;
		border-left: 2px solid rgb(255 255 255 / 0.18);
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.note .label {
		display: block;
		font-size: 13px;
		color: var(--text);
	}
	.note a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}

	@media (max-width: 559px) {
		.sub,
		.day {
			display: none;
		}
		tbody th,
		tbody td {
			padding: 10px;
		}
		.name {
			font-size: 18px;
		}
		.t {
			font-size: 20px;
		}
	}
</style>
