'use client'

import { useState, useEffect, useRef } from 'react'

const FALLBACK = '/images/news.webp'

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function FallbackImage({ src, alt, ...props }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK)
  const imgRef = useRef<HTMLImageElement>(null)

  // Sinkronisasi state jika prop src berubah
  useEffect(() => {
    setImgSrc(src || FALLBACK)
  }, [src])

  // Gambar bisa gagal dimuat SEBELUM hydration (event error terlewat saat refresh).
  // Cek manual setelah mount.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) {
      setImgSrc(FALLBACK)
    }
  }, [])

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      {...props}
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK)
      }}
    />
  )
}
