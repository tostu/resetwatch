<script lang="ts">
	import { resolve } from '$app/paths';
	import { breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import PageHero from '#lib/components/PageHero.svelte';

	const TITLE = 'When Does the Overwatch Daily Challenge Reset? | Resetwatch';
	const DESCRIPTION =
		'Overwatch daily challenges do not reset at one fixed time for everyone. Where to find your own timer, and which resets are the same for every player.';
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Daily challenge reset', path: '/daily-reset' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="teal"
		glyph="question"
		eyebrow="DAILY CHALLENGES"
		title="DAILY RESET"
		subtitle="IT'S DIFFERENT FOR EVERY PLAYER"
	/>

	<div class="doc">
		<section class="answer">
			<p class="lead">
				There is no single daily reset time. <strong>Your daily challenges have their own timer</strong
				>, so the time differs from player to player.
			</p>
			<p>
				That is why Resetwatch cannot show a daily countdown: it would be wrong for most people. The
				accurate source is your own game.
			</p>
		</section>

		<section>
			<h2>Where do I find my daily challenge timer?</h2>
			<p>
				Open the challenges screen in Overwatch. The timer next to your daily challenges shows how
				long until your own daily challenges are replaced.
			</p>
		</section>

		<section>
			<h2>What resets at the same time for everyone?</h2>
			<p>
				The weekly reset is the same for every player: <strong>every Tuesday at 2 PM ET / 11 AM PT</strong
				>. Weekly challenges and the shop rotation follow it.
				<a href={resolve('/reset-time')}>See it in your time zone</a>
				or watch the <a href={resolve('/')}>live countdown</a>.
			</p>
		</section>

		<section>
			<nav class="links" aria-label="Related pages">
				<a href={resolve('/')}>Live countdown</a>
				<a href={resolve('/reset-time')}>Reset time by zone</a>
				<a href={resolve('/faq')}>FAQ</a>
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
