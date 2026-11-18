<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../../lib/now.svelte';
	import { CONFIG, nextOccurrence } from '../../../lib/resets';
	import {
		ZONE_PAGES,
		zonePage,
		zoneResets,
		zoneAnswer,
		zoneTitle,
		zoneDescription
	} from '../../../lib/zones';
	import { breadcrumbJsonLd, jsonLdScript } from '../../../lib/seo';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TimeLeft from '#lib/components/TimeLeft.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => clock.start());

	const z = $derived(zonePage(data.zone)!);
	const r = $derived(zoneResets(z));
	const answer = $derived(zoneAnswer(z));
	const title = $derived(zoneTitle(z));
	const description = $derived(zoneDescription(z));
	const question = $derived(`What time is the Overwatch weekly reset in ${z.name}?`);
	const remaining = $derived(nextOccurrence(CONFIG.weekly, clock.now) - clock.now);
	const others = $derived(ZONE_PAGES.filter((x) => x.slug !== z.slug));
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
		mainEntity: [
			{
				'@type': 'Question',
				name: question,
				acceptedAnswer: { '@type': 'Answer', text: answer }
			}
		]
	})}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Reset time by time zone', path: '/reset-time' },
			{ name: z.short, path: `/reset-time/${z.slug}` }
		])
	)}
</svelte:head>

<div class="wrap page">
	<div class="top">
		<PageTitle
			title="RESET TIME"
			subtitle={z.short.toUpperCase()}
			srPrefix="Overwatch"
			srSuffix="in {z.name}"
		/>
		<TimeLeft ms={remaining} label="NEXT WEEKLY RESET" />
	</div>

	<div class="doc">
		<section class="panel" aria-labelledby="answer">
			<h2 id="answer" class="display heading">{question}</h2>
			<p>{answer}</p>
			<p>{z.region}</p>
		</section>

		<section class="panel" aria-labelledby="table">
			<h2 id="table" class="display heading">RESET TIME, SUMMER AND WINTER</h2>
			<table>
				<caption class="sr-only">Overwatch weekly reset in {z.name}</caption>
				<thead>
					<tr class="label">
						<th scope="col">US CLOCKS</th>
						<th scope="col">ZONE</th>
						<th scope="col">DAY</th>
						<th scope="col" class="t">RESET</th>
					</tr>
				</thead>
				<tbody>
					{#each [{ k: 'Standard time (Nov to Mar)', v: r.std }, { k: 'Daylight time (Mar to Nov)', v: r.dst }] as row (row.k)}
						<tr>
							<th scope="row">{row.k}</th>
							<td class="num">{row.v.abbr} · {row.v.offset}</td>
							<td class="label">{row.v.day}</td>
							<td class="t num">{row.v.time}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="small">
				The reset is fixed at Tuesday 2 PM Eastern (11 AM Pacific), so it follows US clock changes
				{#if r.shifts}
					and moves in {z.name} when the US switches between standard and daylight time. Europe and Australia
					change their clocks on different dates, so the gap can differ by an hour for a few weeks a year.
				{:else}
					{#if z.slug === 'est'}
						and stays at the same local time all year in {z.name}.
					{:else}
						and usually stays at the same local time in {z.name}, because the local clocks change in
						the same direction. It differs by an hour for a few weeks when the dates do not line up.
					{/if}
				{/if}
			</p>
		</section>

		<section class="panel" aria-labelledby="more">
			<h2 id="more" class="display heading">MORE RESET TIMES</h2>
			<p>
				See the <a href={resolve('/')}>live weekly reset countdown</a>, the
				<a href={resolve('/seasons')}>season schedule</a> or the
				<a href={resolve('/faq')}>reset time FAQ</a>.
			</p>
			<ul class="zones">
				{#each others as o (o.slug)}
					<li><a href={resolve('/reset-time/[zone]', { zone: o.slug })}>{o.short}</a></li>
				{/each}
			</ul>
		</section>
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
	.small {
		font-size: 14px;
	}
	a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 4px 0 12px;
	}
	th,
	td {
		padding: 8px 8px 8px 0;
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
	.t {
		text-align: right;
		white-space: nowrap;
	}
	td.t {
		font-size: 22px;
		font-style: italic;
		font-weight: 800;
		color: var(--text);
	}
	.zones {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		list-style: none;
		margin: 0;
		padding: 0;
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
		th,
		td {
			font-size: 14px;
		}
	}
</style>
