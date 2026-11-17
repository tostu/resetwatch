/** Shared SEO config + structured data. Change SITE_URL to the real production origin. */
export const SITE_URL = 'https://resetwatch.tostu.net';
export const SITE_NAME = 'Resetwatch';

export const HOME_TITLE = 'Overwatch Weekly Reset Countdown: Next Reset Time | Resetwatch';
export const HOME_DESCRIPTION =
	'When is the next Overwatch weekly reset? Live countdown to the Tuesday reset (2 PM ET / 11 AM PT), event end and season end, shown in your local time.';

export const SEASONS_TITLE = 'Overwatch Season Schedule: End Dates & Countdown | Resetwatch';
export const SEASONS_DESCRIPTION =
	'Current Overwatch season countdown, week-by-week progress, and start dates of the next seasons, in your local time.';

export const FAQ_TITLE = 'Overwatch Reset Times FAQ: Weekly, Event & Season | Resetwatch';
export const FAQ_DESCRIPTION =
	'Answers about the Overwatch weekly reset time, your local time zone, what changes at reset, and when the current season ends.';

export interface Faq {
	q: string;
	a: string;
}

/** Visible on the home page AND emitted as FAQPage JSON-LD: keep both in sync via this list. */
export const FAQS: Faq[] = [
	{
		q: 'When is the Overwatch weekly reset?',
		a: 'The Overwatch weekly reset happens every Tuesday at 11 AM Pacific Time, which is 2 PM Eastern Time. In UTC that is 19:00 during US winter time and 18:00 during US summer time.'
	},
	{
		q: 'What time is the Overwatch weekly reset in my time zone?',
		a: 'Resetwatch shows the countdown in your own local time automatically. For reference: 7 PM in the UK and 8 PM in Germany, France and most of central Europe, on Tuesday. These can shift by one hour for a few weeks a year when US and European clocks change on different dates.'
	},
	{
		q: 'What happens at the Overwatch weekly reset?',
		a: 'Weekly resets, new seasons, limited-time events and patches all go live at the Tuesday reset time. Resetwatch counts down to the next weekly reset, the end of the current event and the end of the current season.'
	},
	{
		q: 'When does the current Overwatch season end?',
		a: 'Overwatch seasons run 8 to 9 weeks and start and end at the Tuesday weekly reset. The live season countdown is on the Resetwatch seasons page, together with the start dates of the next seasons.'
	},
	{
		q: 'Is Resetwatch an official Blizzard site?',
		a: 'No. Resetwatch is a fan-made tool and is not affiliated with Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc.'
	}
];

export function absolute(path: string): string {
	return new URL(path, SITE_URL).toString();
}

export function websiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${SITE_URL}/#website`,
				url: `${SITE_URL}/`,
				name: SITE_NAME,
				description: HOME_DESCRIPTION,
				inLanguage: 'en'
			},
			{
				'@type': 'WebApplication',
				'@id': `${SITE_URL}/#app`,
				name: 'Resetwatch: Overwatch Reset Countdown',
				url: `${SITE_URL}/`,
				applicationCategory: 'GameApplication',
				operatingSystem: 'Any (web browser)',
				description: HOME_DESCRIPTION,
				isAccessibleForFree: true,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				about: { '@type': 'VideoGame', name: 'Overwatch' }
			}
		]
	};
}

export function faqJsonLd(limit = FAQS.length) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQS.slice(0, limit).map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a }
		}))
	};
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: it.name,
			item: absolute(it.path)
		}))
	};
}

/** Safe for inline <script type="application/ld+json">: escape `<`. */
export function jsonLdScript(data: unknown): string {
	return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
