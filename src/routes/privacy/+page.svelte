<script lang="ts">
	import DocPage from '#lib/components/DocPage.svelte';
</script>

<svelte:head>
	<title>Privacy Policy | Resetwatch</title>
	<meta name="description" content="What data Resetwatch collects: none beyond server logs." />
</svelte:head>

<DocPage title="PRIVACY" subtitle="WHAT WE COLLECT">
	<h2>Short version</h2>
	<p>
		Resetwatch has no accounts, no cookies, no analytics and no ads. The countdowns run entirely in
		your browser, using your device's clock and time zone. Nothing you do on the site is sent
		anywhere or stored.
	</p>

	<h2>Hosting and server logs</h2>
	<p>
		The site is hosted on Cloudflare. When you open a page, Cloudflare's servers process your IP
		address, browser details and the requested URL to deliver the page and protect against abuse.
		This is technically necessary and based on our legitimate interest in running a secure website
		(Art. 6 (1) (f) GDPR). We do not have access to your identity from this data and do not combine
		it with anything else. See
		<a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer"
			>Cloudflare's privacy policy</a
		>
		for how they handle it.
	</p>

	<h2>Fonts</h2>
	<p>Fonts are served from this site. Your browser does not contact Google or any font provider.</p>

	<h2>Cookies and local storage</h2>
	<p>None are set, so there is no cookie banner.</p>

	<h2>Your rights</h2>
	<p>
		Under the GDPR you can ask for access to, correction of, or deletion of personal data we hold
		about you, and you can complain to a data protection authority. Since we store none beyond
		short-lived server logs, there is usually nothing to hand over.
	</p>

	<h2>Changes</h2>
	<p>If the site starts collecting anything, this page will be updated first.</p>
</DocPage>
