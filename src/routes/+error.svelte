<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PageHero from '#lib/components/PageHero.svelte';

	const notFound = $derived(page.status === 404);
	const title = $derived(notFound ? '404' : String(page.status));
	const subtitle = $derived(notFound ? 'RESET NOT FOUND' : 'SOMETHING BROKE');
	const message = $derived(
		notFound
			? 'This page does not exist, or it moved. The countdowns are still running on the home page.'
			: (page.error?.message ?? 'Unexpected error. Try again in a moment.')
	);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Error'} | Resetwatch</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="wrap err">
	<PageHero tone="slate" glyph="target" eyebrow="ERROR" {title} {subtitle}>
		<p class="msg">{message}</p>
		<div class="actions">
			<a class="btn-primary" href={resolve('/')}>Back to resets</a>
			<a class="btn-secondary" href={resolve('/faq')}>FAQ</a>
			<a class="btn-secondary" href={resolve('/seasons')}>Seasons</a>
		</div>
	</PageHero>
</div>

<style>
	.err {
		padding-block: 24px 48px;
	}

	.msg {
		max-width: 520px;
		margin: 0;
		color: rgb(255 255 255 / 0.85);
		font-size: 18px;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}
</style>
