<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '../seo';

	const year = new Date().getFullYear();

	const groups = [
		{
			title: 'HELP',
			links: [
				{ href: '/faq', label: 'FAQ' },
				{ href: '/seasons', label: 'Season schedule' },
				{ href: '/reset-time', label: 'Reset time by time zone' },
				{ href: '/about', label: 'About' },
				{ href: '/contact', label: 'Contact' }
			]
		},
		{
			title: 'LEGAL',
			links: [{ href: '/privacy', label: 'Privacy policy' }]
		}
	] as const;
</script>

<footer class="foot">
	<div class="wrap inner">
		<div class="about">
			<p class="label brand">{SITE_NAME}</p>
			<p class="disclaimer">
				Not affiliated with Blizzard Entertainment. Overwatch is a trademark of Blizzard
				Entertainment, Inc.
			</p>
			<p class="disclaimer">
				Fan-made, open source on
				<a class="inline" href="https://github.com/tostu/resetwatch" rel="noopener">GitHub</a>.
				Confirmed dates:
				<a class="inline" href="https://overwatch.blizzard.com/en-us/news/" rel="noopener"
					>official Overwatch news</a
				>.
			</p>
			<p class="copy">© {year} {SITE_NAME}</p>
		</div>

		{#each groups as g (g.title)}
			<nav class="group" aria-label={g.title === 'LEGAL' ? 'Legal' : 'Help'}>
				<h2 class="label head">{g.title}</h2>
				<ul>
					{#each g.links as l (l.href)}
						<li><a href={resolve(l.href)}>{l.label}</a></li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>
</footer>

<style>
	.foot {
		margin-top: 24px;
		padding-block: 28px 64px;
		background: linear-gradient(180deg, rgb(13 20 36 / 0.85), var(--bar));
		border-top: 2px solid rgb(63 169 255 / 0.25);
		color: var(--text-dim);
		font-size: 14px;
	}

	.inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 28px 24px;
	}

	.about {
		grid-column: 1 / -1;
		max-width: 460px;
	}

	.brand {
		margin: 0 0 6px;
		font-size: 20px;
		color: var(--text);
	}

	.disclaimer,
	.copy {
		margin: 0;
		line-height: 1.5;
		font-size: 13px;
	}

	.copy {
		margin-top: 10px;
		color: var(--text-faint);
	}

	.head {
		margin: 0 0 8px;
		font-size: 13px;
		color: var(--gold);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}

	/* 44px touch target without looking spaced out on desktop. */
	a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--text);
		text-decoration: none;
	}

	a.inline {
		display: inline;
		min-height: 0;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (min-width: 720px) {
		.foot {
			padding-bottom: 72px;
		}

		.inner {
			grid-template-columns: minmax(0, 1fr) auto auto;
			gap: 24px 64px;
		}

		.about {
			grid-column: auto;
		}

		a {
			min-height: 32px;
		}
	}

	@media (max-width: 719px) {
		.foot {
			padding-bottom: calc(var(--mobile-bar-h) + 24px);
		}
	}
</style>
