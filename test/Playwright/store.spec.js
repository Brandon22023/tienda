import { test, expect } from '../../frontend/node_modules/@playwright/test/index.mjs'

const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000'

test.describe('Electrocore - flujo integral de tienda', () => {
  test('carga el inicio y muestra productos desde la API', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.inicio-grid .producto-card').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /agregar al carrito/i }).first()).toBeVisible()
  })

  test('abre el menú y navega a una categoría', async ({ page }) => {
    await page.goto('/')
    await page.locator('.menu-btn').click()
    await page.getByRole('button', { name: 'Laptops' }).click()
    await expect(page).toHaveURL(/\/laptops$/)
    await expect(page.getByText(/Catálogo: laptops/i)).toBeVisible()
  })

  test('agrega un producto y actualiza el contador del carrito', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
    await expect(page.locator('.cart-badge')).toHaveText('1')
    await expect(page.locator('.cart-btn')).toBeVisible()
  })

  test('permite aumentar, disminuir y eliminar productos del carrito', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
    await page.locator('.cart-btn').click()
    await expect(page.getByText('Mi Carrito')).toBeVisible()

    await page.locator('.cart-item-qty button').last().click()
    await expect(page.locator('.cart-item-qty span')).toHaveText('2')
    await page.locator('.cart-item-qty button').first().click()
    await expect(page.locator('.cart-item-qty span')).toHaveText('1')
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByText(/Tu carrito se siente solo/i)).toBeVisible()
  })

  test('muestra validación al continuar un pedido incompleto', async ({ page }) => {
    await page.goto('/pedidos')
    await page.getByRole('button', { name: /guardar y continuar/i }).click()
    await expect(page.getByText('Completa los campos obligatorios.')).toBeVisible()
  })

  test('muestra errores de validación en registro', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: /crear cuenta/i }).click()
    await expect(page.locator('form p').last()).toContainText(/(required|required|obligatorio|correo)/i)
  })

  test('rechaza credenciales inválidas en login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Correo').fill('noexiste-e2e@example.com')
    await page.getByLabel('Contraseña').fill('password-invalida')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.locator('form p').last()).toBeVisible()
  })

  test('ordena el catálogo por precio', async ({ page }) => {
    await page.goto('/laptops')
    await page.getByRole('button', { name: /ordenar precio por/i }).click()
    await page.getByRole('menuitem', { name: 'Mayor a menor' }).click()
    await expect(page.getByRole('button', { name: /ordenar precio por.*mayor a menor/i })).toBeVisible()
  })

  test('completa un pedido real con precio e inventario del backend', async ({ page, request }) => {
    const response = await request.get(`${apiBaseUrl}/api/inicio`)
    expect(response.ok()).toBeTruthy()
    const payload = await response.json()
    const product = payload.productos?.[0]
    expect(product).toBeTruthy()

    await page.goto('/')
    await page.evaluate(({ product }) => {
      localStorage.setItem('cart', JSON.stringify([{
        idproductos: product.idproductos,
        nombre: product.nombre,
        precio: product.precio,
        image_url: product.image_url,
        cantidad: 1
      }]))
      localStorage.setItem('orderInfo', JSON.stringify({
        nombre: 'Cliente Playwright',
        correo: 'playwright@example.com',
        telefono: '55555555',
        direccion: 'Direccion de prueba E2E',
        nota: '',
        createdAt: new Date().toISOString()
      }))
    }, { product })

    await page.goto('/pago')
    await page.getByRole('button', { name: /continuar con efectivo/i }).click()
    await expect(page).toHaveURL(/\/resumen$/)
    await expect(page.getByText('Resumen de compra')).toBeVisible()
    await expect(page.getByText(/N.*pedido:/i)).toBeVisible()
  })
})
