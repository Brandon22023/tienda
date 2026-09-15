const FAVORITES_KEY = 'favorite_product_ids'

export function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids.map(Number) : []
  } catch {
    return []
  }
}

export function toggleFavorite(id) {
  const numericId = Number(id)
  const ids = getFavoriteIds()
  const next = ids.includes(numericId)
    ? ids.filter(value => value !== numericId)
    : [...ids, numericId]
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('favorites-updated'))
  return next
}
