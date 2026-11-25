<script lang="ts">
	import {
		CONTACT_TITLE,
		CONTACT_DESCRIPTION,
		CONTACT_EMAIL,
		breadcrumbJsonLd,
		contactJsonLd,
		jsonLdScript
	} from '../../lib/seo';
	import DocPage from '#lib/components/DocPage.svelte';

	const TOPICS = ['Wrong reset or season date', 'Bug report', 'Feature idea', 'Something else'];

	let topic = $state(TOPICS[0]);
	let message = $state('');

	const mailto = $derived(
		`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Resetwatch] ${topic}`)}&body=${encodeURIComponent(message.trim())}`
	);

	function send(e: SubmitEvent) {
		e.preventDefault();
		window.location.href = mailto;
	}
</script>

<svelte:head>
	<title>{CONTACT_TITLE}</title>
	<meta name="description" content={CONTACT_DESCRIPTION} />
	<meta property="og:title" content={CONTACT_TITLE} />
	<meta property="og:description" content={CONTACT_DESCRIPTION} />
	<meta name="twitter:title" content={CONTACT_TITLE} />
	<meta name="twitter:description" content={CONTACT_DESCRIPTION} />
	{@html jsonLdScript(contactJsonLd())}
	{@html jsonLdScript(
		breadcrumbJsonLd([
			{ name: 'Overwatch Weekly Reset', path: '/' },
			{ name: 'Contact', path: '/contact' }
		])
	)}
</svelte:head>

<DocPage title="CONTACT" subtitle="GET IN TOUCH" tone="teal">
	<h2>Write a message</h2>
	<p>
		Pick a topic and write your message. Sending opens your email app with everything filled in.
		English or German is fine.
	</p>

	<form class="panel" onsubmit={send}>
		<label class="field">
			<span class="label">Topic</span>
			<select bind:value={topic}>
				{#each TOPICS as t (t)}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</label>

		<label class="field">
			<span class="label">Message</span>
			<textarea
				bind:value={message}
				rows="7"
				maxlength="1500"
				required
				placeholder="Which date is wrong, and what should it be?"></textarea>
		</label>

		<div class="actions">
			<button class="btn-primary" type="submit">Open email</button>
			<span class="alt">
				or write to <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>
			</span>
		</div>
	</form>

	<h2>GitHub</h2>
	<p>
		Bugs and feature ideas also work as an issue on <a
			href="https://github.com/tostu/resetwatch"
			rel="noopener">GitHub</a
		>.
	</p>
</DocPage>

<style>
	.panel {
		display: grid;
		gap: 18px;
		max-width: 560px;
		margin-bottom: 12px;
		padding: 20px;
		border-radius: 6px;
		background: var(--surface-2);
		border: 1px solid var(--line);
	}

	.field {
		display: grid;
		gap: 6px;
	}

	.field .label {
		font-size: 14px;
		color: var(--gold);
	}

	select,
	textarea {
		width: 100%;
		padding: 10px 12px;
		border: 0;
		border-bottom: 2px solid var(--bg-slate);
		border-radius: 0;
		background: var(--panel-deep);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
	}

	textarea {
		resize: vertical;
		min-height: 140px;
	}

	select:hover,
	textarea:hover {
		border-bottom-color: var(--bg-slate-hi);
	}

	select:focus,
	textarea:focus {
		outline: none;
		border-bottom-color: var(--blue-edge);
		background: var(--bar);
	}

	textarea::placeholder {
		color: var(--text-faint);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
	}

	.alt {
		font-size: 14px;
		color: var(--text-faint);
	}
</style>
