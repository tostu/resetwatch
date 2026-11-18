<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../../lib/now.svelte';
	import { CONFIG, formatLocal, coarse, nextOccurrence } from '../../../lib/resets';
	import {
		seasonPage,
		seasonDetail,
		seasonSlug,
		seasonTitle,
		seasonDescription,
		startAnswer,
		endAnswer
	} from '../../../lib/season-pages';
	import { breadcrumbJsonLd, jsonLdScript } from '../../../lib/seo';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TimeLeft from '#lib/components/TimeLeft.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => clock.start());

	const d = $derived(seasonDetail(seasonPage(data.slug)!));
	const title = $derived(seasonTitle(d));
	const description = $derived(seasonDescription(d));
	const q = $derived([
		{ q: `When does ${d.name} start?`, a: startAnswer(d) },
		{ q: `When does ${d.name} end?`, a: endAnswer(d) }
	]);

	const phase = $derived(
		clock.now < d.season.start ? 'upcoming' : clock.now < d.season.end ? 'live' : 'ended'
	);
	const countdownTarget = $derived(phase === 'upcoming' ? d.season.start : d.season.end);
	const remaining = $derived(countdownTarget - clock.now);
	const weekStarts = $derived(
		// The reset is fixed in New York time, so its UTC instant moves with US clock changes:
		// take the reset nearest to start + n weeks instead of adding exact multiples.
		Array.from({ length: d.weeks }, (_, i) =>
			nextOccurrence(CONFIG.weekly, d.season.start + i * 7 * 86_400_000 - 12 * 3_600_000)
		)
	);
	const prevSlug = $derived(d.prev ? seasonSlug(d.prev) : undefined);
	const nextSlug = $derived(seasonSlug(d.next));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{@html jsonLdScript({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: q.map((x) => ({
			'@type': 'Question',
			name: x.q,
			acceptedAnswer: { '@type': 'Answer', text: x.a }
		}))
	})}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Overwatch Seasons', path: '/seasons' },
			{ name: d.season.label, path: `/seasons/${data.slug}` }
		])
	)}
</svelte:head>

<div class="wrap page">
	<div class="top">
		<PageTitle
			title={d.season.label}
			subtitle={phase === 'ended'
				? 'SEASON ENDED'
				: `${phase === 'upcoming' ? 'STARTS IN' : 'ENDS IN'}: ${coarse(remaining)}`}
			srPrefix="Overwatch"
			srSuffix="Start &amp; End Date"
		/>
		{#if phase !== 'ended'}
			<TimeLeft ms={remaining} label={phase === 'upcoming' ? 'SEASON STARTS' : 'SEASON ENDS'} />
		{/if}
	</div>

	<div class="doc">
		<section class="panel" aria-labelledby="start">
			<h2 id="start" class="display heading">{q[0].q}</h2>
			<p>{q[0].a}</p>
			<p>
				Your local start time: <strong>{formatLocal(d.season.start)}</strong>. Seasons go live at
				the <a href={resolve('/')}>weekly reset</a>, so the time in your zone is on the
				<a href={resolve('/reset-time')}>reset time by time zone</a> pages.
			</p>
		</section>

		<section class="panel" aria-labelledby="end">
			<h2 id="end" class="display heading">{q[1].q}</h2>
			<p>{q[1].a}</p>
			<p>Your local end time: <strong>{formatLocal(d.season.end)}</strong>.</p>
		</section>

		<section class="panel" aria-labelledby="weeks">
			<h2 id="weeks" class="display heading">WEEK BY WEEK</h2>
			<p>
				{d.name} has {d.weeks} weekly resets. Each week starts at the Tuesday reset, in your local time:
			</p>
			<table>
				<caption class="sr-only">Weekly reset dates in {d.name}</caption>
				<thead>
					<tr class="label"><th scope="col">WEEK</th><th scope="col">STARTS</th></tr>
				</thead>
				<tbody>
					{#each weekStarts as ts, i (ts)}
						<tr>
							<th scope="row" class="label">WEEK {i + 1}</th>
							<td class="num">{formatLocal(ts)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<p class="note">
			{d.page.confirmed && d.endConfirmed
				? "Season dates follow press reports of Blizzard's announced schedule."
				: 'Some dates on this page are estimates until Blizzard confirms them.'}
			Check the
			<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener">official Overwatch news</a
			>
			for the final word.
		</p>

		<nav class="pager" aria-label="Seasons">
			{#if prevSlug && d.prev}
				<a href={resolve('/seasons/[slug]', { slug: prevSlug })}>← {d.prev.label}</a>
			{/if}
			{#if nextSlug}
				<a href={resolve('/seasons/[slug]', { slug: nextSlug })}>{d.next.label} →</a>
			{/if}
			<a href={resolve('/seasons')}>All seasons</a>
		</nav>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px 24px;
		margin-bottom: 36px;
	}
	.doc {
		display: grid;
		gap: 20px;
		max-width: 760px;
		color: var(--text-dim);
		line-height: 1.55;
		font-size: 16px;
	}
	.panel {
		padding: 20px 22px;
		background: rgb(5 8 24 / 0.45);
		border-left: 4px solid var(--gold);
	}
	.heading {
		margin: 0 0 8px;
		font-size: clamp(24px, 5vw, 30px);
		line-height: 1;
		color: var(--text);
	}
	p {
		margin: 0 0 10px;
	}
	p:last-child {
		margin-bottom: 0;
	}
	strong {
		color: var(--text);
	}
	a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 8px;
	}
	th,
	td {
		padding: 6px 0;
		text-align: left;
		border-bottom: 1px solid rgb(255 255 255 / 0.08);
	}
	thead th {
		font-size: 13px;
		color: var(--gold);
	}
	tbody th {
		font-weight: 500;
		color: var(--text);
	}
	.note {
		font-size: 14px;
	}
	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
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
