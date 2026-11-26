<script lang="ts">
	/**
	 * Small "add once" control for a single date. Visually quiet and always labelled as a one-time
	 * copy, so it never competes with (or gets mistaken for) the subscription.
	 */
	let {
		what,
		google,
		ics,
		hint = false
	}: {
		/** Screen-reader name of the item, e.g. `Taking Reign end`. */
		what: string;
		google: string;
		/** Path of the single-item .ics download. */
		ics: string;
		/** Show the "won't update" note next to the links. */
		hint?: boolean;
	} = $props();
</script>

<span class="once">
	<span class="label once-tag" aria-hidden="true">+ Add once</span>
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external URL and static .ics file -->
	<a
		class="label lnk"
		href={google}
		target="_blank"
		rel="noopener"
		aria-label="Add {what} to Google Calendar once">Google</a
	>
	<a
		class="label lnk"
		href={ics}
		download
		data-sveltekit-reload
		aria-label="Download {what} as a one-time .ics file">Apple / Outlook</a
	>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{#if hint}<span class="note">one-time copy, does not update</span>{/if}
</span>

<style>
	.once {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 12px;
	}
	.once-tag {
		font-size: 12px;
		color: var(--text-faint);
	}
	.lnk {
		display: inline-flex;
		align-items: center;
		min-height: 32px;
		padding: 0 10px;
		border: 1px dashed rgb(92 200 255 / 0.45);
		border-radius: 4px;
		font-size: 13px;
		color: var(--cyan);
		text-decoration: none;
	}
	.lnk:hover {
		border-style: solid;
		background: rgb(92 200 255 / 0.08);
	}
	.note {
		font-size: 13px;
		color: var(--text-faint);
	}
</style>
