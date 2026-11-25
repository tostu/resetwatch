<script lang="ts">
	import DocPage from '#lib/components/DocPage.svelte';
	import { CONTACT_EMAIL } from '../../lib/seo';
</script>

<svelte:head>
	<title>Datenschutzerklärung / Privacy Policy | Resetwatch</title>
	<meta
		name="description"
		content="Datenschutzerklärung / Privacy policy of Resetwatch: no accounts, no ads. Server logs via Cloudflare, optional analytics only with consent, one optional local setting."
	/>
</svelte:head>

<DocPage title="DATENSCHUTZ" subtitle="PRIVACY POLICY">
	<p><strong>Stand: 2026-11-25</strong> · <a href="#english">English version below</a></p>

	<h2 id="deutsch">Datenschutzerklärung (Deutsch)</h2>

	<h3>1. Verantwortlicher</h3>
	<p>
		Verantwortlich im Sinne der DSGVO ist Torge Stubbe, Hammer Steindamm 12, 22089 Hamburg,
		Deutschland, E-Mail: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. Resetwatch ist ein
		privates, nicht kommerzielles Fanprojekt.
	</p>

	<h3>2. Kurzfassung</h3>
	<p>
		Resetwatch hat keine Benutzerkonten und keine Werbung. Die Countdowns laufen vollständig in
		Ihrem Browser, anhand der Uhr und Zeitzone Ihres Geräts. Beim Aufruf der Seite verarbeitet der
		Hosting-Anbieter Cloudflare technisch notwendige Daten (Server-Logs). Eine anonyme
		Reichweitenmessung (Cloudflare Web Analytics) und ein Feedback-Popup (Tally) laufen nur, wenn
		Sie im Banner zustimmen. Eine
		lokale Einstellung (Zeitzone) wird nur gespeichert, wenn Sie sie selbst ändern.
	</p>

	<h3>3. Hosting und Server-Logs (Cloudflare)</h3>
	<p>
		Die Seite ist statisch und wird über Cloudflare ausgeliefert (Cloudflare, Inc., 101 Townsend St,
		San Francisco, CA 94107, USA; für die EU: Cloudflare Germany GmbH). Beim Aufruf verarbeitet
		Cloudflare automatisch Ihre IP-Adresse, den User-Agent (Browserangaben), die aufgerufene URL und
		den Zeitpunkt des Zugriffs, um die Seite auszuliefern, den Betrieb sicherzustellen und Angriffe
		abzuwehren.
	</p>
	<p>
		Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb der
		Website, Art. 6 Abs. 1 lit. f DSGVO. Wir speichern selbst keine Logdaten und greifen nicht auf
		einzelne Logeinträge zu. Cloudflare hält technische Zugriffs- und Logdaten nach den eigenen
		Standardfristen nur kurzzeitig vor: je nach Datensatz 3 bis 30 Tage (Worker-Logs auf unserem
		Tarif 3 Tage, Zugriffsprotokolle in Cloudflare Log Explorer 30 Tage). Ein Export in eigene
		Speicher (Logpush) ist nicht aktiviert.
	</p>
	<p>
		Mit Cloudflare besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO (Cloudflare Data
		Processing Addendum). Da eine Verarbeitung in den USA nicht ausgeschlossen werden kann, stützt
		sich die Übermittlung auf den EU-US Data Privacy Framework (Cloudflare ist zertifiziert)
		und/oder auf Standardvertragsklauseln. Mehr dazu in der
		<a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer"
			>Datenschutzerklärung von Cloudflare</a
		>.
	</p>

	<h3>4. Cloudflare-Sicherheitsfunktionen und Cookies</h3>
	<p>
		Resetwatch setzt selbst keine Tracking- oder Werbe-Cookies. Der Einwilligungsbanner speichert
		Ihre Auswahl in einem technisch notwendigen Cookie (<code>cc_cookie</code>, Laufzeit 182 Tage;
		enthält Ihre Auswahl, Zeitstempel, Sprache und eine zufällige ID), damit er nicht bei jedem
		Besuch erneut erscheint und Ihre Entscheidung nachweisbar ist (Art. 7 Abs. 1 DSGVO). Für den
		Schutz vor Bots und Missbrauch sind Cloudflare-Sicherheitsfunktionen aktiv, darunter ein
		Erkennungsskript (<code>/cdn-cgi/challenge-platform</code>). Dabei kann Cloudflare ein technisch
		notwendiges Sicherheits-Cookie (derzeit
		<code>cf_clearance</code>) setzen. Es dient ausschließlich der Sicherheit und Bot-Erkennung,
		nicht der Analyse oder Werbung.
	</p>
	<p>
		Rechtsgrundlage für den Zugriff auf Ihr Endgerät ist § 25 Abs. 2 Nr. 2 TDDDG (unbedingt
		erforderlich, damit die Seite sicher bereitgestellt werden kann), für die anschließende
		Verarbeitung Art. 6 Abs. 1 lit. f DSGVO. Eine Einwilligung ist dafür nicht erforderlich.
	</p>

	<h3>5. Lokaler Speicher (Zeitzone)</h3>
	<p>
		Die Zeitzone wird im Browser über die <code>Intl</code>-Schnittstelle erkannt und nicht
		übertragen. Nur wenn Sie manuell eine andere Zeitzone wählen, speichert die Seite diese Auswahl
		im lokalen Speicher Ihres Browsers (Schlüssel <code>resetwatch:tz</code>). Der Wert bleibt auf
		Ihrem Gerät und wird nie an einen Server gesendet.
	</p>
	<p>
		Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (von Ihnen ausdrücklich gewünschte Funktion) und Art. 6
		Abs. 1 lit. f DSGVO. Sie können den Eintrag löschen, indem Sie die Websitedaten Ihres Browsers
		löschen oder die Zeitzone wieder auf die erkannte zurücksetzen.
	</p>

	<h3>6. Reichweitenmessung (Cloudflare Web Analytics, nur mit Einwilligung)</h3>
	<p>
		Wenn Sie im Banner „Analyse erlauben“ wählen, laden wir das Skript von Cloudflare Web Analytics
		(<code>static.cloudflareinsights.com</code>). Es misst anonym, welche Seiten aufgerufen werden
		und wie schnell sie laden. Dabei werden insbesondere die aufgerufene URL, die Herkunftsseite
		(Referrer), Browser, Betriebssystem, Gerätetyp, das Land (aus der IP-Adresse abgeleitet) und
		Leistungskennzahlen verarbeitet. Nach Angaben von Cloudflare verwendet Web Analytics weder
		Cookies noch lokalen Speicher und erstellt keine Profile einzelner Besucher. Wir sehen nur
		aggregierte Statistiken. Empfänger ist Cloudflare, Inc. (USA); die Übermittlung stützt sich auf
		den EU-US Data Privacy Framework und/oder Standardvertragsklauseln (siehe Abschnitt 3).
	</p>
	<p>
		Ohne Ihre Zustimmung wird das Skript nicht geladen und es findet keine Reichweitenmessung statt.
		Rechtsgrundlage ist Ihre Einwilligung, Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Die
		Einwilligung ist freiwillig und kann jederzeit mit Wirkung für die Zukunft widerrufen werden:
		über „Datenschutz-Einstellungen“ im Footer. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
		Verarbeitung bleibt unberührt.
	</p>

	<h3>6a. Feedback-Popup (Tally, nur mit Einwilligung)</h3>
	<p>
		Wenn Sie im Banner die Kategorie „Feedback“ erlauben („Alle erlauben“), laden wir das Skript von
		Tally (<code>tally.so</code>). Es zeigt beim Verlassen der Seite einmalig ein kleines Popup mit
		einem Feedback-Formular. Beim Laden des Skripts erhält Tally Ihre IP-Adresse und technische
		Browserangaben. Die Antworten im Formular werden nur übertragen, wenn Sie das Formular selbst
		abschicken; sie können freiwillig auch ohne E-Mail-Adresse gegeben werden. Damit das Popup nicht
		erneut erscheint, speichert Tally lokal in Ihrem Browser, dass Sie es gesehen oder beantwortet
		haben. Anbieter ist Tally BV, Belgien (EU).
	</p>
	<p>
		Ohne Ihre Zustimmung wird das Skript nicht geladen. Rechtsgrundlage ist Ihre Einwilligung, Art.
		6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Sie ist freiwillig und kann jederzeit mit Wirkung
		für die Zukunft über „Datenschutz-Einstellungen“ im Footer widerrufen werden. Mehr dazu in der
		<a href="https://tally.so/help/privacy-policy" rel="noopener noreferrer"
			>Datenschutzerklärung von Tally</a
		>.
	</p>

	<h3>7. Schriftarten</h3>
	<p>
		Schriftarten werden von dieser Seite selbst ausgeliefert. Ihr Browser kontaktiert weder Google
		noch einen anderen Schriftanbieter.
	</p>

	<h3>8. Kontaktaufnahme</h3>
	<p>
		Wenn Sie uns per E-Mail schreiben, verarbeiten wir Ihre Angaben (E-Mail-Adresse, Inhalt der
		Nachricht), um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, bei
		vertragsähnlichen Anliegen Art. 6 Abs. 1 lit. b DSGVO. Wir löschen die Daten nach Abschluss der
		Bearbeitung, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Die Kontaktseite
		verwendet nur einen <code>mailto:</code>-Link, es wird nichts über die Website an einen Server
		übertragen.
	</p>

	<h3>9. Externe Links</h3>
	<p>
		Links zu externen Seiten (z. B. GitHub, Blizzard-News) übertragen erst dann Daten an den
		jeweiligen Anbieter, wenn Sie sie anklicken. Für diese Seiten gelten deren eigene
		Datenschutzerklärungen.
	</p>

	<h3>10. Ihre Rechte</h3>
	<p>Sie haben nach der DSGVO folgende Rechte:</p>
	<ul>
		<li>Auskunft (Art. 15)</li>
		<li>Berichtigung (Art. 16)</li>
		<li>Löschung (Art. 17)</li>
		<li>Einschränkung der Verarbeitung (Art. 18)</li>
		<li>Datenübertragbarkeit (Art. 20)</li>
		<li>Widerruf einer Einwilligung (Art. 7 Abs. 3), siehe Abschnitte 6 und 6a</li>
		<li>
			Widerspruch (Art. 21): Soweit wir Daten auf Grundlage berechtigter Interessen (Art. 6 Abs. 1
			lit. f DSGVO) verarbeiten, können Sie aus Gründen, die sich aus Ihrer besonderen Situation
			ergeben, jederzeit widersprechen.
		</li>
	</ul>
	<p>
		Wenden Sie sich dafür an <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. Da wir selbst
		keine personenbezogenen Daten speichern (außer bei einer E-Mail an uns), gibt es meist nichts
		herauszugeben.
	</p>
	<p>
		Sie haben außerdem das Recht, sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).
		Zuständig für uns ist der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit
		(HmbBfDI), Ludwig-Erhard-Str. 22, 20459 Hamburg,
		<a href="https://www.datenschutz-hamburg.de" rel="noopener noreferrer"
			>www.datenschutz-hamburg.de</a
		>.
	</p>

	<h3>11. Keine Pflicht zur Bereitstellung, keine automatisierte Entscheidung</h3>
	<p>
		Sie sind nicht verpflichtet, personenbezogene Daten bereitzustellen. Technisch notwendige Daten
		fallen beim Aufruf der Seite jedoch zwangsläufig an. Eine automatisierte Entscheidungsfindung
		einschließlich Profiling findet nicht statt.
	</p>

	<h3>12. Änderungen</h3>
	<p>
		Wenn sich die Datenverarbeitung ändert, wird diese Erklärung vorher angepasst. Stand:
		2026-11-25.
	</p>

	<hr />

	<h2 id="english">Privacy Policy (English)</h2>

	<h3>1. Controller</h3>
	<p>
		The controller under the GDPR is Torge Stubbe, Hammer Steindamm 12, 22089 Hamburg, Germany,
		email: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. Resetwatch is a private,
		non-commercial fan project.
	</p>

	<h3>2. Short version</h3>
	<p>
		Resetwatch has no accounts and no ads. The countdowns run entirely in your browser, using your
		device's clock and time zone. When you open the site, the hosting provider Cloudflare processes
		technically necessary data (server logs). Anonymous audience measurement (Cloudflare Web
		Analytics) and a feedback popup (Tally) only run if you agree in the banner. A local setting (time zone) is only stored if
		you change it yourself.
	</p>

	<h3>3. Hosting and server logs (Cloudflare)</h3>
	<p>
		The site is static and delivered through Cloudflare (Cloudflare, Inc., 101 Townsend St, San
		Francisco, CA 94107, USA; EU entity: Cloudflare Germany GmbH). When you open a page, Cloudflare
		automatically processes your IP address, user agent (browser details), the requested URL and the
		time of access to deliver the page, keep it running and defend against attacks.
	</p>
	<p>
		The legal basis is our legitimate interest in a secure and stable website, Art. 6(1)(f) GDPR. We
		do not store log data ourselves and do not access individual log entries. Cloudflare keeps
		technical access and log data only briefly under its own default periods: 3 to 30 days depending
		on the dataset (Worker logs on our plan 3 days, access logs in Cloudflare Log Explorer 30 days).
		Export to our own storage (Logpush) is not enabled.
	</p>
	<p>
		A data processing agreement under Art. 28 GDPR is in place (Cloudflare Data Processing
		Addendum). Since processing in the USA cannot be ruled out, the transfer relies on the EU-US
		Data Privacy Framework (Cloudflare is certified) and/or Standard Contractual Clauses. See
		<a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer"
			>Cloudflare's privacy policy</a
		>.
	</p>

	<h3>4. Cloudflare security features and cookies</h3>
	<p>
		Resetwatch sets no tracking or advertising cookies itself. The consent banner stores your choice
		in a strictly necessary cookie (<code>cc_cookie</code>, 182 days; contains your choice, a
		timestamp, language and a random ID) so it does not reappear on every visit and your decision
		can be proven (Art. 7(1) GDPR). To protect against bots and abuse, Cloudflare security features
		are active, including a detection script (<code>/cdn-cgi/challenge-platform</code>). Cloudflare
		may set strictly necessary security cookie in this context (currently
		<code>cf_clearance</code>). It serves security and bot detection only, not analytics or
		advertising.
	</p>
	<p>
		The legal basis for accessing your device is § 25(2) no. 2 TDDDG (strictly necessary to provide
		the site securely), and for the subsequent processing Art. 6(1)(f) GDPR. No consent is required
		for this.
	</p>

	<h3>5. Local storage (time zone)</h3>
	<p>
		Your time zone is detected in the browser through the <code>Intl</code> API and is not
		transmitted. Only if you manually pick a different time zone does the site save that choice in
		your browser's local storage (key <code>resetwatch:tz</code>). The value stays on your device
		and is never sent to any server.
	</p>
	<p>
		Legal basis: § 25(2) no. 2 TDDDG (a function you explicitly requested) and Art. 6(1)(f) GDPR.
		You can delete the entry by clearing your browser's site data or by resetting the time zone to
		the detected one.
	</p>

	<h3>6. Audience measurement (Cloudflare Web Analytics, consent only)</h3>
	<p>
		If you choose "Allow analytics" in the banner, we load the Cloudflare Web Analytics script (<code
			>static.cloudflareinsights.com</code
		>). It measures anonymously which pages are viewed and how fast they load. In particular the
		requested URL, the referrer, browser, operating system, device type, the country (derived from
		the IP address) and performance metrics are processed. According to Cloudflare, Web Analytics
		uses neither cookies nor local storage and does not build profiles of individual visitors. We
		only see aggregated statistics. The recipient is Cloudflare, Inc. (USA); the transfer relies on
		the EU-US Data Privacy Framework and/or Standard Contractual Clauses (see section 3).
	</p>
	<p>
		Without your consent the script is not loaded and no audience measurement takes place. The legal
		basis is your consent, Art. 6(1)(a) GDPR and § 25(1) TDDDG. Consent is voluntary and can be
		withdrawn at any time with effect for the future via "Privacy settings" in the footer. The
		lawfulness of processing before withdrawal is not affected.
	</p>

	<h3>6a. Feedback popup (Tally, consent only)</h3>
	<p>
		If you allow the "Feedback" category in the banner ("Allow all"), we load the script from Tally
		(<code>tally.so</code>). When you are about to leave the page, it shows a small popup with a
		feedback form once. Loading the script gives Tally your IP address and technical browser
		details. Your answers in the form are only transmitted if you submit the form yourself, and you
		may answer without giving an email address. So the popup does not reappear, Tally stores locally
		in your browser that you saw or answered it. The provider is Tally BV, Belgium (EU).
	</p>
	<p>
		Without your consent the script is not loaded. The legal basis is your consent, Art. 6(1)(a)
		GDPR and § 25(1) TDDDG. It is voluntary and can be withdrawn at any time with effect for the
		future via "Privacy settings" in the footer. See
		<a href="https://tally.so/help/privacy-policy" rel="noopener noreferrer"
			>Tally's privacy policy</a
		>.
	</p>

	<h3>7. Fonts</h3>
	<p>
		Fonts are served from this site. Your browser does not contact Google or any other font
		provider.
	</p>

	<h3>8. Contact by email</h3>
	<p>
		If you email us, we process your details (email address, message content) to answer your
		request. The legal basis is Art. 6(1)(f) GDPR, or Art. 6(1)(b) GDPR where the request relates to
		a contract. We delete the data once your request has been handled, unless legal retention duties
		apply. The contact page only uses a <code>mailto:</code> link, nothing is transmitted to a server
		through the website.
	</p>

	<h3>9. External links</h3>
	<p>
		Links to external sites (for example GitHub, Blizzard news) only transfer data to the respective
		provider once you click them. Their own privacy policies apply.
	</p>

	<h3>10. Your rights</h3>
	<p>Under the GDPR you have the right to:</p>
	<ul>
		<li>access (Art. 15)</li>
		<li>rectification (Art. 16)</li>
		<li>erasure (Art. 17)</li>
		<li>restriction of processing (Art. 18)</li>
		<li>data portability (Art. 20)</li>
		<li>withdraw consent (Art. 7(3)), see sections 6 and 6a</li>
		<li>
			object (Art. 21): where we process data based on legitimate interests (Art. 6(1)(f) GDPR), you
			may object at any time on grounds relating to your particular situation.
		</li>
	</ul>
	<p>
		Send requests to <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. Since we store no
		personal data ourselves (apart from emails you send us), there is usually nothing to hand over.
	</p>
	<p>
		You also have the right to lodge a complaint with a supervisory authority (Art. 77 GDPR). The
		authority responsible for us is the Hamburg Commissioner for Data Protection and Freedom of
		Information (HmbBfDI), Ludwig-Erhard-Str. 22, 20459 Hamburg, Germany,
		<a href="https://www.datenschutz-hamburg.de" rel="noopener noreferrer"
			>www.datenschutz-hamburg.de</a
		>.
	</p>

	<h3>11. No obligation to provide data, no automated decisions</h3>
	<p>
		You are not required to provide personal data. Technically necessary data does arise when you
		open the site. There is no automated decision-making, including profiling.
	</p>

	<h3>12. Changes</h3>
	<p>If data processing changes, this page will be updated first. Last updated: 2026-11-25.</p>
</DocPage>
