import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold hover:text-gray-300">
              Fujimura Seminar
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/description" 
                className="hover:text-gray-300 transition-colors"
              >
                このサイトについて
              </Link>
              <Link 
                href="/03-ゼミ紹介" 
                className="hover:text-gray-300 transition-colors"
              >
                ゼミ紹介
              </Link>
              <Link 
                href="/recursive_tree" 
                className="hover:text-gray-300 transition-colors"
              >
                作品
              </Link>
              <Link 
                href="/04-教員紹介" 
                className="hover:text-gray-300 transition-colors"
              >
                教員紹介
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <a 
              href="http://www.sis.otsuma.ac.jp/i-design/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors text-sm"
            >
              大妻女子大学
            </a>
            <a 
              href="http://www.sis.otsuma.ac.jp/i-design/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors text-sm"
            >
              社会情報学部
            </a>
            <a 
              href="http://www.sis.otsuma.ac.jp/i-design/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors text-sm"
            >
              情報デザイン専攻
            </a>
          </div>
          
          <div className="md:hidden">
            <button className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}