'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Share2,
  Image as ImageIcon,
  Play,
  FileText,
  Music,
} from 'lucide-react'

export interface GalleryImage {
  id?: string
  url: string
  caption?: string | null
  type?: 'photo' | 'video' | 'audio' | 'document'
  thumbnailUrl?: string
  uploadedAt?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  layout?: 'grid' | 'carousel' | 'hero'
  maxPreview?: number
  size?: 'sm' | 'md' | 'lg'
  showCaption?: boolean
  className?: string
}

// ─── Lightbox Component ────────────────────────────────────────────

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryImage[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)

  const goNext = useCallback(() => {
    setZoomed(false)
    setCurrentIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setZoomed(false)
    setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const current = images[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white/80">
        <ImageIcon className="h-4 w-4" />
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'video' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
              <Play className="h-12 w-12 text-white" />
            </div>
            <p className="text-white/80 text-sm">Video evidence</p>
          </div>
        ) : current.type === 'audio' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
              <Music className="h-12 w-12 text-white" />
            </div>
            <p className="text-white/80 text-sm">Audio evidence</p>
          </div>
        ) : current.type === 'document' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <p className="text-white/80 text-sm">Document evidence</p>
          </div>
        ) : (
          <motion.img
            key={current.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoomed ? 1.8 : 1 }}
            transition={{ duration: 0.25 }}
            src={current.url}
            alt={current.caption || 'Image'}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={() => setZoomed(!zoomed)}
            style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
          />
        )}
      </div>

      {/* Caption Bar */}
      {current.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
          <p className="text-center text-sm text-white/90">{current.caption}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed) }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Download"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4" />
        </a>
        <button
          onClick={(e) => { e.stopPropagation() }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setZoomed(false) }}
              className={`h-10 w-10 rounded-md overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt={img.caption || ''}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard navigation */}
      <div className="sr-only">
        <button onClick={goPrev}>Previous</button>
        <button onClick={goNext}>Next</button>
      </div>
    </motion.div>
  )
}

// ─── ImageGallery Main Component ───────────────────────────────────

export function ImageGallery({
  images,
  layout = 'grid',
  maxPreview = 6,
  size = 'md',
  showCaption = true,
  className = '',
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!images || images.length === 0) return null

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24 sm:h-32 sm:w-32',
    lg: 'h-36 w-36 sm:h-48 sm:w-48',
  }

  const previewImages = images.slice(0, maxPreview)
  const remainingCount = images.length - maxPreview

  // ─── Hero Layout ───────────────────────────────────────────────
  if (layout === 'hero' && images.length > 0) {
    return (
      <div className={className}>
        <div
          className="relative overflow-hidden rounded-xl cursor-zoom-in group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0].url}
            alt={images[0].caption || 'Image'}
            className="w-full h-48 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
              <ImageIcon className="h-3 w-3" />
              {images.length} photos
            </div>
          )}
          {images[0].caption && showCaption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-xs text-white/90 truncate">{images[0].caption}</p>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
            {images.slice(1, 5).map((img, idx) => (
              <div
                key={img.id || idx}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                onClick={() => openLightbox(idx + 1)}
              >
                <img src={img.thumbnailUrl || img.url} alt={img.caption || ''} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {lightboxOpen && (
          <AnimatePresence>
            <Lightbox
              images={images}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          </AnimatePresence>
        )}
      </div>
    )
  }

  // ─── Carousel Layout ───────────────────────────────────────────
  if (layout === 'carousel') {
    return (
      <div className={className}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {previewImages.map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative shrink-0 overflow-hidden rounded-xl cursor-pointer group"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt={img.caption || ''}
                className={`${sizeClasses[size]} object-cover transition-transform duration-200 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {img.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
                    <Play className="h-4 w-4" />
                  </div>
                </div>
              )}
              {remainingCount > 0 && idx === maxPreview - 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-semibold">
                  +{remainingCount} more
                </div>
              )}
            </div>
          ))}
        </div>

        {lightboxOpen && (
          <AnimatePresence>
            <Lightbox
              images={images}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          </AnimatePresence>
        )}
      </div>
    )
  }

  // ─── Grid Layout (default) ────────────────────────────────────
  const gridCols = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={className}>
      <div className={`grid ${gridCols} gap-1.5`}>
        {previewImages.map((img, idx) => (
          <div
            key={img.id || idx}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
              images.length === 1 ? 'col-span-3' : ''
            }`}
            onClick={() => openLightbox(idx)}
          >
            <img
              src={img.thumbnailUrl || img.url}
              alt={img.caption || ''}
              className={`w-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                size === 'sm' ? 'h-16' : size === 'lg' ? 'h-48' : 'h-28 sm:h-36'
              } ${images.length === 1 ? 'h-40 sm:h-56' : ''}`}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            {/* Video overlay */}
            {img.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
                  <Play className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Remaining count overlay */}
            {remainingCount > 0 && idx === maxPreview - 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center">
                  <span className="text-2xl font-bold">+{remainingCount}</span>
                  <p className="text-[10px] opacity-80">more photos</p>
                </div>
              </div>
            )}

            {/* Caption on hover */}
            {img.caption && showCaption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <AnimatePresence>
          <Lightbox
            images={images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        </AnimatePresence>
      )}
    </div>
  )
}

// ─── Compact Image Thumbnail for Cards ────────────────────────────

export function ImageThumbnail({
  images,
  className = '',
}: {
  images: GalleryImage[]
  className?: string
}) {
  if (!images || images.length === 0) return null

  const first = images[0]

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={first.thumbnailUrl || first.url}
        alt={first.caption || ''}
        className="h-full w-full object-cover rounded-lg"
      />
      {images.length > 1 && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white shadow-sm">
          {images.length}
        </div>
      )}
    </div>
  )
}
