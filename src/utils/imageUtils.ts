// Image processing utilities for WordPress content migration

export function processWordPressImages(content: string): string {
  // Replace WordPress image URLs with Next.js Image optimization
  return content
    .replace(
      /<img([^>]*)\s+src="([^"]*)"([^>]*)>/gi,
      (match, beforeSrc, src, afterSrc) => {
        // Skip if already processed or if it's a data URL
        if (src.startsWith('data:') || src.startsWith('/_next/')) {
          return match;
        }

        // Handle WordPress uploads
        if (src.includes('wp-content/uploads/')) {
          // For now, keep original URLs but add loading optimization
          return `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;">`;
        }

        // Handle relative URLs
        if (src.startsWith('/')) {
          return `<img${beforeSrc} src="https://web.fujimura.com${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;">`;
        }

        // Handle external URLs
        return `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;">`;
      }
    );
}

export function extractImageUrls(content: string): string[] {
  const imageUrls: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]*)"[^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    imageUrls.push(match[1]);
  }

  return imageUrls;
}

export function optimizeImageUrl(url: string): string {
  // For production, you might want to use a CDN or image optimization service
  if (url.includes('web.fujimura.com')) {
    return url;
  }
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    return `https://web.fujimura.com${url}`;
  }
  
  return url;
}