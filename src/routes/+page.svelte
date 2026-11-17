<script lang="ts">
	import { clock } from '../lib/now.svelte';
	import { allResets, nextReset, seasonAt, formatCountdown } from '../lib/resets';
	import { resolve } from '$app/paths';
	import { HOME_TITLE, HOME_DESCRIPTION, jsonLdScript, websiteJsonLd } from '../lib/seo';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import ResetCard from '#lib/components/ResetCard.svelte';

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
		<PageTitle title="RESETS" subtitle={season.label} srSuffix="Overwatch weekly reset countdown" />
	</div>

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

	<section class="info" aria-labelledby="faq">
		<h2 id="faq" class="display info-h">OVERWATCH RESET TIMES, EXPLAINED</h2>
		<p class="lead">
			The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Resetwatch
			counts down to it live, along with the end of the current event and season, in your local time.
		</p>
		<p class="more"><a href={resolve('/faq')}>More answers in the FAQ</a></p>
	</section>
</div>

<style>
	.info {
		margin-top: 56px;
		max-width: 760px;
		color: var(--text-dim);
		line-height: 1.55;
	}
	.info-h {
		margin: 0 0 12px;
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}
	.lead {
		margin: 0 0 20px;
		font-size: 17px;
	}
	.lead strong {
		color: var(--text);
	}
	.more {
		margin: 0;
	}
	.more a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}

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
	/* Card count varies with the number of events: wrap instead of a fixed column count. */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		}
	}
</style>
