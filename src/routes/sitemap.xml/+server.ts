import { absolute } from '../../lib/seo';

export const prerender = true;

const PATHS = ['/', '/seasons', '/faq'];

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
