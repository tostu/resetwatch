<script lang="ts">
	import { formatCountdown, coarse, urgency, formatLocal } from '../resets';
	import { displayZone } from '../timezone.svelte';

	type Kind = 'weekly' | 'event' | 'season';

	let {
		label,
		kind,
		kicker,
		endsAt,
		remaining,
		phase = 'live',
		isNext = false,
		index = 0,
		note,
		badge,
		progress
	}: {
		/** Small pill under the countdown, e.g. `ENDS WITH SEASON`. */
		badge?: string;
		/** Season week progress bar. */
		progress?: { week: number; weeks: number };
		label: string;
		kind: Kind;
		kicker: string;
		/** Countdown target: end time, or start time when phase is `upcoming`. */
		endsAt: number;
		remaining: number;
		phase?: 'live' | 'upcoming';
		isNext?: boolean;
		index?: number;
		note?: string;
	} = $props();

	const upcoming = $derived(phase === 'upcoming');

	const level = $derived(urgency(remaining));
</script>

<article class="card {kind}" class:upcoming-card={upcoming} aria-label={label} style="--i: {index}">
	<span class="sheen" aria-hidden="true"></span>
	<div class="art" aria-hidden="true">
		{#if kind === 'weekly'}
			<svg viewBox="0 0 120 120" class="glyph">
				<path d="M60 6 114 60 60 114 6 60Z" fill="none" stroke="currentColor" stroke-width="8" />
				<path d="M60 30 90 60 60 90 30 60Z" fill="currentColor" />
			</svg>
		{:else if kind === 'event'}
			<svg viewBox="0 0 120 120" class="glyph">
				<path
					d="M60 2 72 30 100 14 92 44 118 60 92 76 100 106 72 90 60 118 48 90 20 106 28 76 2 60 28 44 20 14 48 30Z"
					fill="currentColor"
				/>
				<circle cx="60" cy="60" r="18" fill="var(--glyph-hole)" />
			</svg>
		{:else}
			<svg viewBox="0 0 120 120" class="glyph">
				<path
					d="M60 4 108 20v40c0 28-20 46-48 56C32 106 12 88 12 60V20Z"
					fill="none"
					stroke="currentColor"
					stroke-width="8"
					stroke-linejoin="round"
				/>
				<path d="M34 54 60 36 86 54v14L60 50 34 68Z" fill="currentColor" />
			</svg>
		{/if}
	</div>

	<div class="top">
		<!-- Reserved slot keeps height constant whether or not a chip shows. -->
		<span class="slot">
			{#if level === 'critical'}
				<span class="chip chip-crit">&#9650; UNDER 1 HOUR</span>
			{:else if level === 'soon'}
				<span class="chip chip-soon">&#9650; {upcoming ? 'STARTS SOON' : 'ENDS SOON'}</span>
			{/if}
		</span>
		{#if isNext}<span class="tag">NEXT UP</span>{/if}
	</div>

	<div class="body">
		<p class="label kicker">{kicker}</p>
		<h2 class="display name">{label}</h2>

		<div class="num count" role="timer" aria-live="off">{formatCountdown(remaining)}</div>
		<p class="label coarse">{upcoming ? 'STARTS' : 'ENDS'} IN {coarse(remaining)}</p>

		<p class="when">
			<span class="label">{upcoming ? 'STARTS' : 'ENDS'}</span>
			<time datetime={new Date(endsAt).toISOString()}
				>{formatLocal(endsAt, undefined, displayZone.zone)}</time
			>
		</p>

		{#if progress}
			<div
				class="progress"
				role="progressbar"
				aria-label="Season progress"
				aria-valuemin="1"
				aria-valuemax={progress.weeks}
				aria-valuenow={progress.week}
				aria-valuetext="Week {progress.week} of {progress.weeks}"
			>
				<span class="label cap">WEEK {progress.week}/{progress.weeks}</span>
				<span class="segs" aria-hidden="true">
					{#each Array.from({ length: progress.weeks }, (_, i) => i + 1) as w (w)}
						<span class="seg" class:done={w < progress.week} class:cur={w === progress.week}></span>
					{/each}
				</span>
			</div>
		{/if}
		{#if badge}<p class="badge label">{badge}</p>{/if}

		{#if note}<p class="note">{note}</p>{/if}
	</div>
</article>

<style>
	.card {
		--glyph-hole: var(--c2);
		position: relative;
		isolation: isolate;
		overflow: hidden;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 16px;
		min-width: 0;
		min-height: 400px;
		padding: 16px 18px 20px;
		border-radius: 8px;
		background: linear-gradient(165deg, var(--c1) 0%, var(--c2) 58%, var(--c3) 100%);
		box-shadow:
			0 1px 0 rgb(255 255 255 / 0.18) inset,
			0 18px 32px -14px rgb(4 8 30 / 0.7);
		animation: rise 420ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
		animation-delay: calc(var(--i) * 50ms);
	}

	/*
	 * Ambient light: a slow diagonal sheen crosses each card on its own offset, so the
	 * row shimmers without ever reacting to the pointer (cards are not clickable).
	 */
	.sheen {
		position: absolute;
		inset: -20% auto -20% 0;
		z-index: 0;
		width: 45%;
		background: linear-gradient(
			90deg,
			rgb(255 255 255 / 0) 0%,
			rgb(255 255 255 / 0.13) 50%,
			rgb(255 255 255 / 0) 100%
		);
		transform: translateX(-160%) skewX(-22deg);
		mix-blend-mode: overlay;
		pointer-events: none;
		animation: sheen 9s cubic-bezier(0.45, 0, 0.25, 1) infinite;
		animation-delay: calc(1.2s + var(--i) * 0.45s);
	}

	@keyframes sheen {
		0% {
			transform: translateX(-160%) skewX(-22deg);
		}
		22%,
		100% {
			transform: translateX(360%) skewX(-22deg);
		}
	}

	/* Rings breathe and the glyph floats, slowly and out of step per card. */
	@keyframes breathe {
		0%,
		100% {
			opacity: 0.75;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.06);
		}
	}

	@keyframes float {
		0%,
		100% {
			translate: 0 0;
		}
		50% {
			translate: 0 -6px;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.card::before {
			animation: breathe 7s ease-in-out infinite;
			animation-delay: calc(var(--i) * -1.7s);
		}
		.art {
			animation: float 6s ease-in-out infinite;
			animation-delay: calc(var(--i) * -1.3s);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.sheen {
			animation: none;
		}
		.sheen {
			display: none;
		}
	}

	/* Concentric target rings behind the glyph, the way the Arcade cards do it. */
	.card::before {
		content: '';
		position: absolute;
		z-index: -2;
		left: 50%;
		top: 34%;
		width: 130%;
		aspect-ratio: 1;
		transform: translate(-50%, -50%);
		background: repeating-radial-gradient(
			circle,
			rgb(255 255 255 / 0.09) 0 2px,
			rgb(255 255 255 / 0) 2px 26px
		);
		-webkit-mask-image: radial-gradient(circle, #000 20%, transparent 68%);
		mask-image: radial-gradient(circle, #000 20%, transparent 68%);
	}

	/* Bottom scrim keeps small type legible on every colour. */
	.card::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			0deg,
			rgb(5 8 24 / 0.78) 0%,
			rgb(5 8 24 / 0.5) 38%,
			rgb(5 8 24 / 0) 62%
		);
		pointer-events: none;
	}

	.weekly {
		--c1: #8a3be0;
		--c2: #521aa8;
		--c3: #2c0d70;
	}
	.event {
		--c1: #f2862a;
		--c2: #c4500c;
		--c3: #7e2f06;
	}
	.season {
		--c1: #cf2a56;
		--c2: #8f1636;
		--c3: #520b20;
	}

	.art {
		position: absolute;
		z-index: -1;
		left: 50%;
		top: 30%;
		width: min(46cqi, 150px);
		transform: translate(-50%, -50%);
		color: rgb(255 255 255 / 0.94);
		filter: drop-shadow(0 6px 14px rgb(0 0 0 / 0.28));
	}

	.glyph {
		display: block;
		width: 100%;
		height: auto;
	}

	.top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
		min-height: 28px;
	}

	.slot {
		display: inline-flex;
		min-height: 24px;
	}

	.top,
	.body {
		position: relative;
		z-index: 1;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.kicker {
		margin: 0;
		font-size: 15px;
		color: var(--gold);
	}

	.name {
		margin: 0;
		font-size: clamp(30px, 11cqi, 38px);
		line-height: 1;
		color: var(--text);
		/* Event names vary in length: clamp to two lines. */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.upcoming-card {
		opacity: 0.92;
	}

	.count {
		margin-top: 10px;
		font-size: clamp(32px, 14cqi, 50px);
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		color: var(--text);
		white-space: nowrap;
	}

	.coarse {
		margin: 4px 0 0;
		font-size: 16px;
		color: var(--cyan);
	}

	.when {
		margin: 12px 0 0;
		padding-top: 10px;
		border-top: 1px solid rgb(255 255 255 / 0.22);
		display: flex;
		gap: 8px;
		align-items: baseline;
		font-size: 15px;
		color: rgb(255 255 255 / 0.92);
	}

	.when .label {
		font-size: 12px;
		color: rgb(255 255 255 / 0.7);
	}

	.progress {
		margin-top: 10px;
		display: grid;
		gap: 5px;
	}
	.cap {
		font-size: 12px;
		color: rgb(255 255 255 / 0.75);
	}
	.segs {
		display: flex;
		gap: 3px;
	}
	.seg {
		flex: 1;
		height: 6px;
		background: rgb(255 255 255 / 0.2);
	}
	.seg.done {
		background: rgb(255 255 255 / 0.85);
	}
	.seg.cur {
		background: var(--gold);
	}
	.badge {
		align-self: flex-start;
		margin: 10px 0 0;
		padding: 3px 8px;
		font-size: 12px;
		color: var(--text);
		background: rgb(5 8 24 / 0.5);
		border-left: 3px solid var(--gold);
	}

	.note {
		margin: 4px 0 0;
		font-size: 14px;
		color: rgb(255 255 255 / 0.8);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	/* Phones: one wide card per reset, glyph pushed to the right. */
	@media (max-width: 639px) {
		.card {
			min-height: 188px;
			gap: 8px;
		}

		.art {
			left: auto;
			right: 4%;
			top: 50%;
			width: 96px;
			transform: translateY(-50%);
			opacity: 0.85;
		}

		.card::before {
			left: 82%;
			top: 50%;
			width: 80%;
		}

		.card {
			justify-content: space-between;
		}

		.name {
			font-size: 30px;
		}

		.count {
			margin-top: 6px;
			font-size: clamp(34px, 11cqi, 44px);
		}

		.when {
			margin-top: 8px;
			padding-top: 8px;
		}
	}
</style>
