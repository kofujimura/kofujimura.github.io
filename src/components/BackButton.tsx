'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
  
  return (
    <div className="mb-6">
      <button 
        onClick={handleBack}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        ← 戻る
      </button>
    </div>
  );
}