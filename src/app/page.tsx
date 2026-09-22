import postsData from '@/data/posts.json';
import { PostCard, type PostSummary } from '@/components/PostCard';
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

function createExcerpt(post: Post): string {
  const source = post.excerpt.trim() || post.content;
  const plainText = source
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > 120
    ? `${plainText.substring(0, 120)}...`
    : plainText;
}

function toPostSummary(post: Post): PostSummary {
  return {
    id: post.id,
    title: post.title,
    excerpt: createExcerpt(post),
    date: post.date,
    categories: post.categories,
    featuredImageUrl: post.featuredImageUrl,
  };
}

const postSummaries = posts.map(toPostSummary);

export default function Home() {
  const initialPosts = postSummaries.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(postSummaries.length / POSTS_PER_PAGE);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div id="posts-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {initialPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {totalPages > 1 && (
          <SimpleLoadMore 
            allPosts={postSummaries}
            postsPerPage={POSTS_PER_PAGE}
          />
        )}
      </main>
    </div>
  );
}
