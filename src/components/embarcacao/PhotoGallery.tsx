'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react'

interface PhotoGalleryProps {
  photos: string[]
  name: string
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const mainPhoto = photos[0]
  const sidePhotos = photos.slice(1, 5)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto = () => setLightboxIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : 0)
  const nextPhoto = () => setLightboxIndex(i => i !== null ? (i + 1) % photos.length : 0)

  return (
    <>
      {/* Grid de fotos */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
        {/* Foto principal */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={mainPhoto}
            alt={`${name} - foto principal`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Fotos secundárias */}
        {sidePhotos.map((photo, index) => (
          <div
            key={index}
            className="relative cursor-pointer overflow-hidden group"
            onClick={() => openLightbox(index + 1)}
          >
            <img
              src={photo}
              alt={`${name} - foto ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay "Ver todas" na última foto */}
            {index === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <Grid3X3 className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">+{photos.length - 5} fotos</span>
              </div>
            )}
          </div>
        ))}

        {/* Preencher espaços vazios se tiver menos de 5 fotos */}
        {sidePhotos.length < 4 && Array.from({ length: 4 - sidePhotos.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-100" />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <img
            src={photos[lightboxIndex]}
            alt={`${name} - foto ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
