<script lang="ts">
	import type { GlyphName } from '../tone';

	let { name, class: cls = '' }: { name: GlyphName; class?: string } = $props();
</script>

<!-- Flat single-colour glyphs, one visual weight, like the white marks on the Arcade tiles. -->
<svg viewBox="0 0 120 120" class={cls} aria-hidden="true">
	{#if name === 'star'}
		<path
			d="M60 2 72 30 100 14 92 44 118 60 92 76 100 106 72 90 60 118 48 90 20 106 28 76 2 60 28 44 20 14 48 30Z"
			fill="currentColor"
		/>
	{:else if name === 'diamond'}
		<path d="M60 6 114 60 60 114 6 60Z" fill="none" stroke="currentColor" stroke-width="9" />
		<path d="M60 32 88 60 60 88 32 60Z" fill="currentColor" />
	{:else if name === 'target'}
		<circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="10" />
		<circle cx="60" cy="60" r="16" fill="currentColor" />
	{:else if name === 'bolt'}
		<path d="M70 4 22 68h32l-10 48 54-66H66Z" fill="currentColor" />
	{:else if name === 'shield'}
		<path
			d="M60 6 106 22v38c0 27-19 45-46 54C33 105 14 87 14 60V22Z"
			fill="none"
			stroke="currentColor"
			stroke-width="9"
			stroke-linejoin="round"
		/>
		<path d="M36 56 60 39 84 56v14L60 53 36 70Z" fill="currentColor" />
	{:else if name === 'clock'}
		<circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="10" />
		<path
			d="M60 28v34l22 14"
			fill="none"
			stroke="currentColor"
			stroke-width="10"
			stroke-linecap="round"
		/>
	{:else if name === 'question'}
		<circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="10" />
		<path
			d="M44 46c0-10 7-17 16-17s16 6 16 15c0 13-16 13-16 26"
			fill="none"
			stroke="currentColor"
			stroke-width="10"
			stroke-linecap="round"
		/>
		<circle cx="60" cy="88" r="6" fill="currentColor" />
	{:else}
		<circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="10" />
		<path d="M60 52v34" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
		<circle cx="60" cy="34" r="6" fill="currentColor" />
	{/if}
</svg>
