<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../lib/now.svelte';
	import { seasonAt, seasonByIndex, formatLocal } from '../../lib/resets';
	import {
		SEASONS_TITLE,
		SEASONS_DESCRIPTION,
		breadcrumbJsonLd,
		jsonLdScript
	} from '../../lib/seo';
	import { seasonSlug } from '../../lib/season-pages';
	import {
		googleCalendarUrl,
		FEED_URL,
		FEED_WEBCAL_URL,
		FEED_GOOGLE_URL,
		FEED_OUTLOOK_URL
	} from '../../lib/calendar';
	import { displayZone } from '../../lib/timezone.svelte';
	import TzSwitch from '#lib/components/TzSwitch.svelte';
	import PageHero from '#lib/components/PageHero.svelte';

	$effect(() => clock.start());

	const season = $derived(seasonAt(clock.now));
	const remaining = $derived(season.end - clock.now);
	const weeks = $derived(Array.from({ length: season.weeks }, (_, i) => i + 1));
	const upcoming = $derived([seasonByIndex(season.index + 1), seasonByIndex(season.index + 2)]);
</script>

<svelte:head>
	<title>{SEASONS_TITLE}</title>
	<meta name="description" content={SEASONS_DESCRIPTION} />
	<meta property="og:title" content={SEASONS_TITLE} />
	<meta property="og:description" content={SEASONS_DESCRIPTION} />
	<meta name="twitter:title" content={SEASONS_TITLE} />
	<meta name="twitter:description" content={SEASONS_DESCRIPTION} />
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Overwatch Seasons', path: '/seasons' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="crimson"
		glyph="shield"
		eyebrow="BATTLE PASS"
		title={season.label}
		subtitle={season.title?.toUpperCase()}
		srPrefix="Overwatch"
		srSuffix="End Date &amp; Countdown"
		ms={remaining}
		msLabel="SEASON ENDS IN"
	>
		<section class="progress" aria-labelledby="progress">
			<h2 id="progress" class="label progress-head">WEEK {season.week} OF {season.weeks}</h2>
			<ol class="ticks">
				{#each weeks as w (w)}
					{@const state = w < season.week ? 'done' : w === season.week ? 'current' : 'upcoming'}
					<li class="tick {state}" aria-current={state === 'current' ? 'step' : undefined}>
						<span class="label wk">W{w}</span>
						<span class="seg" aria-hidden="true"
							><span class="mark">{state === 'done' ? '✓' : ''}</span></span
						>
						<span class="sr-only">
							Week {w}, {state === 'done'
								? 'completed'
								: state === 'current'
									? 'current'
									: 'upcoming'}
						</span>
						{#if state === 'current'}<span class="tag now" aria-hidden="true">NOW</span>{/if}
					</li>
				{/each}
			</ol>
		</section>
		<TzSwitch />
	</PageHero>

	<div class="column stack">
		<div class="two">
			<section class="panel" aria-labelledby="dates">
				<h2 id="dates" class="display heading">THIS SEASON</h2>
				<dl class="dates">
					<div>
						<dt class="label">STARTED</dt>
						<dd>{formatLocal(season.start, undefined, displayZone.zone)}</dd>
					</div>
					<div>
						<dt class="label">ENDS</dt>
						<dd>{formatLocal(season.end, undefined, displayZone.zone)}</dd>
					</div>
				</dl>
			</section>

			<section class="panel" aria-labelledby="next">
				<h2 id="next" class="display heading">NEXT SEASONS</h2>
				<ul class="rows">
					{#each upcoming as s (s.index)}
						<li class="row">
							{#if seasonSlug(s)}
								<a class="label sname" href={resolve('/seasons/[slug]', { slug: seasonSlug(s)! })}
									>{s.label}</a
								>
							{:else}
								<span class="label sname">{s.label}</span>
							{/if}
							<span class="starts">
								<span class="label dimlabel">STARTS</span>
								{formatLocal(s.start, undefined, displayZone.zone)}
							</span>
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external URL -->
							<a
								class="label cal"
								href={googleCalendarUrl(s)}
								target="_blank"
								rel="noopener"
								aria-label="Add {s.label} start to Google Calendar">+ GOOGLE CALENDAR</a
							>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</li>
					{/each}
				</ul>
				<div id="subscribe" class="subscribe">
					<h3 class="label sub-head">SUBSCRIBE TO LAUNCH DATES</h3>
					<p class="sub-note">
						Season launches land in your calendar and update by themselves when dates change.
					</p>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- webcal and external URLs -->
					<p class="sub-actions">
						<a class="btn-primary" href={FEED_GOOGLE_URL} target="_blank" rel="noopener"
							>GOOGLE CALENDAR</a
						>
						<a class="label sub-link" href={FEED_WEBCAL_URL}>APPLE / DEFAULT APP</a>
						<a class="label sub-link" href={FEED_OUTLOOK_URL} target="_blank" rel="noopener"
							>OUTLOOK.COM</a
						>
					</p>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
					<p class="sub-note">
						Other apps: add a calendar by URL and paste <code class="feed-url">{FEED_URL}</code>.
						Prefer a one-off copy? <a href={resolve('/seasons.ics')} download>Download the .ics</a>.
					</p>
				</div>
			</section>

			<p class="note">
				Season dates follow press reports of Blizzard's announced schedule. Start dates for 2027
				seasons are estimates until Blizzard confirms them. Check the
				<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener"
					>official Overwatch news</a
				>
				for the final word. Limited-time events of this season are on the
				<a href={resolve('/events')}>events page</a>. Back to the
				<a href={resolve('/')}>weekly reset countdown</a>, or read the
				<a href={resolve('/faq')}>reset time FAQ</a>.
			</p>
		</div>
	</div>
</div>

<style>
	.stack {
		display: grid;
		gap: 16px;
	}
	.cal {
		font-size: 13px;
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	.subscribe {
		margin-top: 20px;
		padding-top: 18px;
		border-top: 1px solid var(--line);
		scroll-margin-top: 80px;
	}
	.sub-head {
		margin: 0 0 6px;
		font-size: 15px;
		color: var(--text);
	}
	.sub-note {
		margin: 8px 0;
		font-size: 14px;
		color: var(--text-dim);
	}
	.sub-note a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.sub-actions {
		margin: 12px 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 20px;
	}
	.sub-link {
		font-size: 14px;
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	.feed-url {
		display: inline-block;
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--surface-2, rgb(255 255 255 / 0.06));
		font-size: 13px;
		user-select: all;
		overflow-wrap: anywhere;
	}
	.note {
		margin: 0;
		font-size: 14px;
		color: var(--text-dim);
	}
	.note a {
		color: inherit;
		text-decoration: underline;
	}
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}
	.two {
		display: grid;
		gap: 16px;
	}
	@media (min-width: 760px) {
		.two {
			grid-template-columns: 1fr 1.25fr;
		}
	}

	.panel {
		position: relative;
		padding: 22px 24px 24px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
	}

	.heading {
		margin: 0 0 16px;
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}

	/* Week strip inside the red banner: one segment per weekly reset. */
	.progress {
		width: 100%;
		max-width: 640px;
		margin-top: 8px;
	}
	.progress-head {
		margin: 0;
		font-size: 15px;
		color: rgb(255 255 255 / 0.85);
	}
	.ticks {
		list-style: none;
		margin: 0;
		padding: 30px 0 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: 6px;
	}
	.tick {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 6px;
		position: relative;
		min-width: 0;
	}
	.wk {
		font-size: 14px;
		text-align: center;
		color: rgb(255 255 255 / 0.75);
	}
	.seg {
		display: grid;
		place-items: center;
		height: 28px;
		border-radius: 4px;
		background: rgb(0 0 0 / 0.28);
	}
	.mark {
		display: block;
		font-weight: 700;
		line-height: 1;
		color: #8f1636;
	}
	.done .seg {
		background: rgb(255 255 255 / 0.8);
	}
	.current .seg {
		background: var(--gold);
	}
	.current .wk {
		color: var(--text);
	}
	.now {
		position: absolute;
		top: -22px;
		left: 50%;
		transform: translateX(-50%);
		height: 20px;
		font-size: 13px;
		padding: 0 12px 0 10px;
	}

	.dates {
		margin: 0;
		display: grid;
		gap: 18px;
	}
	.dates dt {
		font-size: 13px;
		color: var(--text-faint);
	}
	.dates dd {
		margin: 2px 0 0;
		font-size: 18px;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.row {
		position: relative;
		border-top: 1px solid var(--line);
		padding: 14px 0;
		min-height: 64px;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 16px;
	}
	.sname {
		font-size: 22px;
	}
	.dimlabel {
		font-size: 13px;
		color: var(--text-faint);
		margin-right: 4px;
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
