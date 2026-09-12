export class HomePage {
  constructor(page) {
    this.page = page
  }

  async open() {
    await this.page.goto('/')
    await this.page.getByTestId('home-product-card').first().waitFor()
  }

  async addFirstProduct() {
    await this.page.getByTestId('home-add-to-cart').first().click()
  }

  async openCart() {
    await this.page.getByTestId('cart-button').click()
  }

  async openCategory(name) {
    await this.page.getByTestId('category-menu').click()
    await this.page.getByRole('button', { name, exact: true }).click()
  }
}

export class CartPage {
  constructor(page) {
    this.page = page
  }

  get item() {
    return this.page.getByTestId('cart-item').first()
  }

  async quantity() {
    return this.item.locator('.cart-item-qty span').innerText()
  }

  async increase() {
    await this.item.getByTestId('cart-increase').click()
  }

  async remove() {
    await this.item.getByTestId('cart-remove').click()
  }
}

export class CheckoutPage {
  constructor(page) {
    this.page = page
  }

  async openWith(product) {
    await this.page.goto('/')
    await this.page.evaluate(({ product }) => {
      localStorage.setItem('cart', JSON.stringify([{ ...product, cantidad: 1 }]))
      localStorage.setItem('orderInfo', JSON.stringify({
        nombre: 'Cliente Playwright',
        correo: 'playwright@example.com',
        telefono: '55555555',
        direccion: 'Dirección de prueba E2E',
        nota: ''
      }))
    }, { product })
    await this.page.goto('/pago')
    await this.page.getByTestId('checkout-items').waitFor()
  }
}
