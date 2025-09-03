import { test, expect } from '@playwright/test'

test.describe('Admin menu', () => {
  test('shows required links on /admin', async ({ page }) => {
    await page.goto('/admin')

    // If redirected to login or login elements are present, skip (needs auth setup)
    const url = page.url()
    const loginVisible = await page.getByText(/login|entrar/i).first().isVisible().catch(() => false)
    if (url.includes('/auth/login') || loginVisible) {
      test.skip(true, 'Requires authenticated admin session (set up test auth to run).')
    }

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Orçamentos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Changelog' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Documentação' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Desenvolvimento' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ativação de Produtos' })).toBeVisible()
  })
})

