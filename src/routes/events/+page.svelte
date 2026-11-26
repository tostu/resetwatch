<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../../lib/now.svelte';
	import { coarse, formatLocal, seasonAt, seasonByIndex, type SeasonRef } from '../../lib/resets';
	import { eventPages, type EventPage } from '../../lib/event-pages';
	import { SEASON_PAGES } from '../../lib/season-pages';
	import {
		EVENTS_TITLE,
		EVENTS_DESCRIPTION,
		absolute,
		breadcrumbJsonLd,
		jsonLdScript
	} from '../../lib/seo';
	import { displayZone } from '../../lib/timezone.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import Glyph from '#lib/components/Glyph.svelte';
	import { eventTone, eventGlyph, toneStyle, type GlyphName } from '../../lib/tone';
	import TzSwitch from '#lib/components/TzSwitch.svelte';
	import CalendarSubscribe from '#lib/components/CalendarSubscribe.svelte';

	$effect(() => clock.start());

	/** One list row: a limited-time event or a season, so both share the same timeline. */
	interface Item {
		key: string;
		kind: 'event' | 'season';
		name: string;
		href: string;
		/** Absolute URL for JSON-LD. */
		url: string;
		startsAt?: number;
		endsAt: number;
		facts: { label: string; value: string }[];
		style: string;
		glyph: GlyphName;
	}

	const eventItem = (e: EventPage): Item => ({
		key: `e:${e.slug}`,
		kind: 'event',
		name: e.name,
		href: resolve('/events/[slug]', { slug: e.slug }),
		url: absolute(`/events/${e.slug}`),
		startsAt: e.startsAt,
		endsAt: e.endsAt,
		facts: e.details?.facts.slice(0, 2) ?? [],
		style: toneStyle(eventTone(e.slug)),
		glyph: eventGlyph(e.slug)
	});

	const seasonItem = (s: SeasonRef, slug: string, confirmed: boolean, now: number): Item => {
		const weeks = Math.round((s.end - s.start) / (7 * 86_400_000));
		const live = s.start <= now && now < s.end;
		const week = Math.min(weeks, Math.floor((now - s.start) / (7 * 86_400_000)) + 1);
		return {
			key: `s:${slug}`,
			kind: 'season',
			name: `Season ${s.number}${s.title ? `: ${s.title}` : ` (${s.year})`}`,
			href: resolve('/seasons/[slug]', { slug }),
			url: absolute(`/seasons/${slug}`),
			startsAt: s.start,
			endsAt: s.end,
			facts: live
				? [{ label: 'Week', value: `${week} of ${weeks}` }]
				: [
						{ label: 'Length', value: `${weeks} weeks` },
						...(confirmed ? [] : [{ label: 'Start date', value: 'estimate' }])
					],
			style: toneStyle('crimson'),
			glyph: 'shield'
		};
	};

	const events = eventPages();
	/** Every season with its own page: the archive, the current one and the next announced. */
	const seasons = SEASON_PAGES.map((p) => ({ ...p, ref: seasonByIndex(p.index) }));

	const phaseOf = (it: Item, now: number) =>
		it.endsAt <= now
			? 'ended'
			: it.startsAt !== undefined && it.startsAt > now
				? 'upcoming'
				: 'live';

	const all = $derived([
		...events.map(eventItem),
		...seasons.map((s) => seasonItem(s.ref, s.slug, s.confirmed, clock.now))
	]);
	const live = $derived(
		all.filter((e) => phaseOf(e, clock.now) === 'live').sort((a, b) => a.endsAt - b.endsAt)
	);
	const upcoming = $derived(
		all
			.filter((e) => phaseOf(e, clock.now) === 'upcoming')
			.sort((a, b) => a.startsAt! - b.startsAt!)
	);
	const ended = $derived(
		all.filter((e) => phaseOf(e, clock.now) === 'ended').sort((a, b) => b.endsAt - a.endsAt)
	);
	const liveEvents = $derived(live.filter((e) => e.kind === 'event'));
	const season = $derived(seasonAt(clock.now));

	/**
	 * Ended events stay in the prerendered HTML (and the sitemap), so crawlers can still reach
	 * their pages and nothing needs a redeploy when an event ends. Visitors see them only until
	 * the page has hydrated: once the clock is live, the list shows what is on now and next.
	 */
	const groups = $derived(
		[
			{ id: 'live', title: 'Live now', items: live, verb: 'Ends' },
			{ id: 'upcoming', title: 'Upcoming', items: upcoming, verb: 'Starts' },
			{ id: 'ended', title: 'Recently ended', items: clock.ready ? [] : ended, verb: 'Ended' }
		].filter((g) => g.items.length)
	);

	const at = (e: Item, verb: string) => (verb === 'Starts' ? e.startsAt! : e.endsAt);

	/** "13 DAYS" -> ["13", "days"] for a big number with a small unit. */
	const left = (ms: number): [string, string] => {
		const [n, ...u] = coarse(ms).split(' ');
		return [n, u.join(' ').toLowerCase()];
	};
</script>

<svelte:head>
	<title>{EVENTS_TITLE}</title>
	<meta name="description" content={EVENTS_DESCRIPTION} />
	<meta property="og:title" content={EVENTS_TITLE} />
	<meta property="og:description" content={EVENTS_DESCRIPTION} />
	<meta name="twitter:title" content={EVENTS_TITLE} />
	<meta name="twitter:description" content={EVENTS_DESCRIPTION} />
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Overwatch Events & Seasons', path: '/events' }
		])
	)}
	{@html jsonLdScript({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: [...live, ...upcoming].map((e, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: e.kind === 'season' ? `Overwatch ${e.name}` : e.name,
			url: e.url
		}))
	})}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="orange"
		glyph="star"
		eyebrow="SCHEDULE"
		title="EVENTS & SEASONS"
		subtitle={liveEvents.length
			? `${liveEvents.length} EVENT${liveEvents.length === 1 ? '' : 'S'} LIVE · ${season.label}`
			: `NO EVENT LIVE · ${season.label}`}
		srPrefix="Overwatch"
		srSuffix="Countdowns &amp; End Dates"
		ms={live[0] ? live[0].endsAt - clock.now : undefined}
		msLabel={live[0] ? `NEXT TO END · ${live[0].name.toUpperCase()}` : undefined}
	>
		<TzSwitch />
	</PageHero>

	<div class="list">
		<p class="intro">
			Start and end dates for every limited-time event and season, in your time zone. Most change
			over at the <a href={resolve('/')}>weekly reset</a>, Tuesday 11 AM PT / 2 PM ET. Dates come
			from the official Overwatch news and patch notes. Week-by-week progress is on the
			<a href={resolve('/seasons')}>season page</a>.
		</p>

		{#each groups as g (g.id)}
			<section class="group" class:past={g.id === 'ended'} aria-labelledby="g-{g.id}">
				<h2 id="g-{g.id}" class="label head">
					{g.title}
					<span class="count">{g.items.length}</span>
				</h2>
				<ul class="rows">
					{#each g.items as e (e.key)}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href comes from resolve() in eventItem/seasonItem -->
							<a class="row" href={e.href} style={e.style}>
								<span class="cell" aria-hidden="true"><Glyph name={e.glyph} /></span>
								<span class="body">
									{#if e.kind === 'season'}<span class="label kind">Season</span>{/if}
									<span class="name">{e.name}</span>
									<span class="when">
										{g.verb}
										{formatLocal(at(e, g.verb), undefined, displayZone.zone)}
									</span>
									{#if e.facts.length}
										<span class="facts">
											{#each e.facts as f (f.label)}
												<span>{f.label}: <b>{f.value}</b></span>
											{/each}
										</span>
									{/if}
								</span>
								{#if g.id !== 'ended'}
									{@const [n, u] = left(at(e, g.verb) - clock.now)}
									<span class="left">
										<span class="num n">{n}</span>
										<span class="u">{u} {g.verb === 'Ends' ? 'left' : 'to go'}</span>
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="intro">
				No events known right now. Check the <a href={resolve('/seasons')}>season schedule</a>.
			</p>
		{/each}

		<CalendarSubscribe compact />
	</div>
</div>

<style>
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}
	.list {
		max-width: 860px;
		margin-inline: auto;
		display: grid;
		gap: 32px;
	}
	.intro {
		margin: 0;
		max-width: 62ch;
		font-size: 17px;
		line-height: 1.6;
		color: var(--text-dim);
	}
	.intro a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}

	/* Same flat panel as the details box on event pages. */
	.group {
		border-radius: 6px;
		overflow: hidden;
		background: var(--bar);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0;
		padding: 10px 16px;
		font-size: 16px;
		color: var(--text);
		background: var(--panel);
	}
	.count {
		color: var(--text-dim);
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1px;
	}

	.row {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr) auto;
		align-items: stretch;
		min-height: 76px;
		background: var(--row);
		color: inherit;
		text-decoration: none;
		transition: background-color 120ms ease;
	}
	.row:hover {
		background: #36425f;
	}
	.row:focus-visible {
		outline-offset: -2px;
	}

	/* Icon cell in the event colour, like the game's list rows. */
	.cell {
		display: grid;
		place-items: center;
		background: linear-gradient(160deg, var(--tile-hi), var(--tile));
		color: rgb(255 255 255 / 0.9);
	}
	.cell :global(svg) {
		width: 30px;
		height: 30px;
	}

	.body {
		display: grid;
		align-content: center;
		gap: 2px;
		padding: 12px 18px;
	}
	.name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 24px;
		line-height: 1.1;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text);
	}
	.row:hover .name {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}
	.kind {
		font-size: 12px;
		letter-spacing: 0.08em;
		color: var(--text-faint);
	}
	.when {
		font-size: 15px;
		color: var(--text-dim);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0 16px;
		font-size: 14px;
		color: var(--text-faint);
	}
	.facts b {
		font-weight: 500;
		color: var(--text-dim);
	}

	/* The in-game "19 HOURS / TIME LEFT" block. */
	.left {
		display: grid;
		align-content: center;
		justify-items: end;
		padding: 12px 20px;
		text-align: right;
	}
	.n {
		font-size: 36px;
		line-height: 1;
		color: var(--text);
	}
	.u {
		font-size: 13px;
		color: var(--text-dim);
	}

	.past .row {
		min-height: 60px;
		background: var(--panel-deep);
	}
	.past .cell {
		filter: saturate(0.5) brightness(0.8);
	}
	.past .name {
		font-size: 20px;
		color: var(--text-dim);
	}

	@media (max-width: 559px) {
		.row {
			grid-template-columns: 48px minmax(0, 1fr);
		}
		.cell :global(svg) {
			width: 24px;
			height: 24px;
		}
		.left {
			grid-column: 2;
			justify-items: start;
			padding: 0 18px 12px;
			text-align: left;
			display: flex;
			align-items: baseline;
			gap: 6px;
		}
		.n {
			font-size: 22px;
		}
	}
</style>
