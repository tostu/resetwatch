import { expect, test } from '@playwright/test';

test('home shows weekly countdown and season progress', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: /Weekly reset/i })).toBeVisible();
	await expect(page.getByRole('timer', { name: 'Weekly reset countdown' })).toBeVisible();
	await expect(page.getByRole('progressbar', { name: 'Season progress' })).toBeVisible();
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
