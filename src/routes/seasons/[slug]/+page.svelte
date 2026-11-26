<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../../lib/now.svelte';
	import {
		CONFIG,
		coarse,
		detailsOf,
		formatLocal,
		nextOccurrence,
		seasonRow
	} from '../../../lib/resets';
	import { eventPages, eventPhase } from '../../../lib/event-pages';
	import { feedSeasons, googleCalendarUrl, seasonIcsPath } from '../../../lib/calendar';
	import AddOnce from '#lib/components/AddOnce.svelte';
	import CalendarSubscribe from '#lib/components/CalendarSubscribe.svelte';
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
	const title = $derived(seasonTitle(d, clock.now));
	const description = $derived(seasonDescription(d, clock.now));
	const past = $derived(d.season.end <= clock.now);
	const q = $derived([
		{
			q: `When ${d.season.start <= clock.now ? 'did' : 'does'} ${d.name} start?`,
			a: startAnswer(d, clock.now)
		},
		{ q: `When ${past ? 'did' : 'does'} ${d.name} end?`, a: endAnswer(d, clock.now) }
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
	/** Official overview, once the ingest has seen Blizzard's season post. */
	const details = $derived.by(() => {
		const row = seasonRow(d.season.start);
		return row ? detailsOf(row) : undefined;
	});
	const glanceRows = $derived([
		{ label: 'Starts', ...when(d.season.start) },
		{ label: 'Ends', ...when(d.season.end) },
		{ label: 'Length', value: `${d.weeks} weeks`, sub: '' },
		...(details?.facts ?? []).map((f) => ({ label: f.label, value: f.value, sub: '' }))
	]);

	// Events that are still running and end before (or with) this season's launch: last chances.
	const lastChance = $derived(
		eventPages()
			.filter((p) => p.endsAt <= d.season.start && eventPhase(p, clock.now) !== 'ended')
			.sort((a, b) => a.endsAt - b.endsAt)
	);
	// Events that run inside this season.
	const during = $derived(
		eventPages()
			.filter(
				(p) => (p.startsAt ?? p.endsAt) >= d.season.start && (p.startsAt ?? p.endsAt) < d.season.end
			)
			.sort((a, b) => (a.startsAt ?? a.endsAt) - (b.startsAt ?? b.endsAt))
	);
	const hasIcs = $derived(feedSeasons(Date.now()).some((s) => s.index === d.season.index));
	const left = (ms: number) => coarse(ms).toLowerCase();
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
				{#if phase !== 'ended' && hasIcs}
					<AddOnce
						what="{d.season.label} start"
						google={googleCalendarUrl(d.season)}
						ics={seasonIcsPath(d.season)}
						hint
					/>
				{/if}
			</section>

			{#if !past || details?.summary || details?.sourceUrl}
				<section aria-labelledby="new">
					<h2 id="new">What's new in {d.name}?</h2>
					{#if details?.summary || details?.sourceUrl}
						{#if details.summary}<p>{details.summary}</p>{/if}
						{#if details.sourceUrl}
							<p>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external URL -->
								Full details in Blizzard's post
								<a href={details.sourceUrl} target="_blank" rel="noopener"
									>{details.sourceTitle ?? 'on overwatch.blizzard.com'} ↗</a
								>.
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</p>
						{/if}
						<p class="small">
							Summary and key facts are extracted automatically from the official post and can be
							wrong.
						</p>
					{:else}
						<p>
							No official overview yet. Blizzard usually posts the season reveal (new heroes, maps,
							battle pass) in the run-up to launch. Once it is out, the summary and a link to the
							post show up here by themselves.
						</p>
					{/if}
				</section>
			{/if}

			{#if phase === 'upcoming' && lastChance.length}
				<section aria-labelledby="last">
					<h2 id="last">Ends before {d.name} starts</h2>
					<p>Still running now and gone by launch day. Last chance:</p>
					<ul class="evlist">
						{#each lastChance as p (p.slug)}
							<li>
								<a href={resolve('/events/[slug]', { slug: p.slug })}>{p.name}</a>
								<span class="ev-when"
									>{left(p.endsAt - clock.now)} left · ends {formatLocal(
										p.endsAt,
										undefined,
										displayZone.zone
									)}</span
								>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if during.length}
				<section aria-labelledby="during">
					<h2 id="during">Events in {d.name}</h2>
					<ul class="evlist">
						{#each during as p (p.slug)}
							{@const ph = eventPhase(p, clock.now)}
							<li>
								<a href={resolve('/events/[slug]', { slug: p.slug })}>{p.name}</a>
								<span class="ev-when"
									>{ph === 'upcoming' ? 'starts' : ph === 'live' ? 'ends' : 'ended'}
									{formatLocal(
										ph === 'upcoming' ? p.startsAt! : p.endsAt,
										undefined,
										displayZone.zone
									)}</span
								>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

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

	{#if phase !== 'ended'}
		<div class="column sub-wrap"><CalendarSubscribe compact /></div>
	{/if}
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
	.sub-wrap {
		margin-top: 40px;
	}
	.evlist {
		list-style: none;
		padding: 0;
	}
	.evlist li {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 2px 16px;
		padding-block: 10px;
		border-bottom: 1px solid var(--line);
	}
	.evlist li:first-child {
		border-top: 1px solid var(--line);
	}
	.ev-when {
		font-size: 15px;
	}
</style>
