import { error } from '@sveltejs/kit';
import { SEASON_PAGES, seasonPage } from '../../../lib/season-pages';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => SEASON_PAGES.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const page = seasonPage(params.slug);
	if (!page) error(404, 'Season not found');
	return { slug: page.slug };
};
