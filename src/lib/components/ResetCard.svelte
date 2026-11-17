<script lang="ts">
	import { formatCountdown, coarse, urgency, formatLocal, formatET } from '../resets';

	type Kind = 'daily' | 'weekly' | 'event' | 'season';

	let {
		label,
		kind,
		kicker,
		endsAt,
		remaining,
		isNext = false,
		index = 0,
		note
	}: {
		label: string;
		kind: Kind;
		kicker: string;
		endsAt: number;
		remaining: number;
		isNext?: boolean;
		index?: number;
		note?: string;
	} = $props();

	const level = $derived(urgency(remaining));
</script>

<article class="card {kind}" aria-label={label} style="--i: {index}">
	<div class="art" aria-hidden="true">
		{#if kind === 'daily'}
			<svg viewBox="0 0 120 120" class="glyph">
				<circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" stroke-width="8" />
				<circle cx="60" cy="60" r="20" fill="currentColor" />
				<path
					d="M56 2h8v22h-8zM56 96h8v22h-8zM2 56h22v8H2zM96 56h22v8H96z"
					fill="currentColor"
				/>
			</svg>
		{:else if kind === 'weekly'}
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
				<span class="chip chip-soon">&#9650; ENDS SOON</span>
			{/if}
		</span>
		{#if isNext}<span class="tag">NEXT UP</span>{/if}
	</div>

	<div class="body">
		<p class="label kicker">{kicker}</p>
		<h2 class="display name">{label}</h2>

		<div class="num count" role="timer" aria-live="off">{formatCountdown(remaining)}</div>
		<p class="label coarse">ENDS IN {coarse(remaining)}</p>

		<dl class="times">
			<div>
				<dt class="label">YOU</dt>
				<dd><time datetime={new Date(endsAt).toISOString()}>{formatLocal(endsAt)}</time></dd>
			</div>
			<div>
				<dt class="label">ET</dt>
				<dd>{formatET(endsAt)}</dd>
			</div>
		</dl>

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
		animation: rise 520ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
		animation-delay: calc(var(--i) * 70ms);
		transition: box-shadow 160ms ease;
	}

	.card:hover {
		box-shadow:
			0 0 0 2px rgb(255 255 255 / 0.9) inset,
			0 18px 32px -14px rgb(4 8 30 / 0.7);
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
		background: linear-gradient(0deg, rgb(5 8 24 / 0.78) 0%, rgb(5 8 24 / 0.5) 38%, rgb(5 8 24 / 0) 62%);
		pointer-events: none;
	}

	.daily {
		--c1: #0fa88a;
		--c2: #026958;
		--c3: #014236;
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

	.times {
		margin: 12px 0 0;
		padding-top: 10px;
		border-top: 1px solid rgb(255 255 255 / 0.22);
		display: grid;
		gap: 4px;
		font-size: 14px;
		color: rgb(255 255 255 / 0.9);
	}

	.times div {
		display: flex;
		gap: 8px;
		align-items: baseline;
	}

	.times dt {
		min-width: 28px;
		font-size: 12px;
		color: rgb(255 255 255 / 0.7);
	}

	.times dd {
		margin: 0;
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

		.times {
			margin-top: 8px;
			padding-top: 8px;
			grid-template-columns: 1fr 1fr;
			gap: 12px;
		}
	}
</style>
