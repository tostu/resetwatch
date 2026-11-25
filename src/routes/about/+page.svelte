<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		ABOUT_TITLE,
		ABOUT_DESCRIPTION,
		aboutJsonLd,
		breadcrumbJsonLd,
		jsonLdScript
	} from '../../lib/seo';
	import DocPage from '#lib/components/DocPage.svelte';
</script>

<svelte:head>
	<title>{ABOUT_TITLE}</title>
	<meta name="description" content={ABOUT_DESCRIPTION} />
	<meta property="og:title" content={ABOUT_TITLE} />
	<meta property="og:description" content={ABOUT_DESCRIPTION} />
	<meta name="twitter:title" content={ABOUT_TITLE} />
	<meta name="twitter:description" content={ABOUT_DESCRIPTION} />
	{@html jsonLdScript(aboutJsonLd())}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'About', path: '/about' }
		])
	)}
</svelte:head>

<DocPage title="ABOUT" subtitle="A FAN-MADE RESET TRACKER" tone="teal">
	<h2>What it is</h2>
	<p>
		Resetwatch is a free countdown to the Overwatch weekly reset, the end of the current event and
		the end of the current season. Everything is shown in your own local time, so there is no time
		zone math to do.
	</p>

	<h2>Where the dates come from</h2>
	<p>
		The weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Season and event dates
		follow Blizzard's announced schedule and press reports. Later seasons are estimates until
		Blizzard confirms them. For confirmed dates, check the
		<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener">official Overwatch news</a>.
	</p>
	<p>
		Found a wrong date? <a href={resolve('/contact')}>Tell us</a> and it gets fixed.
	</p>

	<h2>Privacy</h2>
	<p>
		No accounts, no tracking cookies, no ads. Anonymous page view statistics (Cloudflare Web
		Analytics) only run if you opt in, and you can withdraw that any time in the footer. The
		countdowns run in your browser. The host, Cloudflare, may set security-only cookies and
		processes server logs to keep the site safe. Details are in the <a href={resolve('/privacy')}
			>privacy policy</a
		>.
	</p>

	<h2>Open source</h2>
	<p>
		The code is public on <a href="https://github.com/tostu/resetwatch" rel="noopener">GitHub</a>.
		Issues and pull requests are welcome.
	</p>

	<h2>Not affiliated with Blizzard</h2>
	<p>
		Resetwatch is a fan project. It is not affiliated with or endorsed by Blizzard Entertainment.
		Overwatch is a trademark of Blizzard Entertainment, Inc.
	</p>
</DocPage>
