<script lang="ts">
	import { onMount } from 'svelte';
	import { analyticsLoaded, feedbackLoaded, loadAnalytics, loadFeedback } from '../consent';

	// Real opt-in: Cloudflare Web Analytics and the Tally feedback popup only load after their
	// category is accepted. Declining is as easy as accepting, and the footer link reopens the
	// preferences to withdraw consent.
	function applyConsent(CookieConsent: typeof import('vanilla-cookieconsent')) {
		if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
		if (CookieConsent.acceptedCategory('feedback')) loadFeedback();
	}
	onMount(() => {
		let cancelled = false;

		(async () => {
			await import('vanilla-cookieconsent/dist/cookieconsent.css');
			const CookieConsent = await import('vanilla-cookieconsent');
			if (cancelled) return;

			const de = navigator.language?.toLowerCase().startsWith('de');

			await CookieConsent.run({
				revision: 3,
				onFirstConsent: () => applyConsent(CookieConsent),
				onConsent: () => applyConsent(CookieConsent),
				onChange: () => {
					applyConsent(CookieConsent);
					// Withdrawn: reload so the already-injected scripts stop running.
					if (
						(analyticsLoaded() && !CookieConsent.acceptedCategory('analytics')) ||
						(feedbackLoaded() && !CookieConsent.acceptedCategory('feedback'))
					)
						location.reload();
				},
				cookie: {
					name: 'cc_cookie',
					expiresAfterDays: 182,
					sameSite: 'Lax'
				},
				guiOptions: {
					consentModal: {
						layout: 'box inline',
						position: 'bottom left',
						flipButtons: false,
						equalWeightButtons: true
					}
				},
				categories: {
					necessary: { enabled: true, readOnly: true },
					analytics: { enabled: false },
					feedback: { enabled: false }
				},
				language: {
					default: de ? 'de' : 'en',
					autoDetect: 'browser',
					translations: {
						en: {
							consentModal: {
								title: 'Privacy settings',
								description:
									'Resetwatch can use Cloudflare Web Analytics to count page views and a Tally popup to ask for feedback when you leave. No advertising. Both only run if you allow them. Necessary storage (security, your choice here, time zone) is always on. Details in the <a href="/privacy">privacy policy</a> and <a href="/impressum">legal notice</a>.',
								acceptAllBtn: 'Allow all',
								acceptNecessaryBtn: 'Necessary only',
								showPreferencesBtn: 'Settings'
							},
							preferencesModal: {
								title: 'Privacy settings',
								acceptAllBtn: 'Allow all',
								acceptNecessaryBtn: 'Necessary only',
								savePreferencesBtn: 'Save settings',
								closeIconLabel: 'Close',
								sections: [
									{
										title: 'Necessary',
										description:
											'Security (Cloudflare bot protection, cookie cf_clearance), this settings cookie (cc_cookie) and, if you pick one, your time zone (local storage). Always active.',
										linkedCategory: 'necessary'
									},
									{
										title: 'Analytics (Cloudflare Web Analytics)',
										description:
											'Anonymous page view and performance statistics. No cookies, no cross-site tracking, no profiles. Data goes to Cloudflare (USA). You can withdraw consent at any time via "Privacy settings" in the footer.',
										linkedCategory: 'analytics'
									},
									{
										title: 'Feedback (Tally)',
										description:
											'A small popup asks for feedback when you are about to leave. Loading it contacts Tally (Belgium), which receives your IP address; your answers are only sent if you submit the form. It remembers locally that you saw or answered it. You can withdraw consent at any time via "Privacy settings" in the footer.',
										linkedCategory: 'feedback'
									}
								]
							}
						},
						de: {
							consentModal: {
								title: 'Datenschutz-Einstellungen',
								description:
									'Resetwatch kann Cloudflare Web Analytics nutzen, um Seitenaufrufe zu zählen, und ein Tally-Popup, um beim Verlassen der Seite nach Feedback zu fragen. Keine Werbung. Beides läuft nur, wenn du zustimmst. Notwendige Speicherung (Sicherheit, deine Auswahl hier, Zeitzone) ist immer aktiv. Details in der <a href="/privacy">Datenschutzerklärung</a> und im <a href="/impressum">Impressum</a>.',
								acceptAllBtn: 'Alle erlauben',
								acceptNecessaryBtn: 'Nur notwendige',
								showPreferencesBtn: 'Einstellungen'
							},
							preferencesModal: {
								title: 'Datenschutz-Einstellungen',
								acceptAllBtn: 'Alle erlauben',
								acceptNecessaryBtn: 'Nur notwendige',
								savePreferencesBtn: 'Einstellungen speichern',
								closeIconLabel: 'Schließen',
								sections: [
									{
										title: 'Notwendig',
										description:
											'Sicherheit (Cloudflare-Bot-Schutz, Cookie cf_clearance), dieses Einstellungs-Cookie (cc_cookie) und, falls du eine wählst, deine Zeitzone (lokaler Speicher). Immer aktiv.',
										linkedCategory: 'necessary'
									},
									{
										title: 'Analyse (Cloudflare Web Analytics)',
										description:
											'Anonyme Statistik zu Seitenaufrufen und Ladeleistung. Keine Cookies, kein seitenübergreifendes Tracking, keine Profile. Die Daten gehen an Cloudflare (USA). Du kannst deine Einwilligung jederzeit über „Datenschutz-Einstellungen“ im Footer widerrufen.',
										linkedCategory: 'analytics'
									},
									{
										title: 'Feedback (Tally)',
										description:
											'Ein kleines Popup fragt nach Feedback, wenn du die Seite verlassen willst. Beim Laden wird Tally (Belgien) kontaktiert und erhält deine IP-Adresse; deine Antworten werden nur gesendet, wenn du das Formular abschickst. Lokal wird gemerkt, dass du es gesehen oder beantwortet hast. Du kannst deine Einwilligung jederzeit über „Datenschutz-Einstellungen“ im Footer widerrufen.',
										linkedCategory: 'feedback'
									}
								]
							}
						}
					}
				}
			});
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<style>
	:global(#cc-main) {
		--cc-font-family: var(--font-body);
		--cc-bg: var(--panel);
		--cc-primary-color: var(--text);
		--cc-secondary-color: var(--text-dim);
		--cc-link-color: var(--blue-edge);
		--cc-separator-border-color: var(--bg-slate);
		--cc-modal-border-radius: 0;
		--cc-btn-border-radius: 0;
		--cc-modal-margin: 16px;
		--cc-z-index: 100;

		--cc-btn-primary-bg: var(--orange);
		--cc-btn-primary-color: var(--text);
		--cc-btn-primary-border-color: var(--orange);
		--cc-btn-primary-hover-bg: var(--orange-flare);
		--cc-btn-primary-hover-color: var(--text);
		--cc-btn-primary-hover-border-color: var(--orange-flare);
		--cc-btn-secondary-bg: transparent;
		--cc-btn-secondary-color: var(--text);
		--cc-btn-secondary-border-color: var(--bg-slate);
		--cc-btn-secondary-hover-bg: var(--panel-deep);
		--cc-btn-secondary-hover-color: var(--text);
		--cc-btn-secondary-hover-border-color: var(--text-dim);
		--cc-footer-bg: var(--panel-deep);
		--cc-footer-color: var(--text-dim);
		--cc-footer-border-color: var(--bg-slate);
		--cc-overlay-bg: rgb(0 0 0 / 0.5);
	}

	:global(#cc-main .cm) {
		border-top: 3px solid var(--gold);
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.55);
		max-width: 26rem;
	}

	:global(#cc-main .cm__title) {
		font-family: var(--font-display);
		font-weight: 800;
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		font-size: 1.5rem;
	}

	:global(#cc-main .cm__desc) {
		font-size: 0.9rem;
		line-height: 1.5;
	}

	:global(#cc-main .cm__desc a) {
		color: var(--blue-edge);
		text-decoration: underline;
	}

	:global(#cc-main .cm__btn) {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.125rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		min-height: 44px;
		padding: 0 20px;
	}

	:global(#cc-main button:focus-visible),
	:global(#cc-main a:focus-visible) {
		outline: 2px solid var(--blue-edge);
		outline-offset: 2px;
	}

	/* Keep clear of the fixed mobile tab bar. */
	@media (max-width: 719px) {
		:global(#cc-main .cm.cm--bottom) {
			max-width: none;
			bottom: calc(var(--mobile-bar-h) + env(safe-area-inset-bottom) + 8px);
		}
	}
</style>
