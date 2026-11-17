<script lang="ts">
	import { formatCountdown, coarse } from '../resets';

	let { ms, label = 'TIME LEFT' }: { ms: number; label?: string } = $props();

	// Announce only when the coarse phrase (minute/hour/day) changes.
	const announce = $derived(`${label}: ${coarse(ms).toLowerCase()}`);
</script>

<div class="time-left" role="timer" aria-live="off" aria-label={label}>
	<div class="label small" aria-hidden="true">{label}</div>
	<div class="num big" aria-hidden="true">{formatCountdown(ms)}</div>
	<span class="sr-only" aria-live="polite">{announce}</span>
</div>

<style>
	/* Slanted dark plate with a blue edge, echoing the Play plate in the top bar. */
	.time-left {
		position: relative;
		min-width: 0;
		padding: 12px 36px 14px 28px;
		text-align: right;
		background: linear-gradient(
			90deg,
			rgb(13 20 36 / 0) 0%,
			rgb(13 20 36 / 0.82) 28%,
			rgb(13 20 36 / 0.92) 100%
		);
		border-right: 4px solid var(--orange);
		clip-path: polygon(24px 0, 100% 0, 100% 100%, 0 100%);
	}

	/* Phones: full-width dark slab, edge on the left where the eye starts. */
	@media (max-width: 719px) {
		.time-left {
			width: 100%;
			padding: 12px 18px 14px;
			text-align: left;
			background: rgb(13 20 36 / 0.88);
			border-right: 0;
			border-left: 4px solid var(--orange);
			clip-path: none;
		}
	}

	.big {
		font-size: clamp(36px, 7vw, 56px);
		font-style: italic;
		line-height: 1;
		color: var(--text);
		white-space: nowrap;
	}

	.small {
		margin-bottom: 4px;
		font-size: 15px;
		color: var(--gold);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
