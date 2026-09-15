import { test, expect } from '../fixtures/test.js'
import { HomePage, CartPage, CheckoutPage } from '../pages/store.pages.js'

const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:8000'

test.describe('Flujos críticos con Page Objects', () => {
  test('navega del catálogo al carrito y modifica la cantidad', async ({ cleanStore }) => {
    const home = new HomePage(cleanStore)
    const cart = new CartPage(cleanStore)
    await home.open()
    await home.addFirstProduct()
    await home.openCart()
    await expect(cart.item).toBeVisible()
    await expect.poll(() => cart.quantity()).toBe('1')
    await cart.increase()
    await expect.poll(() => cart.quantity()).toBe('2')
    await cart.remove()
    await expect(cleanStore.getByText(/Tu carrito se siente solo/i)).toBeVisible()
  })

  test('valida el resumen antes de procesar el pago', async ({ cleanStore, request }) => {
    const response = await request.get(`${apiBaseUrl}/api/inicio`)
    expect(response.ok()).toBeTruthy()
    const product = (await response.json()).productos?.[0]
    expect(product).toBeTruthy()

    const checkout = new CheckoutPage(cleanStore)
    await checkout.openWith(product)
    await expect(cleanStore.getByTestId('checkout-item')).toContainText(product.nombre)
    await expect(cleanStore.getByTestId('checkout-item')).toContainText('Cantidad: 1')
    await expect(cleanStore.getByText('Total del pedido')).toBeVisible()
  })

  test('rechaza un login inválido y muestra feedback al usuario', async ({ cleanStore }) => {
    await cleanStore.goto('/login')
    await cleanStore.getByTestId('login-email').fill('playwright-invalid@example.com')
    await cleanStore.getByTestId('login-password').fill('wrong-password')
    await cleanStore.getByTestId('login-submit').click()
    await expect(cleanStore.locator('form p')).toBeVisible()
  })
})
