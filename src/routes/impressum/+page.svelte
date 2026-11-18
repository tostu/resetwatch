<script lang="ts">
	import { resolve } from '$app/paths';
	import DocPage from '#lib/components/DocPage.svelte';
	import { CONTACT_EMAIL } from '../../lib/seo';
</script>

<svelte:head>
	<title>Impressum | Resetwatch</title>
	<meta
		name="description"
		content="Impressum und Anbieterkennzeichnung von Resetwatch gemäß § 5 DDG. Legal notice."
	/>
</svelte:head>

<DocPage title="IMPRESSUM" subtitle="LEGAL NOTICE">
	<div lang="de">
		<h2>Angaben gemäß § 5 DDG</h2>
		<p>
			Torge Stubbe<br />
			Hammer Steindamm 12<br />
			22089 Hamburg<br />
			Deutschland
		</p>

		<h2>Kontakt</h2>
		<p>
			E-Mail: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a><br />
			Weitere Kontaktmöglichkeit: <a href={resolve('/contact')}>Kontaktseite</a>
		</p>

		<h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
		<p>Torge Stubbe, Anschrift wie oben.</p>

		<h2>Art des Angebots</h2>
		<p>
			Resetwatch ist ein privates, nicht kommerzielles Fanprojekt. Es gibt keine Werbung und keine
			entgeltlichen Angebote.
		</p>

		<h2>Haftung für Inhalte</h2>
		<p>
			Die Inhalte dieser Seite wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und
			Aktualität, insbesondere der Termine und Zeiten, wird keine Gewähr übernommen. Verbindlich
			sind allein die Angaben von Blizzard Entertainment. Bei Hinweisen auf Rechtsverletzungen
			werden entsprechende Inhalte umgehend entfernt.
		</p>

		<h2>Haftung für Links</h2>
		<p>
			Diese Seite enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss
			besteht. Für diese fremden Inhalte kann keine Gewähr übernommen werden. Verantwortlich ist
			stets der jeweilige Anbieter. Bei Bekanntwerden von Rechtsverletzungen werden solche Links
			umgehend entfernt.
		</p>

		<h2>Urheberrecht und Marken</h2>
		<p>
			Resetwatch steht in keiner Verbindung zu Blizzard Entertainment, Inc. Overwatch ist eine Marke
			von Blizzard Entertainment, Inc. Es werden keine Grafiken, Logos oder sonstigen Assets von
			Blizzard verwendet. Der Quellcode ist auf
			<a href="https://github.com/tostu/resetwatch" rel="noopener noreferrer">GitHub</a>
			einsehbar.
		</p>

		<h2>Datenschutz</h2>
		<p>
			Informationen zum Datenschutz stehen in der <a href={resolve('/privacy')}
				>Datenschutzerklärung</a
			>.
		</p>
	</div>
</DocPage>
