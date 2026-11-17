import { expect, test } from '@playwright/test';

test('home shows four reset cards', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'RESETS' })).toBeVisible();
	await expect(page.getByRole('article')).toHaveCount(4);
});

test('seasons shows nine week ticks', async ({ page }) => {
	await page.goto('/seasons');
	await expect(page.getByRole('listitem').filter({ hasText: /^W\d/ })).toHaveCount(9);
});
