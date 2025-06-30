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
          // URLs are already absolute from the XML data
          return `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;" />`;
        }

        // Handle relative URLs (for GitHub Pages)
        if (src.startsWith('/')) {
          return `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;" />`;
        }

        // Handle external URLs
        return `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="max-width: 100%; height: auto;" />`;
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

export function extractYouTubeId(url: string): string | null {
  // Extract YouTube video ID from various URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function processYouTubeLinks(content: string): string {
  // Replace YouTube embeds with thumbnail previews
  return content.replace(
    /<div class="embed-container"><a href="([^"]*youtube[^"]*)"[^>]*>([^<]*)<\/a><\/div>/gi,
    (match, url) => {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return match; // Return original if we can't extract ID
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const thumbnailUrlHQ = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      return `
        <div class="youtube-preview" style="position: relative; max-width: 100%; margin: 1.5rem 0;">
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none;">
            <div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000; border-radius: 8px; overflow: hidden;">
              <img 
                src="${thumbnailUrlHQ}" 
                alt="YouTube video thumbnail" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                loading="lazy"
                onError="this.src='${thumbnailUrl}'"
              />
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; background: rgba(255,0,0,0.8); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </a>
        </div>
      `;
    }
  );
}