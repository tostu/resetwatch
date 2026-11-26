import { ABOUT_MODIFIED, CONTACT_MODIFIED, DATA_MODIFIED, absolute } from '../../lib/seo';
import { SEASON_PAGES } from '../../lib/season-pages';
import { ZONE_PAGES } from '../../lib/zones';
import { eventPages } from '../../lib/event-pages';

export const prerender = true;

/**
 * lastmod is only given where it is true: data-driven pages carry the date the baked D1 events
 * last changed (fetch-events only rewrites it on a real diff, not on every build), hand-written
 * pages the date of their last edit. Reset-time pages and the FAQ have none: their content is
 * derived from the fixed reset rule. Google ignores inaccurate values, so a missing one beats a
 * build date.
 */
const day = (iso: string) => iso.slice(0, 10);
const PATHS: [path: string, lastmod?: string][] = [
	['/', DATA_MODIFIED],
	['/seasons', DATA_MODIFIED],
	...SEASON_PAGES.map((s): [string, string] => [`/seasons/${s.slug}`, DATA_MODIFIED]),
	['/events', DATA_MODIFIED],
	...eventPages().map((e): [string, string] => [`/events/${e.slug}`, DATA_MODIFIED]),
	['/calendar', DATA_MODIFIED],
	['/reset-time'],
	...ZONE_PAGES.map((z): [string] => [`/reset-time/${z.slug}`]),
	['/daily-reset'],
	['/shop-reset'],
	['/widget'],
	['/faq'],
	['/about', ABOUT_MODIFIED],
	['/contact', CONTACT_MODIFIED]
];

export function GET() {
	const urls = PATHS.map(
		([p, mod]) =>
			`\t<url>\n\t\t<loc>${absolute(p)}</loc>${mod ? `\n\t\t<lastmod>${day(mod)}</lastmod>` : ''}\n\t</url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
