import Link from 'next/link';
import { OptimizedImage } from '@/components/OptimizedImage';

export interface PostSummary {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  categories: string[];
  featuredImageUrl?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article
      className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-300"
    >
      {post.categories.length > 0 && (
        <div className="px-5 pt-5 pb-2">
          <span className="text-[11px] text-pink-600 uppercase tracking-widest font-semibold">
            {post.categories[0]}
          </span>
        </div>
      )}

      {post.featuredImageUrl && (
        <div className="aspect-[4/3] overflow-hidden relative mx-5 mb-4 rounded-xl">
          <OptimizedImage
            src={post.featuredImageUrl}
            alt={post.title}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="px-5 pb-5">
        <h2 className="text-[17px] font-bold text-gray-900 mb-2 leading-snug">
          <Link
            href={`/blog/archives/${post.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center text-xs text-gray-400 tabular-nums">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </div>
    </article>
  );
}
