'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import postsData from '@/data/posts.json';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  useEffect(() => {
    loadPage(1);
  }, []);

  const loadPage = async (page: number) => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const pagesPosts = posts.slice(startIndex, endIndex);
    
    if (page === 1) {
      setDisplayedPosts(pagesPosts);
    } else {
      setDisplayedPosts(prev => [...prev, ...pagesPosts]);
    }
    
    setCurrentPage(page);
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              {/* Category Label */}
              {post.categories.length > 0 && (
                <div className="px-4 pt-4 pb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {post.categories[0]}
                  </span>
                </div>
              )}
              
              {/* Image */}
              {post.featuredImageUrl && (
                <div className="aspect-[4/3] overflow-hidden relative mx-4 mb-4 rounded-lg">
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              
              {/* Content */}
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

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">読み込み中...</span>
          </div>
        )}

        {currentPage < totalPages && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 border border-gray-200 font-medium"
            >
              さらに読み込む ({Math.min(POSTS_PER_PAGE, posts.length - currentPage * POSTS_PER_PAGE)}件)
            </button>
          </div>
        )}

        {currentPage >= totalPages && (
          <div className="text-center mt-8 text-gray-500">
            全ての記事を表示しました ({posts.length}件)
          </div>
        )}
      </main>
    </div>
  );
}
