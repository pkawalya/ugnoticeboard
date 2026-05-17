'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  uploading?: boolean
  className?: string
}

export function ImageUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  accept = 'image/*',
  uploading = false,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      setError(null)

      const fileArray = Array.from(files)

      // Validate count
      if (fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate size
      const oversized = fileArray.find((f) => f.size > maxSize * 1024 * 1024)
      if (oversized) {
        setError(`File "${oversized.name}" exceeds ${maxSize}MB limit`)
        return
      }

      // Validate type
      const invalidType = fileArray.find((f) => !f.type.startsWith('image/'))
      if (invalidType) {
        setError(`File "${invalidType.name}" is not an image`)
        return
      }

      // Generate previews
      const newPreviews: string[] = []
      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string)
            if (newPreviews.length === fileArray.length) {
              setPreview((prev) => [...prev, ...newPreviews])
            }
          }
        }
        reader.readAsDataURL(file)
      })

      onUpload(fileArray)
    },
    [maxFiles, maxSize, onUpload]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removePreview = (index: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-green-400 bg-green-50/50 scale-[1.01]'
            : 'border-border/50 hover:border-green-300 hover:bg-green-50/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center py-6 px-4">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-2" />
              <p className="text-sm font-medium text-green-700">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-6 w-6 text-green-500" />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drop photos here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Up to {maxFiles} images, {maxSize}MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Previews */}
      {preview.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {preview.map((src, idx) => (
            <div key={idx} className="relative shrink-0 group">
              <img
                src={src}
                alt={`Preview ${idx + 1}`}
                className="h-16 w-16 rounded-lg object-cover border border-border/50"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removePreview(idx)
                }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
