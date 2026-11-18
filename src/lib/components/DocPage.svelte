<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageTitle from './PageTitle.svelte';

	let { title, subtitle, children }: { title: string; subtitle?: string; children: Snippet } =
		$props();
</script>

<div class="wrap page">
	<div class="top">
		<PageTitle {title} {subtitle} />
	</div>
	<div class="doc">
		{@render children()}
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}

	.top {
		margin-bottom: 36px;
	}

	.doc {
		max-width: 760px;
		color: var(--text-dim);
		line-height: 1.55;
		font-size: 16px;
	}

	.doc :global(h2) {
		margin: 32px 0 8px;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: 800;
		text-transform: uppercase;
		font-size: 26px;
		line-height: 1;
		color: var(--text);
	}

	.doc :global(h2:first-child) {
		margin-top: 0;
	}

	.doc :global(p),
	.doc :global(ul),
	.doc :global(dl) {
		margin: 0 0 12px;
	}

	.doc :global(ul) {
		padding-left: 20px;
	}

	.doc :global(strong),
	.doc :global(dt) {
		color: var(--text);
	}

	.doc :global(a) {
		color: var(--cyan);
		text-underline-offset: 3px;
	}

	.doc :global(.todo) {
		padding: 2px 6px;
		background: rgb(252 199 5 / 0.15);
		color: var(--gold);
	}
</style>
