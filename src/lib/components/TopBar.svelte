<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { clock } from '../now.svelte';
	import { nextReset, seasonAt, formatCountdown, coarse, urgency } from '../resets';

	let next = $derived(nextReset(clock.now));
	let season = $derived(seasonAt(clock.now));
	let level = $derived(urgency(next.remaining));

	/** Orange "something here needs a look" dot, like the game's unread markers. */
	let tabs = $derived([
		{
			href: '/',
			label: 'RESETS',
			side: 'l',
			dot: level !== 'normal',
			dotText: 'reset ending soon'
		},
		{
			href: '/seasons',
			label: 'SEASONS',
			side: 'r',
			dot: season.end - clock.now < 7 * 86_400_000,
			dotText: 'season ends this week'
		}
	] as const);

	$effect(() => clock.start());

	function isActive(href: string): boolean {
		const p = page.url.pathname;
		return href === '/' ? p === '/' : p === href || p.startsWith(href + '/');
	}
</script>

<!--
	Desktop: one 5-column grid, brand | RESETS | timer plate | SEASONS | season status.
	The <nav> uses display: contents there so its two links sit either side of the plate;
	on phones it becomes the fixed bottom tab bar.
-->
<header class="topbar">
	<a class="brand" href={resolve('/')} aria-label="Resetwatch home">
		<svg viewBox="0 0 32 32" class="mark" aria-hidden="true">
			<circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="3" />
			<path d="M16 8 24 16 16 24 8 16Z" fill="currentColor" />
			<path d="M16 3v4" stroke="currentColor" stroke-width="3" />
		</svg>
		<span class="word display">RESETWATCH</span>
	</a>

	<nav class="tabs" aria-label="Main">
		{#each tabs as tab (tab.href)}
			<a
				class="tab tab-{tab.side} label"
				class:active={isActive(tab.href)}
				href={resolve(tab.href)}
				aria-current={isActive(tab.href) ? 'page' : undefined}
			>
				{#if tab.dot}<span class="dot" aria-hidden="true"></span>{/if}
				<span>{tab.label}</span>
				{#if tab.dot}<span class="sr-only">({tab.dotText})</span>{/if}
			</a>
		{/each}
	</nav>

	<div class="plate-wrap {level}">
		<div class="plate-edge">
			<div
				class="plate"
				role="timer"
				aria-label="Next reset: {next.label}, {coarse(next.remaining).toLowerCase()}"
			>
				<span class="label kicker" aria-hidden="true">NEXT RESET · <b>{next.label}</b></span>
				<span class="num time" aria-hidden="true">{formatCountdown(next.remaining)}</span>
			</div>
		</div>
	</div>

	<div class="right">
		<a class="stat" href={resolve('/seasons')}>
			<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">
				<path
					d="M12 2 21 5v7c0 5-4 8.5-9 10-5-1.5-9-5-9-10V5Z"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linejoin="round"
				/>
				<path d="M7.5 12.5 12 9l4.5 3.5V15L12 11.5 7.5 15Z" fill="currentColor" />
			</svg>
			<span class="stat-text">
				<span class="label stat-cap">SEASON {season.number}</span>
				<span class="num stat-val">WEEK {season.week}/{season.weeks}</span>
			</span>
		</a>
	</div>
</header>

<style>
	.topbar {
		--plate-w: 380px;
		--overhang: 18px;
		/* Slant of the plate's sides; the tabs next to it use the same angle. */
		--chamfer: 34px;
		--skew: 22deg;
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--bar-h);
		display: grid;
		grid-template-columns: 1fr auto auto auto 1fr;
		align-items: stretch;
		background: linear-gradient(180deg, #131c32 0%, var(--bar) 100%);
		box-shadow:
			0 1px 0 #070b15,
			0 2px 0 rgb(63 169 255 / 0.12),
			0 12px 28px -12px rgb(0 0 0 / 0.65);
	}

	/* ---------- brand ---------- */

	.brand {
		grid-column: 1;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 0 22px;
		color: var(--text);
		text-decoration: none;
	}

	.mark {
		width: 30px;
		height: 30px;
		color: var(--blue-edge);
		filter: drop-shadow(0 0 6px rgb(63 169 255 / 0.5));
	}

	.word {
		font-size: 23px;
		letter-spacing: 0.02em;
	}

	/* ---------- tabs either side of the plate ---------- */

	.tabs {
		display: contents;
	}

	.tab {
		grid-row: 1;
		position: relative;
		isolation: isolate;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 170px;
		min-height: 44px;
		padding: 0 28px;
		font-size: 21px;
		color: rgb(255 255 255 / 0.84);
		text-decoration: none;
		transition: color 120ms ease;
	}

	.tab-l {
		grid-column: 2;
		margin-right: 4px;
	}

	.tab-r {
		grid-column: 4;
		margin-left: 4px;
	}

	/* Slanted fill behind the label, parallel to the plate's side it touches. */
	.tab::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: transparent;
		transition: background-color 120ms ease;
	}

	.tab-l::before {
		transform: skewX(var(--skew));
	}

	.tab-r::before {
		transform: skewX(calc(var(--skew) * -1));
	}

	.tab:hover {
		color: var(--text);
	}

	.tab:hover::before {
		background: linear-gradient(0deg, rgb(255 255 255 / 0.08) 0%, rgb(255 255 255 / 0) 75%);
	}

	/*
	 * Active: a lit floor and a bright slanted rail, not a solid blue block, so it
	 * doesn't melt into the blue plate right next to it.
	 */
	.tab.active {
		color: var(--text);
		text-shadow: 0 0 12px rgb(63 169 255 / 0.7);
	}

	.tab.active::before {
		background: linear-gradient(0deg, rgb(63 169 255 / 0.28) 0%, rgb(63 169 255 / 0) 80%);
		box-shadow: inset 0 -3px 0 var(--blue-edge);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		left: 18%;
		right: 18%;
		bottom: 0;
		height: 3px;
		background: #fff;
		box-shadow: 0 0 10px 1px var(--blue-edge);
		pointer-events: none;
	}

	.dot {
		position: absolute;
		top: 9px;
		left: 50%;
		width: 8px;
		height: 8px;
		margin-left: -4px;
		border-radius: 50%;
		background: var(--orange-flare);
		box-shadow: 0 0 6px var(--orange);
	}

	/* ---------- centre plate ---------- */

	.plate-wrap {
		--edge: var(--blue-edge);
		--glow: rgb(63 169 255 / 0.5);
		grid-column: 3;
		grid-row: 1;
		position: relative;
		width: var(--plate-w);
		z-index: 2;
		filter: drop-shadow(0 0 14px var(--glow));
	}

	.plate-wrap.soon {
		--edge: var(--gold);
		--glow: rgb(252 199 5 / 0.45);
	}

	.plate-wrap.critical {
		--edge: var(--crit);
		--glow: rgb(250 36 34 / 0.55);
	}

	.plate-edge {
		position: absolute;
		inset: 0 0 calc(var(--overhang) * -1) 0;
		background: var(--edge);
		clip-path: polygon(0 0, 100% 0, calc(100% - var(--chamfer)) 100%, var(--chamfer) 100%);
	}

	.plate {
		position: absolute;
		inset: 0 2px 2px 2px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding-bottom: 4px;
		overflow: hidden;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0) 46%),
			linear-gradient(180deg, #1786e6 0%, var(--blue) 58%, #023d70 100%);
		clip-path: polygon(
			0 0,
			100% 0,
			calc(100% - var(--chamfer) + 1px) 100%,
			calc(var(--chamfer) - 1px) 100%
		);
		white-space: nowrap;
	}

	/* Inner frame line, like the one inside the game's Play plate. */
	.plate::before {
		content: '';
		position: absolute;
		inset: 6px 16px 8px;
		border: 1px solid rgb(255 255 255 / 0.22);
		border-top: 0;
		clip-path: polygon(0 0, 100% 0, calc(100% - 26px) 100%, 26px 100%);
		pointer-events: none;
	}

	/* Light streak sweeping across the plate, a nod to the game's Play button. */
	.plate::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: -40%;
		width: 30%;
		background: linear-gradient(
			90deg,
			rgb(255 255 255 / 0),
			rgb(255 255 255 / 0.35),
			rgb(255 255 255 / 0)
		);
		transform: skewX(-24deg);
		animation: sweep 5s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes sweep {
		0%,
		60% {
			left: -40%;
		}
		100% {
			left: 130%;
		}
	}

	.kicker {
		font-size: 14px;
		font-style: italic;
		letter-spacing: 0.08em;
		color: rgb(255 255 255 / 0.75);
	}

	.kicker b {
		font-weight: 800;
		color: var(--text);
	}

	.time {
		font-size: 36px;
		font-style: italic;
		font-weight: 800;
		line-height: 1;
		text-shadow: 0 2px 8px rgb(2 30 70 / 0.6);
	}

	/* ---------- right: season status ---------- */

	.right {
		grid-column: 5;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 16px;
		min-width: 0;
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		height: 48px;
		padding: 0 14px;
		color: var(--text);
		text-decoration: none;
		transition: background-color 120ms ease;
	}

	.stat:hover {
		background: rgb(255 255 255 / 0.06);
	}

	.ico {
		width: 26px;
		height: 26px;
		flex: none;
		color: var(--cyan);
	}

	.stat-text {
		display: flex;
		flex-direction: column;
		line-height: 1;
	}

	.stat-cap {
		font-size: 12px;
		color: var(--text-dim);
	}

	.stat-val {
		margin-top: 3px;
		font-size: 19px;
		white-space: nowrap;
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

	@media (prefers-reduced-motion: reduce) {
		.plate::after {
			display: none;
		}
	}

	/* Not enough room for everything: drop the wordmark, then the season status. */
	@media (max-width: 1240px) {
		.word {
			display: none;
		}
	}

	@media (max-width: 1060px) {
		.topbar {
			--plate-w: 320px;
		}
		.tab {
			min-width: 140px;
			padding: 0 20px;
			font-size: 19px;
		}
		.right {
			visibility: hidden;
		}
		.time {
			font-size: 30px;
		}
	}

	@media (max-width: 860px) {
		.topbar {
			--plate-w: 280px;
		}
		.brand {
			padding: 0 12px;
		}
		.tab {
			min-width: 116px;
			font-size: 18px;
		}
	}

	/* ---------- phones: bottom tab bar + sticky plate strip ---------- */

	@media (max-width: 719px) {
		.topbar {
			display: block;
			height: 0;
			box-shadow: none;
			background: none;
		}

		.brand,
		.right {
			display: none;
		}

		.tabs {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 60;
			display: flex;
			height: var(--mobile-bar-h);
			padding-bottom: env(safe-area-inset-bottom);
			background: var(--bar);
			border-top: 1px solid #070b15;
		}

		.tab {
			flex: 1;
			min-width: 0;
			margin: 0;
			font-size: 18px;
		}

		.tab::before,
		.tab-l::before,
		.tab-r::before {
			transform: none;
		}

		.tab.active::before {
			box-shadow: inset 0 3px 0 var(--blue-edge);
			background: linear-gradient(180deg, rgb(63 169 255 / 0.28) 0%, rgb(63 169 255 / 0) 80%);
		}

		.tab.active::after {
			display: none;
		}

		.plate-wrap {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: auto;
			height: 48px;
			filter: none;
		}

		.plate-edge {
			inset: 0;
			clip-path: none;
		}

		.plate {
			inset: 0 0 2px 0;
			flex-direction: row;
			gap: 10px;
			padding-bottom: 0;
			clip-path: none;
		}

		.plate::before {
			display: none;
		}

		.time {
			font-size: 24px;
		}
	}
</style>
