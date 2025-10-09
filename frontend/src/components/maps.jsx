import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MAPASENPEDIDOS({ value, onChange, placeholder = 'Buscar dirección...' }) {
  const mapEl = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const [query, setQuery] = useState(value?.address || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // inject minimal CSS here (file doesn't have separate css)
  useEffect(() => {
    const css = `
      /* estilo para parecer más moderno (tipo Google-ish) */
      .leaflet-container { border-radius: 10px; box-shadow: 0 8px 30px rgba(12,20,36,0.06); }
      .leaflet-control-zoom a{
        background:#fff;
        border-radius:8px;
        box-shadow:0 8px 20px rgba(16,24,40,0.08);
        color:#2b3b52;
        width:36px;
        height:36px;
        line-height:36px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
      }
      .leaflet-control-zoom a.leaflet-disabled { opacity:0.45; }
      .leaflet-control-attribution{ font-size:11px; opacity:0.8; }
      /* search dropdown */
      .maps-search-results {
        position: absolute;
        top: 46px;
        left: 0;
        right: 0;
        z-index: 1400;
        background: #fff;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 8px;
        max-height: 260px;
        overflow: auto;
        padding: 6px;
        list-style: none;
        box-shadow: 0 8px 40px rgba(12,20,36,0.08);
      }
      .maps-search-results li{ padding: 10px 8px; cursor:pointer; border-radius:6px; }
      .maps-search-results li:hover{ background:#f6f9ff; }
      .maps-input-wrap { position:relative; display:flex; gap:8px; }
      .maps-mi-ubicacion-btn{ border:1px solid rgba(75,112,207,0.12); background:#fff; color:var(--accent-1); padding:8px 12px; border-radius:10px; cursor:pointer; }
      @media (max-width:720px){
        .maps-search-results{ top:54px; }
      }
    `
    const style = document.createElement('style')
    style.setAttribute('data-maps-styles', '1')
    style.innerHTML = css
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // init map once
    if (mapInstance.current || !mapEl.current) return
    mapInstance.current = L.map(mapEl.current, {
      center: [14.624, -90.532], // centro por defecto (Guatemala). Cambia si quieres.
      zoom: 13,
      attributionControl: true
    })

    // tiles más limpios (Carto Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &amp; CARTO'
    }).addTo(mapInstance.current)

    // pin SVG moderno
    const pinSvg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24">
        <path fill="#d9534f" stroke="#b33" stroke-width="0.5" d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="#fff"/>
      </svg>
    `)
    const pinIcon = L.icon({
      iconUrl: 'data:image/svg+xml;charset=utf-8,' + pinSvg,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -46]
    })

    const mk = L.marker(mapInstance.current.getCenter(), { draggable: true, icon: pinIcon }).addTo(mapInstance.current)
    markerRef.current = mk

    mk.on('dragend', async () => {
      const p = mk.getLatLng()
      const info = await reverseGeocode(p.lat, p.lng)
      const address = info?.display_name || ''
      setQuery(address)
      onChange && onChange({ address, lat: p.lat, lng: p.lng, source: 'nominatim' })
    })

    mapInstance.current.on('click', async (ev) => {
      const { lat, lng } = ev.latlng
      markerRef.current.setLatLng([lat, lng])
      const info = await reverseGeocode(lat, lng)
      const address = info?.display_name || ''
      setQuery(address)
      onChange && onChange({ address, lat, lng, source: 'nominatim' })
    })

    // si hay value inicial con coords
    if (value && (value.lat || value.lng)) {
      const lat = Number(value.lat)
      const lng = Number(value.lng)
      mapInstance.current.setView([lat, lng], 15)
      markerRef.current.setLatLng([lat, lng])
      if (value.address) setQuery(value.address)
    }
  }, []) // eslint-disable-line

  async function searchNominatim(q) {
    if (!q || q.length < 3) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      // añade param email opcional para identificar peticiones según política Nominatim
      const emailParam = encodeURIComponent(window.NOMINATIM_EMAIL || '')
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=6${emailParam ? '&email=' + emailParam : ''}`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      const json = await res.json()
      setResults(json || [])
    } catch (e) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function reverseGeocode(lat, lon) {
    try {
      const emailParam = encodeURIComponent(window.NOMINATIM_EMAIL || '')
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1${emailParam ? '&email=' + emailParam : ''}`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      return await res.json()
    } catch (e) {
      return null
    }
  }

  // debounce simple
  useEffect(() => {
    const t = setTimeout(() => {
      searchNominatim(query)
    }, 400) // slightly larger debounce to be kinder with public Nominatim
    return () => clearTimeout(t)
  }, [query])

  function chooseResult(item) {
    const lat = Number(item.lat)
    const lng = Number(item.lon)
    mapInstance.current.setView([lat, lng], 16)
    markerRef.current.setLatLng([lat, lng])
    setQuery(item.display_name)
    setResults([])
    onChange && onChange({ address: item.display_name, lat, lng, place: item })
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="maps-input-wrap">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="maps-mi-ubicacion-btn"
          onClick={() => {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(async (pos) => {
              const lat = pos.coords.latitude
              const lng = pos.coords.longitude
              const accuracy = pos.coords.accuracy // metros

              // zoom alto para colocar el pin precisamente (ajusta si lo prefieres)
              const zoom = (typeof accuracy === 'number' && accuracy <= 10) ? 19 : 18
              mapInstance.current.setView([lat, lng], zoom)

              // colocar marcador EXACTO en las coordenadas recibidas
              markerRef.current.setLatLng([lat, lng])

              // mostrar zona de precisión (opcional) — se reemplaza si ya existe
              if (markerRef.current.accuracyCircle) {
                try { mapInstance.current.removeLayer(markerRef.current.accuracyCircle) } catch {}
              }
              try {
                const circle = L.circle([lat, lng], {
                  radius: accuracy || 8,
                  color: '#4b70cf',
                  weight: 1,
                  fillColor: 'rgba(75,112,207,0.08)'
                }).addTo(mapInstance.current)
                markerRef.current.accuracyCircle = circle
              } catch (e) { /* noop */ }

              // reverse geocode (puede devolver la dirección más cercana; las coords son exactas)
              const info = await reverseGeocode(lat, lng)
              const address = info?.display_name || ''

              setQuery(address)
              onChange && onChange({
                address,
                lat,
                lng,
                accuracy,           // agrego accuracy para que sepas cuán precisa fue la lectura
                source: 'geoloc'
              })
            }, (err) => {
              console.error('Geolocation error', err)
            }, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            })
          }}
        >
          Mi ubicación
        </button>

        {results.length > 0 && (
          <ul className="maps-search-results" role="listbox">
            {results.map(r => (
              <li key={r.place_id}
                  onClick={() => chooseResult(r)}
                  role="option"
                  aria-selected="false">
                <div style={{ fontSize: 13, color: '#222' }}>{r.display_name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={mapEl} style={{ width: '100%', height: 320 }} />
      {loading && <div style={{ fontSize: 13, color: '#666' }}>Buscando...</div>}
    </div>
  )
}