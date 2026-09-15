describe('Carrito - Cypress', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('agrega un producto y actualiza la cantidad', () => {
    cy.get('[data-testid="home-add-to-cart"]').first().click()
    cy.get('[data-testid="cart-button"]').click()
    cy.get('[data-testid="cart-item"]').should('have.length', 1)
    cy.get('[data-testid="cart-item"]').find('.cart-item-qty span').should('have.text', '1')
    cy.get('[data-testid="cart-increase"]').click()
    cy.get('[data-testid="cart-item"]').find('.cart-item-qty span').should('have.text', '2')
  })

  it('elimina un producto y muestra el estado vacío', () => {
    cy.get('[data-testid="home-add-to-cart"]').first().click()
    cy.get('[data-testid="cart-button"]').click()
    cy.get('[data-testid="cart-remove"]').click()
    cy.contains('Tu carrito se siente solo').should('be.visible')
  })

  it('rechaza un pedido sin artículos', () => {
    cy.request({
      method: 'POST',
      url: '/api/pedidos',
      headers: {
        Accept: 'application/json'
      },
      body: { cliente_id: null, items: [] },
      failOnStatusCode: false
    }).its('status').should('eq', 422)
  })
})
