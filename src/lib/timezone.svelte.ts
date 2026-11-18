/**
 * Display time zone for local-time labels. Empty during SSR/prerender (labels fall back to
 * UTC, identical for every visitor); `init()` fills it in on the client from the saved choice
 * or the browser's own zone. The user can override it, e.g. when on a VPN.
 */
const KEY = 'resetwatch:tz';

function valid(tz: string | null | undefined): tz is string {
	if (!tz) return false;
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

class DisplayZone {
	/** IANA zone used for labels; '' until hydrated. */
	zone = $state('');
	/** The browser's own zone; '' until hydrated. */
	detected = $state('');

	init(): void {
		const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
		this.detected = detected;
		let saved: string | null = null;
		try {
			saved = localStorage.getItem(KEY);
		} catch {
			// Storage blocked: fine, use the detected zone.
		}
		this.zone = valid(saved) ? saved : detected;
	}

	set(tz: string): void {
		if (!valid(tz)) return;
		this.zone = tz;
		try {
			if (tz === this.detected) localStorage.removeItem(KEY);
			else localStorage.setItem(KEY, tz);
		} catch {
			// Not persisted; still applies for this visit.
		}
	}
}

export const displayZone = new DisplayZone();
