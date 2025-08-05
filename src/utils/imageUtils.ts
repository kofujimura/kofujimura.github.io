// Image processing utilities for WordPress content migration

export function processWordPressImages(content: string): string {
  // Replace WordPress image URLs with optimized picture elements
  return content
    .replace(
      /<img([^>]*)\s+src="([^"]*)"([^>]*)>/gi,
      (match, beforeSrc, src, afterSrc) => {
        // Skip if already processed or if it's a data URL
        if (src.startsWith('data:') || src.startsWith('/_next/')) {
          return match;
        }

        // Generate optimized image markup
        return generateOptimizedImageMarkup(src, beforeSrc + afterSrc);
      }
    );
}

export function generateOptimizedImageMarkup(src: string, attributes: string = ''): string {
  // Extract file extension and create base path
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
  
  // Extract alt text from attributes if present
  const altMatch = attributes.match(/alt="([^"]*)"/i);
  const alt = altMatch ? altMatch[1] : '';
  
  // Extract class from attributes if present
  const classMatch = attributes.match(/class="([^"]*)"/i);
  const className = classMatch ? classMatch[1] : '';
  
  // Generate sizes attribute for responsive behavior
  const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  // Fallback to optimized original
  const fallbackSrc = `${basePath}-optimized.${ext}`;
  
  return `
    <picture>
      <source
        srcset="${generateSrcSet('avif')}"
        sizes="${sizes}"
        type="image/avif"
      />
      <source
        srcset="${generateSrcSet('webp')}"
        sizes="${sizes}"
        type="image/webp"
      />
      <source
        srcset="${generateSrcSet(ext || 'png')}"
        sizes="${sizes}"
        type="image/${ext === 'jpg' ? 'jpeg' : ext}"
      />
      <img
        src="${fallbackSrc}"
        alt="${alt}"
        class="${className}"
        loading="lazy"
        decoding="async"
        style="max-width: 100%; height: auto;"
      />
    </picture>
  `.trim();
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