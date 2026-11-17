<script lang="ts">
	import { clock } from '../../lib/now.svelte';
	import { seasonAt, seasonByIndex, coarse, formatLocal, formatET } from '../../lib/resets';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TimeLeft from '#lib/components/TimeLeft.svelte';

	$effect(() => clock.start());

	const season = $derived(seasonAt(clock.now));
	const remaining = $derived(season.end - clock.now);
	const weeks = $derived(Array.from({ length: season.weeks }, (_, i) => i + 1));
	const upcoming = $derived([seasonByIndex(season.number), seasonByIndex(season.number + 1)]);
</script>

<svelte:head>
	<title>Seasons — Resetwatch</title>
	<meta
		name="description"
		content="Current Overwatch season progress, weekly reset ticks and upcoming season start dates."
	/>
</svelte:head>

<div class="wrap page">
	<div class="top">
		<PageTitle title={season.label} subtitle="TIME REMAINING: {coarse(remaining)}" />
		<TimeLeft ms={remaining} label="SEASON ENDS" />
	</div>

	<section class="panel" aria-labelledby="progress">
		<h2 id="progress" class="display heading">WEEK {season.week} OF {season.weeks}</h2>
		<ol class="ticks">
			{#each weeks as w (w)}
				{@const state = w < season.week ? 'done' : w === season.week ? 'current' : 'upcoming'}
				<li class="tick {state}" aria-current={state === 'current' ? 'step' : undefined}>
					<span class="label wk">W{w}</span>
					<span class="seg" aria-hidden="true"><span class="mark">{state === 'done' ? '✓' : ''}</span></span>
					<span class="sr-only">
						Week {w}, {state === 'done'
							? 'completed'
							: state === 'current'
								? 'current'
								: 'upcoming'}
					</span>
					{#if state === 'current'}<span class="tag now" aria-hidden="true">NOW</span>{/if}
				</li>
			{/each}
		</ol>
	</section>

	<div class="two">
		<section class="panel" aria-labelledby="dates">
			<h2 id="dates" class="display heading">THIS SEASON</h2>
			<dl class="dates">
				<div>
					<dt class="label">STARTED</dt>
					<dd>{formatLocal(season.start)}</dd>
					<dd class="dim">{formatET(season.start)}</dd>
				</div>
				<div>
					<dt class="label">ENDS</dt>
					<dd>{formatLocal(season.end)}</dd>
					<dd class="dim">{formatET(season.end)}</dd>
				</div>
			</dl>
		</section>

		<section class="panel" aria-labelledby="next">
			<h2 id="next" class="display heading">NEXT SEASONS</h2>
			<ul class="rows">
				{#each upcoming as s (s.number)}
					<li class="row">
						<span class="display num-ghost" aria-hidden="true">{s.number}</span>
						<span class="label sname">SEASON {s.number}</span>
						<span class="starts">
							<span class="label dimlabel">STARTS</span>
							{formatLocal(s.start)}
							<span class="dim">({formatET(s.start)})</span>
						</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<style>
	.page {
		padding-block: 24px 48px;
		padding-inline: 16px;
		display: grid;
		gap: 16px;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px 24px;
		margin-bottom: 20px;
	}
	.two {
		display: grid;
		gap: 16px;
	}
	@media (min-width: 900px) {
		.two {
			grid-template-columns: 1fr 1.25fr;
		}
	}

	/* Dark chamfered panel with a bright top edge, like the game's menu slabs. */
	.panel {
		position: relative;
		padding: 20px 20px 22px;
		background: linear-gradient(180deg, rgb(29 37 59 / 0.96), rgb(17 23 41 / 0.96));
		border-top: 3px solid var(--blue-edge);
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%);
		box-shadow: 0 18px 30px -14px rgb(4 8 30 / 0.7);
	}

	.heading {
		margin: 0 0 18px;
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}

	/* Week strip: slanted segments, like the game's reward ladder. */
	.ticks {
		list-style: none;
		margin: 0;
		padding: 26px 0 0;
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		gap: 6px;
	}
	.tick {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 6px;
		position: relative;
		min-width: 0;
	}
	.wk {
		font-size: 15px;
		text-align: center;
		color: var(--text-dim);
	}
	.seg {
		display: grid;
		place-items: center;
		height: 44px;
		background: #2a3350;
		transform: skewX(-14deg);
		border-bottom: 3px solid #3a4568;
	}
	.mark {
		display: block;
		transform: skewX(14deg);
		font-weight: 800;
		line-height: 1;
		color: var(--ink);
	}
	.done .seg {
		background: linear-gradient(180deg, #2fd84a, #00a700);
		border-bottom-color: #00751a;
	}
	.current .seg {
		background: linear-gradient(180deg, #2a97f0, var(--blue));
		border-bottom-color: var(--blue-edge);
		box-shadow: 0 0 18px rgb(63 169 255 / 0.65);
	}
	.current .wk {
		color: var(--text);
	}
	.now {
		position: absolute;
		top: -22px;
		left: 50%;
		transform: translateX(-50%);
		height: 20px;
		font-size: 13px;
		padding: 0 12px 0 10px;
	}

	.dates {
		margin: 0;
		display: grid;
		gap: 18px;
	}
	.dates dt {
		font-size: 13px;
		color: var(--gold);
	}
	.dates dd {
		margin: 2px 0 0;
		font-size: 18px;
	}
	.dim {
		color: var(--text-dim);
		font-size: 14px;
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.row {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		background: var(--row);
		border-left: 4px solid var(--orange);
		padding: 14px 16px 14px 20px;
		min-height: 64px;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 16px;
	}
	.num-ghost {
		position: absolute;
		z-index: -1;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 88px;
		line-height: 1;
		color: rgb(255 255 255 / 0.07);
	}
	.sname {
		font-size: 22px;
	}
	.dimlabel {
		font-size: 13px;
		color: var(--gold);
		margin-right: 4px;
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
</style>
