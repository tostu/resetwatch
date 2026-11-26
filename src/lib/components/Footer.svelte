<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { SITE_NAME } from '../seo';
	import { openConsentSettings } from '../consent';

	const year = new Date().getFullYear();

	const groups = [
		{
			title: 'HELP',
			links: [
				{ href: '/faq', label: 'FAQ' },
				{ href: '/seasons', label: 'Season schedule' },
				{ href: '/events', label: 'Current events' },
				{ href: '/calendar', label: 'Calendar subscription' },
				{ href: '/reset-time', label: 'Reset time by time zone' },
				{ href: '/daily-reset', label: 'Daily challenge reset' },
				{ href: '/about', label: 'About' },
				{ href: '/contact', label: 'Contact' }
			]
		},
		{
			title: 'LEGAL',
			links: [
				{ href: '/privacy', label: 'Privacy policy / Datenschutz' },
				{ href: '/impressum', label: 'Impressum' }
			]
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
			<p class="disclaimer">
				For bots and overlays:
				<a class="inline" href={resolve('/api/status.json')} data-sveltekit-reload>status.json</a>
				(schedule snapshot, refreshed on every deploy).
			</p>
			<div class="support">
				<a
					class="btn bmc"
					href="https://buymeacoffee.com/tostu"
					rel="noopener"
					aria-label="Buy me a coffee"
				>
					<!-- Static files go through asset(), not resolve(), which only takes routes. -->
					<img src={asset('buymeacoffee.svg')} alt="Buy me a coffee" width="156" height="40" />
				</a>
				<a class="btn gh" href="https://github.com/tostu/resetwatch" rel="noopener">
					<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" fill="currentColor">
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
						/>
					</svg>
					<span>Star on GitHub</span>
				</a>
			</div>
			<p class="disclaimer kbd-hint">Press <kbd>?</kbd> for keyboard shortcuts.</p>
			<p class="copy">© {year} {SITE_NAME}</p>
		</div>

		{#each groups as g (g.title)}
			<nav class="group" aria-label={g.title === 'LEGAL' ? 'Legal' : 'Help'}>
				<h2 class="label head">{g.title}</h2>
				<ul>
					{#each g.links as l (l.href)}
						<li><a href={resolve(l.href)}>{l.label}</a></li>
					{/each}
					{#if g.title === 'LEGAL'}
						<li>
							<button type="button" class="linkbtn" onclick={() => openConsentSettings()}>
								Privacy settings / Datenschutz-Einstellungen
							</button>
						</li>
					{/if}
				</ul>
			</nav>
		{/each}
	</div>
</footer>

<style>
	.foot {
		margin-top: 24px;
		padding-block: 28px 64px;
		background: var(--bar);
		border-top: 1px solid var(--line);
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

	.support {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 14px 0;
	}

	/* Official third-party looks: keep their own colors, not the site theme. */
	a.btn {
		min-height: 40px;
		height: 40px;
		border-radius: 8px;
	}

	a.btn img {
		display: block;
		height: 40px;
		width: auto;
	}

	a.gh {
		gap: 8px;
		padding: 0 14px;
		background: #24292f;
		border: 1px solid rgb(240 246 252 / 0.2);
		color: #fff;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
		font-size: 14px;
		font-weight: 600;
	}

	a.gh:hover,
	a.bmc:hover {
		text-decoration: none;
		filter: brightness(1.15);
	}

	.kbd-hint kbd {
		padding: 0 5px;
		border: 1px solid rgb(255 255 255 / 0.3);
		border-radius: 3px;
		font-family: var(--font-display);
		font-weight: 700;
	}

	@media (pointer: coarse) {
		.kbd-hint {
			display: none;
		}
	}

	.copy {
		margin-top: 10px;
		color: var(--text-faint);
	}

	.head {
		margin: 0 0 8px;
		font-size: 13px;
		color: var(--text-faint);
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

	.linkbtn {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.linkbtn:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (min-width: 720px) {
		.linkbtn {
			min-height: 32px;
		}
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
