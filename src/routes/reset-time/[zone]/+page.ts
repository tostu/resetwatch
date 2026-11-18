import { error } from '@sveltejs/kit';
import { ZONE_PAGES, zonePage } from '../../../lib/zones';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => ZONE_PAGES.map(({ slug }) => ({ zone: slug }));

export const load: PageLoad = ({ params }) => {
	const zone = zonePage(params.zone);
	if (!zone) error(404, 'Time zone not found');
	return { zone: zone.slug };
};
