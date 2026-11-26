<script lang="ts">
	import { clock } from '../now.svelte';
	import { CONFIG, nextOccurrence } from '../resets';
	import type { EventPage } from '../event-pages';

	let { p }: { p: EventPage } = $props();

	const DAY = 86_400_000;

	/** Reward track size, if the official post gave one (`Reward tiers: 24`). */
	const tiers = $derived.by(() => {
		const f = p.details?.facts.find((x) => /\b(tiers?|levels?)\b/i.test(x.label));
		const n = f ? Number.parseInt(f.value.replace(/[^\d]/g, ''), 10) : NaN;
		return Number.isFinite(n) && n > 1 && n <= 500 ? n : undefined;
	});

	const from = $derived(Math.max(clock.now, p.startsAt ?? clock.now));
	const msLeft = $derived(Math.max(0, p.endsAt - from));
	const daysLeft = $derived(msLeft / DAY);

	/** Weekly resets between now (or the start) and the end: fresh weekly challenge sets. */
	const resetsLeft = $derived.by(() => {
		let n = 0;
		let t = nextOccurrence(CONFIG.weekly, from);
		while (t < p.endsAt && n < 30) {
			n++;
			t = nextOccurrence(CONFIG.weekly, t);
		}
		return n;
	});

	let current = $state(0);
	const remaining = $derived(tiers ? Math.max(0, tiers - Math.min(tiers, current || 0)) : 0);
	const perDay = $derived(daysLeft > 0 ? remaining / daysLeft : remaining);
	const fmt = (n: number) =>
		n >= 10 ? Math.ceil(n).toString() : (Math.ceil(n * 10) / 10).toString();
</script>

<section aria-labelledby="pace">
	<h2 id="pace">How much time is left to play?</h2>
	<dl class="figures">
		<div>
			<dt>Days left</dt>
			<dd class:pending={!clock.ready}>{daysLeft >= 1 ? Math.floor(daysLeft) : '< 1'}</dd>
		</div>
		<div>
			<dt>Weekly resets before it ends</dt>
			<dd class:pending={!clock.ready}>
				{resetsLeft}<small
					>{resetsLeft === 1
						? 'one more weekly set'
						: resetsLeft
							? 'new weekly sets'
							: 'none left'}</small
				>
			</dd>
		</div>
	</dl>

	{#if tiers}
		<div class="calc">
			<label for="tier">Your current tier (of {tiers})</label>
			<div class="row">
				<input
					id="tier"
					type="number"
					inputmode="numeric"
					min="0"
					max={tiers}
					bind:value={current}
				/>
				<p class="out" aria-live="polite">
					{#if remaining === 0}
						<strong>Done.</strong> Every tier unlocked.
					{:else}
						<strong>{remaining}</strong> tiers to go: about
						<strong>{fmt(perDay)} a day</strong>{#if daysLeft >= 7}, or {fmt(perDay * 7)} a week{/if}.
					{/if}
				</p>
			</div>
			<p class="small">Spread evenly over the time left. Nothing is saved.</p>
		</div>
	{/if}
</section>

<style>
	.calc {
		margin-top: 8px;
		padding: 16px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
	}
	label {
		display: block;
		margin-bottom: 6px;
		font-size: 15px;
		color: var(--text);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 16px;
	}
	input {
		width: 96px;
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--surface-2);
		color: var(--text);
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 700;
	}
	input:focus-visible {
		outline: 2px solid var(--blue-edge);
		outline-offset: 2px;
	}
	.out {
		margin: 0;
		flex: 1 1 220px;
	}
	.small {
		margin: 10px 0 0;
		font-size: 14px;
		color: var(--text-faint);
	}
</style>
