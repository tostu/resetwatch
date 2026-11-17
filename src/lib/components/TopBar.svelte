<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { clock } from '../now.svelte';
	import { nextReset, formatCountdown, localTzName } from '../resets';

	const tabs = [
		{ href: '/', label: 'RESETS' },
		{ href: '/seasons', label: 'SEASONS' }
	] as const;

	let next = $derived(nextReset(clock.now));
	let tz = $state('');

	$effect(() => {
		tz = localTzName();
		return clock.start();
	});

	function isActive(href: string): boolean {
		const p = page.url.pathname;
		return href === '/' ? p === '/' : p === href || p.startsWith(href + '/');
	}
</script>

<header class="topbar">
	<nav class="tabs" aria-label="Main">
		{#each tabs as tab (tab.href)}
			<a
				class="tab label"
				class:active={isActive(tab.href)}
				href={resolve(tab.href)}
				aria-current={isActive(tab.href) ? 'page' : undefined}
			>
				{tab.label}
			</a>
		{/each}
	</nav>

	<div class="plate-wrap">
		<div class="plate-edge">
			<div class="plate" role="timer" aria-label="Next reset">
				<span class="label next">NEXT ·</span>
				<span class="label which">{next.label}</span>
				<span class="num time">{formatCountdown(next.remaining)}</span>
			</div>
		</div>
	</div>

	<div class="tz label" title="Your local time zone">{tz}</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--bar-h);
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: stretch;
		background: var(--bar);
		border-bottom: 1px solid #070b15;
	}

	.tabs {
		display: flex;
		align-items: stretch;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		padding: 0 24px;
		font-size: 18px;
		color: var(--text);
		text-decoration: none;
		border-bottom: 2px solid transparent;
	}

	.tab:hover {
		background: var(--panel);
	}

	.tab.active {
		background: var(--blue);
		border-bottom-color: var(--blue-edge);
	}

	.plate-wrap {
		position: relative;
		width: 340px;
		z-index: 2;
		filter: drop-shadow(0 0 10px rgb(63 169 255 / 0.45));
	}

	.plate-edge {
		position: absolute;
		inset: 0 0 -12px 0;
		background: var(--blue-edge);
		clip-path: polygon(0 0, 100% 0, calc(100% - 26px) 100%, 26px 100%);
	}

	.plate {
		position: absolute;
		inset: 0 2px 2px 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding-bottom: 10px;
		overflow: hidden;
		background: linear-gradient(180deg, #1583e0 0%, var(--blue) 60%, #024a87 100%);
		clip-path: polygon(0 0, 100% 0, calc(100% - 25px) 100%, 25px 100%);
		white-space: nowrap;
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

	.next {
		font-size: 16px;
		color: var(--text-dim);
		font-style: italic;
	}

	.which {
		font-size: 20px;
		font-style: italic;
		min-width: 0;
		max-width: 9em;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.time {
		font-size: 24px;
		font-style: italic;
	}

	.tz {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 16px;
		font-size: 14px;
		color: var(--text-dim);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 719px) {
		.topbar {
			display: block;
			height: 0;
			border: 0;
			background: none;
		}

		.tabs {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 60;
			height: var(--mobile-bar-h);
			padding-bottom: env(safe-area-inset-bottom);
			background: var(--bar);
			border-top: 1px solid #070b15;
		}

		.tab {
			flex: 1;
			font-size: 18px;
			border-bottom: 0;
			border-top: 2px solid transparent;
		}

		.tab.active {
			border-top-color: var(--blue-edge);
		}

		.plate-wrap {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: auto;
			height: 44px;
			filter: none;
		}

		.plate-edge {
			inset: 0;
			clip-path: none;
			border-bottom: 2px solid var(--blue-edge);
		}

		.plate {
			inset: 0 0 2px 0;
			padding-bottom: 0;
			clip-path: none;
			background: linear-gradient(180deg, #1583e0 0%, var(--blue) 100%);
		}

		.tz {
			display: none;
		}
	}
</style>
