'use client';

import { useSearchParams } from 'next/navigation';

export function BackButton() {
  const searchParams = useSearchParams();
  
  const from = searchParams.get('from');
  const page = searchParams.get('page');
  const backUrl = from === 'home' && page ? `/?page=${page}` : '/';
  
  return (
    <div className="mb-6">
      <a 
        href={backUrl}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        ← ホームに戻る
      </a>
    </div>
  );
}