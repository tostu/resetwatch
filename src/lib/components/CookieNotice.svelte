<script lang="ts">
	import { onMount } from 'svelte';
	import { analyticsLoaded, loadAnalytics } from '../consent';

	// Real opt-in: Cloudflare Web Analytics only loads after "analytics" is accepted. Declining
	// is as easy as accepting, and the footer link reopens the preferences to withdraw consent.
	onMount(() => {
		let cancelled = false;

		(async () => {
			await import('vanilla-cookieconsent/dist/cookieconsent.css');
			const CookieConsent = await import('vanilla-cookieconsent');
			if (cancelled) return;

			const de = navigator.language?.toLowerCase().startsWith('de');

			await CookieConsent.run({
				revision: 2,
				onFirstConsent: () => {
					if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
				},
				onConsent: () => {
					if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
				},
				onChange: () => {
					if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
					// Withdrawn: reload so the already-injected beacon stops running.
					else if (analyticsLoaded()) location.reload();
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
					analytics: { enabled: false }
				},
				language: {
					default: de ? 'de' : 'en',
					autoDetect: 'browser',
					translations: {
						en: {
							consentModal: {
								title: 'Privacy settings',
								description:
									'Resetwatch can use Cloudflare Web Analytics to count page views, without cookies and without advertising. It only runs if you allow it. Necessary storage (security, your choice here, time zone) is always on. Details in the <a href="/privacy">privacy policy</a> and <a href="/impressum">legal notice</a>.',
								acceptAllBtn: 'Allow analytics',
								acceptNecessaryBtn: 'Necessary only',
								showPreferencesBtn: 'Settings'
							},
							preferencesModal: {
								title: 'Privacy settings',
								acceptAllBtn: 'Allow analytics',
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
									}
								]
							}
						},
						de: {
							consentModal: {
								title: 'Datenschutz-Einstellungen',
								description:
									'Resetwatch kann Cloudflare Web Analytics nutzen, um Seitenaufrufe zu zählen, ohne Cookies und ohne Werbung. Das läuft nur, wenn du zustimmst. Notwendige Speicherung (Sicherheit, deine Auswahl hier, Zeitzone) ist immer aktiv. Details in der <a href="/privacy">Datenschutzerklärung</a> und im <a href="/impressum">Impressum</a>.',
								acceptAllBtn: 'Analyse erlauben',
								acceptNecessaryBtn: 'Nur notwendige',
								showPreferencesBtn: 'Einstellungen'
							},
							preferencesModal: {
								title: 'Datenschutz-Einstellungen',
								acceptAllBtn: 'Analyse erlauben',
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
