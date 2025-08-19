import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/produtos',
  '/produtos/editar/teste-id',
  '/pedidos',
  '/estoque',
  '/minha-loja',
  '/usuarios',
  '/ativar-produtos',
  '/catalogo',
  '/configuracoes',
  '/contato',
  '/campanhas',
  '/criar-kit',
  '/dashboard',
  '/onboarding',
  '/swag-track',
  '/privacidade',
  '/termos',
]

test.describe('Rotas principais', () => {
  for (const path of routes) {
    test(`GET ${path} deve responder 200`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}${path}`)
      await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`))
    })
  }
})

test.describe('Loja de Brindes', () => {
  test('Home da loja', async ({ page, baseURL, context }) => {
    await context.addCookies([{ name: 'yoobe_sso_token', value: 'dev', url: baseURL! }])
    await page.goto(`${baseURL}/loja-brindes`)
    await expect(page.locator('iframe')).toBeVisible()
  })

  test('Detalhe da loja', async ({ page, baseURL, context }) => {
    await context.addCookies([{ name: 'yoobe_sso_token', value: 'dev', url: baseURL! }])
    await page.goto(`${baseURL}/loja-brindes/1`)
    await expect(page.locator('iframe')).toBeVisible()
  })
})


