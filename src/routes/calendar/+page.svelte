<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../lib/now.svelte';
	import { formatLocal } from '../../lib/resets';
	import {
		WEEKLY_ICS_PATH,
		eventAddOnce,
		eventIcsPath,
		feedSeasons,
		googleUrl,
		seasonIcsPath,
		seasonStartEntry,
		weeklyResetEntry
	} from '../../lib/calendar';
	import { eventPages, eventPhase } from '../../lib/event-pages';
	import { breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import { displayZone } from '../../lib/timezone.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import CalendarSubscribe from '#lib/components/CalendarSubscribe.svelte';
	import AddOnce from '#lib/components/AddOnce.svelte';

	const TITLE = 'Overwatch Calendar: Subscribe to Resets, Events & Seasons | Resetwatch';
	const DESCRIPTION =
		'Add the Overwatch weekly reset, season launches and limited-time events to Google Calendar, Apple Calendar or Outlook. Subscribe once and it updates itself, or add single dates.';

	$effect(() => clock.start());

	// Build-time lists: the .ics files exist for exactly these.
	const SEASONS = feedSeasons(Date.now());
	const EVENTS = eventPages();

	const weekly = weeklyResetEntry();
	const seasons = $derived(SEASONS.filter((s) => s.start > clock.now));
	const events = $derived(
		EVENTS.filter((p) => eventPhase(p, clock.now) !== 'ended').sort(
			(a, b) => (a.startsAt ?? a.endsAt) - (b.startsAt ?? b.endsAt)
		)
	);
	const when = (ts: number) => formatLocal(ts, undefined, displayZone.zone);
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
			{ name: 'Overwatch calendar', path: '/calendar' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="blue"
		glyph="clock"
		eyebrow="NEVER MISS A RESET"
		title="CALENDAR"
		subtitle="SUBSCRIBE ONCE, OR ADD SINGLE DATES"
		srPrefix="Overwatch"
		srSuffix="for Google, Apple and Outlook"
	/>

	<div class="column stack">
		<CalendarSubscribe id="subscribe" />

		<section class="once" aria-labelledby="once-head">
			<h2 id="once-head" class="display head">Or add single dates once</h2>
			<p class="what">
				A one-time copy of one date. It lands in your own calendar and <strong
					>does not update</strong
				>
				if Blizzard moves it. Good for one event you care about; for everything, subscribe above.
			</p>

			<h3 class="label sub">Weekly reset</h3>
			<ul class="rows">
				<li class="row">
					<span class="name">Every Tuesday, 2 PM ET / 11 AM PT</span>
					<span class="when">repeats weekly, the rule never changes</span>
					<AddOnce what="weekly reset" google={googleUrl(weekly)} ics={WEEKLY_ICS_PATH} />
				</li>
			</ul>

			{#if seasons.length}
				<h3 class="label sub">Season launches</h3>
				<ul class="rows">
					{#each seasons as s (s.index)}
						<li class="row">
							<span class="name">{s.label}{s.title ? `: ${s.title}` : ''}</span>
							<span class="when">starts {when(s.start)}</span>
							<AddOnce
								what="{s.label} start"
								google={googleUrl(seasonStartEntry(s))}
								ics={seasonIcsPath(s)}
							/>
						</li>
					{/each}
				</ul>
			{/if}

			{#if events.length}
				<h3 class="label sub">Events</h3>
				<ul class="rows">
					{#each events as p (p.slug)}
						{@const end = eventAddOnce(p, Infinity)[0]}
						<li class="row">
							<a class="name" href={resolve('/events/[slug]', { slug: p.slug })}>{p.name}</a>
							<span class="when"
								>{eventPhase(p, clock.now) === 'upcoming'
									? `starts ${when(p.startsAt!)}, `
									: ''}ends {when(p.endsAt)}</span
							>
							<AddOnce what="{p.name} end" google={googleUrl(end)} ics={eventIcsPath(p)} />
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="faq" aria-labelledby="faq-head">
			<h2 id="faq-head" class="display head">Subscribe or add once?</h2>
			<dl>
				<dt>Subscribe</dt>
				<dd>
					Your calendar app checks the feed every few hours (Google: about once a day). New events
					appear, moved dates move. Remove it like any other calendar.
				</dd>
				<dt>Add once</dt>
				<dd>
					Copies one date into a calendar of yours. Nothing changes afterwards, even if the date
					does. Event files carry a reminder a day before the end.
				</dd>
			</dl>
			<p class="small">
				Older subscription to <code>/seasons.ics</code>? It keeps working and only has season
				launches. Dates follow the
				<a href={resolve('/seasons')}>season schedule</a> and the
				<a href={resolve('/events')}>events page</a>.
			</p>
		</section>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}
	.stack {
		display: grid;
		gap: 24px;
	}
	.head {
		margin: 0 0 8px;
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}
	.what {
		margin: 0 0 8px;
		max-width: 62ch;
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.what strong {
		color: var(--text);
		font-weight: 500;
	}
	.once,
	.faq {
		padding: 22px 24px 24px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
	}
	.sub {
		margin: 22px 0 6px;
		font-size: 14px;
		color: var(--text-faint);
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2px 16px;
		padding-block: 12px;
		border-top: 1px solid var(--line);
	}
	.name {
		font-size: 17px;
		font-weight: 500;
		color: var(--text);
		text-decoration: none;
	}
	a.name:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.when {
		font-size: 14px;
		color: var(--text-dim);
	}
	.row :global(.once) {
		margin-top: 4px;
	}
	@media (min-width: 760px) {
		.row {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}
		.row :global(.once) {
			grid-column: 2;
			grid-row: 1 / span 2;
			margin-top: 0;
		}
	}
	.faq dl {
		margin: 0;
		display: grid;
		gap: 4px;
	}
	.faq dt {
		margin-top: 10px;
		font-weight: 500;
		color: var(--text);
	}
	.faq dd {
		margin: 0;
		color: var(--text-dim);
		line-height: 1.55;
	}
	.small {
		margin: 18px 0 0;
		font-size: 14px;
		color: var(--text-faint);
	}
	.small a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
</style>
