<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		FAQS,
		FAQ_TITLE,
		FAQ_DESCRIPTION,
		breadcrumbJsonLd,
		faqJsonLd,
		jsonLdScript
	} from '../../lib/seo';
	import DocPage from '#lib/components/DocPage.svelte';
</script>

<svelte:head>
	<title>{FAQ_TITLE}</title>
	<meta name="description" content={FAQ_DESCRIPTION} />
	<meta property="og:title" content={FAQ_TITLE} />
	<meta property="og:description" content={FAQ_DESCRIPTION} />
	<meta name="twitter:title" content={FAQ_TITLE} />
	<meta name="twitter:description" content={FAQ_DESCRIPTION} />
	{@html jsonLdScript(faqJsonLd())}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'FAQ', path: '/faq' }
		])
	)}
</svelte:head>

<DocPage title="FAQ" subtitle="OVERWATCH RESET TIMES, EXPLAINED">
	<p>
		The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Resetwatch
		counts down to it live, along with the end of the current event and season, in your local time.
	</p>

	{#each FAQS as f (f.q)}
		<h2>{f.q}</h2>
		<p>{f.a}</p>
	{/each}

	<p>
		Season dates follow press reports of Blizzard's announced schedule, and later seasons are
		estimates until confirmed. See the
		<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener">official Overwatch news</a>
		for confirmed dates.
	</p>

	<p><a href={resolve('/')}>Back to the live countdown</a></p>
</DocPage>
