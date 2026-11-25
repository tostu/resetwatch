import { error } from '@sveltejs/kit';
import { eventPages, eventPage } from '../../../lib/event-pages';
import type { EntryGenerator, PageLoad } from './$types';

// With no event rows baked (fresh D1), a prerendered dynamic route with zero entries fails the
// build (prerender_unseen_routes). Then it falls back to the SPA 404 page instead.
export const prerender = eventPages().length > 0;

export const entries: EntryGenerator = () => eventPages().map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const page = eventPage(params.slug);
	if (!page) error(404, 'Event not found');
	return { slug: page.slug };
};
