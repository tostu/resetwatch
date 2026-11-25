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
	import PageHero from '#lib/components/PageHero.svelte';
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

<div class="wrap page">
	<PageHero
		tone="purple"
		glyph="question"
		eyebrow="QUESTIONS"
		title="FAQ"
		subtitle="OVERWATCH RESET TIMES, EXPLAINED"
	/>

	<div class="doc">
		<section class="answer">
			<p class="lead">
				The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>.
			</p>
			<p>
				Resetwatch counts down to it live, along with the end of the current event and season, in
				your local time.
			</p>
		</section>

		{#each FAQS as f (f.q)}
			<section>
				<h2>{f.q}</h2>
				<p>{f.a}</p>
			</section>
		{/each}

		<section>
			<p class="small">
				Season dates follow press reports of Blizzard's announced schedule, and later seasons are
				estimates until confirmed. See the
				<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener"
					>official Overwatch news</a
				>
				for confirmed dates.
			</p>
			<nav class="links" aria-label="Related pages">
				<a href={resolve('/')}>Live countdown</a>
				<a href={resolve('/reset-time')}>Reset time by zone</a>
				<a href={resolve('/seasons')}>Season schedule</a>
			</nav>
		</section>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
</style>
