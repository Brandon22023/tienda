const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const test = require('node:test')
const { Builder, By, until } = require('../../frontend/node_modules/selenium-webdriver')
const chrome = require('../../frontend/node_modules/selenium-webdriver/chrome')
const { visible, HomePage, CartPage, LoginPage, CheckoutPage } = require('./pages/store.pages')

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173'
const API_URL = process.env.SELENIUM_API_URL || 'http://127.0.0.1:8000'
const RESULTS_DIR = path.resolve(__dirname, 'results')

async function createDriver() {
  const options = new chrome.Options()
    .addArguments('--headless=new', '--window-size=1440,900', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage')

  return new Builder().forBrowser('chrome').setChromeOptions(options).build()
}

async function runScenario(name, scenario) {
  const driver = await createDriver()
  try {
    await scenario(driver)
  } catch (error) {
    await fs.mkdir(RESULTS_DIR, { recursive: true })
    await fs.writeFile(path.join(RESULTS_DIR, `${name}.png`), await driver.takeScreenshot(), 'base64')
    throw error
  } finally {
    await driver.quit()
  }
}

test('Selenium: muestra productos disponibles en el inicio', async () => {
  await runScenario('home-products', async driver => {
    const home = new HomePage(driver, BASE_URL)
    await home.open()
    assert.ok((await home.firstProductName()).length > 0)
  })
})

test('Selenium: navega del menú a una categoría', async () => {
  await runScenario('category-navigation', async driver => {
    const home = new HomePage(driver, BASE_URL)
    await home.open()
    await home.openCategories()
    await home.openCategory('Laptops')
    await driver.wait(until.urlContains('/laptops'), 10000)
    assert.match(await driver.getCurrentUrl(), /\/laptops$/)
  })
})

test('Selenium: agrega, incrementa y elimina un artículo del carrito', async () => {
  await runScenario('cart-flow', async driver => {
    const home = new HomePage(driver, BASE_URL)
    const cart = new CartPage(driver)
    await home.open()
    await home.addFirstProduct()
    await home.openCart()
    assert.equal(await (await cart.quantity()).getText(), '1')
    await cart.increase()
    await driver.wait(async () => await (await cart.quantity()).getText() === '2', 10000)
    const item = await cart.remove()
    await driver.wait(until.stalenessOf(item), 10000)
    assert.equal((await driver.findElements(By.css('[data-testid="cart-item"]'))).length, 0)
  })
})

test('Selenium: muestra un error al usar credenciales inválidas', async () => {
  await runScenario('invalid-login', async driver => {
    const login = new LoginPage(driver, BASE_URL)
    await login.open()
    await login.login('selenium-invalid@example.com', 'wrong-password')
    const error = await visible(driver, By.css('form p'))
    assert.ok((await error.getText()).length > 0)
  })
})

test('Selenium: muestra el artículo en el resumen de pago', async () => {
  await runScenario('checkout-summary', async driver => {
    const response = await fetch(`${API_URL}/api/inicio`)
    assert.equal(response.ok, true)
    const payload = await response.json()
    const product = payload.productos?.[0]
    assert.ok(product)

    const checkout = new CheckoutPage(driver, BASE_URL)
    await checkout.openWith(product)
    const itemText = await checkout.itemText()
    assert.match(itemText, new RegExp(product.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(itemText, /Cantidad:\s*1/)
    assert.ok((await driver.findElement(By.css('.checkout-total')).getText()).includes('Total'))
  })
})
