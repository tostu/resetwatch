<script lang="ts">
	import { resolve } from '$app/paths';
	import { clock } from '../now.svelte';
	import { CONFIG, coarse, currentEvents, nextOccurrence, urgency } from '../resets';

	/**
	 * "Before it's gone" list for the current reset week. Ticks are saved in localStorage under the
	 * key of this week (the next reset instant), so they clear by themselves at the weekly reset.
	 * Nothing is saved until the visitor ticks something.
	 */
	const KEY = 'resetwatch:checklist';

	const nextReset = $derived(nextOccurrence(CONFIG.weekly, clock.now));
	const week = $derived(String(nextReset));

	interface Item {
		id: string;
		name: string;
		/** Countdown target. */
		at: number;
		note: string;
		href?: string;
	}

	const items = $derived<Item[]>([
		{
			id: 'weekly',
			name: 'Weekly challenges',
			at: nextReset,
			note: 'Progress starts over at the reset'
		},
		...currentEvents(clock.now)
			.filter((e) => e.phase === 'live')
			.map((e) => ({
				id: `event:${e.slug ?? e.label}`,
				name: e.label,
				at: e.endsAt,
				note: e.endsAt <= nextReset ? 'Gone before the next reset' : 'Event challenges',
				href: e.slug
			}))
	]);

	let done = $state<Record<string, boolean>>({});
	let loaded = $state(false);

	// Load once on the client; drop ticks from earlier weeks.
	$effect(() => {
		if (!clock.ready || loaded) return;
		try {
			const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
			if (raw && raw.week === week && raw.done) done = raw.done;
			else if (raw) localStorage.removeItem(KEY);
		} catch {
			// Storage blocked or corrupt: start empty.
		}
		loaded = true;
	});

	// The reset passed while the page was open: clear the list.
	let seenWeek = '';
	$effect(() => {
		if (!loaded) return;
		if (seenWeek && seenWeek !== week) {
			done = {};
			try {
				localStorage.removeItem(KEY);
			} catch {
				/* ignore */
			}
		}
		seenWeek = week;
	});

	function toggle(id: string) {
		done = { ...done, [id]: !done[id] };
		try {
			if (Object.values(done).some(Boolean)) {
				localStorage.setItem(KEY, JSON.stringify({ week, done }));
			} else {
				localStorage.removeItem(KEY);
			}
		} catch {
			/* storage blocked: ticks just won't survive a reload */
		}
	}

	const count = $derived(items.filter((i) => done[i.id]).length);
</script>

<section class="check" aria-labelledby="check-head">
	<div class="top">
		<h2 id="check-head" class="display h2">Before it's gone</h2>
		<span class="label progress" aria-live="polite">{count} / {items.length} done</span>
	</div>
	<p class="intro">
		Your list for this reset week. Ticks clear themselves at the weekly reset and stay in this
		browser only.
	</p>
	<ul class="list">
		{#each items as it (it.id)}
			{@const level = urgency(it.at - clock.now)}
			<li class:done={done[it.id]}>
				<label>
					<input
						type="checkbox"
						checked={!!done[it.id]}
						disabled={!clock.ready}
						onchange={() => toggle(it.id)}
					/>
					<span class="body">
						<span class="name">{it.name}</span>
						<span class="note">{it.note}</span>
					</span>
				</label>
				<span class="right">
					<span
						class="num left"
						class:soon={level === 'soon'}
						class:crit={level === 'critical'}
						class:pending={!clock.ready}>{coarse(it.at - clock.now).toLowerCase()}</span
					>
					{#if it.href}
						<a class="more" href={resolve('/events/[slug]', { slug: it.href })}
							>Details<span class="sr-only"> for {it.name}</span></a
						>
					{/if}
				</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
	}
	.h2 {
		margin: 0;
		font-size: 30px;
		line-height: 1;
	}
	.progress {
		font-size: 15px;
		color: var(--text-dim);
	}
	.intro {
		margin: 8px 0 14px;
		font-size: 15px;
		color: var(--text-dim);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--surface);
	}
	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 16px;
		border-top: 1px solid var(--line);
		transition: opacity 150ms ease;
	}
	li:first-child {
		border-top: 0;
	}
	li.done {
		opacity: 0.55;
	}
	li.done .name {
		text-decoration: line-through;
		text-decoration-thickness: 2px;
	}
	label {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
		min-height: 44px;
		cursor: pointer;
	}
	input {
		flex: none;
		width: 22px;
		height: 22px;
		border-radius: 4px;
		border: 2px solid var(--text-faint);
		background: transparent;
		color: var(--orange);
		cursor: pointer;
	}
	input:focus-visible {
		outline: 2px solid var(--blue-edge);
		outline-offset: 2px;
	}
	.body {
		display: grid;
		min-width: 0;
	}
	.name {
		font-size: 17px;
		font-weight: 500;
		color: var(--text);
	}
	.note {
		font-size: 14px;
		color: var(--text-dim);
	}
	.right {
		display: flex;
		align-items: baseline;
		gap: 14px;
		flex: none;
	}
	.left {
		font-size: 18px;
		color: var(--text);
		white-space: nowrap;
	}
	.left.soon {
		color: var(--gold);
	}
	.left.crit {
		color: var(--crit);
	}
	.more {
		font-size: 14px;
		color: var(--cyan);
		text-underline-offset: 3px;
	}
	@media (max-width: 559px) {
		.more {
			display: none;
		}
	}
</style>
