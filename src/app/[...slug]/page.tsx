import { notFound } from 'next/navigation';
import pagesData from '@/data/pages.json';

interface Page {
  id: number;
  title: string;
  content: string;
  date: string;
  modified: string;
  slug: string;
  status: string;
  author: string;
  link: string;
}

const pages: Page[] = pagesData;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function parseWordPressContent(content: string): string {
  return content
    .replace(/<!-- wp:paragraph -->/g, '')
    .replace(/<!-- \/wp:paragraph -->/g, '')
    .replace(/<!-- wp:heading[^>]*>/g, '')
    .replace(/<!-- \/wp:heading -->/g, '')
    .replace(/<!-- wp:list -->/g, '')
    .replace(/<!-- \/wp:list -->/g, '')
    .replace(/<!-- wp:list-item -->/g, '')
    .replace(/<!-- \/wp:list-item -->/g, '');
}

function getSlugFromPath(slug: string[]): string {
  return slug.join('/');
}

export function generateStaticParams() {
  const params = pages
    .filter(page => page.status === 'publish')
    .map((page) => {
      const urlPath = page.link.replace('https://web.fujimura.com/', '');
      const pathParts = urlPath.split('/').filter(part => part);
      
      return {
        slug: pathParts.length > 0 ? pathParts : [page.slug],
      };
    })
    .filter(({ slug }) => {
      // Exclude image paths from static generation
      const path = slug.join('/');
      // More comprehensive image file exclusion
      const isImagePath = path.startsWith('images/') || 
                         path.includes('/images/') ||
                         path.match(/\.(avif|webp|png|jpe?g|gif|svg|ico|bmp|tiff?)$/i) ||
                         path.includes('-320w') ||
                         path.includes('-640w') ||
                         path.includes('-960w') ||
                         path.includes('-1280w') ||
                         path.includes('-optimized');
      
      return !isImagePath;
    });
  
  return params;
}

export default async function PageComponent({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const requestedSlug = getSlugFromPath(slug);
  
  // Reject image requests that somehow reach this route
  const isImageRequest = requestedSlug.startsWith('images/') || 
                        requestedSlug.includes('/images/') ||
                        requestedSlug.match(/\.(avif|webp|png|jpe?g|gif|svg|ico|bmp|tiff?)$/i) ||
                        requestedSlug.includes('-320w') ||
                        requestedSlug.includes('-640w') ||
                        requestedSlug.includes('-960w') ||
                        requestedSlug.includes('-1280w') ||
                        requestedSlug.includes('-optimized');
  
  if (isImageRequest) {
    notFound();
  }
  
  // Try to find page by slug first
  let page = pages.find((p) => p.slug === requestedSlug && p.status === 'publish');
  
  // If not found by slug, try to match by URL path
  if (!page) {
    page = pages.find((p) => {
      if (p.status !== 'publish') return false;
      const urlPath = p.link.replace('https://web.fujimura.com/', '');
      const pathParts = urlPath.split('/').filter(part => part);
      const pagePath = pathParts.join('/');
      return pagePath === requestedSlug;
    });
  }

  if (!page) {
    notFound();
  }

  const cleanContent = parseWordPressContent(page.content);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <div className="text-sm text-gray-600 mt-2">
            <time dateTime={page.date}>{formatDate(page.date)}</time>
            <span className="mx-2">•</span>
            <span>by {page.author}</span>
          </div>
        </header>
        
        <article 
          className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      </main>
    </div>
  );
}