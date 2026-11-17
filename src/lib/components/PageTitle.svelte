<script lang="ts">
	let { title, subtitle }: { title: string; subtitle?: string } = $props();
</script>

<header class="page-title">
	<h1 class="display title" data-ghost={title}>{title}</h1>
	{#if subtitle}
		<p class="display sub">{subtitle}</p>
	{/if}
</header>

<style>
	.page-title {
		min-width: 0;
	}

	.title {
		position: relative;
		margin: 0;
		font-size: clamp(60px, 13vw, 120px);
		line-height: 0.9;
		padding-right: 0.08em;
		/* Chrome-ish fade, brightest in the middle like the in-game page titles. */
		background: linear-gradient(180deg, rgb(255 255 255 / 0.45) 0%, #fff 40%, #d6e6ff 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		filter: drop-shadow(0 6px 18px rgb(8 14 48 / 0.45));
	}

	/* Ghost echo offset up-left. Decorative, so it lives in CSS only. */
	.title::before {
		content: attr(data-ghost);
		position: absolute;
		inset: 0;
		/* Same padding as the title, or the ghost box is wider and wraps differently. */
		padding-right: inherit;
		transform: translate(-0.06em, -0.1em);
		background: linear-gradient(180deg, rgb(255 255 255 / 0.22), rgb(255 255 255 / 0));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		z-index: -1;
		pointer-events: none;
	}

	.sub {
		margin: 10px 0 0;
		display: inline-block;
		padding: 4px 18px 4px 14px;
		font-size: clamp(20px, 4vw, 28px);
		line-height: 1.15;
		color: var(--cyan-ink, #06223f);
		background: var(--cyan, #5cc8ff);
		clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
	}
</style>
