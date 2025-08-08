import postsData from '@/data/posts.json';
import Link from 'next/link';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SimpleLoadMore } from '@/components/SimpleLoadMore';

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
const POSTS_PER_PAGE = 12;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function extractPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()
    .substring(0, 120) + '...';
}

export default function Home() {
  const initialPosts = posts.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div id="posts-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {initialPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              {post.categories.length > 0 && (
                <div className="px-4 pt-4 pb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {post.categories[0]}
                  </span>
                </div>
              )}
              
              {post.featuredImageUrl && (
                <div className="aspect-[4/3] overflow-hidden relative mx-4 mb-4 rounded-lg">
                  <OptimizedImage
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              
              <div className="px-4 pb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  <Link 
                    href={`/blog/archives/${post.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {extractPlainText(post.content)}
                </p>
                
                <div className="flex items-center text-xs text-gray-500">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {totalPages > 1 && (
          <SimpleLoadMore 
            allPosts={posts} 
            postsPerPage={POSTS_PER_PAGE}
          />
        )}
      </main>
    </div>
  );
}
