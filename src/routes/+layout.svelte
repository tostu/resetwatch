<script lang="ts">
	import './layout.css';
	import TopBar from '#lib/components/TopBar.svelte';
	import KeyHints from '#lib/components/KeyHints.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { page } from '$app/state';
	import { absolute, OG_IMAGE, OG_IMAGE_ALT, SITE_NAME } from '../lib/seo';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const canonical = $derived(absolute(page.url.pathname === '/' ? '/' : page.url.pathname));

	// Pages that should stay out of the index. One robots tag per page, set here only.
	const NOINDEX_PATHS = ['/privacy'];
	const robots = $derived(
		NOINDEX_PATHS.includes(page.url.pathname)
			? 'noindex, follow'
			: 'index, follow, max-snippet:-1, max-image-preview:large'
	);
</script>

<svelte:head>
	<!-- Real file in /static: Vite would inline a small imported SVG as a data: URI, which
	     Google does not fetch for search-result favicons. -->
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
	<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content={robots} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={OG_IMAGE} />
	<meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
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

<Footer />

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
		/* Fill the first screen so the footer only shows after scrolling down. */
		min-height: 100vh;
		min-height: 100dvh;
	}

	@media (min-width: 720px) {
		main {
			padding-top: 52px;
		}
	}
</style>
