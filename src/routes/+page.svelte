<script lang="ts">
	import { clock } from '../lib/now.svelte';
	import {
		allResets,
		nextReset,
		seasonAt,
		formatCountdown,
		formatLocal,
		urgency
	} from '../lib/resets';
	import { displayZone } from '../lib/timezone.svelte';
	import { resolve } from '$app/paths';
	import {
		HOME_TITLE,
		HOME_DESCRIPTION,
		FAQS,
		faqJsonLd,
		jsonLdScript,
		websiteJsonLd
	} from '../lib/seo';
	import TzSwitch from '#lib/components/TzSwitch.svelte';
	import ZoneTable from '#lib/components/ZoneTable.svelte';
	import Glyph from '#lib/components/Glyph.svelte';
	import { eventTone, eventGlyph, toneStyle } from '../lib/tone';

	$effect(() => clock.start());

	// Live countdown in the tab title, readable from a background tab. Foreground and
	// crawlers keep the static SEO title.
	$effect(() => {
		const live = `${formatCountdown(next.remaining)} · ${next.label} · Resetwatch`;
		document.title = document.hidden ? live : HOME_TITLE;
	});
	$effect(() => {
		const restore = () => {
			if (!document.hidden) document.title = HOME_TITLE;
		};
		document.addEventListener('visibilitychange', restore);
		return () => {
			document.removeEventListener('visibilitychange', restore);
			document.title = HOME_TITLE;
		};
	});

	const season = $derived(seasonAt(clock.now));
	const next = $derived(nextReset(clock.now));
	const resets = $derived(allResets(clock.now));
	const weekly = $derived(resets.find((r) => r.kind === 'weekly')!);
	const events = $derived(resets.filter((r) => r.kind === 'event'));
	const seasonLeft = $derived(season.end - clock.now);
	/** How far into the current season week we are, 0..1. */
	const WEEK = 7 * 86_400_000;
	const weekFrac = $derived(
		Math.min(1, Math.max(0, (clock.now - (season.start + (season.week - 1) * WEEK)) / WEEK))
	);
	/** UTC time of the next reset; 19:00 in US winter, 18:00 in US summer, so derive it. */
	const utcTime = $derived(
		`${String(new Date(weekly.endsAt).getUTCHours()).padStart(2, '0')}:00 UTC`
	);
	/** Where the next reset sits on the track: the end of the current week, 0..1. */
	const markerPos = $derived(season.week / season.weeks);

	const AT_RESET = [
		{ name: 'Weekly challenges', text: 'New challenge set, progress starts at zero.' },
		{ name: 'Item shop', text: 'Featured bundles and sales rotate.' },
		{ name: 'Mythic shop', text: 'Mythic rotation changes on the same schedule.' },
		{ name: 'Arcade modes', text: 'Arcade playlist rotates.' }
	];

	/** The fallback event row has the generic name `CURRENT EVENT`; show it as plain "Event". */
	const eventName = (r: (typeof resets)[number]) =>
		r.name && r.name.toUpperCase() !== 'CURRENT EVENT' ? r.name : 'Event';

	const when = (ts: number) => formatLocal(ts, undefined, displayZone.zone);

	/** Short tile date: `Tue, Dec 8`. */
	const day = (ts: number) =>
		new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			timeZone: displayZone.zone || undefined
		}).format(ts);
</script>

<svelte:head>
	<title>{HOME_TITLE}</title>
	<meta name="description" content={HOME_DESCRIPTION} />
	<meta property="og:title" content={HOME_TITLE} />
	<meta property="og:description" content={HOME_DESCRIPTION} />
	<meta name="twitter:title" content={HOME_TITLE} />
	<meta name="twitter:description" content={HOME_DESCRIPTION} />
	{@html jsonLdScript(websiteJsonLd())}
	{@html jsonLdScript(faqJsonLd())}
</svelte:head>

<div class="page">
	<!--
		One answer above the fold: when is the weekly reset. A full-width season track ties it
		to the season: weekly countdown above its left side, season end above its right end.
		The orange marker is the reset the big countdown counts to.
	-->
	<section class="hero" aria-labelledby="weekly" style="--pos: {markerPos}">
		<div class="hero-top">
			<div class="hero-main">
				<h1 id="weekly" class="label eyebrow">
					<span class="sr-only">Overwatch</span> Weekly reset in
					<span class="sr-only">– live countdown</span>
				</h1>
				<div
					class="num big"
					class:pending={!clock.ready}
					role="timer"
					aria-live="off"
					aria-label="Weekly reset countdown"
				>
					{formatCountdown(weekly.remaining)}
				</div>
				<p class="hero-when">
					<time datetime={new Date(weekly.endsAt).toISOString()}>{when(weekly.endsAt)}</time>
					<span class="sep" aria-hidden="true">·</span>
					every Tuesday, 2 PM ET / 11 AM PT / {utcTime}
				</p>
			</div>

			<!-- Mirrors the weekly block: eyebrow, countdown, date line. -->
			<a class="season-end" href={resolve('/seasons')}>
				<span class="label eyebrow">Season {season.number} ends in</span>
				<span class="num se-count" class:pending={!clock.ready}>{formatCountdown(seasonLeft)}</span>
				<span class="se-when"
					>{#if season.title}<span class="se-title">{season.title}</span><span
							class="sep"
							aria-hidden="true">·</span
						>{/if}{day(season.end)}</span
				>
			</a>
		</div>

		<a class="timeline" href={resolve('/seasons')}>
			<span
				class="tl-track"
				role="progressbar"
				aria-label="Season progress"
				aria-valuemin="1"
				aria-valuemax={season.weeks}
				aria-valuenow={season.week}
				aria-valuetext="Week {season.week} of {season.weeks}"
			>
				{#each Array.from({ length: season.weeks }, (_, i) => i + 1) as w (w)}
					<span class="tl-seg" class:done={w < season.week} class:cur={w === season.week}>
						{#if w === season.week}<span class="tl-fill" style="width: {weekFrac * 100}%"
							></span>{/if}
					</span>
				{/each}
				<span class="tl-marker" aria-hidden="true"></span>
			</span>
			<span class="tl-foot">
				<span class="label tl-week">Week {season.week} of {season.weeks}</span>
				<span class="label tl-next" class:flip={markerPos < 0.35} aria-hidden="true"
					>{markerPos >= 1 ? 'Season ends' : 'Next reset'} · {day(weekly.endsAt)}</span
				>
			</span>
		</a>

		<div class="hero-actions">
			<a class="btn-primary" href="{resolve('/seasons')}#subscribe">Subscribe to season dates</a>
			<TzSwitch />
		</div>
	</section>

	{#if events.length}
		<section class="block" aria-labelledby="events">
			<div class="block-head">
				<h2 id="events" class="display h2">Events</h2>
				<a class="more" href={resolve('/events')}>All events →</a>
			</div>
			<!-- Arcade-style tiles: flat colour field, one white glyph, yellow meta line, italic title. -->
			<ul class="events">
				{#each events as e, i (e.id)}
					{@const upcoming = e.phase === 'upcoming'}
					{@const level = urgency(e.remaining)}
					{@const key = e.slug ?? e.id}
					<li
						class="ev"
						class:feature={i === 0 && events.length > 2}
						style="{toneStyle(eventTone(key))} --i: {i}"
					>
						<svelte:element
							this={e.slug ? 'a' : 'div'}
							class="ev-card"
							href={e.slug ? resolve('/events/[slug]', { slug: e.slug }) : undefined}
						>
							<span class="sheen" aria-hidden="true"></span>
							<Glyph name={eventGlyph(key)} class="ev-glyph" />
							<span class="ev-top">
								{#if upcoming}
									<span class="pill">Upcoming</span>
								{:else if level === 'critical'}
									<span class="pill pill-crit">Under 1 hour</span>
								{:else if level === 'soon'}
									<span class="pill pill-soon">Ends soon</span>
								{/if}
							</span>
							<span class="ev-body">
								<span class="label ev-meta">
									{upcoming ? 'Starts' : 'Ends'}
									<time datetime={new Date(e.endsAt).toISOString()}>{day(e.endsAt)}</time>
								</span>
								<span class="display ev-name">{eventName(e)}</span>
								<span
									class="num ev-count"
									class:pending={!clock.ready}
									role="timer"
									aria-live="off"
									aria-label="{upcoming ? 'Starts' : 'Ends'} in"
									>{formatCountdown(e.remaining)}</span
								>
								{#if i === 0 && e.details?.summary}<span class="ev-sum">{e.details.summary}</span
									>{/if}
							</span>
						</svelte:element>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="block" aria-labelledby="zones">
		<div class="block-head">
			<h2 id="zones" class="display h2">Reset time by city</h2>
			<a class="more" href={resolve('/reset-time')}>All time zones →</a>
		</div>
		<div class="panel"><ZoneTable now={clock.now} /></div>
	</section>

	<section class="block" aria-labelledby="what">
		<div class="block-head">
			<h2 id="what" class="display h2">What rolls over on Tuesday</h2>
		</div>
		<ul class="rollover">
			{#each AT_RESET as item (item.name)}
				<li>
					<span class="label ro-name">{item.name}</span>
					<span class="ro-text">{item.text}</span>
				</li>
			{/each}
		</ul>
		<p class="note">
			Seasons, limited-time events and patches go live at the same time as the weekly reset.
		</p>
	</section>

	<section class="block" aria-labelledby="faq">
		<div class="block-head">
			<h2 id="faq" class="display h2">Questions</h2>
			<a class="more" href={resolve('/faq')}>Full FAQ →</a>
		</div>
		<div class="faq">
			{#each FAQS as f (f.q)}
				<details class="qa">
					<summary class="q">
						<span>{f.q}</span>
						<span class="chev" aria-hidden="true"></span>
					</summary>
					<p class="a">{f.a}</p>
				</details>
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		padding-block: 32px 64px;
		display: grid;
		gap: 56px;
	}

	/* ---------- hero ---------- */

	.hero {
		display: grid;
		gap: 16px;
	}
	.hero-main {
		min-width: 0;
	}
	.eyebrow {
		margin: 0;
		font-size: 18px;
		color: var(--text-dim);
	}
	.big {
		margin-top: 4px;
		font-size: clamp(64px, 15vw, 136px);
		font-style: italic;
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.hero-when {
		margin: 12px 0 0;
		font-size: 17px;
		color: var(--text-dim);
	}
	.hero-when time {
		color: var(--text);
		font-weight: 500;
	}
	.sep {
		margin: 0 6px;
		color: var(--text-faint);
	}
	.hero-actions {
		margin-top: 28px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px 24px;
		min-height: 44px;
	}

	/* ---------- season timeline ---------- */

	.hero-top {
		display: grid;
		gap: 28px 48px;
	}
	/* Right block mirrors the weekly block one size down. */
	.season-end {
		display: grid;
		align-content: end;
		color: var(--text);
		text-decoration: none;
	}
	.se-count {
		margin-top: 4px;
		font-size: clamp(40px, 6vw, 64px);
		font-style: italic;
		font-weight: 800;
		line-height: 0.95;
		white-space: nowrap;
		color: rgb(255 255 255 / 0.78);
		transition: color 150ms ease;
	}
	.se-when {
		margin-top: 12px;
		font-size: 17px;
		color: var(--text-dim);
	}
	.se-title {
		color: var(--text);
		font-weight: 500;
	}
	.season-end:hover .se-count {
		color: var(--text);
	}

	.timeline {
		/* Gap between week segments; the marker maths below depends on it. */
		--g: 4px;
		/* Centre of the gap after the current week, as a length along the track. */
		--at: calc(var(--pos) * (100% + var(--g)) - var(--g) / 2);
		display: grid;
		gap: 10px;
		margin-top: 28px;
		color: var(--text);
		text-decoration: none;
	}

	.tl-track {
		position: relative;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: var(--g);
	}
	/*
	 * Slanted week segments, the same parallelogram language as the game's sub-tabs.
	 * Past weeks stay quiet so the current week is the only loud thing on the track.
	 */
	.tl-seg {
		position: relative;
		overflow: hidden;
		height: 14px;
		transform: skewX(-20deg);
		background: rgb(255 255 255 / 0.07);
		transition: background-color 150ms ease;
	}
	.tl-seg.done {
		background: rgb(255 255 255 / 0.3);
	}
	.tl-seg.cur {
		background: rgb(234 95 18 / 0.18);
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}
	.tl-fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--accent);
	}
	.timeline:hover .tl-seg.done {
		background: rgb(255 255 255 / 0.45);
	}

	/* Small pointer under the track at the end of this week: the reset the big timer counts to. */
	.tl-marker {
		position: absolute;
		top: calc(100% + 3px);
		left: var(--at);
		width: 0;
		height: 0;
		margin-left: -5px;
		border-inline: 5px solid transparent;
		border-bottom: 6px solid var(--orange-flare);
	}

	.tl-foot {
		position: relative;
		height: 18px;
		margin-top: 4px;
	}
	/* Right-aligned to the marker; flipped to start at it when the marker is near the left. */
	.tl-next {
		position: absolute;
		top: 0;
		left: var(--at);
		transform: translateX(-100%);
		padding-right: 6px;
		font-size: 13px;
		white-space: nowrap;
		color: var(--orange-flare);
	}
	.tl-next.flip {
		transform: none;
		padding: 0 0 0 6px;
	}
	.tl-week {
		position: absolute;
		left: 0;
		top: 0;
		font-size: 13px;
		color: var(--text-faint);
	}
	.timeline:hover .tl-week {
		color: var(--text-dim);
	}
	/* Phones: week count would collide with the marker label; the track shows it anyway. */
	@media (max-width: 719px) {
		.tl-week {
			display: none;
		}
	}
	.hero > .hero-actions {
		margin-top: 20px;
	}

	/* ---------- sections ---------- */

	.block {
		min-width: 0;
	}
	.block-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}
	.h2 {
		margin: 0;
		font-size: 30px;
		line-height: 1;
	}
	.more {
		flex: none;
		font-size: 15px;
		color: var(--text-dim);
		text-decoration: none;
	}
	.more:hover {
		color: var(--text);
	}
	.panel {
		padding: 8px 12px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
	}

	/* ---------- events ---------- */

	.events {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		grid-auto-flow: dense;
		gap: 16px;
	}
	.ev {
		min-width: 0;
	}

	.ev-card {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 12px;
		height: 100%;
		min-height: 220px;
		padding: 16px 20px 20px;
		border-radius: 8px;
		background: linear-gradient(
			165deg,
			var(--tile-hi) 0%,
			var(--tile) 58%,
			color-mix(in srgb, var(--tile) 55%, #050818) 100%
		);
		box-shadow:
			inset 0 1px rgb(255 255 255 / 0.18),
			0 18px 32px -14px rgb(4 8 30 / 0.7);
		color: var(--text);
		text-decoration: none;
		transition:
			transform 160ms ease,
			box-shadow 160ms ease;
		animation: rise 420ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
		animation-delay: calc(var(--i) * 50ms);
	}
	/* Concentric rings behind the glyph, fading out to the edges. */
	.ev-card::before {
		content: '';
		position: absolute;
		z-index: -2;
		top: 34%;
		left: 50%;
		width: 130%;
		aspect-ratio: 1;
		transform: translate(-50%, -50%);
		background: repeating-radial-gradient(
			circle,
			rgb(255 255 255 / 0.09) 0 2px,
			transparent 2px 26px
		);
		mask-image: radial-gradient(circle, #000 20%, transparent 68%);
		pointer-events: none;
	}
	/* Light band that slides across now and then. */
	.sheen {
		position: absolute;
		z-index: 0;
		inset: -20% auto -20% 0;
		width: 45%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgb(255 255 255 / 0.13) 50%,
			transparent 100%
		);
		mix-blend-mode: overlay;
		pointer-events: none;
		transform: translateX(-160%) skewX(-22deg);
		animation: sheen 9s cubic-bezier(0.45, 0, 0.25, 1) infinite;
		animation-delay: calc(1.2s + var(--i) * 0.45s);
	}
	@keyframes sheen {
		0% {
			transform: translateX(-160%) skewX(-22deg);
		}
		22%,
		100% {
			transform: translateX(360%) skewX(-22deg);
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}
	@keyframes breathe {
		0%,
		100% {
			opacity: 0.75;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.06);
		}
	}
	@keyframes float {
		0%,
		100% {
			translate: 0;
		}
		50% {
			translate: 0 -6px;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.ev-card::before {
			animation: breathe 7s ease-in-out infinite;
			animation-delay: calc(var(--i) * -1.7s);
		}
		.ev-card :global(.ev-glyph) {
			animation: float 6s ease-in-out infinite;
			animation-delay: calc(var(--i) * -1.3s);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ev-card,
		.sheen {
			animation: none;
		}
		.sheen {
			display: none;
		}
	}
	/* Legibility scrim under the text block. */
	.ev-card::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(0deg, rgb(5 8 24 / 0.55) 0%, rgb(5 8 24 / 0) 55%);
		pointer-events: none;
	}
	a.ev-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 0 0 2px rgb(255 255 255 / 0.85);
	}
	a.ev-card:active {
		transform: translateY(-1px);
	}

	.ev-card :global(.ev-glyph) {
		position: absolute;
		z-index: -1;
		right: 20px;
		top: 22px;
		width: min(34cqi, 110px);
		color: #fff;
		filter: drop-shadow(0 6px 14px rgb(0 0 0 / 0.28));
	}

	.ev-top {
		display: flex;
		min-height: 22px;
	}
	.ev-body {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.ev-meta {
		font-size: 14px;
		color: var(--gold);
	}
	.ev-name {
		font-size: clamp(26px, 11cqi, 34px);
		line-height: 1;
		overflow-wrap: anywhere;
	}
	.ev-count {
		margin-top: 6px;
		font-size: 24px;
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		white-space: nowrap;
		color: rgb(255 255 255 / 0.92);
	}
	.ev-sum {
		margin-top: 8px;
		max-width: 46ch;
		font-size: 15px;
		line-height: 1.45;
		color: rgb(255 255 255 / 0.88);
	}

	/* First event gets the big tile, like 3V3 Elimination in the Arcade grid. */
	.feature .ev-card {
		min-height: 456px;
	}
	.feature :global(.ev-glyph) {
		top: 34%;
		left: 50%;
		right: auto;
		width: min(42cqi, 220px);
		transform: translate(-50%, -50%);
	}
	.feature .ev-name {
		font-size: clamp(34px, 9cqi, 52px);
	}
	.feature .ev-count {
		font-size: 36px;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		height: 22px;
		padding: 0 9px;
		border-radius: 999px;
		background: rgb(5 8 24 / 0.45);
		color: var(--text);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 13px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
		animation: chip-in 240ms cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	.pill-soon {
		background: var(--gold);
		color: var(--ink);
	}
	.pill-crit {
		background: var(--crit);
		color: var(--text);
	}

	/* ---------- rollover ---------- */

	.rollover {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 16px 32px;
	}
	.rollover li {
		display: grid;
		gap: 2px;
	}
	.ro-name {
		font-size: 18px;
	}
	.ro-text {
		font-size: 15px;
		color: var(--text-dim);
	}
	.note {
		margin: 20px 0 0;
		font-size: 14px;
		color: var(--text-faint);
	}

	/* ---------- faq ---------- */

	.faq {
		border-top: 1px solid var(--line);
	}
	.qa {
		border-bottom: 1px solid var(--line);
	}
	.q {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 56px;
		padding: 12px 4px;
		font-size: 17px;
		font-weight: 500;
		cursor: pointer;
		list-style: none;
	}
	.q::-webkit-details-marker {
		display: none;
	}
	.q:hover {
		color: var(--text);
	}
	.chev {
		flex: none;
		width: 9px;
		height: 9px;
		border-right: 2px solid var(--text-dim);
		border-bottom: 2px solid var(--text-dim);
		transform: translateY(-2px) rotate(45deg);
		transition: transform 180ms ease;
	}
	.qa[open] .chev {
		transform: translateY(2px) rotate(-135deg);
	}
	.a {
		margin: 0;
		padding: 0 4px 18px;
		max-width: 72ch;
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-dim);
	}
	.qa[open] .a {
		animation: reveal 200ms ease;
	}
	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
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

	@media (min-width: 900px) {
		.ev.feature {
			grid-column: span 2;
			grid-row: span 2;
		}
	}
	@media (max-width: 899px) {
		.feature .ev-card {
			min-height: 300px;
		}
	}
	/* Phones: compact tiles, glyph tucked top-right so it never meets the title. */
	@media (max-width: 639px) {
		.ev-card,
		.feature .ev-card {
			min-height: 176px;
		}
		.ev-card :global(.ev-glyph),
		.feature :global(.ev-glyph) {
			top: 18px;
			right: 18px;
			left: auto;
			width: 64px;
			transform: none;
		}
		.feature .ev-name {
			font-size: 34px;
		}
		.feature .ev-count {
			font-size: 30px;
		}
	}

	@media (min-width: 640px) {
		.rollover {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 960px) {
		.page {
			padding-top: 56px;
			gap: 72px;
		}
		.hero {
			gap: 0;
		}
		.hero-top {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}
		.season-end {
			text-align: right;
		}
	}
</style>
