<script lang="ts">
	import { resolve } from '$app/paths';
	import { FEED_GOOGLE_URL, FEED_OUTLOOK_URL, FEED_URL, FEED_WEBCAL_URL } from '../calendar';

	let {
		compact = false,
		id = 'subscribe'
	}: {
		/** Short copy and no "add single dates" hint, for pages that are not the calendar page. */
		compact?: boolean;
		id?: string;
	} = $props();

	let copied = $state(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(FEED_URL);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard blocked: the URL is selectable text right next to the button.
		}
	}
</script>

<!--
	The subscription is the main way in: one feed, everything, keeps itself current. It is set apart
	from the small "add once" links on purpose, so nobody mistakes a one-off copy for a live calendar.
-->
<section class="sub" {id} aria-labelledby="{id}-head">
	<p class="label kicker">
		<span class="live" aria-hidden="true"></span>
		Subscribe · updates itself
	</p>
	<h2 id="{id}-head" class="display head">One Overwatch calendar</h2>
	<p class="what">
		Weekly reset, season launches and every limited-time event in one calendar. New events and moved
		dates show up by themselves{compact ? '.' : ', no need to come back here.'}
	</p>

	<!-- eslint-disable svelte/no-navigation-without-resolve -- webcal and external URLs -->
	<p class="actions">
		<a class="btn-primary" href={FEED_GOOGLE_URL} target="_blank" rel="noopener">Google Calendar</a>
		<a class="btn-secondary" href={FEED_WEBCAL_URL}>Apple / default app</a>
		<a class="label alt" href={FEED_OUTLOOK_URL} target="_blank" rel="noopener">Outlook.com</a>
	</p>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->

	<p class="url">
		<span>Other apps: subscribe by URL</span>
		<code class="feed-url">{FEED_URL}</code>
		<button type="button" class="label copy" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
	</p>

	{#if compact}
		<p class="once-hint">
			Only want one date? <a href={resolve('/calendar')}>Add single dates once</a> instead.
		</p>
	{/if}
</section>

<style>
	.sub {
		position: relative;
		padding: 22px 24px 24px;
		border-radius: 8px;
		background:
			radial-gradient(120% 140% at 0% 0%, rgb(234 95 18 / 0.16), transparent 60%), var(--surface);
		border: 1px solid rgb(234 95 18 / 0.45);
		scroll-margin-top: 80px;
		color: var(--text-dim);
	}
	.kicker {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-size: 14px;
		color: var(--orange-flare);
	}
	/* Pulsing dot: this one is live. */
	.live {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--orange-flare);
		box-shadow: 0 0 0 0 rgb(255 138 43 / 0.6);
		animation: pulse 2.4s ease-out infinite;
	}
	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 8px rgb(255 138 43 / 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgb(255 138 43 / 0);
		}
	}
	.head {
		margin: 6px 0 8px;
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}
	.what {
		margin: 0;
		max-width: 60ch;
		font-size: 16px;
		line-height: 1.55;
	}
	.actions {
		margin: 18px 0 14px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
	}
	.alt {
		font-size: 15px;
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	.url {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		font-size: 14px;
	}
	.feed-url {
		padding: 2px 8px;
		border-radius: 4px;
		background: var(--surface-2);
		color: var(--text);
		font-size: 13px;
		user-select: all;
		overflow-wrap: anywhere;
	}
	.copy {
		min-height: 32px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		font-size: 13px;
		cursor: pointer;
	}
	.copy:hover {
		background: var(--surface-2);
	}
	.once-hint {
		margin: 14px 0 0;
		padding-top: 12px;
		border-top: 1px solid var(--line);
		font-size: 14px;
	}
	.once-hint a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	@media (prefers-reduced-motion: reduce) {
		.live {
			animation: none;
		}
	}
</style>
