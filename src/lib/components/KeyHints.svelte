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
			case '?':
				showHelp = !showHelp;
				break;
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="hints" aria-label="Keyboard shortcuts">
	<div class="group">
		<span class="hint"><kbd>1</kbd> <span class="label">RESETS</span></span>
		<span class="hint"><kbd>2</kbd> <span class="label">SEASONS</span></span>
		<button type="button" class="hint help" onclick={() => (showHelp = !showHelp)}>
			<kbd>?</kbd> <span class="label">SHORTCUTS</span>
		</button>
	</div>
</div>

{#if showHelp}
	<div class="help-panel" role="note">
		<p class="label">SHORTCUTS</p>
		<p>1: Resets. 2: Seasons. ?: toggle this panel.</p>
	</div>
{/if}

<style>
	.hints {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24px 16px 12px;
		z-index: 40;
		/* Fade strip so scrolled content never sits directly under the hints. */
		background: linear-gradient(
			0deg,
			rgb(8 12 26 / 0.92) 0%,
			rgb(8 12 26 / 0.6) 55%,
			rgb(8 12 26 / 0) 100%
		);
		display: flex;
		justify-content: flex-end;
		pointer-events: none;
		color: var(--text);
		text-shadow: 0 1px 6px rgb(5 8 24 / 0.6);
	}

	.group {
		display: flex;
		gap: 16px;
	}

	.hint {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		pointer-events: auto;
	}

	.help {
		background: none;
		border: 0;
		padding: 0;
		margin: 0;
		color: inherit;
		cursor: pointer;
		min-height: 24px;
	}

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
		bottom: 48px;
		transform: translateX(-50%);
		z-index: 45;
		padding: 12px 20px;
		background: var(--panel);
		border-top: 2px solid var(--blue-edge);
		font-size: 14px;
	}

	.help-panel p {
		margin: 0;
	}

	@media (max-width: 719px) {
		.hints,
		.help-panel {
			display: none;
		}
	}
</style>
