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
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-4xl mx-auto px-4 py-10">
        <BackButton />
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-5 py-8 md:px-12 md:py-12">
          <header className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-gray-900 mb-5">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <time dateTime={post.date} className="tabular-nums">{formatDate(post.date)}</time>
              <span>by {post.author}</span>
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-400">
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </article>
    </div>
  );
}