<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageHero from './PageHero.svelte';
	import type { Tone, GlyphName } from '../tone';

	let {
		title,
		subtitle,
		tone = 'slate',
		glyph = 'info',
		children
	}: {
		title: string;
		subtitle?: string;
		tone?: Tone;
		glyph?: GlyphName;
		children: Snippet;
	} = $props();
</script>

<div class="wrap page">
	<PageHero {tone} {glyph} {title} {subtitle} />
	<div class="doc">
		{@render children()}
	</div>
</div>

<style>
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}

	/* Prose styles live in layout.css (.doc). Info pages put h2s straight in the flow, so
	   give those the same top rule the sectioned pages get. */
	.doc > :global(h2) {
		margin-top: 40px;
		padding-top: 32px;
		border-top: 1px solid var(--line);
	}
	.doc > :global(h2:first-child) {
		margin-top: 0;
		padding-top: 0;
		border-top: 0;
	}
</style>
