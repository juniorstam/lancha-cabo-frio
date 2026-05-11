'use client'

interface MapEmbedProps {
  lat: number
  lng: number
  name: string
  address?: string
  zoom?: number
  className?: string
}

export function MapEmbed({ lat, lng, name, address, zoom = 15, className = '' }: MapEmbedProps) {
  const query = encodeURIComponent(`${name}${address ? ', ' + address : ''}`)
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&hl=pt-BR`

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
      <iframe
        src={src}
        title={`Localização: ${name}`}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {/* Badge sobreposto */}
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
          <span className="text-base">⚓</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0a2540] truncate">{name}</p>
            {address && (
              <p className="text-[11px] text-gray-400 truncate">{address}</p>
            )}
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto ml-2 text-[11px] font-semibold text-[#00b4d8] whitespace-nowrap hover:underline"
          >
            Ver no Maps ↗
          </a>
        </div>
      </div>
    </div>
  )
}
