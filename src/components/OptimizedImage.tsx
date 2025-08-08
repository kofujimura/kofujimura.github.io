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
  sizes = '(max-width: 768px) 100vw, 800px',
  className = '',
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  // Extract file extension and create optimized paths
  const ext = src.split('.').pop()?.toLowerCase();
  const basePath = src.slice(0, -(ext?.length || 0) - 1);
  
  // Complete set of responsive breakpoints
  const safeBreakpoints = [320, 640, 960, 1280];
  
  // Generate srcSet only for sizes that should exist
  const generateSrcSet = (format: string) => {
    return safeBreakpoints
      .map(size => `${basePath}-${size}w.${format} ${size}w`)
      .join(', ');
  };
  
  // Check if we're dealing with images in /images/ directory (should have optimized versions)
  // vs wp-content/uploads (older images that use original files)
  const isNewImage = src.startsWith('/images/');
  
  
  // For old images, just return simple img tag to avoid 404s on optimized versions
  if (!isNewImage) {
    return (
      <img
        src={src}
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
    );
  }

  return (
    <picture>
      {/* AVIF format (most efficient) - only for new images */}
      <source
        srcSet={generateSrcSet('avif')}
        sizes={sizes}
        type="image/avif"
      />
      
      {/* WebP format (widely supported) - only for new images */}
      <source
        srcSet={generateSrcSet('webp')}
        sizes={sizes}
        type="image/webp"
      />
      
      {/* Always fallback to original image to prevent 404s */}
      <img
        src={src}
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