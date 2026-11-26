<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from '../../lib/seo';
	import PageHero from '#lib/components/PageHero.svelte';

	const TITLE = 'Overwatch Countdown Widget & OBS Overlay | Resetwatch';
	const DESCRIPTION =
		'Free Overwatch reset countdown for your stream, website or Discord: OBS browser source, iframe embed and a JSON schedule. Weekly reset, season end and event end.';

	let show = $state<'weekly' | 'season' | 'event' | 'all'>('weekly');
	let bg = $state<'dark' | 'transparent'>('dark');
	let size = $state<'s' | 'm' | 'l'>('m');

	const query = $derived(
		new URLSearchParams({
			...(show !== 'weekly' && { show }),
			...(bg !== 'dark' && { bg }),
			...(size !== 'm' && { size })
		}).toString()
	);
	const path = $derived(`/embed${query ? `?${query}` : ''}`);
	const url = $derived(`${SITE_URL}${path}`);
	const height = $derived(({ s: 60, m: 90, l: 130 }[size] + 10) * (show === 'all' ? 3 : 1) + 40);
	const iframe = $derived(
		`<iframe src="${url}" width="420" height="${height}" style="border:0" title="Overwatch reset countdown" loading="lazy"></iframe>`
	);

	let copied = $state('');
	async function copy(what: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = what;
			setTimeout(() => (copied = ''), 2000);
		} catch {
			// Clipboard blocked: the code is selectable.
		}
	}

	const SHOW = [
		{ v: 'weekly', label: 'Weekly reset' },
		{ v: 'season', label: 'Season end' },
		{ v: 'event', label: 'Next event end' },
		{ v: 'all', label: 'All three' }
	] as const;
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
			{ name: 'Countdown widget', path: '/widget' }
		])
	)}
</svelte:head>

<div class="wrap page">
	<PageHero
		tone="teal"
		glyph="bolt"
		eyebrow="FOR STREAMS & SITES"
		title="WIDGET"
		subtitle="OBS OVERLAY, EMBED, JSON"
		srPrefix="Overwatch Countdown"
		srSuffix="and OBS Overlay"
	/>

	<div class="column stack">
		<section class="panel" aria-labelledby="build">
			<h2 id="build" class="display head">Build your countdown</h2>

			<fieldset>
				<legend class="label">Show</legend>
				{#each SHOW as o (o.v)}
					<label class="opt"><input type="radio" bind:group={show} value={o.v} /> {o.label}</label>
				{/each}
			</fieldset>
			<fieldset>
				<legend class="label">Background</legend>
				<label class="opt"><input type="radio" bind:group={bg} value="dark" /> Dark</label>
				<label class="opt"
					><input type="radio" bind:group={bg} value="transparent" /> Transparent (OBS)</label
				>
			</fieldset>
			<fieldset>
				<legend class="label">Size</legend>
				<label class="opt"><input type="radio" bind:group={size} value="s" /> Small</label>
				<label class="opt"><input type="radio" bind:group={size} value="m" /> Medium</label>
				<label class="opt"><input type="radio" bind:group={size} value="l" /> Large</label>
			</fieldset>

			<p class="label prev-label">Preview</p>
			<div class="preview" class:checker={bg === 'transparent'}>
				<iframe src={path} title="Countdown preview" width="420" {height}></iframe>
			</div>
		</section>

		<section class="panel" aria-labelledby="obs">
			<h2 id="obs" class="display head">OBS browser source</h2>
			<ol class="steps">
				<li>In OBS: Sources → + → Browser.</li>
				<li>Paste the URL below, width 420, height {height}.</li>
				<li>Pick “Transparent” above if it sits on top of gameplay.</li>
			</ol>
			<div class="code-row">
				<code class="code">{url}</code>
				<button type="button" class="label copy" onclick={() => copy('url', url)}
					>{copied === 'url' ? 'Copied' : 'Copy URL'}</button
				>
			</div>
		</section>

		<section class="panel" aria-labelledby="site">
			<h2 id="site" class="display head">Embed on a website</h2>
			<div class="code-row">
				<code class="code">{iframe}</code>
				<button type="button" class="label copy" onclick={() => copy('iframe', iframe)}
					>{copied === 'iframe' ? 'Copied' : 'Copy code'}</button
				>
			</div>
			<p class="small">
				The countdown runs in the viewer's browser and shows their own time. Free, no sign-up, no
				tracking in the widget.
			</p>
		</section>

		<section class="panel" aria-labelledby="bots">
			<h2 id="bots" class="display head">Bots and scripts</h2>
			<p class="small">
				Building a Discord bot or your own overlay? <a
					href={resolve('/api/status.json')}
					data-sveltekit-reload>/api/status.json</a
				>
				has the reset rule, the current season and every live event as ISO timestamps, refreshed on every
				site update. CORS is open. Calendar apps can subscribe to the
				<a href="{resolve('/calendar')}#subscribe">Overwatch calendar</a> instead.
			</p>
		</section>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 64px;
		padding-inline: 16px;
	}
	.stack {
		display: grid;
		gap: 16px;
	}
	.panel {
		padding: 22px 24px 24px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--text-dim);
	}
	.head {
		margin: 0 0 14px;
		font-size: 28px;
		line-height: 1;
		color: var(--text);
	}
	fieldset {
		margin: 0 0 12px;
		padding: 0;
		border: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 18px;
	}
	legend {
		float: left;
		width: 110px;
		font-size: 14px;
		color: var(--text-faint);
	}
	.opt {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		color: var(--text);
		cursor: pointer;
	}
	.opt input {
		accent-color: var(--orange);
		color: var(--orange);
	}
	.prev-label {
		margin: 18px 0 8px;
		font-size: 14px;
		color: var(--text-faint);
	}
	.preview {
		display: inline-block;
		max-width: 100%;
		overflow: auto;
		border-radius: 6px;
		border: 1px solid var(--line);
	}
	/* Checkerboard behind a transparent preview, like an image editor. */
	.preview.checker {
		background: repeating-conic-gradient(#2a3350 0 25%, #1c2440 0 50%) 0 0 / 20px 20px;
	}
	.preview iframe {
		display: block;
		border: 0;
		background: transparent;
	}
	.steps {
		margin: 0 0 14px;
		padding-left: 20px;
		line-height: 1.7;
	}
	.code-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 10px;
	}
	.code {
		flex: 1 1 280px;
		padding: 10px 12px;
		border-radius: 4px;
		background: var(--surface-2);
		color: var(--text);
		font-size: 13px;
		overflow-wrap: anywhere;
		user-select: all;
	}
	.copy {
		min-height: 40px;
		padding: 0 14px;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		font-size: 14px;
		cursor: pointer;
	}
	.copy:hover {
		background: var(--surface-2);
	}
	.small {
		margin: 12px 0 0;
		font-size: 15px;
		line-height: 1.55;
	}
	.small a {
		color: var(--cyan);
		text-underline-offset: 3px;
	}
</style>
