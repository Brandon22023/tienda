import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

vi.mock('./lib/api.js', () => ({
  apiUrl: (path) => `http://test.local${path}`
}))

describe('App', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn(async (input) => {
      if (String(input).includes('/api/inicio')) {
        return {
          ok: true,
          json: async () => ({
            mensaje: { titulo: 'Articulos que te pueden interesar' },
            productos: [
              {
                idproductos: 1,
                nombre: 'Laptop Demo',
                categoria: 'Laptops',
                precio: 1234.5,
                image_url: 'https://example.com/laptop.jpg'
              }
            ]
          })
        }
      }
      throw new Error(`Unexpected fetch: ${input}`)
    })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza productos desde la API', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const productosRenderizados = await screen.findAllByText('Laptop Demo')
    expect(productosRenderizados.length).toBeGreaterThan(0)
    expect(screen.getByText('Laptops')).toBeInTheDocument()
    expect(screen.getByText('Q 1234.50')).toBeInTheDocument()
  })

  it('actualiza el contador del carrito al agregar un producto', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await screen.findAllByText('Laptop Demo')

    const addButtons = screen.getAllByRole('button', { name: /agregar al carrito/i })
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(container.querySelector('.cart-badge')?.textContent).toBe('1')
    })
  })

  it('navega a la vista del carrito al pulsar el botón del carrito', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await screen.findAllByText('Laptop Demo')

    container.querySelector('.cart-btn')?.click()

    expect(await screen.findByText('Mi Carrito')).toBeInTheDocument()
  })
})