<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clock } from '../now.svelte';
	import { formatCountdown, coarse } from '../resets';
	import { toneStyle, type Tone, type GlyphName } from '../tone';
	import Glyph from './Glyph.svelte';

	let {
		tone,
		glyph,
		eyebrow,
		title,
		subtitle,
		srPrefix,
		srSuffix,
		ms,
		msLabel = 'TIME LEFT',
		children
	}: {
		/** Colour field of the banner. */
		tone: Tone;
		glyph: GlyphName;
		/** Small yellow line above the title, e.g. `LIMITED-TIME EVENT`. */
		eyebrow?: string;
		title: string;
		subtitle?: string;
		/** Screen-reader-only words around the visible title, for a descriptive h1. */
		srPrefix?: string;
		srSuffix?: string;
		/** Optional live countdown under the title. */
		ms?: number;
		msLabel?: string;
		/** Extra centred content under the countdown (progress bar, buttons, switches). */
		children?: Snippet;
	} = $props();

	const long = $derived(title.length > 18);
</script>

<!--
	Full-bleed colour band right under the top bar, everything centred, like the
	game's Events and Battle Pass headers. Page content follows in a centred column.
-->
<header class="hero" style={toneStyle(tone)}>
	<Glyph name={glyph} class="bg-glyph left" />
	<Glyph name={glyph} class="bg-glyph right" />

	<div class="inner">
		{#if eyebrow}<p class="label eyebrow">{eyebrow}</p>{/if}
		<h1 class="display title" class:long>
			<!-- eslint-disable-next-line svelte/no-useless-mustaches -- {' '} keeps the word spacing -->
			{#if srPrefix}<span class="sr-only">{srPrefix}</span>{' '}{/if}{title}{#if srSuffix}{' '}<span
					class="sr-only">{srSuffix}</span
				>{/if}
		</h1>
		{#if subtitle}<p class="label subtitle">{subtitle}</p>{/if}

		{#if ms !== undefined}
			<div class="count-wrap" role="timer" aria-live="off" aria-label={msLabel}>
				<span class="label count-label" aria-hidden="true">{msLabel}</span>
				<span class="num count" class:pending={!clock.ready} aria-hidden="true"
					>{formatCountdown(ms)}</span
				>
				<span class="sr-only" aria-live="polite">{msLabel}: {coarse(ms).toLowerCase()}</span>
			</div>
		{/if}

		{#if children}<div class="extra">{@render children()}</div>{/if}
	</div>
</header>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		/* Break out of the centred page column to the full viewport width. */
		margin-inline: calc(50% - 50vw);
		margin-top: calc(-1 * var(--hero-pull));
		margin-bottom: 48px;
		padding: calc(var(--hero-pull) + 40px) 16px 48px;
		background:
			radial-gradient(70% 120% at 50% 0%, var(--tile-hi) 0%, transparent 70%),
			linear-gradient(
				180deg,
				var(--tile) 0%,
				var(--tile) 70%,
				color-mix(in srgb, var(--tile) 70%, #000) 100%
			);
		color: var(--text);
		text-align: center;
	}

	/* Fade the band's lower edge into the page so it does not end in a hard line. */
	.hero::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 56px;
		z-index: -1;
		background: linear-gradient(0deg, rgb(12 16 32 / 0.55), transparent);
		pointer-events: none;
	}

	/* Two large faint copies of the page glyph frame the centred text. */
	.hero :global(.bg-glyph) {
		position: absolute;
		z-index: -1;
		top: 50%;
		width: clamp(180px, 26vw, 360px);
		color: rgb(255 255 255 / 0.1);
	}
	.hero :global(.bg-glyph.left) {
		left: 0;
		transform: translate(-30%, -38%) rotate(-12deg);
	}
	.hero :global(.bg-glyph.right) {
		right: 0;
		transform: translate(30%, -50%) rotate(12deg);
	}

	.inner {
		max-width: 880px;
		margin-inline: auto;
		display: grid;
		justify-items: center;
	}

	.eyebrow {
		margin: 0 0 8px;
		font-size: 16px;
		color: var(--gold);
	}

	.title {
		margin: 0;
		font-size: clamp(48px, 9vw, 96px);
		line-height: 0.92;
		padding-inline: 0.06em;
		overflow-wrap: anywhere;
	}
	.title.long {
		font-size: clamp(40px, 7vw, 72px);
	}

	.subtitle {
		margin: 12px 0 0;
		font-size: clamp(17px, 2.4vw, 22px);
		color: rgb(255 255 255 / 0.88);
	}

	.count-wrap {
		margin-top: 28px;
		display: grid;
		justify-items: center;
		gap: 2px;
	}
	.count-label {
		font-size: 14px;
		color: rgb(255 255 255 / 0.8);
	}
	.count {
		font-size: clamp(44px, 8vw, 72px);
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		white-space: nowrap;
	}

	.extra {
		margin-top: 24px;
		display: grid;
		justify-items: center;
		gap: 16px;
		width: 100%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 719px) {
		.hero {
			padding-top: calc(var(--hero-pull) + 24px);
			padding-bottom: 36px;
			margin-bottom: 32px;
		}
		.hero :global(.bg-glyph) {
			width: 160px;
		}
	}
</style>
