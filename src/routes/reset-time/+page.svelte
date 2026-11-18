<script lang="ts">
	import { resolve } from '$app/paths';
	import { ZONE_PAGES, zoneResets } from '../../lib/zones';
	import { breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import DocPage from '#lib/components/DocPage.svelte';

	const TITLE = 'Overwatch Reset Time by Time Zone | Resetwatch';
	const DESCRIPTION =
		'What time is the Overwatch weekly reset in your time zone? Reset times for EST, PST, CST, UTC, UK, Central Europe, Brazil, India, Japan and Australia.';

	const rows = ZONE_PAGES.map((z) => ({ z, r: zoneResets(z) }));
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

<DocPage title="RESET TIME" subtitle="BY TIME ZONE">
	<p>
		The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Pick your
		time zone for the local reset time and a live countdown, or see the
		<a href={resolve('/')}>countdown in your own time zone</a>.
	</p>

	<table>
		<caption class="sr-only">Overwatch weekly reset time by time zone</caption>
		<thead>
			<tr>
				<th scope="col">Time zone</th>
				<th scope="col">US standard time</th>
				<th scope="col">US daylight time</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as { z, r } (z.slug)}
				<tr>
					<th scope="row"
						><a href={resolve('/reset-time/[zone]', { zone: z.slug })}>{z.short}</a></th
					>
					<td>{r.std.day} {r.std.time}</td>
					<td>{r.dst.day} {r.dst.time}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<p>
		The reset is fixed in US Eastern time, so it moves in other zones when US clocks change in March
		and November. <a href={resolve('/faq')}>More in the FAQ</a>.
	</p>
</DocPage>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0 0 16px;
	}
	th,
	td {
		padding: 8px 8px 8px 0;
		text-align: left;
		border-bottom: 1px solid rgb(255 255 255 / 0.08);
	}
	thead th {
		font-size: 14px;
		color: var(--gold);
	}
	tbody th {
		font-weight: 500;
	}
	td {
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
</style>
