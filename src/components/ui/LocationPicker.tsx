'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'

export interface LocationValue {
  name: string
  address: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: LocationValue
  onChange: (v: LocationValue) => void
}

// Cabo Frio default center
const DEFAULT_LAT = -22.8789
const DEFAULT_LNG = -42.0186

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [search,      setSearch]      = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [searching,   setSearching]   = useState(false)

  /* ── Init Leaflet ──────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined' || mapObj.current) return

    // Dynamic import to avoid SSR crash (Leaflet uses `window`)
    import('leaflet').then(L => {
      // Fix default marker icons (Leaflet CDN issue in bundlers)
      ;(L.Icon.Default.prototype as any)._getIconUrl = undefined
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const lat = value.lat || DEFAULT_LAT
      const lng = value.lng || DEFAULT_LNG

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([lat, lng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map)

      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        const addr = await reverseGeocode(pos.lat, pos.lng)
        onChange({ ...value, lat: pos.lat, lng: pos.lng, address: addr || value.address })
      })

      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng)
        const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng)
        onChange({ ...value, lat: e.latlng.lat, lng: e.latlng.lng, address: addr || value.address })
      })

      mapObj.current    = map
      markerRef.current = marker
    })

    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current    = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Sync marker when value changes externally ─────────────── */
  useEffect(() => {
    if (!markerRef.current || !mapObj.current) return
    if (!value.lat || !value.lng) return
    markerRef.current.setLatLng([value.lat, value.lng])
    mapObj.current.setView([value.lat, value.lng], 15)
  }, [value.lat, value.lng])

  /* ── Nominatim geocoding helpers ───────────────────────────── */
  async function geocodeSearch(q: string): Promise<any[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}&countrycodes=br`
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
    return res.ok ? res.json() : []
  }

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
    if (!res.ok) return ''
    const d = await res.json()
    return d.display_name || ''
  }

  /* ── Search handler ────────────────────────────────────────── */
  async function handleSearch() {
    if (!search.trim()) return
    setSearching(true)
    const results = await geocodeSearch(search)
    setSuggestions(results)
    setSearching(false)
  }

  function selectSuggestion(place: any) {
    const lat = parseFloat(place.lat)
    const lng = parseFloat(place.lon)
    const address = place.display_name

    onChange({ ...value, lat, lng, address })
    setSuggestions([])
    setSearch('')
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors bg-white'

  return (
    <div className="space-y-4">

      {/* Name field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nome do local de embarque
        </label>
        <input
          type="text"
          placeholder="Ex: Marina Pier 98, Píer do Centro..."
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Address search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Buscar endereço no mapa
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o endereço ou nome do local..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex-shrink-0 px-4 py-2.5 bg-[#0a2540] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3060] transition-colors disabled:opacity-50"
          >
            {searching ? '...' : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 relative">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <p className="font-medium text-[#0a2540] truncate">{s.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-400 truncate">{s.display_name}</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSuggestions([])}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 z-0"
          style={{ minHeight: 256 }}
        />
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-gray-500 shadow-sm pointer-events-none">
          <MapPin className="w-3 h-3 inline mr-1 text-[#00b4d8]" />
          Clique no mapa ou arraste o marcador para ajustar a posição
        </div>
      </div>

      {/* Selected address display */}
      {value.address && (
        <div className="flex items-start gap-2 p-3 bg-[#00b4d8]/5 border border-[#00b4d8]/20 rounded-xl">
          <MapPin className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0a2540] mb-0.5">Endereço selecionado</p>
            <p className="text-xs text-gray-500 break-words">{value.address}</p>
            {value.lat ? (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
