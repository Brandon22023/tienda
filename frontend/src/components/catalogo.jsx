
import React, { useState, useMemo, useEffect, useRef } from 'react'
import './catalogo.css'

export default function Catalogo({ open = false, categorias = [], onSelect = () => {} }) {
  const defaultCats = [
    { id: 'ram', nombre: 'Memoria Ram', descripcion: 'Módulos DDR4 / DDR5', color: '#6f9cff', icon: '⚡' },
    { id: 'laptops', nombre: 'Laptops', descripcion: 'Ultrabooks y gamers', color: '#ff9f6f', icon: '💻' },
    { id: 'perifericos', nombre: 'Periféricos', descripcion: 'Teclados, mice y más', color: '#8be3c3', icon: '⌨️' },
    { id: 'monitores', nombre: 'Monitores', descripcion: '144Hz, 4K y curvos', color: '#c58bff', icon: '🖥️' },
    { id: 'almacenamiento', nombre: 'Almacenamiento', descripcion: 'SSD, HDD y NVMe', color: '#ffd36f', icon: '💾' },
    { id: 'audio', nombre: 'Audio', descripcion: 'Auriculares y parlantes', color: '#7fdcff', icon: '🎧' },
    { id: 'juegos', nombre: 'Videojuegos', descripcion: 'Consolas y accesorios', color: '#ff7fb6', icon: '🎮' },
  ]

  
  // Normaliza la prop "categorias": permite que el padre envíe strings o objetos completos
  const source = useMemo(() => {
    if (!categorias || categorias.length === 0) return defaultCats
    return categorias.map(c => {
      if (typeof c === 'string') {
        return defaultCats.find(d => d.nombre === c) ?? { id: c, nombre: c, descripcion: '', color: '#ddd', icon: '📦' }
      }
      return c
    })
  }, [categorias])
  // Estado local: texto de búsqueda dentro del panel
  const [q, setQ] = useState('')
  // Referencia al input para dar foco al abrir
  const inputRef = useRef(null)

  // Cuando se abre el panel, damos foco al input; al cerrar limpiamos la búsqueda
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQ('')
    }
    
  }, [open])
  useEffect(() => {
    if (!open) {
      // Si el panel se cierra, quita el foco del elemento activo
      if (document.activeElement && document.activeElement.classList.contains('catalogo-card')) {
        document.activeElement.blur();
      }
    }
  }, [open]);
  
  // Lista filtrada por texto (nombre o descripción)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return source.filter(c => !s || c.nombre.toLowerCase().includes(s) || c.descripcion.toLowerCase().includes(s))
  }, [source, q])

  return open ? (
    <div className={`catalogo-dropdown-wrap ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="catalogo-panel">
        <div className="catalogo-head">
          <div className="title">Catálogo</div>
          <input
            ref={inputRef}
            className="catalogo-search"
            placeholder="Buscar categorías..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar categorías"
          />
        </div>

        <div className="catalogo-grid">
          {filtered.map(cat => (
            // Cada tarjeta es un botón accesible; onSelect delega la acción al padre
            <button
              key={cat.id}
              className="catalogo-card"
              onClick={() => onSelect(cat.nombre)}
              type="button"
            >
              <div className="card-left">
                {/* Icono circular con degradado generado desde cat.color */}
                <div className="card-icon" style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}88)` }}>
                  <span className="emoji">{cat.icon}</span>
                </div>
                <div className="card-txt">
                  <div className="card-name">{cat.nombre}</div>
                  <div className="card-desc">{cat.descripcion}</div>
                </div>
              </div>
              <div className="card-arrow">›</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="catalogo-empty">No se encontraron categorías</div>}
        </div>
      </div>
    </div>
  ): null;
}
