beforeEach(() => {
  cy.clearLocalStorage()
})

Cypress.Commands.add('setCheckoutState', ({ product, orderInfo = {} }) => {
  cy.window().then(window => {
    window.localStorage.setItem('cart', JSON.stringify([{ ...product, cantidad: 1 }]))
    window.localStorage.setItem('orderInfo', JSON.stringify({
      nombre: 'Cliente Cypress',
      correo: 'cypress@example.com',
      telefono: '55555555',
      direccion: 'Dirección de prueba Cypress',
      nota: '',
      ...orderInfo
    }))
  })
})
