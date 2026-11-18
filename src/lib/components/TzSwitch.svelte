<script lang="ts">
	import { displayZone } from '../timezone.svelte';
	import { ZONE_PAGES } from '../zones';

	const options = $derived.by(() => {
		const list = ZONE_PAGES.map((z) => ({ tz: z.tz, label: z.short }));
		const det = displayZone.detected;
		if (det && !list.some((o) => o.tz === det)) {
			list.unshift({ tz: det, label: det.split('/').pop()!.replaceAll('_', ' ') });
		}
		return list;
	});

	function onchange(e: Event) {
		displayZone.set((e.currentTarget as HTMLSelectElement).value);
	}
</script>

{#if displayZone.zone}
	<label class="tz">
		<span class="label cap">TIMES SHOWN IN</span>
		<select value={displayZone.zone} {onchange}>
			{#each options as o (o.tz)}
				<option value={o.tz}>{o.label}</option>
			{/each}
		</select>
		{#if displayZone.zone !== displayZone.detected}
			<button type="button" class="reset" onclick={() => displayZone.set(displayZone.detected)}>
				Use my zone
			</button>
		{/if}
	</label>
{/if}

<style>
	.tz {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 10px;
		font-size: 14px;
	}
	.cap {
		font-size: 12px;
		color: var(--text-dim);
	}
	select {
		min-height: 32px;
		padding: 0 28px 0 10px;
		border: 1px solid rgb(255 255 255 / 0.3);
		border-radius: 4px;
		background-color: rgb(13 20 36 / 0.85);
		color: var(--text);
		font: inherit;
	}
	.reset {
		background: none;
		border: 0;
		padding: 0;
		color: var(--cyan);
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
</style>
