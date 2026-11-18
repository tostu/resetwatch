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
	import PageTitle from '#lib/components/PageTitle.svelte';
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
	<div class="top">
		<PageTitle title="FAQ" subtitle="OVERWATCH RESET TIMES, EXPLAINED" />
	</div>

	<p class="intro">
		The Overwatch weekly reset is every <strong>Tuesday at 2 PM ET / 11 AM PT</strong>. Resetwatch
		counts down to it live, along with the end of the current event and season, in your local time.
	</p>

	<ol class="list">
		{#each FAQS as f, i (f.q)}
			<li class="item">
				<span class="num idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<h2 class="display q">{f.q}</h2>
					<p class="a">{f.a}</p>
				</div>
			</li>
		{/each}
	</ol>

	<p class="foot">
		Season dates follow press reports of Blizzard's announced schedule, and later seasons are
		estimates until confirmed. See the
		<a href="https://overwatch.blizzard.com/en-us/news/" rel="noopener">official Overwatch news</a>
		for confirmed dates.
	</p>
	<p class="links">
		<a href={resolve('/')}>Live countdown</a> ·
		<a href={resolve('/reset-time')}>Reset time by zone</a> ·
		<a href={resolve('/seasons')}>Season schedule</a>
	</p>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
	}
	.top {
		margin-bottom: 36px;
	}
	.intro {
		margin: -12px 0 32px;
		max-width: 760px;
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 860px;
		display: grid;
		gap: 10px;
		counter-reset: faq;
	}
	.item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 16px;
		padding: 18px 20px 20px 16px;
		background: rgb(5 8 24 / 0.5);
		border-left: 4px solid var(--gold);
	}
	.idx {
		font-size: 34px;
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		color: rgb(255 255 255 / 0.22);
	}
	.q {
		margin: 0 0 6px;
		font-size: clamp(22px, 4.5vw, 28px);
		line-height: 1.05;
		color: var(--text);
	}
	.a {
		margin: 0;
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.foot {
		max-width: 760px;
		margin: 32px 0 12px;
		padding-left: 14px;
		border-left: 2px solid rgb(255 255 255 / 0.18);
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-dim);
	}
	.foot a,
	.links a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	.links {
		margin: 0;
		font-size: 15px;
		color: var(--text-faint);
	}
</style>
