<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let showHelp = $state(false);

	function typing(t: EventTarget | null): boolean {
		if (!(t instanceof HTMLElement)) return false;
		return t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
		switch (e.key) {
			case 'Escape':
				showHelp = false;
				break;
			case '1':
				goto(resolve('/'));
				break;
			case '2':
				goto(resolve('/seasons'));
				break;
			case '3':
				goto(resolve('/reset-time'));
				break;
			case '4':
				goto(resolve('/events'));
				break;
			case '5':
				goto(resolve('/faq'));
				break;
			case '?':
				showHelp = !showHelp;
				break;
		}
	}
</script>

<svelte:window {onkeydown} />

<!-- Shortcuts stay active; the list only shows on `?` instead of a permanent strip over the content. -->
{#if showHelp}
	<div class="help-panel" role="note">
		<p class="label">Keyboard shortcuts</p>
		<p>
			<kbd>1</kbd> Resets <kbd>2</kbd> Seasons <kbd>3</kbd> Time zones <kbd>4</kbd> Events
			<kbd>5</kbd> FAQ
			<kbd>?</kbd> close
		</p>
	</div>
{/if}

<style>
	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 22px;
		padding: 0 6px;
		border: 1px solid rgb(255 255 255 / 0.35);
		border-radius: 4px;
		background: rgb(13 20 36 / 0.85);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 12px;
		letter-spacing: 0.04em;
		color: var(--text);
	}

	.help-panel {
		position: fixed;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		z-index: 45;
		display: grid;
		gap: 8px;
		padding: 14px 20px;
		border-radius: 8px;
		background: var(--surface-2);
		border: 1px solid var(--line);
		font-size: 14px;
		color: var(--text-dim);
		animation: chip-in 200ms ease;
	}

	.help-panel p {
		margin: 0;
	}

	.help-panel kbd {
		margin: 0 4px 0 10px;
	}

	.help-panel kbd:first-child {
		margin-left: 0;
	}

	@media (max-width: 719px), (pointer: coarse) {
		.help-panel {
			display: none;
		}
	}
</style>
