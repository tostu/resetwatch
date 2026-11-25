<script lang="ts">
	import { toneStyle, type Tone } from '../tone';

	let {
		title,
		tone,
		rows
	}: {
		title: string;
		tone: Tone;
		/** `sub` is a small second line under the value. */
		rows: { label: string; value: string; sub?: string }[];
	} = $props();
</script>

<!--
	Key facts as a flat panel like the game's list rows: the page colour on the header,
	opaque slate rows with 1px gaps. The figures sit next to the prose, not above it.
-->
<aside class="glance" style={toneStyle(tone)} aria-label={title}>
	<p class="label head">{title}</p>
	<dl>
		{#each rows as r (r.label)}
			<div class="row">
				<dt>{r.label}</dt>
				<dd>
					<span class="num v">{r.value}</span>
					{#if r.sub}<span class="sub">{r.sub}</span>{/if}
				</dd>
			</div>
		{/each}
	</dl>
</aside>

<style>
	.glance {
		border-radius: 6px;
		overflow: hidden;
		background: var(--bar);
	}
	.head {
		margin: 0;
		padding: 10px 16px;
		font-size: 16px;
		color: var(--text);
		background: linear-gradient(90deg, var(--tile), var(--tile-hi));
	}
	dl {
		margin: 0;
		display: grid;
		gap: 1px;
	}
	.row {
		display: grid;
		gap: 2px;
		padding: 12px 16px 13px;
		background: var(--row);
	}
	dt {
		font-size: 14px;
		color: var(--text-dim);
	}
	dd {
		margin: 0;
		display: grid;
	}
	.v {
		font-size: 28px;
		line-height: 1.1;
		color: var(--text);
	}
	.sub {
		font-size: 14px;
		color: var(--text-dim);
	}
</style>
