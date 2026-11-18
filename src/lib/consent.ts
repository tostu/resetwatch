/**
 * Cloudflare Web Analytics is opt-in: the beacon is only injected after the visitor accepted
 * the "analytics" category in the consent banner. The token is public by design (it ships in
 * every beacon request).
 */
const CF_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const CF_BEACON_TOKEN = '66ef6da1b7b447ec9f0e13ba3b5defad';
const SCRIPT_ID = 'cf-web-analytics';

export function loadAnalytics(): void {
	if (typeof document === 'undefined' || document.getElementById(SCRIPT_ID)) return;
	const s = document.createElement('script');
	s.id = SCRIPT_ID;
	s.type = 'module';
	s.defer = true;
	s.src = CF_BEACON_SRC;
	s.dataset.cfBeacon = JSON.stringify({ token: CF_BEACON_TOKEN });
	document.head.appendChild(s);
}

export function analyticsLoaded(): boolean {
	return typeof document !== 'undefined' && !!document.getElementById(SCRIPT_ID);
}

/** Reopens the consent preferences, e.g. from the footer, to change or withdraw consent. */
export async function openConsentSettings(): Promise<void> {
	const CookieConsent = await import('vanilla-cookieconsent');
	CookieConsent.showPreferences();
}
