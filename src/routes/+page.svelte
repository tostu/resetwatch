<script lang="ts">
	import { clock } from '../lib/now.svelte';
	import { allResets, nextReset, seasonAt, formatCountdown } from '../lib/resets';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import ResetCard from '#lib/components/ResetCard.svelte';

	$effect(() => clock.start());

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
	<!-- Live countdown in the tab title, readable from a background tab. -->
	<title>{formatCountdown(next.remaining)} · {title(next)} · Resetwatch</title>
	<meta
		name="description"
		content="Live countdowns to the Overwatch weekly, event and season resets, in your local time."
	/>
</svelte:head>

<div class="wrap page">
	<div class="top">
		<PageTitle title="RESETS" subtitle={season.label} />
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
