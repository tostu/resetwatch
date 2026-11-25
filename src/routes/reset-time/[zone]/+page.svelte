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
	import PageHero from '#lib/components/PageHero.svelte';
	import Glance from '#lib/components/Glance.svelte';
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
	const glanceRows = $derived([
		{
			label: 'Winter · US standard time',
			value: r.std.time,
			sub: `${r.std.day} · ${r.std.abbr}, ${r.std.offset}`
		},
		{
			label: 'Summer · US daylight time',
			value: r.dst.time,
			sub: `${r.dst.day} · ${r.dst.abbr}, ${r.dst.offset}`
		}
	]);
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
	<PageHero
		tone="blue"
		glyph="clock"
		eyebrow="WEEKLY RESET TIME"
		title={z.short.toUpperCase()}
		srPrefix="Overwatch weekly reset time in"
		ms={remaining}
		msLabel="NEXT WEEKLY RESET IN"
	/>

	<div class="doc split">
		<Glance title="Reset times" tone="blue" rows={glanceRows} />

		<div class="main">
			<section aria-labelledby="answer">
				<h2 id="answer" class="sr-only">{question}</h2>
				<p class="lead">{answer}</p>
				<p>{z.region}</p>
			</section>

			<section aria-labelledby="table">
				<h2 id="table">Why the time can change</h2>
				<p>
					The reset is fixed at Tuesday 2 PM Eastern (11 AM Pacific), so it follows US clock changes
					{#if r.shifts}
						and moves in {z.name} when the US switches between standard and daylight time. Europe and
						Australia change their clocks on different dates, so the gap can differ by an hour for a few
						weeks a year.
					{:else}
						{#if z.slug === 'est'}
							and stays at the same local time all year in {z.name}.
						{:else}
							and usually stays at the same local time in {z.name}, because the local clocks change
							in the same direction. It differs by an hour for a few weeks when the dates do not
							line up.
						{/if}
					{/if}
				</p>
			</section>

			<section aria-labelledby="more">
				<h2 id="more">Other time zones</h2>
				<ul class="links">
					{#each others as o (o.slug)}
						<li><a href={resolve('/reset-time/[zone]', { zone: o.slug })}>{o.short}</a></li>
					{/each}
				</ul>
				<p class="small after">
					Also: <a href={resolve('/')}>live weekly reset countdown</a>,
					<a href={resolve('/seasons')}>season schedule</a>, <a href={resolve('/faq')}>FAQ</a>.
				</p>
			</section>
		</div>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
	.after {
		margin-top: 12px;
	}
</style>
