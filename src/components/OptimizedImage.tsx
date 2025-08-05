import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  // Extract file extension and create optimized paths
  const ext = src.split('.').pop()?.toLowerCase();
  const basePath = src.slice(0, -(ext?.length || 0) - 1);
  
  // Define responsive breakpoints
  const breakpoints = [320, 640, 960, 1280, 1920];
  
  // Generate srcSet for each format
  const generateSrcSet = (format: string) => {
    return breakpoints
      .map(size => `${basePath}-${size}w.${format} ${size}w`)
      .join(', ');
  };
  
  // Fallback to original if optimized versions don't exist
  const fallbackSrc = `${basePath}-optimized.${ext}`;
  
  return (
    <picture>
      {/* AVIF format (most efficient) */}
      <source
        srcSet={generateSrcSet('avif')}
        sizes={sizes}
        type="image/avif"
      />
      
      {/* WebP format (widely supported) */}
      <source
        srcSet={generateSrcSet('webp')}
        sizes={sizes}
        type="image/webp"
      />
      
      {/* Fallback to optimized original format */}
      <source
        srcSet={generateSrcSet(ext || 'png')}
        sizes={sizes}
        type={`image/${ext === 'jpg' ? 'jpeg' : ext}`}
      />
      
      {/* Final fallback image */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : loading}
        decoding="async"
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </picture>
  );
}