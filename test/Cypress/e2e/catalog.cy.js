describe('Catálogo - Cypress', () => {
  it('carga productos y consulta el contrato de catálogo', () => {
    cy.request('/api/catalogo').then(response => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('productos').and.be.an('array').and.not.be.empty
    })

    cy.visit('/')
    cy.get('[data-testid="home-product-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="home-add-to-cart"]').first().should('be.visible')
  })

  it('navega a la categoría de laptops', () => {
    cy.visit('/')
    cy.get('[data-testid="category-menu"]').click()
    cy.contains('button', 'Laptops').click()
    cy.location('pathname').should('eq', '/laptops')
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
  })

  it('rechaza credenciales inválidas en la API', () => {
    cy.request({
      method: 'POST',
      url: '/api/login',
      body: { correo: 'cypress-invalid@example.com', password: 'wrong-password' },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(401)
      expect(response.body).to.have.property('message')
    })
  })
})
