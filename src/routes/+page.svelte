<script lang="ts">
	import { clock } from '../lib/now.svelte';
	import { allResets, nextReset, seasonAt, formatCountdown } from '../lib/resets';
	import { resolve } from '$app/paths';
	import { HOME_TITLE, HOME_DESCRIPTION, jsonLdScript, websiteJsonLd } from '../lib/seo';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import ResetCard from '#lib/components/ResetCard.svelte';
	import ZoneTable from '#lib/components/ZoneTable.svelte';

	$effect(() => clock.start());

	// Live countdown in the tab title, readable from a background tab. Foreground and
	// crawlers keep the static SEO title.
	$effect(() => {
		const live = `${formatCountdown(next.remaining)} · ${title(next)} · Resetwatch`;
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

	const AT_RESET = [
		{ name: 'WEEKLY CHALLENGES', text: 'The weekly challenge set rolls over every Tuesday.' },
		{ name: 'ITEM SHOP', text: 'Item shop rotation follows the Tuesday schedule.' },
		{ name: 'MYTHIC SHOP', text: 'Mythic Shop rotation follows the Tuesday schedule.' },
		{ name: 'ARCADE MODES', text: 'Arcade mode rotation follows the Tuesday schedule.' }
	];

	const labels: Record<string, string> = {
		weekly: 'WEEKLY',
		event: 'EVENT ENDS',
		season: 'SEASON ENDS'
	};

	const kickers: Record<string, string> = {
		weekly: 'CHALLENGES · EVERY TUESDAY',
		event: 'LIMITED TIME',
		season: 'BATTLE PASS'
	};

	// Generic "EVENT" label means the hardcoded fallback has no name; use the generic title.
	const title = (r: (typeof resets)[number]) =>
		r.kind === 'event' && r.name && r.name.toUpperCase() !== 'CURRENT EVENT'
			? r.name
			: labels[r.kind];
</script>

<svelte:head>
	<!-- Static, keyword-rich title for crawlers and search snippets. The live countdown title is
	     applied client-side only while the tab is in the background (see $effect above). -->
	<title>{HOME_TITLE}</title>
	<meta name="description" content={HOME_DESCRIPTION} />
	<meta property="og:title" content={HOME_TITLE} />
	<meta property="og:description" content={HOME_DESCRIPTION} />
	<meta name="twitter:title" content={HOME_TITLE} />
	<meta name="twitter:description" content={HOME_DESCRIPTION} />
	{@html jsonLdScript(websiteJsonLd())}
</svelte:head>

<div class="wrap page">
	<div class="top">
		<PageTitle
			title="RESETS"
			subtitle={season.label}
			srPrefix="Overwatch Weekly"
			srSuffix="Countdown"
		/>
	</div>

	<p class="intro">
		The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>, which is
		19:00 UTC in winter and 18:00 UTC in summer. Below are live countdowns to the reset, the current
		event and the season end, in your local time. See the full
		<a href={resolve('/seasons')}>season schedule</a> for week-by-week progress.
	</p>

	<div class="grid">
		{#each resets as r, i (r.id)}
			<ResetCard
				label={title(r)}
				kind={r.kind}
				kicker={r.phase === 'upcoming' ? 'UPCOMING EVENT' : kickers[r.kind]}
				endsAt={r.endsAt}
				remaining={r.remaining}
				phase={r.phase}
				isNext={r.id === next.id}
				index={i}
			/>
		{/each}
	</div>

	<div class="stack">
		<section class="feature zones-card" aria-labelledby="zones">
			<span class="sheen" aria-hidden="true"></span>
			<svg viewBox="0 0 120 120" class="glyph" aria-hidden="true">
				<circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="8" />
				<path d="M60 28v34l22 14" fill="none" stroke="currentColor" stroke-width="8" />
			</svg>
			<div class="intro-col">
				<p class="label kicker">TIME ZONES</p>
				<h2 id="zones" class="display heading">RESET TIME IN YOUR TIME ZONE</h2>
				<p class="lede">
					The next Overwatch weekly reset, converted for major cities. Your own zone is highlighted.
				</p>
			</div>
			<div class="body-col">
				<ZoneTable now={clock.now} />
			</div>
		</section>

		<section class="feature what-card" aria-labelledby="what">
			<span class="sheen" aria-hidden="true"></span>
			<div class="intro-col">
				<p class="label kicker">EVERY TUESDAY</p>
				<h2 id="what" class="display heading">WHAT HAPPENS AT RESET</h2>
				<p class="lede">
					Seasons, limited-time events and patches go live at the same time. More in the
					<a href={resolve('/faq')}>reset time FAQ</a>.
				</p>
			</div>
			<ul class="body-col rows">
				{#each AT_RESET as item (item.name)}
					<li class="row">
						<span class="label rname">{item.name}</span>
						<span class="rdesc">{item.text}</span>
					</li>
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
	.intro {
		margin: -12px 0 28px;
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.intro a {
		color: inherit;
		text-underline-offset: 3px;
	}
	/* Card count varies with the number of events: wrap instead of a fixed column count. */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	/* Big gap below the reset cards, then one full-width feature card per topic. */
	.stack {
		display: grid;
		gap: 32px;
		margin-top: 88px;
	}

	/* Same language as ResetCard: gradient field, scrim, target rings, slow sheen. */
	.feature {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		display: grid;
		gap: 24px;
		min-width: 0;
		padding: 28px 22px 30px;
		border-radius: 8px;
		background: linear-gradient(165deg, var(--c1) 0%, var(--c2) 58%, var(--c3) 100%);
		box-shadow:
			0 1px 0 rgb(255 255 255 / 0.18) inset,
			0 18px 32px -14px rgb(4 8 30 / 0.7);
	}
	.zones-card {
		--c1: #2a8cf0;
		--c2: #0b4fb3;
		--c3: #082a6b;
	}
	.what-card {
		--c1: #14a38a;
		--c2: #026958;
		--c3: #013a33;
	}
	.feature::before {
		content: '';
		position: absolute;
		z-index: -2;
		right: -10%;
		top: -30%;
		width: 70%;
		aspect-ratio: 1;
		background: repeating-radial-gradient(
			circle,
			rgb(255 255 255 / 0.09) 0 2px,
			rgb(255 255 255 / 0) 2px 26px
		);
		-webkit-mask-image: radial-gradient(circle, #000 20%, transparent 68%);
		mask-image: radial-gradient(circle, #000 20%, transparent 68%);
	}
	.feature::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(0deg, rgb(5 8 24 / 0.6) 0%, rgb(5 8 24 / 0) 60%);
		pointer-events: none;
	}
	.sheen {
		position: absolute;
		inset: -20% auto -20% 0;
		z-index: -1;
		width: 30%;
		background: linear-gradient(
			90deg,
			rgb(255 255 255 / 0) 0%,
			rgb(255 255 255 / 0.12) 50%,
			rgb(255 255 255 / 0)
		);
		transform: translateX(-160%) skewX(-22deg);
		mix-blend-mode: overlay;
		pointer-events: none;
		animation: sheen 10s cubic-bezier(0.45, 0, 0.25, 1) infinite;
	}
	@keyframes sheen {
		0% {
			transform: translateX(-160%) skewX(-22deg);
		}
		22%,
		100% {
			transform: translateX(520%) skewX(-22deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheen {
			display: none;
		}
	}
	.glyph {
		position: absolute;
		z-index: -1;
		right: 24px;
		top: 22px;
		width: 72px;
		color: rgb(255 255 255 / 0.18);
	}
	.kicker {
		margin: 0 0 6px;
		font-size: 15px;
		color: var(--gold);
	}
	.heading {
		margin: 0;
		font-size: clamp(32px, 7vw, 46px);
		line-height: 1;
		color: var(--text);
	}
	.lede {
		margin: 14px 0 0;
		max-width: 38ch;
		font-size: 16px;
		line-height: 1.5;
		color: rgb(255 255 255 / 0.85);
	}
	.lede a {
		color: inherit;
		text-underline-offset: 3px;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.row {
		background: rgb(5 8 24 / 0.45);
		border-left: 4px solid var(--gold);
		padding: 14px 18px;
		display: grid;
		gap: 2px;
	}
	.rname {
		font-size: 22px;
	}
	.rdesc {
		font-size: 15px;
		color: rgb(255 255 255 / 0.8);
	}
	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		}
		.rows {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 900px) {
		.stack {
			margin-top: 112px;
			gap: 40px;
		}
		.feature {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
			gap: 48px;
			padding: 40px 40px 44px;
			align-items: start;
		}
		.glyph {
			display: none;
		}
	}
</style>
