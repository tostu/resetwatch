import { expect, test } from '@playwright/test';

test('home shows weekly, event and season cards', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'RESETS' })).toBeVisible();
	await expect(page.getByRole('article')).toHaveCount(3);
});

test('footer links to faq and legal pages', async ({ page }) => {
	await page.goto('/');
	const footer = page.getByRole('contentinfo');
	await expect(footer.getByRole('link', { name: 'FAQ' })).toBeVisible();
	await expect(footer.getByRole('link', { name: 'Privacy policy' })).toBeVisible();
	await footer.getByRole('link', { name: 'FAQ' }).click();
	await expect(page.getByRole('heading', { level: 1, name: /FAQ/ })).toBeVisible();
});

test('seasons shows nine week ticks', async ({ page }) => {
	await page.goto('/seasons');
	await expect(page.getByRole('listitem').filter({ hasText: /^W\d/ })).toHaveCount(9);
});
