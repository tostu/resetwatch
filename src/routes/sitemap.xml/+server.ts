import { absolute } from '../../lib/seo';

export const prerender = true;

const PATHS = ['/', '/seasons', '/faq'];

/** Built once per deploy, so lastmod is the build date instead of a hand-edited value. */
export function GET() {
	const lastmod = new Date().toISOString().slice(0, 10);
	const urls = PATHS.map(
		(p) => `\t<url>\n\t\t<loc>${absolute(p)}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t</url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
