'use client';

import { useState, useEffect } from 'react';
import { PostCard, type PostSummary } from '@/components/PostCard';

interface SimpleLoadMoreProps {
  allPosts: PostSummary[];
  postsPerPage: number;
}

const STORAGE_KEYS = {
  currentPage: 'postListCurrentPage:v2',
  displayedPosts: 'displayedPostSummaries:v2',
};

export function SimpleLoadMore({ allPosts, postsPerPage }: SimpleLoadMoreProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedPosts, setDisplayedPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  useEffect(() => {
    // Check for saved state only after component mounts
    const savedPage = sessionStorage.getItem(STORAGE_KEYS.currentPage);
    const savedPosts = sessionStorage.getItem(STORAGE_KEYS.displayedPosts);
    
    if (savedPage && savedPosts && Number(savedPage) > 1) {
      const page = Math.min(Number(savedPage), totalPages);
      setCurrentPage(page);
      const saved = JSON.parse(savedPosts);
      // Skip the first 12 posts as they're already rendered server-side
      setDisplayedPosts(saved.slice(postsPerPage));
    }
  }, []);

  const loadPage = async (page: number) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagesPosts = allPosts.slice(startIndex, endIndex);
    
    if (page === 2) {
      // First additional load - just add the second page
      setDisplayedPosts(pagesPosts);
    } else {
      // Subsequent loads - add to existing
      setDisplayedPosts(prev => [...prev, ...pagesPosts]);
    }
    
    setCurrentPage(page);
    
    // Save complete state including initial posts
    const allDisplayed = [...allPosts.slice(0, postsPerPage), ...displayedPosts, ...pagesPosts];
    sessionStorage.setItem(STORAGE_KEYS.currentPage, page.toString());
    sessionStorage.setItem(STORAGE_KEYS.displayedPosts, JSON.stringify(allDisplayed));
    
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadPage(currentPage + 1);
    }
  };

  return (
    <>
      {displayedPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

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
            className="bg-white text-blue-700 px-6 py-2.5 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 border border-blue-200 font-medium shadow-sm"
          >
            さらに読み込む ({Math.min(postsPerPage, allPosts.length - currentPage * postsPerPage)}件)
          </button>
        </div>
      )}

      {currentPage >= totalPages && (
        <div className="text-center mt-8 text-sm text-gray-400">
          全ての記事を表示しました ({allPosts.length}件)
        </div>
      )}
    </>
  );
}
