import { absolute } from '../../lib/seo';
import { SEASON_PAGES } from '../../lib/season-pages';
import { ZONE_PAGES } from '../../lib/zones';
import { eventPages } from '../../lib/event-pages';

export const prerender = true;

const PATHS = [
	'/',
	'/seasons',
	...SEASON_PAGES.map((s) => `/seasons/${s.slug}`),
	'/events',
	...eventPages().map((e) => `/events/${e.slug}`),
	'/reset-time',
	...ZONE_PAGES.map((z) => `/reset-time/${z.slug}`),
	'/faq',
	'/about',
	'/contact'
];

/** No lastmod: the build date is not a real content change, and Google ignores inaccurate values. */
export function GET() {
	const urls = PATHS.map((p) => `\t<url>\n\t\t<loc>${absolute(p)}</loc>\n\t</url>`).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
