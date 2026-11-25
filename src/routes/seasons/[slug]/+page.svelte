<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../../lib/now.svelte';
	import { CONFIG, formatLocal, nextOccurrence } from '../../../lib/resets';
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
	import { displayZone } from '../../../lib/timezone.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import Glance from '#lib/components/Glance.svelte';
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
	// "Tue 8 Dec, 20:00 CET" -> date in big type, time underneath.
	const when = (ts: number): { value: string; sub: string } => {
		const s = formatLocal(ts, undefined, displayZone.zone);
		const i = s.indexOf(', ');
		return i < 0 ? { value: s, sub: '' } : { value: s.slice(0, i), sub: s.slice(i + 2) };
	};
	const glanceRows = $derived([
		{ label: 'Starts', ...when(d.season.start) },
		{ label: 'Ends', ...when(d.season.end) },
		{ label: 'Length', value: `${d.weeks} weeks`, sub: '' }
	]);
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
	<PageHero
		tone="crimson"
		glyph="shield"
		eyebrow="BATTLE PASS"
		title={d.season.label}
		subtitle={phase === 'ended' ? 'SEASON ENDED' : d.season.title?.toUpperCase()}
		srPrefix="Overwatch"
		srSuffix="Start &amp; End Date"
		ms={phase === 'ended' ? undefined : remaining}
		msLabel={phase === 'upcoming' ? 'STARTS IN' : 'ENDS IN'}
	/>

	<div class="doc split">
		<Glance title="Season dates" tone="crimson" rows={glanceRows} />

		<div class="main">
			<section aria-labelledby="start">
				<h2 id="start" class="sr-only">{q[0].q}</h2>
				<p class="lead">{q[0].a}</p>
				<p>
					Seasons go live at the <a href={resolve('/')}>weekly reset</a>, so the time in your zone
					is on the
					<a href={resolve('/reset-time')}>reset time by time zone</a> pages.
				</p>
			</section>

			<section aria-labelledby="end">
				<h2 id="end">{q[1].q}</h2>
				<p>{q[1].a}</p>
			</section>

			<section aria-labelledby="weeks">
				<h2 id="weeks">Week by week</h2>
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
								<td class="num">{formatLocal(ts, undefined, displayZone.zone)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>

			<section>
				<p class="small">
					{d.page.confirmed && d.endConfirmed
						? "Season dates follow press reports of Blizzard's announced schedule."
						: 'Some dates on this page are estimates until Blizzard confirms them.'}
					Check the
					<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener"
						>official Overwatch news</a
					>
					for the final word.
				</p>
				<nav class="links" aria-label="Seasons">
					{#if prevSlug && d.prev}
						<a href={resolve('/seasons/[slug]', { slug: prevSlug })}>← {d.prev.label}</a>
					{/if}
					{#if nextSlug}
						<a href={resolve('/seasons/[slug]', { slug: nextSlug })}>{d.next.label} →</a>
					{/if}
					<a href={resolve('/seasons')}>All seasons</a>
				</nav>
			</section>
		</div>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
</style>
