describe('Checkout - Cypress', () => {
  it('muestra todos los artículos y el total del pedido', () => {
    cy.request('/api/inicio').then(({ body }) => {
      const product = body.productos?.[0]
      expect(product, 'producto sembrado').to.exist

      cy.visit('/')
      cy.setCheckoutState({ product })
      cy.visit('/pago')
      cy.get('[data-testid="checkout-items"]').should('be.visible')
      cy.get('[data-testid="checkout-item"]').should('contain', product.nombre)
      cy.get('[data-testid="checkout-item"]').should('contain', 'Cantidad: 1')
      cy.contains('Total del pedido').should('be.visible')
    })
  })

  it('valida los datos de tarjeta antes de enviar', () => {
    cy.request('/api/inicio').then(({ body }) => {
      cy.visit('/')
      cy.setCheckoutState({ product: body.productos[0] })
      cy.visit('/pago')
      cy.contains('button', 'Pagar con tarjeta').click()
      cy.get('[data-testid="payment-submit"]').click()
      cy.contains('Nombre en la tarjeta es requerido.').should('be.visible')
    })
  })
})
