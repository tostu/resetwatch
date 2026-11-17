<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import TopBar from '#lib/components/TopBar.svelte';
	import KeyHints from '#lib/components/KeyHints.svelte';
	import { page } from '$app/state';
	import { absolute, SITE_NAME } from '../lib/seo';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const canonical = $derived(absolute(page.url.pathname === '/' ? '/' : page.url.pathname));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<!-- Blurred skylight bars, like the lobby behind the game's Story screen. -->
<div class="backdrop" aria-hidden="true">
	<span class="bar b1"></span>
	<span class="bar b2"></span>
	<span class="bar b3"></span>
</div>

<TopBar />

<main class="wrap">
	{@render children()}
</main>

<footer class="wrap foot">
	<p>
		Not affiliated with Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment,
		Inc.
	</p>
</footer>

<KeyHints />

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}

	.bar {
		position: absolute;
		display: block;
		background: linear-gradient(
			90deg,
			rgb(255 255 255 / 0) 0%,
			rgb(255 255 255 / 0.28) 50%,
			rgb(255 255 255 / 0) 100%
		);
		filter: blur(14px);
		transform: skewX(-28deg);
		opacity: 0.55;
	}

	.b1 {
		top: 8%;
		left: 8%;
		width: 34%;
		height: 120px;
	}

	.b2 {
		top: 4%;
		left: 52%;
		width: 26%;
		height: 190px;
		opacity: 0.4;
	}

	.b3 {
		top: 30%;
		left: 70%;
		width: 36%;
		height: 90px;
		opacity: 0.3;
	}

	main {
		padding-top: 56px;
		padding-bottom: 24px;
		min-height: calc(100vh - 160px);
	}

	.foot {
		padding-block: 24px 64px;
		color: var(--text-dim);
		font-size: 12px;
	}

	.foot p {
		margin: 0;
	}

	@media (min-width: 720px) {
		main {
			padding-top: 52px;
		}
	}

	@media (max-width: 719px) {
		.foot {
			padding-bottom: calc(var(--mobile-bar-h) + 24px);
		}
	}
</style>
