<script lang="ts">
	import { onMount } from 'svelte';
	import { clock } from '../../lib/now.svelte';
	import { allResets, formatCountdown, seasonAt } from '../../lib/resets';
	import { SITE_URL } from '../../lib/seo';

	/**
	 * Bare countdown for iframes and OBS browser sources. Options come from the query string,
	 * read on the client (the page is prerendered once, without a query):
	 *   show  = weekly (default) | season | event | all
	 *   bg    = dark (default) | transparent
	 *   size  = s | m (default) | l
	 *   brand = 0 hides the small site name
	 */
	type Show = 'weekly' | 'season' | 'event' | 'all';

	let show = $state<Show>('weekly');
	let transparent = $state(false);
	let size = $state<'s' | 'm' | 'l'>('m');
	let brand = $state(true);

	onMount(() => {
		const q = new URLSearchParams(location.search);
		const s = q.get('show');
		if (s === 'season' || s === 'event' || s === 'all') show = s;
		transparent = q.get('bg') === 'transparent';
		const z = q.get('size');
		if (z === 's' || z === 'l') size = z;
		brand = q.get('brand') !== '0';
		if (transparent) {
			document.documentElement.style.background = 'transparent';
			document.body.style.background = 'transparent';
		}
	});

	$effect(() => clock.start());

	const resets = $derived(allResets(clock.now));
	const season = $derived(seasonAt(clock.now));
	const weekly = $derived(resets.find((r) => r.kind === 'weekly')!);
	const event = $derived(
		resets
			.filter((r) => r.kind === 'event' && r.phase === 'live')
			.sort((a, b) => a.remaining - b.remaining)[0]
	);

	interface Row {
		label: string;
		value: string;
	}
	const rows = $derived.by<Row[]>(() => {
		const w = { label: 'Weekly reset', value: formatCountdown(weekly.remaining) };
		const s = {
			label: `Season ${season.number} ends`,
			value: formatCountdown(season.end - clock.now)
		};
		const e = event
			? { label: `${event.name ?? 'Event'} ends`, value: formatCountdown(event.remaining) }
			: undefined;
		if (show === 'season') return [s];
		if (show === 'event') return [e ?? w];
		if (show === 'all') return [w, ...(e ? [e] : []), s];
		return [w];
	});
</script>

<svelte:head>
	<title>Overwatch countdown · Resetwatch</title>
	<meta name="description" content="Embeddable Overwatch reset countdown." />
</svelte:head>

<div class="embed size-{size}" class:transparent>
	{#each rows as r (r.label)}
		<div class="row">
			<span class="label lbl">{r.label}</span>
			<span class="num val" class:pending={!clock.ready} role="timer" aria-live="off"
				>{r.value}</span
			>
		</div>
	{/each}
	{#if brand}
		<!-- Opens the full site; target _blank so the embedding page stays put. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- absolute link out of the iframe -->
		<a class="label brand" href="{SITE_URL}/" target="_blank" rel="noopener">resetwatch.tostu.net</a
		>
	{/if}
</div>

<style>
	.embed {
		--fs: 44px;
		display: grid;
		gap: 6px;
		padding: 14px 18px;
		min-height: 100vh;
		align-content: center;
		background: linear-gradient(160deg, #1a2350, var(--bg-night));
		color: var(--text);
	}
	.embed.transparent {
		background: transparent;
		/* Readable over any game scene. */
		text-shadow:
			0 2px 6px rgb(0 0 0 / 0.75),
			0 0 2px rgb(0 0 0 / 0.9);
	}
	.size-s {
		--fs: 28px;
	}
	.size-l {
		--fs: 72px;
	}
	.row {
		display: grid;
		gap: 0;
	}
	.lbl {
		font-size: calc(var(--fs) * 0.36);
		color: var(--orange-flare);
	}
	.val {
		font-size: var(--fs);
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		white-space: nowrap;
	}
	.brand {
		margin-top: 4px;
		font-size: 12px;
		color: rgb(255 255 255 / 0.55);
		text-decoration: none;
	}
	.brand:hover {
		color: var(--text);
	}
</style>
