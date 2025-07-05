import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              Fujimura Seminar
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Link 
              href="/description" 
              className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
            >
              About
            </Link>
            <span className="text-gray-400">•</span>
            <a 
              href="https://www.otsuma.ac.jp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
            >
              Otsuma University
            </a>
            <span className="text-gray-400">•</span>
            <a 
              href="https://www.sis.otsuma.ac.jp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
            >
              Social Information Studies
            </a>
            <span className="text-gray-400">•</span>
            <a 
              href="http://www.sis.otsuma.ac.jp/i-design/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
            >
              Information Design
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}