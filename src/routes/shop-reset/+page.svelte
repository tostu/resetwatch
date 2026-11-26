<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../lib/now.svelte';
	import { CONFIG, coarse, formatLocal, nextOccurrence } from '../../lib/resets';
	import { eventPages, eventPhase } from '../../lib/event-pages';
	import { breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import { displayZone } from '../../lib/timezone.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import ZoneTable from '#lib/components/ZoneTable.svelte';

	const TITLE = 'When Does the Overwatch Shop Reset? Countdown & Time | Resetwatch';
	const DESCRIPTION =
		'The Overwatch shop rotates at the weekly reset, every Tuesday at 2 PM ET / 11 AM PT. Live countdown in your time zone, plus the shop sales and collections running right now.';
	const ANSWER =
		'The Overwatch shop rotates at the weekly reset, every Tuesday at 11 AM Pacific Time / 2 PM Eastern Time (19:00 UTC in US winter, 18:00 UTC in US summer). Some bundles show their own timer in the shop; that timer is the final word for them.';

	$effect(() => clock.start());

	const next = $derived(nextOccurrence(CONFIG.weekly, clock.now));

	/** Shop-type events: sales, collections, bundles. Name-based, since the ingest has no category. */
	const SHOP = /\b(sale|collection|shop|bundle|vault|store)\b/i;
	const shopEvents = $derived(
		eventPages()
			.filter((p) => SHOP.test(p.name) && eventPhase(p, clock.now) !== 'ended')
			.sort((a, b) => a.endsAt - b.endsAt)
	);
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	{@html jsonLdScript({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'When does the Overwatch shop reset?',
				acceptedAnswer: { '@type': 'Answer', text: ANSWER }
			}
		]
	})}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Shop reset', path: '/shop-reset' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="purple"
		glyph="diamond"
		eyebrow="ITEM SHOP"
		title="SHOP RESET"
		subtitle="EVERY TUESDAY, WITH THE WEEKLY RESET"
		srPrefix="Overwatch"
		srSuffix="Time &amp; Countdown"
		ms={next - clock.now}
		msLabel="SHOP ROTATES IN"
	/>

	<div class="doc">
		<section>
			<p class="lead">
				The shop rotates at the weekly reset: <strong>every Tuesday, 2 PM ET / 11 AM PT</strong>.
			</p>
			<p>
				Next rotation in your time zone:
				<strong
					><time datetime={new Date(next).toISOString()}
						>{formatLocal(next, undefined, displayZone.zone)}</time
					></strong
				>. Featured bundles, sales and the Mythic shop rotation change at the same time. Some
				bundles show their own timer in the shop; for them, that timer wins.
			</p>
		</section>

		<section aria-labelledby="now">
			<h2 id="now">Shop sales and collections right now</h2>
			{#if shopEvents.length}
				<ul class="evlist">
					{#each shopEvents as p (p.slug)}
						{@const ph = eventPhase(p, clock.now)}
						<li>
							<a href={resolve('/events/[slug]', { slug: p.slug })}>{p.name}</a>
							<span class="ev-when"
								>{ph === 'upcoming'
									? `starts in ${coarse(p.startsAt! - clock.now).toLowerCase()}`
									: `${coarse(p.endsAt - clock.now).toLowerCase()} left`}</span
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No shop sale or collection known right now. All events are on the events page.</p>
			{/if}
			<p class="small">
				Picked from the <a href={resolve('/events')}>events list</a> by name, so a sale with an unusual
				name can be missing.
			</p>
		</section>

		<section aria-labelledby="zones">
			<h2 id="zones">Shop reset time by city</h2>
			<ZoneTable now={clock.now} />
			<p class="small">
				All zones and the daylight saving gaps: <a href={resolve('/reset-time')}
					>reset time by time zone</a
				>.
			</p>
		</section>

		<section>
			<nav class="links" aria-label="Related pages">
				<a href={resolve('/')}>Weekly reset countdown</a>
				<a href={resolve('/events')}>Current events</a>
				<a href={resolve('/daily-reset')}>Daily challenge reset</a>
				<a href="{resolve('/calendar')}#subscribe">Calendar subscription</a>
			</nav>
		</section>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
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
