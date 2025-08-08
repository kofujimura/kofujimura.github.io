import { notFound } from 'next/navigation';
import postsData from '@/data/posts.json';
import { processWordPressImages, processYouTubeLinks } from '@/utils/imageUtils';
import { BackButton } from '@/components/BackButton';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type?: string;
  author: string;
  categories: string[];
  tags: string[];
  link?: string;
  featuredImageId?: number;
  featuredImageUrl?: string;
}

const posts: Post[] = postsData;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function parseWordPressContent(content: string): string {
  let processed = content
    .replace(/<!-- wp:paragraph -->/g, '')
    .replace(/<!-- \/wp:paragraph -->/g, '')
    .replace(/<!-- wp:list -->/g, '')
    .replace(/<!-- \/wp:list -->/g, '')
    .replace(/<!-- wp:list-item -->/g, '')
    .replace(/<!-- \/wp:list-item -->/g, '')
    .replace(/<!-- wp:embed[^>]*>/g, '')
    .replace(/<!-- \/wp:embed -->/g, '')
    .replace(/<!-- wp:image[^>]*>/g, '')
    .replace(/<!-- \/wp:image -->/g, '')
    .replace(/<!-- wp:figure[^>]*>/g, '')
    .replace(/<!-- \/wp:figure -->/g, '')
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/g, (match) => {
      // Check for embedded content like YouTube
      const urlMatch = match.match(/https:\/\/[^\s<]+/);
      if (urlMatch && !match.includes('<img')) {
        return `<div class="embed-container"><a href="${urlMatch[0]}" target="_blank" rel="noopener noreferrer">${urlMatch[0]}</a></div>`;
      }
      // For image figures, keep the image but clean up
      return match.replace(/<figure[^>]*>|<\/figure>/g, '');
    });

  // Process images
  processed = processWordPressImages(processed);
  
  // Process YouTube links
  processed = processYouTubeLinks(processed);
  
  return processed;
}

export function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    notFound();
  }

  const cleanContent = parseWordPressContent(post.content);

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>by {post.author}</span>
          {post.categories.length > 0 && (
            <div className="flex gap-2">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
      </header>
      
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      </article>
    </div>
  );
}