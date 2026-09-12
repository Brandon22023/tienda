const { By, until } = require('../../../frontend/node_modules/selenium-webdriver')

const WAIT = 15000

async function visible(driver, locator, timeout = WAIT) {
  const element = await driver.wait(until.elementLocated(locator), timeout)
  await driver.wait(until.elementIsVisible(element), timeout)
  return element
}

class HomePage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl
  }

  async open() {
    await this.driver.get(`${this.baseUrl}/`)
    await visible(this.driver, By.css('[data-testid="home-product-card"]'))
  }

  async firstProductName() {
    const card = await visible(this.driver, By.css('[data-testid="home-product-card"]'))
    return (await card.getText()).split('\n')[0]
  }

  async addFirstProduct() {
    const card = await visible(this.driver, By.css('[data-testid="home-product-card"]'))
    await card.findElement(By.css('[data-testid="home-add-to-cart"]')).click()
  }

  async openCategories() {
    await visible(this.driver, By.css('[data-testid="category-menu"]')).then(button => button.click())
  }

  async openCategory(name) {
    await visible(this.driver, By.xpath(`//button[contains(normalize-space(.), "${name}")]`)).then(button => button.click())
  }

  async openCart() {
    await visible(this.driver, By.css('[data-testid="cart-button"]')).then(button => button.click())
  }
}

class CartPage {
  constructor(driver) {
    this.driver = driver
  }

  async waitForItem() {
    return visible(this.driver, By.css('[data-testid="cart-item"]'))
  }

  async quantity() {
    const item = await this.waitForItem()
    return item.findElement(By.css('.cart-item-qty span'))
  }

  async increase() {
    const item = await this.waitForItem()
    await item.findElement(By.css('[data-testid="cart-increase"]')).click()
  }

  async remove() {
    const item = await this.waitForItem()
    await item.findElement(By.css('[data-testid="cart-remove"]')).click()
    return item
  }
}

class LoginPage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl
  }

  async open() {
    await this.driver.get(`${this.baseUrl}/login`)
    await visible(this.driver, By.css('[data-testid="login-email"]'))
  }

  async login(email, password) {
    await visible(this.driver, By.css('[data-testid="login-email"]')).then(input => input.sendKeys(email))
    await visible(this.driver, By.css('[data-testid="login-password"]')).then(input => input.sendKeys(password))
    await visible(this.driver, By.css('[data-testid="login-submit"]')).then(button => button.click())
  }
}

class CheckoutPage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl
  }

  async openWith(product) {
    await this.driver.get(`${this.baseUrl}/`)
    await this.driver.executeScript(
      'localStorage.setItem("cart", arguments[0]); localStorage.setItem("orderInfo", arguments[1]);',
      JSON.stringify([{ ...product, cantidad: 1 }]),
      JSON.stringify({
        nombre: 'Cliente Selenium',
        correo: 'selenium@example.com',
        telefono: '55555555',
        direccion: 'Dirección de prueba Selenium',
        nota: ''
      })
    )
    await this.driver.get(`${this.baseUrl}/pago`)
    await visible(this.driver, By.css('[data-testid="checkout-items"]'))
  }

  async itemText() {
    return this.driver.findElement(By.css('[data-testid="checkout-item"]')).getText()
  }
}

module.exports = { visible, HomePage, CartPage, LoginPage, CheckoutPage }
