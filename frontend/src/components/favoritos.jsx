import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../lib/api.js'
import { getFavoriteIds, toggleFavorite } from '../lib/favorites.js'

export default function Favoritos() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(getFavoriteIds())
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(apiUrl('/api/catalogo'))
      .then(response => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar el catálogo.')))
      .then(data => setProducts(Array.isArray(data.productos) ? data.productos : []))
      .catch(reason => setError(reason.message))
  }, [])

  function addToCart(product) {
    const raw = localStorage.getItem('cart')
    const cart = raw ? JSON.parse(raw) : []
    const current = cart.find(item => item.idproductos === product.idproductos)
    if (current) current.cantidad = Number(current.cantidad || 0) + 1
    else cart.push({ ...product, cantidad: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const favorites = products.filter(product => favoriteIds.includes(Number(product.idproductos)))

  return (
    <main className="favorites-page" style={{ padding: '2rem' }}>
      <button className="btn-link" onClick={() => navigate('/')}>Volver al inicio</button>
      <h2>Favoritos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && favorites.length === 0 && <p>No tienes productos favoritos todavía.</p>}
      <div className="inicio-grid">
        {favorites.map(product => (
          <article key={product.idproductos} className="producto-card" data-testid="favorite-card">
            <img src={product.image_url} alt={product.nombre} />
            <div className="producto-info">
              <div className="producto-nombre">{product.nombre}</div>
              <div className="producto-precio">Q {Number(product.precio).toFixed(2)}</div>
              <button className="favorite-btn" onClick={() => setFavoriteIds(toggleFavorite(product.idproductos))}>Quitar de favoritos</button>
              <button className="producto-add" onClick={() => addToCart(product)}>Agregar al carrito</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
