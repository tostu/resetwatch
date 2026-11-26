<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../../lib/now.svelte';
	import { formatLocal } from '../../../lib/resets';
	import {
		eventPage,
		eventPages,
		eventPhase,
		eventTitle,
		eventDescription,
		eventJsonLd,
		endAnswer,
		startAnswer,
		endsWithSeason,
		durationDays
	} from '../../../lib/event-pages';
	import { absolute, breadcrumbJsonLd, jsonLdScript, OG_IMAGE } from '../../../lib/seo';
	import { eventAddOnce, eventIcsPath, googleUrl } from '../../../lib/calendar';
	import AddOnce from '#lib/components/AddOnce.svelte';
	import EventPace from '#lib/components/EventPace.svelte';
	import { displayZone } from '../../../lib/timezone.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import Glance from '#lib/components/Glance.svelte';
	import { eventTone, eventGlyph } from '../../../lib/tone';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => clock.start());

	const p = $derived(eventPage(data.slug)!);
	const phase = $derived(eventPhase(p, clock.now));
	const title = $derived(eventTitle(p, clock.now));
	const description = $derived(eventDescription(p));
	const target = $derived(phase === 'upcoming' ? p.startsAt! : p.endsAt);
	const remaining = $derived(target - clock.now);
	const days = $derived(durationDays(p));
	const start = $derived(startAnswer(p, clock.now));
	const qa = $derived([
		{ q: `When does ${p.name} end?`, a: endAnswer(p, clock.now) },
		...(start ? [{ q: `When does ${p.name} start?`, a: start }] : [])
	]);
	// Other events that are not over yet, for internal links.
	const others = $derived(
		eventPages().filter((o) => o.slug !== p.slug && eventPhase(o, clock.now) !== 'ended')
	);
	// "Tue 8 Dec, 20:00 CET" -> date in big type, time underneath.
	const when = (ts: number): { value: string; sub: string } => {
		const s = formatLocal(ts, undefined, displayZone.zone);
		const i = s.indexOf(', ');
		return i < 0 ? { value: s, sub: '' } : { value: s.slice(0, i), sub: s.slice(i + 2) };
	};
	const glanceRows = $derived([
		{
			label: phase === 'ended' ? 'Ended' : 'Ends',
			...when(p.endsAt)
		},
		...(p.startsAt
			? [{ label: phase === 'upcoming' ? 'Starts' : 'Started', ...when(p.startsAt) }]
			: []),
		...(days ? [{ label: 'Duration', value: `${days} day${days === 1 ? '' : 's'}`, sub: '' }] : []),
		...(p.details?.facts ?? []).map((f) => ({ label: f.label, value: f.value, sub: '' }))
	]);
	// The end reminder (with its day-before alarm) is what people want from a single event.
	const calLink = $derived(googleUrl(eventAddOnce(p, Infinity)[0]));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{@html jsonLdScript(eventJsonLd(p, absolute(`/events/${p.slug}`), OG_IMAGE))}
	{@html jsonLdScript({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: qa.map((x) => ({
			'@type': 'Question',
			name: x.q,
			acceptedAnswer: { '@type': 'Answer', text: x.a }
		}))
	})}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Overwatch Events', path: '/events' },
			{ name: p.name, path: `/events/${p.slug}` }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone={eventTone(p.slug)}
		glyph={eventGlyph(p.slug)}
		eyebrow={phase === 'upcoming'
			? 'UPCOMING EVENT'
			: phase === 'ended'
				? 'PAST EVENT'
				: 'LIVE EVENT'}
		title={p.name.toUpperCase()}
		subtitle={phase === 'ended' ? 'EVENT ENDED' : undefined}
		srPrefix="Overwatch"
		srSuffix={phase === 'upcoming' ? 'Start Date & Countdown' : 'End Date & Countdown'}
		ms={phase === 'ended' ? undefined : remaining}
		msLabel={phase === 'upcoming' ? 'STARTS IN' : 'ENDS IN'}
	/>

	<div class="doc split">
		<Glance title="Event details" tone={eventTone(p.slug)} rows={glanceRows} />

		<div class="main">
			<section aria-labelledby="end">
				<h2 id="end" class="sr-only">{qa[0].q}</h2>
				<p class="lead">{qa[0].a}</p>
				<p>
					{#if endsWithSeason(p)}
						It ends at the <a href={resolve('/seasons')}>season end</a>, at the weekly reset.
					{:else}
						Event times follow the usual reset time, 11 AM PT / 2 PM ET.
					{/if}
				</p>
				{#if p.details?.summary}<p>{p.details.summary}</p>{/if}
			</section>

			{#if phase !== 'ended'}
				<EventPace {p} />
			{/if}

			{#if phase !== 'ended'}
				<section aria-labelledby="cal">
					<h2 id="cal">Put it in your calendar</h2>
					<p>
						<strong>Subscribe</strong> to the
						<a href="{resolve('/calendar')}#subscribe">Overwatch calendar</a> and this event, every other
						event and the weekly reset stay up to date by themselves.
					</p>
					<p>Or add just the end of {p.name}, with a reminder a day before:</p>
					<AddOnce what="{p.name} end" google={calLink} ics={eventIcsPath(p)} hint />
				</section>
			{/if}

			{#if qa[1]}
				<section aria-labelledby="start">
					<h2 id="start">{qa[1].q}</h2>
					<p>{qa[1].a}</p>
				</section>
			{/if}

			<section aria-labelledby="source">
				<h2 id="source">Official source</h2>
				{#if p.details?.sourceUrl}
					<p>
						Dates and rewards come from Blizzard's post
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external URL -->
						<a href={p.details.sourceUrl} target="_blank" rel="noopener"
							>{p.details.sourceTitle ?? 'on overwatch.blizzard.com'} ↗</a
						>.
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
						The link jumps to the section about {p.name}. Read it there for the full reward list and
						artwork.
					</p>
				{:else}
					<p>
						Check the
						<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener"
							>official Overwatch news</a
						> for the full announcement.
					</p>
				{/if}
				<p class="small">
					Summary and key facts are extracted automatically from the official post and can be wrong.
					Spotted a mistake? <a href={resolve('/contact')}>Tell us</a>.
				</p>
			</section>

			{#if others.length}
				<section aria-labelledby="more">
					<h2 id="more">Other events</h2>
					<ul class="others">
						{#each others as o (o.slug)}
							<li>
								<a href={resolve('/events/[slug]', { slug: o.slug })}>{o.name}</a>
								<span class="when"
									>{eventPhase(o, clock.now) === 'upcoming' ? 'starts' : 'ends'}
									{formatLocal(
										eventPhase(o, clock.now) === 'upcoming' ? o.startsAt! : o.endsAt,
										undefined,
										displayZone.zone
									)}</span
								>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<section>
				<nav class="links" aria-label="Events">
					<a href={resolve('/events')}>All events</a>
					<a href={resolve('/')}>Weekly reset countdown</a>
					<a href={resolve('/seasons')}>Season schedule</a>
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
	.others {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.others li {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 2px 16px;
		padding-block: 10px;
		border-bottom: 1px solid var(--line);
	}
	.others li:first-child {
		border-top: 1px solid var(--line);
	}
	.when {
		font-size: 15px;
	}
</style>
